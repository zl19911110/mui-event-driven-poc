// src/contexts/DragContext.tsx
import React, { createContext, useContext, type ReactNode } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// 拖拽项目类型
export const DragItemTypes = {
  COMPONENT: 'component',
  EXISTING_COMPONENT: 'existing_component'
} as const;

export type DragItemType = typeof DragItemTypes[keyof typeof DragItemTypes];

// 拖拽数据接口
export interface DragItem {
  type: DragItemType;
  componentType?: string;
  componentId?: string;
  data?: any;
}

// 拖拽结果接口
export interface DropResult {
  dropEffect: string;
  targetId?: string;
  position?: { x: number; y: number };
}

interface DragContextValue {
  // 可以在这里添加全局拖拽状态
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

const DragContext = createContext<DragContextValue | undefined>(undefined);

interface DragProviderProps {
  children: ReactNode;
}

export function DragProvider({ children }: DragProviderProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  const value: DragContextValue = {
    isDragging,
    setIsDragging
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <DragContext.Provider value={value}>
        {children}
      </DragContext.Provider>
    </DndProvider>
  );
}

export function useDragContext() {
  const context = useContext(DragContext);
  if (context === undefined) {
    throw new Error('useDragContext must be used within a DragProvider');
  }
  return context;
}