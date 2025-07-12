'use client';

import { useState, useCallback } from 'react';
import { Schedule, TimeSlot, DeviceAction } from '@/types/consumer-devices';
import { PlusIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';

interface ScheduleBuilderProps {
  schedule?: Schedule;
  onSave: (schedule: Schedule) => void;
  onCancel: () => void;
  deviceId: string;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' }
];

export default function ScheduleBuilder({ 
  schedule, 
  onSave, 
  onCancel, 
  deviceId 
}: ScheduleBuilderProps) {
  const [scheduleName, setScheduleName] = useState(schedule?.name || '');
  const [selectedDays, setSelectedDays] = useState<string[]>(
    schedule?.days || []
  );
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(
    schedule?.timeSlots || []
  );
  const [isRecurring, setIsRecurring] = useState(schedule?.isRecurring || false);

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleAddTimeSlot = () => {
    const newTimeSlot: TimeSlot = {
      id: Date.now().toString(),
      startTime: '09:00',
      endTime: '17:00',
      action: {
        type: 'setState',
        payload: { isOn: true }
      }
    };
    setTimeSlots(prev => [...prev, newTimeSlot]);
  };

  const handleTimeSlotChange = (
    index: number, 
    field: keyof TimeSlot, 
    value: any
  ) => {
    setTimeSlots(prev => 
      prev.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    );
  };

  const handleRemoveTimeSlot = (index: number) => {
    setTimeSlots(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!scheduleName.trim() || selectedDays.length === 0 || timeSlots.length === 0) {
      return;
    }

    const newSchedule: Schedule = {
      id: schedule?.id || Date.now().toString(),
      name: scheduleName.trim(),
      deviceId,
      days: selectedDays,
      timeSlots,
      isRecurring,
      isActive: true,
      createdAt: schedule?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(newSchedule);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {schedule ? 'Edit Schedule' : 'Create Schedule'}
          </h2>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Schedule Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Schedule Name
            </label>
            <input
              type="text"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              placeholder="e.g., Morning Routine"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Days Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Active Days
            </label>
            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day.value}
                  onClick={() => handleDayToggle(day.value)}
                  className={`p-2 text-sm font-medium rounded-lg border transition-colors ${
                    selectedDays.includes(day.value)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Recurring Schedule
            </label>
            <button
              onClick={() => setIsRecurring(!isRecurring)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isRecurring 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                  isRecurring ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Time Slots */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Time Slots
              </label>
              <button
                onClick={handleAddTimeSlot}
                className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Add
              </button>
            </div>

            <div className="space-y-3">
              {timeSlots.map((slot, index) => (
                <TimeSlotEditor
                  key={slot.id}
                  slot={slot}
                  onUpdate={(field, value) => handleTimeSlotChange(index, field, value)}
                  onRemove={() => handleRemoveTimeSlot(index)}
                />
              ))}
              
              {timeSlots.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <ClockIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No time slots yet</p>
                  <p className="text-sm">Click &ldquo;Add&rdquo; to create your first time slot</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!scheduleName.trim() || selectedDays.length === 0 || timeSlots.length === 0}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {schedule ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface TimeSlotEditorProps {
  slot: TimeSlot;
  onUpdate: (field: keyof TimeSlot, value: any) => void;
  onRemove: () => void;
}

function TimeSlotEditor({ slot, onUpdate, onRemove }: TimeSlotEditorProps) {
  const handleActionTypeChange = (type: string) => {
    let payload: any = {};
    
    switch (type) {
      case 'setState':
        payload = { isOn: true };
        break;
      case 'setBrightness':
        payload = { brightness: 50 };
        break;
      case 'setTemperature':
        payload = { temperature: 22 };
        break;
      case 'setColor':
        payload = { color: '#ffffff' };
        break;
    }

    onUpdate('action', { type, payload });
  };

  return (
    <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Time Slot
        </h4>
        <button
          onClick={onRemove}
          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Time Range */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={slot.startTime}
              onChange={(e) => onUpdate('startTime', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={slot.endTime}
              onChange={(e) => onUpdate('endTime', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Action Type */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Action
          </label>
          <select
            value={slot.action.type}
            onChange={(e) => handleActionTypeChange(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="setState">Turn On/Off</option>
            <option value="setBrightness">Set Brightness</option>
            <option value="setTemperature">Set Temperature</option>
            <option value="setColor">Set Color</option>
          </select>
        </div>

        {/* Action Value */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Value
          </label>
          {slot.action.type === 'setState' && (
            <select
              value={slot.action.payload.isOn ? 'on' : 'off'}
              onChange={(e) => onUpdate('action', {
                ...slot.action,
                payload: { isOn: e.target.value === 'on' }
              })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="on">Turn On</option>
              <option value="off">Turn Off</option>
            </select>
          )}
          
          {slot.action.type === 'setBrightness' && (
            <input
              type="range"
              min="0"
              max="100"
              value={slot.action.payload.brightness || 50}
              onChange={(e) => onUpdate('action', {
                ...slot.action,
                payload: { brightness: parseInt(e.target.value) }
              })}
              className="w-full"
            />
          )}
          
          {slot.action.type === 'setTemperature' && (
            <input
              type="number"
              min="10"
              max="30"
              value={slot.action.payload.temperature || 22}
              onChange={(e) => onUpdate('action', {
                ...slot.action,
                payload: { temperature: parseInt(e.target.value) }
              })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
          )}
          
          {slot.action.type === 'setColor' && (
            <input
              type="color"
              value={slot.action.payload.color || '#ffffff'}
              onChange={(e) => onUpdate('action', {
                ...slot.action,
                payload: { color: e.target.value }
              })}
              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
            />
          )}
        </div>
      </div>
    </div>
  );
}
