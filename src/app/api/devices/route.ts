/**
 * Dummy Devices API endpoint
 * Returns mock device data for testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/lib/auth-middleware';

// Dummy device data
const DUMMY_DEVICES = [
  {
    id: 'dev-001',
    name: 'Temperature Sensor 01',
    type: 'temperature',
    status: 'online',
    location: 'Warehouse A',
    lastSeen: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    batteryLevel: 85,
    data: {
      temperature: 22.5,
      humidity: null,
      motion: null,
      airQuality: null
    },
    metadata: {
      firmwareVersion: '1.2.3',
      hardwareRevision: 'A1',
      manufacturer: 'IoT Sensors Inc.',
      installDate: '2024-01-15T00:00:00.000Z'
    }
  },
  {
    id: 'dev-002',
    name: 'Humidity Monitor 01',
    type: 'humidity',
    status: 'online',
    location: 'Warehouse A',
    lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    batteryLevel: 72,
    data: {
      temperature: null,
      humidity: 65.2,
      motion: null,
      airQuality: null
    },
    metadata: {
      firmwareVersion: '1.1.8',
      hardwareRevision: 'B2',
      manufacturer: 'IoT Sensors Inc.',
      installDate: '2024-01-20T00:00:00.000Z'
    }
  },
  {
    id: 'dev-003',
    name: 'Motion Detector 01',
    type: 'motion',
    status: 'warning',
    location: 'Office Building',
    lastSeen: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    batteryLevel: 23,
    data: {
      temperature: null,
      humidity: null,
      motion: true,
      airQuality: null
    },
    metadata: {
      firmwareVersion: '2.0.1',
      hardwareRevision: 'C1',
      manufacturer: 'SecureMotion Ltd.',
      installDate: '2024-02-01T00:00:00.000Z'
    }
  },
  {
    id: 'dev-004',
    name: 'Air Quality Monitor',
    type: 'air_quality',
    status: 'offline',
    location: 'Factory Floor',
    lastSeen: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    batteryLevel: 0,
    data: {
      temperature: null,
      humidity: null,
      motion: null,
      airQuality: 45 // PM2.5 level
    },
    metadata: {
      firmwareVersion: '1.0.5',
      hardwareRevision: 'A3',
      manufacturer: 'AirTech Solutions',
      installDate: '2024-01-25T00:00:00.000Z'
    }
  }
];

export async function GET(request: NextRequest) {
  // Authenticate the request
  const auth = await AuthMiddleware.authenticate(request);
  
  if (!auth.success) {
    return NextResponse.json(
      { 
        message: auth.error || 'Authentication required',
        error: 'UNAUTHORIZED'
      },
      { status: 401 }
    );
  }

  try {
    // Get query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const location = url.searchParams.get('location');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Filter devices based on query parameters
    let filteredDevices = [...DUMMY_DEVICES];

    if (status) {
      filteredDevices = filteredDevices.filter(device => device.status === status);
    }

    if (type) {
      filteredDevices = filteredDevices.filter(device => device.type === type);
    }

    if (location) {
      filteredDevices = filteredDevices.filter(device => 
        device.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Implement pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDevices = filteredDevices.slice(startIndex, endIndex);

    // Add user context (for role-based filtering in real implementation)
    const userRole = auth.user?.role;
    const userCompanyId = auth.user?.companyId;

    // In a real implementation, filter devices based on user's company/permissions
    // For now, return all devices for demo purposes

    return NextResponse.json({
      devices: paginatedDevices,
      pagination: {
        page,
        limit,
        total: filteredDevices.length,
        totalPages: Math.ceil(filteredDevices.length / limit),
        hasNext: endIndex < filteredDevices.length,
        hasPrev: page > 1
      },
      filters: {
        status,
        type,
        location
      },
      meta: {
        userRole,
        userCompanyId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Devices API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Authenticate the request
  const auth = await AuthMiddleware.authenticate(request);
  
  if (!auth.success) {
    return NextResponse.json(
      { 
        message: auth.error || 'Authentication required',
        error: 'UNAUTHORIZED'
      },
      { status: 401 }
    );
  }

  // Check if user has device creation permissions
  const userRole = auth.user?.role;
  if (!['admin', 'company'].includes(userRole || '')) {
    return NextResponse.json(
      { 
        message: 'Insufficient permissions to create devices',
        error: 'FORBIDDEN'
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, type, location } = body;
    if (!name || !type || !location) {
      return NextResponse.json(
        { 
          message: 'Missing required fields: name, type, location',
          error: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Create new device (dummy implementation)
    const newDevice = {
      id: `dev-${Date.now()}`,
      name,
      type,
      status: 'offline', // New devices start offline
      location,
      lastSeen: null,
      batteryLevel: 100, // New devices start with full battery
      data: {
        temperature: null,
        humidity: null,
        motion: null,
        airQuality: null
      },
      metadata: {
        firmwareVersion: '1.0.0',
        hardwareRevision: 'A1',
        manufacturer: body.manufacturer || 'Unknown',
        installDate: new Date().toISOString()
      }
    };

    console.log(`New device created by ${auth.user?.email}:`, newDevice);

    return NextResponse.json({
      message: 'Device created successfully',
      device: newDevice
    }, { status: 201 });

  } catch (error) {
    console.error('Device creation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
