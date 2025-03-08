import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  IconButton, 
  Drawer,
  Snackbar,
  Alert,
  Toolbar,
  Paper as MuiPaper,
  Fab
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatIcon from '@mui/icons-material/Chat';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReactMarkdown from 'react-markdown';
import NoteSidebar from './NoteSidebar';
import NoteChatBox from './NoteChatBox';
import { fetchNotes, createNote, updateNote, deleteNote } from '../redux/notesSlice';
import { Note } from '../../../types/note';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';

const NoteContent: React.FC = () => {
  const navigate = useNavigate();
  // Redux with typed hooks
  const dispatch = useAppDispatch();
  const notes = useAppSelector((state) => state.notes.notes);
  const activeNote = useAppSelector((state) => state.notes.activeNote);
  const loading = useAppSelector((state) => state.notes.loading);

  // Local state
  const [isEditing, setIsEditing] = useState(true);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [incomingText, setIncomingText] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Initialize with data from API
  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  const handleCreateNote = () => {
    const newNote: Note = {
      localId: uuidv4(),
      title: "New Note",
      content: "",
      date: new Date().toISOString(),
      isDraft: true
    };
    
    dispatch(createNote(newNote));
    setIsEditing(true);
  };

  const handleSaveNote = () => {
    if (!activeNote) return;
    
    const updatedNote = {
      ...activeNote,
      date: new Date().toISOString(),
      isDraft: false
    };
    
    dispatch(updateNote(updatedNote));
    
    // Show success message
    setErrorMessage("Note saved successfully!");
    setShowError(true);
  };

  const handleUpdateActiveNote = (field: keyof Note, value: string) => {
    if (!activeNote) return;
    
    dispatch(updateNote({
      ...activeNote,
      [field]: value
    }));
  };

  const handleDeleteNote = () => {
    if (activeNote) {
      dispatch(deleteNote({
        localId: activeNote.localId,
        remoteId: activeNote.remoteId
      }))
        .unwrap()
        .then(() => {
          navigate('/');
          setErrorMessage("Note deleted successfully!");
          setShowError(true);
        })
        .catch((error) => {
          setErrorMessage(`Error deleting note: ${error.message || 'Unknown error'}`);
          setShowError(true);
        });
    }
  };

  const handleError = (message: string) => {
    setErrorMessage(message);
    setShowError(true);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      <MuiPaper
        elevation={1}
        sx={{ 
          width: '100%', 
          zIndex: 1, 
          position: 'sticky',
          top: 0,
          backgroundColor: (theme) => theme.palette.primary.main
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <ArrowBackIcon />
          </IconButton>
          <TextField
            variant="standard"
            value={activeNote?.title || ''}
            onChange={(e) => handleUpdateActiveNote('title', e.target.value)}
            sx={{ 
              flexGrow: 1, 
              input: { color: 'white', fontSize: '1.2rem' },
              '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: 'white' }
            }}
          />
          <IconButton color="inherit" onClick={handleSaveNote} disabled={!activeNote}>
            <SaveIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => setIsEditing(!isEditing)} disabled={!activeNote}>
            {isEditing ? <VisibilityIcon /> : <EditIcon />}
          </IconButton>
          <IconButton color="inherit" onClick={() => setIsChatVisible(true)} disabled={!activeNote}>
            <ChatIcon />
          </IconButton>
        </Toolbar>
      </MuiPaper>
      
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { width: 250, marginTop: 0 },
        }}
      >
        <NoteSidebar onCreateNote={handleCreateNote} />
      </Drawer>
      
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { width: 250, boxSizing: 'border-box', marginTop: 0 },
        }}
      >
        <NoteSidebar onCreateNote={handleCreateNote} />
      </Drawer>
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          display: 'flex',
          flexDirection: 'column', 
          width: { sm: `calc(100% - 250px)` },
          mt: 0
        }}
      >
        {loading ? (
          <Typography>Loading notes...</Typography>
        ) : (
          <Box 
            sx={{
              display: 'flex', 
              flexDirection: incomingText ? {xs: 'column', md: 'row'} : 'column',
              flex: 1,
              gap: 2
            }}
          >
            <Paper 
              elevation={3} 
              sx={{ 
                p: 2, 
                flex: 1, 
                minHeight: '300px',
                overflowY: 'auto'
              }}
            >
              {!activeNote ? (
                <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', mt: 4 }}>
                  Select a note or create a new one
                </Typography>
              ) : isEditing ? (
                <TextField
                  multiline
                  fullWidth
                  variant="outlined"
                  value={activeNote?.content || ''}
                  onChange={(e) => handleUpdateActiveNote('content', e.target.value)}
                  sx={{ height: '100%', '& .MuiOutlinedInput-root': { height: '100%' } }}
                />
              ) : (
                <Box sx={{ height: '100%', overflow: 'auto' }}>
                  <ReactMarkdown>{activeNote?.content || ''}</ReactMarkdown>
                </Box>
              )}
            </Paper>
            
            {incomingText && (
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 2, 
                  flex: 1,
                  minHeight: '300px',
                  overflowY: 'auto' 
                }}
              >
                <ReactMarkdown>{incomingText}</ReactMarkdown>
              </Paper>
            )}
          </Box>
        )}
        
        <NoteChatBox
          visible={isChatVisible}
          onClose={() => setIsChatVisible(false)}
          noteContent={activeNote?.content || ''}
          setError={handleError}
          setOutputText={setIncomingText}
        />
      </Box>
      
      <Fab
        color="secondary"
        aria-label="delete"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleDeleteNote}
        disabled={!activeNote}
      >
        <DeleteIcon />
      </Fab>
      
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
      >
        <Alert 
          onClose={() => setShowError(false)} 
          severity={errorMessage.includes("error") ? "error" : "success"}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NoteContent;