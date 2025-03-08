import React, { useEffect, useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box, 
  Avatar, 
  Menu, 
  MenuItem, 
  Tooltip, 
  Tabs,
  Tab
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChatIcon from '@mui/icons-material/Chat';
import NoteIcon from '@mui/icons-material/Note';
import UserManager from './auth/user_manager';
import ChatApp from './chat/chat_app';
import NoteApp from './note/note_app';
import GraphClient from './graph/graph_manager';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`app-tabpanel-${index}`}
      aria-labelledby={`app-tab-${index}`}
      style={{ height: 'calc(100vh - 64px)', overflow: 'auto', marginTop: '0px', marginBottom: '0px', }}
      {...other}
    >
      {value === index && (
        <Box sx={{ height: 'calc(100% - 64px)' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AppContainer: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [userIsLogin, setUserIsLogin] = useState(UserManager.instance.isSignedIn);
  const [userEmail, setUserEmail] = useState(UserManager.instance.email);
  const [userIcon, setUserIcon] = useState<string | undefined>(undefined);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSignOut = async () => {
    await UserManager.instance.signOut();
    handleCloseUserMenu();
  };

  const handleSignIn = async () => {
    await UserManager.instance.signInMsal();
    handleCloseUserMenu();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
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

    UserManager.instance.addEventListener(UserManager.USER_CHANGE_EVENT, userChangeHandler);

    return () => {
      UserManager.instance.removeEventListener(UserManager.USER_CHANGE_EVENT, userChangeHandler);
    };
  }
  , []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, height: '64px' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI Assistant Platform
          </Typography>
          
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ mr: 2 }}
          >
            <Tab icon={<ChatIcon />} label="Chat" id="app-tab-0" aria-controls="app-tabpanel-0" />
            <Tab icon={<NoteIcon />} label="Notes" id="app-tab-1" aria-controls="app-tabpanel-1" />
          </Tabs>
          
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title={userEmail}>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
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
              {userIsLogin ? (
                [
                  <MenuItem key="profile" onClick={() => UserManager.instance.printToken()}>
                    <Typography textAlign="center">Profile</Typography>
                  </MenuItem>,
                  <MenuItem key="signout" onClick={handleSignOut}>
                    <Typography textAlign="center">Sign out</Typography>
                  </MenuItem>
                ]
              ) : (
                <MenuItem onClick={handleSignIn}>
                  <Typography textAlign="center">Sign In</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ 
        flex: 1, 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column-reverse',
        height: 'calc(100vh - 64px)' // Subtract AppBar height
      }}>
        <TabPanel value={tabValue} index={0}>
          <ChatApp />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <NoteApp isSignedIn={userIsLogin} />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default AppContainer;
