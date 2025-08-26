// src/components/Timeline/TimelineEventItem.tsx
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SwapHoriz as MoveIcon,
  Palette as StyleIcon,
  Settings as PropertyIcon
} from '@mui/icons-material';
import { type UIEvent, UIEventType } from '../../types/events';

interface TimelineEventItemProps {
  event: UIEvent;
  isActive: boolean;
  onClick: () => void;
  onJumpTo: () => void;
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  [UIEventType.COMPONENT_CREATED]: <AddIcon />,
  [UIEventType.COMPONENT_UPDATED]: <EditIcon />,
  [UIEventType.COMPONENT_DELETED]: <DeleteIcon />,
  [UIEventType.COMPONENT_MOVED]: <MoveIcon />,
  [UIEventType.PROPERTY_CHANGED]: <PropertyIcon />,
  [UIEventType.STYLE_UPDATED]: <StyleIcon />
};

const EVENT_COLORS: Record<string, string> = {
  [UIEventType.COMPONENT_CREATED]: '#4caf50',
  [UIEventType.COMPONENT_UPDATED]: '#2196f3',
  [UIEventType.COMPONENT_DELETED]: '#f44336',
  [UIEventType.COMPONENT_MOVED]: '#ff9800',
  [UIEventType.PROPERTY_CHANGED]: '#9c27b0',
  [UIEventType.STYLE_UPDATED]: '#e91e63'
};

export function TimelineEventItem({
  event,
  isActive,
  onClick,
  onJumpTo
}: TimelineEventItemProps) {
  const getEventDescription = () => {
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

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const eventColor = EVENT_COLORS[event.type] || '#757575';
  const eventIcon = EVENT_ICONS[event.type] || <EditIcon />;

  return (
    <Card
      sx={{
        mb: 1,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: isActive ? `2px solid ${eventColor}` : '1px solid transparent',
        backgroundColor: isActive ? `${eventColor}08` : 'background.paper',
        '&:hover': {
          backgroundColor: `${eventColor}04`,
          transform: 'translateX(4px)'
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {/* 事件图标 */}
          <Avatar
            sx={{
              width: 32,
              height: 32,
              backgroundColor: eventColor,
              fontSize: '0.875rem'
            }}
          >
            {eventIcon}
          </Avatar>

          {/* 事件内容 */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? eventColor : 'text.primary'
                }}
              >
                {getEventDescription()}
              </Typography>
              <Chip
                label={`v${event.metadata?.version || 0}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            </Box>

            <Typography variant="caption" color="text.secondary">
              {formatTime(event.timestamp)} • {event.userId}
            </Typography>

            {/* 事件详细信息 */}
            {event.type === UIEventType.PROPERTY_CHANGED && (
              <Box sx={{ mt: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                <Typography variant="caption">
                  {JSON.stringify(event.payload.oldValue)} → {JSON.stringify(event.payload.newValue)}
                </Typography>
              </Box>
            )}

            {event.type === UIEventType.COMPONENT_MOVED && (
              <Box sx={{ mt: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                <Typography variant="caption">
                  ({event.payload.oldPosition.x}, {event.payload.oldPosition.y}) → 
                  ({event.payload.newPosition.x}, {event.payload.newPosition.y})
                </Typography>
              </Box>
            )}
          </Box>

          {/* 跳转按钮 */}
          <Tooltip title="跳转到此状态">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onJumpTo();
              }}
              sx={{ color: eventColor }}
            >
              <PlayIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}