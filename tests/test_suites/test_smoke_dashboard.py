"""
Smoke tests for dashboard functionality.
"""

import pytest
from selenium.webdriver.common.by import By
from page_objects.login_page import LoginPage
from page_objects.base_page import BasePage
from test_data.test_users import TestUsers
from test_data.test_config import TestConfig
from utilities.helpers import ReportHelpers
import logging

logger = logging.getLogger(__name__)

class DashboardPage(BasePage):
    """Dashboard page object for navigation and basic functionality."""
    
    def __init__(self, driver):
        super().__init__(driver)
        self.dashboard_url = f"{self.base_url}/dashboard"
    
    # Navigation sidebar locators
    SIDEBAR = (By.CLASS_NAME, "sidebar")
    SIDEBAR_MENU = (By.CLASS_NAME, "sidebar-menu")
    DASHBOARD_LINK = (By.XPATH, "//a[contains(text(), 'Dashboard')]")
    DEVICES_LINK = (By.XPATH, "//a[contains(text(), 'Devices')]")
    ANALYTICS_LINK = (By.XPATH, "//a[contains(text(), 'Analytics')]")
    USERS_LINK = (By.XPATH, "//a[contains(text(), 'Users')]")
    SETTINGS_LINK = (By.XPATH, "//a[contains(text(), 'Settings')]")
    SECURITY_LINK = (By.XPATH, "//a[contains(text(), 'Security')]")
    
    # Main content locators
    MAIN_CONTENT = (By.TAG_NAME, "main")
    WELCOME_HEADER = (By.XPATH, "//h1[contains(text(), 'Welcome')]")
    DASHBOARD_STATS = (By.CLASS_NAME, "dashboard-stats")
    STAT_CARD = (By.CLASS_NAME, "stat-card")
    
    # Demo credentials section
    DEMO_CREDENTIALS = (By.XPATH, "//h2[contains(text(), 'Demo Credentials')]")
    ADMIN_CARD = (By.XPATH, "//h3[contains(text(), 'Admin Account')]")
    COMPANY_CARD = (By.XPATH, "//h3[contains(text(), 'Company Account')]")
    CONSUMER_CARD = (By.XPATH, "//h3[contains(text(), 'Consumer Account')]")
    
    # API status section
    API_STATUS = (By.XPATH, "//h2[contains(text(), 'API Status') or contains(text(), 'Dummy API Status')]")
    API_ENDPOINT = (By.XPATH, "//span[contains(text(), 'Login') or contains(text(), 'Register')]")
    
    # Authentication demo section
    AUTH_STATUS = (By.XPATH, "//dt[contains(text(), 'Authentication Status')]")
    TRY_LOGIN_BUTTON = (By.XPATH, "//a[contains(text(), 'Try Login')]")
    REGISTER_BUTTON = (By.XPATH, "//a[contains(text(), 'Register')]")
    
    def navigate_to_dashboard(self):
        """Navigate to dashboard page."""
        return self.navigate_to(self.dashboard_url)
    
    def is_sidebar_visible(self):
        """Check if sidebar is visible."""
        return self.is_element_visible(self.SIDEBAR)
    
    def is_main_content_visible(self):
        """Check if main content is visible."""
        return self.is_element_visible(self.MAIN_CONTENT)
    
    def get_welcome_message(self):
        """Get welcome message text."""
        return self.get_element_text(self.WELCOME_HEADER)
    
    def get_navigation_links(self):
        """Get all navigation links."""
        nav_links = [
            (self.DASHBOARD_LINK, "Dashboard"),
            (self.DEVICES_LINK, "Devices"),
            (self.ANALYTICS_LINK, "Analytics"),
            (self.USERS_LINK, "Users"),
            (self.SETTINGS_LINK, "Settings"),
            (self.SECURITY_LINK, "Security")
        ]
        
        available_links = []
        for locator, name in nav_links:
            if self.is_element_present(locator):
                available_links.append(name)
        
        return available_links
    
    def click_navigation_link(self, link_name):
        """Click a navigation link."""
        link_locators = {
            "Dashboard": self.DASHBOARD_LINK,
            "Devices": self.DEVICES_LINK,
            "Analytics": self.ANALYTICS_LINK,
            "Users": self.USERS_LINK,
            "Settings": self.SETTINGS_LINK,
            "Security": self.SECURITY_LINK
        }
        
        if link_name in link_locators:
            return self.click_element(link_locators[link_name])
        return False
    
    def get_stat_cards_count(self):
        """Get number of stat cards."""
        try:
            stat_cards = self.driver.find_elements(*self.STAT_CARD)
            return len(stat_cards)
        except:
            return 0
    
    def verify_demo_credentials_section(self):
        """Verify demo credentials section is present."""
        return self.is_element_present(self.DEMO_CREDENTIALS)
    
    def verify_api_status_section(self):
        """Verify API status section is present."""
        return self.is_element_present(self.API_STATUS)
    
    def get_api_endpoints_count(self):
        """Get number of API endpoints displayed."""
        try:
            endpoints = self.driver.find_elements(*self.API_ENDPOINT)
            return len(endpoints)
        except:
            return 0

class TestDashboardSmoke:
    """Smoke tests for dashboard functionality."""
    
    def setup_method(self):
        """Setup method for each test."""
        self.test_data = {}
    
    def teardown_method(self):
        """Teardown method for each test."""
        pass
    
    @pytest.mark.smoke
    @pytest.mark.dashboard
    @pytest.mark.critical
    def test_home_page_loads(self, driver, base_url):
        """Test that home page loads correctly."""
        dashboard_page = DashboardPage(driver)
        
        # Navigate to home page
        assert dashboard_page.navigate_to("/"), "Failed to navigate to home page"
        
        # Verify page title
        page_title = dashboard_page.get_page_title()
        assert "IoT Platform" in page_title, f"Unexpected page title: {page_title}"
        
        # Verify main content is visible
        assert dashboard_page.is_main_content_visible(), "Main content is not visible"
        
        # Verify welcome message
        welcome_message = dashboard_page.get_welcome_message()
        assert welcome_message is not None, "Welcome message not found"
        assert "Welcome to IoT Platform" in welcome_message, f"Unexpected welcome message: {welcome_message}"
        
        # Take screenshot
        dashboard_page.take_screenshot("home_page_loaded")
    
    @pytest.mark.smoke
    @pytest.mark.dashboard
    @pytest.mark.critical
    def test_sidebar_navigation_present(self, driver, base_url):
        """Test that sidebar navigation is present and functional."""
        dashboard_page = DashboardPage(driver)
        
        # Navigate to home page
        assert dashboard_page.navigate_to("/"), "Failed to navigate to home page"
        
        # Verify sidebar is visible
        assert dashboard_page.is_sidebar_visible(), "Sidebar is not visible"
        
        # Verify navigation links are present
        nav_links = dashboard_page.get_navigation_links()
        expected_links = ["Dashboard", "Devices", "Analytics", "Users", "Settings", "Security"]
        
        for expected_link in expected_links:
            assert expected_link in nav_links, f"Navigation link '{expected_link}' not found"
        
        # Take screenshot
        dashboard_page.take_screenshot("sidebar_navigation")
    
    @pytest.mark.smoke
    @pytest.mark.dashboard
    @pytest.mark.critical
    def test_navigation_links_functionality(self, driver, base_url):
        """Test that navigation links work correctly."""
        dashboard_page = DashboardPage(driver)
        
        # Navigate to home page
        assert dashboard_page.navigate_to("/"), "Failed to navigate to home page"
        
        # Test each navigation link
        navigation_links = ["Devices", "Analytics", "Users", "Settings", "Security"]
        
        for link_name in navigation_links:
            # Click the link
            assert dashboard_page.click_navigation_link(link_name), f"Failed to click {link_name} link"
            
            # Wait for page to load
            dashboard_page.wait_for_page_load()
            
            # Verify redirect to login page (since these are protected routes)
            current_url = dashboard_page.get_current_url()
            assert "/login" in current_url, f"Expected redirect to login page after clicking {link_name}, got: {current_url}"
            
            # Go back to home page
            dashboard_page.navigate_to("/")
            dashboard_page.wait_for_page_load()
        
        # Take screenshot
        dashboard_page.take_screenshot("navigation_links_functionality")
    
    @pytest.mark.smoke
    @pytest.mark.dashboard
    @pytest.mark.critical
    def test_demo_credentials_section(self, driver, base_url):
        """Test that demo credentials section is present and displays correctly."""
        dashboard_page = DashboardPage(driver)
        
        # Navigate to home page
        assert dashboard_page.navigate_to("/"), "Failed to navigate to home page"
        
        # Verify demo credentials section is present
        assert dashboard_page.verify_demo_credentials_section(), "Demo credentials section not found"
        
        # Verify all user type cards are present
        assert dashboard_page.is_element_present(dashboard_page.ADMIN_CARD), "Admin card not found"
        assert dashboard_page.is_element_present(dashboard_page.COMPANY_CARD), "Company card not found"
        assert dashboard_page.is_element_present(dashboard_page.CONSUMER_CARD), "Consumer card not found"
        
        # Take screenshot
        dashboard_page.take_screenshot("demo_credentials_section")
    
    @pytest.mark.smoke
    @pytest.mark.dashboard
    @pytest.mark.critical
    def test_api_status_section(self, driver, base_url):
        """Test that API status section is present and displays correctly."""
        dashboard_page = DashboardPage(driver)
        
        # Navigate to home page
        assert dashboard_page.navigate_to("/"), "Failed to navigate to home page"
        
        # Verify API status section is present
        assert dashboard_page.verify_api_status_section(), "API status section not found"
        
        # Verify API endpoints are displayed
        endpoints_count = dashboard_page.get_api_endpoints_count()
        assert endpoints_count > 0, "No API endpoints displayed"
        
        # Take screenshot
        dashboard_page.take_screenshot("api_status_section")
    
    @pytest.mark.smoke
    @pytest.mark.dashboard
    @pytest.mark.critical
    def test_authentication_demo_section(self, driver, base_url):
        """Test that authentication demo section is present."""
        dashboard_page = DashboardPage(driver)
        
        # Navigate to home page
        assert dashboard_page.navigate_to("/"), "Failed to navigate to home page"
        
        # Verify authentication status is present
        assert dashboard_page.is_element_present(dashboard_page.AUTH_STATUS), "Authentication status not found"
        
        # Verify Try Login button is present
        assert dashboard_page.is_element_present(dashboard_page.TRY_LOGIN_BUTTON), "Try Login button not found"
        
        # Verify Register button is present
        assert dashboard_page.is_element_present(dashboard_page.REGISTER_BUTTON), "Register button not found"
        
        # Take screenshot
        dashboard_page.take_screenshot("authentication_demo_section")
    
    @pytest.mark.smoke
    @pytest.mark.dashboard
    @pytest.mark.high
    def test_try_login_button_functionality(self, driver, base_url):
        """Test that Try Login button redirects to login page."""
        dashboard_page = DashboardPage(driver)
        
        # Navigate to home page
        assert dashboard_page.navigate_to("/"), "Failed to navigate to home page"
        
        # Click Try Login button
        assert dashboard_page.click_element(dashboard_page.TRY_LOGIN_BUTTON), "Failed to click Try Login button"
        
        # Verify redirect to login page
        dashboard_page.wait_for_page_load()
        current_url = dashboard_page.get_current_url()
        assert "/login" in current_url, f"Expected redirect to login page, got: {current_url}"
        
        # Verify login page elements are present
        login_page = LoginPage(driver)
        assert login_page.verify_login_page_elements(), "Login page elements not found"
        
        # Take screenshot
        dashboard_page.take_screenshot("try_login_button_functionality")
    
    @pytest.mark.smoke
    @pytest.mark.dashboard
    @pytest.mark.high
    def test_register_button_functionality(self, driver, base_url):
        """Test that Register button redirects to register page."""
        dashboard_page = DashboardPage(driver)
        
        # Navigate to home page
        assert dashboard_page.navigate_to("/"), "Failed to navigate to home page"
        
        # Click Register button
        assert dashboard_page.click_element(dashboard_page.REGISTER_BUTTON), "Failed to click Register button"
        
        # Verify redirect to register page
        dashboard_page.wait_for_page_load()
        current_url = dashboard_page.get_current_url()
        assert "/register" in current_url, f"Expected redirect to register page, got: {current_url}"
        
        # Take screenshot
        dashboard_page.take_screenshot("register_button_functionality")
    
    @pytest.mark.smoke
    @pytest.mark.dashboard
    @pytest.mark.high
    def test_dashboard_after_admin_login(self, driver, base_url, admin_user):
        """Test dashboard access after admin login."""
        login_page = LoginPage(driver)
        dashboard_page = DashboardPage(driver)
        
        # Login as admin
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        assert login_page.quick_login(admin_user), "Admin login failed"
        assert login_page.is_login_successful(), "Admin login verification failed"
        
        # Verify dashboard/admin page is accessible
        current_url = dashboard_page.get_current_url()
        assert any(path in current_url for path in ["/dashboard", "/admin"]), \
            f"Admin not redirected to dashboard/admin: {current_url}"
        
        # Take screenshot
        dashboard_page.take_screenshot("dashboard_after_admin_login")
    
    @pytest.mark.smoke
    @pytest.mark.dashboard
    @pytest.mark.high
    def test_dashboard_after_company_login(self, driver, base_url, company_user):
        """Test dashboard access after company login."""
        login_page = LoginPage(driver)
        dashboard_page = DashboardPage(driver)
        
        # Login as company user
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        assert login_page.quick_login(company_user), "Company login failed"
        assert login_page.is_login_successful(), "Company login verification failed"
        
        # Verify dashboard/company page is accessible
        current_url = dashboard_page.get_current_url()
        assert any(path in current_url for path in ["/dashboard", "/company"]), \
            f"Company user not redirected to dashboard/company: {current_url}"
        
        # Take screenshot
        dashboard_page.take_screenshot("dashboard_after_company_login")
    
    @pytest.mark.smoke
    @pytest.mark.dashboard
    @pytest.mark.high
    def test_dashboard_after_consumer_login(self, driver, base_url, consumer_user):
        """Test dashboard access after consumer login."""
        login_page = LoginPage(driver)
        dashboard_page = DashboardPage(driver)
        
        # Login as consumer user
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        assert login_page.quick_login(consumer_user), "Consumer login failed"
        assert login_page.is_login_successful(), "Consumer login verification failed"
        
        # Verify dashboard/consumer page is accessible
        current_url = dashboard_page.get_current_url()
        assert any(path in current_url for path in ["/dashboard", "/consumer"]), \
            f"Consumer user not redirected to dashboard/consumer: {current_url}"
        
        # Take screenshot
        dashboard_page.take_screenshot("dashboard_after_consumer_login")
    
    @pytest.mark.smoke
    @pytest.mark.dashboard
    @pytest.mark.medium
    def test_responsive_design_desktop(self, driver, base_url):
        """Test responsive design on desktop viewport."""
        dashboard_page = DashboardPage(driver)
        
        # Set desktop viewport
        driver.set_window_size(1920, 1080)
        
        # Navigate to home page
        assert dashboard_page.navigate_to("/"), "Failed to navigate to home page"
        
        # Verify sidebar is visible on desktop
        assert dashboard_page.is_sidebar_visible(), "Sidebar should be visible on desktop"
        
        # Verify main content is visible
        assert dashboard_page.is_main_content_visible(), "Main content should be visible on desktop"
        
        # Take screenshot
        dashboard_page.take_screenshot("responsive_design_desktop")
    
    @pytest.mark.smoke
    @pytest.mark.dashboard
    @pytest.mark.medium
    def test_responsive_design_tablet(self, driver, base_url):
        """Test responsive design on tablet viewport."""
        dashboard_page = DashboardPage(driver)
        
        # Set tablet viewport
        driver.set_window_size(768, 1024)
        
        # Navigate to home page
        assert dashboard_page.navigate_to("/"), "Failed to navigate to home page"
        
        # Verify page loads correctly on tablet
        assert dashboard_page.is_main_content_visible(), "Main content should be visible on tablet"
        
        # Take screenshot
        dashboard_page.take_screenshot("responsive_design_tablet")
    
    @pytest.mark.smoke
    @pytest.mark.dashboard
    @pytest.mark.medium
    def test_responsive_design_mobile(self, driver, base_url):
        """Test responsive design on mobile viewport."""
        dashboard_page = DashboardPage(driver)
        
        # Set mobile viewport
        driver.set_window_size(375, 667)
        
        # Navigate to home page
        assert dashboard_page.navigate_to("/"), "Failed to navigate to home page"
        
        # Verify page loads correctly on mobile
        assert dashboard_page.is_main_content_visible(), "Main content should be visible on mobile"
        
        # Take screenshot
        dashboard_page.take_screenshot("responsive_design_mobile")
    
    @pytest.mark.smoke
    @pytest.mark.dashboard
    @pytest.mark.medium
    def test_page_load_performance(self, driver, base_url):
        """Test page load performance."""
        dashboard_page = DashboardPage(driver)
        
        import time
        start_time = time.time()
        
        # Navigate to home page
        assert dashboard_page.navigate_to("/"), "Failed to navigate to home page"
        
        # Wait for page to be fully loaded
        dashboard_page.wait_for_page_load()
        
        end_time = time.time()
        load_time = end_time - start_time
        
        # Verify page loads within acceptable time (10 seconds)
        assert load_time < 10, f"Page load time too slow: {load_time:.2f} seconds"
        
        ReportHelpers.log_test_step("Page load performance", "PASS", f"Load time: {load_time:.2f} seconds")
        
        # Take screenshot
        dashboard_page.take_screenshot("page_load_performance")
    
    @pytest.mark.smoke
    @pytest.mark.dashboard
    @pytest.mark.medium
    def test_no_console_errors_on_home_page(self, driver, base_url):
        """Test that home page has no console errors."""
        dashboard_page = DashboardPage(driver)
        
        # Navigate to home page
        assert dashboard_page.navigate_to("/"), "Failed to navigate to home page"
        
        # Check for console errors
        assert dashboard_page.assert_no_console_errors(), "Console errors found on home page"
        
        # Take screenshot
        dashboard_page.take_screenshot("no_console_errors_home_page")
    
    @pytest.mark.smoke
    @pytest.mark.dashboard
    @pytest.mark.low
    def test_page_accessibility_basics(self, driver, base_url):
        """Test basic accessibility features."""
        dashboard_page = DashboardPage(driver)
        
        # Navigate to home page
        assert dashboard_page.navigate_to("/"), "Failed to navigate to home page"
        
        # Check for basic accessibility elements
        # Verify page has a proper title
        page_title = dashboard_page.get_page_title()
        assert page_title and page_title.strip(), "Page should have a title"
        
        # Verify main content has proper structure
        assert dashboard_page.is_element_present((By.TAG_NAME, "main")), "Page should have main element"
        assert dashboard_page.is_element_present((By.TAG_NAME, "h1")), "Page should have h1 heading"
        
        # Take screenshot
        dashboard_page.take_screenshot("page_accessibility_basics")
    
    @pytest.mark.smoke
    @pytest.mark.dashboard
    @pytest.mark.medium
    def test_navigation_breadcrumbs(self, driver, base_url):
        """Test navigation breadcrumbs if present."""
        dashboard_page = DashboardPage(driver)
        
        # Navigate to home page
        assert dashboard_page.navigate_to("/"), "Failed to navigate to home page"
        
        # Check for breadcrumbs
        breadcrumb_selectors = [
            (By.CLASS_NAME, "breadcrumb"),
            (By.CLASS_NAME, "breadcrumbs"),
            (By.XPATH, "//nav[@aria-label='breadcrumb']")
        ]
        
        breadcrumbs_found = False
        for selector in breadcrumb_selectors:
            if dashboard_page.is_element_present(selector):
                breadcrumbs_found = True
                break
        
        if breadcrumbs_found:
            ReportHelpers.log_test_step("Navigation breadcrumbs", "PASS", "Breadcrumbs found")
        else:
            ReportHelpers.log_test_step("Navigation breadcrumbs", "INFO", "No breadcrumbs found")
        
        # Take screenshot
        dashboard_page.take_screenshot("navigation_breadcrumbs")
    
    @pytest.mark.smoke
    @pytest.mark.dashboard
    @pytest.mark.low
    def test_footer_information(self, driver, base_url):
        """Test footer information if present."""
        dashboard_page = DashboardPage(driver)
        
        # Navigate to home page
        assert dashboard_page.navigate_to("/"), "Failed to navigate to home page"
        
        # Check for footer
        footer_selectors = [
            (By.TAG_NAME, "footer"),
            (By.CLASS_NAME, "footer"),
            (By.ID, "footer")
        ]
        
        footer_found = False
        for selector in footer_selectors:
            if dashboard_page.is_element_present(selector):
                footer_found = True
                break
        
        if footer_found:
            ReportHelpers.log_test_step("Footer information", "PASS", "Footer found")
        else:
            ReportHelpers.log_test_step("Footer information", "INFO", "No footer found")
        
        # Take screenshot
        dashboard_page.take_screenshot("footer_information")
