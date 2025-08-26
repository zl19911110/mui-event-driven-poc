// src/components/Inspector/PropertyEditor.tsx
import React from 'react';
import {
  Box,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { ComponentProperty } from '../../types/components';

interface PropertyEditorProps {
  property: ComponentProperty;
  value: any;
  onChange: (key: string, value: any) => void;
}

export function PropertyEditor({ property, value, onChange }: PropertyEditorProps) {
  const handleChange = (newValue: any) => {
    onChange(property.key, newValue);
  };

  const renderEditor = () => {
    switch (property.type) {
      case 'string':
        return (
          <TextField
            fullWidth
            size="small"
            label={property.label}
            value={value || property.defaultValue || ''}
            onChange={(e) => handleChange(e.target.value)}
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
            value={value ?? property.defaultValue ?? 0}
            onChange={(e) => handleChange(Number(e.target.value))}
            variant="outlined"
            inputProps={{
              min: property.min,
              max: property.max,
              step: property.step || 1
            }}
          />
        );

      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={value ?? property.defaultValue ?? false}
                onChange={(e) => handleChange(e.target.checked)}
                size="small"
              />
            }
            label={property.label}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{property.label}</InputLabel>
            <Select
              value={value ?? property.defaultValue ?? ''}
              label={property.label}
              onChange={(e) => handleChange(e.target.value)}
            >
              {property.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'color':
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {property.label}
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="color"
              value={value || property.defaultValue || '#000000'}
              onChange={(e) => handleChange(e.target.value)}
              variant="outlined"
            />
          </Box>
        );

      case 'slider':
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {property.label}: {value ?? property.defaultValue ?? 0}
            </Typography>
            <Slider
              value={value ?? property.defaultValue ?? 0}
              onChange={(e, newValue) => handleChange(newValue)}
              min={property.min || 0}
              max={property.max || 100}
              step={property.step || 1}
              valueLabelDisplay="auto"
              size="small"
            />
          </Box>
        );

      default:
        return (
          <TextField
            fullWidth
            size="small"
            label={property.label}
            value={value || property.defaultValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            variant="outlined"
          />
        );
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      {renderEditor()}
    </Box>
  );
}