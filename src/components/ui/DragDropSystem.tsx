/**
 * Drag and Drop System
 * Comprehensive drag-and-drop utilities for IoT dashboard customization
 */

'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  closestCorners,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  UniqueIdentifier,
  CollisionDetection,
  MeasuringStrategy,
  DropAnimation,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  arrayMove,
  useSortable
} from '@dnd-kit/sortable';
import {
  CSS,
  Transform
} from '@dnd-kit/utilities';
import {
  restrictToVerticalAxis,
  restrictToHorizontalAxis,
  restrictToWindowEdges,
  restrictToParentElement,
  restrictToFirstScrollableAncestor,
  snapCenterToCursor
} from '@dnd-kit/modifiers';
import { ReactNode, useState, useCallback, useMemo, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Drag and Drop Context
 */
interface DragDropContextValue {
  draggedItem: any;
  setDraggedItem: (item: any) => void;
  draggedOverContainer: string | null;
  setDraggedOverContainer: (container: string | null) => void;
}

const DragDropContext = createContext<DragDropContextValue | undefined>(undefined);

export const useDragDropContext = () => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDropContext must be used within a DragDropProvider');
  }
  return context;
};

/**
 * DragDropProvider Component
 * Provides drag and drop functionality throughout the app
 */
export function DragDropProvider({ children }: { children: ReactNode }) {
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [draggedOverContainer, setDraggedOverContainer] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Custom collision detection for better performance
  const collisionDetection: CollisionDetection = useCallback((args) => {
    if (draggedItem?.type === 'widget') {
      // Use closest corners for widgets
      return closestCorners(args);
    }
    
    // Use closest center for other items
    const closestCenterCollision = closestCenter(args);
    
    if (closestCenterCollision.length > 0) {
      return closestCenterCollision;
    }
    
    // Fallback to pointer within
    const pointerWithinCollision = pointerWithin(args);
    if (pointerWithinCollision.length > 0) {
      return pointerWithinCollision;
    }
    
    // Final fallback to rect intersection
    return rectIntersection(args);
  }, [draggedItem]);

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.4',
        },
      },
    }),
  };

  const measuring = {
    droppable: {
      strategy: MeasuringStrategy.Always,
    },
  };

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedItem(event.active.data.current);
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (event.over) {
      setDraggedOverContainer(event.over.id.toString());
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedItem(null);
    setDraggedOverContainer(null);
  };

  const value = {
    draggedItem,
    setDraggedItem,
    draggedOverContainer,
    setDraggedOverContainer
  };

  return (
    <DragDropContext.Provider value={value}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        measuring={measuring}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay dropAnimation={dropAnimation}>
          {draggedItem && (
            <DragOverlayContent item={draggedItem} />
          )}
        </DragOverlay>
      </DndContext>
    </DragDropContext.Provider>
  );
}

/**
 * DragOverlayContent Component
 * Renders the drag overlay with appropriate styling
 */
function DragOverlayContent({ item }: { item: any }) {
  return (
    <motion.div
      initial={{ scale: 1.05, opacity: 0.8 }}
      animate={{ scale: 1.1, opacity: 0.9 }}
      className="
        bg-white dark:bg-gray-800 
        border-2 border-blue-500 
        rounded-lg shadow-xl 
        p-4 cursor-grabbing
        transform rotate-3
      "
      style={{
        width: item.width || 'auto',
        height: item.height || 'auto'
      }}
    >
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {item.title || item.name || 'Dragging Item'}
      </div>
      {item.description && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {item.description}
        </div>
      )}
    </motion.div>
  );
}

/**
 * SortableItem Component
 * Individual sortable item with drag handle
 */
export function SortableItem({
  id,
  children,
  disabled = false,
  className = '',
  dragHandle = true,
  data = {}
}: {
  id: UniqueIdentifier;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  dragHandle?: boolean;
  data?: any;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
    isOver,
    overIndex,
    index
  } = useSortable({
    id,
    disabled,
    data: {
      ...data,
      id,
      sortable: true
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 'auto'
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`
        relative
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        ${isOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
        ${className}
      `}
      {...attributes}
      {...(dragHandle ? listeners : {})}
      layout
      layoutId={id.toString()}
    >
      {children}
      
      {dragHandle && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-4 h-4 flex flex-col justify-center items-center">
            <div className="w-1 h-1 bg-gray-400 rounded-full mb-0.5"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full mb-0.5"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/**
 * SortableList Component
 * Container for sortable items
 */
export function SortableList({
  items,
  onItemsChange,
  children,
  strategy = verticalListSortingStrategy,
  className = '',
  disabled = false,
  modifiers = []
}: {
  items: any[];
  onItemsChange: (items: any[]) => void;
  children: ReactNode;
  strategy?: typeof verticalListSortingStrategy;
  className?: string;
  disabled?: boolean;
  modifiers?: any[];
}) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      onItemsChange(newItems);
    }
  };

  return (
    <DndContext
      modifiers={modifiers}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={strategy} disabled={disabled}>
        <div className={className}>
          {children}
        </div>
      </SortableContext>
    </DndContext>
  );
}

/**
 * DashboardWidget Component
 * Draggable widget for dashboard customization
 */
export function DashboardWidget({
  id,
  title,
  description,
  children,
  className = '',
  onRemove,
  onEdit,
  dragDisabled = false
}: {
  id: UniqueIdentifier;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  onRemove?: () => void;
  onEdit?: () => void;
  dragDisabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id,
    disabled: dragDisabled,
    data: {
      type: 'widget',
      title,
      description,
      id
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`
        group relative
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-lg shadow-sm hover:shadow-md
        transition-shadow duration-200
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        ${className}
      `}
      {...attributes}
      {...listeners}
      layout
      layoutId={id.toString()}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {description}
            </p>
          )}
        </div>
        
        {/* Widget Actions */}
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
              title="Edit Widget"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Remove Widget"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          
          {/* Drag Handle */}
          <div className="p-1 text-gray-400 cursor-grab">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
            </svg>
          </div>
        </div>
      </div>

      {/* Widget Content */}
      <div className="p-4">
        {children}
      </div>
    </motion.div>
  );
}

/**
 * DashboardGrid Component
 * Grid layout for dashboard widgets
 */
export function DashboardGrid({
  widgets,
  onWidgetsChange,
  className = '',
  columns = 3,
  gap = 4
}: {
  widgets: any[];
  onWidgetsChange: (widgets: any[]) => void;
  className?: string;
  columns?: number;
  gap?: number;
}) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = widgets.findIndex((widget) => widget.id === active.id);
      const newIndex = widgets.findIndex((widget) => widget.id === over?.id);

      const newWidgets = arrayMove(widgets, oldIndex, newIndex);
      onWidgetsChange(newWidgets);
    }
  };

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <SortableContext items={widgets} strategy={rectSortingStrategy}>
        <div
          className={`
            grid gap-${gap}
            grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns}
            ${className}
          `}
        >
          {widgets.map((widget) => (
            <DashboardWidget
              key={widget.id}
              id={widget.id}
              title={widget.title}
              description={widget.description}
              onRemove={() => {
                const newWidgets = widgets.filter(w => w.id !== widget.id);
                onWidgetsChange(newWidgets);
              }}
              onEdit={() => {
                // Handle edit logic
                console.log('Edit widget:', widget);
              }}
            >
              {widget.content}
            </DashboardWidget>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

/**
 * DroppableContainer Component
 * Drop zone for draggable items
 */
export function DroppableContainer({
  id,
  children,
  className = '',
  acceptedTypes = [],
  onDrop,
  placeholder = 'Drop items here'
}: {
  id: string;
  children: ReactNode;
  className?: string;
  acceptedTypes?: string[];
  onDrop?: (item: any) => void;
  placeholder?: string;
}) {
  const { draggedItem, draggedOverContainer } = useDragDropContext();
  const isOver = draggedOverContainer === id;
  const canAccept = acceptedTypes.length === 0 || 
    (draggedItem && acceptedTypes.includes(draggedItem.type));

  return (
    <div
      className={`
        relative min-h-[200px] p-4
        border-2 border-dashed
        rounded-lg transition-all duration-200
        ${isOver && canAccept 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-300 dark:border-gray-600'
        }
        ${!canAccept && isOver 
          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
          : ''
        }
        ${className}
      `}
    >
      {children}
      
      {/* Drop Placeholder */}
      <AnimatePresence>
        {isOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className={`
              text-center p-8 rounded-lg
              ${canAccept 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-red-600 dark:text-red-400'
              }
            `}>
              <div className="text-2xl mb-2">
                {canAccept ? '⬇️' : '❌'}
              </div>
              <div className="text-sm font-medium">
                {canAccept ? placeholder : 'Cannot drop here'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * DragDropModifiers
 * Pre-configured modifiers for common use cases
 */
export const DragDropModifiers = {
  verticalOnly: [restrictToVerticalAxis],
  horizontalOnly: [restrictToHorizontalAxis],
  windowBounds: [restrictToWindowEdges],
  parentBounds: [restrictToParentElement],
  scrollableBounds: [restrictToFirstScrollableAncestor],
  snapToCenter: [snapCenterToCursor],
  
  // Combined modifiers
  verticalWithinWindow: [restrictToVerticalAxis, restrictToWindowEdges],
  horizontalWithinWindow: [restrictToHorizontalAxis, restrictToWindowEdges],
  windowWithSnap: [restrictToWindowEdges, snapCenterToCursor]
};

/**
 * DragDropStrategies
 * Pre-configured sorting strategies
 */
export const DragDropStrategies = {
  vertical: verticalListSortingStrategy,
  horizontal: horizontalListSortingStrategy,
  grid: rectSortingStrategy
};

export default {
  DragDropProvider,
  SortableItem,
  SortableList,
  DashboardWidget,
  DashboardGrid,
  DroppableContainer,
  DragDropModifiers,
  DragDropStrategies,
  useDragDropContext
};
