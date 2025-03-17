'use client';

import React from 'react';
import { styled } from '@mui/material/styles';
import { cn } from '@udecode/cn';
import { PlateLeaf } from '@udecode/plate/react';

const StyledPlateLeaf = styled(PlateLeaf)(({ theme }) => ({
  borderBottom: '2px solid',
  borderBottomColor: theme.palette.mode === 'light' ? '#e9d5ff' : '#6b21a8',
  backgroundColor: theme.palette.mode === 'light' ? '#faf5ff' : '#4c1d95',
  color: theme.palette.mode === 'light' ? '#6b21a8' : '#e9d5ff',
  transition: 'all 200ms ease-in-out',
}));

export function AILeaf({
  className,
  ...props
}: React.ComponentProps<typeof PlateLeaf>) {
  return (
    <StyledPlateLeaf
      className={cn(className)}
      {...props}
    />
  );
}
