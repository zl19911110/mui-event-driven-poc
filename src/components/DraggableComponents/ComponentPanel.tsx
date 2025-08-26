// src/components/DraggableComponents/ComponentPanel.tsx
import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ComponentType } from '../../types/components';
import { COMPONENT_CONFIGS } from '../../data/component-configs';
import { DraggableComponentItem } from './DraggableComponentItem';

// 组件分类
const COMPONENT_CATEGORIES = {
  基础组件: [ComponentType.BUTTON, ComponentType.INPUT, ComponentType.TEXT],
  布局组件: [ComponentType.CONTAINER, ComponentType.DIVIDER],
  表单组件: [ComponentType.FORM],
  媒体组件: [ComponentType.IMAGE]
};

export function ComponentPanel() {
  const [expandedCategory, setExpandedCategory] = React.useState<string>('基础组件');

  const handleCategoryChange = (category: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedCategory(isExpanded ? category : '');
  };

  return (
    <Box
      sx={{
        width: 280,
        height: '100%',
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 标题 */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="bold">
          组件库
        </Typography>
        <Typography variant="body2" color="text.secondary">
          拖拽组件到画布中
        </Typography>
      </Box>

      {/* 组件列表 */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {Object.entries(COMPONENT_CATEGORIES).map(([categoryName, componentTypes]) => (
          <Accordion
            key={categoryName}
            expanded={expandedCategory === categoryName}
            onChange={handleCategoryChange(categoryName)}
            disableGutters
            elevation={0}
            sx={{
              '&:before': {
                display: 'none'
              },
              '&.Mui-expanded': {
                margin: 0
              }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: 'action.hover',
                borderBottom: 1,
                borderColor: 'divider',
                minHeight: 48,
                '&.Mui-expanded': {
                  minHeight: 48
                },
                '& .MuiAccordionSummary-content': {
                  margin: '12px 0',
                  '&.Mui-expanded': {
                    margin: '12px 0'
                  }
                }
              }}
            >
              <Typography variant="subtitle2" fontWeight="medium">
                {categoryName}
              </Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {componentTypes.map((componentType) => {
                  const config = COMPONENT_CONFIGS[componentType];
                  return (
                    <Grid item xs={6} key={componentType}>
                      <DraggableComponentItem config={config} />
                    </Grid>
                  );
                })}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* 帮助信息 */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          💡 提示：将组件拖拽到右侧画布中即可添加组件
        </Typography>
      </Box>
    </Box>
  );
}