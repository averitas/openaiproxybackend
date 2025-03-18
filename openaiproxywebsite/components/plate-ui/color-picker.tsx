'use client';

import React, { useState, useCallback } from 'react';
import {
  Grid,
  Button,
  IconButton,
  TextField,
  Typography,
  MenuItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';

import { type TColor } from './color-dropdown-menu-items';
import { DEFAULT_COLORS, DEFAULT_CUSTOM_COLORS } from './color-constants';

interface ColorPickerProps {
  colors: TColor[];
  customColors: TColor[];
  clearColor: () => void;
  updateColor: (color: string) => void;
  updateCustomColor: (color: string) => void;
  color?: string;
  onClose?: () => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = React.memo(
  ({
    colors,
    customColors,
    clearColor,
    color,
    updateColor,
    updateCustomColor,
    onClose,
  }) => {
    const [customColor, setCustomColor] = useState<string>(color || '');

    const handleColorClick = useCallback(
      (selectedColor: string) => {
        updateColor(selectedColor);
        onClose?.();
      },
      [updateColor, onClose]
    );

    const handleCustomColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setCustomColor(event.target.value);
    };

    const handleUpdateCustomColor = () => {
      updateCustomColor(customColor);
      onClose?.();
    };

    const handleClearColor = () => {
      clearColor();
      onClose?.();
    };

    return (
      <Grid container direction="column" spacing={1} padding={1}>
        <Grid item>
          <Typography variant="subtitle2">Custom Colors</Typography>
          <Grid container spacing={1} justifyContent="space-between" alignItems="center">
            <Grid item >
              <TextField
                label="Color Hex Code"
                variant="outlined"
                size="small"
                value={customColor}
                onChange={handleCustomColorChange}
                style={{width: '80px'}}
              />
            </Grid>
            <Grid item >
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdateCustomColor}
              >
                Update
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Typography variant="subtitle2">Default Colors</Typography>
          <Grid container spacing={0.5} columns={8}>
            {colors.map((c) => (
              <Grid item key={c.value} xs={1} style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
                <Button
                  variant="contained"
                  style={{ backgroundColor: c.value, width: '16px', height: '16px', minWidth: '0px', borderRadius:0, padding:0 }}
                  onClick={() => handleColorClick(c.value)}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
        {color && (
          <Grid item>
            <MenuItem onClick={handleClearColor}>
              <ListItemIcon>
                <ClearIcon />
              </ListItemIcon>
              <ListItemText>Clear</ListItemText>
            </MenuItem>
          </Grid>
        )}
      </Grid>
    );
  }
);
