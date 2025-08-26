// src/components/Inspector/Inspector.tsx
import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TextField
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import type { ComponentState } from '../../types/ui-state';
import { COMPONENT_CONFIGS } from '../../data/component-configs';
import { PropertyEditor } from './PropertyEditor';
import { StyleEditor } from './StyleEditor';
import { EventFactory } from '../../utils/event-factory';

interface InspectorProps {
  selectedComponent: ComponentState | null;
  onUpdateComponent: (event: any) => void;
  onDeleteComponent: (componentId: string) => void;
  onCopyComponent: (componentId: string) => void;
}

export function Inspector({
  selectedComponent,
  onUpdateComponent,
  onDeleteComponent,
  onCopyComponent
}: InspectorProps) {
  const [expandedPanel, setExpandedPanel] = React.useState<string>('properties');

  const handlePanelChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedPanel(isExpanded ? panel : '');
  };

  const handlePropertyChange = (propertyPath: string, newValue: any) => {
    if (!selectedComponent) return;

    const oldValue = selectedComponent.props[propertyPath];
    const event = EventFactory.createPropertyChanged(
      selectedComponent.id,
      `props.${propertyPath}`,
      oldValue,
      newValue
    );
    onUpdateComponent(event);
  };

  const handleStyleChange = (styleProperty: string, newValue: any) => {
    if (!selectedComponent) return;

    const oldValue = selectedComponent.styles[styleProperty];
    const event = EventFactory.createStyleUpdated(
      selectedComponent.id,
      styleProperty,
      oldValue,
      newValue
    );
    onUpdateComponent(event);
  };

  const handleToggleVisibility = () => {
    if (!selectedComponent) return;

    const event = EventFactory.createPropertyChanged(
      selectedComponent.id,
      'visible',
      selectedComponent.visible,
      !selectedComponent.visible
    );
    onUpdateComponent(event);
  };

  const handleToggleLock = () => {
    if (!selectedComponent) return;

    const event = EventFactory.createPropertyChanged(
      selectedComponent.id,
      'locked',
      selectedComponent.locked,
      !selectedComponent.locked
    );
    onUpdateComponent(event);
  };

  if (!selectedComponent) {
    return (
      <Box
        sx={{
          width: 320,
          height: '100%',
          borderLeft: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            属性检查器
          </Typography>
          <Typography variant="body2">
            选择一个组件来编辑其属性
          </Typography>
        </Box>
      </Box>
    );
  }

  const componentConfig = COMPONENT_CONFIGS[selectedComponent.type as keyof typeof COMPONENT_CONFIGS];

  return (
    <Box
      sx={{
        width: 320,
        height: '100%',
        borderLeft: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 组件信息头部 */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'background.default'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h6" sx={{ flex: 1 }}>
            {componentConfig?.label || selectedComponent.type}
          </Typography>
          <Chip
            label={selectedComponent.type}
            size="small"
            variant="outlined"
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
            ID: {selectedComponent.id.slice(0, 8)}...
          </Typography>
        </Box>

        {/* 操作按钮 */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={selectedComponent.visible ? '隐藏' : '显示'}>
            <IconButton size="small" onClick={handleToggleVisibility}>
              {selectedComponent.visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title={selectedComponent.locked ? '解锁' : '锁定'}>
            <IconButton size="small" onClick={handleToggleLock}>
              {selectedComponent.locked ? <LockIcon /> : <LockOpenIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="复制组件">
            <IconButton 
              size="small" 
              onClick={() => onCopyComponent(selectedComponent.id)}
            >
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="删除组件">
            <IconButton 
              size="small" 
              color="error"
              onClick={() => onDeleteComponent(selectedComponent.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* 属性编辑面板 */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* 基础属性 */}
        <Accordion
          expanded={expandedPanel === 'properties'}
          onChange={handlePanelChange('properties')}
          disableGutters
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">基础属性</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {componentConfig?.properties.map((property) => (
              <PropertyEditor
                key={property.key}
                property={property}
                value={selectedComponent.props[property.key]}
                onChange={handlePropertyChange}
              />
            ))}
          </AccordionDetails>
        </Accordion>

        {/* 样式属性 */}
        <Accordion
          expanded={expandedPanel === 'styles'}
          onChange={handlePanelChange('styles')}
          disableGutters
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">样式属性</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <StyleEditor
              styles={selectedComponent.styles}
              onChange={handleStyleChange}
            />
          </AccordionDetails>
        </Accordion>

        {/* 位置和尺寸 */}
        <Accordion
          expanded={expandedPanel === 'layout'}
          onChange={handlePanelChange('layout')}
          disableGutters
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">位置和尺寸</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                位置
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  size="small"
                  label="X"
                  type="number"
                  value={selectedComponent.position.x}
                  onChange={(e) => {
                    const event = EventFactory.createComponentUpdated(
                      selectedComponent.id,
                      {
                        position: {
                          ...selectedComponent.position,
                          x: Number(e.target.value)
                        }
                      }
                    );
                    onUpdateComponent(event);
                  }}
                />
                <TextField
                  size="small"
                  label="Y"
                  type="number"
                  value={selectedComponent.position.y}
                  onChange={(e) => {
                    const event = EventFactory.createComponentUpdated(
                      selectedComponent.id,
                      {
                        position: {
                          ...selectedComponent.position,
                          y: Number(e.target.value)
                        }
                      }
                    );
                    onUpdateComponent(event);
                  }}
                />
              </Box>

              <Typography variant="subtitle2" color="text.secondary">
                尺寸
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  size="small"
                  label="宽度"
                  type="number"
                  value={selectedComponent.size.width}
                  onChange={(e) => {
                    const event = EventFactory.createComponentUpdated(
                      selectedComponent.id,
                      {
                        size: {
                          ...selectedComponent.size,
                          width: Number(e.target.value)
                        }
                      }
                    );
                    onUpdateComponent(event);
                  }}
                />
                <TextField
                  size="small"
                  label="高度"
                  type="number"
                  value={selectedComponent.size.height}
                  onChange={(e) => {
                    const event = EventFactory.createComponentUpdated(
                      selectedComponent.id,
                      {
                        size: {
                          ...selectedComponent.size,
                          height: Number(e.target.value)
                        }
                      }
                    );
                    onUpdateComponent(event);
                  }}
                />
              </Box>

              <Typography variant="subtitle2" color="text.secondary">
                层级
              </Typography>
              <TextField
                size="small"
                label="Z-Index"
                type="number"
                value={selectedComponent.zIndex}
                onChange={(e) => {
                  const event = EventFactory.createPropertyChanged(
                    selectedComponent.id,
                    'zIndex',
                    selectedComponent.zIndex,
                    Number(e.target.value)
                  );
                  onUpdateComponent(event);
                }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
}