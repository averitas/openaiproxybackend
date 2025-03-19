'use client';

import React from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import {
  useLineHeightDropdownMenu,
  useLineHeightDropdownMenuState,
} from '@udecode/plate-line-height/react';
import { WrapText } from 'lucide-react';

export function LineHeightDropdownMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const state = useLineHeightDropdownMenuState();
  const { radioGroupProps } = useLineHeightDropdownMenu(state);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    radioGroupProps.onValueChange?.(event.target.value);
    handleClose();
  };

  return (
    <>
      <Tooltip title="Line height">
        <IconButton
          onClick={handleClick}
          color={open ? "primary" : "default"}
          size="small"
          sx={{ 
            padding: '4px',
            '& svg': {
              width: '18px',
              height: '18px'
            }
          }}
        >
          <WrapText />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <RadioGroup 
          value={radioGroupProps.value || ''}
          onChange={handleChange}
        >
          {state.values.map((_value) => (
            <MenuItem 
              key={_value} 
              sx={{ 
                minWidth: '140px',
                padding: '4px 8px',
                fontSize: '0.875rem'
              }}
            >
              <FormControlLabel
                value={_value}
                control={<Radio size="small" />}
                label={_value}
                sx={{ 
                  margin: 0,
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem'
                  }
                }}
              />
            </MenuItem>
          ))}
        </RadioGroup>
      </Menu>
    </>
  );
}
