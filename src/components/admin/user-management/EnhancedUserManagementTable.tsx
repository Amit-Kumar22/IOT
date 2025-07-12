import React, { useState, useCallback, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  PaginationState,
} from '@tanstack/react-table';
import {
  MagnifyingGlassIcon,
  UserIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { AdminUser } from '@/types/admin';
import { UserManagementTableProps, UserRole, UserStatus } from '@/types/userManagement';
import { formatDistance } from 'date-fns';

interface EnhancedUserManagementTableProps extends UserManagementTableProps {
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export const EnhancedUserManagementTable: React.FC<EnhancedUserManagementTableProps> = ({
  users,
  loading = false,
  onUserSelect,
  onUserEdit,
  onUserDelete,
  onUserImpersonate,
  selectedUsers = [],
  onSelectionChange,
  pagination,
  onPageChange,
  onPageSizeChange,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: pagination?.page || 0,
    pageSize: pagination?.pageSize || 10,
  });

  const columns = useMemo<ColumnDef<AdminUser>[]>(() => [
    // Selection column
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    // User info column
    {
      accessorKey: 'name',
      header: 'User',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-gray-500" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        );
      },
      enableSorting: true,
    },
    // Role column
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.original.role as UserRole;
        const roleColors = {
          admin: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
          company: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
          consumer: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[role]}`}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        );
      },
      enableSorting: true,
    },
    // Status column
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status as UserStatus;
        const statusColors = {
          active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          suspended: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
          pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
          inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
      enableSorting: true,
    },
    // Company column
    {
      accessorKey: 'companyInfo',
      header: 'Company',
      cell: ({ row }) => {
        const user = row.original;
        const companyName = user.companyInfo?.companyName;
        if (user.role === 'company' && companyName) {
          return (
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {companyName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.companyInfo?.industry}
              </p>
            </div>
          );
        }
        return <span className="text-sm text-gray-500 dark:text-gray-400">—</span>;
      },
      enableSorting: true,
    },
    // Last Login column
    {
      accessorKey: 'lastLoginAt',
      header: 'Last Login',
      cell: ({ row }) => {
        const lastLogin = row.original.lastLoginAt;
        if (!lastLogin) {
          return <span className="text-sm text-gray-500 dark:text-gray-400">Never</span>;
        }
        return (
          <span className="text-sm text-gray-900 dark:text-white">
            {formatDistance(lastLogin, new Date(), { addSuffix: true })}
          </span>
        );
      },
      enableSorting: true,
    },
    // Device Count column
    {
      accessorKey: 'usage',
      header: 'Devices',
      cell: ({ row }) => {
        const deviceCount = row.original.usage?.devicesConnected || 0;
        return (
          <span className="text-sm text-gray-900 dark:text-white">
            {deviceCount}
          </span>
        );
      },
      enableSorting: true,
    },
    // Actions column
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUserSelect?.(user)}
              className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              title="View Details"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUserEdit?.(user)}
              className="p-1 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
              title="Edit User"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            {user.role !== 'admin' && (
              <button
                onClick={() => onUserImpersonate?.(user.id)}
                className="p-1 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                title="Impersonate User"
              >
                <UserIcon className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onUserDelete?.(user.id)}
              className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              title="Delete User"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 120,
    },
  ], [onUserSelect, onUserEdit, onUserImpersonate, onUserDelete]);

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: paginationState,
      rowSelection: selectedUsers.reduce((acc: Record<string, boolean>, id: string) => ({ ...acc, [id]: true }), {}),
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPaginationState,
    onRowSelectionChange: (selection) => {
      if (typeof selection === 'function') {
        const newSelection = selection(selectedUsers.reduce((acc: Record<string, boolean>, id: string) => ({ ...acc, [id]: true }), {}));
        onSelectionChange?.(Object.keys(newSelection));
      } else {
        onSelectionChange?.(Object.keys(selection));
      }
    },
    manualPagination: !!pagination,
    pageCount: pagination ? Math.ceil(pagination.total / pagination.pageSize) : undefined,
  });

  const handlePageChange = useCallback((page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      setPaginationState(prev => ({ ...prev, pageIndex: page }));
    }
  }, [onPageChange]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(pageSize);
    } else {
      setPaginationState(prev => ({ ...prev, pageSize, pageIndex: 0 }));
    }
  }, [onPageSizeChange]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 mb-2 mx-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Global Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          {selectedUsers.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckIcon className="w-4 h-4" />
              <span>{selectedUsers.length} selected</span>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center space-x-1 ${
                          header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getCanSort() && (
                          <div className="flex flex-col">
                            <ArrowUpIcon 
                              className={`w-3 h-3 ${
                                header.column.getIsSorted() === 'asc' ? 'text-blue-600' : 'text-gray-400'
                              }`}
                            />
                            <ArrowDownIcon 
                              className={`w-3 h-3 ${
                                header.column.getIsSorted() === 'desc' ? 'text-blue-600' : 'text-gray-400'
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {[10, 20, 50, 100].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {pageSize} per page
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                pagination?.total || users.length
              )}{' '}
              of {pagination?.total || users.length} results
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(table.getState().pagination.pageIndex - 1)}
              disabled={!table.getCanPreviousPage()}
              className="p-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {pagination ? Math.ceil(pagination.total / pagination.pageSize) : table.getPageCount()}
            </span>
            <button
              onClick={() => handlePageChange(table.getState().pagination.pageIndex + 1)}
              disabled={!table.getCanNextPage()}
              className="p-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedUserManagementTable;
