/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Menu as MenuIcon, Inbox as InboxIcon, Drafts as DraftsIcon } from '@mui/icons-material';

const drawerWidth = 240;

const styles = {
    root: css`
      display: flex;
    `,
    appBar: css`
      z-index: 1400;
    `,
    menuButton: css`
      margin-right: 36px;
    `,
    drawer: css`
      width: ${drawerWidth}px;
      flex-shrink: 0;
    `,
    drawerPaper: css`
      width: ${drawerWidth}px;
    `,
  };