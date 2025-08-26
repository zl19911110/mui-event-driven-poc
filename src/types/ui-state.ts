// src/types/ui-state.ts
// src/types/ui-state.ts
import type { Position, Size } from './events';

// 组件状态
export interface ComponentState {
  id: string;
  type: string;
  props: Record<string, any>;
  styles: Record<string, any>;
  position: Position;
  size: Size;
  parentId?: string;
  children: string[];
  visible: boolean;
  locked: boolean;
  zIndex: number;
}

// 页面布局配置
export interface LayoutConfig {
  type: 'free' | 'grid' | 'flex';
  constraints?: {
    maxWidth?: number;
    maxHeight?: number;
    gridSize?: number;
    snapToGrid?: boolean;
  };
}

// 全局样式
export interface GlobalStyles {
  theme?: 'light' | 'dark';
  customCSS?: string;
  variables?: Record<string, string>;
}

// 完整的 UI 状态 - 使用 Record 代替 Map
export interface UIState {
  pageId: string;
  components: Record<string, ComponentState>; // 改为 Record
  layout: LayoutConfig;
  globalStyles: GlobalStyles;
  selectedComponentId?: string;
  metadata: {
    version: number;
    created: Date;
    modified: Date;
    title: string;
  };
}

// 快照
export interface UISnapshot {
  id: string;
  version: number;
  timestamp: Date;
  state: UIState;
  description?: string;
}