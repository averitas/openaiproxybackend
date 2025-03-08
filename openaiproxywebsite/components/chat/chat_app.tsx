import React, { useEffect, useRef, useState } from 'react'
import { Box, Drawer, IconButton } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ChatWindow from '@/components/chat/chat_window'
import SidePanel from '@/components/chat/side_panel'
import ChatManager from '@/components/chat/chat_manager'
import UserManager from '@/components/auth/user_manager'
import GraphClient from '../graph/graph_manager'

const ChatApp: React.FC = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  // Load chat sessions on component mount
  useEffect(() => {
    try {
      ChatManager.instance.load()
    } catch (error) {
      console.error('Error getting temporary data from localStorage:', error);
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  }

  const drawerWidth = '250px'

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      <Box sx={{ position: 'fixed', top: '80px', left: '20px', zIndex: 999 }}>
        <IconButton 
          color="primary" 
          aria-label="open drawer" 
          onClick={handleDrawerToggle} 
          edge="start"
        >
          <MenuIcon />
        </IconButton>
      </Box>

      <Drawer 
        variant="temporary" 
        anchor='left' 
        sx={{ 
          width: drawerWidth, 
          flexShrink: 0,
          marginTop: '64px',
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
        onClose={handleDrawerToggle} 
        ModalProps={{ keepMounted: true }} 
        open={mobileOpen}
      >
        <SidePanel />
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, height: 'calc(100vh - 64px)' }}>
        <ChatWindow />
      </Box>
    </Box>
  );
};

export default ChatApp;