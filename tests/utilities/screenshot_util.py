"""
Screenshot utility for capturing screenshots during tests.
"""

import os
import time
from datetime import datetime
from PIL import Image
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from test_data.test_config import TestConfig
import logging

logger = logging.getLogger(__name__)

class ScreenshotUtil:
    """Utility class for taking screenshots during tests."""
    
    def __init__(self, driver):
        self.driver = driver
        self.screenshot_dir = TestConfig.SCREENSHOT_DIR
        self._ensure_screenshot_dir()
    
    def _ensure_screenshot_dir(self):
        """Ensure screenshot directory exists."""
        if not os.path.exists(self.screenshot_dir):
            os.makedirs(self.screenshot_dir)
    
    def capture_screenshot(self, test_name, description=""):
        """
        Capture a screenshot with timestamp and test name.
        
        Args:
            test_name (str): Name of the test
            description (str): Additional description for the screenshot
            
        Returns:
            str: Path to the saved screenshot
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{test_name}_{timestamp}"
        
        if description:
            filename += f"_{description}"
        
        filename += ".png"
        filepath = os.path.join(self.screenshot_dir, filename)
        
        try:
            # Wait for page to be fully loaded
            WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Take screenshot
            self.driver.save_screenshot(filepath)
            logger.info(f"Screenshot saved: {filepath}")
            
            return filepath
        except Exception as e:
            logger.error(f"Failed to capture screenshot: {e}")
            return None
    
    def capture_failure_screenshot(self, test_name):
        """
        Capture a screenshot when a test fails.
        
        Args:
            test_name (str): Name of the failed test
            
        Returns:
            str: Path to the saved screenshot
        """
        return self.capture_screenshot(test_name, "FAILURE")
    
    def capture_element_screenshot(self, element, test_name, description=""):
        """
        Capture a screenshot of a specific element.
        
        Args:
            element: WebElement to capture
            test_name (str): Name of the test
            description (str): Additional description
            
        Returns:
            str: Path to the saved screenshot
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{test_name}_element_{timestamp}"
        
        if description:
            filename += f"_{description}"
        
        filename += ".png"
        filepath = os.path.join(self.screenshot_dir, filename)
        
        try:
            # Take screenshot of the element
            element.screenshot(filepath)
            logger.info(f"Element screenshot saved: {filepath}")
            
            return filepath
        except Exception as e:
            logger.error(f"Failed to capture element screenshot: {e}")
            return None
    
    def capture_full_page_screenshot(self, test_name, description=""):
        """
        Capture a full page screenshot (entire page, not just viewport).
        
        Args:
            test_name (str): Name of the test
            description (str): Additional description
            
        Returns:
            str: Path to the saved screenshot
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{test_name}_fullpage_{timestamp}"
        
        if description:
            filename += f"_{description}"
        
        filename += ".png"
        filepath = os.path.join(self.screenshot_dir, filename)
        
        try:
            # Get original window size
            original_size = self.driver.get_window_size()
            
            # Get full page dimensions
            total_width = self.driver.execute_script("return document.body.scrollWidth")
            total_height = self.driver.execute_script("return document.body.scrollHeight")
            
            # Set window size to full page
            self.driver.set_window_size(total_width, total_height)
            
            # Take screenshot
            self.driver.save_screenshot(filepath)
            
            # Restore original window size
            self.driver.set_window_size(original_size['width'], original_size['height'])
            
            logger.info(f"Full page screenshot saved: {filepath}")
            return filepath
        except Exception as e:
            logger.error(f"Failed to capture full page screenshot: {e}")
            return None
    
    def capture_comparison_screenshots(self, test_name, before_action, after_action):
        """
        Capture before and after screenshots for comparison.
        
        Args:
            test_name (str): Name of the test
            before_action (callable): Function to execute before screenshot
            after_action (callable): Function to execute after screenshot
            
        Returns:
            tuple: Paths to before and after screenshots
        """
        # Capture before screenshot
        before_path = self.capture_screenshot(test_name, "before")
        
        # Execute action
        if before_action:
            before_action()
        
        # Wait a moment for any animations/transitions
        time.sleep(0.5)
        
        # Capture after screenshot
        after_path = self.capture_screenshot(test_name, "after")
        
        # Execute after action if provided
        if after_action:
            after_action()
        
        return before_path, after_path
    
    def capture_mobile_screenshot(self, test_name, device_name):
        """
        Capture a screenshot with mobile device context.
        
        Args:
            test_name (str): Name of the test
            device_name (str): Name of the mobile device
            
        Returns:
            str: Path to the saved screenshot
        """
        return self.capture_screenshot(test_name, f"mobile_{device_name}")
    
    def capture_responsive_screenshots(self, test_name, viewports):
        """
        Capture screenshots at different viewport sizes.
        
        Args:
            test_name (str): Name of the test
            viewports (list): List of viewport sizes [(width, height), ...]
            
        Returns:
            list: List of screenshot paths
        """
        original_size = self.driver.get_window_size()
        screenshot_paths = []
        
        for i, (width, height) in enumerate(viewports):
            try:
                # Set viewport size
                self.driver.set_window_size(width, height)
                
                # Wait for responsive changes
                time.sleep(0.5)
                
                # Capture screenshot
                path = self.capture_screenshot(test_name, f"responsive_{width}x{height}")
                if path:
                    screenshot_paths.append(path)
                
            except Exception as e:
                logger.error(f"Failed to capture responsive screenshot at {width}x{height}: {e}")
        
        # Restore original window size
        try:
            self.driver.set_window_size(original_size['width'], original_size['height'])
        except Exception as e:
            logger.warning(f"Failed to restore window size: {e}")
        
        return screenshot_paths
    
    def capture_error_context_screenshot(self, test_name, error_message):
        """
        Capture a screenshot with error context information.
        
        Args:
            test_name (str): Name of the test
            error_message (str): Error message to include in filename
            
        Returns:
            str: Path to the saved screenshot
        """
        # Clean error message for filename
        clean_error = "".join(c for c in error_message if c.isalnum() or c in (' ', '-', '_')).rstrip()
        clean_error = clean_error.replace(' ', '_')[:50]  # Limit length
        
        return self.capture_screenshot(test_name, f"error_{clean_error}")
    
    def capture_network_failure_screenshot(self, test_name, url):
        """
        Capture a screenshot when network-related failure occurs.
        
        Args:
            test_name (str): Name of the test
            url (str): URL that failed to load
            
        Returns:
            str: Path to the saved screenshot
        """
        return self.capture_screenshot(test_name, f"network_failure_{url.replace('/', '_')}")
    
    def capture_step_screenshots(self, test_name, steps):
        """
        Capture screenshots for each step in a test.
        
        Args:
            test_name (str): Name of the test
            steps (list): List of step descriptions
            
        Returns:
            dict: Dictionary mapping step names to screenshot paths
        """
        step_screenshots = {}
        
        for i, step in enumerate(steps):
            step_name = f"step_{i+1:02d}_{step.replace(' ', '_')}"
            path = self.capture_screenshot(test_name, step_name)
            if path:
                step_screenshots[step] = path
        
        return step_screenshots
    
    def resize_screenshot(self, filepath, max_width=800, max_height=600):
        """
        Resize a screenshot to reduce file size.
        
        Args:
            filepath (str): Path to the screenshot
            max_width (int): Maximum width
            max_height (int): Maximum height
            
        Returns:
            str: Path to the resized screenshot
        """
        try:
            with Image.open(filepath) as img:
                img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
                
                # Save with optimized quality
                resized_path = filepath.replace('.png', '_resized.png')
                img.save(resized_path, optimize=True, quality=85)
                
                logger.info(f"Screenshot resized and saved: {resized_path}")
                return resized_path
        except Exception as e:
            logger.error(f"Failed to resize screenshot: {e}")
            return filepath
    
    def cleanup_old_screenshots(self, days_old=7):
        """
        Clean up old screenshots to save disk space.
        
        Args:
            days_old (int): Number of days old to consider for cleanup
        """
        try:
            current_time = time.time()
            for filename in os.listdir(self.screenshot_dir):
                filepath = os.path.join(self.screenshot_dir, filename)
                if os.path.isfile(filepath):
                    file_age = current_time - os.path.getmtime(filepath)
                    if file_age > days_old * 24 * 60 * 60:  # Convert days to seconds
                        os.remove(filepath)
                        logger.info(f"Removed old screenshot: {filepath}")
        except Exception as e:
            logger.error(f"Failed to cleanup old screenshots: {e}")
    
    def get_screenshot_info(self, filepath):
        """
        Get information about a screenshot.
        
        Args:
            filepath (str): Path to the screenshot
            
        Returns:
            dict: Screenshot information
        """
        try:
            with Image.open(filepath) as img:
                return {
                    'path': filepath,
                    'size': os.path.getsize(filepath),
                    'dimensions': img.size,
                    'format': img.format,
                    'mode': img.mode,
                    'created': datetime.fromtimestamp(os.path.getctime(filepath)).isoformat()
                }
        except Exception as e:
            logger.error(f"Failed to get screenshot info: {e}")
            return None

# Utility function to create screenshot utility instance
def create_screenshot_util(driver):
    """Create a screenshot utility instance."""
    return ScreenshotUtil(driver)
