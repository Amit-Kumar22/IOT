'use client';

import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  PlusIcon,
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';
import { ChartConfig, DashboardLayout } from '@/types/analytics';
import ChartWidget from '@/components/charts/ChartWidget';

interface DashboardBuilderProps {
  layout: DashboardLayout;
  isEditing: boolean;
  onLayoutChange: (layout: DashboardLayout) => void;
  onToggleEdit: () => void;
  onSaveLayout: () => void;
  onAddWidget: () => void;
  className?: string;
}

interface SortableWidgetProps {
  widget: ChartConfig;
  isEditing: boolean;
  onConfigChange: (config: ChartConfig) => void;
  onRemove: () => void;
  onToggleVisibility: () => void;
}

const SortableWidget: React.FC<SortableWidgetProps> = ({
  widget,
  isEditing,
  onConfigChange,
  onRemove,
  onToggleVisibility
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Mock data for demo
  const mockData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: widget.title,
      data: [65, 59, 80, 81, 56, 55],
      borderColor: '#3B82F6',
      backgroundColor: '#3B82F620',
      borderWidth: 2
    }]
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${widget.isVisible ? '' : 'opacity-50'}`}
      {...attributes}
      {...(isEditing ? listeners : {})}
    >
      {isEditing && (
        <div className="absolute top-2 right-2 z-10 flex space-x-1">
          <button
            onClick={onToggleVisibility}
            className="p-1 bg-white dark:bg-gray-800 rounded shadow-md border hover:bg-gray-50 dark:hover:bg-gray-700"
            title={widget.isVisible ? 'Hide widget' : 'Show widget'}
          >
            {widget.isVisible ? (
              <EyeIcon className="h-4 w-4 text-gray-600" />
            ) : (
              <EyeSlashIcon className="h-4 w-4 text-gray-400" />
            )}
          </button>
          <button
            onClick={onRemove}
            className="p-1 bg-white dark:bg-gray-800 rounded shadow-md border hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
            title="Remove widget"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )}
      
      <ChartWidget
        config={widget}
        data={mockData}
        isEditing={isEditing}
        onConfigChange={onConfigChange}
        onRemove={onRemove}
        className={isEditing ? 'cursor-move' : ''}
      />
    </div>
  );
};

/**
 * Dashboard Builder Component
 * Provides drag-and-drop interface for creating custom analytics dashboards
 */
export const DashboardBuilder: React.FC<DashboardBuilderProps> = ({
  layout,
  isEditing,
  onLayoutChange,
  onToggleEdit,
  onSaveLayout,
  onAddWidget,
  className = ''
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCompact, setIsCompact] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = layout.widgets.findIndex(w => w.id === active.id);
      const newIndex = layout.widgets.findIndex(w => w.id === over?.id);

      const newWidgets = arrayMove(layout.widgets, oldIndex, newIndex);
      
      onLayoutChange({
        ...layout,
        widgets: newWidgets,
        updatedAt: new Date()
      });
    }

    setActiveId(null);
  }, [layout, onLayoutChange]);

  const handleWidgetConfigChange = useCallback((widgetId: string, config: ChartConfig) => {
    const newWidgets = layout.widgets.map(w => 
      w.id === widgetId ? config : w
    );
    
    onLayoutChange({
      ...layout,
      widgets: newWidgets,
      updatedAt: new Date()
    });
  }, [layout, onLayoutChange]);

  const handleRemoveWidget = useCallback((widgetId: string) => {
    const newWidgets = layout.widgets.filter(w => w.id !== widgetId);
    
    onLayoutChange({
      ...layout,
      widgets: newWidgets,
      updatedAt: new Date()
    });
  }, [layout, onLayoutChange]);

  const handleToggleVisibility = useCallback((widgetId: string) => {
    const newWidgets = layout.widgets.map(w => 
      w.id === widgetId ? { ...w, isVisible: !w.isVisible } : w
    );
    
    onLayoutChange({
      ...layout,
      widgets: newWidgets,
      updatedAt: new Date()
    });
  }, [layout, onLayoutChange]);

  const visibleWidgets = layout.widgets.filter(w => w.isVisible);
  const hiddenWidgetsCount = layout.widgets.length - visibleWidgets.length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {layout.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {layout.description || 'Custom analytics dashboard'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {hiddenWidgetsCount > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {hiddenWidgetsCount} widget(s) hidden
            </span>
          )}
          
          <button
            onClick={() => setIsCompact(!isCompact)}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title={isCompact ? 'Expand view' : 'Compact view'}
          >
            {isCompact ? (
              <ArrowsPointingOutIcon className="h-5 w-5" />
            ) : (
              <ArrowsPointingInIcon className="h-5 w-5" />
            )}
          </button>

          {isEditing && (
            <button
              onClick={onAddWidget}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Widget
            </button>
          )}

          <button
            onClick={onToggleEdit}
            className={`flex items-center px-3 py-2 rounded-lg ${
              isEditing
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <Cog6ToothIcon className="h-4 w-4 mr-2" />
            {isEditing ? 'Done' : 'Edit'}
          </button>

          {isEditing && (
            <button
              onClick={onSaveLayout}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Layout
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Grid */}
      {layout.widgets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No widgets</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by adding a widget to your dashboard.
          </p>
          <div className="mt-6">
            <button
              onClick={onAddWidget}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Widget
            </button>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={layout.widgets.map(w => w.id)} strategy={rectSortingStrategy}>
            <div className={`grid gap-6 ${
              isCompact 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {layout.widgets.map((widget) => (
                <SortableWidget
                  key={widget.id}
                  widget={widget}
                  isEditing={isEditing}
                  onConfigChange={(config) => handleWidgetConfigChange(widget.id, config)}
                  onRemove={() => handleRemoveWidget(widget.id)}
                  onToggleVisibility={() => handleToggleVisibility(widget.id)}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeId ? (
              <div className="opacity-50">
                <ChartWidget
                  config={layout.widgets.find(w => w.id === activeId)!}
                  data={{
                    labels: ['Preview'],
                    datasets: [{ label: 'Preview', data: [0], borderColor: '#3B82F6' }]
                  }}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Dashboard Info */}
      {isEditing && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Dashboard Edit Mode
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                <p>
                  • Drag widgets to reorder them<br />
                  • Click the eye icon to show/hide widgets<br />
                  • Click the trash icon to remove widgets<br />
                  • Click "Add Widget" to create new visualizations
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBuilder;
