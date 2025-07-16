"""
Test user data and generators for IoT Platform smoke tests.
"""

import random
import string
from datetime import datetime, timedelta
from faker import Faker

# Initialize Faker
fake = Faker()

class TestUsers:
    """Static test user data."""
    
    # Primary test users (matching the demo credentials)
    ADMIN = {
        "email": "admin@iotplatform.com",
        "password": "Admin123!",
        "role": "admin",
        "first_name": "Admin",
        "last_name": "User",
        "company": "IoT Platform",
        "permissions": ["read", "write", "delete", "admin"],
        "expected_dashboard": "/admin/dashboard"
    }
    
    COMPANY_MANAGER = {
        "email": "manager@acmecorp.com",
        "password": "Manager456!",
        "role": "company",
        "first_name": "Company",
        "last_name": "Manager",
        "company": "ACME Corp",
        "permissions": ["read", "write"],
        "expected_dashboard": "/company/dashboard"
    }
    
    CONSUMER = {
        "email": "jane.doe@example.com",
        "password": "Consumer789!",
        "role": "consumer",
        "first_name": "Jane",
        "last_name": "Doe",
        "company": "Example Inc",
        "permissions": ["read"],
        "expected_dashboard": "/consumer/dashboard"
    }
    
    # Invalid test users
    INVALID_EMAIL = {
        "email": "invalid@email.com",
        "password": "wrongpassword",
        "expected_error": "Invalid credentials"
    }
    
    INVALID_PASSWORD = {
        "email": "admin@iotplatform.com",
        "password": "wrongpassword",
        "expected_error": "Invalid credentials"
    }
    
    EMPTY_FIELDS = {
        "email": "",
        "password": "",
        "expected_error": "Email is required"
    }
    
    INVALID_EMAIL_FORMAT = {
        "email": "invalid-email",
        "password": "password123",
        "expected_error": "Please enter a valid email address"
    }

class TestUserGenerator:
    """Dynamic test user generator."""
    
    def __init__(self):
        self.fake = Faker()
        self.used_emails = set()
    
    def generate_user(self, role="consumer", company=None):
        """Generate a unique test user."""
        email = self._generate_unique_email()
        
        user_data = {
            "email": email,
            "password": self._generate_password(),
            "first_name": self.fake.first_name(),
            "last_name": self.fake.last_name(),
            "company": company or self.fake.company(),
            "role": role,
            "phone": self.fake.phone_number(),
            "address": self.fake.address(),
            "created_at": datetime.now().isoformat(),
            "is_active": True,
            "is_verified": True
        }
        
        # Add role-specific permissions
        if role == "admin":
            user_data["permissions"] = ["read", "write", "delete", "admin"]
            user_data["expected_dashboard"] = "/admin/dashboard"
        elif role == "company":
            user_data["permissions"] = ["read", "write"]
            user_data["expected_dashboard"] = "/company/dashboard"
        else:  # consumer
            user_data["permissions"] = ["read"]
            user_data["expected_dashboard"] = "/consumer/dashboard"
        
        return user_data
    
    def generate_registration_data(self, role="consumer"):
        """Generate data for user registration."""
        password = self._generate_password()
        
        return {
            "first_name": self.fake.first_name(),
            "last_name": self.fake.last_name(),
            "email": self._generate_unique_email(),
            "password": password,
            "confirm_password": password,
            "company": self.fake.company(),
            "role": role,
            "phone": self.fake.phone_number(),
            "terms_accepted": True,
            "newsletter_subscribed": random.choice([True, False])
        }
    
    def generate_invalid_registration_data(self, error_type="email_exists"):
        """Generate invalid registration data for testing."""
        base_data = self.generate_registration_data()
        
        if error_type == "email_exists":
            base_data["email"] = TestUsers.ADMIN["email"]
        elif error_type == "password_mismatch":
            base_data["confirm_password"] = "different_password"
        elif error_type == "weak_password":
            base_data["password"] = "weak"
            base_data["confirm_password"] = "weak"
        elif error_type == "invalid_email":
            base_data["email"] = "invalid-email-format"
        elif error_type == "missing_required":
            base_data["email"] = ""
            base_data["password"] = ""
        
        return base_data
    
    def _generate_unique_email(self):
        """Generate a unique email address."""
        while True:
            email = self.fake.email()
            if email not in self.used_emails:
                self.used_emails.add(email)
                return email
    
    def _generate_password(self):
        """Generate a valid password."""
        # Ensure password meets requirements: min 8 chars, uppercase, lowercase, number, special char
        password = (
            self.fake.password(length=12, special_chars=True, digits=True, 
                             upper_case=True, lower_case=True)
        )
        return password

class TestCompanies:
    """Test company data."""
    
    ACME_CORP = {
        "name": "ACME Corp",
        "email": "contact@acmecorp.com",
        "phone": "+1-555-123-4567",
        "address": "123 Business St, City, State 12345",
        "industry": "Technology",
        "size": "Medium",
        "subscription_plan": "Premium",
        "created_at": "2024-01-01T00:00:00Z",
        "is_active": True
    }
    
    TECH_SOLUTIONS = {
        "name": "Tech Solutions Inc",
        "email": "info@techsolutions.com",
        "phone": "+1-555-987-6543",
        "address": "456 Innovation Ave, Tech City, TC 67890",
        "industry": "Software",
        "size": "Large",
        "subscription_plan": "Enterprise",
        "created_at": "2024-01-15T00:00:00Z",
        "is_active": True
    }
    
    STARTUP_CO = {
        "name": "Startup Co",
        "email": "hello@startupco.com",
        "phone": "+1-555-456-7890",
        "address": "789 Startup Blvd, Innovation Hub, IH 13579",
        "industry": "IoT",
        "size": "Small",
        "subscription_plan": "Basic",
        "created_at": "2024-02-01T00:00:00Z",
        "is_active": True
    }

class TestDevices:
    """Test device data."""
    
    SENSOR_DEVICE = {
        "id": "DEV_001",
        "name": "Temperature Sensor",
        "type": "sensor",
        "model": "TempSense Pro",
        "firmware_version": "1.2.3",
        "location": "Building A - Floor 1",
        "status": "active",
        "last_seen": datetime.now().isoformat(),
        "battery_level": 85,
        "signal_strength": -45,
        "company_id": "acme_corp"
    }
    
    ACTUATOR_DEVICE = {
        "id": "DEV_002",
        "name": "Smart Valve",
        "type": "actuator",
        "model": "ValveControl 2000",
        "firmware_version": "2.1.0",
        "location": "Building B - Floor 2",
        "status": "active",
        "last_seen": datetime.now().isoformat(),
        "battery_level": 92,
        "signal_strength": -38,
        "company_id": "acme_corp"
    }
    
    GATEWAY_DEVICE = {
        "id": "DEV_003",
        "name": "IoT Gateway",
        "type": "gateway",
        "model": "Gateway Hub X1",
        "firmware_version": "3.0.1",
        "location": "Data Center",
        "status": "active",
        "last_seen": datetime.now().isoformat(),
        "battery_level": None,  # Powered device
        "signal_strength": -25,
        "company_id": "acme_corp"
    }
    
    OFFLINE_DEVICE = {
        "id": "DEV_004",
        "name": "Offline Sensor",
        "type": "sensor",
        "model": "TempSense Basic",
        "firmware_version": "1.0.0",
        "location": "Building C - Floor 3",
        "status": "offline",
        "last_seen": (datetime.now() - timedelta(hours=2)).isoformat(),
        "battery_level": 15,
        "signal_strength": None,
        "company_id": "tech_solutions"
    }

class TestDeviceGenerator:
    """Dynamic test device generator."""
    
    def __init__(self):
        self.fake = Faker()
        self.device_counter = 1000
    
    def generate_device(self, device_type="sensor", status="active", company_id=None):
        """Generate a test device."""
        self.device_counter += 1
        
        device_data = {
            "id": f"DEV_{self.device_counter}",
            "name": f"Test {device_type.title()} {self.device_counter}",
            "type": device_type,
            "model": self._generate_model_name(device_type),
            "firmware_version": self._generate_firmware_version(),
            "location": self._generate_location(),
            "status": status,
            "last_seen": self._generate_last_seen(status),
            "battery_level": self._generate_battery_level(device_type),
            "signal_strength": self._generate_signal_strength(status),
            "company_id": company_id or "test_company",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        return device_data
    
    def _generate_model_name(self, device_type):
        """Generate a device model name."""
        models = {
            "sensor": ["SensorPro", "SmartSense", "TempTracker", "DataCollector"],
            "actuator": ["ActuatorX", "SmartControl", "AutoSwitch", "FlowMaster"],
            "gateway": ["Gateway Pro", "Hub Master", "DataBridge", "ConnectPoint"]
        }
        return f"{random.choice(models.get(device_type, ['Device']))} {random.randint(100, 999)}"
    
    def _generate_firmware_version(self):
        """Generate a firmware version."""
        major = random.randint(1, 5)
        minor = random.randint(0, 9)
        patch = random.randint(0, 9)
        return f"{major}.{minor}.{patch}"
    
    def _generate_location(self):
        """Generate a device location."""
        buildings = ["Building A", "Building B", "Building C", "Warehouse", "Data Center"]
        floors = ["Floor 1", "Floor 2", "Floor 3", "Basement", "Rooftop"]
        return f"{random.choice(buildings)} - {random.choice(floors)}"
    
    def _generate_last_seen(self, status):
        """Generate last seen timestamp based on status."""
        if status == "active":
            return datetime.now().isoformat()
        elif status == "offline":
            return (datetime.now() - timedelta(hours=random.randint(1, 24))).isoformat()
        else:
            return (datetime.now() - timedelta(minutes=random.randint(1, 60))).isoformat()
    
    def _generate_battery_level(self, device_type):
        """Generate battery level (None for powered devices)."""
        if device_type == "gateway":
            return None  # Gateways are usually powered
        return random.randint(10, 100)
    
    def _generate_signal_strength(self, status):
        """Generate signal strength based on status."""
        if status == "offline":
            return None
        return random.randint(-80, -20)

# Pre-generated test datasets
TEST_USER_DATASETS = {
    "valid_users": [TestUsers.ADMIN, TestUsers.COMPANY_MANAGER, TestUsers.CONSUMER],
    "invalid_users": [TestUsers.INVALID_EMAIL, TestUsers.INVALID_PASSWORD, TestUsers.EMPTY_FIELDS],
    "companies": [TestCompanies.ACME_CORP, TestCompanies.TECH_SOLUTIONS, TestCompanies.STARTUP_CO],
    "devices": [TestDevices.SENSOR_DEVICE, TestDevices.ACTUATOR_DEVICE, TestDevices.GATEWAY_DEVICE, TestDevices.OFFLINE_DEVICE]
}

# Utility functions
def get_user_by_role(role):
    """Get test user by role."""
    role_mapping = {
        "admin": TestUsers.ADMIN,
        "company": TestUsers.COMPANY_MANAGER,
        "consumer": TestUsers.CONSUMER
    }
    return role_mapping.get(role)

def get_all_valid_users():
    """Get all valid test users."""
    return [TestUsers.ADMIN, TestUsers.COMPANY_MANAGER, TestUsers.CONSUMER]

def get_all_invalid_users():
    """Get all invalid test users."""
    return [TestUsers.INVALID_EMAIL, TestUsers.INVALID_PASSWORD, TestUsers.EMPTY_FIELDS]
