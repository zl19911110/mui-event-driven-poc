// src/utils/component-utils.ts
// src/utils/component-utils.ts
import type { ComponentState } from '../types/ui-state';

/**
 * 获取组件数组（从对象转换）
 */
export function getComponentsArray(components: Record<string, ComponentState>): ComponentState[] {
  return Object.values(components);
}

/**
 * 获取顶级组件
 */
export function getTopLevelComponents(components: Record<string, ComponentState>): ComponentState[] {
  return Object.values(components).filter(component => !component.parentId);
}

/**
 * 获取子组件
 */
export function getChildComponents(
  components: Record<string, ComponentState>, 
  parentId: string
): ComponentState[] {
  return Object.values(components).filter(component => component.parentId === parentId);
}

/**
 * 获取组件
 */
export function getComponent(
  components: Record<string, ComponentState>, 
  componentId: string
): ComponentState | undefined {
  return components[componentId];
}

/**
 * 检查组件是否存在
 */
export function hasComponent(
  components: Record<string, ComponentState>, 
  componentId: string
): boolean {
  return componentId in components;
}

/**
 * 获取组件数量
 */
export function getComponentCount(components: Record<string, ComponentState>): number {
  return Object.keys(components).length;
}