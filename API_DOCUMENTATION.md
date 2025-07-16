# IoT Platform API Documentation

## Overview

This document provides comprehensive API documentation for the IoT Platform - a Next.js 15 application built with TypeScript, featuring authentication, device management, analytics, automation, and administrative capabilities.

**Version:** 0.1.0  
**Framework:** Next.js 15.3.5  
**Runtime:** Node.js with TypeScript  
**Database:** Mock data with future database integration support  
**Authentication:** JWT-based authentication with refresh tokens  

## Table of Contents

1. [Authentication](#authentication)
2. [Device Management](#device-management)
3. [Analytics](#analytics)
4. [Automation](#automation)
5. [User Management](#user-management)
6. [Billing](#billing)
7. [Admin Panel](#admin-panel)
8. [System APIs](#system-apis)
9. [WebSocket & Real-time](#websocket--real-time)
10. [Error Handling](#error-handling)
11. [Rate Limiting](#rate-limiting)
12. [Data Models](#data-models)

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

### Login
**POST** `/auth/login`

Authenticate a user and return access tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123!",
  "rememberMe": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-001",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "admin",
      "permissions": ["*"],
      "avatar": "/avatars/user.jpg",
      "isActive": true,
      "emailVerified": true,
      "twoFactorEnabled": false
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresAt": 1640995200000,
      "tokenType": "Bearer"
    }
  },
  "message": "Login successful"
}
```

**Error Responses:**
- `401`: Invalid credentials
- `403`: Account locked or disabled
- `429`: Too many login attempts

### Register
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123!",
  "confirmPassword": "securePassword123!",
  "name": "Jane Smith",
  "role": "consumer",
  "companyName": "Optional Company Name",
  "acceptTerms": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-002",
      "email": "newuser@example.com",
      "name": "Jane Smith",
      "role": "consumer",
      "permissions": ["devices", "profile"],
      "isActive": true,
      "emailVerified": false
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresAt": 1640995200000,
      "tokenType": "Bearer"
    }
  },
  "message": "Registration successful"
}
```

### Refresh Token
**POST** `/auth/refresh`

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "new_access_token",
      "refreshToken": "new_refresh_token",
      "expiresAt": 1640995200000,
      "tokenType": "Bearer"
    }
  }
}
```

### Logout
**POST** `/auth/logout`

Logout user and invalidate tokens.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Get Profile
**GET** `/auth/profile`

Get current user profile information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-001",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "admin",
      "permissions": ["*"],
      "avatar": "/avatars/user.jpg",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-07-09T00:00:00Z",
      "lastLoginAt": "2024-07-08T15:30:00Z",
      "isActive": true,
      "emailVerified": true,
      "twoFactorEnabled": false
    }
  }
}
```

### Update Profile
**PATCH** `/auth/profile`

Update user profile information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "newemail@example.com",
  "avatar": "/avatars/new-avatar.jpg"
}
```

### Change Password
**PUT** `/auth/change-password`

Change user password.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123!",
  "newPassword": "newPassword456!",
  "confirmPassword": "newPassword456!"
}
```

### Forgot Password
**POST** `/auth/forgot-password`

Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### Reset Password
**POST** `/auth/reset-password`

Reset password using reset token.

**Request Body:**
```json
{
  "token": "reset_token_here",
  "password": "newPassword123!",
  "confirmPassword": "newPassword123!"
}
```

## Device Management

### Get All Devices
**GET** `/devices`

Retrieve all devices for the authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status`: Filter by device status (online, offline, error, maintenance)
- `type`: Filter by device type (temperature, humidity, motion, etc.)
- `location`: Filter by device location
- `page`: Page number for pagination (default: 1)
- `limit`: Number of devices per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "dev-001",
      "name": "Temperature Sensor 01",
      "type": "temperature",
      "status": "online",
      "location": "Warehouse A",
      "lastSeen": "2024-07-16T10:30:00Z",
      "batteryLevel": 85,
      "data": {
        "temperature": 22.5,
        "humidity": null,
        "motion": null,
        "airQuality": null
      },
      "metadata": {
        "firmwareVersion": "1.2.3",
        "hardwareRevision": "A1",
        "manufacturer": "IoT Sensors Inc.",
        "installDate": "2024-01-15T00:00:00Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Create Device
**POST** `/devices`

Create a new device.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "New Temperature Sensor",
  "type": "temperature",
  "location": "Office Building",
  "serialNumber": "TS-2024-001",
  "manufacturer": "IoT Sensors Inc.",
  "model": "TS-Pro-X1",
  "configuration": {
    "sampleRate": 60,
    "threshold": 25.0
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "device": {
      "id": "dev-026",
      "name": "New Temperature Sensor",
      "type": "temperature",
      "status": "offline",
      "location": "Office Building",
      "createdAt": "2024-07-16T10:30:00Z",
      "updatedAt": "2024-07-16T10:30:00Z"
    }
  },
  "message": "Device created successfully"
}
```

### Get Device by ID
**GET** `/devices/{id}`

Retrieve a specific device by ID.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
- `id`: Device ID

**Response:**
```json
{
  "success": true,
  "data": {
    "device": {
      "id": "dev-001",
      "name": "Temperature Sensor 01",
      "type": "temperature",
      "status": "online",
      "location": "Warehouse A",
      "lastSeen": "2024-07-16T10:30:00Z",
      "batteryLevel": 85,
      "telemetry": {
        "temperature": 22.5,
        "humidity": 45.2,
        "lastUpdate": "2024-07-16T10:30:00Z"
      },
      "configuration": {
        "sampleRate": 60,
        "alertThreshold": 30.0,
        "autoRestart": true
      },
      "metadata": {
        "firmwareVersion": "1.2.3",
        "hardwareRevision": "A1",
        "manufacturer": "IoT Sensors Inc.",
        "installDate": "2024-01-15T00:00:00Z"
      }
    }
  }
}
```

### Update Device
**PUT** `/devices/{id}`

Update device information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
- `id`: Device ID

**Request Body:**
```json
{
  "name": "Updated Temperature Sensor",
  "location": "New Location",
  "configuration": {
    "sampleRate": 30,
    "alertThreshold": 35.0
  }
}
```

### Delete Device
**DELETE** `/devices/{id}`

Delete a device.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
- `id`: Device ID

**Response:**
```json
{
  "success": true,
  "message": "Device deleted successfully"
}
```

### Control Device
**POST** `/devices/{id}/control`

Send control commands to a device.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
- `id`: Device ID

**Request Body:**
```json
{
  "command": "start",
  "parameters": {
    "temperature": 25.0,
    "mode": "auto"
  }
}
```

**Available Commands:**
- `start`: Start device operation
- `stop`: Stop device operation
- `restart`: Restart device
- `emergency_stop`: Emergency stop
- `turn_on`: Turn device on
- `turn_off`: Turn device off
- `set_temperature`: Set temperature (for applicable devices)
- `configure`: Update device configuration

**Response:**
```json
{
  "success": true,
  "data": {
    "device": {
      "id": "dev-001",
      "name": "Temperature Sensor 01",
      "status": "online",
      "isActive": true,
      "lastSeen": "2024-07-16T10:30:00Z"
    }
  },
  "message": "Device command executed successfully"
}
```

### Bulk Device Operations
**POST** `/devices/bulk`

Perform bulk operations on multiple devices.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "deviceIds": ["dev-001", "dev-002", "dev-003"],
  "operation": "start"
}
```

**Available Operations:**
- `start`: Start all devices
- `stop`: Stop all devices
- `restart`: Restart all devices
- `maintenance`: Set devices to maintenance mode

**Response:**
```json
{
  "success": true,
  "data": {
    "updatedDevices": [
      {
        "id": "dev-001",
        "status": "online",
        "isActive": true
      },
      {
        "id": "dev-002",
        "status": "online",
        "isActive": true
      }
    ],
    "failedDevices": [
      {
        "id": "dev-003",
        "error": "Device not found"
      }
    ]
  },
  "message": "Bulk operation completed for 2 of 3 devices"
}
```

### Device History
**GET** `/devices/{id}/history`

Get device historical data.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
- `id`: Device ID

**Query Parameters:**
- `from`: Start date (ISO 8601)
- `to`: End date (ISO 8601)
- `metric`: Specific metric to retrieve
- `limit`: Number of records (default: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2024-07-16T10:30:00Z",
      "temperature": 22.5,
      "humidity": 45.2,
      "batteryLevel": 85
    },
    {
      "timestamp": "2024-07-16T10:29:00Z",
      "temperature": 22.3,
      "humidity": 45.1,
      "batteryLevel": 85
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 2440
  }
}
```

## Analytics

### Get Analytics
**GET** `/analytics/energy`

Get energy consumption analytics.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `deviceId`: Filter by specific device
- `from`: Start date (ISO 8601)
- `to`: End date (ISO 8601)
- `interval`: Data aggregation interval (hour, day, week, month)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalConsumption": 1250.5,
    "averageConsumption": 125.05,
    "peakConsumption": 245.2,
    "unit": "kWh",
    "timeSeries": [
      {
        "timestamp": "2024-07-16T10:00:00Z",
        "consumption": 125.5,
        "cost": 12.55
      }
    ]
  }
}
```

### Get Usage Analytics
**GET** `/analytics/usage`

Get device usage analytics.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDevices": 45,
    "activeDevices": 38,
    "offlineDevices": 7,
    "devicesByType": {
      "temperature": 15,
      "humidity": 12,
      "motion": 8,
      "light": 10
    },
    "utilizationRate": 84.4,
    "uptimePercentage": 99.2
  }
}
```

### Get Trends
**GET** `/analytics/trends`

Get analytics trends and insights.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `period`: Time period (7d, 30d, 90d, 1y)
- `metric`: Specific metric to analyze

**Response:**
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "metric": "energy_consumption",
        "trend": "increasing",
        "percentage": 12.5,
        "period": "30d"
      },
      {
        "metric": "device_uptime",
        "trend": "stable",
        "percentage": 0.2,
        "period": "30d"
      }
    ],
    "insights": [
      {
        "type": "recommendation",
        "title": "Energy Optimization",
        "description": "Consider scheduling devices during off-peak hours",
        "impact": "high"
      }
    ]
  }
}
```

### Export Analytics
**GET** `/analytics/export`

Export analytics data.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `format`: Export format (csv, xlsx, json)
- `from`: Start date
- `to`: End date
- `deviceIds`: Comma-separated device IDs

**Response:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://api.example.com/downloads/analytics-export-123.csv",
    "expiresAt": "2024-07-16T11:30:00Z"
  }
}
```

## Automation

### Get Automation Rules
**GET** `/automation/rules`

Get all automation rules.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rule-001",
      "name": "Temperature Alert",
      "description": "Alert when temperature exceeds threshold",
      "enabled": true,
      "trigger": {
        "type": "threshold",
        "deviceId": "dev-001",
        "metric": "temperature",
        "operator": "greater_than",
        "value": 30.0
      },
      "actions": [
        {
          "type": "notification",
          "settings": {
            "message": "Temperature alert: {{value}}°C",
            "channels": ["email", "push"]
          }
        },
        {
          "type": "device_control",
          "settings": {
            "deviceId": "dev-002",
            "command": "turn_on"
          }
        }
      ],
      "triggerCount": 5,
      "createdAt": "2024-07-01T00:00:00Z",
      "updatedAt": "2024-07-16T10:30:00Z"
    }
  ]
}
```

### Create Automation Rule
**POST** `/automation/rules`

Create a new automation rule.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Low Battery Alert",
  "description": "Alert when device battery is low",
  "enabled": true,
  "trigger": {
    "type": "threshold",
    "deviceId": "dev-001",
    "metric": "batteryLevel",
    "operator": "less_than",
    "value": 20
  },
  "actions": [
    {
      "type": "notification",
      "settings": {
        "message": "Low battery: {{deviceName}} - {{value}}%",
        "channels": ["email"]
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rule": {
      "id": "rule-002",
      "name": "Low Battery Alert",
      "description": "Alert when device battery is low",
      "enabled": true,
      "trigger": {
        "type": "threshold",
        "deviceId": "dev-001",
        "metric": "batteryLevel",
        "operator": "less_than",
        "value": 20
      },
      "actions": [
        {
          "type": "notification",
          "settings": {
            "message": "Low battery: {{deviceName}} - {{value}}%",
            "channels": ["email"]
          }
        }
      ],
      "triggerCount": 0,
      "createdAt": "2024-07-16T10:30:00Z",
      "updatedAt": "2024-07-16T10:30:00Z"
    }
  },
  "message": "Automation rule created successfully"
}
```

### Update Automation Rule
**PUT** `/automation/rules/{id}`

Update an existing automation rule.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
- `id`: Rule ID

**Request Body:**
```json
{
  "name": "Updated Rule Name",
  "enabled": false,
  "trigger": {
    "value": 25
  }
}
```

### Delete Automation Rule
**DELETE** `/automation/rules/{id}`

Delete an automation rule.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
- `id`: Rule ID

**Response:**
```json
{
  "success": true,
  "message": "Automation rule deleted successfully"
}
```

### Enable/Disable Rule
**POST** `/automation/rules/{id}/enable`
**POST** `/automation/rules/{id}/disable`

Enable or disable an automation rule.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
- `id`: Rule ID

**Response:**
```json
{
  "success": true,
  "data": {
    "rule": {
      "id": "rule-001",
      "enabled": true
    }
  },
  "message": "Rule enabled successfully"
}
```

### Get Schedules
**GET** `/automation/schedules`

Get all scheduled automations.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "schedule-001",
      "name": "Daily Startup",
      "description": "Turn on all devices at 8 AM",
      "enabled": true,
      "schedule": {
        "type": "recurring",
        "pattern": "daily",
        "time": "08:00",
        "timezone": "UTC"
      },
      "actions": [
        {
          "type": "device_control",
          "settings": {
            "deviceIds": ["dev-001", "dev-002"],
            "command": "turn_on"
          }
        }
      ]
    }
  ]
}
```

## User Management

### Get Users (Admin Only)
**GET** `/admin/users`

Get all users (admin access required).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `role`: Filter by user role (admin, company, consumer)
- `status`: Filter by user status (active, inactive, suspended)
- `page`: Page number
- `limit`: Number of users per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-001",
      "email": "admin@example.com",
      "name": "System Administrator",
      "role": "admin",
      "isActive": true,
      "emailVerified": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "lastLoginAt": "2024-07-16T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Get User by ID (Admin Only)
**GET** `/admin/users/{id}`

Get specific user details.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
- `id`: User ID

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-001",
      "email": "admin@example.com",
      "name": "System Administrator",
      "role": "admin",
      "permissions": ["*"],
      "isActive": true,
      "emailVerified": true,
      "twoFactorEnabled": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-07-16T10:30:00Z",
      "lastLoginAt": "2024-07-16T10:30:00Z",
      "loginCount": 245,
      "devices": 12,
      "sessions": [
        {
          "id": "session-001",
          "ipAddress": "192.168.1.100",
          "userAgent": "Mozilla/5.0...",
          "lastActivity": "2024-07-16T10:30:00Z",
          "isActive": true
        }
      ]
    }
  }
}
```

### Update User (Admin Only)
**PUT** `/admin/users/{id}`

Update user information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
- `id`: User ID

**Request Body:**
```json
{
  "name": "Updated Name",
  "role": "company",
  "isActive": false,
  "permissions": ["devices", "analytics"]
}
```

### Delete User (Admin Only)
**DELETE** `/admin/users/{id}`

Delete a user account.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
- `id`: User ID

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Billing

### Get Billing Usage
**GET** `/billing/usage`

Get current billing usage information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "currentPeriod": {
      "start": "2024-07-01T00:00:00Z",
      "end": "2024-07-31T23:59:59Z"
    },
    "usage": {
      "devices": 25,
      "dataStorage": 2.8,
      "apiCalls": 245000,
      "bandwidth": 15.5
    },
    "limits": {
      "devices": 50,
      "dataStorage": 10.0,
      "apiCalls": 1000000,
      "bandwidth": 100.0
    },
    "costs": {
      "devices": 125.00,
      "dataStorage": 14.00,
      "apiCalls": 24.50,
      "bandwidth": 15.50,
      "total": 179.00
    },
    "currency": "USD"
  }
}
```

### Get Billing Plans
**GET** `/billing/plans`

Get available billing plans.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "starter",
      "name": "Starter Plan",
      "price": 99.00,
      "currency": "USD",
      "billing": "monthly",
      "features": {
        "devices": 10,
        "dataStorage": 1.0,
        "apiCalls": 100000,
        "support": "email"
      }
    },
    {
      "id": "professional",
      "name": "Professional Plan",
      "price": 299.00,
      "currency": "USD",
      "billing": "monthly",
      "features": {
        "devices": 50,
        "dataStorage": 10.0,
        "apiCalls": 1000000,
        "support": "priority"
      }
    },
    {
      "id": "enterprise",
      "name": "Enterprise Plan",
      "price": 999.00,
      "currency": "USD",
      "billing": "monthly",
      "features": {
        "devices": "unlimited",
        "dataStorage": "unlimited",
        "apiCalls": "unlimited",
        "support": "dedicated"
      }
    }
  ]
}
```

### Get Invoices
**GET** `/billing/invoices`

Get billing invoices.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status`: Filter by invoice status (paid, unpaid, overdue)
- `from`: Start date
- `to`: End date
- `page`: Page number
- `limit`: Number of invoices per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "inv-001",
      "invoiceNumber": "INV-2024-001",
      "amount": 299.00,
      "currency": "USD",
      "status": "paid",
      "issueDate": "2024-07-01T00:00:00Z",
      "dueDate": "2024-07-31T23:59:59Z",
      "paidAt": "2024-07-05T10:30:00Z",
      "items": [
        {
          "description": "Professional Plan - July 2024",
          "quantity": 1,
          "unitPrice": 299.00,
          "total": 299.00
        }
      ],
      "downloadUrl": "https://api.example.com/invoices/inv-001.pdf"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12
  }
}
```

### Get Invoice by ID
**GET** `/billing/invoices/{id}`

Get specific invoice details.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
- `id`: Invoice ID

**Response:**
```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": "inv-001",
      "invoiceNumber": "INV-2024-001",
      "amount": 299.00,
      "currency": "USD",
      "status": "paid",
      "issueDate": "2024-07-01T00:00:00Z",
      "dueDate": "2024-07-31T23:59:59Z",
      "paidAt": "2024-07-05T10:30:00Z",
      "items": [
        {
          "description": "Professional Plan - July 2024",
          "quantity": 1,
          "unitPrice": 299.00,
          "total": 299.00
        }
      ],
      "taxes": [
        {
          "description": "VAT (20%)",
          "amount": 59.80
        }
      ],
      "subtotal": 299.00,
      "taxTotal": 59.80,
      "total": 358.80,
      "downloadUrl": "https://api.example.com/invoices/inv-001.pdf"
    }
  }
}
```

### Get Payment Methods
**GET** `/billing/payment-methods`

Get saved payment methods.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pm-001",
      "type": "card",
      "brand": "visa",
      "last4": "4242",
      "expiryMonth": 12,
      "expiryYear": 2025,
      "isDefault": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Add Payment Method
**POST** `/billing/payment-methods`

Add a new payment method.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "type": "card",
  "cardNumber": "4242424242424242",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "cvv": "123",
  "holderName": "John Doe",
  "billingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  },
  "setAsDefault": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentMethod": {
      "id": "pm-002",
      "type": "card",
      "brand": "visa",
      "last4": "4242",
      "expiryMonth": 12,
      "expiryYear": 2025,
      "isDefault": true,
      "createdAt": "2024-07-16T10:30:00Z"
    }
  },
  "message": "Payment method added successfully"
}
```

### Process Payment
**POST** `/billing/process-payment`

Process a payment.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "paymentMethodId": "pm-001",
  "amount": 299.00,
  "currency": "USD",
  "description": "Professional Plan - July 2024"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "pay-001",
      "amount": 299.00,
      "currency": "USD",
      "status": "succeeded",
      "transactionId": "txn-123456",
      "processedAt": "2024-07-16T10:30:00Z"
    }
  },
  "message": "Payment processed successfully"
}
```

## Admin Panel

### Get System Analytics
**GET** `/admin/analytics`

Get system-wide analytics (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 1250,
      "activeUsers": 1100,
      "totalDevices": 15420,
      "onlineDevices": 13890,
      "totalRevenue": 125000.00,
      "monthlyRevenue": 45000.00
    },
    "userGrowth": [
      {
        "date": "2024-07-01",
        "users": 1200,
        "newUsers": 25
      }
    ],
    "deviceMetrics": {
      "uptime": 99.2,
      "averageResponseTime": 150,
      "errorRate": 0.3
    },
    "resourceUsage": {
      "cpu": 65.5,
      "memory": 78.2,
      "storage": 45.8,
      "bandwidth": 123.5
    }
  }
}
```

### Get System Settings
**GET** `/admin/settings`

Get system settings (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "general": {
      "siteName": "IoT Platform",
      "siteUrl": "https://iot-platform.com",
      "maintenanceMode": false,
      "registrationEnabled": true
    },
    "security": {
      "passwordPolicy": {
        "minLength": 8,
        "requireUppercase": true,
        "requireLowercase": true,
        "requireNumbers": true,
        "requireSpecialChars": true
      },
      "sessionTimeout": 3600,
      "maxLoginAttempts": 5,
      "lockoutDuration": 1800
    },
    "notifications": {
      "emailEnabled": true,
      "smsEnabled": false,
      "pushEnabled": true
    },
    "billing": {
      "currency": "USD",
      "taxRate": 0.08,
      "invoicePrefix": "INV-"
    }
  }
}
```

### Update System Settings
**PUT** `/admin/settings`

Update system settings (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "general": {
    "siteName": "Updated IoT Platform",
    "maintenanceMode": true
  },
  "security": {
    "sessionTimeout": 7200,
    "maxLoginAttempts": 3
  }
}
```

### Get Audit Logs
**GET** `/admin/audit`

Get audit logs (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `userId`: Filter by user ID
- `action`: Filter by action type
- `resource`: Filter by resource type
- `from`: Start date
- `to`: End date
- `page`: Page number
- `limit`: Number of logs per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "audit-001",
      "userId": "user-001",
      "userName": "John Doe",
      "action": "CREATE",
      "resource": "device",
      "resourceId": "dev-001",
      "details": {
        "deviceName": "New Temperature Sensor",
        "deviceType": "temperature"
      },
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2024-07-16T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 2500
  }
}
```

### Get System Logs
**GET** `/admin/logs`

Get system logs (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `level`: Filter by log level (debug, info, warn, error)
- `service`: Filter by service name
- `from`: Start date
- `to`: End date
- `page`: Page number
- `limit`: Number of logs per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "log-001",
      "level": "info",
      "service": "auth",
      "message": "User logged in successfully",
      "details": {
        "userId": "user-001",
        "ipAddress": "192.168.1.100"
      },
      "timestamp": "2024-07-16T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 50000
  }
}
```

## System APIs

### Health Check
**GET** `/health`

Check system health status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-07-16T10:30:00Z",
    "uptime": 86400,
    "version": "0.1.0",
    "services": {
      "database": "healthy",
      "cache": "healthy",
      "queue": "healthy",
      "storage": "healthy"
    },
    "metrics": {
      "cpu": 45.2,
      "memory": 67.8,
      "disk": 23.5
    }
  }
}
```

### System Info
**GET** `/info`

Get system information.

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "IoT Platform",
    "version": "0.1.0",
    "environment": "production",
    "buildDate": "2024-07-16T00:00:00Z",
    "node": {
      "version": "18.17.0",
      "platform": "linux",
      "arch": "x64"
    },
    "dependencies": {
      "next": "15.3.5",
      "react": "19.0.0",
      "typescript": "5.0.0"
    }
  }
}
```

### System Version
**GET** `/version`

Get API version information.

**Response:**
```json
{
  "success": true,
  "data": {
    "version": "0.1.0",
    "apiVersion": "v1",
    "buildNumber": "1234",
    "buildDate": "2024-07-16T00:00:00Z",
    "gitCommit": "abc123def456",
    "gitBranch": "main"
  }
}
```

### System Status
**GET** `/status`

Get detailed system status.

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": "operational",
    "services": [
      {
        "name": "API",
        "status": "operational",
        "responseTime": 150,
        "uptime": 99.9
      },
      {
        "name": "Database",
        "status": "operational",
        "responseTime": 5,
        "uptime": 99.8
      },
      {
        "name": "Cache",
        "status": "degraded",
        "responseTime": 300,
        "uptime": 98.5
      }
    ],
    "incidents": [
      {
        "id": "inc-001",
        "title": "Cache Performance Issues",
        "status": "investigating",
        "created": "2024-07-16T09:00:00Z",
        "updated": "2024-07-16T10:00:00Z"
      }
    ]
  }
}
```

## WebSocket & Real-time

### WebSocket Connection
**WebSocket** `/ws`

Connect to real-time WebSocket for live updates.

**Connection URL:**
```
ws://localhost:3000/ws?token=<access_token>
```

**Message Format:**
```json
{
  "type": "subscribe",
  "channel": "device_updates",
  "deviceId": "dev-001"
}
```

**Supported Channels:**
- `device_updates`: Device status and telemetry updates
- `alerts`: Real-time alerts and notifications
- `system_status`: System health and status updates
- `user_activity`: User activity updates (admin only)

**Example Messages:**

**Device Update:**
```json
{
  "type": "device_update",
  "data": {
    "deviceId": "dev-001",
    "status": "online",
    "telemetry": {
      "temperature": 23.5,
      "humidity": 45.2,
      "timestamp": "2024-07-16T10:30:00Z"
    }
  }
}
```

**Alert:**
```json
{
  "type": "alert",
  "data": {
    "id": "alert-001",
    "deviceId": "dev-001",
    "type": "critical",
    "message": "Temperature threshold exceeded",
    "timestamp": "2024-07-16T10:30:00Z"
  }
}
```

### MQTT Integration
**MQTT** Topic Structure

**Device Telemetry:**
```
iot/devices/{device_id}/telemetry
```

**Device Commands:**
```
iot/devices/{device_id}/commands
```

**Device Status:**
```
iot/devices/{device_id}/status
```

**System Events:**
```
iot/system/events
```

## Error Handling

### Error Response Format
All API errors follow this standardized format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "constraint": "Email format is invalid"
    }
  },
  "timestamp": "2024-07-16T10:30:00Z",
  "requestId": "req-123456"
}
```

### HTTP Status Codes

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **422 Unprocessable Entity**: Validation error
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error
- **503 Service Unavailable**: Service temporarily unavailable

### Common Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_REQUIRED`: Authentication token required
- `INVALID_TOKEN`: Invalid or expired token
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `RESOURCE_NOT_FOUND`: Requested resource not found
- `RESOURCE_ALREADY_EXISTS`: Resource already exists
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded
- `DEVICE_OFFLINE`: Device is offline
- `DEVICE_UNREACHABLE`: Device cannot be reached
- `PAYMENT_REQUIRED`: Payment required to access feature
- `MAINTENANCE_MODE`: System is in maintenance mode

## Rate Limiting

### Rate Limits by Endpoint

- **Authentication**: 5 requests per minute per IP
- **Device Operations**: 100 requests per minute per user
- **Analytics**: 60 requests per minute per user
- **General API**: 1000 requests per hour per user

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-Window: 60
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again later.",
    "details": {
      "limit": 100,
      "remaining": 0,
      "resetAt": "2024-07-16T10:31:00Z"
    }
  }
}
```

## Data Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'company' | 'consumer';
  companyId?: string;
  permissions: string[];
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  emailVerified: boolean;
  twoFactorEnabled?: boolean;
}
```

### Device Model
```typescript
interface Device {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'motion' | 'light' | 'thermostat' | 'camera' | 'gateway' | 'custom';
  status: 'online' | 'offline' | 'error' | 'warning' | 'maintenance';
  location: string;
  lastSeen?: string;
  batteryLevel?: number;
  signalStrength?: number;
  telemetry?: Record<string, any>;
  configuration: Record<string, any>;
  metadata: {
    manufacturer?: string;
    model?: string;
    firmwareVersion?: string;
    hardwareVersion?: string;
    serialNumber?: string;
    installDate?: string;
  };
  userId: string;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Analytics Model
```typescript
interface Analytics {
  id: string;
  timestamp: string;
  deviceId: string;
  metric: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
}
```

### Automation Rule Model
```typescript
interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  trigger: {
    type: 'threshold' | 'schedule' | 'event';
    deviceId?: string;
    metric?: string;
    operator?: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
    value?: any;
    schedule?: string;
    event?: string;
  };
  actions: Array<{
    type: 'notification' | 'device_control' | 'webhook';
    settings: Record<string, any>;
  }>;
  triggerCount: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}
```

### Alert Model
```typescript
interface Alert {
  id: string;
  deviceId: string;
  deviceName: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  metadata?: Record<string, any>;
}
```

### Invoice Model
```typescript
interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  taxes: Array<{
    description: string;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  taxTotal: number;
  total: number;
  userId: string;
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

## SDK Examples

### JavaScript/TypeScript SDK Usage

```typescript
import { ApiClient } from './lib/api';

// Initialize API client
const apiClient = new ApiClient({
  baseURL: 'http://localhost:3000/api',
  timeout: 5000
});

// Authentication
const loginResponse = await apiClient.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

// Set authentication tokens
apiClient.setAuthTokens(
  loginResponse.data.tokens.accessToken,
  loginResponse.data.tokens.refreshToken
);

// Get devices
const devicesResponse = await apiClient.get('/devices', {
  status: 'online',
  page: 1,
  limit: 10
});

// Control device
const controlResponse = await apiClient.post('/devices/dev-001/control', {
  command: 'turn_on',
  parameters: {
    brightness: 75
  }
});

// Get analytics
const analyticsResponse = await apiClient.get('/analytics/energy', {
  from: '2024-07-01T00:00:00Z',
  to: '2024-07-16T23:59:59Z',
  deviceId: 'dev-001'
});
```

### React Hook Usage

```typescript
import { useDevices, useAnalytics } from './hooks/useApi';

function DeviceDashboard() {
  const {
    devices,
    loading,
    error,
    refreshDevices,
    controlDevice
  } = useDevices('company');

  const {
    analytics,
    loading: analyticsLoading
  } = useAnalytics('dev-001', 'temperature', 24);

  const handleDeviceControl = async (deviceId: string, command: string) => {
    const result = await controlDevice({
      deviceId,
      command,
      parameters: {}
    });
    
    if (result) {
      console.log('Device controlled successfully');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Device Dashboard</h1>
      {devices.map(device => (
        <div key={device.id}>
          <h3>{device.name}</h3>
          <p>Status: {device.status}</p>
          <button onClick={() => handleDeviceControl(device.id, 'turn_on')}>
            Turn On
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Testing

### API Testing Examples

The project includes comprehensive test coverage for all API endpoints:

```typescript
// Example test for device API
describe('Device API', () => {
  it('should get all devices', async () => {
    const response = await request(app)
      .get('/api/devices')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  it('should control device', async () => {
    const response = await request(app)
      .post('/api/devices/dev-001/control')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        command: 'turn_on',
        parameters: { brightness: 75 }
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.device.isActive).toBe(true);
  });
});
```

### Mock Data

The API uses sophisticated mock data for development and testing:

- **MockDataGenerator**: Generates realistic device data
- **MockApiService**: Simulates API calls with realistic delays
- **Automated scenarios**: Generates various device states and scenarios

## Security

### Authentication & Authorization

- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (RBAC) with granular permissions
- **Token refresh mechanism** for seamless user experience
- **Session management** with logout and session invalidation

### Security Headers

```typescript
// All API responses include security headers
{
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'"
}
```

### Input Validation

- **Zod schemas** for request validation
- **Sanitization** of user inputs
- **Parameter validation** for all endpoints
- **File upload validation** with size and type restrictions

### Rate Limiting

- **IP-based rate limiting** for authentication endpoints
- **User-based rate limiting** for API endpoints
- **Progressive delays** for failed authentication attempts
- **Configurable limits** per endpoint and user role

## Monitoring & Logging

### Audit Logging

All API actions are logged with:
- User ID and session information
- Action type and resource affected
- IP address and user agent
- Timestamp and request details
- Success/failure status

### Health Monitoring

- **Health check endpoints** for system monitoring
- **Performance metrics** collection
- **Error tracking** and alerting
- **Uptime monitoring** for critical services

### Analytics & Reporting

- **Usage analytics** for API endpoints
- **Performance metrics** and response times
- **Error rate monitoring**
- **User activity tracking**

## Future Enhancements

### Planned Features

1. **GraphQL API**: Alternative to REST for more flexible queries
2. **Batch Operations**: Bulk operations for multiple resources
3. **Webhook Support**: Real-time notifications to external systems
4. **API Versioning**: Support for multiple API versions
5. **Enhanced Analytics**: Machine learning-powered insights
6. **Advanced Automation**: Complex rule engine with conditions
7. **Mobile SDK**: Native mobile app integration
8. **Third-party Integrations**: Popular IoT platforms and services

### Performance Optimizations

1. **Caching Strategy**: Redis-based caching for frequently accessed data
2. **Database Optimization**: Query optimization and indexing
3. **CDN Integration**: Static asset delivery optimization
4. **Compression**: Response compression for bandwidth efficiency
5. **Connection Pooling**: Database connection optimization

---

## Support & Contact

For API support, documentation updates, or technical questions:

- **Email**: api-support@iot-platform.com
- **Documentation**: https://docs.iot-platform.com
- **Status Page**: https://status.iot-platform.com
- **GitHub Issues**: https://github.com/your-org/iot-platform/issues

**Last Updated**: July 16, 2025  
**API Version**: 0.1.0  
**Documentation Version**: 1.0.0
