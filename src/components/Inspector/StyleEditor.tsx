// src/components/Inspector/StyleEditor.tsx
import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

interface StyleEditorProps {
  styles: Record<string, any>;
  onChange: (styleProperty: string, value: any) => void;
}

const COMMON_STYLE_PROPERTIES = {
  layout: [
    { key: 'width', label: '宽度', type: 'text' },
    { key: 'height', label: '高度', type: 'text' },
    { key: 'padding', label: '内边距', type: 'text' },
    { key: 'margin', label: '外边距', type: 'text' }
  ],
  typography: [
    { key: 'fontSize', label: '字体大小', type: 'text' },
    { key: 'fontWeight', label: '字体粗细', type: 'select', options: [
      { label: '正常', value: 'normal' },
      { label: '粗体', value: 'bold' },
      { label: '细体', value: 'lighter' },
      { label: '数值', value: '400' }
    ]},
    { key: 'lineHeight', label: '行高', type: 'text' },
    { key: 'textAlign', label: '文本对齐', type: 'select', options: [
      { label: '左对齐', value: 'left' },
      { label: '居中', value: 'center' },
      { label: '右对齐', value: 'right' },
      { label: '两端对齐', value: 'justify' }
    ]}
  ],
  appearance: [
    { key: 'backgroundColor', label: '背景色', type: 'color' },
    { key: 'color', label: '文字颜色', type: 'color' },
    { key: 'borderRadius', label: '圆角', type: 'text' },
    { key: 'border', label: '边框', type: 'text' },
    { key: 'boxShadow', label: '阴影', type: 'text' }
  ],
  position: [
    { key: 'position', label: '定位', type: 'select', options: [
      { label: '静态', value: 'static' },
      { label: '相对', value: 'relative' },
      { label: '绝对', value: 'absolute' },
      { label: '固定', value: 'fixed' },
      { label: '粘性', value: 'sticky' }
    ]},
    { key: 'zIndex', label: 'Z轴', type: 'number' },
    { key: 'opacity', label: '透明度', type: 'number' }
  ]
};

export function StyleEditor({ styles, onChange }: StyleEditorProps) {
  const handleStyleChange = (key: string, value: any) => {
    onChange(key, value);
  };

  const renderStyleProperty = (property: any) => {
    const value = styles[property.key] || '';

    switch (property.type) {
      case 'color':
        return (
          <TextField
            fullWidth
            size="small"
            type="color"
            label={property.label}
            value={value || '#000000'}
            onChange={(e) => handleStyleChange(property.key, e.target.value)}
            variant="outlined"
          />
        );

      case 'number':
        return (
          <TextField
            fullWidth
            size="small"
            type="number"
            label={property.label}
            value={value || ''}
            onChange={(e) => handleStyleChange(property.key, e.target.value)}
            variant="outlined"
          />
        );

      case 'select':
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{property.label}</InputLabel>
            <Select
              value={value || ''}
              label={property.label}
              onChange={(e) => handleStyleChange(property.key, e.target.value)}
            >
              {property.options?.map((option: any) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      default:
        return (
          <TextField
            fullWidth
            size="small"
            label={property.label}
            value={value || ''}
            onChange={(e) => handleStyleChange(property.key, e.target.value)}
            variant="outlined"
            placeholder="如: 16px, 1rem, auto"
          />
        );
    }
  };

  return (
    <Box>
      {Object.entries(COMMON_STYLE_PROPERTIES).map(([categoryName, properties]) => (
        <Box key={categoryName} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
            {categoryName === 'layout' && '布局'}
            {categoryName === 'typography' && '文字'}
            {categoryName === 'appearance' && '外观'}
            {categoryName === 'position' && '定位'}
          </Typography>
          
          <Grid container spacing={2}>
            {properties.map((property) => (
              <Grid item xs={12} sm={6} key={property.key}>
                {renderStyleProperty(property)}
              </Grid>
            ))}
          </Grid>
          
          {categoryName !== 'position' && <Divider sx={{ mt: 2 }} />}
        </Box>
      ))}

      {/* 自定义CSS */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
          自定义样式
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          size="small"
          label="CSS 样式 (JSON 格式)"
          value={JSON.stringify(styles, null, 2)}
          onChange={(e) => {
            try {
              const newStyles = JSON.parse(e.target.value);
              Object.entries(newStyles).forEach(([key, value]) => {
                onChange(key, value);
              });
            } catch (error) {
              // 忽略 JSON 解析错误
            }
          }}
          variant="outlined"
          placeholder='{"fontSize": "16px", "color": "#333"}'
        />
      </Box>
    </Box>
  );
}