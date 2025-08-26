// src/components/Preview/PreviewCanvas.tsx
import React from 'react';
import { Box, Typography, AppBar, Toolbar, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { ComponentState, UIState } from '../../types/ui-state';
import { RenderComponent } from './RenderComponent';

interface PreviewCanvasProps {
  uiState: UIState;
  onClose: () => void;
}

export function PreviewCanvas({ uiState, onClose }: PreviewCanvasProps) {
  // 渲染组件树（预览模式）
  const renderComponent = (component: ComponentState): React.ReactNode => {
    return (
      <RenderComponent
        key={component.id}
        component={component}
        isPreviewMode={true}
      >
        {/* 渲染子组件 */}
        {component.children.map(childId => {
          const childComponent = uiState.components[childId]; // 修改这里
          return childComponent ? renderComponent(childComponent) : null;
        })}
      </RenderComponent>
    );
  };

  // 获取顶级组件
  const topLevelComponents = Object.values(uiState.components).filter( // 修改这里
    component => !component.parentId
  );

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 预览工具栏 */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            预览模式 - {uiState.metadata.title}
          </Typography>
          <IconButton onClick={onClose} color="inherit">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* 预览内容 */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          backgroundColor: 'white',
          overflow: 'auto'
        }}
      >
        {/* 空状态 */}
        {topLevelComponents.length === 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: 'text.secondary'
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              没有内容可预览
            </Typography>
            <Typography variant="body2">
              请先在编辑器中添加组件
            </Typography>
          </Box>
        )}

        {/* 渲染所有组件 */}
        {topLevelComponents.map(component => renderComponent(component))}
      </Box>
    </Box>
  );
}