'use client';

import React from 'react';

import {
  type EmojiDropdownMenuOptions,
  useEmojiDropdownMenuState,
} from '@udecode/plate-emoji/react';
import { Smile } from 'lucide-react';
import { IconButton, Menu, Tooltip } from '@mui/material';

import { emojiCategoryIcons, emojiSearchIcons } from './emoji-icons';
import { EmojiPicker } from './emoji-picker';

type EmojiDropdownMenuProps = {
  options?: EmojiDropdownMenuOptions;
} & Omit<React.ComponentProps<typeof IconButton>, 'children'>;

export function EmojiDropdownMenu({
  options,
  ...props
}: EmojiDropdownMenuProps) {
  const { emojiPickerState, isOpen, setIsOpen } =
    useEmojiDropdownMenuState(options);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setIsOpen(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setIsOpen(false);
  };

  return (
    <>
      <Tooltip title="Emoji">
        <IconButton
          onClick={handleClick}
          color={isOpen ? 'primary' : 'default'}
          size="small"
          sx={{ 
            padding: '4px',
            '& svg': {
              width: '18px',
              height: '18px'
            }
          }}
          {...props}
        >
          <Smile />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        sx={{ zIndex: 100 }}
      >
        <EmojiPicker
          {...emojiPickerState}
          icons={{
            categories: emojiCategoryIcons,
            search: emojiSearchIcons,
          }}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          settings={options?.settings}
        />
      </Menu>
    </>
  );
}
