// src/types/components.ts

// 支持的组件类型
export enum ComponentType {
  BUTTON = 'Button',
  INPUT = 'Input',
  TEXT = 'Text',
  CONTAINER = 'Container',
  FORM = 'Form',
  IMAGE = 'Image',
  DIVIDER = 'Divider'
}

// 组件配置
export interface ComponentConfig {
  type: ComponentType;
  label: string;
  icon: string;
  defaultProps: Record<string, any>;
  defaultStyles: Record<string, any>;
  defaultSize: Size;
  properties: ComponentProperty[];
}

// 组件属性配置
export interface ComponentProperty {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'slider';
  defaultValue: any;
  options?: Array<{ label: string; value: any }>;
  min?: number;
  max?: number;
  step?: number;
}

// 拖拽项目
export interface DragItem {
  type: string;
  componentType: ComponentType;
  id?: string;
}