'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  PlusIcon,
  PlayIcon,
  PauseIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  SunIcon,
  MoonIcon,
  HomeIcon,
  ShieldCheckIcon,
  BoltIcon,
  LightBulbIcon,
  FireIcon,
  SpeakerWaveIcon,
  CameraIcon,
  PowerIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  PlayIcon as PlaySolidIcon,
  PauseIcon as PauseSolidIcon
} from '@heroicons/react/24/solid';

/**
 * Consumer Automation Page - Smart Home Automation
 * Comprehensive interface for creating and managing home automation with full CRUD functionality
 */
function ConsumerAutomationContent() {
  const { user } = useAppSelector((state) => state.auth);
  const toast = (options: any) => {
    console.log('Toast:', options);
    // Temporary toast implementation
  };

  // State management
  const [activeTab, setActiveTab] = useState('scenes');
  const [expandedAutomation, setExpandedAutomation] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Modal states
  const [showSceneModal, setShowSceneModal] = useState(false);
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Form states
  const [sceneForm, setSceneForm] = useState({
    name: '',
    description: '',
    icon: 'SunIcon',
    actions: [] as string[],
    devices: [] as string[]
  });

  const [automationForm, setAutomationForm] = useState({
    name: '',
    description: '',
    trigger: '',
    condition: '',
    actions: [] as string[],
    category: 'routine',
    enabled: true
  });

  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    device: '',
    schedule: '',
    action: '',
    enabled: true
  });

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {}
  });

  // State for managing automation data
  const [scenes, setScenes] = useState([
    {
      id: 'good-morning',
      name: 'Good Morning',
      description: 'Start your day right with perfect lighting and temperature',
      icon: SunIcon,
      isActive: true,
      devices: 8,
      lastUsed: '8:30 AM today',
      actions: [
        'Turn on bedroom lights to 60%',
        'Set thermostat to 72°F',
        'Turn on coffee maker',
        'Play morning playlist',
        'Open smart blinds'
      ]
    },
    {
      id: 'good-night',
      name: 'Good Night',
      description: 'Secure and prepare your home for sleep',
      icon: MoonIcon,
      isActive: true,
      devices: 12,
      lastUsed: '11:15 PM yesterday',
      actions: [
        'Turn off all lights',
        'Lock all doors',
        'Set thermostat to 68°F',
        'Turn on bedroom fan',
        'Activate security cameras'
      ]
    },
    {
      id: 'movie-time',
      name: 'Movie Time',
      description: 'Dim lights and prepare entertainment center',
      icon: SpeakerWaveIcon,
      isActive: false,
      devices: 6,
      lastUsed: 'Friday 8:00 PM',
      actions: [
        'Dim living room lights to 20%',
        'Turn on TV and sound system',
        'Close smart blinds',
        'Set thermostat to 70°F'
      ]
    },
    {
      id: 'away-mode',
      name: 'Away Mode',
      description: 'Secure home and save energy when away',
      icon: ShieldCheckIcon,
      isActive: false,
      devices: 15,
      lastUsed: 'Monday 2:00 PM',
      actions: [
        'Turn off all lights',
        'Lock all doors',
        'Set thermostat to 65°F',
        'Activate security system',
        'Turn off non-essential devices'
      ]
    }
  ]);

  const [automations, setAutomations] = useState([
    {
      id: 'motion-lights',
      name: 'Motion Activated Lights',
      description: 'Turn on hallway lights when motion detected at night',
      trigger: 'Motion sensor in hallway',
      condition: 'Between sunset and sunrise',
      actions: ['Turn on hallway lights to 40%', 'Turn off after 5 minutes'],
      isEnabled: true,
      lastTriggered: '2:30 AM today',
      category: 'security'
    },
    {
      id: 'energy-saver',
      name: 'Energy Saver',
      description: 'Reduce energy usage during peak hours',
      trigger: 'Peak electricity hours (2-8 PM)',
      condition: 'Weekdays only',
      actions: ['Dim lights by 20%', 'Raise thermostat 2°F', 'Turn off non-essential devices'],
      isEnabled: true,
      lastTriggered: 'Yesterday 2:00 PM',
      category: 'energy'
    },
    {
      id: 'rain-sensor',
      name: 'Rain Detection',
      description: 'Close windows and turn on lights when rain detected',
      trigger: 'Rain sensor detects precipitation',
      condition: 'Any time',
      actions: ['Close all smart windows', 'Turn on porch lights', 'Send phone notification'],
      isEnabled: false,
      lastTriggered: 'Last Friday',
      category: 'weather'
    },
    {
      id: 'bedtime-routine',
      name: 'Automatic Bedtime',
      description: 'Gradually prepare home for sleep',
      trigger: '10:30 PM every day',
      condition: 'Home is occupied',
      actions: ['Dim lights gradually', 'Lower thermostat', 'Lock doors at 11 PM'],
      isEnabled: true,
      lastTriggered: '10:30 PM yesterday',
      category: 'routine'
    }
  ]);

  const [schedules, setSchedules] = useState([
    {
      id: 'morning-coffee',
      name: 'Morning Coffee',
      device: 'Kitchen Coffee Maker',
      schedule: 'Monday-Friday 6:45 AM',
      action: 'Turn on and brew coffee',
      isEnabled: true,
      nextRun: 'Tomorrow 6:45 AM'
    },
    {
      id: 'evening-lights',
      name: 'Evening Ambiance',
      device: 'Living Room Lights',
      schedule: 'Daily at sunset',
      action: 'Turn on at 60% brightness',
      isEnabled: true,
      nextRun: 'Today 7:23 PM'
    },
    {
      id: 'weekend-cleaning',
      name: 'Robot Vacuum',
      device: 'Living Room Vacuum',
      schedule: 'Saturday 10:00 AM',
      action: 'Start cleaning cycle',
      isEnabled: false,
      nextRun: 'Disabled'
    }
  ]);

  // Enhanced handler functions with full CRUD operations
  const handleSceneToggle = async (sceneId: string) => {
    try {
      setScenes((prev: any) => prev.map((scene: any) => 
        scene.id === sceneId 
          ? { 
              ...scene, 
              isActive: !scene.isActive,
              lastUsed: scene.isActive ? scene.lastUsed : 'Just now'
            }
          : scene
      ));
      
      const scene = scenes.find(s => s.id === sceneId);
      toast({
        title: 'Scene Updated',
        description: `${scene?.name} has been ${scene?.isActive ? 'deactivated' : 'activated'}.`,
        type: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to toggle scene. Please try again.',
        type: 'error',
      });
    }
  };

  const handleAutomationToggle = async (automationId: string) => {
    try {
      setAutomations((prev: any) => prev.map((automation: any) => 
        automation.id === automationId 
          ? { ...automation, isEnabled: !automation.isEnabled }
          : automation
      ));
      
      const automation = automations.find(a => a.id === automationId);
      toast({
        title: 'Automation Updated',
        description: `${automation?.name} has been ${automation?.isEnabled ? 'disabled' : 'enabled'}.`,
        type: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to toggle automation. Please try again.',
        type: 'error',
      });
    }
  };

  const handleScheduleToggle = async (scheduleId: string) => {
    try {
      setSchedules((prev: any) => prev.map((schedule: any) => 
        schedule.id === scheduleId 
          ? { 
              ...schedule, 
              isEnabled: !schedule.isEnabled,
              nextRun: schedule.isEnabled ? 'Disabled' : 'Tomorrow 6:45 AM'
            }
          : schedule
      ));
      
      const schedule = schedules.find(s => s.id === scheduleId);
      toast({
        title: 'Schedule Updated',
        description: `${schedule?.name} has been ${schedule?.isEnabled ? 'disabled' : 'enabled'}.`,
        type: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to toggle schedule. Please try again.',
        type: 'error',
      });
    }
  };

  const handleCreateScene = async () => {
    try {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newScene = {
        id: `scene-${Date.now()}`,
        name: sceneForm.name,
        description: sceneForm.description,
        icon: SunIcon, // Default icon, could be dynamic
        isActive: false,
        devices: sceneForm.devices.length,
        lastUsed: 'Never',
        actions: sceneForm.actions
      };
      
      setScenes(prev => [...prev, newScene]);
      
      toast({
        title: 'Scene Created',
        description: `${sceneForm.name} scene has been created successfully.`,
        type: 'success',
      });
      
      setShowSceneModal(false);
      setSceneForm({
        name: '',
        description: '',
        icon: 'SunIcon',
        actions: [],
        devices: []
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create scene. Please try again.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateAutomation = async () => {
    try {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAutomation = {
        id: `automation-${Date.now()}`,
        name: automationForm.name,
        description: automationForm.description,
        trigger: automationForm.trigger,
        condition: automationForm.condition,
        actions: automationForm.actions,
        isEnabled: automationForm.enabled,
        lastTriggered: 'Never',
        category: automationForm.category
      };
      
      setAutomations(prev => [...prev, newAutomation]);
      
      toast({
        title: 'Automation Created',
        description: `${automationForm.name} automation has been created successfully.`,
        type: 'success',
      });
      
      setShowAutomationModal(false);
      setAutomationForm({
        name: '',
        description: '',
        trigger: '',
        condition: '',
        actions: [],
        category: 'routine',
        enabled: true
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create automation. Please try again.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateSchedule = async () => {
    try {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSchedule = {
        id: `schedule-${Date.now()}`,
        name: scheduleForm.name,
        device: scheduleForm.device,
        schedule: scheduleForm.schedule,
        action: scheduleForm.action,
        isEnabled: scheduleForm.enabled,
        nextRun: scheduleForm.enabled ? 'Tomorrow 6:45 AM' : 'Disabled'
      };
      
      setSchedules(prev => [...prev, newSchedule]);
      
      toast({
        title: 'Schedule Created',
        description: `${scheduleForm.name} schedule has been created successfully.`,
        type: 'success',
      });
      
      setShowScheduleModal(false);
      setScheduleForm({
        name: '',
        device: '',
        schedule: '',
        action: '',
        enabled: true
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create schedule. Please try again.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateNew = () => {
    if (activeTab === 'scenes') {
      setShowSceneModal(true);
    } else if (activeTab === 'automations') {
      setShowAutomationModal(true);
    } else if (activeTab === 'schedules') {
      setShowScheduleModal(true);
    }
  };

  const handleEdit = (id: string, type: string) => {
    let item;
    if (type === 'scene') {
      item = scenes.find(s => s.id === id);
      if (item) {
        setSceneForm({
          name: item.name,
          description: item.description,
          icon: 'SunIcon',
          actions: item.actions,
          devices: []
        });
        setSelectedItem(item);
        setShowSceneModal(true);
      }
    } else if (type === 'automation') {
      item = automations.find(a => a.id === id);
      if (item) {
        setAutomationForm({
          name: item.name,
          description: item.description,
          trigger: item.trigger,
          condition: item.condition,
          actions: item.actions,
          category: item.category,
          enabled: item.isEnabled
        });
        setSelectedItem(item);
        setShowAutomationModal(true);
      }
    } else if (type === 'schedule') {
      item = schedules.find(s => s.id === id);
      if (item) {
        setScheduleForm({
          name: item.name,
          device: item.device,
          schedule: item.schedule,
          action: item.action,
          enabled: item.isEnabled
        });
        setSelectedItem(item);
        setShowScheduleModal(true);
      }
    }
  };

  const handleDelete = (id: string, type: string) => {
    let itemName = '';
    if (type === 'scene') {
      const scene = scenes.find(s => s.id === id);
      itemName = scene?.name || 'scene';
    } else if (type === 'automation') {
      const automation = automations.find(a => a.id === id);
      itemName = automation?.name || 'automation';
    } else if (type === 'schedule') {
      const schedule = schedules.find(s => s.id === id);
      itemName = schedule?.name || 'schedule';
    }

    setConfirmDialog({
      isOpen: true,
      title: `Delete ${type}`,
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      action: async () => {
        try {
          setIsProcessing(true);
          await new Promise(resolve => setTimeout(resolve, 500));
          
          if (type === 'scene') {
            setScenes(prev => prev.filter(scene => scene.id !== id));
          } else if (type === 'automation') {
            setAutomations(prev => prev.filter(automation => automation.id !== id));
          } else if (type === 'schedule') {
            setSchedules(prev => prev.filter(schedule => schedule.id !== id));
          }
          
          toast({
            title: `${type} Deleted`,
            description: `"${itemName}" has been successfully deleted.`,
            type: 'success',
          });
        } catch (error) {
          toast({
            title: 'Error',
            description: `Failed to delete ${type}. Please try again.`,
            type: 'error',
          });
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  const handleUpdateItem = async () => {
    if (selectedItem) {
      try {
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (selectedItem.actions !== undefined) { // Scene
          setScenes((prev: any) => prev.map((scene: any) => 
            scene.id === selectedItem.id 
              ? { ...scene, ...sceneForm, actions: sceneForm.actions }
              : scene
          ));
        } else if (selectedItem.trigger !== undefined) { // Automation
          setAutomations((prev: any) => prev.map((automation: any) => 
            automation.id === selectedItem.id 
              ? { ...automation, ...automationForm, isEnabled: automationForm.enabled }
              : automation
          ));
        } else { // Schedule
          setSchedules((prev: any) => prev.map((schedule: any) => 
            schedule.id === selectedItem.id 
              ? { ...schedule, ...scheduleForm, isEnabled: scheduleForm.enabled }
              : schedule
          ));
        }
        
        toast({
          title: 'Item Updated',
          description: `${selectedItem.name} has been updated successfully.`,
          type: 'success',
        });
        
        // Close modals and reset
        setShowSceneModal(false);
        setShowAutomationModal(false);
        setShowScheduleModal(false);
        setSelectedItem(null);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update item. Please try again.',
          type: 'error',
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Mock data for home automation
  const automationData = {
    scenes,
    automations, 
    schedules
  };

  const SceneCard = ({ scene }: { scene: any }) => {
    const IconComponent = scene.icon;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${scene.isActive ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20' : 'bg-gray-100 text-gray-600 dark:bg-gray-700'}`}>
                <IconComponent className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{scene.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{scene.devices} devices</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleEdit(scene.id, 'scene')}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                disabled={editingId === scene.id}
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleDelete(scene.id, 'scene')}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleSceneToggle(scene.id)}
                disabled={editingId === scene.id}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  scene.isActive 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                {scene.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{scene.description}</p>
          
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">ACTIONS:</p>
            {scene.actions.slice(0, 3).map((action: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{action}</span>
              </div>
            ))}
            {scene.actions.length > 3 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">+{scene.actions.length - 3} more actions</p>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Last used: {scene.lastUsed}</p>
          </div>
        </div>
      </div>
    );
  };

  const AutomationCard = ({ automation }: { automation: any }) => {
    const isExpanded = expandedAutomation === automation.id;
    
    const getCategoryColor = (category: string) => {
      const colors: { [key: string]: string } = {
        security: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        energy: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        weather: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        routine: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      };
      return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white">{automation.name}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(automation.category)}`}>
                  {automation.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{automation.description}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last triggered: {automation.lastTriggered}</p>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => setExpandedAutomation(isExpanded ? null : automation.id)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {isExpanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
              </button>
              
              <button 
                onClick={() => handleEdit(automation.id, 'automation')}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                disabled={editingId === automation.id}
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              
              <button 
                onClick={() => handleDelete(automation.id, 'automation')}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => handleAutomationToggle(automation.id)}
                disabled={editingId === automation.id}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  automation.isEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    automation.isEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">TRIGGER:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{automation.trigger}</p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">CONDITION:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{automation.condition}</p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">ACTIONS:</p>
                <div className="space-y-1">
                  {automation.actions.map((action: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ScheduleCard = ({ schedule }: { schedule: any }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white">{schedule.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{schedule.device}</p>
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>📅 {schedule.schedule}</span>
            <span>🎯 {schedule.action}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Next: {schedule.nextRun}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleEdit(schedule.id, 'schedule')}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={editingId === schedule.id}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button 
            onClick={() => handleDelete(schedule.id, 'schedule')}
            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleScheduleToggle(schedule.id)}
            disabled={editingId === schedule.id}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              schedule.isEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                schedule.isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Smart Automation</h1>
            <p className="text-purple-100 mt-1">Make your home work for you automatically</p>
          </div>
          <button 
            onClick={handleCreateNew}
            disabled={isCreating}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            <PlusIcon className="h-5 w-5" />
            <span>{isCreating ? 'Creating...' : 'Create New'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'scenes', name: 'Scenes', count: automationData.scenes.length },
              { id: 'automations', name: 'Automations', count: automationData.automations.length },
              { id: 'schedules', name: 'Schedules', count: automationData.schedules.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'scenes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Quick Scenes</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">One-tap control for multiple devices</p>
            </div>
            <button 
              onClick={handleCreateNew}
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
            >
              <PlusIcon className="h-4 w-4" />
              <span>{isCreating ? 'Creating...' : 'New Scene'}</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {automationData.scenes.map((scene) => (
              <SceneCard key={scene.id} scene={scene} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'automations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Smart Automations</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Let your home respond automatically to conditions</p>
            </div>
            <button 
              onClick={handleCreateNew}
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
            >
              <PlusIcon className="h-4 w-4" />
              <span>{isCreating ? 'Creating...' : 'New Automation'}</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {automationData.automations.map((automation) => (
              <AutomationCard key={automation.id} automation={automation} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'schedules' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Scheduled Actions</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Time-based device control</p>
            </div>
            <button 
              onClick={handleCreateNew}
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
            >
              <ClockIcon className="h-4 w-4" />
              <span>{isCreating ? 'Creating...' : 'New Schedule'}</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {automationData.schedules.map((schedule) => (
              <ScheduleCard key={schedule.id} schedule={schedule} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Automation Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <strong>Scenes:</strong> Perfect for daily routines like &quot;Good Morning&quot; or &quot;Movie Night&quot;
          </div>
          <div>
            <strong>Automations:</strong> Great for security and energy savings based on conditions
          </div>
          <div>
            <strong>Schedules:</strong> Ideal for regular tasks like morning coffee or evening lights
          </div>
        </div>
      </div>

      {/* Scene Creation Modal */}
      <Modal
        isOpen={showSceneModal}
        onClose={() => {
          setShowSceneModal(false);
          setSelectedItem(null);
          setSceneForm({
            name: '',
            description: '',
            icon: 'SunIcon',
            actions: [],
            devices: []
          });
        }}
        title={selectedItem ? 'Edit Scene' : 'Create New Scene'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Scene Name
            </label>
            <input
              type="text"
              value={sceneForm.name}
              onChange={(e) => setSceneForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Good Morning, Movie Night"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={sceneForm.description}
              onChange={(e) => setSceneForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this scene does..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Actions (one per line)
            </label>
            <textarea
              value={sceneForm.actions.join('\n')}
              onChange={(e) => setSceneForm(prev => ({ 
                ...prev, 
                actions: e.target.value.split('\n').filter(action => action.trim() !== '')
              }))}
              placeholder="Turn on living room lights to 60%
Set thermostat to 72°F
Play morning playlist"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => {
                setShowSceneModal(false);
                setSelectedItem(null);
                setSceneForm({
                  name: '',
                  description: '',
                  icon: 'SunIcon',
                  actions: [],
                  devices: []
                });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={selectedItem ? handleUpdateItem : handleCreateScene}
              disabled={isProcessing || !sceneForm.name}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg"
            >
              {isProcessing ? 'Saving...' : selectedItem ? 'Update Scene' : 'Create Scene'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Automation Creation Modal */}
      <Modal
        isOpen={showAutomationModal}
        onClose={() => {
          setShowAutomationModal(false);
          setSelectedItem(null);
          setAutomationForm({
            name: '',
            description: '',
            trigger: '',
            condition: '',
            actions: [],
            category: 'routine',
            enabled: true
          });
        }}
        title={selectedItem ? 'Edit Automation' : 'Create New Automation'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Automation Name
            </label>
            <input
              type="text"
              value={automationForm.name}
              onChange={(e) => setAutomationForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Motion Activated Lights"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={automationForm.description}
              onChange={(e) => setAutomationForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of what this automation does"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Trigger
            </label>
            <input
              type="text"
              value={automationForm.trigger}
              onChange={(e) => setAutomationForm(prev => ({ ...prev, trigger: e.target.value }))}
              placeholder="e.g., Motion sensor in hallway"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Condition
            </label>
            <input
              type="text"
              value={automationForm.condition}
              onChange={(e) => setAutomationForm(prev => ({ ...prev, condition: e.target.value }))}
              placeholder="e.g., Between sunset and sunrise"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={automationForm.category}
              onChange={(e) => setAutomationForm(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="routine">Routine</option>
              <option value="security">Security</option>
              <option value="energy">Energy</option>
              <option value="weather">Weather</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Actions (one per line)
            </label>
            <textarea
              value={automationForm.actions.join('\n')}
              onChange={(e) => setAutomationForm(prev => ({ 
                ...prev, 
                actions: e.target.value.split('\n').filter(action => action.trim() !== '')
              }))}
              placeholder="Turn on hallway lights to 40%
Turn off after 5 minutes"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="automation-enabled"
              checked={automationForm.enabled}
              onChange={(e) => setAutomationForm(prev => ({ ...prev, enabled: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="automation-enabled" className="text-sm text-gray-700 dark:text-gray-300">
              Enable this automation
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => {
                setShowAutomationModal(false);
                setSelectedItem(null);
                setAutomationForm({
                  name: '',
                  description: '',
                  trigger: '',
                  condition: '',
                  actions: [],
                  category: 'routine',
                  enabled: true
                });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={selectedItem ? handleUpdateItem : handleCreateAutomation}
              disabled={isProcessing || !automationForm.name}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg"
            >
              {isProcessing ? 'Saving...' : selectedItem ? 'Update Automation' : 'Create Automation'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Schedule Creation Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setSelectedItem(null);
          setScheduleForm({
            name: '',
            device: '',
            schedule: '',
            action: '',
            enabled: true
          });
        }}
        title={selectedItem ? 'Edit Schedule' : 'Create New Schedule'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Schedule Name
            </label>
            <input
              type="text"
              value={scheduleForm.name}
              onChange={(e) => setScheduleForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Morning Coffee"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Device
            </label>
            <input
              type="text"
              value={scheduleForm.device}
              onChange={(e) => setScheduleForm(prev => ({ ...prev, device: e.target.value }))}
              placeholder="e.g., Kitchen Coffee Maker"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Schedule
            </label>
            <input
              type="text"
              value={scheduleForm.schedule}
              onChange={(e) => setScheduleForm(prev => ({ ...prev, schedule: e.target.value }))}
              placeholder="e.g., Monday-Friday 6:45 AM"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Action
            </label>
            <input
              type="text"
              value={scheduleForm.action}
              onChange={(e) => setScheduleForm(prev => ({ ...prev, action: e.target.value }))}
              placeholder="e.g., Turn on and brew coffee"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="schedule-enabled"
              checked={scheduleForm.enabled}
              onChange={(e) => setScheduleForm(prev => ({ ...prev, enabled: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="schedule-enabled" className="text-sm text-gray-700 dark:text-gray-300">
              Enable this schedule
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => {
                setShowScheduleModal(false);
                setSelectedItem(null);
                setScheduleForm({
                  name: '',
                  device: '',
                  schedule: '',
                  action: '',
                  enabled: true
                });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={selectedItem ? handleUpdateItem : handleCreateSchedule}
              disabled={isProcessing || !scheduleForm.name}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg"
            >
              {isProcessing ? 'Saving...' : selectedItem ? 'Update Schedule' : 'Create Schedule'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          confirmDialog.action();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

export default function ConsumerAutomation() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ConsumerAutomationContent />
    </div>
  );
}
