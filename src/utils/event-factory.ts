// src/utils/event-factory.ts
import { v4 as uuidv4 } from 'uuid';
import type {
  UIEvent,
  ComponentCreatedEvent,
  ComponentUpdatedEvent,
  ComponentDeletedEvent,
  ComponentMovedEvent,
  PropertyChangedEvent,
  StyleUpdatedEvent,
  Position,
  Size
} from '../types/events';
import { UIEventType } from '../types/events';

export class EventFactory {
  private static currentVersion = 0;
  private static userId = 'zl19911110'; // 当前用户
  private static sessionId = uuidv4();

  private static createBaseEvent(type: UIEventType): Omit<UIEvent, 'payload'> {
    return {
      id: uuidv4(),
      type,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      metadata: {
        version: ++this.currentVersion,
        source: 'user'
      }
    };
  }

  static createComponentCreated(
    componentId: string,
    componentType: string,
    position: Position,
    size: Size,
    initialProps: Record<string, any> = {},
    initialStyles: Record<string, any> = {},
    parentId?: string
  ): ComponentCreatedEvent {
    const event = {
      ...this.createBaseEvent(UIEventType.COMPONENT_CREATED),
      payload: {
        componentId,
        componentType,
        parentId,
        position,
        size,
        initialProps,
        initialStyles
      }
    } as ComponentCreatedEvent;
    
    console.log('EventFactory 创建组件事件:', event);
    return event;
  }

  static createComponentUpdated(
    componentId: string,
    updates: {
      position?: Position;
      size?: Size;
      props?: Record<string, any>;
      styles?: Record<string, any>;
    }
  ): ComponentUpdatedEvent {
    return {
      ...this.createBaseEvent(UIEventType.COMPONENT_UPDATED),
      payload: {
        componentId,
        updates
      }
    } as ComponentUpdatedEvent;
  }

  static createComponentDeleted(
    componentId: string,
    parentId?: string
  ): ComponentDeletedEvent {
    return {
      ...this.createBaseEvent(UIEventType.COMPONENT_DELETED),
      payload: {
        componentId,
        parentId
      }
    } as ComponentDeletedEvent;
  }

  static createComponentMoved(
    componentId: string,
    oldPosition: Position,
    newPosition: Position,
    oldParentId?: string,
    newParentId?: string
  ): ComponentMovedEvent {
    return {
      ...this.createBaseEvent(UIEventType.COMPONENT_MOVED),
      payload: {
        componentId,
        oldPosition,
        newPosition,
        oldParentId,
        newParentId
      }
    } as ComponentMovedEvent;
  }

  static createPropertyChanged(
    componentId: string,
    propertyPath: string,
    oldValue: any,
    newValue: any
  ): PropertyChangedEvent {
    return {
      ...this.createBaseEvent(UIEventType.PROPERTY_CHANGED),
      payload: {
        componentId,
        propertyPath,
        oldValue,
        newValue
      }
    } as PropertyChangedEvent;
  }

  static createStyleUpdated(
    componentId: string,
    styleProperty: string,
    oldValue: any,
    newValue: any
  ): StyleUpdatedEvent {
    return {
      ...this.createBaseEvent(UIEventType.STYLE_UPDATED),
      payload: {
        componentId,
        styleProperty,
        oldValue,
        newValue
      }
    } as StyleUpdatedEvent;
  }

  // 重置版本号（用于测试或重新开始）
  static resetVersion() {
    this.currentVersion = 0;
  }

  // 获取当前版本号
  static getCurrentVersion() {
    return this.currentVersion;
  }
}