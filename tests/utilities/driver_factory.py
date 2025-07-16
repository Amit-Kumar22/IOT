"""
Driver factory for creating WebDriver instances with different browsers.
"""

from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.edge.options import Options as EdgeOptions
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from test_data.test_config import TestConfig
import logging

logger = logging.getLogger(__name__)

class DriverFactory:
    """Factory class for creating WebDriver instances."""
    
    @staticmethod
    def get_driver(browser_name="chrome", headless=False, mobile_device=None):
        """
        Create and return a WebDriver instance.
        
        Args:
            browser_name (str): Browser name (chrome, firefox, edge)
            headless (bool): Run in headless mode
            mobile_device (dict): Mobile device settings for responsive testing
            
        Returns:
            WebDriver: Configured WebDriver instance
        """
        browser_name = browser_name.lower()
        
        if browser_name == "chrome":
            return DriverFactory._create_chrome_driver(headless, mobile_device)
        elif browser_name == "firefox":
            return DriverFactory._create_firefox_driver(headless, mobile_device)
        elif browser_name == "edge":
            return DriverFactory._create_edge_driver(headless, mobile_device)
        else:
            raise ValueError(f"Unsupported browser: {browser_name}")
    
    @staticmethod
    def _create_chrome_driver(headless=False, mobile_device=None):
        """Create Chrome WebDriver instance."""
        options = ChromeOptions()
        
        # Add default Chrome options
        default_options = TestConfig.BROWSER_SETTINGS["chrome"]["options"]
        for option in default_options:
            options.add_argument(option)
        
        # Add headless mode if requested
        if headless:
            options.add_argument("--headless")
            options.add_argument("--disable-gpu")
        
        # Add mobile device emulation if requested
        if mobile_device:
            mobile_emulation = {
                "deviceMetrics": {
                    "width": mobile_device["width"],
                    "height": mobile_device["height"],
                    "pixelRatio": mobile_device["pixel_ratio"]
                },
                "userAgent": mobile_device["user_agent"]
            }
            options.add_experimental_option("mobileEmulation", mobile_emulation)
        
        # Additional Chrome options for stability
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        # Performance optimization
        options.add_argument("--disable-extensions")
        options.add_argument("--disable-plugins")
        options.add_argument("--disable-images")
        options.add_argument("--disable-javascript")  # Remove this if JS is needed
        
        # Create service
        service = ChromeService(ChromeDriverManager().install())
        
        # Create and configure driver
        driver = webdriver.Chrome(service=service, options=options)
        
        # Set timeouts
        driver.set_page_load_timeout(TestConfig.PAGE_LOAD_TIMEOUT)
        driver.implicitly_wait(TestConfig.IMPLICIT_WAIT)
        
        # Execute script to hide automation flags
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        logger.info(f"Chrome driver created successfully. Headless: {headless}")
        return driver
    
    @staticmethod
    def _create_firefox_driver(headless=False, mobile_device=None):
        """Create Firefox WebDriver instance."""
        options = FirefoxOptions()
        
        # Add default Firefox options
        default_options = TestConfig.BROWSER_SETTINGS["firefox"]["options"]
        for option in default_options:
            options.add_argument(option)
        
        # Add headless mode if requested
        if headless:
            options.add_argument("--headless")
        
        # Mobile device emulation for Firefox (limited support)
        if mobile_device:
            options.set_preference("general.useragent.override", mobile_device["user_agent"])
        
        # Additional Firefox preferences
        options.set_preference("dom.webdriver.enabled", False)
        options.set_preference("useAutomationExtension", False)
        options.set_preference("media.volume_scale", "0.0")  # Mute audio
        
        # Performance optimization
        options.set_preference("browser.cache.disk.enable", False)
        options.set_preference("browser.cache.memory.enable", False)
        options.set_preference("browser.cache.offline.enable", False)
        
        # Create service
        service = FirefoxService(GeckoDriverManager().install())
        
        # Create and configure driver
        driver = webdriver.Firefox(service=service, options=options)
        
        # Set window size for mobile emulation
        if mobile_device:
            driver.set_window_size(mobile_device["width"], mobile_device["height"])
        
        # Set timeouts
        driver.set_page_load_timeout(TestConfig.PAGE_LOAD_TIMEOUT)
        driver.implicitly_wait(TestConfig.IMPLICIT_WAIT)
        
        logger.info(f"Firefox driver created successfully. Headless: {headless}")
        return driver
    
    @staticmethod
    def _create_edge_driver(headless=False, mobile_device=None):
        """Create Edge WebDriver instance."""
        options = EdgeOptions()
        
        # Add default Edge options
        default_options = TestConfig.BROWSER_SETTINGS["edge"]["options"]
        for option in default_options:
            options.add_argument(option)
        
        # Add headless mode if requested
        if headless:
            options.add_argument("--headless")
            options.add_argument("--disable-gpu")
        
        # Add mobile device emulation if requested
        if mobile_device:
            mobile_emulation = {
                "deviceMetrics": {
                    "width": mobile_device["width"],
                    "height": mobile_device["height"],
                    "pixelRatio": mobile_device["pixel_ratio"]
                },
                "userAgent": mobile_device["user_agent"]
            }
            options.add_experimental_option("mobileEmulation", mobile_emulation)
        
        # Additional Edge options for stability
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        # Performance optimization
        options.add_argument("--disable-extensions")
        options.add_argument("--disable-plugins")
        
        # Create service
        service = EdgeService(EdgeChromiumDriverManager().install())
        
        # Create and configure driver
        driver = webdriver.Edge(service=service, options=options)
        
        # Set timeouts
        driver.set_page_load_timeout(TestConfig.PAGE_LOAD_TIMEOUT)
        driver.implicitly_wait(TestConfig.IMPLICIT_WAIT)
        
        logger.info(f"Edge driver created successfully. Headless: {headless}")
        return driver
    
    @staticmethod
    def create_mobile_driver(device_name="iPhone 12", browser="chrome"):
        """Create a mobile-optimized WebDriver instance."""
        mobile_devices = TestConfig.MOBILE_DEVICES
        
        if device_name not in mobile_devices:
            raise ValueError(f"Unsupported mobile device: {device_name}")
        
        device_config = mobile_devices[device_name]
        return DriverFactory.get_driver(browser, mobile_device=device_config)
    
    @staticmethod
    def create_headless_driver(browser="chrome"):
        """Create a headless WebDriver instance."""
        return DriverFactory.get_driver(browser, headless=True)
    
    @staticmethod
    def get_supported_browsers():
        """Get list of supported browsers."""
        return ["chrome", "firefox", "edge"]
    
    @staticmethod
    def get_supported_mobile_devices():
        """Get list of supported mobile devices."""
        return list(TestConfig.MOBILE_DEVICES.keys())

class DriverManager:
    """Manager class for WebDriver instances."""
    
    def __init__(self):
        self.drivers = {}
        self.active_drivers = []
    
    def get_driver(self, browser_name="chrome", headless=False, mobile_device=None):
        """Get or create a WebDriver instance."""
        key = f"{browser_name}_{headless}_{mobile_device}"
        
        if key not in self.drivers:
            self.drivers[key] = DriverFactory.get_driver(browser_name, headless, mobile_device)
            self.active_drivers.append(self.drivers[key])
        
        return self.drivers[key]
    
    def quit_driver(self, driver):
        """Quit a specific driver."""
        if driver in self.active_drivers:
            driver.quit()
            self.active_drivers.remove(driver)
    
    def quit_all_drivers(self):
        """Quit all active drivers."""
        for driver in self.active_drivers[:]:
            try:
                driver.quit()
            except Exception as e:
                logger.warning(f"Error quitting driver: {e}")
        self.active_drivers.clear()
        self.drivers.clear()
    
    def get_active_driver_count(self):
        """Get the number of active drivers."""
        return len(self.active_drivers)

# Global driver manager instance
driver_manager = DriverManager()
