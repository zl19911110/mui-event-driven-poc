// src/store/snapshots/SnapshotManager.ts
// src/store/snapshots/SnapshotManager.ts
import type { UIState, UISnapshot } from '../../types/ui-state';
import type { UIEvent } from '../../types/events';
import { v4 as uuidv4 } from 'uuid';

export class SnapshotManager {
  private static readonly SNAPSHOT_INTERVAL = 50; // 每50个事件创建一个快照
  private static readonly MAX_SNAPSHOTS = 10; // 最多保留10个快照

  /**
   * 判断是否应该创建快照
   */
  static shouldCreateSnapshot(eventCount: number): boolean {
    return eventCount > 0 && eventCount % this.SNAPSHOT_INTERVAL === 0;
  }

  /**
   * 创建快照
   */
  static createSnapshot(
    state: UIState,
    version: number,
    description?: string
  ): UISnapshot {
    return {
      id: uuidv4(),
      version,
      timestamp: new Date(),
      state: this.cloneState(state),
      description: description || `Auto snapshot at version ${version}`
    };
  }

  /**
   * 管理快照数量，删除过旧的快照
   */
  static pruneSnapshots(snapshots: UISnapshot[]): UISnapshot[] {
    if (snapshots.length <= this.MAX_SNAPSHOTS) {
      return snapshots;
    }

    // 按版本排序，保留最新的快照
    const sortedSnapshots = [...snapshots].sort((a, b) => b.version - a.version);
    return sortedSnapshots.slice(0, this.MAX_SNAPSHOTS);
  }

  /**
   * 找到最适合的快照用于状态重建
   */
  static findBestSnapshot(
    snapshots: UISnapshot[],
    targetVersion: number
  ): UISnapshot | null {
    if (snapshots.length === 0) return null;

    // 找到版本号不超过目标版本的最新快照
    const validSnapshots = snapshots.filter(s => s.version <= targetVersion);
    
    if (validSnapshots.length === 0) return null;

    return validSnapshots.reduce((best, current) => 
      current.version > best.version ? current : best
    );
  }

  /**
   * 深度克隆状态对象
   */
  private static cloneState(state: UIState): UIState {
    return {
      pageId: state.pageId,
      components: Object.fromEntries(
        Object.entries(state.components).map(([id, component]) => [
          id,
          {
            ...component,
            props: { ...component.props },
            styles: { ...component.styles },
            position: { ...component.position },
            size: { ...component.size },
            children: [...component.children]
          }
        ])
      ),
      layout: {
        ...state.layout,
        constraints: state.layout.constraints ? { ...state.layout.constraints } : undefined
      },
      globalStyles: {
        ...state.globalStyles,
        variables: state.globalStyles.variables ? { ...state.globalStyles.variables } : undefined
      },
      selectedComponentId: state.selectedComponentId,
      metadata: {
        ...state.metadata,
        created: new Date(state.metadata.created),
        modified: new Date(state.metadata.modified)
      }
    };
  }

  /**
   * 计算快照的内存占用（粗略估算）
   */
  static estimateSnapshotSize(snapshot: UISnapshot): number {
    try {
      return JSON.stringify(snapshot).length * 2; // 粗略估算字节数
    } catch (error) {
      console.warn('Failed to estimate snapshot size:', error);
      return 0;
    }
  }

  /**
   * 验证快照的完整性
   */
  static validateSnapshot(snapshot: UISnapshot): boolean {
    try {
      return !!(
        snapshot.id &&
        snapshot.version >= 0 &&
        snapshot.timestamp &&
        snapshot.state &&
        snapshot.state.pageId &&
        snapshot.state.components &&
        snapshot.state.metadata
      );
    } catch (error) {
      console.warn('Snapshot validation failed:', error);
      return false;
    }
  }
}