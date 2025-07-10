'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import {
  HomeIcon,
  BoltIcon,
  LightBulbIcon,
  FireIcon,
  ShieldCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChevronRightIcon,
  PowerIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';

/**
 * Consumer Dashboard - Smart Home Overview
 * User-friendly interface for home automation and energy management
 */
export default function ConsumerDashboard() {
  const { user } = useAppSelector((state) => state.auth);

  // Mock data for home dashboard
  const homeData = {
    overview: {
      temperature: 72,
      targetTemperature: 72,
      humidity: 45,
      energyUsage: 24.7, // kWh today
      monthlyCost: 142.30,
      devicesOnline: 18,
      totalDevices: 20
    },
    rooms: [
      {
        id: 'living-room',
        name: 'Living Room',
        temperature: 72,
        devices: [
          { name: 'Smart Lights', status: 'on', type: 'light' },
          { name: 'Smart TV', status: 'off', type: 'entertainment' },
          { name: 'Air Purifier', status: 'on', type: 'appliance' }
        ]
      },
      {
        id: 'bedroom',
        name: 'Bedroom',
        temperature: 70,
        devices: [
          { name: 'Bedside Lamps', status: 'off', type: 'light' },
          { name: 'Smart Speaker', status: 'on', type: 'entertainment' },
          { name: 'Sleep Tracker', status: 'on', type: 'sensor' }
        ]
      },
      {
        id: 'kitchen',
        name: 'Kitchen',
        temperature: 74,
        devices: [
          { name: 'Under Cabinet Lights', status: 'on', type: 'light' },
          { name: 'Smart Refrigerator', status: 'on', type: 'appliance' },
          { name: 'Coffee Maker', status: 'off', type: 'appliance' }
        ]
      }
    ],
    quickActions: [
      { id: 'good-night', name: 'Good Night', icon: 'moon', active: false },
      { id: 'good-morning', name: 'Good Morning', icon: 'sun', active: false },
      { id: 'away-mode', name: 'Away Mode', icon: 'shield', active: false },
      { id: 'movie-time', name: 'Movie Time', icon: 'tv', active: false }
    ],
    recentActivity: [
      {
        id: 1,
        action: 'Living room lights turned on',
        time: '2 minutes ago',
        type: 'manual'
      },
      {
        id: 2,
        action: 'Good Morning scene activated',
        time: '8:30 AM',
        type: 'automation'
      },
      {
        id: 3,
        action: 'Coffee maker scheduled for 7:00 AM',
        time: '11:45 PM',
        type: 'schedule'
      }
    ],
    energyTip: {
      title: 'Energy Saving Tip',
      message: 'Your heating is 15% more efficient when set to 68°F during sleeping hours.',
      savings: '$12/month'
    }
  };

  const QuickActionCard = ({ action }: { action: any }) => (
    <button className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all duration-200 text-left w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${action.active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} dark:bg-gray-700`}>
            {action.icon === 'moon' && <ClockIcon className="h-5 w-5" />}
            {action.icon === 'sun' && <LightBulbIcon className="h-5 w-5" />}
            {action.icon === 'shield' && <ShieldCheckIcon className="h-5 w-5" />}
            {action.icon === 'tv' && <AdjustmentsHorizontalIcon className="h-5 w-5" />}
          </div>
          <span className="font-medium text-gray-900 dark:text-white">{action.name}</span>
        </div>
        <div className={`w-3 h-3 rounded-full ${action.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
      </div>
    </button>
  );

  const RoomCard = ({ room }: { room: any }) => {
    const onlineDevices = room.devices.filter((d: any) => d.status === 'on').length;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900 dark:text-white">{room.name}</h3>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{room.temperature}°</span>
        </div>
        
        <div className="space-y-2">
          {room.devices.map((device: any, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{device.name}</span>
              <div className={`w-2 h-2 rounded-full ${device.status === 'on' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
          ))}
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {onlineDevices} of {room.devices.length} devices active
          </span>
        </div>
      </div>
    );
  };

  const StatCard = ({ 
    title, 
    value, 
    unit, 
    icon: Icon, 
    color,
    trend
  }: {
    title: string;
    value: string | number;
    unit: string;
    icon: React.ComponentType<any>;
    color: string;
    trend?: { value: string; positive: boolean };
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <div className="flex items-baseline mt-1">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
            <p className="ml-1 text-sm text-gray-500 dark:text-gray-400">{unit}</p>
          </div>
          {trend && (
            <p className={`text-xs mt-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '↓' : '↑'} {trend.value}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome Home, {user?.name || 'User'}!</h1>
            <p className="text-blue-100 mt-1">Your smart home is running smoothly</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">System Status</div>
            <div className="flex items-center mt-1">
              <CheckCircleIcon className="h-5 w-5 text-green-300 mr-1" />
              <span className="font-medium">All Good</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Temperature"
          value={homeData.overview.temperature}
          unit="°F"
          icon={FireIcon}
          color="bg-orange-100 text-orange-600 dark:bg-orange-900/20"
        />
        <StatCard
          title="Energy Today"
          value={homeData.overview.energyUsage}
          unit="kWh"
          icon={BoltIcon}
          color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20"
          trend={{ value: '12% less', positive: true }}
        />
        <StatCard
          title="Monthly Cost"
          value={`$${homeData.overview.monthlyCost}`}
          unit=""
          icon={CurrencyDollarIcon}
          color="bg-green-100 text-green-600 dark:bg-green-900/20"
          trend={{ value: '$18 saved', positive: true }}
        />
        <StatCard
          title="Devices Online"
          value={homeData.overview.devicesOnline}
          unit={`of ${homeData.overview.totalDevices}`}
          icon={HomeIcon}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/20"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {homeData.quickActions.map((action) => (
              <QuickActionCard key={action.id} action={action} />
            ))}
          </div>
        </div>
      </div>

      {/* Rooms Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Room Status</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center">
            View All <ChevronRightIcon className="h-4 w-4 ml-1" />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {homeData.rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Energy Tip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {homeData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 p-1">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'automation' ? 'bg-blue-500' : 
                      activity.type === 'schedule' ? 'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">{activity.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Energy Tip */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <LightBulbIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">{homeData.energyTip.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{homeData.energyTip.message}</p>
              <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/30 rounded text-sm">
                <span className="font-medium text-green-800 dark:text-green-200">
                  Potential savings: {homeData.energyTip.savings}
                </span>
              </div>
              <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                Apply This Setting
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
