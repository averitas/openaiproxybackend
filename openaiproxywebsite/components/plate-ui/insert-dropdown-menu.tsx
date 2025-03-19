'use client';

import React, { useState } from 'react';

import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { DatePlugin } from '@udecode/plate-date/react';
import { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { TocPlugin } from '@udecode/plate-heading/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { INDENT_LIST_KEYS, ListStyleType } from '@udecode/plate-indent-list';
import { LinkPlugin } from '@udecode/plate-link/react';
import {
  EquationPlugin,
  InlineEquationPlugin,
} from '@udecode/plate-math/react';
import { ImagePlugin, MediaEmbedPlugin } from '@udecode/plate-media/react';
import { TablePlugin } from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import {
  type PlateEditor,
  ParagraphPlugin,
  useEditorRef,
} from '@udecode/plate/react';
import {
  CalendarIcon,
  ChevronRightIcon,
  Columns3Icon,
  FileCodeIcon,
  FilmIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  Link2Icon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  PenToolIcon,
  PilcrowIcon,
  PlusIcon,
  QuoteIcon,
  RadicalIcon,
  SquareIcon,
  TableIcon,
  TableOfContentsIcon,
} from 'lucide-react';

// Material UI imports
import { 
  Button,
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Typography,
  Divider
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import {
  insertBlock,
  insertInlineElement,
} from '@/components/editor/transforms';

type Group = {
  group: string;
  items: Item[];
};

interface Item {
  icon: React.ReactNode;
  value: string;
  onSelect: (editor: PlateEditor, value: string) => void;
  focusEditor?: boolean;
  label?: string;
}

const groups: Group[] = [
  {
    group: 'Basic blocks',
    items: [
      {
        icon: <PilcrowIcon />,
        label: 'Paragraph',
        value: ParagraphPlugin.key,
      },
      {
        icon: <Heading1Icon />,
        label: 'Heading 1',
        value: HEADING_KEYS.h1,
      },
      {
        icon: <Heading2Icon />,
        label: 'Heading 2',
        value: HEADING_KEYS.h2,
      },
      {
        icon: <Heading3Icon />,
        label: 'Heading 3',
        value: HEADING_KEYS.h3,
      },
      {
        icon: <TableIcon />,
        label: 'Table',
        value: TablePlugin.key,
      },
      {
        icon: <FileCodeIcon />,
        label: 'Code',
        value: CodeBlockPlugin.key,
      },
      {
        icon: <QuoteIcon />,
        label: 'Quote',
        value: BlockquotePlugin.key,
      },
      {
        icon: <MinusIcon />,
        label: 'Divider',
        value: HorizontalRulePlugin.key,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: 'Lists',
    items: [
      {
        icon: <ListIcon />,
        label: 'Bulleted list',
        value: ListStyleType.Disc,
      },
      {
        icon: <ListOrderedIcon />,
        label: 'Numbered list',
        value: ListStyleType.Decimal,
      },
      {
        icon: <SquareIcon />,
        label: 'To-do list',
        value: INDENT_LIST_KEYS.todo,
      },
      {
        icon: <ChevronRightIcon />,
        label: 'Toggle list',
        value: TogglePlugin.key,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: 'Media',
    items: [
      {
        icon: <ImageIcon />,
        label: 'Image',
        value: ImagePlugin.key,
      },
      {
        icon: <FilmIcon />,
        label: 'Embed',
        value: MediaEmbedPlugin.key,
      },
      {
        icon: <PenToolIcon />,
        label: 'Excalidraw',
        value: ExcalidrawPlugin.key,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: 'Advanced blocks',
    items: [
      {
        icon: <TableOfContentsIcon />,
        label: 'Table of contents',
        value: TocPlugin.key,
      },
      {
        icon: <Columns3Icon />,
        label: '3 columns',
        value: 'action_three_columns',
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: 'Equation',
        value: EquationPlugin.key,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: 'Inline',
    items: [
      {
        icon: <Link2Icon />,
        label: 'Link',
        value: LinkPlugin.key,
      },
      {
        focusEditor: true,
        icon: <CalendarIcon />,
        label: 'Date',
        value: DatePlugin.key,
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: 'Inline Equation',
        value: InlineEquationPlugin.key,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertInlineElement(editor, value);
      },
    })),
  },
];

export function InsertDropdownMenu() {
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
        aria-label="Insert"
        aria-controls={open ? 'insert-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        size="small"
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          padding: '4px',
          borderRadius: 1,
          '& svg': {
            width: '18px',
            height: '18px'
          },
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        <PlusIcon />
        <ArrowDropDownIcon fontSize="small" />
      </IconButton>

      <Menu
        id="insert-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'insert-button',
          sx: { maxHeight: '500px', overflow: 'auto', minWidth: '180px' }
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {groups.map(({ group, items: nestedItems }, groupIndex) => (
          <React.Fragment key={group}>
            {groupIndex > 0 && <Divider />}
            <Typography variant="caption" sx={{ px: 2, pt: 1, pb: 0.5, display: 'block', color: 'text.secondary' }}>
              {group}
            </Typography>
            {nestedItems.map(({ icon, label, value, onSelect }) => (
              <MenuItem 
                key={value}
                onClick={() => {
                  onSelect(editor, value);
                  editor.tf.focus();
                  handleClose();
                }}
                sx={{ minWidth: '180px' }}
              >
                <ListItemIcon sx={{ minWidth: '24px', mr: 1 }}>
                  {icon}
                </ListItemIcon>
                <ListItemText>{label}</ListItemText>
              </MenuItem>
            ))}
          </React.Fragment>
        ))}
      </Menu>
    </>
  );
}
