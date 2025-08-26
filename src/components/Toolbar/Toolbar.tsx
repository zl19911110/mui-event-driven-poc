// src/components/Toolbar/Toolbar.tsx
import React from 'react';
import {
  AppBar,
  Toolbar as MuiToolbar,
  Typography,
  Button,
  IconButton,
  Divider,
  Box,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Undo as UndoIcon,
  Redo as RedoIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  CameraAlt as SnapshotIcon,
  GridOn as GridIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import type { HistoryState } from '../../store/history/HistoryManager';

interface ToolbarProps {
  title: string;
  historyState: HistoryState;
  showGrid: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onPreview: () => void;
  onSave: () => void;
  onExport: () => void;
  onImport: () => void;
  onCreateSnapshot: () => void;
  onShowHistory: () => void;
  onToggleGrid: (show: boolean) => void;
  onSettings: () => void;
}

export function Toolbar({
  title,
  historyState,
  showGrid,
  onUndo,
  onRedo,
  onPreview,
  onSave,
  onExport,
  onImport,
  onCreateSnapshot,
  onShowHistory,
  onToggleGrid,
  onSettings
}: ToolbarProps) {
  const [settingsAnchor, setSettingsAnchor] = React.useState<null | HTMLElement>(null);
  const [fileAnchor, setFileAnchor] = React.useState<null | HTMLElement>(null);

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchor(event.currentTarget);
  };

  const handleFileClick = (event: React.MouseEvent<HTMLElement>) => {
    setFileAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setSettingsAnchor(null);
    setFileAnchor(null);
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            onImport();
            // 这里应该传递数据给导入函数
            console.log('Import data:', data);
          } catch (error) {
            console.error('Failed to parse import file:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
    handleClose();
  };

  return (
    <AppBar 
      position="static" 
      color="default" 
      elevation={1}
      sx={{ 
        backgroundColor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider'
      }}
    >
      <MuiToolbar variant="dense" sx={{ minHeight: 56 }}>
        {/* 标题区域 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 3 }}>
          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Chip
            label={`v${historyState.currentVersion}`}
            size="small"
            variant="outlined"
            color="primary"
          />
        </Box>

        {/* 历史操作 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
          <Tooltip title={`撤销: ${historyState.undoDescription || '无可撤销操作'}`}>
            <span>
              <IconButton
                size="small"
                onClick={onUndo}
                disabled={!historyState.canUndo}
                color="primary"
              >
                <UndoIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={`重做: ${historyState.redoDescription || '无可重做操作'}`}>
            <span>
              <IconButton
                size="small"
                onClick={onRedo}
                disabled={!historyState.canRedo}
                color="primary"
              >
                <RedoIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          <Tooltip title="查看历史">
            <IconButton size="small" onClick={onShowHistory} color="primary">
              <HistoryIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="创建快照">
            <IconButton size="small" onClick={onCreateSnapshot} color="primary">
              <SnapshotIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* 中间的弹性空间 */}
        <Box sx={{ flex: 1 }} />

        {/* 视图控制 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showGrid}
                onChange={(e) => onToggleGrid(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <GridIcon fontSize="small" />
                <Typography variant="body2">网格</Typography>
              </Box>
            }
          />

          <Divider orientation="vertical" flexItem />

          <Button
            variant="outlined"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={onPreview}
            sx={{ minWidth: 'auto' }}
          >
            预览
          </Button>
        </Box>

        {/* 文件操作 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<SaveIcon />}
            onClick={onSave}
            color="primary"
          >
            保存
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={handleFileClick}
            sx={{ minWidth: 'auto' }}
          >
            文件
          </Button>

          <IconButton size="small" onClick={handleSettingsClick}>
            <SettingsIcon />
          </IconButton>
        </Box>

        {/* 文件菜单 */}
        <Menu
          anchorEl={fileAnchor}
          open={Boolean(fileAnchor)}
          onClose={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => { onExport(); handleClose(); }}>
            <ExportIcon sx={{ mr: 1 }} fontSize="small" />
            导出项目
          </MenuItem>
          <MenuItem onClick={handleImportClick}>
            <ImportIcon sx={{ mr: 1 }} fontSize="small" />
            导入项目
          </MenuItem>
        </Menu>

        {/* 设置菜单 */}
        <Menu
          anchorEl={settingsAnchor}
          open={Boolean(settingsAnchor)}
          onClose={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => { onSettings(); handleClose(); }}>
            <SettingsIcon sx={{ mr: 1 }} fontSize="small" />
            编辑器设置
          </MenuItem>
          <MenuItem>
            <Typography variant="body2" color="text.secondary">
              快捷键帮助
            </Typography>
          </MenuItem>
        </Menu>
      </MuiToolbar>

      {/* 状态栏 */}
      <Box
        sx={{
          px: 2,
          py: 0.5,
          backgroundColor: 'action.hover',
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="caption" color="text.secondary">
          事件总数: {historyState.totalEvents} | 当前版本: {historyState.currentVersion}
        </Typography>
        
        <Typography variant="caption" color="text.secondary">
          基于事件流的低代码平台 POC
        </Typography>
      </Box>
    </AppBar>
  );
}