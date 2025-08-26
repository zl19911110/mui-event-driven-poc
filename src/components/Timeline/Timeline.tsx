// src/components/Timeline/Timeline.tsx
import React from 'react';
import {
  Box,
  Typography,
  Drawer,
  IconButton,
  Divider,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Timeline as TimelineIcon,
  CameraAlt as SnapshotIcon
} from '@mui/icons-material';
import { type UIEvent, UIEventType } from '../../types/events';
import type { UISnapshot } from '../../types/ui-state';
import type { HistoryState } from '../../store/history/HistoryManager';
import { TimelineEventItem } from './TimelineEventItem';

interface TimelineProps {
  open: boolean;
  events: UIEvent[];
  snapshots: UISnapshot[];
  historyState: HistoryState;
  onClose: () => void;
  onJumpToEvent: (eventIndex: number) => void;
  onJumpToSnapshot: (snapshotId: string) => void;
  onCreateSnapshot: () => void;
}

export function Timeline({
  open,
  events,
  snapshots,
  historyState,
  onClose,
  onJumpToEvent,
  onJumpToSnapshot,
  onCreateSnapshot
}: TimelineProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterType, setFilterType] = React.useState<string>('all');
  const [showSnapshots, setShowSnapshots] = React.useState(true);

  // 过滤事件
  const filteredEvents = React.useMemo(() => {
    return events.filter(event => {
      // 类型过滤
      if (filterType !== 'all' && event.type !== filterType) {
        return false;
      }

      // 搜索过滤
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const description = getEventDescription(event).toLowerCase();
        const componentType = event.payload?.componentType?.toLowerCase() || '';
        const userId = event.userId.toLowerCase();
        
        return description.includes(searchLower) || 
               componentType.includes(searchLower) || 
               userId.includes(searchLower);
      }

      return true;
    });
  }, [events, filterType, searchTerm]);

  const getEventDescription = (event: UIEvent) => {
    switch (event.type) {
      case UIEventType.COMPONENT_CREATED:
        return `创建了 ${event.payload.componentType} 组件`;
      case UIEventType.COMPONENT_UPDATED:
        return `更新了组件`;
      case UIEventType.COMPONENT_DELETED:
        return `删除了组件`;
      case UIEventType.COMPONENT_MOVED:
        return `移动了组件`;
      case UIEventType.PROPERTY_CHANGED:
        return `修改了属性: ${event.payload.propertyPath}`;
      case UIEventType.STYLE_UPDATED:
        return `更新了样式: ${event.payload.styleProperty}`;
      default:
        return event.metadata?.description || '未知操作';
    }
  };

  const handleJumpToEvent = (eventIndex: number) => {
    onJumpToEvent(eventIndex);
  };

  const getCurrentEventIndex = () => {
    return historyState.currentVersion - 1;
  };

  const eventTypeOptions = [
    { value: 'all', label: '全部事件' },
    { value: UIEventType.COMPONENT_CREATED, label: '组件创建' },
    { value: UIEventType.COMPONENT_UPDATED, label: '组件更新' },
    { value: UIEventType.COMPONENT_DELETED, label: '组件删除' },
    { value: UIEventType.COMPONENT_MOVED, label: '组件移动' },
    { value: UIEventType.PROPERTY_CHANGED, label: '属性修改' },
    { value: UIEventType.STYLE_UPDATED, label: '样式更新' }
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          boxSizing: 'border-box'
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 头部 */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <TimelineIcon color="primary" />
            <Typography variant="h6" sx={{ flex: 1 }}>
              操作历史
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip
              label={`${historyState.currentVersion}/${historyState.totalEvents}`}
              color="primary"
              variant="outlined"
              size="small"
            />
            <Chip
              label={`${snapshots.length} 快照`}
              color="secondary"
              variant="outlined"
              size="small"
            />
          </Box>

          {/* 搜索和过滤 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              size="small"
              placeholder="搜索操作..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>事件类型</InputLabel>
                <Select
                  value={filterType}
                  label="事件类型"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  {eventTypeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                size="small"
                startIcon={<SnapshotIcon />}
                onClick={onCreateSnapshot}
              >
                快照
              </Button>
            </Box>
          </Box>
        </Box>

        {/* 内容区域 */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {/* 快照列表 */}
          {showSnapshots && snapshots.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                快照 ({snapshots.length})
              </Typography>
              {snapshots.map(snapshot => (
                <Box
                  key={snapshot.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    cursor: 'pointer',
                    backgroundColor: 'action.hover',
                    '&:hover': {
                      backgroundColor: 'action.selected'
                    }
                  }}
                  onClick={() => onJumpToSnapshot(snapshot.id)}
                >
                  <Typography variant="body2" fontWeight="medium">
                    {snapshot.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    版本 {snapshot.version} • {snapshot.timestamp.toLocaleString('zh-CN')}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
            </Box>
          )}

          {/* 事件列表 */}
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
            事件历史 ({filteredEvents.length}/{events.length})
          </Typography>

          {filteredEvents.length === 0 ? (
            <Alert severity="info">
              {searchTerm || filterType !== 'all' ? '没有找到匹配的事件' : '暂无操作历史'}
            </Alert>
          ) : (
            <Box>
              {filteredEvents.map((event, index) => {
                const originalIndex = events.indexOf(event);
                const isActive = originalIndex === getCurrentEventIndex();
                
                return (
                  <TimelineEventItem
                    key={event.id}
                    event={event}
                    isActive={isActive}
                    onClick={() => {}} // 点击高亮
                    onJumpTo={() => handleJumpToEvent(originalIndex)}
                  />
                );
              })}
            </Box>
          )}
        </Box>

        {/* 底部操作 */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            💡 点击事件项右侧的播放按钮可跳转到对应状态
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="text"
              size="small"
              onClick={() => setShowSnapshots(!showSnapshots)}
            >
              {showSnapshots ? '隐藏' : '显示'}快照
            </Button>
            
            <Button
              variant="text"
              size="small"
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
            >
              清除过滤
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}