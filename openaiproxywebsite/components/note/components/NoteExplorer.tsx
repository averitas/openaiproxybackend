import React, { useEffect, useState } from 'react';
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
  CircularProgress,
  Modal,
  Backdrop,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { fetchNotes, createNote, updateNote } from '../redux/notesSlice';
import { v4 as uuidv4 } from 'uuid';
import { Note } from '../../../types/note';
import dynamic from 'next/dynamic';
import NoteEditor from './NoteEditor';

const Layout = dynamic(() => import('react-masonry-list'), {
    ssr: false,
  });

const NoteExplorer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const notes = useSelector((state: RootState) => state.notes.notes);
  const loading = useSelector((state: RootState) => state.notes.loading);
  
  // State for modal editor
  const [openEditor, setOpenEditor] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

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
        setSelectedNoteId(newNote.localId);
        setOpenEditor(true);
      });
  };

  const handleNoteClick = (noteId: string) => {
    setSelectedNoteId(noteId);
    setOpenEditor(true);
  };

  const handleCloseEditor = (note?: Note) => {
    // If note provided, save it before closing
    if (note) {
      dispatch(updateNote({
        ...note,
        date: new Date().toISOString()
      }));
    }
    setOpenEditor(false);
    setSelectedNoteId(null);
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
      
      <Container 
        maxWidth="lg" 
        sx={{ 
          mt: 4, 
          mb: 4, 
          flexGrow: 1, 
          overflow: 'auto',
          filter: openEditor ? 'blur(5px)' : 'none',
          transition: 'filter 0.3s ease'
        }}
      >
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
        sx={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16,
          zIndex: openEditor ? 0 : 1
        }}
        onClick={handleCreateNote}
      >
        <AddIcon />
      </Fab>

      {/* Modal for Note Editor */}
      <Modal
        open={openEditor}
        onClose={() => handleCloseEditor()} // Will save current note state
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // The modal content needs to be above the backdrop
          zIndex: 1300
        }}
      >
        <Box 
          onClick={(e) => e.stopPropagation()} // Prevent click from closing modal when clicking inside
          sx={{ 
            width: '80%',
            height: '80%',
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 24,
            outline: 'none',
            overflow: 'hidden',
            // Ensure the background is completely opaque
            backgroundColor: 'white',
            // Apply a higher z-index to appear above the backdrop
            position: 'relative',
            zIndex: 1301
          }}
        >
          {selectedNoteId && (
            <NoteEditor 
              noteId={selectedNoteId} 
              onClose={handleCloseEditor}
              isModal={true}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default NoteExplorer;
