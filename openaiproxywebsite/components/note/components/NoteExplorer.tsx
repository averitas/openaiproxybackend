import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Fab,
  CircularProgress,
  Modal,
  Zoom,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MarkdownIcon from "@mui/icons-material/Code";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../redux/store";
import {
  fetchNotes,
  createNote,
  updateNote,
  syncNotes,
  selectLocalNotes,
  setActiveNote,
} from "../redux/notesSlice";
import { v4 as uuidv4 } from "uuid";
import { Note } from "../../../types/note";
import dynamic from "next/dynamic";
import NoteEditor from "./NoteEditor";

const Layout = dynamic(() => import("react-masonry-list"), {
  ssr: false,
});

interface NoteExplorerProps {
  noteIdToOpen?: string | null;
  setNoteIdToOpen?: (noteId: string | null) => void;
}

const NoteExplorer: React.FC<NoteExplorerProps> = ({
  noteIdToOpen,
  setNoteIdToOpen,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const notes = useSelector(selectLocalNotes);
  const loading = useSelector((state: RootState) => state.notes.loading);
  const activeNote = useSelector((state: RootState) => state.notes.activeNote);
  
  // State for modal editor
  const [openEditor, setOpenEditor] = useState(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isFabHovered, setIsFabHovered] = useState<boolean>(false);

  // Handle opening a note when its ID is passed in
  useEffect(() => {
    if (noteIdToOpen) {
      console.log('Opening note with ID:', noteIdToOpen);
      const foundNote = notes.find(n => n.localId === noteIdToOpen);
      if (foundNote) {
        dispatch(setActiveNote(foundNote));
      }
      setOpenEditor(true);

      // Reset the note ID in the parent to prevent reopening
      if (setNoteIdToOpen) {
        setNoteIdToOpen(null);
      }
    }
  }, [noteIdToOpen, setNoteIdToOpen]);

  const isPortraitOrMobile = useCallback(() => {
    return window.innerHeight > window.innerWidth || window.innerWidth <= 768;
  }, []);

  // Fetch notes on component mount and use syncNotes for better synchronization
  useEffect(() => {
    keepnNotesUpdated();

    // Listen for window resize events
    const handleResize = () => {
      // If we're in modal mode but now in portrait/mobile, redirect to note page
      if (openEditor && activeNote && isPortraitOrMobile()) {
        setOpenEditor(false);
        navigate(`/note/${activeNote.localId}`);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [openEditor, activeNote, isPortraitOrMobile, navigate]);

  const handleCreateNote = () => {
    const newNote: Note = {
      localId: uuidv4(),
      title: "Untitled Note",
      content: "<html><p>Start writing here...</p></html>",
      date: new Date().toISOString(),
      isDraft: true,
      isMarkdown: false,
    };
    setIsCreating(true);
    dispatch(createNote(newNote))
      .then((action) => {
        // Properly type the payload to fix the "unknown" type error
        const createdNote = action.payload as Note;
        dispatch(setActiveNote(createdNote));
        if (isPortraitOrMobile()) {
          navigate(`/note/${createdNote.localId}`);
        } else {
          setOpenEditor(true);
        }
      })
      .catch((error) => {
        console.error("Failed to create note:", error);
      })
      .finally(() => {
        setIsCreating(false);
      });
  };

  const keepnNotesUpdated = () => {
    setIsSaving(true);
    dispatch(syncNotes())
    .then(() => {
      setIsSaving(false);
    });
  };

  const handleCreatePlateJsonNote = () => {
    const newNote: Note = {
      localId: uuidv4(),
      title: "Untitled Plate JSON Note",
      content: "[{\"type\":\"p\",\"children\":[{\"text\":\"Start writing here...\"}]}]",
      date: new Date().toISOString(),
      isDraft: true,
      isMarkdown: true,
    };
    setIsCreating(true);
    dispatch(createNote(newNote))
      .then((action) => {
        const createdNote = action.payload as Note;
        dispatch(setActiveNote(createdNote));
        if (isPortraitOrMobile()) {
          navigate(`/note/${createdNote.localId}`);
        } else {
          setOpenEditor(true);
        }
      })
      .catch((error) => {
        console.error("Failed to create markdown note:", error);
      })
      .finally(() => {
        setIsCreating(false);
      });
  };

  const handleNoteClick = (noteId: Note) => {
    console.log('Opening note:', noteId);
    dispatch(setActiveNote(noteId));
    
    if (isPortraitOrMobile()) {
      // Navigate to note editor directly in portrait/mobile mode
      navigate(`/note/${noteId.localId}`);
    } else {
      // Open modal in landscape/desktop mode
      setOpenEditor(true);
    }
  };

  const handleCloseEditor = (note?: Note) => {
    console.log('NoteExplorer Start saving note');
    // If note provided, save it before closing
    if (note) {
      setIsSaving(true);
      dispatch(
        updateNote({
          ...note,
          date: new Date().toISOString(),
        })
      )
      .then(() => {
        // Refresh notes when editor is closed
        setOpenEditor(false);
        dispatch(setActiveNote(null));
      })
      .catch((error) => {
        console.error("Failed to save note:", error);
      })
      .finally(() => {
        setOpenEditor(false);
        dispatch(setActiveNote(null));
        keepnNotesUpdated();
        console.log('NoteExplorer saved Finished saving note');
      });
    } else {
      // Just refresh notes and close editor if no save needed
      keepnNotesUpdated();
      setOpenEditor(false);
      dispatch(setActiveNote(null));
      console.log('NoteExplorer not saving Finished saving note');
    }
  };

  const getNoteText = (note: Note) => {
    let result = "";

    const dfs = (node) => {
      result += node.text ? node.text + " " : "";

      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          dfs(child);
        }
      }
    };

    try {
      const contentObj = JSON.parse(note.content);

      dfs({ children: contentObj });
      return result;
    } catch (error) {
      return note.content;
    }
  };

  if (loading && notes.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 64px)",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
        position: "relative",
      }}
    >
      {isSaving && (
        <LinearProgress
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            zIndex: 1000
          }}
        />
      )}
      <Container
        maxWidth="lg"
        sx={{
          mt: 1,
          mb: 1,
          flexGrow: 1,
          overflow: "auto",
          filter: openEditor ? "blur(5px)" : "none",
          transition: "filter 0.3s ease",
          height: "calc(100vh - 64px)",
        }}
      >
        <Layout
          minWidth={100}
          gap={24}
          items={notes.map((note: Note) => (
            <Card
              key={note.localId}
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                marginBottom: 2,
                "&:hover": {
                  boxShadow: 6,
                },
              }}
            >
              <CardActionArea
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
                onClick={() => handleNoteClick(note)}
              >
                <CardContent sx={{ flexGrow: 1, width: "100%" }}>
                  <Typography gutterBottom variant="h5" component="div" noWrap>
                    {note.title || "Untitled Note"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {getNoteText(note)
                      .replace(/<[^>]*>?/gm, "")
                      .substring(0, 100)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 2, display: "block" }}
                  >
                    {new Date(note.date).toLocaleString()}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        />
      </Container>

      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          zIndex: openEditor ? 0 : 1,
        }}
        onMouseEnter={() => setIsFabHovered(true)}
        onMouseLeave={() => setIsFabHovered(false)}
      >
        <Zoom in={isFabHovered} timeout={300}>
          <Tooltip title="Create Markdown Note" placement="left">
            <Fab
              color="primary"
              aria-label="add markdown"
              size="medium"
              onClick={handleCreatePlateJsonNote}
            >
              <MarkdownIcon />
            </Fab>
          </Tooltip>
        </Zoom>
        <Fab color="secondary" aria-label="add" onClick={handleCreateNote}>
          {isCreating ? (
            <CircularProgress color="inherit" size={24} />
          ) : (
            <AddIcon />
          )}
        </Fab>
      </Box>

      {/* Modal for Note Editor */}
      <Modal
        open={openEditor}
        onClose={() => !isSaving && handleCloseEditor()} // Prevent closing during save
        closeAfterTransition
        slotProps={{
          backdrop: {
            timeout: 500,
            sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          },
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // The modal content needs to be above the backdrop
          zIndex: 2,
        }}
      >
        <Box
          onClick={(e) => e.stopPropagation()} // Prevent click from closing modal when clicking inside
          sx={{
            width: "80%",
            height: "80%",
            bgcolor: "background.paper",
            borderRadius: 1,
            boxShadow: 24,
            outline: "none",
            overflow: "hidden",
            // Ensure the background is completely opaque
            backgroundColor: "white",
            // Apply a higher z-index to appear above the backdrop
            position: "relative",
            zIndex: 3,
          }}
        >
          {activeNote && (
            <NoteEditor
              onClose={handleCloseEditor}
              isModal={true}
              isSaving={isSaving}
              setIsSaving={setIsSaving}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default NoteExplorer;
