import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  CardActionArea,
  AppBar,
  Toolbar,
  Fab,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { fetchNotes, createNote } from '../redux/notesSlice';
import { v4 as uuidv4 } from 'uuid';
import { Note } from '../../../types/note';
import dynamic from 'next/dynamic';
const Layout = dynamic(() => import('react-masonry-list'), {
    ssr: false,
  });

const NoteExplorer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const notes = useSelector((state: RootState) => state.notes.notes);
  const loading = useSelector((state: RootState) => state.notes.loading);

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  const handleCreateNote = () => {
    const newNote: Note = {
      localId: uuidv4(),
      title: 'Untitled Note',
      content: '<p>Start writing here...</p>',
      date: new Date().toISOString(),
      isDraft: true
    };
    
    dispatch(createNote(newNote))
      .then(() => {
        navigate(`/note/${newNote.localId}`);
      });
  };

  const handleNoteClick = (noteId: string) => {
    navigate(`/note/${noteId}`);
  };

  if (loading && notes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            StickyNotes
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1, overflow: 'auto' }}>
        <Layout
          minWidth={100}
          gap={24}
          items={notes.map((note: Note) => (
            <Card 
              key={note.localId}
              sx={{ 
                width: '100%',
                display: 'flex', 
                flexDirection: 'column',
                marginBottom: 2,
                '&:hover': { 
                  boxShadow: 6 
                }
              }}
            >
              <CardActionArea 
                sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                onClick={() => handleNoteClick(note.localId)}
              >
                <CardContent sx={{ flexGrow: 1, width: '100%' }}>
                  <Typography gutterBottom variant="h5" component="div" noWrap>
                    {note.title || 'Untitled Note'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {note.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    {new Date(note.date).toLocaleString()}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        />
      </Container>
      
      <Fab 
        color="secondary" 
        aria-label="add" 
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleCreateNote}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default NoteExplorer;
