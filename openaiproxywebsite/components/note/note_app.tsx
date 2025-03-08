import React from 'react';
import { 
  Box,
  createTheme,
  ThemeProvider,
  Typography,
  Paper,
} from '@mui/material';
import { Provider } from 'react-redux';
import { store } from '../../redux/store';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import NoteExplorer from './components/NoteExplorer';
import NoteEditor from './components/NoteEditor';

// Create a theme instance similar to the PaperProvider approach in St1ckyNotes
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

interface NoteAppProps {
    isSignedIn: boolean;
}

const NoteApp: React.FC<NoteAppProps> = (props: NoteAppProps) => {
  if (!props.isSignedIn) {
    return (
      <ThemeProvider theme={theme}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100vh', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              padding: 4,
              textAlign: 'center',
              maxWidth: '400px'
            }}
          >
            <Typography variant="h5" component="h1" gutterBottom>
              Please Login
            </Typography>
            <Typography variant="body1">
              You need to sign in to access the note application.
            </Typography>
          </Paper>
        </Box>
      </ThemeProvider>
    );
  }
  
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <Routes>
              <Route path="/" element={<NoteExplorer />} />
              <Route path="/note/:noteId" element={<NoteEditor />} />
              <Route path="/note/new" element={<NoteEditor />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default NoteApp;
