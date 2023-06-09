import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppBar, Avatar, Box, Drawer, IconButton, Menu, MenuItem, Toolbar, Tooltip, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ChatWindow from '@/components/chat/chat_window'
import SidePanel from '@/components/chat/side_panel'
import ChatManager from '@/components/chat/chat_manager'
import UserManager from '@/components/auth/user_manager'

const ChatApp: React.FC = () => {
  const { push } = useRouter()

  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [userEmail, setUserEmail] = React.useState(UserManager.instance.email)
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  }

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSignOut = async (event: React.MouseEvent<HTMLElement>) => {
    await UserManager.instance.signOut()
    push('/user/signin')
  }

  useEffect(() => {
    console.log(`--Setup callback started--`);
    try {
      ChatManager.instance.load()
    } catch (error) {
      console.error('Error getting temporary data from localStorage:', error);
    }

    const userChangeHandler = () => {
      setUserEmail(UserManager.instance.email)
    }

    UserManager.instance.addEventListener('userChange', userChangeHandler)

    console.log(`--Setup callback end--`);

    return () => {
      UserManager.instance.removeEventListener('userChange', userChangeHandler)
    }
  }, []);

  const drawerWidth = '250px'

  return (
    <>
      <div style={{ display: 'flex' }}>
        <AppBar position="fixed">
          <Toolbar>
            <IconButton color="inherit" aria-label="open drawer" onClick={handleDrawerToggle} edge="start" style={{ marginRight: '36px' }}>
              <MenuIcon />
            </IconButton>
            <Typography sx={{ flexGrow: 1 }} variant="h6" noWrap>
              Chat App
            </Typography>
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title={userEmail}>
                <IconButton sx={{ p: 0 }} onClick={handleOpenUserMenu}>
                  <Avatar>{userEmail.charAt(0)}</Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem>
                  <Typography textAlign="center">Profile</Typography>
                </MenuItem>
                <MenuItem onClick={handleSignOut}>
                  <Typography textAlign="center">Sign out</Typography>
                </MenuItem>
              </Menu>
            </Box>
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