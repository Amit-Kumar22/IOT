"""
Test configuration and constants for IoT Platform smoke tests.
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class TestConfig:
    """Configuration class for test settings."""
    
    # Application URLs
    BASE_URL = os.getenv("BASE_URL", "http://localhost:3000")
    API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:3000/api")
    
    # Browser settings
    BROWSER = os.getenv("BROWSER", "chrome")
    HEADLESS = os.getenv("HEADLESS", "false").lower() == "true"
    
    # Timeout settings
    IMPLICIT_WAIT = int(os.getenv("IMPLICIT_WAIT", "10"))
    EXPLICIT_WAIT = int(os.getenv("EXPLICIT_WAIT", "20"))
    PAGE_LOAD_TIMEOUT = int(os.getenv("PAGE_LOAD_TIMEOUT", "30"))
    
    # Test environment
    ENVIRONMENT = os.getenv("ENVIRONMENT", "local")
    
    # Test users - Demo credentials from the application
    ADMIN_USER = {
        "email": "admin@iotplatform.com",
        "password": "Admin123!",
        "role": "admin",
        "expected_redirect": "/admin/dashboard"
    }
    
    COMPANY_USER = {
        "email": "manager@acmecorp.com",
        "password": "Manager456!",
        "role": "company",
        "expected_redirect": "/company/dashboard"
    }
    
    CONSUMER_USER = {
        "email": "jane.doe@example.com",
        "password": "Consumer789!",
        "role": "consumer",
        "expected_redirect": "/consumer/dashboard"
    }
    
    # Test data for registration
    NEW_USER_DATA = {
        "first_name": "Test",
        "last_name": "User",
        "email": "testuser@example.com",
        "password": "TestPass123!",
        "confirm_password": "TestPass123!",
        "company": "Test Company",
        "role": "consumer"
    }
    
    # Invalid test data
    INVALID_USER = {
        "email": "invalid@email.com",
        "password": "wrongpassword"
    }
    
    # API endpoints
    API_ENDPOINTS = {
        "auth": {
            "login": "/auth/login",
            "register": "/auth/register",
            "logout": "/auth/logout",
            "refresh": "/auth/refresh",
            "profile": "/auth/profile",
            "forgot_password": "/auth/forgot-password",
            "reset_password": "/auth/reset-password",
            "change_password": "/auth/change-password"
        },
        "devices": {
            "list": "/devices",
            "create": "/devices",
            "update": "/devices/{id}",
            "delete": "/devices/{id}",
            "status": "/devices/{id}/status"
        }
    }
    
    # Expected page titles
    PAGE_TITLES = {
        "home": "IoT Platform - Device Management & Analytics",
        "login": "Login - IoT Platform",
        "register": "Register - IoT Platform",
        "dashboard": "Dashboard - IoT Platform",
        "devices": "Devices - IoT Platform",
        "analytics": "Analytics - IoT Platform",
        "admin": "Admin Panel - IoT Platform"
    }
    
    # Navigation menu items
    NAVIGATION_ITEMS = [
        {"name": "Dashboard", "href": "/", "icon": "HomeIcon"},
        {"name": "Devices", "href": "/login", "icon": "CpuChipIcon"},
        {"name": "Analytics", "href": "/login", "icon": "ChartBarIcon"},
        {"name": "Users", "href": "/login", "icon": "UserGroupIcon"},
        {"name": "Settings", "href": "/login", "icon": "CogIcon"},
        {"name": "Security", "href": "/login", "icon": "ShieldCheckIcon"}
    ]
    
    # Test data for devices
    DEVICE_DATA = {
        "name": "Test Device",
        "type": "sensor",
        "location": "Test Location",
        "status": "active",
        "firmware_version": "1.0.0"
    }
    
    # Expected error messages
    ERROR_MESSAGES = {
        "invalid_credentials": "Invalid credentials",
        "email_required": "Email is required",
        "password_required": "Password is required",
        "email_format": "Please enter a valid email address",
        "password_min_length": "Password must be at least 8 characters",
        "passwords_not_match": "Passwords do not match",
        "user_not_found": "User not found",
        "email_already_exists": "Email already exists",
        "session_expired": "Session expired",
        "access_denied": "Access denied"
    }
    
    # Screenshot settings
    SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "..", "reports", "screenshots")
    SCREENSHOT_ON_FAILURE = True
    
    # Report settings
    REPORT_DIR = os.path.join(os.path.dirname(__file__), "..", "reports")
    ALLURE_RESULTS_DIR = os.path.join(REPORT_DIR, "allure-results")
    
    # Logging settings
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE = os.path.join(REPORT_DIR, "test.log")
    
    # Parallel execution settings
    PARALLEL_WORKERS = int(os.getenv("PARALLEL_WORKERS", "4"))
    
    # Retry settings
    MAX_RETRIES = int(os.getenv("MAX_RETRIES", "2"))
    RETRY_DELAY = int(os.getenv("RETRY_DELAY", "1"))
    
    # Mobile device settings for responsive testing
    MOBILE_DEVICES = {
        "iPhone 12": {
            "width": 390,
            "height": 844,
            "pixel_ratio": 3,
            "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
        },
        "Samsung Galaxy S21": {
            "width": 360,
            "height": 800,
            "pixel_ratio": 3,
            "user_agent": "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Mobile Safari/537.36"
        },
        "iPad": {
            "width": 768,
            "height": 1024,
            "pixel_ratio": 2,
            "user_agent": "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
        }
    }
    
    # Browser-specific settings
    BROWSER_SETTINGS = {
        "chrome": {
            "options": [
                "--disable-web-security",
                "--disable-features=VizDisplayCompositor",
                "--disable-dev-shm-usage",
                "--no-sandbox",
                "--disable-gpu",
                "--window-size=1920,1080"
            ]
        },
        "firefox": {
            "options": [
                "--width=1920",
                "--height=1080"
            ]
        },
        "edge": {
            "options": [
                "--disable-web-security",
                "--disable-features=VizDisplayCompositor",
                "--window-size=1920,1080"
            ]
        }
    }

class TestUrls:
    """URL constants for different pages."""
    
    def __init__(self, base_url):
        self.base_url = base_url.rstrip('/')
        
    @property
    def home(self):
        return f"{self.base_url}/"
    
    @property
    def login(self):
        return f"{self.base_url}/login"
    
    @property
    def register(self):
        return f"{self.base_url}/register"
    
    @property
    def dashboard(self):
        return f"{self.base_url}/dashboard"
    
    @property
    def devices(self):
        return f"{self.base_url}/devices"
    
    @property
    def analytics(self):
        return f"{self.base_url}/analytics"
    
    @property
    def admin(self):
        return f"{self.base_url}/admin"
    
    @property
    def company(self):
        return f"{self.base_url}/company"
    
    @property
    def consumer(self):
        return f"{self.base_url}/consumer"

# Environment-specific configurations
ENVIRONMENT_CONFIGS = {
    "local": {
        "base_url": "http://localhost:3000",
        "api_url": "http://localhost:3000/api",
        "timeout": 10,
        "retry_count": 2
    },
    "dev": {
        "base_url": "https://dev.iotplatform.com",
        "api_url": "https://dev.iotplatform.com/api",
        "timeout": 15,
        "retry_count": 3
    },
    "staging": {
        "base_url": "https://staging.iotplatform.com",
        "api_url": "https://staging.iotplatform.com/api",
        "timeout": 20,
        "retry_count": 3
    },
    "prod": {
        "base_url": "https://iotplatform.com",
        "api_url": "https://iotplatform.com/api",
        "timeout": 30,
        "retry_count": 1
    }
}
