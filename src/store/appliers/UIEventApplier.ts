// src/store/appliers/UIEventApplier.ts
import { produce } from 'immer';
import { set, get } from 'lodash';
import type {
  UIEvent,
  ComponentCreatedEvent,
  ComponentUpdatedEvent,
  ComponentDeletedEvent,
  ComponentMovedEvent,
  PropertyChangedEvent,
  StyleUpdatedEvent
} from '../../types/events';
import {
  UIEventType
} from '../../types/events';
import type { UIState, ComponentState } from '../../types/ui-state';

export class UIEventApplier {
  /**
   * 从事件流重建 UI 状态
   */
  static rebuildState(events: UIEvent[], initialState?: UIState): UIState {
    let state: UIState = initialState || this.createInitialState();

    // 按时间戳排序事件
    const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);

    // 依次应用每个事件
    for (const event of sortedEvents) {
      state = this.applyEvent(state, event);
    }

    return state;
  }

  /**
   * 应用单个事件到状态
   */
  static applyEvent(state: UIState, event: UIEvent): UIState {
    return produce(state, draft => {
      try {
        switch (event.type) {
          case UIEventType.COMPONENT_CREATED:
            this.applyComponentCreated(draft, event as ComponentCreatedEvent);
            break;

          case UIEventType.COMPONENT_UPDATED:
            this.applyComponentUpdated(draft, event as ComponentUpdatedEvent);
            break;

          case UIEventType.COMPONENT_DELETED:
            this.applyComponentDeleted(draft, event as ComponentDeletedEvent);
            break;

          case UIEventType.COMPONENT_MOVED:
            this.applyComponentMoved(draft, event as ComponentMovedEvent);
            break;

          case UIEventType.PROPERTY_CHANGED:
            this.applyPropertyChanged(draft, event as PropertyChangedEvent);
            break;

          case UIEventType.STYLE_UPDATED:
            this.applyStyleUpdated(draft, event as StyleUpdatedEvent);
            break;

          default:
            console.warn('Unknown event type:', event.type);
        }

        // 更新元数据
        if (event.metadata?.version) {
          draft.metadata.version = Math.max(
            draft.metadata.version,
            event.metadata.version
          );
        }
        draft.metadata.modified = new Date(event.timestamp);

      } catch (error) {
        console.error('Error applying event:', event, error);
      }
    });
  }

  /**
   * 创建初始状态
   */
  private static createInitialState(): UIState {
    return {
      pageId: 'main-page',
      components: {}, // 改为普通对象
      layout: {
        type: 'free',
        constraints: {
          snapToGrid: false,
          gridSize: 10
        }
      },
      globalStyles: {
        theme: 'light'
      },
      metadata: {
        version: 0,
        created: new Date(),
        modified: new Date(),
        title: 'Untitled Page'
      }
    };
  }

  /**
   * 应用组件创建事件
   */
  private static applyComponentCreated(
    draft: UIState,
    event: ComponentCreatedEvent
  ) {
    const { componentId, componentType, parentId, position, size, initialProps, initialStyles } = event.payload;

    console.log('应用组件创建事件:', {
      componentId,
      componentType,
      parentId,
      position,
      size
    });

    const newComponent: ComponentState = {
      id: componentId,
      type: componentType,
      props: { ...initialProps },
      styles: { ...initialStyles },
      position: { ...position },
      size: { ...size },
      parentId,
      children: [],
      visible: true,
      locked: false,
      zIndex: Object.keys(draft.components).length + 1
    };

    draft.components[componentId] = newComponent;
    console.log('组件已添加到状态:', newComponent);

    // 如果有父组件，更新父组件的 children
    if (parentId && draft.components[parentId]) {
      const parent = draft.components[parentId];
      if (!parent.children.includes(componentId)) {
        parent.children.push(componentId);
        console.log('已添加到父组件 children:', {
          parentId,
          parentChildren: parent.children
        });
      }
    } else if (parentId) {
      console.warn('父组件未找到:', parentId);
    }

    console.log('当前所有组件:', Object.keys(draft.components));
  }

  /**
   * 应用组件更新事件
   */
  private static applyComponentUpdated(
    draft: UIState,
    event: ComponentUpdatedEvent
  ) {
    const { componentId, updates } = event.payload;
    const component = draft.components[componentId];

    if (!component) {
      console.warn('Component not found for update:', componentId);
      return;
    }

    // 更新位置
    if (updates.position) {
      component.position = { ...updates.position };
    }

    // 更新大小
    if (updates.size) {
      component.size = { ...updates.size };
    }

    // 更新属性
    if (updates.props) {
      Object.assign(component.props, updates.props);
    }

    // 更新样式
    if (updates.styles) {
      Object.assign(component.styles, updates.styles);
    }
  }

  /**
   * 应用组件删除事件
   */
  private static applyComponentDeleted(
    draft: UIState,
    event: ComponentDeletedEvent
  ) {
    const { componentId, parentId } = event.payload;

    // 递归删除子组件
    const component = draft.components[componentId];
    if (component && component.children.length > 0) {
      const childrenToDelete = [...component.children];
      for (const childId of childrenToDelete) {
        this.deleteComponentRecursive(draft, childId);
      }
    }

    // 从父组件的 children 中移除
    if (parentId && draft.components[parentId]) {
      const parent = draft.components[parentId];
      const index = parent.children.indexOf(componentId);
      if (index > -1) {
        parent.children.splice(index, 1);
      }
    }

    // 删除组件本身
    delete draft.components[componentId];

    // 如果删除的是当前选中的组件，清除选中状态
    if (draft.selectedComponentId === componentId) {
      draft.selectedComponentId = undefined;
    }
  }

  /**
   * 递归删除组件及其子组件
   */
  private static deleteComponentRecursive(draft: UIState, componentId: string) {
    const component = draft.components[componentId];
    if (!component) return;

    // 递归删除子组件
    for (const childId of component.children) {
      this.deleteComponentRecursive(draft, childId);
    }

    // 删除组件
    delete draft.components[componentId];
  }

  /**
   * 应用组件移动事件
   */
  private static applyComponentMoved(
    draft: UIState,
    event: ComponentMovedEvent
  ) {
    const { componentId, newPosition, oldParentId, newParentId } = event.payload;
    const component = draft.components[componentId];

    if (!component) {
      console.warn('Component not found for move:', componentId);
      return;
    }

    // 更新位置
    component.position = { ...newPosition };

    // 处理父组件变更
    if (oldParentId !== newParentId) {
      // 从旧父组件移除
      if (oldParentId && draft.components[oldParentId]) {
        const oldParent = draft.components[oldParentId];
        const index = oldParent.children.indexOf(componentId);
        if (index > -1) {
          oldParent.children.splice(index, 1);
        }
      }

      // 添加到新父组件
      if (newParentId && draft.components[newParentId]) {
        const newParent = draft.components[newParentId];
        if (!newParent.children.includes(componentId)) {
          newParent.children.push(componentId);
        }
      }

      // 更新组件的父ID
      component.parentId = newParentId;
    }
  }

  /**
   * 应用属性变更事件
   */
  private static applyPropertyChanged(
    draft: UIState,
    event: PropertyChangedEvent
  ) {
    const { componentId, propertyPath, newValue } = event.payload;
    const component = draft.components[componentId];

    if (!component) {
      console.warn('Component not found for property change:', componentId);
      return;
    }

    // 使用 lodash.set 处理嵌套属性路径
    set(component, propertyPath, newValue);
  }

  /**
   * 应用样式更新事件
   */
  private static applyStyleUpdated(
    draft: UIState,
    event: StyleUpdatedEvent
  ) {
    const { componentId, styleProperty, newValue } = event.payload;
    const component = draft.components[componentId];

    if (!component) {
      console.warn('Component not found for style update:', componentId);
      return;
    }

    component.styles[styleProperty] = newValue;
  }
}