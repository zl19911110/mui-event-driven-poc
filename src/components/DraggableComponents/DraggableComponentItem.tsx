// src/components/DraggableComponents/DraggableComponentItem.tsx
import React from 'react';
import { useDrag } from 'react-dnd';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip
} from '@mui/material';
import type { ComponentConfig } from '../../types/components';
import { DragItemTypes, type DragItem } from '../../contexts/DragContext';

interface DraggableComponentItemProps {
  config: ComponentConfig;
}

export function DraggableComponentItem({ config }: DraggableComponentItemProps) {
  const [{ isDragging }, drag] = useDrag<DragItem, any, { isDragging: boolean }>({
    type: DragItemTypes.COMPONENT,
    item: {
      type: DragItemTypes.COMPONENT,
      componentType: config.type,
      data: {
        config,
        defaultProps: config.defaultProps,
        defaultStyles: config.defaultStyles,
        defaultSize: config.defaultSize
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  return (
    <Card
      ref={drag}
      sx={{
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 2
        },
        '&:active': {
          cursor: 'grabbing'
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
          }}
        >
          {/* 组件图标 */}
          <Typography
            variant="h4"
            sx={{
              fontSize: '2rem',
              lineHeight: 1,
              userSelect: 'none'
            }}
          >
            {config.icon}
          </Typography>

          {/* 组件名称 */}
          <Typography
            variant="body2"
            align="center"
            sx={{
              fontWeight: 500,
              userSelect: 'none',
              minHeight: '1.2em'
            }}
          >
            {config.label}
          </Typography>

          {/* 组件类型标签 */}
          <Chip
            label={config.type}
            size="small"
            variant="outlined"
            sx={{
              fontSize: '0.7rem',
              height: 'auto',
              '& .MuiChip-label': {
                px: 1,
                py: 0.25
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}