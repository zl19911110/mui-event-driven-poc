// src/components/Preview/Canvas.tsx
import React, { useRef, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { Box, Typography } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import type { ComponentState, UIState } from '../../types/ui-state';
import { DragItemTypes, type DragItem } from '../../contexts/DragContext';
import { DraggableCanvasComponent } from './DraggableCanvasComponent';
import { EventFactory } from '../../utils/event-factory';
import { getDefaultProps, getDefaultStyles, getDefaultSize } from '../../data/component-configs';

interface CanvasProps {
  uiState: UIState;
  selectedComponentId?: string;
  onAddComponent: (event: any) => void;
  onUpdateComponent: (event: any) => void;
  onSelectComponent: (componentId: string) => void;
  onDoubleClickComponent: (componentId: string) => void;
}

export function Canvas({
  uiState,
  selectedComponentId,
  onAddComponent,
  onUpdateComponent,
  onSelectComponent,
  onDoubleClickComponent
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  // 画布放置功能
  const [{ isOver, canDrop }, drop] = useDrop<
    DragItem,
    any,
    { isOver: boolean; canDrop: boolean }
  >({
    accept: [DragItemTypes.COMPONENT, DragItemTypes.EXISTING_COMPONENT],
    drop: (item, monitor) => {
      if (monitor.didDrop()) return; // 避免嵌套处理

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset || !canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const dropPosition = {
        x: clientOffset.x - canvasRect.left,
        y: clientOffset.y - canvasRect.top
      };

      handleDrop(item, dropPosition);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    })
  });

  // 处理组件放置
  const handleDrop = useCallback((dragItem: DragItem, position: { x: number; y: number }) => {
    if (dragItem.type === DragItemTypes.COMPONENT && dragItem.componentType) {
      // 创建新组件
      const componentId = uuidv4();
      const componentType = dragItem.componentType;
      
      const defaultProps = getDefaultProps(componentType as any);
      const defaultStyles = getDefaultStyles(componentType as any);
      const defaultSize = getDefaultSize(componentType as any);

      const event = EventFactory.createComponentCreated(
        componentId,
        componentType,
        position,
        defaultSize,
        defaultProps,
        defaultStyles
      );

      onAddComponent(event);
      onSelectComponent(componentId);
    } else if (dragItem.type === DragItemTypes.EXISTING_COMPONENT && dragItem.componentId) {
      // 移动现有组件
      const component = uiState.components[dragItem.componentId]; // 修改这里
      if (component) {
        const event = EventFactory.createComponentMoved(
          dragItem.componentId,
          component.position,
          position
        );
        onUpdateComponent(event);
      }
    }
  }, [uiState.components, onAddComponent, onUpdateComponent, onSelectComponent]);

  // 处理组件移动
  const handleComponentMove = useCallback((componentId: string, newPosition: { x: number; y: number }) => {
    const component = uiState.components[componentId]; // 修改这里
    if (component) {
      const event = EventFactory.createComponentMoved(
        componentId,
        component.position,
        newPosition
      );
      onUpdateComponent(event);
    }
  }, [uiState.components, onUpdateComponent]);

  // 处理嵌套组件放置
  const handleNestedDrop = useCallback((dragItem: DragItem, targetId: string, relativePosition: { x: number; y: number }) => {
    console.log('=== 嵌套放置开始 ===');
    console.log('dragItem:', dragItem);
    console.log('targetId:', targetId);
    console.log('relativePosition:', relativePosition);
    console.log('当前组件列表:', Object.keys(uiState.components));
    
    if (dragItem.type === DragItemTypes.COMPONENT && dragItem.componentType) {
      // 在容器中创建新组件
      const componentId = uuidv4();
      const componentType = dragItem.componentType;
      
      console.log('创建新组件:', { componentId, componentType });
      
      const defaultProps = getDefaultProps(componentType as any);
      const defaultStyles = getDefaultStyles(componentType as any);
      const defaultSize = getDefaultSize(componentType as any);

      // 计算在容器内的绝对位置
      const targetComponent = uiState.components[targetId];
      console.log('目标容器组件:', targetComponent);
      
      if (targetComponent) {
        const absolutePosition = {
          x: targetComponent.position.x + relativePosition.x,
          y: targetComponent.position.y + relativePosition.y
        };

        console.log('计算的绝对位置:', absolutePosition);

        const event = EventFactory.createComponentCreated(
          componentId,
          componentType,
          absolutePosition,
          defaultSize,
          defaultProps,
          defaultStyles,
          targetId // 设置父组件ID
        );

        console.log('创建的事件:', event);
        onAddComponent(event);
        onSelectComponent(componentId);
        console.log('=== 嵌套放置完成 ===');
      } else {
        console.error('目标容器组件未找到:', targetId);
      }
    } else if (dragItem.type === DragItemTypes.EXISTING_COMPONENT && dragItem.componentId) {
      // 移动现有组件到容器中
      console.log('移动现有组件到容器');
      const component = uiState.components[dragItem.componentId];
      const targetComponent = uiState.components[targetId];
      
      console.log('要移动的组件:', component);
      console.log('目标容器:', targetComponent);
      
      if (component && targetComponent) {
        // 计算新的绝对位置
        const newAbsolutePosition = {
          x: targetComponent.position.x + relativePosition.x,
          y: targetComponent.position.y + relativePosition.y
        };

        console.log('新的绝对位置:', newAbsolutePosition);

        // 创建移动事件，包含父组件变更
        const event = EventFactory.createComponentMoved(
          dragItem.componentId,
          component.position,
          newAbsolutePosition,
          component.parentId,
          targetId // 新的父组件ID
        );
        
        console.log('移动事件:', event);
        onUpdateComponent(event);
        console.log('=== 组件移动完成 ===');
      }
    }
  }, [uiState.components, onAddComponent, onUpdateComponent, onSelectComponent]);

  // 渲染组件树
  const renderComponent = useCallback((component: ComponentState, depth: number = 0): React.ReactNode => {
    const isSelected = selectedComponentId === component.id;
    
    console.log(`渲染组件 (深度${depth}):`, {
      id: component.id,
      type: component.type,
      parentId: component.parentId,
      children: component.children,
      position: component.position
    });

    return (
      <DraggableCanvasComponent
        key={component.id}
        component={component}
        isSelected={isSelected}
        onSelect={onSelectComponent}
        onDoubleClick={onDoubleClickComponent}
        onMove={handleComponentMove}
        onDrop={handleNestedDrop}
      >
        {/* 渲染子组件 */}
        {component.children.map(childId => {
          const childComponent = uiState.components[childId];
          if (childComponent) {
            console.log(`找到子组件:`, childId, childComponent);
            return renderComponent(childComponent, depth + 1);
          } else {
            console.warn(`子组件未找到:`, childId);
            return null;
          }
        })}
      </DraggableCanvasComponent>
    );
  }, [selectedComponentId, onSelectComponent, onDoubleClickComponent, handleComponentMove, handleNestedDrop, uiState.components]);

  // 获取顶级组件（没有父组件的组件）
  const topLevelComponents = Object.values(uiState.components).filter( // 修改这里
    component => !component.parentId
  );

  // 画布点击处理
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectComponent(''); // 取消选择
    }
  };

  drop(canvasRef);

  return (
    <Box
      ref={canvasRef}
      data-canvas
      onClick={handleCanvasClick}
      sx={{
        flex: 1,
        position: 'relative',
        backgroundColor: '#f5f5f5',
        backgroundImage: uiState.layout.constraints?.snapToGrid ? 
          `radial-gradient(circle, #ccc 1px, transparent 1px)` : 'none',
        backgroundSize: uiState.layout.constraints?.snapToGrid ? 
          `${uiState.layout.constraints.gridSize || 10}px ${uiState.layout.constraints.gridSize || 10}px` : 'auto',
        minHeight: '100%',
        overflow: 'auto',
        ...(isOver && canDrop && {
          backgroundColor: 'rgba(25, 118, 210, 0.05)',
          outline: '2px dashed #1976d2'
        })
      }}
    >
      {/* 空状态提示 */}
      {topLevelComponents.length === 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'text.secondary',
            pointerEvents: 'none'
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            空白画布
          </Typography>
          <Typography variant="body2">
            从左侧组件库拖拽组件到此处开始设计
          </Typography>
        </Box>
      )}

      {/* 渲染所有顶级组件 */}
      {topLevelComponents.map(component => renderComponent(component))}

      {/* 画布信息 */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          px: 2,
          py: 1,
          borderRadius: 1,
          fontSize: '0.75rem',
          pointerEvents: 'none'
        }}
      >
        组件数量: {Object.keys(uiState.components).length} | {/* 修改这里 */}
        版本: {uiState.metadata.version} |
        布局: {uiState.layout.type}
      </Box>
    </Box>
  );
}