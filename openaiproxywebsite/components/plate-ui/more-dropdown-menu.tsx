'use client';

import React, { useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import {
  SubscriptPlugin,
  SuperscriptPlugin,
} from '@udecode/plate-basic-marks/react';
import { KbdPlugin } from '@udecode/plate-kbd/react';
import { useEditorRef } from '@udecode/plate/react';
import {
  Keyboard as KeyboardIcon,
  MoreHoriz as MoreHorizontalIcon,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
} from '@mui/icons-material';

export function MoreDropdownMenu() {
  const editor = useEditorRef();
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
        onClick={handleClick}
        color={open ? 'primary' : 'default'}
        size="small"
        sx={{ 
          padding: '4px',
          '& svg': {
            width: '18px',
            height: '18px'
          }
        }}
        aria-label="more options"
        aria-controls={open ? 'more-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <MoreHorizontalIcon />
      </IconButton>

      <Menu
        id="more-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{ minWidth: '180px' }}
      >
        <MenuItem
          onClick={() => {
            editor.tf.toggleMark(KbdPlugin.key);
            editor.tf.collapse({ edge: 'end' });
            editor.tf.focus();
            handleClose();
          }}
          sx={{ 
            padding: '4px',
            '& svg': {
              width: '18px',
              height: '18px'
            }
          }}
        >
          <KeyboardIcon sx={{ mr: 1 }} />
          Keyboard input
        </MenuItem>

        <MenuItem
          onClick={() => {
            editor.tf.toggleMark(SuperscriptPlugin.key, {
              remove: SubscriptPlugin.key,
            });
            editor.tf.focus();
            handleClose();
          }}
          sx={{ 
            padding: '4px',
            '& svg': {
              width: '18px',
              height: '18px'
            }
          }}
        >
          <SuperscriptIcon sx={{ mr: 1 }} />
          Superscript
        </MenuItem>

        <MenuItem
          onClick={() => {
            editor.tf.toggleMark(SubscriptPlugin.key, {
              remove: SuperscriptPlugin.key,
            });
            editor.tf.focus();
            handleClose();
          }}
          sx={{ 
            padding: '4px',
            '& svg': {
              width: '18px',
              height: '18px'
            }
          }}
        >
          <SubscriptIcon sx={{ mr: 1 }} />
          Subscript
        </MenuItem>
      </Menu>
    </>
  );
}
