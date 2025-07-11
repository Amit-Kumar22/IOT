'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { useToast } from '@/components/providers/ToastProvider';
import { useStableInputHandler } from '@/hooks/useStableInput';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  BoltIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ChartBarIcon,
  LightBulbIcon,
  HomeIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BellIcon,
  DocumentArrowDownIcon,
  CogIcon,
  EyeIcon,
  FireIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

/**
 * Consumer Energy Page - Home Energy Management
 * Comprehensive energy monitoring and management with full CRUD functionality
 */
function ConsumerEnergyContent() {
  const { user } = useAppSelector((state) => state.auth);
  const toast = (options: any) => {
    console.log('Toast:', options);
    // Temporary toast implementation
  };

  // State management
  const [timeRange, setTimeRange] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('usage');
  const [appliedTips, setAppliedTips] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Modal states
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTipDetailsModal, setShowTipDetailsModal] = useState(false);
  const [selectedTip, setSelectedTip] = useState<any>(null);
  
  // Form states
  const [goalForm, setGoalForm] = useState({
    type: 'usage',
    target: 800,
    period: 'monthly'
  });
  
  const [alertForm, setAlertForm] = useState({
    type: 'usage',
    threshold: 30,
    period: 'daily',
    enabled: true
  });

  // Create stable handlers
  const createGoalHandler = useStableInputHandler(setGoalForm);
  const createAlertHandler = useStableInputHandler(setAlertForm);
  
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    startTime: '',
    endTime: '',
    days: [] as number[],
    energyMode: 'eco',
    devices: [] as any[]
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

  const [goals, setGoals] = useState({
    monthly: { target: 800, current: 847.2, percentage: 94 },
    cost: { target: 90, current: 101.66, percentage: 89 }
  });

  const [energyAlerts, setEnergyAlerts] = useState([
    { id: 1, type: 'usage', threshold: 30, period: 'daily', enabled: true },
    { id: 2, type: 'cost', threshold: 5, period: 'daily', enabled: true },
    { id: 3, type: 'peak', threshold: 0, period: 'realtime', enabled: false }
  ]);

  const [energySchedules, setEnergySchedules] = useState([
    { 
      id: 1, 
      name: 'Night Mode', 
      startTime: '22:00', 
      endTime: '06:00', 
      days: [0,1,2,3,4,5,6], 
      energyMode: 'eco',
      enabled: true
    },
    { 
      id: 2, 
      name: 'Work Hours', 
      startTime: '08:00', 
      endTime: '17:00', 
      days: [1,2,3,4,5], 
      energyMode: 'away',
      enabled: true
    }
  ]);

  // Energy management functions
  const handleCreateGoal = async () => {
    try {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setGoals(prev => ({
        ...prev,
        [goalForm.type === 'usage' ? 'monthly' : 'cost']: {
          ...prev[goalForm.type === 'usage' ? 'monthly' : 'cost'],
          target: goalForm.target,
          percentage: Math.round((prev[goalForm.type === 'usage' ? 'monthly' : 'cost'].current / goalForm.target) * 100)
        }
      }));
      
      toast({
        title: 'Goal Updated',
        description: `Your ${goalForm.type} goal has been updated successfully.`,
        type: 'success',
      });
      
      setShowGoalModal(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update goal. Please try again.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateAlert = async () => {
    try {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAlert = {
        id: energyAlerts.length + 1,
        type: alertForm.type,
        threshold: alertForm.threshold,
        period: alertForm.period,
        enabled: alertForm.enabled
      };
      
      setEnergyAlerts(prev => [...prev, newAlert]);
      
      toast({
        title: 'Alert Created',
        description: `Energy alert has been created successfully.`,
        type: 'success',
      });
      
      setShowAlertModal(false);
      setAlertForm({
        type: 'usage',
        threshold: 30,
        period: 'daily',
        enabled: true
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create alert. Please try again.',
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
        id: energySchedules.length + 1,
        name: scheduleForm.name,
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime,
        days: scheduleForm.days,
        energyMode: scheduleForm.energyMode,
        enabled: true
      };
      
      setEnergySchedules(prev => [...prev, newSchedule]);
      
      toast({
        title: 'Schedule Created',
        description: `Energy schedule "${scheduleForm.name}" has been created.`,
        type: 'success',
      });
      
      setShowScheduleModal(false);
      setScheduleForm({
        name: '',
        startTime: '',
        endTime: '',
        days: [],
        energyMode: 'eco',
        devices: []
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

  const handleDeleteAlert = async (alertId: number) => {
    const alert = energyAlerts.find(a => a.id === alertId);
    if (!alert) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Alert',
      message: `Are you sure you want to delete this ${alert.type} alert?`,
      action: async () => {
        try {
          setIsProcessing(true);
          await new Promise(resolve => setTimeout(resolve, 500));
          
          setEnergyAlerts(prev => prev.filter(a => a.id !== alertId));
          
          toast({
            title: 'Alert Deleted',
            description: 'Energy alert has been removed.',
            type: 'success',
          });
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to delete alert. Please try again.',
            type: 'error',
          });
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    const schedule = energySchedules.find(s => s.id === scheduleId);
    if (!schedule) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Schedule',
      message: `Are you sure you want to delete the "${schedule.name}" schedule?`,
      action: async () => {
        try {
          setIsProcessing(true);
          await new Promise(resolve => setTimeout(resolve, 500));
          
          setEnergySchedules(prev => prev.filter(s => s.id !== scheduleId));
          
          toast({
            title: 'Schedule Deleted',
            description: `"${schedule.name}" schedule has been removed.`,
            type: 'success',
          });
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to delete schedule. Please try again.',
            type: 'error',
          });
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  const handleToggleAlert = async (alertId: number) => {
    try {
      setEnergyAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, enabled: !alert.enabled } : alert
      ));
      
      const alert = energyAlerts.find(a => a.id === alertId);
      toast({
        title: 'Alert Updated',
        description: `${alert?.type} alert has been ${alert?.enabled ? 'disabled' : 'enabled'}.`,
        type: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update alert. Please try again.',
        type: 'error',
      });
    }
  };

  const handleToggleSchedule = async (scheduleId: number) => {
    try {
      setEnergySchedules(prev => prev.map(schedule => 
        schedule.id === scheduleId ? { ...schedule, enabled: !schedule.enabled } : schedule
      ));
      
      const schedule = energySchedules.find(s => s.id === scheduleId);
      toast({
        title: 'Schedule Updated',
        description: `"${schedule?.name}" schedule has been ${schedule?.enabled ? 'disabled' : 'enabled'}.`,
        type: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update schedule. Please try again.',
        type: 'error',
      });
    }
  };

  // Enhanced tip handling
  const handleApplyTip = async (tipId: number) => {
    try {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (appliedTips.includes(tipId)) {
        setAppliedTips(prev => prev.filter(id => id !== tipId));
        toast({
          title: 'Tip Removed',
          description: 'The energy saving tip has been removed.',
          type: 'info',
        });
      } else {
        setAppliedTips(prev => [...prev, tipId]);
        const tip = energyData.tips.find(t => t.id === tipId);
        toast({
          title: 'Tip Applied',
          description: `Great! Expected savings: ${tip?.savings}`,
          type: 'success',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update tip. Please try again.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewTipDetails = (tip: any) => {
    setSelectedTip(tip);
    setShowTipDetailsModal(true);
  };

  // Data export and utility functions
  const handleExportData = async () => {
    try {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const csvData = energyData.hourly.map(h => `${h.hour},${h.usage},${h.cost}`).join('\n');
      const blob = new Blob([`Hour,Usage (kWh),Cost ($)\n${csvData}`], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `energy-data-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Data Exported',
        description: 'Your energy data has been downloaded successfully.',
        type: 'success',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export data. Please try again.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEnergyModeChange = async (mode: string) => {
    try {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Energy Mode Changed',
        description: `Switched to ${mode} mode. Your devices are being optimized.`,
        type: 'success',
      });
    } catch (error) {
      toast({
        title: 'Mode Change Failed',
        description: 'Failed to change energy mode. Please try again.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Mock data for home energy
  const energyData = {
    current: {
      usage: 3.2, // kWh current hour
      cost: 0.38, // $ current hour
      peak: false,
      efficiency: 92 // %
    },
    summary: {
      today: { usage: 24.7, cost: 2.96, vs_yesterday: -8 },
      week: { usage: 186.3, cost: 22.36, vs_last_week: -12 },
      month: { usage: 847.2, cost: 101.66, vs_last_month: -15 }
    },
    breakdown: [
      { category: 'Heating/Cooling', usage: 12.1, percentage: 49, cost: 1.45, color: 'bg-red-500' },
      { category: 'Water Heating', usage: 4.2, percentage: 17, cost: 0.50, color: 'bg-orange-500' },
      { category: 'Lighting', usage: 3.1, percentage: 13, cost: 0.37, color: 'bg-yellow-500' },
      { category: 'Electronics', usage: 2.8, percentage: 11, cost: 0.34, color: 'bg-blue-500' },
      { category: 'Appliances', usage: 2.5, percentage: 10, cost: 0.30, color: 'bg-green-500' }
    ],
    hourly: [
      { hour: '12 AM', usage: 0.8, cost: 0.10 },
      { hour: '1 AM', usage: 0.7, cost: 0.08 },
      { hour: '2 AM', usage: 0.6, cost: 0.07 },
      { hour: '3 AM', usage: 0.6, cost: 0.07 },
      { hour: '4 AM', usage: 0.7, cost: 0.08 },
      { hour: '5 AM', usage: 0.8, cost: 0.10 },
      { hour: '6 AM', usage: 1.2, cost: 0.14 },
      { hour: '7 AM', usage: 2.1, cost: 0.25 },
      { hour: '8 AM', usage: 1.8, cost: 0.22 },
      { hour: '9 AM', usage: 1.5, cost: 0.18 },
      { hour: '10 AM', usage: 1.4, cost: 0.17 },
      { hour: '11 AM', usage: 1.6, cost: 0.19 },
      { hour: '12 PM', usage: 1.8, cost: 0.22 },
      { hour: '1 PM', usage: 2.0, cost: 0.24 },
      { hour: '2 PM', usage: 2.2, cost: 0.26 },
      { hour: '3 PM', usage: 2.4, cost: 0.29 },
      { hour: '4 PM', usage: 2.6, cost: 0.31 },
      { hour: '5 PM', usage: 3.1, cost: 0.37 },
      { hour: '6 PM', usage: 3.5, cost: 0.42 },
      { hour: '7 PM', usage: 3.8, cost: 0.46 },
      { hour: '8 PM', usage: 3.2, cost: 0.38 },
      { hour: '9 PM', usage: 2.8, cost: 0.34 },
      { hour: '10 PM', usage: 2.4, cost: 0.29 },
      { hour: '11 PM', usage: 1.6, cost: 0.19 }
    ],
    tips: [
      {
        id: 1,
        title: 'Lower thermostat at night',
        description: 'Set your thermostat 7-10°F lower when sleeping',
        savings: '$18/month',
        difficulty: 'Easy',
        category: 'heating'
      },
      {
        id: 2,
        title: 'Use LED bulbs',
        description: 'Replace remaining incandescent bulbs with LEDs',
        savings: '$8/month',
        difficulty: 'Easy',
        category: 'lighting'
      },
      {
        id: 3,
        title: 'Unplug electronics when not in use',
        description: 'Eliminate phantom power draw from devices',
        savings: '$5/month',
        difficulty: 'Easy',
        category: 'electronics'
      },
      {
        id: 4,
        title: 'Use cold water for washing',
        description: 'Wash clothes in cold water when possible',
        savings: '$12/month',
        difficulty: 'Medium',
        category: 'appliances'
      }
    ],
    goals: {
      monthly: { target: 800, current: 847.2, percentage: 94 },
      cost: { target: 90, current: 101.66, percentage: 89 }
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    unit, 
    change, 
    icon: Icon,
    color
  }: {
    title: string;
    value: string | number;
    unit: string;
    change?: { value: string; positive: boolean };
    icon: React.ComponentType<any>;
    color: string;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <div className="flex items-baseline mt-2">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
            <p className="ml-1 text-sm text-gray-500 dark:text-gray-400">{unit}</p>
          </div>
          {change && (
            <div className="flex items-center mt-2">
              {change.positive ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-green-500 mr-1" />
              )}
              <span className={`text-sm ${change.positive ? 'text-red-600' : 'text-green-600'}`}>
                {change.value}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  const UsageChart = () => {
    const maxUsage = Math.max(...energyData.hourly.map(h => h.usage));
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Today&apos;s Usage</h3>
            <div className="flex items-center space-x-2">
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
              >
                <option value="usage">Energy (kWh)</option>
                <option value="cost">Cost ($)</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-end space-x-1 h-64">
            {energyData.hourly.map((hour, index) => {
              const value = selectedMetric === 'usage' ? hour.usage : hour.cost;
              const maxValue = selectedMetric === 'usage' ? maxUsage : Math.max(...energyData.hourly.map(h => h.cost));
              const height = (value / maxValue) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                    style={{ height: `${height}%` }}
                    title={`${hour.hour}: ${value} ${selectedMetric === 'usage' ? 'kWh' : '$'}`}
                  ></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 transform rotate-45 origin-left">
                    {hour.hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const BreakdownChart = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Energy Breakdown</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {energyData.breakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded ${item.color}`}></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.category}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.usage} kWh</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">${item.cost}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Visual breakdown bar */}
        <div className="mt-6">
          <div className="flex h-4 rounded-lg overflow-hidden">
            {energyData.breakdown.map((item, index) => (
              <div
                key={index}
                className={item.color}
                style={{ width: `${item.percentage}%` }}
                title={`${item.category}: ${item.percentage}%`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const SavingsTips = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Personalized Savings Tips</h3>
          <span className="text-sm text-gray-500">
            {appliedTips.length}/{energyData.tips.length} Applied
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {energyData.tips.map((tip) => (
            <div key={tip.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{tip.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{tip.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      {tip.savings}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      {tip.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button 
                    onClick={() => handleViewTipDetails(tip)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleApplyTip(tip.id)}
                    disabled={isProcessing}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      appliedTips.includes(tip.id)
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {appliedTips.includes(tip.id) ? 'Applied ✓' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const EnhancedGoalsSection = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Energy Goals</h3>
          <button 
            onClick={() => setShowGoalModal(true)}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit Goals
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {/* Usage Goal */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Usage Goal</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {goals.monthly.current} / {goals.monthly.target} kWh
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
              <div 
                className={`h-3 rounded-full transition-all ${goals.monthly.percentage <= 100 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(goals.monthly.percentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {goals.monthly.percentage <= 100 ? 'On track!' : 'Over target'} 
              ({goals.monthly.percentage}% of goal)
            </p>
          </div>

          {/* Cost Goal */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Budget Goal</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ${goals.cost.current} / ${goals.cost.target}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
              <div 
                className={`h-3 rounded-full transition-all ${goals.cost.percentage <= 100 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(goals.cost.percentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {goals.cost.percentage <= 100 ? 'On track!' : 'Over budget'} 
              ({goals.cost.percentage}% of budget)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setShowAlertModal(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
            >
              <BellIcon className="h-4 w-4 mr-2" />
              Setup Alerts
            </button>
            <button 
              onClick={handleExportData}
              disabled={isProcessing}
              className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const EnergyAlertsSection = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Energy Alerts</h3>
          <button 
            onClick={() => setShowAlertModal(true)}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm text-white flex items-center space-x-1"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Alert</span>
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {energyAlerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${alert.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{alert.type} Alert</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Notify when {alert.type} exceeds {alert.threshold}{alert.type === 'cost' ? '$' : ' kWh'} per {alert.period}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleAlert(alert.id)}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    alert.enabled 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {alert.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const EnergySchedulesSection = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Energy Schedules</h3>
          <button 
            onClick={() => setShowScheduleModal(true)}
            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm text-white flex items-center space-x-1"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Schedule</span>
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {energySchedules.map((schedule) => (
            <div key={schedule.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${schedule.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{schedule.name}</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {schedule.startTime} - {schedule.endTime} • {schedule.energyMode} mode
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleSchedule(schedule.id)}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    schedule.enabled 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {schedule.enabled ? 'Active' : 'Inactive'}
                </button>
                <button
                  onClick={() => handleDeleteSchedule(schedule.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const EnergyModesSection = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Energy Modes</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => handleEnergyModeChange('eco')}
            disabled={isProcessing}
            className="p-4 border-2 border-green-200 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center"
          >
            <LightBulbIcon className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <h4 className="font-medium text-green-800">Eco Mode</h4>
            <p className="text-sm text-green-600">Optimize for energy savings</p>
          </button>
          <button 
            onClick={() => handleEnergyModeChange('comfort')}
            disabled={isProcessing}
            className="p-4 border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center"
          >
            <HomeIcon className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <h4 className="font-medium text-blue-800">Comfort Mode</h4>
            <p className="text-sm text-blue-600">Balance comfort and efficiency</p>
          </button>
          <button 
            onClick={() => handleEnergyModeChange('away')}
            disabled={isProcessing}
            className="p-4 border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
          >
            <ShieldCheckIcon className="h-8 w-8 mx-auto text-gray-600 mb-2" />
            <h4 className="font-medium text-gray-800">Away Mode</h4>
            <p className="text-sm text-gray-600">Minimize energy usage</p>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Smart Energy Dashboard</h1>
            <p className="text-green-100 mt-1">Monitor, manage, and optimize your home&apos;s energy usage</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-green-100">Current Usage</div>
            <div className="text-2xl font-bold">{energyData.current.usage} kWh</div>
            <div className="text-sm text-green-100">${energyData.current.cost}/hour</div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Usage"
          value={energyData.summary.today.usage}
          unit="kWh"
          icon={BoltIcon}
          color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20"
          change={{ value: `${Math.abs(energyData.summary.today.vs_yesterday)}% less`, positive: false }}
        />
        <StatCard
          title="Today's Cost"
          value={`$${energyData.summary.today.cost}`}
          unit=""
          icon={CurrencyDollarIcon}
          color="bg-green-100 text-green-600 dark:bg-green-900/20"
          change={{ value: `$${(energyData.summary.today.cost * Math.abs(energyData.summary.today.vs_yesterday) / 100).toFixed(2)} saved`, positive: false }}
        />
        <StatCard
          title="This Week"
          value={energyData.summary.week.usage}
          unit="kWh"
          icon={CalendarIcon}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/20"
          change={{ value: `${Math.abs(energyData.summary.week.vs_last_week)}% less`, positive: false }}
        />
        <StatCard
          title="Efficiency"
          value={energyData.current.efficiency}
          unit="%"
          icon={ChartBarIcon}
          color="bg-purple-100 text-purple-600 dark:bg-purple-900/20"
        />
      </div>

      {/* Energy Modes Quick Access */}
      <EnergyModesSection />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UsageChart />
        <BreakdownChart />
      </div>

      {/* Savings and Goals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SavingsTips />
        <EnhancedGoalsSection />
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnergyAlertsSection />
        <EnergySchedulesSection />
      </div>

      {/* Current Rate Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100">Current Rate Information</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
              You&apos;re currently being charged at the standard rate of $0.12/kWh. 
              {energyData.current.peak ? (
                <span className="font-medium"> Peak hours are in effect (higher rates).</span>
              ) : (
                <span> Peak hours: 2 PM - 8 PM weekdays (higher rates).</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Goal Setting Modal */}
      <Modal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        title="Set Energy Goals"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Goal Type
            </label>
            <select
              value={goalForm.type}
              onChange={createGoalHandler('type')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="usage">Energy Usage (kWh)</option>
              <option value="cost">Energy Cost ($)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Amount
            </label>
            <input
              type="number"
              value={goalForm.target}
              onChange={createGoalHandler('target')}
              placeholder={goalForm.type === 'usage' ? 'kWh' : '$'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time Period
            </label>
            <select
              value={goalForm.period}
              onChange={createGoalHandler('period')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setShowGoalModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateGoal}
              disabled={isProcessing || !goalForm.target}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg"
            >
              {isProcessing ? 'Saving...' : 'Set Goal'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Alert Creation Modal */}
      <Modal
        isOpen={showAlertModal}
        onClose={() => {
          setShowAlertModal(false);
          setAlertForm({
            type: 'usage',
            threshold: 30,
            period: 'daily',
            enabled: true
          });
        }}
        title="Create Energy Alert"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alert Type
            </label>
            <select
              value={alertForm.type}
              onChange={createAlertHandler('type')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="usage">Usage Alert (kWh)</option>
              <option value="cost">Cost Alert ($)</option>
              <option value="peak">Peak Rate Alert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Threshold
            </label>
            <input
              type="number"
              value={alertForm.threshold}
              onChange={createAlertHandler('threshold')}
              placeholder={alertForm.type === 'cost' ? 'Dollar amount' : 'kWh amount'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time Period
            </label>
            <select
              value={alertForm.period}
              onChange={createAlertHandler('period')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="realtime">Real-time</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="alert-enabled"
              checked={alertForm.enabled}
              onChange={createAlertHandler('enabled')}
              className="mr-2"
            />
            <label htmlFor="alert-enabled" className="text-sm text-gray-700 dark:text-gray-300">
              Enable this alert
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => {
                setShowAlertModal(false);
                setAlertForm({
                  type: 'usage',
                  threshold: 30,
                  period: 'daily',
                  enabled: true
                });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAlert}
              disabled={isProcessing || !alertForm.threshold}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg"
            >
              {isProcessing ? 'Creating...' : 'Create Alert'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Schedule Creation Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setScheduleForm({
            name: '',
            startTime: '',
            endTime: '',
            days: [],
            energyMode: 'eco',
            devices: []
          });
        }}
        title="Create Energy Schedule"
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
              placeholder="e.g., Work Hours, Sleep Mode"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={scheduleForm.startTime}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={scheduleForm.endTime}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Days of Week
            </label>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <button
                  key={day}
                  onClick={() => {
                    const dayIndex = index;
                    setScheduleForm(prev => ({
                      ...prev,
                      days: prev.days.includes(dayIndex)
                        ? prev.days.filter(d => d !== dayIndex)
                        : [...prev.days, dayIndex]
                    }));
                  }}
                  className={`py-2 px-3 text-xs font-medium rounded ${
                    scheduleForm.days.includes(index)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Energy Mode
            </label>
            <select
              value={scheduleForm.energyMode}
              onChange={(e) => setScheduleForm(prev => ({ ...prev, energyMode: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="eco">Eco Mode</option>
              <option value="comfort">Comfort Mode</option>
              <option value="away">Away Mode</option>
              <option value="sleep">Sleep Mode</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => {
                setShowScheduleModal(false);
                setScheduleForm({
                  name: '',
                  startTime: '',
                  endTime: '',
                  days: [],
                  energyMode: 'eco',
                  devices: []
                });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSchedule}
              disabled={isProcessing || !scheduleForm.name || !scheduleForm.startTime || !scheduleForm.endTime}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg"
            >
              {isProcessing ? 'Creating...' : 'Create Schedule'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Tip Details Modal */}
      <Modal
        isOpen={showTipDetailsModal}
        onClose={() => {
          setShowTipDetailsModal(false);
          setSelectedTip(null);
        }}
        title="Energy Saving Tip Details"
      >
        {selectedTip && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{selectedTip.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{selectedTip.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <span className="text-sm font-medium text-green-800 dark:text-green-400">Potential Savings</span>
                <p className="text-lg font-semibold text-green-900 dark:text-green-300">{selectedTip.savings}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-400">Difficulty</span>
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-300">{selectedTip.difficulty}</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  handleApplyTip(selectedTip.id);
                  setShowTipDetailsModal(false);
                  setSelectedTip(null);
                }}
                disabled={isProcessing}
                className={`w-full px-4 py-2 rounded-lg font-medium ${
                  appliedTips.includes(selectedTip.id)
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {appliedTips.includes(selectedTip.id) ? 'Remove from Applied Tips' : 'Apply This Tip'}
              </button>
            </div>
          </div>
        )}
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

export default function ConsumerEnergy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ConsumerEnergyContent />
    </div>
  );
}
