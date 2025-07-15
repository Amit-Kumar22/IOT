// DataTable Component - Task 6 Phase 4
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { DataTableProps, DataTableColumn } from '../../types/shared-components';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { formatDateTime, formatCurrency } from '../../lib/formatters';
import { cn } from '../../lib/utils';

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  loading = false,
  error,
  sortable = true,
  filterable = true,
  searchable = true,
  paginated = true,
  pageSize = 10,
  selectable = false,
  expandable = false,
  onRowClick,
  onRowSelect,
  onRowExpand,
  onSort,
  onFilter,
  onSearch,
  onPageChange,
  className,
  testId,
  ...props
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig || !data) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  // Filter and search data
  const filteredData = useMemo(() => {
    if (!sortedData) return [];

    let filtered = sortedData;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter((row: any) =>
        columns.some((column: any) => {
          const value = row[column.key];
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((row: any) => {
          const rowValue = row[key];
          return rowValue?.toString().toLowerCase().includes(value.toLowerCase());
        });
      }
    });

    return filtered;
  }, [sortedData, searchTerm, columnFilters, columns]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!paginated) return filteredData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize, paginated]);

  // Handle sort
  const handleSort = useCallback((key: string) => {
    if (!sortable) return;

    const direction = sortConfig?.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    onSort?.(key, direction);
  }, [sortConfig, sortable, onSort]);

  // Handle search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    onSearch?.(term);
  }, [onSearch]);

  // Handle filter
  const handleFilter = useCallback((key: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
    onFilter?.(key, value);
  }, [onFilter]);

  // Handle row selection
  const handleRowSelect = useCallback((rowId: string) => {
    if (!selectable) return;

    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      onRowSelect?.(Array.from(newSet));
      return newSet;
    });
  }, [selectable, onRowSelect]);

  // Handle row expansion
  const handleRowExpand = useCallback((rowId: string) => {
    if (!expandable) return;

    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      onRowExpand?.(rowId, !prev.has(rowId));
      return newSet;
    });
  }, [expandable, onRowExpand]);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (!selectable) return;

    const allSelected = paginatedData.every((row: any) => selectedRows.has(row.id));
    
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      paginatedData.forEach((row: any) => {
        if (allSelected) {
          newSet.delete(row.id);
        } else {
          newSet.add(row.id);
        }
      });
      onRowSelect?.(Array.from(newSet));
      return newSet;
    });
  }, [selectable, paginatedData, selectedRows, onRowSelect]);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
  }, [onPageChange]);

  // Calculate pagination info
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, filteredData.length);

  // Render cell content
  const renderCell = useCallback((row: any, column: any) => {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(value, row);
    }

    if (column.type === 'currency') {
      return formatCurrency(value);
    }

    if (column.type === 'date') {
      return formatDateTime(value);
    }

    if (column.type === 'badge') {
      return (
        <Badge 
          variant={value === 'active' ? 'success' : 'secondary'}
          size="small"
        >
          {value}
        </Badge>
      );
    }

    return value?.toString() || '';
  }, []);

  if (error) {
    return (
      <Card className={cn('p-8', className)} testId={testId}>
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Data</h3>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)} testId={testId} {...props}>
      {/* Header with Search and Filters */}
      {(searchable || filterable) && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between gap-4">
            {searchable && (
              <div className="relative flex-1 max-w-sm">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                      const value = typeof e === 'string' ? e : e.target.value;
                      handleSearch(value);
                    }}
                    className="pl-10"
                  />
              </div>
            )}
            
            {filterable && (
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Filters</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table 
          className="w-full"
          role="table"
          aria-label="Data table"
          data-testid="data-table"
        >
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && paginatedData.every((row: any) => selectedRows.has(row.id))}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              
              {expandable && (
                <th className="px-4 py-3 text-left w-10"></th>
              )}
              
              {columns.map((column: DataTableColumn) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    sortable && column.sortable !== false && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && column.sortable !== false) {
                      e.preventDefault();
                      handleSort(column.key);
                    }
                  }}
                  tabIndex={sortable && column.sortable !== false ? 0 : -1}
                  role={sortable && column.sortable !== false ? 'button' : undefined}
                  aria-label={sortable && column.sortable !== false ? `Sort by ${column.title}` : undefined}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.title}</span>
                    {sortable && column.sortable !== false && (
                      <span className="flex flex-col">
                        {sortConfig?.key === column.key ? (
                          sortConfig && sortConfig.direction === 'asc' ? (
                            <ChevronUpIcon className="h-3 w-3" />
                          ) : (
                            <ChevronDownIcon className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowsUpDownIcon className="h-3 w-3 opacity-50" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading && (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-500">Loading...</span>
                  </div>
                </td>
              </tr>
            )}
            
            {!loading && paginatedData.length === 0 && (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            )}
            
            {!loading && paginatedData.map((row: any) => (
              <React.Fragment key={row.id}>
                <tr
                  className={cn(
                    'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                    selectedRows.has(row.id) && 'bg-blue-50 dark:bg-blue-900/20',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id)}
                        onChange={() => handleRowSelect(row.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  
                  {expandable && (
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowExpand(row.id);
                        }}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {expandedRows.has(row.id) ? (
                          <ChevronDownIcon className="h-4 w-4" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  )}
                  
                  {columns.map((column: DataTableColumn) => (
                    <td
                      key={column.key}
                      className={cn(
                        'px-4 py-3 text-sm',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                </tr>
                
                {expandable && expandedRows.has(row.id) && (
                  <tr>
                    <td colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)} className="px-4 py-4 bg-gray-50 dark:bg-gray-900">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {row.expandedContent || (
                          <div>
                            <h4 className="font-medium mb-2">Additional Details</h4>
                            <pre className="text-xs">{JSON.stringify(row, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {startRecord} to {endRecord} of {filteredData.length} results
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="small"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? 'primary' : 'outline'}
                      size="small"
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="small"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
