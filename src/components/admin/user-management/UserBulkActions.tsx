import React, { useState } from 'react';
import {
  BoltIcon,
  UserGroupIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { UserBulkOperation, UserRole } from '@/types/userManagement';

interface UserBulkActionsProps {
  selectedUserIds: string[];
  onBulkOperation: (operation: UserBulkOperation) => void;
  onClearSelection: () => void;
  loading?: boolean;
}

const UserBulkActions: React.FC<UserBulkActionsProps> = ({
  selectedUserIds,
  onBulkOperation,
  onClearSelection,
  loading = false,
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingOperation, setPendingOperation] = useState<UserBulkOperation | null>(null);
  const [operationParams, setOperationParams] = useState<{
    newRole?: UserRole;
    companyId?: string;
    reason?: string;
  }>({});

  const handleBulkAction = (type: UserBulkOperation['type']) => {
    const operation: UserBulkOperation = {
      type,
      userIds: selectedUserIds,
      params: operationParams,
    };

    // Show confirmation dialog for destructive actions
    if (type === 'delete' || type === 'deactivate') {
      setPendingOperation(operation);
      setShowConfirmDialog(true);
    } else {
      onBulkOperation(operation);
    }
  };

  const confirmOperation = () => {
    if (pendingOperation) {
      onBulkOperation(pendingOperation);
      setShowConfirmDialog(false);
      setPendingOperation(null);
      setOperationParams({});
    }
  };

  const cancelOperation = () => {
    setShowConfirmDialog(false);
    setPendingOperation(null);
    setOperationParams({});
  };

  const bulkActions = [
    {
      id: 'activate',
      label: 'Activate Users',
      icon: CheckCircleIcon,
      color: 'bg-green-600 hover:bg-green-700',
      description: 'Activate selected users',
    },
    {
      id: 'deactivate',
      label: 'Deactivate Users',
      icon: XMarkIcon,
      color: 'bg-yellow-600 hover:bg-yellow-700',
      description: 'Deactivate selected users',
    },
    {
      id: 'delete',
      label: 'Delete Users',
      icon: TrashIcon,
      color: 'bg-red-600 hover:bg-red-700',
      description: 'Permanently delete selected users',
    },
    {
      id: 'export',
      label: 'Export Users',
      icon: DocumentArrowDownIcon,
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Export selected users to CSV',
    },
    {
      id: 'changeRole',
      label: 'Change Role',
      icon: ShieldCheckIcon,
      color: 'bg-purple-600 hover:bg-purple-700',
      description: 'Change role for selected users',
    },
    {
      id: 'assignCompany',
      label: 'Assign Company',
      icon: BuildingOfficeIcon,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      description: 'Assign company to selected users',
    },
  ];

  if (selectedUserIds.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BoltIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Bulk Actions
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                {selectedUserIds.length} selected
              </span>
            </div>
            <button
              onClick={onClearSelection}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {bulkActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleBulkAction(action.id as UserBulkOperation['type'])}
                disabled={loading}
                className={`
                  flex flex-col items-center p-3 rounded-lg text-white transition-all duration-200
                  ${action.color}
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                `}
                title={action.description}
              >
                <action.icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium text-center">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Role Change Form */}
          {pendingOperation?.type === 'changeRole' && (
            <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
                Change Role for {selectedUserIds.length} users
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select
                  value={operationParams.newRole || ''}
                  onChange={(e) => setOperationParams(prev => ({ ...prev, newRole: e.target.value as UserRole }))}
                  className="block w-full px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select new role</option>
                  <option value="admin">Admin</option>
                  <option value="company">Company</option>
                  <option value="consumer">Consumer</option>
                </select>
                <input
                  type="text"
                  placeholder="Reason (optional)"
                  value={operationParams.reason || ''}
                  onChange={(e) => setOperationParams(prev => ({ ...prev, reason: e.target.value }))}
                  className="block w-full px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Company Assignment Form */}
          {pendingOperation?.type === 'assignCompany' && (
            <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-2">
                Assign Company to {selectedUserIds.length} users
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Company ID"
                  value={operationParams.companyId || ''}
                  onChange={(e) => setOperationParams(prev => ({ ...prev, companyId: e.target.value }))}
                  className="block w-full px-3 py-2 border border-indigo-300 dark:border-indigo-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Reason (optional)"
                  value={operationParams.reason || ''}
                  onChange={(e) => setOperationParams(prev => ({ ...prev, reason: e.target.value }))}
                  className="block w-full px-3 py-2 border border-indigo-300 dark:border-indigo-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && pendingOperation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Confirm Bulk Action
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Are you sure you want to{' '}
                  <span className="font-medium">
                    {pendingOperation.type === 'delete' ? 'delete' : 'deactivate'}
                  </span>{' '}
                  <span className="font-medium">{selectedUserIds.length}</span> selected users?
                </p>

                {pendingOperation.type === 'delete' && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      <strong>Warning:</strong> This will permanently delete all selected users and their associated data.
                    </p>
                  </div>
                )}

                {pendingOperation.type === 'deactivate' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Reason (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter reason for deactivation..."
                      value={operationParams.reason || ''}
                      onChange={(e) => setOperationParams(prev => ({ ...prev, reason: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelOperation}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmOperation}
                  disabled={loading}
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium text-white transition-colors
                    ${pendingOperation.type === 'delete' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-yellow-600 hover:bg-yellow-700'
                    }
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {loading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserBulkActions;
