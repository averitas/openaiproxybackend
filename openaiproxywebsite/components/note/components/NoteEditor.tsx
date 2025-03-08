import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  IconButton, 
  TextField, 
  Typography, 
  CircularProgress,
  Paper,
  Fab,
  Snackbar,
  Alert,
  Drawer
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import ChatIcon from '@mui/icons-material/Chat';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { fetchNotes, updateNote, setActiveNote, deleteNote } from '../redux/notesSlice';
import { Note } from '../../../types/note';
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import parse from 'html-react-parser';
import NoteChatBox from './NoteChatBox';

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(
  () => import('react-quill'),
  { ssr: false }
);

const NoteEditor: React.FC = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const notes = useSelector((state: RootState) => state.notes.notes);
  const activeNote = useSelector((state: RootState) => state.notes.activeNote);
  const loading = useSelector((state: RootState) => state.notes.loading);
  
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [note, setNote] = useState<Note | null>(null);
  const [isChatVisible, setIsChatVisible] = useState<boolean>(false);
  const [incomingText, setIncomingText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Add a state to track if we're on client side
  const [isBrowser, setIsBrowser] = useState(false);
  
  // Check if we're on client side
  useEffect(() => {
    setIsBrowser(true);
  }, []);
  
  useEffect(() => {
    if (notes.length === 0) {
      dispatch(fetchNotes());
    }
  }, [dispatch, notes.length]);
  
  useEffect(() => {
    if (noteId && notes.length > 0) {
      const foundNote = notes.find(n => n.localId === noteId);
      if (foundNote) {
        setNote(foundNote);
        dispatch(setActiveNote(foundNote));
      } else {
        // If note not found, create a new one
        const newNote: Note = {
          localId: uuidv4(),
          title: 'Untitled Note',
          content: '<p>Start writing here...</p>',
          date: new Date().toISOString(),
          isDraft: true
        };
        setNote(newNote);
        dispatch(setActiveNote(newNote));
      }
    }
  }, [noteId, notes, dispatch]);

  const handleSave = () => {
    if (note) {
      const updatedNote = {
        ...note,
        date: new Date().toISOString(),
        isDraft: false
      };
      dispatch(updateNote(updatedNote))
        .unwrap()
        .then((note) => {
          // Show success feedback
          setNote(note)
        })
        .catch((err) => {
          setError(`Failed to save: ${err.message}`);
        });
    }
  };

  const handleDelete = () => {
    if (note) {
      dispatch(deleteNote({ 
        localId: note.localId, 
        remoteId: note.remoteId 
      }))
        .unwrap()
        .then(() => {
          navigate('/');
        })
        .catch((err) => {
          setError(`Failed to delete: ${err.message || 'Unknown error'}`);
        });
    }
  };

  const handleBackToList = () => {
    navigate('/');
  };

  const toggleEditingMode = () => {
    setIsEditing(prev => !prev);
  };
  
  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  if (loading && !note) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!note) {
    return <Typography>Note not found</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBackToList}
            aria-label="back"
          >
            <ArrowBackIcon />
          </IconButton>
          
          {isEditingTitle ? (
            <TextField
              autoFocus
              value={note.title}
              onChange={(e) => setNote({ ...note, title: e.target.value })}
              onBlur={() => setIsEditingTitle(false)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  setIsEditingTitle(false);
                }
              }}
              variant="standard"
              sx={{ flexGrow: 1, color: 'white' }}
              InputProps={{
                sx: { color: 'white', fontSize: '1.25rem' }
              }}
            />
          ) : (
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ flexGrow: 1, cursor: 'pointer' }}
              onClick={() => setIsEditingTitle(true)}
            >
              {note.title || "Untitled Note"}
            </Typography>
          )}
          
          <IconButton color="inherit" onClick={handleSave}>
            <SaveIcon />
          </IconButton>
          
          <IconButton color="inherit" onClick={toggleEditingMode}>
            {isEditing ? <VisibilityIcon /> : <EditIcon />}
          </IconButton>
          
          <IconButton color="inherit" onClick={toggleChat}>
            <ChatIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'row', 
        flexGrow: 1, 
        overflow: 'hidden' 
      }}>
        <Box sx={{ 
          flexGrow: 1, 
          p: 2, 
          overflow: 'auto', 
          height: '100%', 
          width: incomingText ? '50%' : '100%' 
        }}>
          {isEditing ? (
            isBrowser ? (
              <ReactQuill
                theme="snow"
                value={note.content}
                onChange={(content) => setNote({ ...note, content })}
                style={{ height: 'calc(100% - 42px)' }}
              />
            ) : (
              <div>Loading editor...</div>
            )
          ) : (
            <Paper elevation={0} sx={{ p: 2, height: '100%', overflow: 'auto' }}>
              {parse(note.content)}
            </Paper>
          )}
        </Box>

        {incomingText && (
          <Box sx={{ width: '50%', p: 2, overflow: 'auto', height: '100%' }}>
            <Paper elevation={1} sx={{ p: 2, height: '100%', overflow: 'auto' }}>
              {parse(incomingText)}
            </Paper>
          </Box>
        )}
      </Box>

      <Fab
        color="secondary"
        aria-label="delete"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleDelete}
      >
        <DeleteIcon />
      </Fab>

      <NoteChatBox
        visible={isChatVisible}
        onClose={toggleChat}
        noteContent={note.content}
        setError={setError}
        setOutputText={setIncomingText}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NoteEditor;
