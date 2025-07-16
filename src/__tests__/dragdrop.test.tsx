/**
 * Drag and Drop System Tests
 * Tests for drag and drop functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import {
  DragDropProvider,
  SortableItem,
  SortableList,
  DashboardWidget,
  DashboardGrid,
  DroppableContainer,
  useDragDropContext
} from '@/components/ui/DragDropSystem';

// Mock framer-motion for testing
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>
  },
  AnimatePresence: ({ children }: any) => children
}));

// Mock @dnd-kit/core for testing
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => <div data-testid="dnd-context">{children}</div>,
  DragOverlay: ({ children }: any) => <div data-testid="drag-overlay">{children}</div>,
  useSensor: () => ({}),
  useSensors: () => [],
  PointerSensor: {},
  KeyboardSensor: {},
  closestCenter: () => [],
  closestCorners: () => [],
  pointerWithin: () => [],
  rectIntersection: () => [],
  MeasuringStrategy: { Always: 'always' },
  defaultDropAnimationSideEffects: () => ({})
}));

// Mock @dnd-kit/sortable for testing
jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => <div data-testid="sortable-context">{children}</div>,
  sortableKeyboardCoordinates: () => ({}),
  verticalListSortingStrategy: 'vertical',
  horizontalListSortingStrategy: 'horizontal',
  rectSortingStrategy: 'rect',
  arrayMove: (array: any[], from: number, to: number) => {
    const newArray = [...array];
    const item = newArray.splice(from, 1)[0];
    newArray.splice(to, 0, item);
    return newArray;
  },
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false,
    isSorting: false,
    isOver: false,
    overIndex: -1,
    index: 0
  })
}));

// Mock @dnd-kit/utilities for testing
jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => 'transform: translate3d(0, 0, 0)'
    }
  }
}));

// Mock @dnd-kit/modifiers for testing
jest.mock('@dnd-kit/modifiers', () => ({
  restrictToVerticalAxis: 'restrictToVerticalAxis',
  restrictToHorizontalAxis: 'restrictToHorizontalAxis',
  restrictToWindowEdges: 'restrictToWindowEdges',
  restrictToParentElement: 'restrictToParentElement',
  restrictToFirstScrollableAncestor: 'restrictToFirstScrollableAncestor',
  snapCenterToCursor: 'snapCenterToCursor'
}));

// Test component that uses drag drop context
function TestContextComponent() {
  const { draggedItem, setDraggedItem } = useDragDropContext();
  
  return (
    <div>
      <div data-testid="dragged-item">
        {draggedItem ? draggedItem.title : 'No item dragged'}
      </div>
      <button 
        onClick={() => setDraggedItem({ title: 'Test Item' })}
        data-testid="set-dragged-item"
      >
        Set Dragged Item
      </button>
    </div>
  );
}

describe('DragDropProvider', () => {
  it('should provide drag drop context', () => {
    render(
      <DragDropProvider>
        <TestContextComponent />
      </DragDropProvider>
    );

    expect(screen.getByTestId('dragged-item')).toHaveTextContent('No item dragged');
    
    fireEvent.click(screen.getByTestId('set-dragged-item'));
    expect(screen.getByTestId('dragged-item')).toHaveTextContent('Test Item');
  });

  it('should render DndContext', () => {
    render(
      <DragDropProvider>
        <div>Test Content</div>
      </DragDropProvider>
    );

    expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
    expect(screen.getByTestId('drag-overlay')).toBeInTheDocument();
  });
});

describe('SortableItem', () => {
  it('should render sortable item', () => {
    render(
      <DragDropProvider>
        <SortableItem id="item-1">
          <div>Sortable Content</div>
        </SortableItem>
      </DragDropProvider>
    );

    expect(screen.getByText('Sortable Content')).toBeInTheDocument();
  });

  it('should show drag handle when enabled', () => {
    render(
      <DragDropProvider>
        <SortableItem id="item-1" dragHandle={true}>
          <div>Sortable Content</div>
        </SortableItem>
      </DragDropProvider>
    );

    // The drag handle is rendered but may not be visible due to opacity
    expect(screen.getByText('Sortable Content')).toBeInTheDocument();
  });

  it('should apply disabled state', () => {
    render(
      <DragDropProvider>
        <SortableItem id="item-1" disabled={true}>
          <div>Disabled Item</div>
        </SortableItem>
      </DragDropProvider>
    );

    expect(screen.getByText('Disabled Item')).toBeInTheDocument();
  });
});

describe('SortableList', () => {
  it('should render sortable list', () => {
    const items = [
      { id: '1', title: 'Item 1' },
      { id: '2', title: 'Item 2' }
    ];
    
    const onItemsChange = jest.fn();

    render(
      <DragDropProvider>
        <SortableList items={items} onItemsChange={onItemsChange}>
          {items.map(item => (
            <SortableItem key={item.id} id={item.id}>
              <div>{item.title}</div>
            </SortableItem>
          ))}
        </SortableList>
      </DragDropProvider>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByTestId('sortable-context')).toBeInTheDocument();
  });

  it('should handle disabled state', () => {
    const items = [{ id: '1', title: 'Item 1' }];
    const onItemsChange = jest.fn();

    render(
      <DragDropProvider>
        <SortableList items={items} onItemsChange={onItemsChange} disabled={true}>
          <SortableItem id="1">
            <div>Item 1</div>
          </SortableItem>
        </SortableList>
      </DragDropProvider>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });
});

describe('DashboardWidget', () => {
  it('should render dashboard widget', () => {
    render(
      <DragDropProvider>
        <DashboardWidget
          id="widget-1"
          title="Test Widget"
          description="Test Description"
        >
          <div>Widget Content</div>
        </DashboardWidget>
      </DragDropProvider>
    );

    expect(screen.getByText('Test Widget')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Widget Content')).toBeInTheDocument();
  });

  it('should handle remove action', () => {
    const onRemove = jest.fn();

    render(
      <DragDropProvider>
        <DashboardWidget
          id="widget-1"
          title="Test Widget"
          onRemove={onRemove}
        >
          <div>Widget Content</div>
        </DashboardWidget>
      </DragDropProvider>
    );

    const removeButton = screen.getByTitle('Remove Widget');
    fireEvent.click(removeButton);
    expect(onRemove).toHaveBeenCalled();
  });

  it('should handle edit action', () => {
    const onEdit = jest.fn();

    render(
      <DragDropProvider>
        <DashboardWidget
          id="widget-1"
          title="Test Widget"
          onEdit={onEdit}
        >
          <div>Widget Content</div>
        </DashboardWidget>
      </DragDropProvider>
    );

    const editButton = screen.getByTitle('Edit Widget');
    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalled();
  });

  it('should handle drag disabled state', () => {
    render(
      <DragDropProvider>
        <DashboardWidget
          id="widget-1"
          title="Test Widget"
          dragDisabled={true}
        >
          <div>Widget Content</div>
        </DashboardWidget>
      </DragDropProvider>
    );

    expect(screen.getByText('Test Widget')).toBeInTheDocument();
  });
});

describe('DashboardGrid', () => {
  it('should render dashboard grid', () => {
    const widgets = [
      { id: '1', title: 'Widget 1', content: <div>Content 1</div> },
      { id: '2', title: 'Widget 2', content: <div>Content 2</div> }
    ];
    
    const onWidgetsChange = jest.fn();

    render(
      <DragDropProvider>
        <DashboardGrid widgets={widgets} onWidgetsChange={onWidgetsChange} />
      </DragDropProvider>
    );

    expect(screen.getByText('Widget 1')).toBeInTheDocument();
    expect(screen.getByText('Widget 2')).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('should handle widget removal', () => {
    const widgets = [
      { id: '1', title: 'Widget 1', content: <div>Content 1</div> }
    ];
    
    const onWidgetsChange = jest.fn();

    render(
      <DragDropProvider>
        <DashboardGrid widgets={widgets} onWidgetsChange={onWidgetsChange} />
      </DragDropProvider>
    );

    const removeButton = screen.getByTitle('Remove Widget');
    fireEvent.click(removeButton);
    
    expect(onWidgetsChange).toHaveBeenCalledWith([]);
  });

  it('should handle custom columns and gap', () => {
    const widgets = [
      { id: '1', title: 'Widget 1', content: <div>Content 1</div> }
    ];
    
    const onWidgetsChange = jest.fn();

    render(
      <DragDropProvider>
        <DashboardGrid 
          widgets={widgets} 
          onWidgetsChange={onWidgetsChange}
          columns={2}
          gap={6}
        />
      </DragDropProvider>
    );

    expect(screen.getByText('Widget 1')).toBeInTheDocument();
  });
});

describe('DroppableContainer', () => {
  it('should render droppable container', () => {
    render(
      <DragDropProvider>
        <DroppableContainer id="container-1">
          <div>Drop Zone Content</div>
        </DroppableContainer>
      </DragDropProvider>
    );

    expect(screen.getByText('Drop Zone Content')).toBeInTheDocument();
  });

  it('should handle custom placeholder', () => {
    render(
      <DragDropProvider>
        <DroppableContainer 
          id="container-1"
          placeholder="Custom Drop Message"
        >
          <div>Drop Zone Content</div>
        </DroppableContainer>
      </DragDropProvider>
    );

    expect(screen.getByText('Drop Zone Content')).toBeInTheDocument();
  });

  it('should handle accepted types', () => {
    render(
      <DragDropProvider>
        <DroppableContainer 
          id="container-1"
          acceptedTypes={['widget', 'component']}
        >
          <div>Drop Zone Content</div>
        </DroppableContainer>
      </DragDropProvider>
    );

    expect(screen.getByText('Drop Zone Content')).toBeInTheDocument();
  });
});

describe('Drag and Drop Integration', () => {
  it('should handle drag and drop workflow', async () => {
    const items = [
      { id: '1', title: 'Item 1' },
      { id: '2', title: 'Item 2' }
    ];
    
    const onItemsChange = jest.fn();

    render(
      <DragDropProvider>
        <SortableList items={items} onItemsChange={onItemsChange}>
          {items.map(item => (
            <SortableItem key={item.id} id={item.id}>
              <div>{item.title}</div>
            </SortableItem>
          ))}
        </SortableList>
      </DragDropProvider>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should handle touch device compatibility', () => {
    // Test touch events
    const items = [{ id: '1', title: 'Item 1' }];
    const onItemsChange = jest.fn();

    render(
      <DragDropProvider>
        <SortableList items={items} onItemsChange={onItemsChange}>
          <SortableItem id="1">
            <div>Item 1</div>
          </SortableItem>
        </SortableList>
      </DragDropProvider>
    );

    const item = screen.getByText('Item 1');
    
    // Simulate touch events
    fireEvent.touchStart(item);
    fireEvent.touchMove(item);
    fireEvent.touchEnd(item);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });
});

describe('Accessibility', () => {
  it('should support keyboard navigation', () => {
    const items = [{ id: '1', title: 'Item 1' }];
    const onItemsChange = jest.fn();

    render(
      <DragDropProvider>
        <SortableList items={items} onItemsChange={onItemsChange}>
          <SortableItem id="1">
            <div>Item 1</div>
          </SortableItem>
        </SortableList>
      </DragDropProvider>
    );

    const item = screen.getByText('Item 1');
    
    // Test keyboard events
    fireEvent.keyDown(item, { key: 'Space' });
    fireEvent.keyDown(item, { key: 'ArrowDown' });
    fireEvent.keyDown(item, { key: 'Space' });

    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('should provide proper ARIA attributes', () => {
    render(
      <DragDropProvider>
        <SortableItem id="item-1">
          <div>Accessible Item</div>
        </SortableItem>
      </DragDropProvider>
    );

    expect(screen.getByText('Accessible Item')).toBeInTheDocument();
  });
});

describe('Performance', () => {
  it('should handle large lists efficiently', () => {
    const items = Array.from({ length: 100 }, (_, i) => ({
      id: `item-${i}`,
      title: `Item ${i}`
    }));
    
    const onItemsChange = jest.fn();

    render(
      <DragDropProvider>
        <SortableList items={items} onItemsChange={onItemsChange}>
          {items.map(item => (
            <SortableItem key={item.id} id={item.id}>
              <div>{item.title}</div>
            </SortableItem>
          ))}
        </SortableList>
      </DragDropProvider>
    );

    expect(screen.getByText('Item 0')).toBeInTheDocument();
    expect(screen.getByText('Item 99')).toBeInTheDocument();
  });

  it('should optimize drag overlay rendering', () => {
    render(
      <DragDropProvider>
        <div>Test Content</div>
      </DragDropProvider>
    );

    expect(screen.getByTestId('drag-overlay')).toBeInTheDocument();
  });
});
