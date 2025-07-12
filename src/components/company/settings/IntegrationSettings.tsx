'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { useToast } from '@/components/providers/ToastProvider';
import {
  GlobeAltIcon,
  WifiIcon,
  CloudIcon,
  CpuChipIcon,
  ServerIcon,
  KeyIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  LinkIcon,
  SignalIcon,
  BoltIcon,
  CircleStackIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  Cog8ToothIcon
} from '@heroicons/react/24/outline';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface IntegrationEndpoint {
  id: string;
  name: string;
  type: 'rest' | 'graphql' | 'webhook' | 'websocket';
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  authentication?: {
    type: 'none' | 'basic' | 'bearer' | 'apikey' | 'oauth2';
    credentials?: Record<string, string>;
  };
  status: 'active' | 'inactive' | 'error';
  lastTested?: Date;
  responseTime?: number;
  errorMessage?: string;
}

interface ProtocolConfig {
  id: string;
  name: string;
  protocol: 'modbus' | 'mqtt' | 'opcua' | 'bacnet' | 'ethernet_ip' | 'profinet' | 'hart' | 'foundation_fieldbus';
  enabled: boolean;
  config: Record<string, any>;
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  lastConnection?: Date;
  deviceCount?: number;
  errorMessage?: string;
}

interface IntegrationSettingsProps {
  onSave?: (data: any) => void;
  readOnly?: boolean;
}

/**
 * Integration Settings Component
 * Manage API endpoints and industrial protocols
 */
export default function IntegrationSettings({ onSave, readOnly = false }: IntegrationSettingsProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('apis');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [testingConnection, setTestingConnection] = useState<{ [key: string]: boolean }>({});

  // API endpoints state
  const [apiEndpoints, setApiEndpoints] = useState<IntegrationEndpoint[]>([
    {
      id: 'erp-system',
      name: 'ERP System Integration',
      type: 'rest',
      url: 'https://erp.company.com/api/v1',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      authentication: {
        type: 'bearer',
        credentials: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      },
      status: 'active',
      lastTested: new Date(),
      responseTime: 245
    },
    {
      id: 'weather-api',
      name: 'Weather Service API',
      type: 'rest',
      url: 'https://api.weatherapi.com/v1',
      method: 'GET',
      headers: {},
      authentication: {
        type: 'apikey',
        credentials: { key: 'your-api-key-here' }
      },
      status: 'active',
      lastTested: new Date(),
      responseTime: 128
    }
  ]);

  // Protocol configurations state
  const [protocolConfigs, setProtocolConfigs] = useState<ProtocolConfig[]>([
    {
      id: 'modbus-tcp',
      name: 'Modbus TCP/IP',
      protocol: 'modbus',
      enabled: true,
      config: {
        host: '192.168.1.100',
        port: 502,
        timeout: 5000,
        retries: 3
      },
      status: 'connected',
      lastConnection: new Date(),
      deviceCount: 12
    },
    {
      id: 'mqtt-broker',
      name: 'MQTT Broker',
      protocol: 'mqtt',
      enabled: true,
      config: {
        broker: 'mqtt.company.com',
        port: 1883,
        clientId: 'iot-platform',
        username: 'mqtt-user',
        password: 'mqtt-password',
        keepAlive: 60,
        qos: 1
      },
      status: 'connected',
      lastConnection: new Date(),
      deviceCount: 45
    },
    {
      id: 'opcua-server',
      name: 'OPC UA Server',
      protocol: 'opcua',
      enabled: true,
      config: {
        endpoint: 'opc.tcp://plc.company.com:4840',
        securityMode: 'SignAndEncrypt',
        securityPolicy: 'Basic256Sha256',
        username: 'opcua-user',
        password: 'opcua-password'
      },
      status: 'connected',
      lastConnection: new Date(),
      deviceCount: 8
    },
    {
      id: 'bacnet-ip',
      name: 'BACnet/IP',
      protocol: 'bacnet',
      enabled: false,
      config: {
        port: 47808,
        broadcastAddress: '192.168.1.255',
        deviceId: 1001
      },
      status: 'disconnected',
      deviceCount: 0
    }
  ]);

  // Form data for new/edit items
  interface FormData {
    [key: string]: any;
    name?: string;
    type?: string;
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    authentication?: { type: string; [key: string]: any };
    protocol?: string;
    enabled?: boolean;
    config?: Record<string, any>;
  }
  
  const [formData, setFormData] = useState<FormData>({});

  // Initialize settings
  useEffect(() => {
    const initializeSettings = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    };

    initializeSettings();
  }, []);

  // Test API endpoint connection
  const testApiConnection = useCallback(async (endpoint: IntegrationEndpoint) => {
    setTestingConnection(prev => ({ ...prev, [endpoint.id]: true }));
    
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update endpoint status
      setApiEndpoints(prev => prev.map(ep => 
        ep.id === endpoint.id 
          ? { ...ep, status: 'active', lastTested: new Date(), responseTime: Math.floor(Math.random() * 500) + 50 }
          : ep
      ));
      
      showToast({
        title: 'Connection Test Successful',
        message: `${endpoint.name} is responding correctly`,
        type: 'success'
      });
    } catch (error) {
      setApiEndpoints(prev => prev.map(ep => 
        ep.id === endpoint.id 
          ? { ...ep, status: 'error', errorMessage: 'Connection failed' }
          : ep
      ));
      
      showToast({
        title: 'Connection Test Failed',
        message: `Failed to connect to ${endpoint.name}`,
        type: 'error'
      });
    } finally {
      setTestingConnection(prev => ({ ...prev, [endpoint.id]: false }));
    }
  }, [showToast]);

  // Test protocol connection
  const testProtocolConnection = useCallback(async (protocol: ProtocolConfig) => {
    setTestingConnection(prev => ({ ...prev, [protocol.id]: true }));
    
    try {
      // Simulate protocol test
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update protocol status
      setProtocolConfigs(prev => prev.map(p => 
        p.id === protocol.id 
          ? { ...p, status: 'connected', lastConnection: new Date(), errorMessage: undefined }
          : p
      ));
      
      showToast({
        title: 'Protocol Test Successful',
        message: `${protocol.name} connection established`,
        type: 'success'
      });
    } catch (error) {
      setProtocolConfigs(prev => prev.map(p => 
        p.id === protocol.id 
          ? { ...p, status: 'error', errorMessage: 'Connection failed' }
          : p
      ));
      
      showToast({
        title: 'Protocol Test Failed',
        message: `Failed to connect to ${protocol.name}`,
        type: 'error'
      });
    } finally {
      setTestingConnection(prev => ({ ...prev, [protocol.id]: false }));
    }
  }, [showToast]);

  // Toggle protocol enabled state
  const toggleProtocol = useCallback(async (protocolId: string) => {
    setProtocolConfigs(prev => prev.map(p => 
      p.id === protocolId 
        ? { ...p, enabled: !p.enabled, status: !p.enabled ? 'configuring' : 'disconnected' }
        : p
    ));
    
    setIsModified(true);
    
    // Simulate configuration change
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setProtocolConfigs(prev => prev.map(p => 
      p.id === protocolId 
        ? { ...p, status: p.enabled ? 'connected' : 'disconnected' }
        : p
    ));
  }, []);

  // Save settings
  const handleSave = useCallback(async () => {
    if (!isModified) return;

    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSave) {
        onSave({ apiEndpoints, protocolConfigs });
      }
      
      setIsModified(false);
      
      showToast({
        title: 'Settings Saved',
        message: 'Integration settings have been updated successfully',
        type: 'success'
      });
    } catch (error) {
      showToast({
        title: 'Save Failed',
        message: 'Failed to save integration settings. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  }, [apiEndpoints, protocolConfigs, isModified, onSave, showToast]);

  // Open modal for adding/editing items
  const openModal = (type: 'add' | 'edit', item?: any) => {
    setModalType(type);
    setSelectedItem(item);
    
    if (type === 'edit' && item) {
      setFormData(item);
    } else {
      setFormData(activeTab === 'apis' ? {
        name: '',
        type: 'rest',
        url: '',
        method: 'GET',
        headers: {},
        authentication: { type: 'none' }
      } : {
        name: '',
        protocol: 'modbus',
        enabled: true,
        config: {}
      });
    }
    
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!formData.name || (activeTab === 'apis' && !formData.url)) {
      showToast({
        title: 'Validation Error',
        message: 'Please fill in all required fields',
        type: 'error'
      });
      return;
    }

    const id = modalType === 'edit' ? selectedItem.id : `${activeTab}-${Date.now()}`;
    
    if (activeTab === 'apis') {
      const newItem: IntegrationEndpoint = { 
        ...formData, 
        id, 
        status: 'inactive',
        name: formData.name || '',
        type: (formData.type || 'rest') as 'rest' | 'graphql' | 'webhook' | 'websocket',
        url: formData.url || '',
        method: (formData.method || 'GET') as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        headers: formData.headers || {},
        authentication: { 
          type: (formData.authentication?.type || 'none') as 'none' | 'basic' | 'bearer' | 'apikey' | 'oauth2',
          credentials: formData.authentication?.credentials || {}
        }
      };
      setApiEndpoints(prev => 
        modalType === 'edit' 
          ? prev.map(ep => ep.id === id ? newItem : ep)
          : [...prev, newItem]
      );
    } else {
      const newItem: ProtocolConfig = { 
        ...formData, 
        id, 
        status: 'disconnected',
        name: formData.name || '',
        protocol: (formData.protocol || 'modbus') as 'modbus' | 'mqtt' | 'opcua' | 'bacnet' | 'ethernet_ip' | 'profinet' | 'hart' | 'foundation_fieldbus',
        enabled: formData.enabled || true,
        config: formData.config || {}
      };
      setProtocolConfigs(prev => 
        modalType === 'edit' 
          ? prev.map(p => p.id === id ? newItem : p)
          : [...prev, newItem]
      );
    }

    setIsModified(true);
    setShowModal(false);
    
    showToast({
      title: `${modalType === 'edit' ? 'Updated' : 'Added'} Successfully`,
      message: `${formData.name} has been ${modalType === 'edit' ? 'updated' : 'added'}`,
      type: 'success'
    });
  }, [formData, modalType, selectedItem, activeTab, showToast]);

  // Delete item
  const handleDelete = useCallback(async (id: string) => {
    if (activeTab === 'apis') {
      setApiEndpoints(prev => prev.filter(ep => ep.id !== id));
    } else {
      setProtocolConfigs(prev => prev.filter(p => p.id !== id));
    }

    setIsModified(true);
    setShowConfirmDialog(false);
    
    showToast({
      title: 'Deleted Successfully',
      message: 'Item has been removed',
      type: 'success'
    });
  }, [activeTab, showToast]);

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'configuring':
        return <ClockIcon className="h-5 w-5 text-yellow-500 animate-pulse" />;
      default:
        return <XCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  // Get protocol icon
  const getProtocolIcon = (protocol: string) => {
    switch (protocol) {
      case 'modbus':
        return <CpuChipIcon className="h-5 w-5 text-blue-500" />;
      case 'mqtt':
        return <WifiIcon className="h-5 w-5 text-green-500" />;
      case 'opcua':
        return <ServerIcon className="h-5 w-5 text-purple-500" />;
      case 'bacnet':
        return <CircleStackIcon className="h-5 w-5 text-orange-500" />;
      case 'ethernet_ip':
        return <LinkIcon className="h-5 w-5 text-blue-600" />;
      case 'profinet':
        return <SignalIcon className="h-5 w-5 text-red-500" />;
      case 'hart':
        return <BoltIcon className="h-5 w-5 text-yellow-500" />;
      case 'foundation_fieldbus':
        return <ComputerDesktopIcon className="h-5 w-5 text-indigo-500" />;
      default:
        return <Cog8ToothIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const tabs = [
    { id: 'apis', name: 'API Endpoints', icon: GlobeAltIcon },
    { id: 'protocols', name: 'Industrial Protocols', icon: CpuChipIcon },
    { id: 'cloud', name: 'Cloud Services', icon: CloudIcon },
    { id: 'webhooks', name: 'Webhooks', icon: LinkIcon }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Integration Settings
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage API endpoints and industrial protocol configurations
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {isModified && (
                <span className="text-sm text-orange-600 dark:text-orange-400">
                  Unsaved changes
                </span>
              )}
              <button
                onClick={() => openModal('add')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add {activeTab === 'apis' ? 'Endpoint' : 'Protocol'}</span>
              </button>
              {!readOnly && (
                <button
                  onClick={handleSave}
                  disabled={!isModified || isSaving}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  {isSaving ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircleIcon className="h-4 w-4" />
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {activeTab === 'apis' && (
          <div className="p-6">
            <div className="space-y-4">
              {apiEndpoints.map((endpoint) => (
                <div key={endpoint.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(endpoint.status)}
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {endpoint.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {endpoint.type.toUpperCase()} - {endpoint.url}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => testApiConnection(endpoint)}
                        disabled={testingConnection[endpoint.id]}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                      >
                        {testingConnection[endpoint.id] ? (
                          <ArrowPathIcon className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircleIcon className="h-3 w-3" />
                        )}
                        <span>{testingConnection[endpoint.id] ? 'Testing...' : 'Test'}</span>
                      </button>
                      <button
                        onClick={() => openModal('edit', endpoint)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedItem(endpoint);
                          setShowConfirmDialog(true);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {endpoint.status === 'active' && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Last tested: {endpoint.lastTested?.toLocaleString()} • 
                      Response time: {endpoint.responseTime}ms
                    </div>
                  )}
                  
                  {endpoint.status === 'error' && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                      Error: {endpoint.errorMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'protocols' && (
          <div className="p-6">
            <div className="space-y-4">
              {protocolConfigs.map((protocol) => (
                <div key={protocol.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getProtocolIcon(protocol.protocol)}
                      {getStatusIcon(protocol.status)}
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {protocol.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {protocol.protocol.toUpperCase()} • {protocol.deviceCount} devices
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleProtocol(protocol.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          protocol.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            protocol.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => testProtocolConnection(protocol)}
                        disabled={testingConnection[protocol.id] || !protocol.enabled}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                      >
                        {testingConnection[protocol.id] ? (
                          <ArrowPathIcon className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircleIcon className="h-3 w-3" />
                        )}
                        <span>{testingConnection[protocol.id] ? 'Testing...' : 'Test'}</span>
                      </button>
                      <button
                        onClick={() => openModal('edit', protocol)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedItem(protocol);
                          setShowConfirmDialog(true);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {protocol.status === 'connected' && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Connected: {protocol.lastConnection?.toLocaleString()}
                    </div>
                  )}
                  
                  {protocol.status === 'error' && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                      Error: {protocol.errorMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'cloud' && (
          <div className="p-6">
            <div className="text-center py-8">
              <CloudIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Cloud Services</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Cloud integration settings coming soon
              </p>
            </div>
          </div>
        )}

        {activeTab === 'webhooks' && (
          <div className="p-6">
            <div className="text-center py-8">
              <LinkIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Webhooks</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Webhook configuration coming soon
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={`${modalType === 'add' ? 'Add' : 'Edit'} ${activeTab === 'apis' ? 'API Endpoint' : 'Protocol'}`}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter name"
              />
            </div>

            {activeTab === 'apis' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type
                    </label>
                    <select
                      value={formData.type || 'rest'}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="rest">REST API</option>
                      <option value="graphql">GraphQL</option>
                      <option value="websocket">WebSocket</option>
                      <option value="webhook">Webhook</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Method
                    </label>
                    <select
                      value={formData.method || 'GET'}
                      onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL *
                  </label>
                  <input
                    type="url"
                    value={formData.url || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="https://api.example.com"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Protocol
                  </label>
                  <select
                    value={formData.protocol || 'modbus'}
                    onChange={(e) => setFormData(prev => ({ ...prev, protocol: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="modbus">Modbus TCP/RTU</option>
                    <option value="mqtt">MQTT</option>
                    <option value="opcua">OPC UA</option>
                    <option value="bacnet">BACnet</option>
                    <option value="ethernet_ip">Ethernet/IP</option>
                    <option value="profinet">PROFINET</option>
                    <option value="hart">HART</option>
                    <option value="foundation_fieldbus">Foundation Fieldbus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Configuration
                  </label>
                  <textarea
                    value={JSON.stringify(formData.config || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const config = JSON.parse(e.target.value);
                        setFormData(prev => ({ ...prev, config }));
                      } catch (error) {
                        // Handle JSON parsing errors
                      }
                    }}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                    placeholder="Enter configuration as JSON"
                  />
                </div>
              </>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {modalType === 'add' ? 'Add' : 'Update'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {showConfirmDialog && (
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={() => handleDelete(selectedItem?.id)}
          title="Delete Item"
          message={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
          type="danger"
          confirmText="Delete"
        />
      )}
    </div>
  );
}
