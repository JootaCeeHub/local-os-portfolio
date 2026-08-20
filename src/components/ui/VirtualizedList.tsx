import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (props: { index: number; style: React.CSSProperties; data: T[] }) => React.ReactElement;
  className?: string;
  overscan?: number;
}

export const VirtualizedList = <T,>({
  items,
  height,
  itemHeight,
  renderItem,
  className = '',
  overscan = 5,
}: VirtualizedListProps<T>) => {
  const ItemRenderer = useMemo(() => {
    return ({ index, style }: { index: number; style: React.CSSProperties }) => (
      <div style={style}>
        {renderItem({ index, style, data: items })}
      </div>
    );
  }, [items, renderItem]);

  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <p className="text-gray-400">No hay elementos para mostrar</p>
      </div>
    );
  }

  return (
    <List
      className={className}
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      itemData={items}
      overscanCount={overscan}
    >
      {ItemRenderer}
    </List>
  );
};

// Specialized components for common use cases
interface TaskListItemProps {
  task: any;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
}

export const TaskListItem: React.FC<TaskListItemProps & { style: React.CSSProperties }> = React.memo(({
  task,
  onUpdate,
  onDelete,
  style,
}) => {
  return (
    <div style={style} className="px-4 py-2">
      <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={task.status === 'completed'}
              onChange={() => onUpdate(task.id, { 
                status: task.status === 'completed' ? 'pending' : 'completed' 
              })}
              className="rounded border-gray-600 text-emerald-500 focus:ring-emerald-500"
            />
            <span className={task.status === 'completed' ? 'line-through text-gray-400' : 'text-white'}>
              {task.title}
            </span>
          </div>
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
});

TaskListItem.displayName = 'TaskListItem';