// src/components/Preview/RenderComponent.tsx
import React from 'react';
import {
  Button,
  TextField,
  Typography,
  Paper,
  Box,
  Divider
} from '@mui/material';
import type { ComponentState } from '../../types/ui-state';
import { ComponentType } from '../../types/components';

interface RenderComponentProps {
  component: ComponentState;
  isSelected?: boolean;
  isPreviewMode?: boolean;
  onSelect?: (componentId: string) => void;
  onDoubleClick?: (componentId: string) => void;
  children?: React.ReactNode;
}

export function RenderComponent({
  component,
  isSelected = false,
  isPreviewMode = false,
  onSelect,
  onDoubleClick,
  children
}: RenderComponentProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (!isPreviewMode) {
      e.stopPropagation();
      onSelect?.(component.id);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!isPreviewMode) {
      e.stopPropagation();
      onDoubleClick?.(component.id);
    }
  };

  const renderComponentByType = () => {
    const { type, props, styles } = component;

    switch (type) {
      case ComponentType.BUTTON:
        return (
          <Button
            variant={props.variant || 'contained'}
            color={props.color || 'primary'}
            disabled={props.disabled || false}
            fullWidth={props.fullWidth || false}
            sx={{ ...styles }}
          >
            {props.text || '按钮'}
          </Button>
        );

      case ComponentType.INPUT:
        return (
          <TextField
            label={props.label || '输入框'}
            placeholder={props.placeholder || '请输入内容'}
            value={props.value || ''}
            variant={props.variant || 'outlined'}
            required={props.required || false}
            disabled={props.disabled || false}
            fullWidth={props.fullWidth || true}
            multiline={props.multiline || false}
            rows={props.multiline ? (props.rows || 1) : undefined}
            sx={{ ...styles }}
            onChange={() => {}} // 在编辑器中不处理实际输入
          />
        );

      case ComponentType.TEXT:
        return (
          <Typography
            variant={props.variant || 'body1'}
            color={props.color || 'textPrimary'}
            align={props.align || 'left'}
            gutterBottom={props.gutterBottom || false}
            sx={{ ...styles }}
          >
            {props.text || '文本内容'}
          </Typography>
        );
      
      case ComponentType.CONTAINER:
        return (
          <Paper
            elevation={props.elevation || 1}
            variant={props.variant || 'elevation'}
            sx={{
              minHeight: 100,
              position: 'relative',
              display: 'block', // 改为 block
              width: '100%',
              height: '100%',
              ...styles
            }}
          >
            {/* 容器标题（可选） */}
            {props.title && (
              <Box sx={{ 
                p: 1, 
                borderBottom: 1, 
                borderColor: 'divider',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1,
                backgroundColor: 'background.paper'
              }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {props.title}
                </Typography>
              </Box>
            )}
            
            {/* 子组件容器 - 这里是关键！*/}
            <Box 
              sx={{ 
                position: 'relative',
                width: '100%',
                height: '100%',
                paddingTop: props.title ? '40px' : '0px',
                minHeight: 60
              }}
              data-container-content // 添加标识
            >
              {children}
              
              {/* 空状态提示 */}
              {(!children || (React.Children.count(children) === 0)) && !isPreviewMode && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    zIndex: 0
                  }}
                >
                  <Typography variant="caption">
                    🔽 拖拽组件到此容器
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        );

      case ComponentType.FORM:
        return (
          <Box
            component="form"
            sx={{
              display: 'flex',
              flexDirection: props.layout === 'horizontal' ? 'row' : 'column',
              gap: 2,
              minHeight: 150,
              position: 'relative',
              overflow: 'hidden',
              ...styles
            }}
          >
            {props.title && (
              <Typography variant="h6" sx={{ mb: 2, flexShrink: 0 }}>
                {props.title}
              </Typography>
            )}
            
            {/* 表单内容区域 */}
            <Box sx={{ position: 'relative', flex: 1, minHeight: 100 }}>
              {children}
              {/* 空状态提示 */}
              {!children && !isPreviewMode && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    pointerEvents: 'none'
                  }}
                >
                  <Typography variant="caption">
                    添加表单字段到此处
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        );

      case ComponentType.IMAGE:
        return (
          <Box
            component="img"
            src={props.src || 'https://via.placeholder.com/200x150?text=Image'}
            alt={props.alt || '图片'}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: props.fit || 'cover',
              display: 'block',
              ...styles
            }}
          />
        );

      case ComponentType.DIVIDER:
        return (
          <Divider
            orientation={props.orientation || 'horizontal'}
            variant={props.variant || 'fullWidth'}
            flexItem={props.flexItem || false}
            sx={{ ...styles }}
          />
        );

      default:
        return (
          <Box
            sx={{
              p: 2,
              border: '2px dashed #ccc',
              borderRadius: 1,
              textAlign: 'center',
              color: 'text.secondary',
              ...styles
            }}
          >
            <Typography variant="body2">
              未知组件类型: {type}
            </Typography>
          </Box>
        );
    }
  };

  const containerStyles = {
    position: 'absolute' as const,
    left: component.position.x,
    top: component.position.y,
    width: component.size.width,
    height: component.size.height,
    zIndex: component.zIndex,
    visibility: component.visible ? 'visible' as const : 'hidden' as const,
    cursor: isPreviewMode ? 'default' : 'pointer',
    border: isSelected && !isPreviewMode ? '2px solid #1976d2' : 'none',
    borderRadius: isSelected && !isPreviewMode ? 1 : 0,
    outline: 'none',
    ...(isSelected && !isPreviewMode && {
      '&::after': {
        content: '""',
        position: 'absolute',
        top: -8,
        right: -8,
        width: 16,
        height: 16,
        backgroundColor: '#1976d2',
        borderRadius: '50%',
        border: '2px solid white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }
    })
  };

  return (
    <Box
      sx={containerStyles}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      data-component-id={component.id}
      data-component-type={component.type}
    >
      {renderComponentByType()}
    </Box>
  );
}