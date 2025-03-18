'use client';

import React, { useState } from 'react';
import { Button, Menu, MenuItem, IconButton } from '@mui/material';
import {
  useEditorRef,
  usePlateState,
  usePluginOption,
} from '@udecode/plate/react';
import { SuggestionPlugin } from '@udecode/plate-suggestion/react';
import { Eye, Pen, PencilLineIcon } from 'lucide-react';

export function ModeDropdownMenu() {
  const editor = useEditorRef();
  const [readOnly, setReadOnly] = usePlateState('readOnly');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const isSuggesting = usePluginOption(SuggestionPlugin, 'isSuggesting');

  let value = 'editing';
  if (readOnly) value = 'viewing';
  if (isSuggesting) value = 'suggestion';

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (newValue: string) => {
    if (newValue === 'viewing') {
      setReadOnly(true);
    } else {
      setReadOnly(false);
    }

    if (newValue === 'suggestion') {
      editor.setOption(SuggestionPlugin, 'isSuggesting', true);
    } else {
      editor.setOption(SuggestionPlugin, 'isSuggesting', false);
    }

    if (newValue === 'editing') {
      editor.tf.focus();
    }

    handleClose();
  };

  const items = {
    editing: {
      icon: <Pen className="h-5 w-5" />,
      text: 'Editing'
    },
    suggestion: {
      icon: <PencilLineIcon className="h-5 w-5" />,
      text: 'Suggestion'
    },
    viewing: {
      icon: <Eye className="h-5 w-5" />,
      text: 'Viewing'
    },
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant="outlined"
        size="small"
        startIcon={items[value as keyof typeof items].icon}
        aria-controls={open ? 'mode-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        sx={{ 
          minWidth: 'auto',
          padding: '4px 6px',
          '& svg': {
            width: '18px',
            height: '18px'
          },
          textTransform: 'none',
          '& .MuiButton-startIcon': {
            marginRight: { xs: 0, lg: 1 }
          }
        }}
      >
        <span className="hidden lg:inline">{items[value as keyof typeof items].text}</span>
      </Button>
      <Menu
        id="mode-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'mode-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            minWidth: 180,
          }
        }}
      >
        {Object.entries(items).map(([key, { icon, text }]) => (
          <MenuItem
            key={key}
            selected={value === key}
            onClick={() => handleMenuItemClick(key)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 1,
              padding: '4px',
              '& svg': {
                width: '18px',
                height: '18px'
              }
            }}
          >
            {icon}
            {text}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
