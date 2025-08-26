// src/components/Editor/Editor.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Box, Alert, Snackbar } from '@mui/material';
import { eventStore } from '../../store/UIEventStore';
import type { UIState, ComponentState } from '../../types/ui-state';
import type { UIEvent } from '../../types/events';
import type { HistoryState } from '../../store/history/HistoryManager';
import { EventFactory } from '../../utils/event-factory';
import { ComponentPanel } from '../DraggableComponents/ComponentPanel';
import { Canvas } from '../Preview/Canvas';
import { PreviewCanvas } from '../Preview/PreviewCanvas';
import { Inspector } from '../Inspector/Inspector';
import { Toolbar } from '../Toolbar/Toolbar';
import { Timeline } from '../Timeline/Timeline';
import { v4 as uuidv4 } from 'uuid';

export function Editor() {
  // 状态管理
  const [uiState, setUiState] = useState<UIState>(eventStore.getCurrentState());
  const [historyState, setHistoryState] = useState<HistoryState>(eventStore.getHistoryState());
  const [selectedComponentId, setSelectedComponentId] = useState<string>('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // 订阅事件存储的状态变化
  useEffect(() => {
    const unsubscribeState = eventStore.subscribe((newState) => {
      setUiState(newState);
    });

    const unsubscribeHistory = eventStore.subscribeHistory((newHistoryState) => {
      setHistoryState(newHistoryState);
    });

    return () => {
      unsubscribeState();
      unsubscribeHistory();
    };
  }, []);

  // 显示通知
  const showNotification = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({ open: true, message, severity });
  }, []);

  // 处理添加组件
  const handleAddComponent = useCallback((event: UIEvent) => {
    eventStore.addEvent(event);
    showNotification('组件已添加', 'success');
  }, [showNotification]);

  // 处理更新组件
  const handleUpdateComponent = useCallback((event: UIEvent) => {
    eventStore.addEvent(event);
  }, []);

  // 处理选择组件
  const handleSelectComponent = useCallback((componentId: string) => {
    setSelectedComponentId(componentId);
  }, []);

  // 处理双击组件（进入编辑模式）
  const handleDoubleClickComponent = useCallback((componentId: string) => {
    setSelectedComponentId(componentId);
    // 可以在这里添加进入编辑模式的逻辑
    showNotification('双击组件进入编辑模式', 'info');
  }, [showNotification]);

  // 处理删除组件
  const handleDeleteComponent = useCallback((componentId: string) => {
    const component = uiState.components[componentId]; // 修改这里
    if (component) {
      const event = EventFactory.createComponentDeleted(componentId, component.parentId);
      eventStore.addEvent(event);
      setSelectedComponentId('');
      showNotification('组件已删除', 'success');
    }
  }, [uiState.components, showNotification]);

  // 处理复制组件
  const handleCopyComponent = useCallback((componentId: string) => {
    const component = uiState.components[componentId]; // 修改这里
    if (component) {
      // 创建组件副本
      const newComponentId = uuidv4();
      const newPosition = {
        x: component.position.x + 20,
        y: component.position.y + 20
      };

      const event = EventFactory.createComponentCreated(
        newComponentId,
        component.type,
        newPosition,
        component.size,
        { ...component.props },
        { ...component.styles },
        component.parentId
      );

      eventStore.addEvent(event);
      setSelectedComponentId(newComponentId);
      showNotification('组件已复制', 'success');
    }
  }, [uiState.components, showNotification]);

  // 撤销操作
  const handleUndo = useCallback(() => {
    const result = eventStore.undo();
    if (result) {
      showNotification('已撤销', 'info');
      // 如果当前选中的组件被撤销删除了，清除选择
      if (selectedComponentId && !result.components[selectedComponentId]) { // 修改这里
        setSelectedComponentId('');
      }
    }
  }, [selectedComponentId, showNotification]);

  // 重做操作
  const handleRedo = useCallback(() => {
    const result = eventStore.redo();
    if (result) {
      showNotification('已重做', 'info');
    }
  }, [showNotification]);

  // 预览模式
  const handlePreview = useCallback(() => {
    setIsPreviewMode(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setIsPreviewMode(false);
  }, []);

  // 保存项目
  const handleSave = useCallback(() => {
    try {
      const data = eventStore.exportData();
      localStorage.setItem('ui-editor-project', JSON.stringify(data));
      showNotification('项目已保存', 'success');
    } catch (error) {
      console.error('Save failed:', error);
      showNotification('保存失败', 'error');
    }
  }, [showNotification]);

  // 导出项目
  const handleExport = useCallback(() => {
    try {
      const data = eventStore.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ui-project-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification('项目已导出', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showNotification('导出失败', 'error');
    }
  }, [showNotification]);

  // 导入项目
  const handleImport = useCallback(() => {
    // 这个函数会在工具栏中处理文件选择
    showNotification('请选择要导入的项目文件', 'info');
  }, [showNotification]);

  // 创建快照
  const handleCreateSnapshot = useCallback(() => {
    const snapshot = eventStore.createSnapshot(`手动快照 - ${new Date().toLocaleString('zh-CN')}`);
    if (snapshot) {
      showNotification('快照已创建', 'success');
    }
  }, [showNotification]);

  // 显示历史时间线
  const handleShowHistory = useCallback(() => {
    setShowTimeline(true);
  }, []);

  // 跳转到事件
  const handleJumpToEvent = useCallback((eventIndex: number) => {
    const events = eventStore.getAllEvents();
    if (events[eventIndex]) {
      const targetVersion = events[eventIndex].metadata?.version || eventIndex + 1;
      eventStore.jumpToVersion(targetVersion);
      showNotification(`已跳转到版本 ${targetVersion}`, 'info');
    }
  }, [showNotification]);

  // 跳转到快照
  const handleJumpToSnapshot = useCallback((snapshotId: string) => {
    const result = eventStore.restoreFromSnapshot(snapshotId);
    if (result) {
      showNotification('已恢复到快照状态', 'info');
      setSelectedComponentId(''); // 清除选择
    }
  }, [showNotification]);

  // 切换网格显示
  const handleToggleGrid = useCallback((show: boolean) => {
    setShowGrid(show);
  }, []);

  // 设置
  const handleSettings = useCallback(() => {
    showNotification('设置功能待实现', 'info');
  }, [showNotification]);

  // 获取当前选中的组件
  const selectedComponent = selectedComponentId ? uiState.components[selectedComponentId] : null;

  // 在组件中添加一个测试函数
  const handleTestNesting = useCallback(() => {
    // 先创建一个容器
    const containerId = uuidv4();
    const containerEvent = EventFactory.createComponentCreated(
      containerId,
      'Container',
      { x: 100, y: 100 },
      { width: 300, height: 200 },
      { title: '测试容器' },
      { backgroundColor: '#f0f0f0', padding: '16px' }
    );
    
    eventStore.addEvent(containerEvent);
    
    // 等待一下，然后在容器中创建一个按钮
    setTimeout(() => {
      const buttonId = uuidv4();
      const buttonEvent = EventFactory.createComponentCreated(
        buttonId,
        'Button',
        { x: 150, y: 150 }, // 相对于容器的位置
        { width: 100, height: 36 },
        { text: '嵌套按钮' },
        {},
        containerId // 设置父组件ID
      );
      
      eventStore.addEvent(buttonEvent);
      showNotification('测试嵌套组件已创建', 'success');
    }, 100);
  }, [showNotification]);

  // 在工具栏中添加测试按钮（临时）
  // 或者通过控制台调用: window.testNesting = handleTestNesting;
  useEffect(() => {
    (window as any).testNesting = handleTestNesting;
  }, [handleTestNesting]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              handleRedo();
            } else {
              e.preventDefault();
              handleUndo();
            }
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'p':
            e.preventDefault();
            handlePreview();
            break;
          case 'h':
            e.preventDefault();
            setShowTimeline(!showTimeline);
            break;
        }
      }
      
      // 删除选中组件
      if (e.key === 'Delete' && selectedComponentId) {
        handleDeleteComponent(selectedComponentId);
      }

      // ESC 取消选择
      if (e.key === 'Escape') {
        setSelectedComponentId('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleSave, handlePreview, handleDeleteComponent, selectedComponentId, showTimeline]);

  // 自动保存
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      handleSave();
    }, 30000); // 每30秒自动保存

    return () => clearInterval(autoSaveInterval);
  }, [handleSave]);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 工具栏 */}
      <Toolbar
        title={uiState.metadata.title}
        historyState={historyState}
        showGrid={showGrid}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onPreview={handlePreview}
        onSave={handleSave}
        onExport={handleExport}
        onImport={handleImport}
        onCreateSnapshot={handleCreateSnapshot}
        onShowHistory={handleShowHistory}
        onToggleGrid={handleToggleGrid}
        onSettings={handleSettings}
      />

      {/* 主要内容区域 */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 组件面板 */}
        <ComponentPanel />

        {/* 画布区域 */}
        <Canvas
          uiState={uiState}
          selectedComponentId={selectedComponentId}
          onAddComponent={handleAddComponent}
          onUpdateComponent={handleUpdateComponent}
          onSelectComponent={handleSelectComponent}
          onDoubleClickComponent={handleDoubleClickComponent}
        />

        {/* 属性检查器 */}
        <Inspector
          selectedComponent={selectedComponent}
          onUpdateComponent={handleUpdateComponent}
          onDeleteComponent={handleDeleteComponent}
          onCopyComponent={handleCopyComponent}
        />
      </Box>

      {/* 预览模式 */}
      {isPreviewMode && (
        <PreviewCanvas
          uiState={uiState}
          onClose={handleClosePreview}
        />
      )}

      {/* 时间线面板 */}
      <Timeline
        open={showTimeline}
        events={eventStore.getAllEvents()}
        snapshots={eventStore.getAllSnapshots()}
        historyState={historyState}
        onClose={() => setShowTimeline(false)}
        onJumpToEvent={handleJumpToEvent}
        onJumpToSnapshot={handleJumpToSnapshot}
        onCreateSnapshot={handleCreateSnapshot}
      />

      {/* 通知消息 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}