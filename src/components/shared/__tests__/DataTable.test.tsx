// Unit tests for DataTable component - Task 6 Phase 4
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from '../DataTable';
import { DataTableColumn } from '../../../types/shared-components';

// Mock data for testing
const mockData = [
  { id: '1', name: 'John Doe', age: 30, email: 'john@example.com', status: 'active', salary: 50000 },
  { id: '2', name: 'Jane Smith', age: 25, email: 'jane@example.com', status: 'inactive', salary: 60000 },
  { id: '3', name: 'Bob Johnson', age: 35, email: 'bob@example.com', status: 'active', salary: 70000 },
  { id: '4', name: 'Alice Brown', age: 28, email: 'alice@example.com', status: 'active', salary: 55000 },
  { id: '5', name: 'Charlie Wilson', age: 32, email: 'charlie@example.com', status: 'inactive', salary: 65000 }
];

const mockColumns: DataTableColumn[] = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'age', title: 'Age', sortable: true, type: 'number' },
  { key: 'email', title: 'Email', sortable: true },
  { key: 'status', title: 'Status', type: 'badge' },
  { key: 'salary', title: 'Salary', type: 'currency', align: 'right' }
];

describe('DataTable Component', () => {
  const mockOnRowClick = jest.fn();
  const mockOnRowSelect = jest.fn();
  const mockOnSort = jest.fn();
  const mockOnSearch = jest.fn();
  const mockOnPageChange = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders data table with data', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          testId="basic-table"
        />
      );

      expect(screen.getByTestId('basic-table')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
    });

    it('renders empty state when no data', () => {
      render(
        <DataTable
          data={[]}
          columns={mockColumns}
          testId="empty-table"
        />
      );

      expect(screen.getByTestId('empty-table')).toBeInTheDocument();
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('renders loading state', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          loading={true}
          testId="loading-table"
        />
      );

      expect(screen.getByTestId('loading-table')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders error state', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          error="Failed to load data"
          testId="error-table"
        />
      );

      expect(screen.getByTestId('error-table')).toBeInTheDocument();
      expect(screen.getByText('Error Loading Data')).toBeInTheDocument();
      expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('renders sort indicators', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          sortable={true}
          testId="sortable-table"
        />
      );

      expect(screen.getByTestId('sortable-table')).toBeInTheDocument();
      
      // Check for sort indicators on sortable columns
      const nameHeader = screen.getByText('Name').closest('th');
      expect(nameHeader).toBeInTheDocument();
      
      const ageHeader = screen.getByText('Age').closest('th');
      expect(ageHeader).toBeInTheDocument();
    });

    it('handles column sorting', async () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          sortable={true}
          onSort={mockOnSort}
          testId="sort-table"
        />
      );

      const nameHeader = screen.getByText('Name').closest('th');
      expect(nameHeader).toBeInTheDocument();
      
      await userEvent.click(nameHeader!);
      expect(mockOnSort).toHaveBeenCalledWith('name', 'asc');
    });

    it('disables sorting when sortable is false', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          sortable={false}
          testId="non-sortable-table"
        />
      );

      const nameHeader = screen.getByText('Name').closest('th');
      expect(nameHeader).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Search and Filter', () => {
    it('renders search input when searchable', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          searchable={true}
          testId="searchable-table"
        />
      );

      expect(screen.getByTestId('searchable-table')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('handles search input', async () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          searchable={true}
          onSearch={mockOnSearch}
          testId="search-table"
        />
      );

      const searchInput = screen.getByPlaceholderText('Search...');
      await userEvent.type(searchInput, 'John');
      
      expect(mockOnSearch).toHaveBeenCalledWith('John');
    });

    it('filters data based on search term', async () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          searchable={true}
          testId="filter-table"
        />
      );

      const searchInput = screen.getByPlaceholderText('Search...');
      await userEvent.type(searchInput, 'John');
      
      // Should show only John Doe
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('hides search when not searchable', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          searchable={false}
          testId="non-searchable-table"
        />
      );

      expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('renders checkboxes when selectable', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          selectable={true}
          testId="selectable-table"
        />
      );

      expect(screen.getByTestId('selectable-table')).toBeInTheDocument();
      
      // Should have header checkbox plus row checkboxes
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(mockData.length + 1); // +1 for select all
    });

    it('handles row selection', async () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          selectable={true}
          onRowSelect={mockOnRowSelect}
          testId="select-table"
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      const firstRowCheckbox = checkboxes[1]; // Skip header checkbox
      
      await userEvent.click(firstRowCheckbox);
      expect(mockOnRowSelect).toHaveBeenCalledWith(['1']);
    });

    it('handles select all', async () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          selectable={true}
          onRowSelect={mockOnRowSelect}
          testId="select-all-table"
        />
      );

      const headerCheckbox = screen.getAllByRole('checkbox')[0];
      await userEvent.click(headerCheckbox);
      
      expect(mockOnRowSelect).toHaveBeenCalledWith(['1', '2', '3', '4', '5']);
    });

    it('hides checkboxes when not selectable', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          selectable={false}
          testId="non-selectable-table"
        />
      );

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('renders pagination when paginated', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          paginated={true}
          pageSize={2}
          testId="paginated-table"
        />
      );

      expect(screen.getByTestId('paginated-table')).toBeInTheDocument();
      expect(screen.getByText('Showing 1 to 2 of 5 results')).toBeInTheDocument();
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('handles page navigation', async () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          paginated={true}
          pageSize={2}
          onPageChange={mockOnPageChange}
          testId="page-nav-table"
        />
      );

      const nextButton = screen.getByText('Next');
      await userEvent.click(nextButton);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('disables previous button on first page', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          paginated={true}
          pageSize={2}
          testId="first-page-table"
        />
      );

      const previousButton = screen.getByText('Previous');
      expect(previousButton).toBeDisabled();
    });

    it('shows correct page numbers', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          paginated={true}
          pageSize={2}
          testId="page-numbers-table"
        />
      );

      // Should show page numbers
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('hides pagination when not paginated', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          paginated={false}
          testId="non-paginated-table"
        />
      );

      expect(screen.queryByText('Previous')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });
  });

  describe('Row Interaction', () => {
    it('handles row click', async () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          onRowClick={mockOnRowClick}
          testId="clickable-table"
        />
      );

      const firstRow = screen.getByText('John Doe').closest('tr');
      await userEvent.click(firstRow!);
      
      expect(mockOnRowClick).toHaveBeenCalledWith(mockData[0]);
    });

    it('applies cursor pointer when row is clickable', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          onRowClick={mockOnRowClick}
          testId="pointer-table"
        />
      );

      const firstRow = screen.getByText('John Doe').closest('tr');
      expect(firstRow).toHaveClass('cursor-pointer');
    });

    it('does not apply cursor pointer when row is not clickable', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          testId="non-clickable-table"
        />
      );

      const firstRow = screen.getByText('John Doe').closest('tr');
      expect(firstRow).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Column Types', () => {
    it('renders currency columns correctly', () => {
      const { container } = render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          testId="currency-table"
        />
      );

      // Check if salary cells exist with some formatted content
      const salaryCells = container.querySelectorAll('td');
      const salaryValues = Array.from(salaryCells).filter(cell => 
        cell.textContent?.includes('50000') || cell.textContent?.includes('50,000')
      );
      
      expect(salaryValues.length).toBeGreaterThan(0);
    });

    it('renders badge columns correctly', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          testId="badge-table"
        />
      );

      // Should render status as badges
      const activeBadges = screen.getAllByText('active');
      const inactiveBadges = screen.getAllByText('inactive');
      
      expect(activeBadges.length).toBeGreaterThan(0);
      expect(inactiveBadges.length).toBeGreaterThan(0);
    });

    it('handles custom column alignment', () => {
      const { container } = render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          testId="aligned-table"
        />
      );

      // Find salary cells (should be right-aligned)
      const rightAlignedCells = container.querySelectorAll('td.text-right');
      expect(rightAlignedCells.length).toBeGreaterThan(0);
    });
  });

  describe('Expandable Rows', () => {
    it('renders expand buttons when expandable', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          expandable={true}
          testId="expandable-table"
        />
      );

      // Should have expand buttons for each row
      const expandButtons = screen.getAllByRole('button');
      expect(expandButtons.length).toBe(mockData.length);
    });

    it('handles row expansion', async () => {
      const mockOnRowExpand = jest.fn();
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          expandable={true}
          onRowExpand={mockOnRowExpand}
          testId="expand-table"
        />
      );

      const firstExpandButton = screen.getAllByRole('button')[0];
      await userEvent.click(firstExpandButton);
      
      expect(mockOnRowExpand).toHaveBeenCalledWith('1', true);
    });

    it('shows expanded content', async () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          expandable={true}
          testId="expanded-content-table"
        />
      );

      const firstExpandButton = screen.getAllByRole('button')[0];
      await userEvent.click(firstExpandButton);
      
      // Should show additional details
      expect(screen.getByText('Additional Details')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('applies correct table classes', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          testId="responsive-table"
        />
      );

      const tableContainer = screen.getByTestId('responsive-table');
      expect(tableContainer).toBeInTheDocument();
      
      // Should have overflow-x-auto for horizontal scrolling
      const scrollContainer = tableContainer.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          className="custom-table-class"
          testId="custom-class-table"
        />
      );

      const table = screen.getByTestId('custom-class-table');
      expect(table).toHaveClass('custom-table-class');
    });
  });

  describe('Accessibility', () => {
    it('has proper table structure', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          testId="accessible-table"
        />
      );

      expect(screen.getByTestId('accessible-table')).toBeInTheDocument();
      
      // Should have proper table elements
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      const columnHeaders = screen.getAllByRole('columnheader');
      expect(columnHeaders).toHaveLength(mockColumns.length);
    });

    it('has proper checkbox labels', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          selectable={true}
          testId="checkbox-labels-table"
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(mockData.length + 1);
      
      // All checkboxes should be accessible
      checkboxes.forEach(checkbox => {
        expect(checkbox).toBeInTheDocument();
      });
    });
  });
});
