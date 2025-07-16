import pytest
import os
import sys
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from utilities.driver_factory import DriverFactory
from utilities.screenshot_util import ScreenshotUtil
from test_data.test_config import TestConfig

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

@pytest.fixture(scope="session")
def test_config():
    """Fixture to provide test configuration."""
    return TestConfig()

@pytest.fixture(scope="session")
def driver_factory():
    """Fixture to provide driver factory."""
    return DriverFactory()

@pytest.fixture(scope="function")
def driver(request, test_config):
    """Fixture to provide WebDriver instance."""
    browser = getattr(request.config.option, 'browser', test_config.BROWSER)
    headless = getattr(request.config.option, 'headless', test_config.HEADLESS)
    
    driver_instance = DriverFactory.get_driver(browser, headless)
    driver_instance.maximize_window()
    driver_instance.implicitly_wait(test_config.IMPLICIT_WAIT)
    
    yield driver_instance
    
    # Cleanup
    driver_instance.quit()

@pytest.fixture(scope="function")
def screenshot_util(driver):
    """Fixture to provide screenshot utility."""
    return ScreenshotUtil(driver)

@pytest.fixture(scope="function")
def base_url(test_config):
    """Fixture to provide base URL."""
    return test_config.BASE_URL

@pytest.fixture(scope="function")
def api_base_url(test_config):
    """Fixture to provide API base URL."""
    return test_config.API_BASE_URL

@pytest.fixture(scope="function")
def admin_user(test_config):
    """Fixture to provide admin user credentials."""
    return test_config.ADMIN_USER

@pytest.fixture(scope="function")
def company_user(test_config):
    """Fixture to provide company user credentials."""
    return test_config.COMPANY_USER

@pytest.fixture(scope="function")
def consumer_user(test_config):
    """Fixture to provide consumer user credentials."""
    return test_config.CONSUMER_USER

@pytest.fixture(scope="function")
def login_admin(driver, admin_user, base_url):
    """Fixture to auto-login as admin user."""
    from page_objects.login_page import LoginPage
    
    login_page = LoginPage(driver)
    login_page.navigate_to(f"{base_url}/login")
    login_page.login(admin_user["email"], admin_user["password"])
    
    yield
    
    # Logout after test
    try:
        login_page.logout()
    except:
        pass  # Ignore logout errors

@pytest.fixture(scope="function")
def login_company(driver, company_user, base_url):
    """Fixture to auto-login as company user."""
    from page_objects.login_page import LoginPage
    
    login_page = LoginPage(driver)
    login_page.navigate_to(f"{base_url}/login")
    login_page.login(company_user["email"], company_user["password"])
    
    yield
    
    # Logout after test
    try:
        login_page.logout()
    except:
        pass  # Ignore logout errors

@pytest.fixture(scope="function")
def login_consumer(driver, consumer_user, base_url):
    """Fixture to auto-login as consumer user."""
    from page_objects.login_page import LoginPage
    
    login_page = LoginPage(driver)
    login_page.navigate_to(f"{base_url}/login")
    login_page.login(consumer_user["email"], consumer_user["password"])
    
    yield
    
    # Logout after test
    try:
        login_page.logout()
    except:
        pass  # Ignore logout errors

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Hook to capture screenshots on test failure."""
    outcome = yield
    report = outcome.get_result()
    
    if report.when == "call" and report.failed:
        # Get the driver from the test
        if hasattr(item, 'funcargs') and 'driver' in item.funcargs:
            driver = item.funcargs['driver']
            screenshot_util = ScreenshotUtil(driver)
            screenshot_path = screenshot_util.capture_failure_screenshot(item.name)
            
            # Add screenshot to HTML report
            if screenshot_path:
                extra = getattr(report, 'extra', [])
                extra.append(pytest.Html(f'<div><img src="{screenshot_path}" alt="screenshot" style="width:300px;height:200px;" onclick="window.open(this.src)" align="right"/></div>'))
                report.extra = extra

def pytest_addoption(parser):
    """Add command line options."""
    parser.addoption(
        "--browser",
        action="store",
        default="chrome",
        help="Browser to run tests on (chrome, firefox, edge)"
    )
    parser.addoption(
        "--headless",
        action="store_true",
        default=False,
        help="Run tests in headless mode"
    )
    parser.addoption(
        "--base-url",
        action="store",
        default="http://localhost:3000",
        help="Base URL for the application"
    )
    parser.addoption(
        "--env",
        action="store",
        default="local",
        help="Environment to run tests against (local, dev, staging, prod)"
    )

def pytest_configure(config):
    """Configure pytest."""
    # Create reports directory if it doesn't exist
    reports_dir = os.path.join(os.path.dirname(__file__), "reports")
    if not os.path.exists(reports_dir):
        os.makedirs(reports_dir)
    
    # Set up custom markers
    config.addinivalue_line(
        "markers",
        "smoke: Smoke tests for critical functionality"
    )
    config.addinivalue_line(
        "markers",
        "regression: Regression tests"
    )

def pytest_collection_modifyitems(config, items):
    """Modify test collection."""
    # Add smoke marker to all tests in smoke test files
    for item in items:
        if "smoke" in item.fspath.basename:
            item.add_marker(pytest.mark.smoke)

@pytest.fixture(scope="session", autouse=True)
def test_session_setup():
    """Session-level setup and teardown."""
    print(f"\n{'='*50}")
    print(f"Starting IoT Platform Smoke Test Session")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*50}")
    
    yield
    
    print(f"\n{'='*50}")
    print(f"Ending IoT Platform Smoke Test Session")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*50}")

@pytest.fixture(autouse=True)
def test_setup_teardown(request):
    """Function-level setup and teardown."""
    test_name = request.node.name
    print(f"\n--- Starting test: {test_name} ---")
    
    yield
    
    print(f"--- Finished test: {test_name} ---")

# Environment-specific configurations
@pytest.fixture(scope="session")
def env_config(pytestconfig):
    """Environment-specific configuration."""
    env = pytestconfig.getoption("env")
    
    configs = {
        "local": {
            "base_url": "http://localhost:3000",
            "api_url": "http://localhost:3000/api",
            "timeout": 10
        },
        "dev": {
            "base_url": "https://dev.iotplatform.com",
            "api_url": "https://dev.iotplatform.com/api",
            "timeout": 15
        },
        "staging": {
            "base_url": "https://staging.iotplatform.com",
            "api_url": "https://staging.iotplatform.com/api",
            "timeout": 20
        },
        "prod": {
            "base_url": "https://iotplatform.com",
            "api_url": "https://iotplatform.com/api",
            "timeout": 30
        }
    }
    
    return configs.get(env, configs["local"])
