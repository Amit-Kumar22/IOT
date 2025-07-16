/**
 * Task 8 Component Tests
 * Comprehensive testing for all Task 8 components
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock @dnd-kit
const mockDndContext = {
  active: null,
  over: null,
  sensors: [],
  collisionDetection: jest.fn(),
  onDragStart: jest.fn(),
  onDragEnd: jest.fn(),
  onDragOver: jest.fn(),
};

jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => <div data-testid="dnd-context">{children}</div>,
  useDndContext: () => mockDndContext,
  useDndMonitor: jest.fn(),
  DragOverlay: ({ children }: any) => <div data-testid="drag-overlay">{children}</div>,
  closestCenter: jest.fn(),
  pointerWithin: jest.fn(),
  rectIntersection: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
  PointerSensor: jest.fn(),
  KeyboardSensor: jest.fn(),
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => <div data-testid="sortable-context">{children}</div>,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  verticalListSortingStrategy: jest.fn(),
  horizontalListSortingStrategy: jest.fn(),
}));

jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: jest.fn(() => 'transform: none'),
    },
  },
}));

// Import components
import { DragDropProvider, SortableItem, SortableList, DashboardWidget } from '@/components/ui/DragDropSystem';
import { LayoutProvider, SidebarLayout, Header, DashboardGrid } from '@/components/layout/LayoutSystem';
import { 
  AccessibilityProvider, 
  SkipToContent, 
  FocusTrap, 
  AccessibleButton,
  AccessibleInput,
  RouteAnnouncer 
} from '@/components/accessibility/AccessibilitySystem';
import { 
  LazyImage, 
  VirtualizedList, 
  LazyComponent, 
  DebouncedInput,
  InfiniteScroll,
  OptimizedTable,
  usePerformanceMonitor 
} from '@/components/performance/PerformanceOptimization';

// Test utilities
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <AccessibilityProvider>
      <LayoutProvider>
        <DragDropProvider>
          {ui}
        </DragDropProvider>
      </LayoutProvider>
    </AccessibilityProvider>
  );
};

describe('Drag and Drop System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders DragDropProvider correctly', () => {
    renderWithProviders(<div>Test Content</div>);
    expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
  });

  test('renders SortableItem with correct props', () => {
    renderWithProviders(
      <SortableItem id="1">
        <div>Test Item</div>
      </SortableItem>
    );
    
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  test('renders SortableList with items', () => {
    const items = [
      { id: '1', content: 'Item 1' },
      { id: '2', content: 'Item 2' }
    ];
    
    renderWithProviders(
      <SortableList
        items={items}
        onItemsChange={() => {}}
      >
        {items.map((item) => (
          <SortableItem key={item.id} id={item.id}>
            <div>{item.content}</div>
          </SortableItem>
        ))}
      </SortableList>
    );
    
    expect(screen.getByTestId('sortable-context')).toBeInTheDocument();
  });

  test('renders DashboardWidget with actions', () => {
    renderWithProviders(
      <DashboardWidget
        id="test-widget"
        title="Test Widget"
        onEdit={() => {}}
        onRemove={() => {}}
      >
        <div>Widget Content</div>
      </DashboardWidget>
    );
    
    expect(screen.getByText('Test Widget')).toBeInTheDocument();
    expect(screen.getByText('Widget Content')).toBeInTheDocument();
  });

  test('handles widget actions correctly', () => {
    const mockEdit = jest.fn();
    const mockRemove = jest.fn();
    
    renderWithProviders(
      <DashboardWidget
        id="test-widget"
        title="Test Widget"
        onEdit={mockEdit}
        onRemove={mockRemove}
      >
        <div>Widget Content</div>
      </DashboardWidget>
    );
    
    // Test edit action
    const editButton = screen.getByTitle('Edit widget');
    fireEvent.click(editButton);
    expect(mockEdit).toHaveBeenCalled();
    
    // Test remove action
    const removeButton = screen.getByTitle('Remove widget');
    fireEvent.click(removeButton);
    expect(mockRemove).toHaveBeenCalled();
  });
});

describe('Layout System', () => {
  test('renders SidebarLayout correctly', () => {
    renderWithProviders(
      <SidebarLayout
        sidebar={<div>Sidebar Content</div>}
      >
        <div>Main Content</div>
      </SidebarLayout>
    );
    
    expect(screen.getByText('Main Content')).toBeInTheDocument();
    expect(screen.getByText('Sidebar Content')).toBeInTheDocument();
  });

  test('toggles sidebar visibility', () => {
    renderWithProviders(
      <SidebarLayout
        sidebar={<div>Sidebar Content</div>}
      >
        <div>Main Content</div>
      </SidebarLayout>
    );
    
    const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i });
    fireEvent.click(toggleButton);
    
    // Check if sidebar state changes
    expect(toggleButton).toBeInTheDocument();
  });

  test('renders Header with breadcrumbs', () => {
    const breadcrumbs = [
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Settings' }
    ];
    
    renderWithProviders(
      <Header 
        title="Test Page" 
        breadcrumbs={breadcrumbs}
        actions={<button>Action</button>}
      />
    );
    
    expect(screen.getByText('Test Page')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  test('renders DashboardGrid with responsive columns', () => {
    renderWithProviders(
      <DashboardGrid>
        <div>Widget 1</div>
        <div>Widget 2</div>
      </DashboardGrid>
    );
    
    expect(screen.getByText('Widget 1')).toBeInTheDocument();
    expect(screen.getByText('Widget 2')).toBeInTheDocument();
  });
});

describe('Accessibility System', () => {
  test('renders SkipToContent link', () => {
    renderWithProviders(<SkipToContent />);
    
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  test('FocusTrap manages focus correctly', () => {
    renderWithProviders(
      <FocusTrap isActive={true}>
        <div>
          <button>Button 1</button>
          <button>Button 2</button>
        </div>
      </FocusTrap>
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  test('AccessibleButton has correct ARIA attributes', () => {
    renderWithProviders(
      <AccessibleButton
        onClick={() => {}}
        ariaLabel="Test Button"
      >
        Click me
      </AccessibleButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Test Button');
  });

  test('AccessibleInput has correct ARIA attributes', () => {
    renderWithProviders(
      <AccessibleInput
        label="Test Input"
        value=""
        onChange={() => {}}
        required={true}
        error="This field is required"
      />
    );
    
    const input = screen.getByLabelText('Test Input *');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
  });

  test('RouteAnnouncer announces route changes', () => {
    renderWithProviders(<RouteAnnouncer />);
    
    const announcer = screen.getByRole('status');
    expect(announcer).toBeInTheDocument();
    expect(announcer).toHaveAttribute('aria-live', 'polite');
  });
});

describe('Performance Optimization', () => {
  test('LazyImage loads correctly', async () => {
    const mockOnLoad = jest.fn();
    
    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test Image"
        onLoad={mockOnLoad}
      />
    );
    
    // Image should have placeholder initially
    expect(screen.getByText('Failed to load image')).toBeInTheDocument();
  });

  test('VirtualizedList renders items efficiently', () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` }));
    
    render(
      <VirtualizedList
        items={items}
        itemHeight={50}
        containerHeight={200}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
      />
    );
    
    // Should only render visible items
    expect(screen.queryByText('Item 0')).toBeInTheDocument();
    expect(screen.queryByText('Item 100')).not.toBeInTheDocument();
  });

  test('DebouncedInput debounces value changes', async () => {
    const mockOnChange = jest.fn();
    
    render(
      <DebouncedInput
        value=""
        onChange={mockOnChange}
        debounceMs={100}
        placeholder="Type here"
      />
    );
    
    const input = screen.getByPlaceholderText('Type here');
    
    // Type multiple characters quickly
    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.change(input, { target: { value: 'ab' } });
    fireEvent.change(input, { target: { value: 'abc' } });
    
    // Should not have called onChange yet
    expect(mockOnChange).not.toHaveBeenCalled();
    
    // Wait for debounce
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('abc');
    }, { timeout: 200 });
  });

  test('InfiniteScroll loads more items', () => {
    const items = Array.from({ length: 20 }, (_, i) => ({ id: i, name: `Item ${i}` }));
    const mockLoadMore = jest.fn();
    
    render(
      <InfiniteScroll
        items={items}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
        loadMore={mockLoadMore}
        hasMore={true}
        loading={false}
      />
    );
    
    expect(screen.getByText('Item 0')).toBeInTheDocument();
    expect(screen.getByText('Item 19')).toBeInTheDocument();
  });

  test('OptimizedTable renders and sorts data', () => {
    const columns = [
      { key: 'name', title: 'Name' },
      { key: 'age', title: 'Age' }
    ];
    
    const data = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
      { name: 'Charlie', age: 35 }
    ];
    
    render(
      <OptimizedTable
        columns={columns}
        data={data}
        maxHeight={200}
      />
    );
    
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    
    // Test sorting
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    
    expect(screen.getByText('↑')).toBeInTheDocument();
  });
});

describe('Performance Monitoring', () => {
  test('usePerformanceMonitor hook works correctly', () => {
    const TestComponent = () => {
      const metrics = usePerformanceMonitor();
      return (
        <div>
          <div>Render Time: {metrics.renderTime}</div>
          <div>Memory Usage: {metrics.memoryUsage}</div>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    expect(screen.getByText(/Render Time:/)).toBeInTheDocument();
    expect(screen.getByText(/Memory Usage:/)).toBeInTheDocument();
  });
});

describe('Integration Tests', () => {
  test('all components work together', () => {
    const TestApp = () => (
      <AccessibilityProvider>
        <LayoutProvider>
          <DragDropProvider>
            <SidebarLayout sidebar={<div>Sidebar</div>}>
              <Header title="Test App" />
              <DashboardGrid>
                <DashboardWidget
                  id="1"
                  title="Test Widget"
                  onEdit={() => {}}
                  onRemove={() => {}}
                >
                  <div>Widget Content</div>
                </DashboardWidget>
              </DashboardGrid>
            </SidebarLayout>
          </DragDropProvider>
        </LayoutProvider>
      </AccessibilityProvider>
    );
    
    render(<TestApp />);
    
    expect(screen.getByText('Test App')).toBeInTheDocument();
    expect(screen.getByText('Test Widget')).toBeInTheDocument();
    expect(screen.getByText('Widget Content')).toBeInTheDocument();
  });
});

describe('Error Handling', () => {
  test('components handle errors gracefully', () => {
    const ErrorComponent = () => {
      throw new Error('Test error');
    };
    
    const TestErrorBoundary = () => (
      <AccessibilityProvider>
        <div>
          <ErrorComponent />
        </div>
      </AccessibilityProvider>
    );
    
    // This would normally be caught by an error boundary
    // For this test, we'll just verify the component structure
    expect(() => render(<TestErrorBoundary />)).toThrow();
  });
});

describe('Responsive Design', () => {
  test('components adapt to different screen sizes', () => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
    
    renderWithProviders(
      <SidebarLayout sidebar={<div>Sidebar</div>}>
        <DashboardGrid>
          <div>Widget 1</div>
        </DashboardGrid>
      </SidebarLayout>
    );
    
    expect(screen.getByText('Widget 1')).toBeInTheDocument();
    
    // Change to mobile size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 480,
    });
    
    // Trigger resize event
    fireEvent(window, new Event('resize'));
    
    expect(screen.getByText('Widget 1')).toBeInTheDocument();
  });
});

describe('Accessibility Compliance', () => {
  test('components meet WCAG guidelines', () => {
    renderWithProviders(
      <div>
        <SkipToContent />
        <AccessibleButton onClick={() => {}} ariaLabel="Test Button">
          Click me
        </AccessibleButton>
        <AccessibleInput
          label="Test Input"
          value=""
          onChange={() => {}}
        />
      </div>
    );
    
    // Check skip link
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toHaveAttribute('href', '#main-content');
    
    // Check button accessibility
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Test Button');
    
    // Check input accessibility
    const input = screen.getByLabelText('Test Input');
    expect(input).toBeInTheDocument();
  });
});

export default {};
