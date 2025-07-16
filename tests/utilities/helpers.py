"""
Helper utilities for test automation.
"""

import time
import json
import random
import string
from datetime import datetime, timedelta
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementNotInteractableException
from test_data.test_config import TestConfig
import logging

logger = logging.getLogger(__name__)

class WebDriverHelpers:
    """Helper methods for WebDriver operations."""
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, TestConfig.EXPLICIT_WAIT)
        self.short_wait = WebDriverWait(driver, 5)
    
    def wait_for_element(self, locator, timeout=None):
        """Wait for an element to be present and return it."""
        timeout = timeout or TestConfig.EXPLICIT_WAIT
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(EC.presence_of_element_located(locator))
    
    def wait_for_clickable_element(self, locator, timeout=None):
        """Wait for an element to be clickable and return it."""
        timeout = timeout or TestConfig.EXPLICIT_WAIT
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(EC.element_to_be_clickable(locator))
    
    def wait_for_visible_element(self, locator, timeout=None):
        """Wait for an element to be visible and return it."""
        timeout = timeout or TestConfig.EXPLICIT_WAIT
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(EC.visibility_of_element_located(locator))
    
    def wait_for_elements(self, locator, timeout=None):
        """Wait for multiple elements to be present and return them."""
        timeout = timeout or TestConfig.EXPLICIT_WAIT
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(EC.presence_of_all_elements_located(locator))
    
    def wait_for_text_in_element(self, locator, text, timeout=None):
        """Wait for specific text to appear in an element."""
        timeout = timeout or TestConfig.EXPLICIT_WAIT
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(EC.text_to_be_present_in_element(locator, text))
    
    def wait_for_url_contains(self, url_part, timeout=None):
        """Wait for URL to contain specific text."""
        timeout = timeout or TestConfig.EXPLICIT_WAIT
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(EC.url_contains(url_part))
    
    def wait_for_page_load(self, timeout=None):
        """Wait for page to be fully loaded."""
        timeout = timeout or TestConfig.PAGE_LOAD_TIMEOUT
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(lambda driver: driver.execute_script("return document.readyState") == "complete")
    
    def safe_click(self, locator, timeout=None):
        """Safely click an element with retry logic."""
        max_attempts = 3
        for attempt in range(max_attempts):
            try:
                element = self.wait_for_clickable_element(locator, timeout)
                element.click()
                return True
            except (TimeoutException, ElementNotInteractableException) as e:
                if attempt == max_attempts - 1:
                    logger.error(f"Failed to click element after {max_attempts} attempts: {e}")
                    return False
                time.sleep(1)
        return False
    
    def safe_send_keys(self, locator, text, clear_first=True, timeout=None):
        """Safely send keys to an element with retry logic."""
        max_attempts = 3
        for attempt in range(max_attempts):
            try:
                element = self.wait_for_element(locator, timeout)
                if clear_first:
                    element.clear()
                element.send_keys(text)
                return True
            except (TimeoutException, ElementNotInteractableException) as e:
                if attempt == max_attempts - 1:
                    logger.error(f"Failed to send keys after {max_attempts} attempts: {e}")
                    return False
                time.sleep(1)
        return False
    
    def safe_get_text(self, locator, timeout=None):
        """Safely get text from an element."""
        try:
            element = self.wait_for_element(locator, timeout)
            return element.text
        except TimeoutException:
            logger.error(f"Failed to get text from element: {locator}")
            return None
    
    def safe_get_attribute(self, locator, attribute, timeout=None):
        """Safely get attribute from an element."""
        try:
            element = self.wait_for_element(locator, timeout)
            return element.get_attribute(attribute)
        except TimeoutException:
            logger.error(f"Failed to get attribute '{attribute}' from element: {locator}")
            return None
    
    def is_element_present(self, locator, timeout=5):
        """Check if an element is present without throwing exception."""
        try:
            WebDriverWait(self.driver, timeout).until(EC.presence_of_element_located(locator))
            return True
        except TimeoutException:
            return False
    
    def is_element_visible(self, locator, timeout=5):
        """Check if an element is visible without throwing exception."""
        try:
            WebDriverWait(self.driver, timeout).until(EC.visibility_of_element_located(locator))
            return True
        except TimeoutException:
            return False
    
    def is_element_clickable(self, locator, timeout=5):
        """Check if an element is clickable without throwing exception."""
        try:
            WebDriverWait(self.driver, timeout).until(EC.element_to_be_clickable(locator))
            return True
        except TimeoutException:
            return False
    
    def scroll_to_element(self, locator, timeout=None):
        """Scroll to an element."""
        try:
            element = self.wait_for_element(locator, timeout)
            self.driver.execute_script("arguments[0].scrollIntoView(true);", element)
            time.sleep(0.5)  # Wait for scroll to complete
            return True
        except TimeoutException:
            logger.error(f"Failed to scroll to element: {locator}")
            return False
    
    def scroll_to_top(self):
        """Scroll to the top of the page."""
        self.driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(0.5)
    
    def scroll_to_bottom(self):
        """Scroll to the bottom of the page."""
        self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(0.5)
    
    def hover_over_element(self, locator, timeout=None):
        """Hover over an element."""
        try:
            element = self.wait_for_element(locator, timeout)
            ActionChains(self.driver).move_to_element(element).perform()
            time.sleep(0.5)
            return True
        except TimeoutException:
            logger.error(f"Failed to hover over element: {locator}")
            return False
    
    def double_click_element(self, locator, timeout=None):
        """Double click an element."""
        try:
            element = self.wait_for_clickable_element(locator, timeout)
            ActionChains(self.driver).double_click(element).perform()
            return True
        except TimeoutException:
            logger.error(f"Failed to double click element: {locator}")
            return False
    
    def right_click_element(self, locator, timeout=None):
        """Right click an element."""
        try:
            element = self.wait_for_clickable_element(locator, timeout)
            ActionChains(self.driver).context_click(element).perform()
            return True
        except TimeoutException:
            logger.error(f"Failed to right click element: {locator}")
            return False
    
    def drag_and_drop(self, source_locator, target_locator, timeout=None):
        """Drag and drop from source to target."""
        try:
            source = self.wait_for_element(source_locator, timeout)
            target = self.wait_for_element(target_locator, timeout)
            ActionChains(self.driver).drag_and_drop(source, target).perform()
            return True
        except TimeoutException:
            logger.error(f"Failed to drag and drop from {source_locator} to {target_locator}")
            return False
    
    def switch_to_frame(self, frame_locator, timeout=None):
        """Switch to a frame."""
        try:
            frame = self.wait_for_element(frame_locator, timeout)
            self.driver.switch_to.frame(frame)
            return True
        except TimeoutException:
            logger.error(f"Failed to switch to frame: {frame_locator}")
            return False
    
    def switch_to_default_content(self):
        """Switch back to default content."""
        self.driver.switch_to.default_content()
    
    def switch_to_window(self, window_handle):
        """Switch to a specific window."""
        self.driver.switch_to.window(window_handle)
    
    def get_current_window_handle(self):
        """Get current window handle."""
        return self.driver.current_window_handle
    
    def get_all_window_handles(self):
        """Get all window handles."""
        return self.driver.window_handles
    
    def close_current_window(self):
        """Close current window."""
        self.driver.close()
    
    def refresh_page(self):
        """Refresh the current page."""
        self.driver.refresh()
        self.wait_for_page_load()
    
    def navigate_back(self):
        """Navigate back."""
        self.driver.back()
        self.wait_for_page_load()
    
    def navigate_forward(self):
        """Navigate forward."""
        self.driver.forward()
        self.wait_for_page_load()
    
    def get_current_url(self):
        """Get current URL."""
        return self.driver.current_url
    
    def get_page_title(self):
        """Get page title."""
        return self.driver.title
    
    def get_page_source(self):
        """Get page source."""
        return self.driver.page_source
    
    def execute_javascript(self, script, *args):
        """Execute JavaScript."""
        return self.driver.execute_script(script, *args)
    
    def set_window_size(self, width, height):
        """Set window size."""
        self.driver.set_window_size(width, height)
    
    def maximize_window(self):
        """Maximize window."""
        self.driver.maximize_window()
    
    def get_window_size(self):
        """Get window size."""
        return self.driver.get_window_size()

class TestDataHelpers:
    """Helper methods for test data generation and manipulation."""
    
    @staticmethod
    def generate_random_string(length=10):
        """Generate a random string."""
        return ''.join(random.choices(string.ascii_letters + string.digits, k=length))
    
    @staticmethod
    def generate_random_email():
        """Generate a random email address."""
        username = TestDataHelpers.generate_random_string(8)
        domain = TestDataHelpers.generate_random_string(5)
        return f"{username}@{domain}.com"
    
    @staticmethod
    def generate_random_phone():
        """Generate a random phone number."""
        return f"+1-555-{random.randint(100, 999)}-{random.randint(1000, 9999)}"
    
    @staticmethod
    def generate_future_date(days=30):
        """Generate a future date."""
        return (datetime.now() + timedelta(days=days)).strftime("%Y-%m-%d")
    
    @staticmethod
    def generate_past_date(days=30):
        """Generate a past date."""
        return (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    
    @staticmethod
    def generate_random_number(min_val=1, max_val=100):
        """Generate a random number."""
        return random.randint(min_val, max_val)
    
    @staticmethod
    def generate_test_user_data():
        """Generate test user data."""
        return {
            'first_name': TestDataHelpers.generate_random_string(8),
            'last_name': TestDataHelpers.generate_random_string(8),
            'email': TestDataHelpers.generate_random_email(),
            'phone': TestDataHelpers.generate_random_phone(),
            'password': 'TestPass123!',
            'confirm_password': 'TestPass123!'
        }

class ValidationHelpers:
    """Helper methods for validation."""
    
    @staticmethod
    def is_valid_email(email):
        """Check if email format is valid."""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def is_valid_phone(phone):
        """Check if phone number format is valid."""
        import re
        pattern = r'^\+?1?-?\d{3}-?\d{3}-?\d{4}$'
        return re.match(pattern, phone) is not None
    
    @staticmethod
    def is_valid_url(url):
        """Check if URL format is valid."""
        import re
        pattern = r'^https?://(?:[-\w.])+(?::\d+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$'
        return re.match(pattern, url) is not None
    
    @staticmethod
    def is_valid_date(date_string, format_string="%Y-%m-%d"):
        """Check if date string is valid."""
        try:
            datetime.strptime(date_string, format_string)
            return True
        except ValueError:
            return False

class WaitHelpers:
    """Helper methods for waiting."""
    
    @staticmethod
    def wait_for_condition(condition, timeout=30, poll_frequency=0.5):
        """Wait for a custom condition to be true."""
        end_time = time.time() + timeout
        while time.time() < end_time:
            if condition():
                return True
            time.sleep(poll_frequency)
        return False
    
    @staticmethod
    def wait_for_api_response(api_call, expected_status=200, timeout=30):
        """Wait for API response with expected status."""
        end_time = time.time() + timeout
        while time.time() < end_time:
            try:
                response = api_call()
                if response.status_code == expected_status:
                    return response
            except Exception:
                pass
            time.sleep(1)
        return None
    
    @staticmethod
    def exponential_backoff_wait(max_attempts=5, base_delay=1):
        """Implement exponential backoff waiting."""
        for attempt in range(max_attempts):
            if attempt > 0:
                delay = base_delay * (2 ** (attempt - 1))
                time.sleep(delay)
            yield attempt

class FileHelpers:
    """Helper methods for file operations."""
    
    @staticmethod
    def read_json_file(filepath):
        """Read JSON file."""
        try:
            with open(filepath, 'r') as file:
                return json.load(file)
        except Exception as e:
            logger.error(f"Failed to read JSON file {filepath}: {e}")
            return None
    
    @staticmethod
    def write_json_file(filepath, data):
        """Write JSON file."""
        try:
            with open(filepath, 'w') as file:
                json.dump(data, file, indent=2)
            return True
        except Exception as e:
            logger.error(f"Failed to write JSON file {filepath}: {e}")
            return False
    
    @staticmethod
    def ensure_directory_exists(directory):
        """Ensure directory exists."""
        import os
        if not os.path.exists(directory):
            os.makedirs(directory)
            return True
        return False

class BrowserHelpers:
    """Helper methods for browser operations."""
    
    @staticmethod
    def clear_browser_cache(driver):
        """Clear browser cache."""
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear();")
        driver.execute_script("window.sessionStorage.clear();")
    
    @staticmethod
    def get_browser_logs(driver):
        """Get browser console logs."""
        try:
            logs = driver.get_log('browser')
            return logs
        except Exception as e:
            logger.error(f"Failed to get browser logs: {e}")
            return []
    
    @staticmethod
    def get_network_logs(driver):
        """Get network logs."""
        try:
            logs = driver.get_log('performance')
            return logs
        except Exception as e:
            logger.error(f"Failed to get network logs: {e}")
            return []
    
    @staticmethod
    def set_browser_zoom(driver, zoom_level=1.0):
        """Set browser zoom level."""
        driver.execute_script(f"document.body.style.zoom='{zoom_level}'")

class ReportHelpers:
    """Helper methods for reporting."""
    
    @staticmethod
    def log_test_step(step_name, status="PASS", details=None):
        """Log a test step."""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_message = f"[{timestamp}] STEP: {step_name} - {status}"
        if details:
            log_message += f" - {details}"
        logger.info(log_message)
    
    @staticmethod
    def log_test_data(test_name, data):
        """Log test data."""
        logger.info(f"Test: {test_name} - Data: {json.dumps(data, indent=2)}")
    
    @staticmethod
    def create_test_report_entry(test_name, status, duration, error=None, screenshot=None):
        """Create a test report entry."""
        return {
            'test_name': test_name,
            'status': status,
            'duration': duration,
            'timestamp': datetime.now().isoformat(),
            'error': error,
            'screenshot': screenshot
        }
