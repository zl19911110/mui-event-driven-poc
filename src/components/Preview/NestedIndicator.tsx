// src/components/Preview/NestedIndicator.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

interface NestedIndicatorProps {
  depth: number;
  componentType: string;
}

export function NestedIndicator({ depth, componentType }: NestedIndicatorProps) {
  if (depth === 0) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: -20,
        left: 0,
        backgroundColor: 'primary.main',
        color: 'white',
        px: 1,
        py: 0.25,
        borderRadius: 0.5,
        fontSize: '0.7rem',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5
      }}
    >
      <Typography variant="caption">
        {'└'.repeat(depth)} {componentType}
      </Typography>
    </Box>
  );
}