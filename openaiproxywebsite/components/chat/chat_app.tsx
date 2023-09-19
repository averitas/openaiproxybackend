import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppBar, Avatar, Box, Drawer, IconButton, Menu, MenuItem, MenuList, Toolbar, Tooltip, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ChatWindow from '@/components/chat/chat_window'
import SidePanel from '@/components/chat/side_panel'
import ChatManager from '@/components/chat/chat_manager'
import UserManager from '@/components/auth/user_manager'
import GraphClient from '../graph/graph_manager'

const ChatApp: React.FC = () => {
  const { push } = useRouter()

  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [userIsLogin, setUserIsLogin] = React.useState(UserManager.instance.isSignedIn)
  const [userEmail, setUserEmail] = React.useState(UserManager.instance.email)
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null)
  const [userIcon, setUserIcon] = React.useState<string | undefined>(undefined)

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
    handleCloseUserMenu()
  }

  const handleSignIn = async (event: React.MouseEvent<HTMLElement>) => {
    await UserManager.instance.signInMsal()
    handleCloseUserMenu()
  }

  useEffect(() => {
    console.log(`--Setup callback started--`);
    try {
      ChatManager.instance.load()
    } catch (error) {
      console.error('Error getting temporary data from localStorage:', error);
    }

    const userChangeHandler = () => {
      console.debug('!! userChangeHandler Set user email ' + UserManager.instance.email)
      setUserEmail(UserManager.instance.email)
      setUserIsLogin(UserManager.instance.isSignedIn)

      if (UserManager.instance.isSignedIn) {
        console.debug('user login, set user icon')
        GraphClient.instance.GetUserPicUrl().then(url => {
          console.debug('User icon url is ' + url)
          setUserIcon(url)
        }).catch(err => {
          console.error('Set user icon error ' + err)
        })
      }
    }

    UserManager.instance.addEventListener(UserManager.USER_CHANGE_EVENT, userChangeHandler)
    UserManager.instance.init().then( () =>
      setUserEmail(UserManager.instance.email)
    )

    console.log(`--Setup callback end--`);

    return () => {
      console.log(`User manager listener removed --Setup callback end--`);
      UserManager.instance.removeEventListener(UserManager.USER_CHANGE_EVENT, userChangeHandler)
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
              Chat App, empowered by GPT-4
            </Typography>
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title={userEmail}>
                <IconButton sx={{ p: 0 }} onClick={handleOpenUserMenu}>
                  <Avatar src={userIcon}>{userEmail.charAt(0)}</Avatar>
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
                {
                  userIsLogin ?
                  <MenuList>
                  <MenuItem onClick={() => UserManager.instance.printToken()}>
                    <Typography textAlign="center">Profile</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleSignOut}>
                    <Typography textAlign="center">Sign out</Typography>
                  </MenuItem>
                  </MenuList>
                  :
                  <MenuList>
                  <MenuItem onClick={handleSignIn}>
                    <Typography textAlign="center">Sign In</Typography>
                  </MenuItem>
                  </MenuList>
                }
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