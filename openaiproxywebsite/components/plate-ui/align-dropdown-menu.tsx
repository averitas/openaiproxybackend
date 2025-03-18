'use client';

import React, { useState } from 'react';
import { Button, Menu, MenuItem, Tooltip } from '@mui/material';
import { setAlign } from '@udecode/plate-alignment';
import { useEditorRef, useSelectionFragmentProp } from '@udecode/plate/react';
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
} from 'lucide-react';

import { STRUCTURAL_TYPES } from '@/components/editor/transforms';

const items = [
  {
    icon: AlignLeftIcon,
    value: 'left',
  },
  {
    icon: AlignCenterIcon,
    value: 'center',
  },
  {
    icon: AlignRightIcon,
    value: 'right',
  },
  {
    icon: AlignJustifyIcon,
    value: 'justify',
  },
];

export function AlignDropdownMenu({  ...props }) {
  const editor = useEditorRef();
  const value = useSelectionFragmentProp({
    defaultValue: 'start',
    structuralTypes: STRUCTURAL_TYPES,
    getProp: (node) => node.align,
  });
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const IconValue = items.find((item) => item.value === value)?.icon ?? AlignLeftIcon;
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleMenuItemClick = (itemValue) => {
    setAlign(editor, { value: itemValue });
    editor.tf.focus();
    handleClose();
  };

  return (
    <>
      <Tooltip title="Align">
        <Button
          aria-controls={open ? 'align-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          sx={{ 
            minWidth: 'auto', 
            padding: '6px',
            color: open ? 'primary.main' : 'inherit'
          }}
        >
          <IconValue scale={0.8} />
        </Button>
      </Tooltip>
      
      <Menu
        id="align-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'align-button',
          sx: { display: 'flex', padding: '4px' }
        }}
      >
        {items.map(({ icon: Icon, value: itemValue }) => (
          <MenuItem 
            key={itemValue}
            selected={value === itemValue}
            onClick={() => handleMenuItemClick(itemValue)}
            sx={{ 
              minWidth: 'auto',
              padding: '6px',
              marginRight: '2px',
              borderRadius: '4px'
            }}
          >
            <Icon scale={0.8} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
