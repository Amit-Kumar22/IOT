import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface SecurityMetrics {
  totalSessions: number;
  activeSessions: number;
  suspiciousActivity: number;
  blockedIPs: number;
  failedLogins: number;
  mfaEnabled: number;
  securityAlerts: number;
  lastSecurityScan: string;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface ActiveSession {
  id: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  location: string;
  device: string;
  browser: string;
  loginTime: string;
  lastActivity: string;
  sessionDuration: number;
  status: 'active' | 'idle' | 'suspicious';
}

interface SecurityAlert {
  id: string;
  type: 'suspicious_login' | 'brute_force' | 'unauthorized_access' | 'data_breach' | 'malware';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  ipAddress: string;
  userEmail?: string;
  resolved: boolean;
  actions: string[];
}

interface IPRestriction {
  id: string;
  ipAddress: string;
  type: 'allow' | 'block';
  reason: string;
  createdAt: string;
  expiresAt?: string;
  createdBy: string;
}

interface AuditLogEntry {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  result: 'success' | 'failure';
  details: any;
}

const SecurityManagementPanel: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [ipRestrictions, setIpRestrictions] = useState<IPRestriction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'sessions' | 'alerts' | 'restrictions' | 'audit'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMetrics: SecurityMetrics = {
        totalSessions: 1247,
        activeSessions: 892,
        suspiciousActivity: 23,
        blockedIPs: 156,
        failedLogins: 45,
        mfaEnabled: 734,
        securityAlerts: 12,
        lastSecurityScan: '2024-01-15T08:00:00Z',
        vulnerabilities: {
          critical: 0,
          high: 2,
          medium: 8,
          low: 15,
        },
      };

      const mockSessions: ActiveSession[] = [
        {
          id: '1',
          userId: 'user1',
          userEmail: 'admin@example.com',
          ipAddress: '192.168.1.100',
          location: 'New York, NY',
          device: 'Desktop',
          browser: 'Chrome 120.0',
          loginTime: '2024-01-15T10:30:00Z',
          lastActivity: '2024-01-15T12:45:00Z',
          sessionDuration: 135,
          status: 'active',
        },
        {
          id: '2',
          userId: 'user2',
          userEmail: 'john.doe@example.com',
          ipAddress: '10.0.0.50',
          location: 'Los Angeles, CA',
          device: 'Mobile',
          browser: 'Safari 17.0',
          loginTime: '2024-01-15T09:15:00Z',
          lastActivity: '2024-01-15T12:30:00Z',
          sessionDuration: 195,
          status: 'active',
        },
        {
          id: '3',
          userId: 'user3',
          userEmail: 'suspicious@example.com',
          ipAddress: '203.0.113.45',
          location: 'Unknown',
          device: 'Desktop',
          browser: 'Firefox 115.0',
          loginTime: '2024-01-15T11:00:00Z',
          lastActivity: '2024-01-15T11:05:00Z',
          sessionDuration: 5,
          status: 'suspicious',
        },
      ];

      const mockAlerts: SecurityAlert[] = [
        {
          id: '1',
          type: 'suspicious_login',
          severity: 'high',
          title: 'Suspicious Login Attempt',
          description: 'Multiple failed login attempts from IP 203.0.113.45',
          timestamp: '2024-01-15T11:00:00Z',
          ipAddress: '203.0.113.45',
          userEmail: 'admin@example.com',
          resolved: false,
          actions: ['Block IP', 'Notify User', 'Require MFA'],
        },
        {
          id: '2',
          type: 'brute_force',
          severity: 'critical',
          title: 'Brute Force Attack Detected',
          description: 'Automated login attempts detected from multiple IPs',
          timestamp: '2024-01-15T10:30:00Z',
          ipAddress: '198.51.100.0/24',
          resolved: false,
          actions: ['Block IP Range', 'Enable Rate Limiting', 'Alert Security Team'],
        },
        {
          id: '3',
          type: 'unauthorized_access',
          severity: 'medium',
          title: 'Unauthorized Access Attempt',
          description: 'User attempted to access restricted admin panel',
          timestamp: '2024-01-15T09:45:00Z',
          ipAddress: '192.168.1.200',
          userEmail: 'user@example.com',
          resolved: true,
          actions: ['Log Incident', 'Notify Admin'],
        },
      ];

      const mockRestrictions: IPRestriction[] = [
        {
          id: '1',
          ipAddress: '203.0.113.45',
          type: 'block',
          reason: 'Suspicious activity detected',
          createdAt: '2024-01-15T11:00:00Z',
          createdBy: 'security-system',
        },
        {
          id: '2',
          ipAddress: '192.168.1.0/24',
          type: 'allow',
          reason: 'Office network whitelist',
          createdAt: '2024-01-01T00:00:00Z',
          createdBy: 'admin@example.com',
        },
        {
          id: '3',
          ipAddress: '198.51.100.0/24',
          type: 'block',
          reason: 'Brute force attack source',
          createdAt: '2024-01-15T10:30:00Z',
          expiresAt: '2024-01-22T10:30:00Z',
          createdBy: 'security-system',
        },
      ];

      const mockAuditLogs: AuditLogEntry[] = [
        {
          id: '1',
          userId: 'admin1',
          userEmail: 'admin@example.com',
          action: 'USER_CREATE',
          resource: 'User: john.doe@example.com',
          timestamp: '2024-01-15T12:00:00Z',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          result: 'success',
          details: { userId: 'user123', role: 'company' },
        },
        {
          id: '2',
          userId: 'admin1',
          userEmail: 'admin@example.com',
          action: 'BILLING_PLAN_UPDATE',
          resource: 'Plan: Professional',
          timestamp: '2024-01-15T11:30:00Z',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          result: 'success',
          details: { planId: 'pro-1', changes: { price: 89.99 } },
        },
        {
          id: '3',
          userId: 'user2',
          userEmail: 'john.doe@example.com',
          action: 'LOGIN_ATTEMPT',
          resource: 'Authentication',
          timestamp: '2024-01-15T11:00:00Z',
          ipAddress: '203.0.113.45',
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          result: 'failure',
          details: { reason: 'Invalid credentials' },
        },
      ];

      setMetrics(mockMetrics);
      setActiveSessions(mockSessions);
      setSecurityAlerts(mockAlerts);
      setIpRestrictions(mockRestrictions);
      setAuditLogs(mockAuditLogs);
    } catch (err) {
      setError('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSecurityData();
    setRefreshing(false);
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err) {
      setError('Failed to terminate session');
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSecurityAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, resolved: true } : alert
      ));
    } catch (err) {
      setError('Failed to resolve alert');
    }
  };

  const handleBlockIP = async (ipAddress: string, reason: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const newRestriction: IPRestriction = {
        id: Date.now().toString(),
        ipAddress,
        type: 'block',
        reason,
        createdAt: new Date().toISOString(),
        createdBy: 'current-admin',
      };
      setIpRestrictions(prev => [newRestriction, ...prev]);
    } catch (err) {
      setError('Failed to block IP');
    }
  };

  const getSessionStatusColor = (status: ActiveSession['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'idle':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspicious':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertSeverityColor = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-red-800 font-medium">Error Loading Security Data</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage system security</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: ShieldCheckIcon },
              { id: 'sessions', label: 'Active Sessions', icon: UserIcon },
              { id: 'alerts', label: 'Security Alerts', icon: ExclamationTriangleIcon },
              { id: 'restrictions', label: 'IP Restrictions', icon: LockClosedIcon },
              { id: 'audit', label: 'Audit Log', icon: DocumentTextIcon },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Security Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Active Sessions</p>
                      <p className="text-2xl font-bold text-green-900">{metrics.activeSessions}</p>
                    </div>
                    <UserIcon className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600">Security Alerts</p>
                      <p className="text-2xl font-bold text-yellow-900">{metrics.securityAlerts}</p>
                    </div>
                    <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600">Blocked IPs</p>
                      <p className="text-2xl font-bold text-red-900">{metrics.blockedIPs}</p>
                    </div>
                    <LockClosedIcon className="w-8 h-8 text-red-600" />
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">MFA Enabled</p>
                      <p className="text-2xl font-bold text-blue-900">{metrics.mfaEnabled}</p>
                    </div>
                    <KeyIcon className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Vulnerability Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vulnerability Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{metrics.vulnerabilities.critical}</div>
                    <div className="text-sm text-gray-600">Critical</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{metrics.vulnerabilities.high}</div>
                    <div className="text-sm text-gray-600">High</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">{metrics.vulnerabilities.medium}</div>
                    <div className="text-sm text-gray-600">Medium</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{metrics.vulnerabilities.low}</div>
                    <div className="text-sm text-gray-600">Low</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Security Events</h3>
                <div className="space-y-4">
                  {securityAlerts.slice(0, 3).map(alert => (
                    <div key={alert.id} className={`p-4 rounded-lg border ${getAlertSeverityColor(alert.severity)}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm mt-1">{alert.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs opacity-75">
                            <span>IP: {alert.ipAddress}</span>
                            <span>{new Date(alert.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {alert.resolved ? 'Resolved' : 'Active'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'sessions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
                <span className="text-sm text-gray-500">{activeSessions.length} active sessions</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Device
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeSessions.map(session => (
                      <tr key={session.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{session.userEmail}</div>
                          <div className="text-sm text-gray-500">{session.ipAddress}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {session.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{session.device}</div>
                          <div className="text-sm text-gray-500">{session.browser}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDuration(session.sessionDuration)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionStatusColor(session.status)}`}>
                            {session.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleTerminateSession(session.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Terminate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Security Alerts</h3>
                <span className="text-sm text-gray-500">{securityAlerts.filter(a => !a.resolved).length} active alerts</span>
              </div>
              <div className="space-y-4">
                {securityAlerts.map(alert => (
                  <div key={alert.id} className={`p-4 rounded-lg border ${getAlertSeverityColor(alert.severity)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{alert.title}</h4>
                          <span className="text-xs uppercase font-medium">{alert.severity}</span>
                        </div>
                        <p className="text-sm mt-1">{alert.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs opacity-75">
                          <span>IP: {alert.ipAddress}</span>
                          {alert.userEmail && <span>User: {alert.userEmail}</span>}
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-3">
                          {alert.actions.map((action, index) => (
                            <button
                              key={index}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {alert.resolved ? 'Resolved' : 'Active'}
                        </span>
                        {!alert.resolved && (
                          <button
                            onClick={() => handleResolveAlert(alert.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircleIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'restrictions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">IP Restrictions</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Add Restriction
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expires
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ipRestrictions.map(restriction => (
                      <tr key={restriction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {restriction.ipAddress}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            restriction.type === 'allow' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {restriction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {restriction.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(restriction.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {restriction.expiresAt ? new Date(restriction.expiresAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-red-600 hover:text-red-900">
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Audit Log</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Export Log
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resource
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Result
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {log.userEmail}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.action}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.resource}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            log.result === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.result}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.ipAddress}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityManagementPanel;
