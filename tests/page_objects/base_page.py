"""
Base page object class for common functionality.
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from utilities.helpers import WebDriverHelpers, ReportHelpers
from utilities.screenshot_util import ScreenshotUtil
from test_data.test_config import TestConfig
import logging

logger = logging.getLogger(__name__)

class BasePage:
    """Base page object class with common functionality."""
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, TestConfig.EXPLICIT_WAIT)
        self.short_wait = WebDriverWait(driver, 5)
        self.helpers = WebDriverHelpers(driver)
        self.screenshot_util = ScreenshotUtil(driver)
        self.base_url = TestConfig.BASE_URL
    
    # Common locators
    LOADING_SPINNER = (By.CLASS_NAME, "loading-spinner")
    ERROR_MESSAGE = (By.CLASS_NAME, "error-message")
    SUCCESS_MESSAGE = (By.CLASS_NAME, "success-message")
    ALERT_MESSAGE = (By.CLASS_NAME, "alert")
    MODAL_DIALOG = (By.CLASS_NAME, "modal")
    CLOSE_BUTTON = (By.XPATH, "//button[contains(@class, 'close') or contains(text(), 'Close')]")
    
    def navigate_to(self, url):
        """Navigate to a specific URL."""
        if not url.startswith('http'):
            url = f"{self.base_url}{url}"
        
        try:
            self.driver.get(url)
            self.wait_for_page_load()
            ReportHelpers.log_test_step(f"Navigate to {url}", "PASS")
            return True
        except Exception as e:
            logger.error(f"Failed to navigate to {url}: {e}")
            ReportHelpers.log_test_step(f"Navigate to {url}", "FAIL", str(e))
            return False
    
    def wait_for_page_load(self, timeout=None):
        """Wait for page to be fully loaded."""
        timeout = timeout or TestConfig.PAGE_LOAD_TIMEOUT
        try:
            WebDriverWait(self.driver, timeout).until(
                lambda driver: driver.execute_script("return document.readyState") == "complete"
            )
            return True
        except TimeoutException:
            logger.warning(f"Page load timeout after {timeout} seconds")
            return False
    
    def wait_for_element(self, locator, timeout=None):
        """Wait for an element to be present."""
        return self.helpers.wait_for_element(locator, timeout)
    
    def wait_for_clickable_element(self, locator, timeout=None):
        """Wait for an element to be clickable."""
        return self.helpers.wait_for_clickable_element(locator, timeout)
    
    def wait_for_visible_element(self, locator, timeout=None):
        """Wait for an element to be visible."""
        return self.helpers.wait_for_visible_element(locator, timeout)
    
    def is_element_present(self, locator, timeout=5):
        """Check if an element is present."""
        return self.helpers.is_element_present(locator, timeout)
    
    def is_element_visible(self, locator, timeout=5):
        """Check if an element is visible."""
        return self.helpers.is_element_visible(locator, timeout)
    
    def click_element(self, locator, timeout=None):
        """Click an element safely."""
        try:
            element = self.wait_for_clickable_element(locator, timeout)
            element.click()
            ReportHelpers.log_test_step(f"Click element {locator}", "PASS")
            return True
        except TimeoutException:
            logger.error(f"Element not clickable: {locator}")
            ReportHelpers.log_test_step(f"Click element {locator}", "FAIL", "Element not clickable")
            return False
    
    def send_keys_to_element(self, locator, text, clear_first=True, timeout=None):
        """Send keys to an element."""
        try:
            element = self.wait_for_element(locator, timeout)
            if clear_first:
                element.clear()
            element.send_keys(text)
            ReportHelpers.log_test_step(f"Send keys to {locator}", "PASS", f"Text: {text}")
            return True
        except TimeoutException:
            logger.error(f"Element not found: {locator}")
            ReportHelpers.log_test_step(f"Send keys to {locator}", "FAIL", "Element not found")
            return False
    
    def get_element_text(self, locator, timeout=None):
        """Get text from an element."""
        try:
            element = self.wait_for_element(locator, timeout)
            text = element.text
            ReportHelpers.log_test_step(f"Get text from {locator}", "PASS", f"Text: {text}")
            return text
        except TimeoutException:
            logger.error(f"Element not found: {locator}")
            ReportHelpers.log_test_step(f"Get text from {locator}", "FAIL", "Element not found")
            return None
    
    def get_element_attribute(self, locator, attribute, timeout=None):
        """Get attribute from an element."""
        try:
            element = self.wait_for_element(locator, timeout)
            value = element.get_attribute(attribute)
            ReportHelpers.log_test_step(f"Get {attribute} from {locator}", "PASS", f"Value: {value}")
            return value
        except TimeoutException:
            logger.error(f"Element not found: {locator}")
            ReportHelpers.log_test_step(f"Get {attribute} from {locator}", "FAIL", "Element not found")
            return None
    
    def wait_for_loading_complete(self, timeout=30):
        """Wait for loading spinner to disappear."""
        try:
            # Wait for spinner to appear first (optional)
            try:
                self.short_wait.until(EC.presence_of_element_located(self.LOADING_SPINNER))
            except TimeoutException:
                pass  # Spinner might not appear
            
            # Wait for spinner to disappear
            WebDriverWait(self.driver, timeout).until(
                EC.invisibility_of_element_located(self.LOADING_SPINNER)
            )
            return True
        except TimeoutException:
            logger.warning("Loading timeout")
            return False
    
    def wait_for_no_error_messages(self, timeout=10):
        """Wait for no error messages to be present."""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.invisibility_of_element_located(self.ERROR_MESSAGE)
            )
            return True
        except TimeoutException:
            return False
    
    def get_error_message(self):
        """Get error message text."""
        try:
            error_element = self.wait_for_element(self.ERROR_MESSAGE, timeout=5)
            return error_element.text
        except TimeoutException:
            return None
    
    def get_success_message(self):
        """Get success message text."""
        try:
            success_element = self.wait_for_element(self.SUCCESS_MESSAGE, timeout=5)
            return success_element.text
        except TimeoutException:
            return None
    
    def close_modal_if_present(self):
        """Close modal dialog if present."""
        try:
            if self.is_element_present(self.MODAL_DIALOG, timeout=2):
                close_button = self.wait_for_clickable_element(self.CLOSE_BUTTON, timeout=5)
                close_button.click()
                return True
        except TimeoutException:
            pass
        return False
    
    def scroll_to_element(self, locator, timeout=None):
        """Scroll to an element."""
        return self.helpers.scroll_to_element(locator, timeout)
    
    def scroll_to_top(self):
        """Scroll to top of page."""
        self.helpers.scroll_to_top()
    
    def scroll_to_bottom(self):
        """Scroll to bottom of page."""
        self.helpers.scroll_to_bottom()
    
    def hover_over_element(self, locator, timeout=None):
        """Hover over an element."""
        return self.helpers.hover_over_element(locator, timeout)
    
    def get_current_url(self):
        """Get current URL."""
        return self.driver.current_url
    
    def get_page_title(self):
        """Get page title."""
        return self.driver.title
    
    def refresh_page(self):
        """Refresh the current page."""
        self.driver.refresh()
        self.wait_for_page_load()
    
    def go_back(self):
        """Go back to previous page."""
        self.driver.back()
        self.wait_for_page_load()
    
    def switch_to_new_window(self):
        """Switch to a new window."""
        current_window = self.driver.current_window_handle
        all_windows = self.driver.window_handles
        
        for window in all_windows:
            if window != current_window:
                self.driver.switch_to.window(window)
                return window
        return None
    
    def switch_to_window(self, window_handle):
        """Switch to a specific window."""
        self.driver.switch_to.window(window_handle)
    
    def close_current_window(self):
        """Close current window."""
        self.driver.close()
    
    def take_screenshot(self, description=""):
        """Take a screenshot."""
        test_name = getattr(self, '_test_name', 'unknown_test')
        return self.screenshot_util.capture_screenshot(test_name, description)
    
    def verify_page_title(self, expected_title):
        """Verify page title."""
        actual_title = self.get_page_title()
        if expected_title in actual_title:
            ReportHelpers.log_test_step(f"Verify page title", "PASS", f"Expected: {expected_title}, Actual: {actual_title}")
            return True
        else:
            ReportHelpers.log_test_step(f"Verify page title", "FAIL", f"Expected: {expected_title}, Actual: {actual_title}")
            return False
    
    def verify_url_contains(self, expected_url_part):
        """Verify URL contains expected part."""
        actual_url = self.get_current_url()
        if expected_url_part in actual_url:
            ReportHelpers.log_test_step(f"Verify URL contains {expected_url_part}", "PASS", f"Actual URL: {actual_url}")
            return True
        else:
            ReportHelpers.log_test_step(f"Verify URL contains {expected_url_part}", "FAIL", f"Actual URL: {actual_url}")
            return False
    
    def verify_element_text(self, locator, expected_text):
        """Verify element text."""
        actual_text = self.get_element_text(locator)
        if actual_text and expected_text in actual_text:
            ReportHelpers.log_test_step(f"Verify element text", "PASS", f"Expected: {expected_text}, Actual: {actual_text}")
            return True
        else:
            ReportHelpers.log_test_step(f"Verify element text", "FAIL", f"Expected: {expected_text}, Actual: {actual_text}")
            return False
    
    def verify_element_present(self, locator, timeout=5):
        """Verify element is present."""
        is_present = self.is_element_present(locator, timeout)
        if is_present:
            ReportHelpers.log_test_step(f"Verify element present {locator}", "PASS")
        else:
            ReportHelpers.log_test_step(f"Verify element present {locator}", "FAIL")
        return is_present
    
    def verify_element_not_present(self, locator, timeout=5):
        """Verify element is not present."""
        is_present = self.is_element_present(locator, timeout)
        if not is_present:
            ReportHelpers.log_test_step(f"Verify element not present {locator}", "PASS")
        else:
            ReportHelpers.log_test_step(f"Verify element not present {locator}", "FAIL")
        return not is_present
    
    def clear_browser_cache(self):
        """Clear browser cache and storage."""
        self.driver.delete_all_cookies()
        self.driver.execute_script("window.localStorage.clear();")
        self.driver.execute_script("window.sessionStorage.clear();")
        ReportHelpers.log_test_step("Clear browser cache", "PASS")
    
    def execute_javascript(self, script, *args):
        """Execute JavaScript code."""
        try:
            result = self.driver.execute_script(script, *args)
            ReportHelpers.log_test_step("Execute JavaScript", "PASS", f"Script: {script}")
            return result
        except Exception as e:
            ReportHelpers.log_test_step("Execute JavaScript", "FAIL", f"Script: {script}, Error: {e}")
            return None
    
    def wait_for_ajax_complete(self, timeout=30):
        """Wait for AJAX requests to complete."""
        try:
            WebDriverWait(self.driver, timeout).until(
                lambda driver: driver.execute_script("return jQuery.active == 0")
            )
            return True
        except:
            # If jQuery is not available, wait for general document ready
            try:
                WebDriverWait(self.driver, timeout).until(
                    lambda driver: driver.execute_script("return document.readyState") == "complete"
                )
                return True
            except TimeoutException:
                return False
    
    def get_browser_logs(self):
        """Get browser console logs."""
        try:
            logs = self.driver.get_log('browser')
            return logs
        except Exception as e:
            logger.error(f"Failed to get browser logs: {e}")
            return []
    
    def assert_no_console_errors(self):
        """Assert there are no console errors."""
        logs = self.get_browser_logs()
        errors = [log for log in logs if log['level'] == 'SEVERE']
        
        if errors:
            error_messages = [log['message'] for log in errors]
            ReportHelpers.log_test_step("Check console errors", "FAIL", f"Errors found: {error_messages}")
            return False
        else:
            ReportHelpers.log_test_step("Check console errors", "PASS")
            return True
    
    def get_all_links(self):
        """Get all links on the page."""
        link_elements = self.driver.find_elements(By.TAG_NAME, "a")
        links = []
        for link in link_elements:
            href = link.get_attribute("href")
            text = link.text
            if href:
                links.append({"text": text, "href": href})
        return links
    
    def verify_no_broken_links(self):
        """Verify there are no broken links on the page."""
        import requests
        links = self.get_all_links()
        broken_links = []
        
        for link in links:
            try:
                response = requests.head(link["href"], timeout=10)
                if response.status_code >= 400:
                    broken_links.append(link)
            except requests.exceptions.RequestException:
                broken_links.append(link)
        
        if broken_links:
            ReportHelpers.log_test_step("Check broken links", "FAIL", f"Broken links: {broken_links}")
            return False
        else:
            ReportHelpers.log_test_step("Check broken links", "PASS")
            return True
