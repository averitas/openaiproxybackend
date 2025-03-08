import React from 'react';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { Note } from '../../../types/note';
import { setActiveNote } from '../redux/notesSlice';
import { RootState, AppDispatch } from '../../../redux/store';

interface NoteSidebarProps {
  onCreateNote: () => void;
}

const NoteSidebar: React.FC<NoteSidebarProps> = ({ onCreateNote }) => {
  const dispatch = useDispatch<AppDispatch>();
  const notes = useSelector((state: RootState) => state.notes.notes);
  const activeNote = useSelector((state: RootState) => state.notes.activeNote);

  const handleSelectNote = (note: Note) => {
    dispatch(setActiveNote(note));
  };

  return (
    <Box sx={{ width: 250, overflow: 'auto', padding: 2 }}>
      <Button 
        variant="contained" 
        color="secondary" 
        fullWidth 
        onClick={onCreateNote}
        sx={{ mb: 2 }}
      >
        New Note
      </Button>
      <Divider sx={{ mb: 2 }} />
      {notes.map((note) => (
        <Paper 
          key={note.localId} 
          elevation={2} 
          sx={{ 
            p: 2, 
            mb: 2, 
            backgroundColor: activeNote?.localId === note.localId ? '#f5f5f5' : 'white',
            cursor: 'pointer'
          }}
          onClick={() => handleSelectNote(note)}
        >
          <Typography variant="h6" noWrap>
            {note.title || "Untitled Note"}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {new Date(note.date).toLocaleString()}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default NoteSidebar;
