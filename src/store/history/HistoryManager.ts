// src/store/history/HistoryManager.ts
// src/store/history/HistoryManager.ts
import type { UIEvent } from '../../types/events';
import type { UIState } from '../../types/ui-state';
import { UIEventApplier } from '../appliers/UIEventApplier';
import { SnapshotManager } from '../snapshots/SnapshotManager';

export interface HistoryState {
  canUndo: boolean;
  canRedo: boolean;
  currentVersion: number;
  totalEvents: number;
  undoDescription?: string;
  redoDescription?: string;
}

export class HistoryManager {
  private events: UIEvent[] = [];
  private currentEventIndex = -1;
  private maxHistorySize = 1000;

  /**
   * 添加新事件
   */
  addEvent(event: UIEvent): void {
    // 如果当前不在历史的末尾，截断后续的事件（覆盖分支）
    if (this.currentEventIndex < this.events.length - 1) {
      this.events = this.events.slice(0, this.currentEventIndex + 1);
    }

    // 添加新事件
    this.events.push(event);
    this.currentEventIndex++;

    // 限制历史大小
    this.pruneHistory();
  }

  /**
   * 撤销操作
   */
  undo(): UIEvent[] | null {
    if (!this.canUndo()) return null;

    this.currentEventIndex--;
    return this.getCurrentEvents();
  }

  /**
   * 重做操作
   */
  redo(): UIEvent[] | null {
    if (!this.canRedo()) return null;

    this.currentEventIndex++;
    return this.getCurrentEvents();
  }

  /**
   * 跳转到指定版本
   */
  jumpToVersion(version: number): UIEvent[] | null {
    const targetIndex = this.events.findIndex(
      event => event.metadata?.version === version
    );

    if (targetIndex === -1) return null;

    this.currentEventIndex = targetIndex;
    return this.getCurrentEvents();
  }

  /**
   * 跳转到指定时间点
   */
  jumpToTimestamp(timestamp: number): UIEvent[] | null {
    // 找到最接近但不超过目标时间的事件
    let targetIndex = -1;
    for (let i = 0; i < this.events.length; i++) {
      if (this.events[i].timestamp <= timestamp) {
        targetIndex = i;
      } else {
        break;
      }
    }

    if (targetIndex === -1) return null;

    this.currentEventIndex = targetIndex;
    return this.getCurrentEvents();
  }

  /**
   * 获取当前应该应用的事件列表
   */
  getCurrentEvents(): UIEvent[] {
    return this.events.slice(0, this.currentEventIndex + 1);
  }

  /**
   * 获取所有事件
   */
  getAllEvents(): UIEvent[] {
    return [...this.events];
  }

  /**
   * 获取历史状态信息
   */
  getHistoryState(): HistoryState {
    const canUndo = this.canUndo();
    const canRedo = this.canRedo();

    let undoDescription: string | undefined;
    let redoDescription: string | undefined;

    if (canUndo && this.currentEventIndex >= 0) {
      const lastEvent = this.events[this.currentEventIndex];
      undoDescription = this.getEventDescription(lastEvent);
    }

    if (canRedo && this.currentEventIndex + 1 < this.events.length) {
      const nextEvent = this.events[this.currentEventIndex + 1];
      redoDescription = this.getEventDescription(nextEvent);
    }

    return {
      canUndo,
      canRedo,
      currentVersion: this.currentEventIndex + 1,
      totalEvents: this.events.length,
      undoDescription,
      redoDescription
    };
  }

  /**
   * 检查是否可以撤销
   */
  canUndo(): boolean {
    return this.currentEventIndex >= 0;
  }

  /**
   * 检查是否可以重做
   */
  canRedo(): boolean {
    return this.currentEventIndex < this.events.length - 1;
  }

  /**
   * 获取事件的描述文本
   */
  private getEventDescription(event: UIEvent): string {
    switch (event.type) {
      case 'COMPONENT_CREATED':
        return `创建${event.payload.componentType}组件`;
      case 'COMPONENT_UPDATED':
        return `更新组件`;
      case 'COMPONENT_DELETED':
        return `删除组件`;
      case 'COMPONENT_MOVED':
        return `移动组件`;
      case 'PROPERTY_CHANGED':
        return `修改属性: ${event.payload.propertyPath}`;
      case 'STYLE_UPDATED':
        return `更新样式: ${event.payload.styleProperty}`;
      default:
        return event.metadata?.description || '未知操作';
    }
  }

  /**
   * 限制历史大小
   */
  private pruneHistory(): void {
    if (this.events.length > this.maxHistorySize) {
      const removeCount = this.events.length - this.maxHistorySize;
      this.events = this.events.slice(removeCount);
      this.currentEventIndex = Math.max(0, this.currentEventIndex - removeCount);
    }
  }

  /**
   * 清空历史
   */
  clear(): void {
    this.events = [];
    this.currentEventIndex = -1;
  }

  /**
   * 获取历史统计信息
   */
  getStatistics() {
    const eventsByType = new Map<string, number>();
    const eventsByUser = new Map<string, number>();
    let totalSize = 0;

    for (const event of this.events) {
      // 统计事件类型
      const count = eventsByType.get(event.type) || 0;
      eventsByType.set(event.type, count + 1);

      // 统计用户操作
      const userCount = eventsByUser.get(event.userId) || 0;
      eventsByUser.set(event.userId, userCount + 1);

      // 估算大小
      try {
        totalSize += JSON.stringify(event).length;
      } catch (e) {
        // 忽略序列化错误
      }
    }

    return {
      totalEvents: this.events.length,
      currentPosition: this.currentEventIndex + 1,
      eventsByType: Object.fromEntries(eventsByType),
      eventsByUser: Object.fromEntries(eventsByUser),
      estimatedSize: totalSize,
      timeSpan: this.events.length > 0 ? {
        start: new Date(this.events[0].timestamp),
        end: new Date(this.events[this.events.length - 1].timestamp)
      } : null
    };
  }
}