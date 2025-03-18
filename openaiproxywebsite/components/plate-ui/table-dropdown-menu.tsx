'use client';

import React, { useState } from 'react';
import { Button, Menu, MenuItem, IconButton, Box, Typography, Tooltip } from '@mui/material';
import { cn } from '@udecode/cn';
import { TablePlugin, useTableMergeState } from '@udecode/plate-table/react';
import { useEditorPlugin, useEditorSelector } from '@udecode/plate/react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Combine,
  Grid3x3Icon,
  Table,
  Trash2Icon,
  Ungroup,
  XIcon,
} from 'lucide-react';

export function TableDropdownMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [subMenuAnchorEl, setSubMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [currentSubMenu, setCurrentSubMenu] = useState<string>('');

  const tableSelected = useEditorSelector(
    (editor) => editor.api.some({ match: { type: TablePlugin.key } }),
    []
  );

  const { editor, tf } = useEditorPlugin(TablePlugin);
  const mergeState = useTableMergeState();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSubMenuAnchorEl(null);
    setCurrentSubMenu('');
  };

  const handleSubMenuOpen = (event: React.MouseEvent<HTMLElement>, menu: string) => {
    setSubMenuAnchorEl(event.currentTarget);
    setCurrentSubMenu(menu);
  };

  return (
    <>
      <Tooltip title="Table">
        <IconButton
          onClick={handleClick}
          color={Boolean(anchorEl) ? 'primary' : 'default'}
          size="small"
          sx={{ 
            padding: '4px',
            '& svg': {
              width: '18px',
              height: '18px'
            }
          }}
        >
          <Table />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <MenuItem
          onClick={(e) => handleSubMenuOpen(e, 'table')}
          sx={{ minWidth: '180px' }}
        >
          <Grid3x3Icon />
          <Typography sx={{ ml: 1 }}>Table</Typography>
        </MenuItem>

        <MenuItem
          onClick={(e) => handleSubMenuOpen(e, 'cell')}
          disabled={!tableSelected}
          sx={{ minWidth: '180px' }}
        >
          <Box sx={{ width: 16 }} />
          <Typography sx={{ ml: 1 }}>Cell</Typography>
        </MenuItem>

        <MenuItem
          onClick={(e) => handleSubMenuOpen(e, 'row')}
          disabled={!tableSelected}
          sx={{ minWidth: '180px' }}
        >
          <Box sx={{ width: 16 }} />
          <Typography sx={{ ml: 1 }}>Row</Typography>
        </MenuItem>

        <MenuItem
          onClick={(e) => handleSubMenuOpen(e, 'column')}
          disabled={!tableSelected}
          sx={{ minWidth: '180px' }}
        >
          <Box sx={{ width: 16 }} />
          <Typography sx={{ ml: 1 }}>Column</Typography>
        </MenuItem>

        <MenuItem
          onClick={() => {
            tf.remove.table();
            editor.tf.focus();
            handleClose();
          }}
          disabled={!tableSelected}
          sx={{ minWidth: '180px' }}
        >
          <Trash2Icon />
          <Typography sx={{ ml: 1 }}>Delete table</Typography>
        </MenuItem>
      </Menu>

      {/* Sub Menus */}
      <Menu
        anchorEl={subMenuAnchorEl}
        open={Boolean(subMenuAnchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {currentSubMenu === 'table' && (
          <Box sx={{ p: 1 }}>
            <TablePicker onSelect={handleClose} />
          </Box>
        )}

        {currentSubMenu === 'cell' && (
          <>
            <MenuItem
              onClick={() => {
                tf.table.merge();
                editor.tf.focus();
                handleClose();
              }}
              disabled={!mergeState.canMerge}
              sx={{ 
                minWidth: '140px',
                padding: '4px 8px',
                fontSize: '0.875rem'
              }}
            >
              <Combine />
              <Typography sx={{ ml: 1 }}>Merge cells</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                tf.table.split();
                editor.tf.focus();
                handleClose();
              }}
              disabled={!mergeState.canSplit}
              sx={{ 
                minWidth: '140px',
                padding: '4px 8px',
                fontSize: '0.875rem'
              }}
            >
              <Ungroup />
              <Typography sx={{ ml: 1 }}>Split cell</Typography>
            </MenuItem>
          </>
        )}

        {currentSubMenu === 'row' && (
          <>
            <MenuItem
              onClick={() => {
                tf.insert.tableRow({ before: true });
                editor.tf.focus();
                handleClose();
              }}
              sx={{ 
                minWidth: '140px',
                padding: '4px 8px',
                fontSize: '0.875rem'
              }}
            >
              <ArrowUp />
              <Typography sx={{ ml: 1 }}>Insert row before</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                tf.insert.tableRow();
                editor.tf.focus();
                handleClose();
              }}
              sx={{ minWidth: '180px' }}
            >
              <ArrowDown />
              <Typography sx={{ ml: 1 }}>Insert row after</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                tf.remove.tableRow();
                editor.tf.focus();
                handleClose();
              }}
              sx={{ 
                minWidth: '140px',
                padding: '4px 8px',
                fontSize: '0.875rem'
              }}
            >
              <XIcon />
              <Typography sx={{ ml: 1 }}>Delete row</Typography>
            </MenuItem>
          </>
        )}

        {currentSubMenu === 'column' && (
          <>
            <MenuItem
              onClick={() => {
                tf.insert.tableColumn({ before: true });
                editor.tf.focus();
                handleClose();
              }}
              sx={{ 
                minWidth: '140px',
                padding: '4px 8px',
                fontSize: '0.875rem'
              }}
            >
              <ArrowLeft />
              <Typography sx={{ ml: 1 }}>Insert column before</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                tf.insert.tableColumn();
                editor.tf.focus();
                handleClose();
              }}
              sx={{ 
                minWidth: '140px',
                padding: '4px 8px',
                fontSize: '0.875rem'
              }}
            >
              <ArrowRight />
              <Typography sx={{ ml: 1 }}>Insert column after</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                tf.remove.tableColumn();
                editor.tf.focus();
                handleClose();
              }}
              sx={{ 
                minWidth: '140px',
                padding: '4px 8px',
                fontSize: '0.875rem'
              }}
            >
              <XIcon />
              <Typography sx={{ ml: 1 }}>Delete column</Typography>
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
}

function TablePicker({ onSelect }: { onSelect: () => void }) {
  const { editor, tf } = useEditorPlugin(TablePlugin);
  const [tablePicker, setTablePicker] = useState({
    grid: Array.from({ length: 8 }, () => Array.from({ length: 8 }).fill(0)),
    size: { colCount: 0, rowCount: 0 },
  });

  const onCellMove = (rowIndex: number, colIndex: number) => {
    const newGrid = [...tablePicker.grid];
    
    for (let i = 0; i < newGrid.length; i++) {
      for (let j = 0; j < newGrid[i].length; j++) {
        newGrid[i][j] = i >= 0 && i <= rowIndex && j >= 0 && j <= colIndex ? 1 : 0;
      }
    }

    setTablePicker({
      grid: newGrid,
      size: { colCount: colIndex + 1, rowCount: rowIndex + 1 },
    });
  };

  return (
    <Box
      onClick={() => {
        tf.insert.table(tablePicker.size, { select: true });
        editor.tf.focus();
        onSelect();
      }}
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <Box
        sx={{
          display: 'grid',
          width: 130,
          height: 130,
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: '2px',
          p: 1,
        }}
      >
        {tablePicker.grid.map((rows, rowIndex) =>
          rows.map((value, columnIndex) => (
            <Box
              key={`(${rowIndex},${columnIndex})`}
              sx={{
                width: '12px',
                height: '12px',
                border: '1px solid',
                borderColor: value ? 'primary.main' : 'action.disabled',
                bgcolor: value ? 'primary.light' : 'action.hover',
              }}
              onMouseEnter={() => onCellMove(rowIndex, columnIndex)}
            />
          ))
        )}
      </Box>
      <Typography variant="caption" sx={{ mt: 1 }}>
        {tablePicker.size.rowCount} x {tablePicker.size.colCount}
      </Typography>
    </Box>
  );
}
