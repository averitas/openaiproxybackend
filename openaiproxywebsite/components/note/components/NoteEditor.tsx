import React, { useState, useEffect, useMemo } from 'react';
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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { fetchNotes, updateNote, setActiveNote, deleteNote, updateActiveNoteContent } from '../redux/notesSlice';
import { Note } from '../../../types/note';
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import parse from 'html-react-parser';
import NoteChatBox from './NoteChatBox';
import { PlateEditor } from '@/components/editor/plate-editor';
import { ExtractContentToHtml } from '@/components/editor/utils';

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface NoteEditorProps {
  onClose?: (note?: Note) => void;  // For modal usage
  isModal?: boolean;  // Flag to indicate if editor is in modal mode
  useMarkdown?: boolean;  // Use markdown instead of HTML
  isSaving?: boolean;
  setIsSaving?: (isSaving: boolean) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = (props: NoteEditorProps) => {
  const { noteId: routeNoteId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const notes = useSelector((state: RootState) => state.notes.notes);
  const activeNote = useSelector((state: RootState) => state.notes.activeNote);
  const loading = useSelector((state: RootState) => state.notes.loading);

  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [isChatVisible, setIsChatVisible] = useState<boolean>(false);
  const [incomingText, setIncomingText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [editor, setEditor] = useState(null);

  const [noteContent, setNoteContent] = useState<string>(activeNote?.content || '');
  const [insiderSaving, setInsideSaving] = useState<boolean>(false);

  useEffect(() => {}, []);

  useEffect(() => {
    if (notes.length === 0) {
      dispatch(fetchNotes());
    }
  }, [activeNote, dispatch, notes.length]);

  const extractContent = async (): Promise<string> => {
    if (activeNote?.isMarkdown) {
      return noteContent;
    }

    // for html, need to use editor to serialize the content
    const serialized = await ExtractContentToHtml(editor);
    return serialized;
  }

  const handleSave = async () => {
    if (activeNote) {
      console.log('NoteEditor Start saving note');
      if (props.setIsSaving) {
        props.setIsSaving(true);
      }
      else{
        setInsideSaving(true);
      }

      const updatedNote: Note = {
        ...activeNote,
        date: new Date().toISOString(),
        content: await extractContent(),
        isDraft: false,
      };

      dispatch(updateNote(updatedNote))
        .unwrap()
        .then(() => {
          if (props.isModal && props.onClose) {
            props.onClose(updatedNote);
          } else {
            navigate("/");
          }
        })
        .catch((err) => {
          setError(`Failed to save: ${err.message}`);
        })
        .finally(() => {
          console.log('NoteEditor Finished saving note');
          setInsideSaving(false);
        });
    }
  };

  const handleDelete = () => {
    if (activeNote) {
      setIsDeleting(true);
      dispatch(
        deleteNote({
          localId: activeNote.localId,
          remoteId: activeNote.remoteId,
        })
      )
        .unwrap()
        .then(() => {
          if (props.isModal && props.onClose) {
            props.onClose();
          } else {
            navigate("/");
          }
        })
        .catch((err) => {
          setError(`Failed to delete: ${err.message || "Unknown error"}`);
        })
        .finally(() => {
          setIsDeleting(false);
        });
    }
  };

  const handleBackToList = async () => {
    // Save current note state before going back
    if (activeNote) {
      if (props.isModal && props.onClose) {
        const updatedNote: Note = {
          ...activeNote,
          date: new Date().toISOString(),
          content: await extractContent(),
          isDraft: false
        };
        
        props.onClose(updatedNote);
      } else {
        handleSave();
        navigate("/");
      }
    } else {
      if (props.isModal && props.onClose) {
        props.onClose();
      } else {
        navigate("/");
      }
    }
  };

  const toggleEditingMode = () => {
    setIsEditing((prev) => !prev);
  };

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  if (loading && !activeNote) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!activeNote) {
    return <Typography>Note not found</Typography>;
  }

  // Check if we're in a standalone page (non-modal) by looking at the URL
  const isStandalone = window.location.pathname.startsWith('/note/');

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: props.isModal && !isStandalone ? '100%' : 'calc(100vh - 48px)',
      bgcolor: 'background.paper',
      borderRadius: props.isModal && !isStandalone ? 1 : 0
    }}>
      <AppBar position="static" sx={{ 
        backgroundColor: 'rgba(97, 97, 97, 0.9)', // More gray color
        height: '48px', // Smaller height
        minHeight: '48px'
      }}>
        <Toolbar sx={{ 
          minHeight: '48px !important', 
          height: '48px',
          '& .MuiIconButton-root': { // Adjust icon button size
            padding: '8px'
          },
          '& .MuiTypography-h6': { // Adjust title size
            fontSize: '1.1rem'
          }
        }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBackToList}
            aria-label="back"
          >
            {props.isModal ? <CloseIcon /> : <ArrowBackIcon />}
          </IconButton>

          {isEditingTitle ? (
            <TextField
              autoFocus
              value={activeNote.title}
              onChange={(e) => dispatch(setActiveNote({ ...activeNote, title: e.target.value }))}
              onBlur={() => setIsEditingTitle(false)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  setIsEditingTitle(false);
                }
              }}
              defaultValue={"Enter title here"}
              variant="standard"
              sx={{ flexGrow: 1, color: "white" }}
              InputProps={{
                sx: { color: "white", fontSize: "1.25rem" },
              }}
            />
          ) : (
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, cursor: "pointer" }}
              onClick={() => setIsEditingTitle(true)}
            >
              {activeNote.title || "Untitled Note"}
            </Typography>
          )}

          <IconButton color="inherit" onClick={handleSave} disabled={props.isSaving}>
            {insiderSaving || props.isSaving ? (
              <CircularProgress color="inherit" size={24} />
            ) : (
              <SaveIcon />
            )}
          </IconButton>

          <IconButton color="inherit" onClick={toggleEditingMode}>
            {isEditing ? <VisibilityIcon /> : <EditIcon />}
          </IconButton>

          <IconButton color="inherit" onClick={toggleChat}>
            <ChatIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexGrow: 1,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            p: 2,
            overflow: "auto",
            height: "100%",
            width: incomingText ? "50%" : "100%",
          }}
        >
          {isEditing ? (
            <PlateEditor
              dataRegistry="plate"
              noteContent={!!!activeNote.isMarkdown ? activeNote.content.toString() : noteContent}
              setNoteContent={setNoteContent}
              contentIsHtml={!!!activeNote.isMarkdown}
              setEditor={setEditor}/>
          ) : (
            <Paper elevation={0} sx={{ p: 2, height: '100%', overflow: 'auto' }}>
              {activeNote?.content ? parse(activeNote.content) : 'No content'}
            </Paper>
          )}
        </Box>

        {incomingText && (
          <Box sx={{ width: "50%", p: 2, overflow: "auto", height: "100%" }}>
            <Paper
              elevation={1}
              sx={{ p: 2, height: "100%", overflow: "auto" }}
            >
              {parse(incomingText)}
            </Paper>
          </Box>
        )}
      </Box>

      <Fab
        color="secondary"
        aria-label="delete"
        sx={{ position: "absolute", bottom: 16, right: 16 }}
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <CircularProgress color="inherit" size={24} />
        ) : (
          <DeleteIcon />
        )}
      </Fab>

      <NoteChatBox
        visible={isChatVisible}
        onClose={toggleChat}
        noteContent={activeNote.content}
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
