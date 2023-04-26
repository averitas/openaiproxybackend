import ChatWindow from '@/components/chat_window';
import SidePanel from '@/components/side_panel';
import React, { useEffect, useRef, useState } from 'react';
import { AppBar, Drawer, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChatManager from '@/components/chat_manager';

const ChatApp: React.FC = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    console.log(`--Setup callback started--`);
    try {
      ChatManager.instance.load()
    } catch (error) {
      console.error('Error getting temporary data from localStorage:', error);
    }
    console.log(`--Setup callback end--`);
  }, []);

  const drawerWidth = '250px'

  return (
    <>
      <div style={{ display: 'flex' }}>
        <AppBar position="fixed" style={{ zIndex: 1400 }}>
          <Toolbar>
            <IconButton color="inherit" aria-label="open drawer" onClick={handleDrawerToggle} edge="start" style={{ marginRight: '36px' }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Chat App
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer variant="temporary" anchor='left' style={{ width: drawerWidth, flexShrink: 0 }}
          onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} open={mobileOpen}>
          <div style={{ minHeight: '45px' }} />
          <SidePanel />
        </Drawer>
        <main style={{ height: '100vh', flexGrow: 1 }}>
          <ChatWindow />
        </main>
      </div>
    </>
  );
};


export default ChatApp;