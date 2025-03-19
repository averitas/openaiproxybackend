'use client';

import { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';

import {
  useColorDropdownMenu,
  useColorDropdownMenuState,
} from '@udecode/plate-font/react';

import { DEFAULT_COLORS, DEFAULT_CUSTOM_COLORS } from './color-constants';
import { ColorPicker } from './color-picker';

type ColorDropdownMenuProps = {
  nodeType: string;
  tooltip?: string;
  children?: React.ReactNode;
};

export function ColorDropdownMenu({
  children,
  nodeType,
  tooltip,
}: ColorDropdownMenuProps) {
  const state = useColorDropdownMenuState({
    closeOnSelect: true,
    colors: DEFAULT_COLORS,
    customColors: DEFAULT_CUSTOM_COLORS,
    nodeType,
  });

  const { buttonProps, menuProps } = useColorDropdownMenu(state);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        title={tooltip}
        size="small"
          sx={{ 
            padding: '4px',
            '& svg': {
              width: '18px',
              height: '18px'
            }
          }}
        {...buttonProps}
      >
        {children}
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        sx={{ width: '60%' }}
      >
        <ColorPicker
          color={state.selectedColor || state.color}
          clearColor={state.clearColor}
          colors={state.colors}
          customColors={state.customColors}
          updateColor={state.updateColorAndClose}
          updateCustomColor={state.updateColor}
          onClose={handleClose}
        />
      </Menu>
    </>
  );
}
