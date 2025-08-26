// src/data/component-configs.ts
import { type ComponentConfig, ComponentType } from '../types/components';

export const COMPONENT_CONFIGS: Record<ComponentType, ComponentConfig> = {
  [ComponentType.BUTTON]: {
    type: ComponentType.BUTTON,
    label: '按钮',
    icon: '🔘',
    defaultProps: {
      text: '按钮',
      variant: 'contained',
      color: 'primary',
      disabled: false,
      fullWidth: false
    },
    defaultStyles: {
      fontSize: '14px',
      fontWeight: 'normal',
      textTransform: 'none',
      borderRadius: '4px'
    },
    defaultSize: { width: 100, height: 36 },
    properties: [
      {
        key: 'text',
        label: '按钮文本',
        type: 'string',
        defaultValue: '按钮'
      },
      {
        key: 'variant',
        label: '样式变体',
        type: 'select',
        defaultValue: 'contained',
        options: [
          { label: '填充', value: 'contained' },
          { label: '轮廓', value: 'outlined' },
          { label: '文本', value: 'text' }
        ]
      },
      {
        key: 'color',
        label: '颜色',
        type: 'select',
        defaultValue: 'primary',
        options: [
          { label: '主色', value: 'primary' },
          { label: '次色', value: 'secondary' },
          { label: '成功', value: 'success' },
          { label: '错误', value: 'error' },
          { label: '警告', value: 'warning' },
          { label: '信息', value: 'info' }
        ]
      },
      {
        key: 'disabled',
        label: '禁用状态',
        type: 'boolean',
        defaultValue: false
      },
      {
        key: 'fullWidth',
        label: '全宽度',
        type: 'boolean',
        defaultValue: false
      }
    ]
  },

  [ComponentType.INPUT]: {
    type: ComponentType.INPUT,
    label: '输入框',
    icon: '📝',
    defaultProps: {
      label: '输入框',
      placeholder: '请输入内容',
      value: '',
      variant: 'outlined',
      required: false,
      disabled: false,
      fullWidth: true,
      multiline: false,
      rows: 1
    },
    defaultStyles: {
      fontSize: '14px',
      borderRadius: '4px'
    },
    defaultSize: { width: 200, height: 56 },
    properties: [
      {
        key: 'label',
        label: '标签',
        type: 'string',
        defaultValue: '输入框'
      },
      {
        key: 'placeholder',
        label: '占位符',
        type: 'string',
        defaultValue: '请输入内容'
      },
      {
        key: 'variant',
        label: '样式变体',
        type: 'select',
        defaultValue: 'outlined',
        options: [
          { label: '轮廓', value: 'outlined' },
          { label: '填充', value: 'filled' },
          { label: '标准', value: 'standard' }
        ]
      },
      {
        key: 'required',
        label: '必填',
        type: 'boolean',
        defaultValue: false
      },
      {
        key: 'disabled',
        label: '禁用',
        type: 'boolean',
        defaultValue: false
      },
      {
        key: 'fullWidth',
        label: '全宽度',
        type: 'boolean',
        defaultValue: true
      },
      {
        key: 'multiline',
        label: '多行',
        type: 'boolean',
        defaultValue: false
      },
      {
        key: 'rows',
        label: '行数',
        type: 'number',
        defaultValue: 1,
        min: 1,
        max: 10
      }
    ]
  },

  [ComponentType.TEXT]: {
    type: ComponentType.TEXT,
    label: '文本',
    icon: '📄',
    defaultProps: {
      text: '文本内容',
      variant: 'body1',
      color: 'textPrimary',
      align: 'left',
      gutterBottom: false
    },
    defaultStyles: {
      fontSize: '14px',
      fontWeight: 'normal',
      lineHeight: '1.5'
    },
    defaultSize: { width: 150, height: 24 },
    properties: [
      {
        key: 'text',
        label: '文本内容',
        type: 'string',
        defaultValue: '文本内容'
      },
      {
        key: 'variant',
        label: '文本样式',
        type: 'select',
        defaultValue: 'body1',
        options: [
          { label: 'H1', value: 'h1' },
          { label: 'H2', value: 'h2' },
          { label: 'H3', value: 'h3' },
          { label: 'H4', value: 'h4' },
          { label: 'H5', value: 'h5' },
          { label: 'H6', value: 'h6' },
          { label: '正文1', value: 'body1' },
          { label: '正文2', value: 'body2' },
          { label: '字幕1', value: 'subtitle1' },
          { label: '字幕2', value: 'subtitle2' },
          { label: '说明', value: 'caption' }
        ]
      },
      {
        key: 'color',
        label: '颜色',
        type: 'select',
        defaultValue: 'textPrimary',
        options: [
          { label: '主文本', value: 'textPrimary' },
          { label: '次文本', value: 'textSecondary' },
          { label: '主色', value: 'primary' },
          { label: '次色', value: 'secondary' },
          { label: '错误', value: 'error' }
        ]
      },
      {
        key: 'align',
        label: '对齐方式',
        type: 'select',
        defaultValue: 'left',
        options: [
          { label: '左对齐', value: 'left' },
          { label: '居中', value: 'center' },
          { label: '右对齐', value: 'right' },
          { label: '两端对齐', value: 'justify' }
        ]
      }
    ]
  },

  [ComponentType.CONTAINER]: {
    type: ComponentType.CONTAINER,
    label: '容器',
    icon: '📦',
    defaultProps: {
      elevation: 1,
      variant: 'elevation',
      title: '' // 添加标题属性
    },
    defaultStyles: {
      padding: '16px',
      borderRadius: '4px',
      backgroundColor: '#ffffff'
    },
    defaultSize: { width: 300, height: 200 },
    properties: [
      {
        key: 'title',
        label: '容器标题',
        type: 'string',
        defaultValue: ''
      },
      {
        key: 'elevation',
        label: '阴影层级',
        type: 'slider',
        defaultValue: 1,
        min: 0,
        max: 24
      },
      {
        key: 'variant',
        label: '样式变体',
        type: 'select',
        defaultValue: 'elevation',
        options: [
          { label: '阴影', value: 'elevation' },
          { label: '轮廓', value: 'outlined' }
        ]
      }
    ]
  },

  [ComponentType.FORM]: {
    type: ComponentType.FORM,
    label: '表单',
    icon: '📋',
    defaultProps: {
      title: '表单标题',
      layout: 'vertical'
    },
    defaultStyles: {
      padding: '24px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      backgroundColor: '#fafafa'
    },
    defaultSize: { width: 400, height: 300 },
    properties: [
      {
        key: 'title',
        label: '表单标题',
        type: 'string',
        defaultValue: '表单标题'
      },
      {
        key: 'layout',
        label: '布局方向',
        type: 'select',
        defaultValue: 'vertical',
        options: [
          { label: '垂直', value: 'vertical' },
          { label: '水平', value: 'horizontal' },
          { label: '内联', value: 'inline' }
        ]
      }
    ]
  },

  [ComponentType.IMAGE]: {
    type: ComponentType.IMAGE,
    label: '图片',
    icon: '🖼️',
    defaultProps: {
      src: 'https://via.placeholder.com/200x150?text=Image',
      alt: '图片',
      fit: 'cover'
    },
    defaultStyles: {
      borderRadius: '4px'
    },
    defaultSize: { width: 200, height: 150 },
    properties: [
      {
        key: 'src',
        label: '图片地址',
        type: 'string',
        defaultValue: 'https://via.placeholder.com/200x150?text=Image'
      },
      {
        key: 'alt',
        label: '替代文本',
        type: 'string',
        defaultValue: '图片'
      },
      {
        key: 'fit',
        label: '适应方式',
        type: 'select',
        defaultValue: 'cover',
        options: [
          { label: '覆盖', value: 'cover' },
          { label: '包含', value: 'contain' },
          { label: '填充', value: 'fill' },
          { label: '缩放', value: 'scale-down' },
          { label: '无', value: 'none' }
        ]
      }
    ]
  },

  [ComponentType.DIVIDER]: {
    type: ComponentType.DIVIDER,
    label: '分割线',
    icon: '➖',
    defaultProps: {
      orientation: 'horizontal',
      variant: 'fullWidth',
      flexItem: false
    },
    defaultStyles: {
      margin: '8px 0'
    },
    defaultSize: { width: 200, height: 1 },
    properties: [
      {
        key: 'orientation',
        label: '方向',
        type: 'select',
        defaultValue: 'horizontal',
        options: [
          { label: '水平', value: 'horizontal' },
          { label: '垂直', value: 'vertical' }
        ]
      },
      {
        key: 'variant',
        label: '样式',
        type: 'select',
        defaultValue: 'fullWidth',
        options: [
          { label: '全宽', value: 'fullWidth' },
          { label: '内嵌', value: 'inset' },
          { label: '中间', value: 'middle' }
        ]
      }
    ]
  }
};

// 获取组件配置
export function getComponentConfig(type: ComponentType): ComponentConfig {
  return COMPONENT_CONFIGS[type];
}

// 获取所有组件类型
export function getAllComponentTypes(): ComponentType[] {
  return Object.values(ComponentType);
}

// 获取组件的默认属性
export function getDefaultProps(type: ComponentType): Record<string, any> {
  return { ...COMPONENT_CONFIGS[type].defaultProps };
}

// 获取组件的默认样式
export function getDefaultStyles(type: ComponentType): Record<string, any> {
  return { ...COMPONENT_CONFIGS[type].defaultStyles };
}

// 获取组件的默认尺寸
export function getDefaultSize(type: ComponentType) {
  return { ...COMPONENT_CONFIGS[type].defaultSize };
}