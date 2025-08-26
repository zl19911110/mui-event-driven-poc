// src/components/Preview/DraggableCanvasComponent.tsx
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Box } from '@mui/material';
import type { ComponentState } from '../../types/ui-state';
import { DragItemTypes, type DragItem } from '../../contexts/DragContext';
import { RenderComponent } from './RenderComponent';

interface DraggableCanvasComponentProps {
  component: ComponentState;
  isSelected?: boolean;
  onSelect?: (componentId: string) => void;
  onDoubleClick?: (componentId: string) => void;
  onMove?: (componentId: string, newPosition: { x: number; y: number }) => void;
  onDrop?: (dragItem: DragItem, targetId: string, position: { x: number; y: number }) => void;
  children?: React.ReactNode;
}

export function DraggableCanvasComponent({
  component,
  isSelected = false,
  onSelect,
  onDoubleClick,
  onMove,
  onDrop,
  children
}: DraggableCanvasComponentProps) {
  const ref = useRef<HTMLDivElement>(null);

  // 拖拽功能
  const [{ isDragging }, drag] = useDrag<
    DragItem,
    any,
    { isDragging: boolean }
  >({
    type: DragItemTypes.EXISTING_COMPONENT,
    item: {
      type: DragItemTypes.EXISTING_COMPONENT,
      componentId: component.id,
      componentType: component.type
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  // 放置功能（用于容器组件）
  const [{ isOver, canDrop }, drop] = useDrop<
    DragItem,
    any,
    { isOver: boolean; canDrop: boolean }
  >({
    accept: [DragItemTypes.COMPONENT, DragItemTypes.EXISTING_COMPONENT],
    drop: (item, monitor) => {
      if (monitor.didDrop()) return; // 避免嵌套处理

      const clientOffset = monitor.getClientOffset();
      if (clientOffset && ref.current) {
        const componentRect = ref.current.getBoundingClientRect();
        const relativePosition = {
          x: clientOffset.x - componentRect.left,
          y: clientOffset.y - componentRect.top
        };
        
        // 确保位置是相对于容器的
        const clampedPosition = {
          x: Math.max(10, Math.min(relativePosition.x, component.size.width - 50)),
          y: Math.max(10, Math.min(relativePosition.y, component.size.height - 30))
        };
        
        onDrop?.(item, component.id, clampedPosition);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    }),
    canDrop: (item) => {
      // 容器组件和表单组件可以接受其他组件
      const isContainer = component.type === 'Container' || component.type === 'Form';
      // 不能拖拽到自己身上
      const isSelf = item.componentId === component.id;
      // 不能拖拽到自己的子组件上（避免循环嵌套）
      const isDescendant = item.componentId && component.children.includes(item.componentId);
      
      return isContainer && !isSelf && !isDescendant;
    }
  });

  // 组合 drag 和 drop refs
  const combinedRef = (element: HTMLDivElement | null) => {
    ref.current = element;
    drag(element);
    drop(element);
  };

  const isDropTarget = isOver && canDrop;

  return (
    <Box
      ref={combinedRef}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'rotate(2deg)' : 'none',
        transition: 'all 0.2s ease',
        position: 'relative',
        ...(isDropTarget && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            border: '2px dashed #1976d2',
            borderRadius: 1,
            zIndex: 1,
            pointerEvents: 'none'
          }
        })
      }}
    >
      <RenderComponent
        component={component}
        isSelected={isSelected}
        onSelect={onSelect}
        onDoubleClick={onDoubleClick}
      >
        {children}
      </RenderComponent>
      
      {/* 容器放置提示 */}
      {isDropTarget && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(25, 118, 210, 0.9)',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 1,
            fontSize: '0.8rem',
            zIndex: 2,
            pointerEvents: 'none'
          }}
        >
          放置到容器中
        </Box>
      )}
    </Box>
  );
}