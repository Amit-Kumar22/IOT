'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  PowerIcon,
  StopIcon,
  PlayIcon,
  PauseIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  LockOpenIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon,
  EyeIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { ControlWidget as ControlWidgetType, DeviceStatus } from '@/types/control';

interface ControlWidgetProps {
  widget: ControlWidgetType;
  deviceStatus: DeviceStatus;
  isEditing?: boolean;
  onCommand?: (deviceId: string, parameter: string, value: any) => void;
  onWidgetUpdate?: (widget: ControlWidgetType) => void;
  onWidgetRemove?: (widgetId: string) => void;
  userPermissions?: string[];
  className?: string;
}

/**
 * SCADA Control Widget Component
 * Industrial-style control widget for device interaction
 */
export const ControlWidget: React.FC<ControlWidgetProps> = ({
  widget,
  deviceStatus,
  isEditing = false,
  onCommand,
  onWidgetUpdate,
  onWidgetRemove,
  userPermissions = [],
  className = ''
}) => {
  const [isActive, setIsActive] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingValue, setPendingValue] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Get current parameter value
  const currentValue = deviceStatus.parameters[widget.parameter]?.value;
  const currentQuality = deviceStatus.parameters[widget.parameter]?.quality || 'uncertain';
  const parameterUnit = deviceStatus.parameters[widget.parameter]?.unit || widget.config.unit;

  // Check permissions
  const hasPermission = (action: string): boolean => {
    return widget.permissions.some(permission => 
      userPermissions.includes(permission) || userPermissions.includes('admin')
    );
  };

  const canOperate = hasPermission('operate') && !widget.config.readOnly && widget.isEnabled;

  // Handle command execution
  const executeCommand = useCallback((value: any) => {
    if (!canOperate || !onCommand) return;

    if (widget.config.confirmAction && !showConfirmation) {
      setPendingValue(value);
      setShowConfirmation(true);
      return;
    }

    onCommand(widget.deviceId, widget.parameter, value);
    setShowConfirmation(false);
    setPendingValue(null);
  }, [canOperate, onCommand, widget, showConfirmation]);

  // Handle confirmation
  const handleConfirm = useCallback(() => {
    if (pendingValue !== null && onCommand) {
      onCommand(widget.deviceId, widget.parameter, pendingValue);
    }
    setShowConfirmation(false);
    setPendingValue(null);
  }, [pendingValue, onCommand, widget]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setShowConfirmation(false);
    setPendingValue(null);
  }, []);

  // Get status color based on quality and widget state
  const getStatusColor = (): string => {
    if (!widget.isEnabled) return 'text-gray-400 border-gray-300';
    if (currentQuality === 'bad') return 'text-red-500 border-red-300';
    if (currentQuality === 'uncertain') return 'text-yellow-500 border-yellow-300';
    if (isActive) return 'text-green-500 border-green-300';
    return 'text-blue-500 border-blue-300';
  };

  // Get widget style based on configuration
  const getWidgetStyle = (): string => {
    const baseStyle = 'transition-all duration-200';
    const sizeStyle = {
      small: 'w-16 h-16',
      medium: 'w-24 h-24',
      large: 'w-32 h-32'
    }[widget.config.size || 'medium'];

    const colorStyle = {
      default: 'bg-gray-50 dark:bg-gray-800',
      emergency: 'bg-red-50 dark:bg-red-900/20',
      warning: 'bg-yellow-50 dark:bg-yellow-900/20',
      success: 'bg-green-50 dark:bg-green-900/20'
    }[widget.config.style || 'default'];

    return `${baseStyle} ${sizeStyle} ${colorStyle}`;
  };

  // Render widget based on type
  const renderWidget = () => {
    const commonProps = {
      className: `${getWidgetStyle()} border-2 ${getStatusColor()} rounded-lg p-2 flex flex-col items-center justify-center ${
        canOperate ? 'hover:shadow-lg cursor-pointer' : 'cursor-not-allowed opacity-60'
      }`,
      disabled: !canOperate || isLocked
    };

    switch (widget.type) {
      case 'button':
        return (
          <button
            {...commonProps}
            onClick={() => executeCommand(!currentValue)}
            onMouseDown={() => setIsActive(true)}
            onMouseUp={() => setIsActive(false)}
            onMouseLeave={() => setIsActive(false)}
          >
            <div className="flex flex-col items-center space-y-1">
              {currentValue ? (
                <PlayIcon className="h-6 w-6" />
              ) : (
                <StopIcon className="h-6 w-6" />
              )}
              <span className="text-xs font-medium">{widget.label}</span>
              <span className="text-xs text-gray-500">
                {currentValue ? 'ON' : 'OFF'}
              </span>
            </div>
          </button>
        );

      case 'switch':
        return (
          <button
            {...commonProps}
            onClick={() => executeCommand(!currentValue)}
          >
            <div className="flex flex-col items-center space-y-1">
              <div className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                currentValue ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                  currentValue ? 'transform translate-x-6' : 'transform translate-x-0.5'
                }`} />
              </div>
              <span className="text-xs font-medium">{widget.label}</span>
            </div>
          </button>
        );

      case 'slider':
        return (
          <div className={`${getWidgetStyle()} border-2 ${getStatusColor()} rounded-lg p-2`}>
            <div className="flex flex-col items-center space-y-2 h-full">
              <span className="text-xs font-medium">{widget.label}</span>
              <div className="flex-1 flex flex-col justify-center items-center">
                <span className="text-lg font-bold mb-2">
                  {typeof currentValue === 'number' ? currentValue.toFixed(1) : currentValue}
                  <span className="text-xs ml-1">{parameterUnit}</span>
                </span>
                <input
                  type="range"
                  min={widget.config.minValue || 0}
                  max={widget.config.maxValue || 100}
                  step={widget.config.step || 1}
                  value={typeof currentValue === 'number' ? currentValue : 0}
                  onChange={(e) => executeCommand(parseFloat(e.target.value))}
                  disabled={!canOperate || isLocked}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
            </div>
          </div>
        );

      case 'gauge':
        const gaugeValue = typeof currentValue === 'number' ? currentValue : 0;
        const maxValue = widget.config.maxValue || 100;
        const minValue = widget.config.minValue || 0;
        const percentage = ((gaugeValue - minValue) / (maxValue - minValue)) * 100;
        const angle = (percentage / 100) * 180 - 90; // -90 to 90 degrees

        return (
          <div className={`${getWidgetStyle()} border-2 ${getStatusColor()} rounded-lg p-2`}>
            <div className="flex flex-col items-center space-y-1 h-full">
              <span className="text-xs font-medium">{widget.label}</span>
              <div className="relative w-16 h-16 flex items-center justify-center">
                {/* Gauge background */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    opacity="0.3"
                    strokeDasharray="88"
                    strokeDashoffset="0"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray="88"
                    strokeDashoffset={88 - (88 * percentage) / 100}
                    className="transition-all duration-500"
                  />
                </svg>
                {/* Gauge needle */}
                <div
                  className="absolute w-0.5 h-6 bg-current origin-bottom transform transition-transform duration-500"
                  style={{ transform: `rotate(${angle}deg)` }}
                />
              </div>
              <span className="text-xs font-bold">
                {gaugeValue.toFixed(1)} {parameterUnit}
              </span>
            </div>
          </div>
        );

      case 'indicator':
        return (
          <div className={`${getWidgetStyle()} border-2 ${getStatusColor()} rounded-lg p-2`}>
            <div className="flex flex-col items-center space-y-1 h-full justify-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentValue 
                  ? 'bg-green-500 text-white animate-pulse' 
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500'
              }`}>
                {currentValue ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  <XCircleIcon className="h-5 w-5" />
                )}
              </div>
              <span className="text-xs font-medium text-center">{widget.label}</span>
              <span className="text-xs text-gray-500">
                {currentValue ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
          </div>
        );

      case 'alarm':
        const isAlarmActive = deviceStatus.alarms.includes(widget.id);
        return (
          <div className={`${getWidgetStyle()} border-2 ${
            isAlarmActive ? 'border-red-500 text-red-500 animate-pulse' : 'border-gray-300 text-gray-500'
          } rounded-lg p-2`}>
            <div className="flex flex-col items-center space-y-1 h-full justify-center">
              <ExclamationTriangleIcon className={`h-8 w-8 ${
                isAlarmActive ? 'text-red-500' : 'text-gray-400'
              }`} />
              <span className="text-xs font-medium text-center">{widget.label}</span>
              <span className="text-xs">
                {isAlarmActive ? 'ALARM' : 'NORMAL'}
              </span>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className={`${getWidgetStyle()} border-2 ${getStatusColor()} rounded-lg p-2`}>
            <div className="flex flex-col items-center space-y-1 h-full justify-center">
              <span className="text-xs font-medium text-center">{widget.label}</span>
              <span className="text-lg font-bold text-center">
                {widget.config.format 
                  ? eval(`\`${widget.config.format}\``) // Simple template formatting
                  : `${currentValue} ${parameterUnit || ''}`
                }
              </span>
            </div>
          </div>
        );

      default:
        return (
          <div className={`${getWidgetStyle()} border-2 border-gray-300 rounded-lg p-2`}>
            <div className="flex flex-col items-center space-y-1 h-full justify-center">
              <CogIcon className="h-6 w-6 text-gray-400" />
              <span className="text-xs text-gray-500">Unknown Type</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Widget */}
      {renderWidget()}

      {/* Lock indicator */}
      {isLocked && (
        <div className="absolute top-1 right-1">
          <LockClosedIcon className="h-4 w-4 text-red-500" />
        </div>
      )}

      {/* Quality indicator */}
      {currentQuality !== 'good' && (
        <div className="absolute top-1 left-1">
          <div className={`w-2 h-2 rounded-full ${
            currentQuality === 'bad' ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
        </div>
      )}

      {/* Edit mode controls */}
      {isEditing && (
        <div className="absolute top-2 right-2 flex space-x-1">
          <button
            onClick={() => onWidgetUpdate?.(widget)}
            className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            title="Edit widget"
          >
            <CogIcon className="h-3 w-3" />
          </button>
          <button
            onClick={() => onWidgetRemove?.(widget.id)}
            className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
            title="Remove widget"
          >
            <XCircleIcon className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg max-w-xs">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Confirm Action
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              Set {widget.label} to {pendingValue?.toString()}?
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleConfirm}
                className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                Confirm
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlWidget;
