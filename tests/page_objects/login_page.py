"""
Login page object for authentication functionality.
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from page_objects.base_page import BasePage
from utilities.helpers import ReportHelpers
from test_data.test_config import TestConfig
import logging

logger = logging.getLogger(__name__)

class LoginPage(BasePage):
    """Login page object for authentication functionality."""
    
    def __init__(self, driver):
        super().__init__(driver)
        self.login_url = f"{self.base_url}/login"
        self.register_url = f"{self.base_url}/register"
    
    # Login form locators
    EMAIL_INPUT = (By.ID, "email")
    PASSWORD_INPUT = (By.ID, "password")
    LOGIN_BUTTON = (By.XPATH, "//button[contains(text(), 'Sign In') or contains(text(), 'Login')]")
    FORGOT_PASSWORD_LINK = (By.LINK_TEXT, "Forgot Password?")
    REGISTER_LINK = (By.LINK_TEXT, "Register")
    
    # Error and success message locators
    ERROR_MESSAGE = (By.CLASS_NAME, "error-message")
    SUCCESS_MESSAGE = (By.CLASS_NAME, "success-message")
    VALIDATION_ERROR = (By.CLASS_NAME, "validation-error")
    FIELD_ERROR = (By.CLASS_NAME, "field-error")
    
    # Form validation locators
    EMAIL_REQUIRED_ERROR = (By.XPATH, "//span[contains(text(), 'Email is required')]")
    PASSWORD_REQUIRED_ERROR = (By.XPATH, "//span[contains(text(), 'Password is required')]")
    INVALID_EMAIL_ERROR = (By.XPATH, "//span[contains(text(), 'Please enter a valid email')]")
    INVALID_CREDENTIALS_ERROR = (By.XPATH, "//span[contains(text(), 'Invalid credentials')]")
    
    # Login form elements
    REMEMBER_ME_CHECKBOX = (By.ID, "remember-me")
    SHOW_PASSWORD_BUTTON = (By.XPATH, "//button[contains(@class, 'show-password')]")
    
    # Social login (if available)
    GOOGLE_LOGIN_BUTTON = (By.XPATH, "//button[contains(text(), 'Google')]")
    FACEBOOK_LOGIN_BUTTON = (By.XPATH, "//button[contains(text(), 'Facebook')]")
    
    # Navigation elements
    LOGO = (By.CLASS_NAME, "logo")
    HOME_LINK = (By.LINK_TEXT, "Home")
    
    def navigate_to_login(self):
        """Navigate to login page."""
        success = self.navigate_to(self.login_url)
        if success:
            self.wait_for_page_load()
            ReportHelpers.log_test_step("Navigate to login page", "PASS")
        else:
            ReportHelpers.log_test_step("Navigate to login page", "FAIL")
        return success
    
    def navigate_to_register(self):
        """Navigate to register page."""
        success = self.navigate_to(self.register_url)
        if success:
            self.wait_for_page_load()
            ReportHelpers.log_test_step("Navigate to register page", "PASS")
        else:
            ReportHelpers.log_test_step("Navigate to register page", "FAIL")
        return success
    
    def enter_email(self, email):
        """Enter email address."""
        success = self.send_keys_to_element(self.EMAIL_INPUT, email)
        if success:
            ReportHelpers.log_test_step("Enter email", "PASS", f"Email: {email}")
        else:
            ReportHelpers.log_test_step("Enter email", "FAIL", f"Email: {email}")
        return success
    
    def enter_password(self, password):
        """Enter password."""
        success = self.send_keys_to_element(self.PASSWORD_INPUT, password)
        if success:
            ReportHelpers.log_test_step("Enter password", "PASS", "Password entered")
        else:
            ReportHelpers.log_test_step("Enter password", "FAIL", "Failed to enter password")
        return success
    
    def click_login_button(self):
        """Click login button."""
        success = self.click_element(self.LOGIN_BUTTON)
        if success:
            ReportHelpers.log_test_step("Click login button", "PASS")
        else:
            ReportHelpers.log_test_step("Click login button", "FAIL")
        return success
    
    def click_forgot_password_link(self):
        """Click forgot password link."""
        success = self.click_element(self.FORGOT_PASSWORD_LINK)
        if success:
            ReportHelpers.log_test_step("Click forgot password link", "PASS")
        else:
            ReportHelpers.log_test_step("Click forgot password link", "FAIL")
        return success
    
    def click_register_link(self):
        """Click register link."""
        success = self.click_element(self.REGISTER_LINK)
        if success:
            ReportHelpers.log_test_step("Click register link", "PASS")
        else:
            ReportHelpers.log_test_step("Click register link", "FAIL")
        return success
    
    def toggle_remember_me(self):
        """Toggle remember me checkbox."""
        success = self.click_element(self.REMEMBER_ME_CHECKBOX)
        if success:
            ReportHelpers.log_test_step("Toggle remember me", "PASS")
        else:
            ReportHelpers.log_test_step("Toggle remember me", "FAIL")
        return success
    
    def show_password(self):
        """Click show password button."""
        success = self.click_element(self.SHOW_PASSWORD_BUTTON)
        if success:
            ReportHelpers.log_test_step("Show password", "PASS")
        else:
            ReportHelpers.log_test_step("Show password", "FAIL")
        return success
    
    def login(self, email, password):
        """Perform login with email and password."""
        ReportHelpers.log_test_step("Start login process", "INFO", f"Email: {email}")
        
        # Enter credentials
        if not self.enter_email(email):
            return False
        
        if not self.enter_password(password):
            return False
        
        # Click login button
        if not self.click_login_button():
            return False
        
        # Wait for page to load after login
        self.wait_for_page_load()
        
        # Check for errors
        if self.is_error_present():
            error_message = self.get_error_message()
            ReportHelpers.log_test_step("Login process", "FAIL", f"Error: {error_message}")
            return False
        
        ReportHelpers.log_test_step("Login process", "PASS")
        return True
    
    def quick_login(self, user_data):
        """Quick login using user data dictionary."""
        return self.login(user_data["email"], user_data["password"])
    
    def is_login_successful(self):
        """Check if login was successful by verifying URL change."""
        try:
            # Wait for URL to change from login page
            self.wait.until(EC.url_contains("/dashboard"))
            ReportHelpers.log_test_step("Verify login success", "PASS", "Redirected to dashboard")
            return True
        except TimeoutException:
            # Check for specific redirect URLs
            current_url = self.get_current_url()
            if any(path in current_url for path in ["/dashboard", "/admin", "/company", "/consumer"]):
                ReportHelpers.log_test_step("Verify login success", "PASS", f"Redirected to {current_url}")
                return True
            else:
                ReportHelpers.log_test_step("Verify login success", "FAIL", f"Still on login page: {current_url}")
                return False
    
    def is_error_present(self):
        """Check if error message is present."""
        return self.is_element_present(self.ERROR_MESSAGE, timeout=3)
    
    def get_error_message(self):
        """Get error message text."""
        if self.is_error_present():
            return self.get_element_text(self.ERROR_MESSAGE)
        return None
    
    def get_validation_errors(self):
        """Get all validation error messages."""
        errors = []
        try:
            error_elements = self.driver.find_elements(*self.VALIDATION_ERROR)
            for element in error_elements:
                errors.append(element.text)
        except Exception as e:
            logger.error(f"Failed to get validation errors: {e}")
        return errors
    
    def has_validation_errors(self):
        """Check if there are validation errors."""
        return len(self.get_validation_errors()) > 0
    
    def verify_email_required_error(self):
        """Verify email required error message."""
        return self.is_element_present(self.EMAIL_REQUIRED_ERROR, timeout=5)
    
    def verify_password_required_error(self):
        """Verify password required error message."""
        return self.is_element_present(self.PASSWORD_REQUIRED_ERROR, timeout=5)
    
    def verify_invalid_email_error(self):
        """Verify invalid email format error message."""
        return self.is_element_present(self.INVALID_EMAIL_ERROR, timeout=5)
    
    def verify_invalid_credentials_error(self):
        """Verify invalid credentials error message."""
        return self.is_element_present(self.INVALID_CREDENTIALS_ERROR, timeout=5)
    
    def clear_login_form(self):
        """Clear login form fields."""
        try:
            email_field = self.wait_for_element(self.EMAIL_INPUT, timeout=5)
            password_field = self.wait_for_element(self.PASSWORD_INPUT, timeout=5)
            
            email_field.clear()
            password_field.clear()
            
            ReportHelpers.log_test_step("Clear login form", "PASS")
            return True
        except TimeoutException:
            ReportHelpers.log_test_step("Clear login form", "FAIL", "Form fields not found")
            return False
    
    def get_email_field_value(self):
        """Get current value of email field."""
        return self.get_element_attribute(self.EMAIL_INPUT, "value")
    
    def get_password_field_value(self):
        """Get current value of password field."""
        return self.get_element_attribute(self.PASSWORD_INPUT, "value")
    
    def is_email_field_focused(self):
        """Check if email field is focused."""
        email_field = self.wait_for_element(self.EMAIL_INPUT, timeout=5)
        return email_field == self.driver.switch_to.active_element
    
    def is_password_field_focused(self):
        """Check if password field is focused."""
        password_field = self.wait_for_element(self.PASSWORD_INPUT, timeout=5)
        return password_field == self.driver.switch_to.active_element
    
    def is_login_button_enabled(self):
        """Check if login button is enabled."""
        try:
            button = self.wait_for_element(self.LOGIN_BUTTON, timeout=5)
            return button.is_enabled()
        except TimeoutException:
            return False
    
    def is_remember_me_checked(self):
        """Check if remember me checkbox is checked."""
        try:
            checkbox = self.wait_for_element(self.REMEMBER_ME_CHECKBOX, timeout=5)
            return checkbox.is_selected()
        except TimeoutException:
            return False
    
    def logout(self):
        """Perform logout."""
        try:
            # Look for logout button or link
            logout_locators = [
                (By.XPATH, "//button[contains(text(), 'Logout') or contains(text(), 'Sign Out')]"),
                (By.LINK_TEXT, "Logout"),
                (By.LINK_TEXT, "Sign Out"),
                (By.CLASS_NAME, "logout-btn")
            ]
            
            for locator in logout_locators:
                if self.is_element_present(locator, timeout=2):
                    self.click_element(locator)
                    self.wait_for_page_load()
                    ReportHelpers.log_test_step("Logout", "PASS")
                    return True
            
            # If no logout button found, clear session manually
            self.clear_browser_cache()
            self.navigate_to(self.login_url)
            ReportHelpers.log_test_step("Logout", "PASS", "Manual session clear")
            return True
            
        except Exception as e:
            logger.error(f"Logout failed: {e}")
            ReportHelpers.log_test_step("Logout", "FAIL", str(e))
            return False
    
    def verify_login_page_elements(self):
        """Verify all login page elements are present."""
        required_elements = [
            (self.EMAIL_INPUT, "Email input field"),
            (self.PASSWORD_INPUT, "Password input field"),
            (self.LOGIN_BUTTON, "Login button")
        ]
        
        missing_elements = []
        for locator, description in required_elements:
            if not self.is_element_present(locator, timeout=5):
                missing_elements.append(description)
        
        if missing_elements:
            ReportHelpers.log_test_step("Verify login page elements", "FAIL", f"Missing: {missing_elements}")
            return False
        else:
            ReportHelpers.log_test_step("Verify login page elements", "PASS")
            return True
    
    def verify_login_page_title(self):
        """Verify login page title."""
        expected_title = TestConfig.PAGE_TITLES.get("login", "Login")
        return self.verify_page_title(expected_title)
    
    def verify_login_page_url(self):
        """Verify login page URL."""
        return self.verify_url_contains("/login")
    
    def test_login_with_enter_key(self, email, password):
        """Test login using Enter key instead of button click."""
        from selenium.webdriver.common.keys import Keys
        
        self.enter_email(email)
        self.enter_password(password)
        
        # Press Enter key in password field
        password_field = self.wait_for_element(self.PASSWORD_INPUT)
        password_field.send_keys(Keys.RETURN)
        
        self.wait_for_page_load()
        return self.is_login_successful()
    
    def test_login_with_tab_navigation(self, email, password):
        """Test login using tab navigation."""
        from selenium.webdriver.common.keys import Keys
        
        # Click on email field and enter email
        email_field = self.wait_for_clickable_element(self.EMAIL_INPUT)
        email_field.click()
        email_field.send_keys(email)
        
        # Tab to password field
        email_field.send_keys(Keys.TAB)
        
        # Enter password
        password_field = self.driver.switch_to.active_element
        password_field.send_keys(password)
        
        # Tab to login button
        password_field.send_keys(Keys.TAB)
        
        # Press Enter on login button
        login_button = self.driver.switch_to.active_element
        login_button.send_keys(Keys.RETURN)
        
        self.wait_for_page_load()
        return self.is_login_successful()
    
    def verify_password_masking(self):
        """Verify password field is masked."""
        password_field = self.wait_for_element(self.PASSWORD_INPUT)
        field_type = password_field.get_attribute("type")
        
        if field_type == "password":
            ReportHelpers.log_test_step("Verify password masking", "PASS")
            return True
        else:
            ReportHelpers.log_test_step("Verify password masking", "FAIL", f"Field type: {field_type}")
            return False
    
    def verify_social_login_options(self):
        """Verify social login options are available."""
        social_buttons = [
            (self.GOOGLE_LOGIN_BUTTON, "Google login"),
            (self.FACEBOOK_LOGIN_BUTTON, "Facebook login")
        ]
        
        available_options = []
        for locator, description in social_buttons:
            if self.is_element_present(locator, timeout=3):
                available_options.append(description)
        
        ReportHelpers.log_test_step("Verify social login options", "INFO", f"Available: {available_options}")
        return available_options
