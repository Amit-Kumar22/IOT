"""
Smoke tests for authentication functionality.
"""

import pytest
from page_objects.login_page import LoginPage
from test_data.test_users import TestUsers, get_all_valid_users, get_all_invalid_users
from test_data.test_config import TestConfig
from utilities.helpers import ReportHelpers
import logging

logger = logging.getLogger(__name__)

class TestAuthenticationSmoke:
    """Smoke tests for authentication functionality."""
    
    def setup_method(self):
        """Setup method for each test."""
        self.test_data = {}
    
    def teardown_method(self):
        """Teardown method for each test."""
        pass
    
    @pytest.mark.smoke
    @pytest.mark.auth
    @pytest.mark.critical
    def test_login_page_loads(self, driver, base_url):
        """Test that login page loads correctly."""
        login_page = LoginPage(driver)
        
        # Navigate to login page
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        
        # Verify page title
        assert login_page.verify_login_page_title(), "Login page title is incorrect"
        
        # Verify page URL
        assert login_page.verify_login_page_url(), "Login page URL is incorrect"
        
        # Verify essential elements are present
        assert login_page.verify_login_page_elements(), "Login page elements are missing"
        
        # Take screenshot
        login_page.take_screenshot("login_page_loaded")
    
    @pytest.mark.smoke
    @pytest.mark.auth
    @pytest.mark.critical
    @pytest.mark.parametrize("user_data", get_all_valid_users())
    def test_valid_login_all_roles(self, driver, base_url, user_data):
        """Test login with valid credentials for all user roles."""
        login_page = LoginPage(driver)
        
        # Navigate to login page
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        
        # Perform login
        assert login_page.login(user_data["email"], user_data["password"]), \
            f"Login failed for {user_data['role']} user"
        
        # Verify login success
        assert login_page.is_login_successful(), \
            f"Login success verification failed for {user_data['role']} user"
        
        # Verify no error messages
        assert not login_page.is_error_present(), \
            f"Error message present after successful login for {user_data['role']} user"
        
        # Take screenshot
        login_page.take_screenshot(f"successful_login_{user_data['role']}")
        
        # Logout
        login_page.logout()
    
    @pytest.mark.smoke
    @pytest.mark.auth
    @pytest.mark.critical
    def test_admin_login_specific(self, driver, base_url, admin_user):
        """Test admin login with specific verifications."""
        login_page = LoginPage(driver)
        
        # Navigate to login page
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        
        # Perform admin login
        assert login_page.quick_login(admin_user), "Admin login failed"
        
        # Verify admin dashboard access
        assert login_page.is_login_successful(), "Admin login verification failed"
        
        # Verify URL contains admin or dashboard
        current_url = login_page.get_current_url()
        assert any(path in current_url for path in ["/admin", "/dashboard"]), \
            f"Admin not redirected to correct page: {current_url}"
        
        # Take screenshot
        login_page.take_screenshot("admin_login_success")
    
    @pytest.mark.smoke
    @pytest.mark.auth
    @pytest.mark.critical
    def test_company_login_specific(self, driver, base_url, company_user):
        """Test company user login with specific verifications."""
        login_page = LoginPage(driver)
        
        # Navigate to login page
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        
        # Perform company login
        assert login_page.quick_login(company_user), "Company login failed"
        
        # Verify company dashboard access
        assert login_page.is_login_successful(), "Company login verification failed"
        
        # Verify URL contains company or dashboard
        current_url = login_page.get_current_url()
        assert any(path in current_url for path in ["/company", "/dashboard"]), \
            f"Company user not redirected to correct page: {current_url}"
        
        # Take screenshot
        login_page.take_screenshot("company_login_success")
    
    @pytest.mark.smoke
    @pytest.mark.auth
    @pytest.mark.critical
    def test_consumer_login_specific(self, driver, base_url, consumer_user):
        """Test consumer user login with specific verifications."""
        login_page = LoginPage(driver)
        
        # Navigate to login page
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        
        # Perform consumer login
        assert login_page.quick_login(consumer_user), "Consumer login failed"
        
        # Verify consumer dashboard access
        assert login_page.is_login_successful(), "Consumer login verification failed"
        
        # Verify URL contains consumer or dashboard
        current_url = login_page.get_current_url()
        assert any(path in current_url for path in ["/consumer", "/dashboard"]), \
            f"Consumer user not redirected to correct page: {current_url}"
        
        # Take screenshot
        login_page.take_screenshot("consumer_login_success")
    
    @pytest.mark.smoke
    @pytest.mark.auth
    @pytest.mark.high
    @pytest.mark.parametrize("invalid_user", get_all_invalid_users())
    def test_invalid_login_attempts(self, driver, base_url, invalid_user):
        """Test login with invalid credentials."""
        login_page = LoginPage(driver)
        
        # Navigate to login page
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        
        # Attempt login with invalid credentials
        assert not login_page.login(invalid_user["email"], invalid_user["password"]), \
            "Login should fail with invalid credentials"
        
        # Verify error message is present
        assert login_page.is_error_present(), \
            "Error message not displayed for invalid credentials"
        
        # Verify specific error message
        error_message = login_page.get_error_message()
        assert error_message is not None, "Error message is None"
        assert "invalid" in error_message.lower() or "credentials" in error_message.lower(), \
            f"Unexpected error message: {error_message}"
        
        # Verify still on login page
        assert login_page.verify_login_page_url(), "Should remain on login page after failed login"
        
        # Take screenshot
        login_page.take_screenshot("invalid_login_attempt")
    
    @pytest.mark.smoke
    @pytest.mark.auth
    @pytest.mark.high
    def test_empty_credentials_validation(self, driver, base_url):
        """Test form validation with empty credentials."""
        login_page = LoginPage(driver)
        
        # Navigate to login page
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        
        # Attempt login with empty credentials
        assert not login_page.login("", ""), "Login should fail with empty credentials"
        
        # Verify validation errors
        assert login_page.has_validation_errors(), "Validation errors not displayed"
        
        # Verify specific validation messages
        validation_errors = login_page.get_validation_errors()
        assert any("email" in error.lower() for error in validation_errors), \
            "Email validation error not found"
        
        # Take screenshot
        login_page.take_screenshot("empty_credentials_validation")
    
    @pytest.mark.smoke
    @pytest.mark.auth
    @pytest.mark.high
    def test_invalid_email_format_validation(self, driver, base_url):
        """Test email format validation."""
        login_page = LoginPage(driver)
        
        # Navigate to login page
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        
        # Attempt login with invalid email format
        assert not login_page.login("invalid-email", "password123"), \
            "Login should fail with invalid email format"
        
        # Verify validation error for email format
        assert login_page.has_validation_errors(), "Email format validation error not displayed"
        
        # Take screenshot
        login_page.take_screenshot("invalid_email_format_validation")
    
    @pytest.mark.smoke
    @pytest.mark.auth
    @pytest.mark.medium
    def test_login_with_enter_key(self, driver, base_url, admin_user):
        """Test login using Enter key instead of button click."""
        login_page = LoginPage(driver)
        
        # Navigate to login page
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        
        # Test login with Enter key
        assert login_page.test_login_with_enter_key(admin_user["email"], admin_user["password"]), \
            "Login with Enter key failed"
        
        # Verify login success
        assert login_page.is_login_successful(), "Login with Enter key verification failed"
        
        # Take screenshot
        login_page.take_screenshot("login_with_enter_key")
    
    @pytest.mark.smoke
    @pytest.mark.auth
    @pytest.mark.medium
    def test_login_with_tab_navigation(self, driver, base_url, admin_user):
        """Test login using tab navigation."""
        login_page = LoginPage(driver)
        
        # Navigate to login page
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        
        # Test login with tab navigation
        assert login_page.test_login_with_tab_navigation(admin_user["email"], admin_user["password"]), \
            "Login with tab navigation failed"
        
        # Verify login success
        assert login_page.is_login_successful(), "Login with tab navigation verification failed"
        
        # Take screenshot
        login_page.take_screenshot("login_with_tab_navigation")
    
    @pytest.mark.smoke
    @pytest.mark.auth
    @pytest.mark.medium
    def test_password_field_masking(self, driver, base_url):
        """Test password field masking."""
        login_page = LoginPage(driver)
        
        # Navigate to login page
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        
        # Verify password field is masked
        assert login_page.verify_password_masking(), "Password field is not masked"
        
        # Take screenshot
        login_page.take_screenshot("password_field_masking")
    
    @pytest.mark.smoke
    @pytest.mark.auth
    @pytest.mark.medium
    def test_login_form_clearing(self, driver, base_url):
        """Test login form field clearing."""
        login_page = LoginPage(driver)
        
        # Navigate to login page
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        
        # Enter some data
        login_page.enter_email("test@example.com")
        login_page.enter_password("testpassword")
        
        # Verify data is entered
        assert login_page.get_email_field_value() == "test@example.com", "Email not entered correctly"
        
        # Clear form
        assert login_page.clear_login_form(), "Failed to clear login form"
        
        # Verify form is cleared
        assert login_page.get_email_field_value() == "", "Email field not cleared"
        assert login_page.get_password_field_value() == "", "Password field not cleared"
        
        # Take screenshot
        login_page.take_screenshot("login_form_clearing")
    
    @pytest.mark.smoke
    @pytest.mark.auth
    @pytest.mark.medium
    def test_remember_me_functionality(self, driver, base_url):
        """Test remember me checkbox functionality."""
        login_page = LoginPage(driver)
        
        # Navigate to login page
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        
        # Verify remember me checkbox is present
        if login_page.is_element_present(login_page.REMEMBER_ME_CHECKBOX):
            # Test checkbox toggle
            initial_state = login_page.is_remember_me_checked()
            login_page.toggle_remember_me()
            new_state = login_page.is_remember_me_checked()
            
            assert initial_state != new_state, "Remember me checkbox did not toggle"
            
            # Take screenshot
            login_page.take_screenshot("remember_me_functionality")
        else:
            # If remember me is not present, just log it
            ReportHelpers.log_test_step("Remember me checkbox", "INFO", "Not present on login page")
    
    @pytest.mark.smoke
    @pytest.mark.auth
    @pytest.mark.medium
    def test_forgot_password_link(self, driver, base_url):
        """Test forgot password link functionality."""
        login_page = LoginPage(driver)
        
        # Navigate to login page
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        
        # Check if forgot password link is present
        if login_page.is_element_present(login_page.FORGOT_PASSWORD_LINK):
            # Click forgot password link
            assert login_page.click_forgot_password_link(), "Failed to click forgot password link"
            
            # Verify navigation to forgot password page
            current_url = login_page.get_current_url()
            assert "forgot" in current_url.lower() or "reset" in current_url.lower(), \
                f"Not redirected to forgot password page: {current_url}"
            
            # Take screenshot
            login_page.take_screenshot("forgot_password_link")
        else:
            # If forgot password link is not present, just log it
            ReportHelpers.log_test_step("Forgot password link", "INFO", "Not present on login page")
    
    @pytest.mark.smoke
    @pytest.mark.auth
    @pytest.mark.medium
    def test_register_link(self, driver, base_url):
        """Test register link functionality."""
        login_page = LoginPage(driver)
        
        # Navigate to login page
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        
        # Check if register link is present
        if login_page.is_element_present(login_page.REGISTER_LINK):
            # Click register link
            assert login_page.click_register_link(), "Failed to click register link"
            
            # Verify navigation to register page
            current_url = login_page.get_current_url()
            assert "register" in current_url.lower() or "signup" in current_url.lower(), \
                f"Not redirected to register page: {current_url}"
            
            # Take screenshot
            login_page.take_screenshot("register_link")
        else:
            # If register link is not present, just log it
            ReportHelpers.log_test_step("Register link", "INFO", "Not present on login page")
    
    @pytest.mark.smoke
    @pytest.mark.auth
    @pytest.mark.low
    def test_social_login_options(self, driver, base_url):
        """Test social login options availability."""
        login_page = LoginPage(driver)
        
        # Navigate to login page
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        
        # Check social login options
        social_options = login_page.verify_social_login_options()
        
        # Log available social login options
        ReportHelpers.log_test_step("Social login options", "INFO", f"Available: {social_options}")
        
        # Take screenshot
        login_page.take_screenshot("social_login_options")
    
    @pytest.mark.smoke
    @pytest.mark.auth
    @pytest.mark.critical
    def test_logout_functionality(self, driver, base_url, admin_user):
        """Test logout functionality."""
        login_page = LoginPage(driver)
        
        # Navigate to login page and login
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        assert login_page.quick_login(admin_user), "Admin login failed"
        assert login_page.is_login_successful(), "Login verification failed"
        
        # Perform logout
        assert login_page.logout(), "Logout failed"
        
        # Verify logout success (should be back to login page or home page)
        current_url = login_page.get_current_url()
        assert any(path in current_url for path in ["/login", "/", "/home"]), \
            f"Not redirected to login/home page after logout: {current_url}"
        
        # Take screenshot
        login_page.take_screenshot("logout_functionality")
    
    @pytest.mark.smoke
    @pytest.mark.auth
    @pytest.mark.high
    def test_session_timeout_handling(self, driver, base_url, admin_user):
        """Test session timeout handling."""
        login_page = LoginPage(driver)
        
        # Navigate to login page and login
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        assert login_page.quick_login(admin_user), "Admin login failed"
        assert login_page.is_login_successful(), "Login verification failed"
        
        # Clear session manually to simulate timeout
        login_page.clear_browser_cache()
        
        # Try to access protected page
        login_page.navigate_to("/dashboard")
        
        # Should be redirected to login page
        current_url = login_page.get_current_url()
        assert "/login" in current_url or login_page.is_element_present(login_page.LOGIN_BUTTON), \
            f"Not redirected to login page after session timeout: {current_url}"
        
        # Take screenshot
        login_page.take_screenshot("session_timeout_handling")
    
    @pytest.mark.smoke
    @pytest.mark.auth
    @pytest.mark.medium
    def test_no_console_errors_on_login(self, driver, base_url, admin_user):
        """Test that login page has no console errors."""
        login_page = LoginPage(driver)
        
        # Navigate to login page
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        
        # Perform login
        assert login_page.quick_login(admin_user), "Admin login failed"
        
        # Check for console errors
        assert login_page.assert_no_console_errors(), "Console errors found during login"
        
        # Take screenshot
        login_page.take_screenshot("no_console_errors_login")
    
    @pytest.mark.smoke
    @pytest.mark.auth
    @pytest.mark.medium
    def test_login_button_state(self, driver, base_url):
        """Test login button state changes."""
        login_page = LoginPage(driver)
        
        # Navigate to login page
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        
        # Initially button should be enabled
        assert login_page.is_login_button_enabled(), "Login button should be enabled initially"
        
        # Enter credentials
        login_page.enter_email("test@example.com")
        login_page.enter_password("testpassword")
        
        # Button should still be enabled
        assert login_page.is_login_button_enabled(), "Login button should be enabled with credentials"
        
        # Take screenshot
        login_page.take_screenshot("login_button_state")
    
    @pytest.mark.smoke
    @pytest.mark.auth
    @pytest.mark.critical
    def test_concurrent_login_attempts(self, driver, base_url, admin_user):
        """Test handling of concurrent login attempts."""
        login_page = LoginPage(driver)
        
        # Navigate to login page
        assert login_page.navigate_to_login(), "Failed to navigate to login page"
        
        # Perform first login
        assert login_page.quick_login(admin_user), "First login failed"
        assert login_page.is_login_successful(), "First login verification failed"
        
        # Open new tab and try to login again
        original_window = login_page.get_current_window_handle()
        
        # Open new tab
        login_page.execute_javascript("window.open('');")
        new_window = login_page.switch_to_new_window()
        
        # Navigate to login page in new tab
        assert login_page.navigate_to_login(), "Failed to navigate to login page in new tab"
        
        # Try to login again
        login_page.quick_login(admin_user)
        
        # Should handle concurrent login gracefully
        current_url = login_page.get_current_url()
        assert "/dashboard" in current_url or "/login" in current_url, \
            f"Unexpected behavior with concurrent login: {current_url}"
        
        # Close new tab and switch back
        login_page.close_current_window()
        login_page.switch_to_window(original_window)
        
        # Take screenshot
        login_page.take_screenshot("concurrent_login_attempts")
