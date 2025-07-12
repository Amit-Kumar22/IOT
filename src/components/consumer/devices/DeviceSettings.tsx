'use client';

import { useState, useEffect } from 'react';
import { HomeDevice, Room } from '@/types/consumer-devices';
import { 
  XMarkIcon, 
  CogIcon, 
  BellIcon, 
  HomeIcon,
  TrashIcon,
  PowerIcon
} from '@heroicons/react/24/outline';

interface DeviceSettingsProps {
  device: HomeDevice;
  isOpen: boolean;
  onClose: () => void;
  onSave: (device: HomeDevice) => Promise<void>;
  onDelete: (deviceId: string) => Promise<void>;
  rooms: Room[];
}

interface NotificationSettings {
  enabled: boolean;
  offlineAlerts: boolean;
  maintenanceReminders: boolean;
  energyAlerts: boolean;
  scheduleNotifications: boolean;
}

export default function DeviceSettings({ 
  device, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  rooms 
}: DeviceSettingsProps) {
  const [deviceName, setDeviceName] = useState(device.name);
  const [selectedRoom, setSelectedRoom] = useState(device.room);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    enabled: true,
    offlineAlerts: true,
    maintenanceReminders: true,
    energyAlerts: false,
    scheduleNotifications: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDeviceName(device.name);
      setSelectedRoom(device.room);
      // Reset any form state when modal opens
      setShowDeleteConfirm(false);
    }
  }, [isOpen, device]);

  const handleSave = async () => {
    if (!deviceName.trim()) return;

    setIsLoading(true);
    try {
      const updatedDevice: HomeDevice = {
        ...device,
        name: deviceName.trim(),
        room: selectedRoom,
        // Add notification settings to device metadata
        metadata: {
          ...device.metadata,
          notifications
        }
      };

      await onSave(updatedDevice);
      onClose();
    } catch (error) {
      console.error('Failed to save device settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(device.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete device:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Device Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Device Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center
              ${device.isOnline ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
              dark:bg-opacity-20
            `}>
              {device.type === 'light' && <PowerIcon className="w-6 h-6" />}
              {device.type === 'thermostat' && <CogIcon className="w-6 h-6" />}
              {device.type === 'security' && <HomeIcon className="w-6 h-6" />}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {device.type.charAt(0).toUpperCase() + device.type.slice(1)} Device
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {device.isOnline ? 'Online' : 'Offline'} • {device.room}
              </p>
            </div>
          </div>

          {/* Device Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Device Name
            </label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter device name"
            />
          </div>

          {/* Room Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Room
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {rooms.map(room => (
                <option key={room.id} value={room.name}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notification Settings */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Notifications
            </h3>
            <div className="space-y-3">
              <NotificationToggle
                label="Enable Notifications"
                description="Receive alerts for this device"
                checked={notifications.enabled}
                onChange={(value) => handleNotificationChange('enabled', value)}
              />
              <NotificationToggle
                label="Offline Alerts"
                description="Get notified when device goes offline"
                checked={notifications.offlineAlerts}
                onChange={(value) => handleNotificationChange('offlineAlerts', value)}
                disabled={!notifications.enabled}
              />
              <NotificationToggle
                label="Maintenance Reminders"
                description="Regular maintenance notifications"
                checked={notifications.maintenanceReminders}
                onChange={(value) => handleNotificationChange('maintenanceReminders', value)}
                disabled={!notifications.enabled}
              />
              <NotificationToggle
                label="Energy Alerts"
                description="High energy usage notifications"
                checked={notifications.energyAlerts}
                onChange={(value) => handleNotificationChange('energyAlerts', value)}
                disabled={!notifications.enabled}
              />
              <NotificationToggle
                label="Schedule Notifications"
                description="Automated schedule confirmations"
                checked={notifications.scheduleNotifications}
                onChange={(value) => handleNotificationChange('scheduleNotifications', value)}
                disabled={!notifications.enabled}
              />
            </div>
          </div>

          {/* Device Actions */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Device Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
                Remove Device
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !deviceName.trim()}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Remove Device
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to remove &ldquo;{device.name}&rdquo;? All schedules and settings will be lost.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface NotificationToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

function NotificationToggle({ 
  label, 
  description, 
  checked, 
  onChange, 
  disabled = false 
}: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <label className={`text-sm font-medium ${
          disabled 
            ? 'text-gray-400 dark:text-gray-500' 
            : 'text-gray-700 dark:text-gray-300'
        }`}>
          {label}
        </label>
        <p className={`text-xs ${
          disabled 
            ? 'text-gray-400 dark:text-gray-500' 
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          {description}
        </p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          disabled 
            ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed' 
            : checked 
              ? 'bg-blue-500' 
              : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <div
          className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
