// src/store/UIEventStore.ts
// src/store/UIEventStore.ts
import type { UIEvent } from '../types/events';
import type { UIState, UISnapshot } from '../types/ui-state';
import { UIEventApplier } from './appliers/UIEventApplier';
import { SnapshotManager } from './snapshots/SnapshotManager';
import { HistoryManager, type HistoryState } from './history/HistoryManager';

export class UIEventStore {
  private historyManager = new HistoryManager();
  private snapshots: UISnapshot[] = [];
  private currentState: UIState | null = null;
  private listeners: Set<(state: UIState) => void> = new Set();
  private historyListeners: Set<(historyState: HistoryState) => void> = new Set();

  constructor() {
    // 初始化空状态
    this.currentState = UIEventApplier.rebuildState([]);
  }

  /**
   * 添加事件并更新状态
   */
  addEvent(event: UIEvent): UIState {
    // 添加到历史管理器
    this.historyManager.addEvent(event);

    // 重建当前状态
    this.rebuildCurrentState();

    // 检查是否需要创建快照
    const totalEvents = this.historyManager.getAllEvents().length;
    if (SnapshotManager.shouldCreateSnapshot(totalEvents)) {
      this.createSnapshot(`Auto snapshot at ${totalEvents} events`);
    }

    // 通知监听器
    this.notifyStateListeners();
    this.notifyHistoryListeners();

    return this.currentState!;
  }

  /**
   * 撤销操作
   */
  undo(): UIState | null {
    const events = this.historyManager.undo();
    if (events === null) return null;

    this.rebuildFromEvents(events);
    this.notifyStateListeners();
    this.notifyHistoryListeners();

    return this.currentState;
  }

  /**
   * 重做操作
   */
  redo(): UIState | null {
    const events = this.historyManager.redo();
    if (events === null) return null;

    this.rebuildFromEvents(events);
    this.notifyStateListeners();
    this.notifyHistoryListeners();

    return this.currentState;
  }

  /**
   * 跳转到指定版本
   */
  jumpToVersion(version: number): UIState | null {
    const events = this.historyManager.jumpToVersion(version);
    if (events === null) return null;

    this.rebuildFromEvents(events);
    this.notifyStateListeners();
    this.notifyHistoryListeners();

    return this.currentState;
  }

  /**
   * 跳转到指定时间点
   */
  jumpToTimestamp(timestamp: number): UIState | null {
    const events = this.historyManager.jumpToTimestamp(timestamp);
    if (events === null) return null;

    this.rebuildFromEvents(events);
    this.notifyStateListeners();
    this.notifyHistoryListeners();

    return this.currentState;
  }

  /**
   * 获取当前状态
   */
  getCurrentState(): UIState {
    if (!this.currentState) {
      this.currentState = UIEventApplier.rebuildState([]);
    }
    return this.currentState;
  }

  /**
   * 获取历史状态
   */
  getHistoryState(): HistoryState {
    return this.historyManager.getHistoryState();
  }

  /**
   * 获取所有事件
   */
  getAllEvents(): UIEvent[] {
    return this.historyManager.getAllEvents();
  }

  /**
   * 获取所有快照
   */
  getAllSnapshots(): UISnapshot[] {
    return [...this.snapshots];
  }

  /**
   * 手动创建快照
   */
  createSnapshot(description?: string): UISnapshot {
    if (!this.currentState) return null!;

    const version = this.historyManager.getHistoryState().currentVersion;
    const snapshot = SnapshotManager.createSnapshot(
      this.currentState,
      version,
      description
    );

    this.snapshots.push(snapshot);
    this.snapshots = SnapshotManager.pruneSnapshots(this.snapshots);

    return snapshot;
  }

  /**
   * 从快照恢复状态
   */
  restoreFromSnapshot(snapshotId: string): UIState | null {
    const snapshot = this.snapshots.find(s => s.id === snapshotId);
    if (!snapshot) return null;

    // 跳转到快照对应的版本
    return this.jumpToVersion(snapshot.version);
  }

  /**
   * 重建当前状态
   */
  private rebuildCurrentState(): void {
    const events = this.historyManager.getCurrentEvents();
    this.rebuildFromEvents(events);
  }

  /**
   * 从事件列表重建状态
   */
  private rebuildFromEvents(events: UIEvent[]): void {
    // 尝试从最近的快照开始重建
    const bestSnapshot = SnapshotManager.findBestSnapshot(
      this.snapshots,
      events.length
    );

    if (bestSnapshot) {
      // 从快照开始重建
      const eventsAfterSnapshot = events.filter(
        e => e.metadata?.version! > bestSnapshot.version
      );
      this.currentState = UIEventApplier.rebuildState(
        eventsAfterSnapshot,
        bestSnapshot.state
      );
    } else {
      // 从头开始重建
      this.currentState = UIEventApplier.rebuildState(events);
    }
  }

  /**
   * 订阅状态变化
   */
  subscribe(listener: (state: UIState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 订阅历史状态变化
   */
  subscribeHistory(listener: (historyState: HistoryState) => void): () => void {
    this.historyListeners.add(listener);
    return () => this.historyListeners.delete(listener);
  }

  /**
   * 通知状态监听器
   */
  private notifyStateListeners(): void {
    if (this.currentState) {
      this.listeners.forEach(listener => {
        try {
          listener(this.currentState!);
        } catch (error) {
          console.error('Error in state listener:', error);
        }
      });
    }
  }

  /**
   * 通知历史监听器
   */
  private notifyHistoryListeners(): void {
    const historyState = this.historyManager.getHistoryState();
    this.historyListeners.forEach(listener => {
      try {
        listener(historyState);
      } catch (error) {
        console.error('Error in history listener:', error);
      }
    });
  }

  /**
   * 清空所有数据
   */
  clear(): void {
    this.historyManager.clear();
    this.snapshots = [];
    this.currentState = UIEventApplier.rebuildState([]);
    this.notifyStateListeners();
    this.notifyHistoryListeners();
  }

  /**
   * 导出数据
   */
  exportData() {
    return {
      events: this.getAllEvents(),
      snapshots: this.getAllSnapshots(),
      currentState: this.getCurrentState(),
      metadata: {
        exportTime: new Date(),
        version: '1.0.0'
      }
    };
  }

  /**
   * 导入数据
   */
  importData(data: any): boolean {
    try {
      this.clear();

      if (data.events && Array.isArray(data.events)) {
        for (const event of data.events) {
          this.historyManager.addEvent(event);
        }
      }

      if (data.snapshots && Array.isArray(data.snapshots)) {
        this.snapshots = data.snapshots.filter(SnapshotManager.validateSnapshot);
      }

      this.rebuildCurrentState();
      this.notifyStateListeners();
      this.notifyHistoryListeners();

      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    const historyStats = this.historyManager.getStatistics();
    const snapshotStats = {
      totalSnapshots: this.snapshots.length,
      totalSnapshotSize: this.snapshots.reduce(
        (total, snapshot) => total + SnapshotManager.estimateSnapshotSize(snapshot),
        0
      )
    };

    return {
      ...historyStats,
      ...snapshotStats,
      currentStateComponents: Object.keys(this.currentState?.components || {}).length // 修改这里
    };
  }
}

// 创建全局事件存储实例
export const eventStore = new UIEventStore();