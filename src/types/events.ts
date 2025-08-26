// src/types/events.ts
export interface BaseUIEvent {
  id: string;
  type: string;
  timestamp: number;
  userId: string;
  sessionId: string;
  metadata?: {
    version: number;
    source: 'user' | 'system' | 'api';
    description?: string;
  };
}

// UI 事件类型枚举
export enum UIEventType {
  // 页面事件
  PAGE_CREATED = 'PAGE_CREATED',
  PAGE_UPDATED = 'PAGE_UPDATED',
  
  // 组件事件
  COMPONENT_CREATED = 'COMPONENT_CREATED',
  COMPONENT_UPDATED = 'COMPONENT_UPDATED',
  COMPONENT_DELETED = 'COMPONENT_DELETED',
  COMPONENT_MOVED = 'COMPONENT_MOVED',
  
  // 属性事件
  PROPERTY_CHANGED = 'PROPERTY_CHANGED',
  STYLE_UPDATED = 'STYLE_UPDATED',
  
  // 布局事件
  LAYOUT_CHANGED = 'LAYOUT_CHANGED',
  
  // 事件绑定
  EVENT_BOUND = 'EVENT_BOUND',
  EVENT_UNBOUND = 'EVENT_UNBOUND'
}

// 位置信息
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// 具体的事件接口
export interface ComponentCreatedEvent extends BaseUIEvent {
  type: UIEventType.COMPONENT_CREATED;
  payload: {
    componentId: string;
    componentType: string;
    parentId?: string;
    position: Position;
    size: Size;
    initialProps: Record<string, any>;
    initialStyles: Record<string, any>;
  };
}

export interface ComponentUpdatedEvent extends BaseUIEvent {
  type: UIEventType.COMPONENT_UPDATED;
  payload: {
    componentId: string;
    updates: {
      position?: Position;
      size?: Size;
      props?: Record<string, any>;
      styles?: Record<string, any>;
    };
  };
}

export interface ComponentDeletedEvent extends BaseUIEvent {
  type: UIEventType.COMPONENT_DELETED;
  payload: {
    componentId: string;
    parentId?: string;
  };
}

export interface ComponentMovedEvent extends BaseUIEvent {
  type: UIEventType.COMPONENT_MOVED;
  payload: {
    componentId: string;
    oldPosition: Position;
    newPosition: Position;
    oldParentId?: string;
    newParentId?: string;
  };
}

export interface PropertyChangedEvent extends BaseUIEvent {
  type: UIEventType.PROPERTY_CHANGED;
  payload: {
    componentId: string;
    propertyPath: string;
    oldValue: any;
    newValue: any;
  };
}

export interface StyleUpdatedEvent extends BaseUIEvent {
  type: UIEventType.STYLE_UPDATED;
  payload: {
    componentId: string;
    styleProperty: string;
    oldValue: any;
    newValue: any;
  };
}

// 联合类型
export type UIEvent = 
  | ComponentCreatedEvent
  | ComponentUpdatedEvent
  | ComponentDeletedEvent
  | ComponentMovedEvent
  | PropertyChangedEvent
  | StyleUpdatedEvent;