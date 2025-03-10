import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Note, NotesState, remoteToLocalNote, localToRemoteNote } from '../../../types/note';
import { v4 as uuidv4 } from 'uuid';
import NotesService from '../../../services/notesService';

// Get the notes manager instance
const getNotesManager = () => {
  // We're in a browser environment where window is available
  if (typeof window !== 'undefined') {
    return NotesService.getInstance().getNotesManager();
  }
  return null;
};

export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes', 
  async (_, { rejectWithValue }) => {
    try {
      const notesManager = getNotesManager();
      if (!notesManager) {
        throw new Error('Notes manager not available');
      }
      
      const remoteNotes = await notesManager.GetMeNotes();
      return remoteNotes.map(remoteToLocalNote);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notes');
    }
  }
);

export const createNote = createAsyncThunk(
  'notes/createNote', 
  async (note: Note, { rejectWithValue }) => {
    try {
      const notesManager = getNotesManager();
      if (!notesManager) {
        throw new Error('Notes manager not available');
      }
      
      // Ensure the note has a localId
      if (!note.localId) {
        note.localId = uuidv4();
      }
      
      const remoteNote = localToRemoteNote(note);
      const createdRemoteNote = await notesManager.CreateMeNotes(remoteNote);
      return remoteToLocalNote(createdRemoteNote);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create note');
    }
  }
);

export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async (note: Note, { rejectWithValue }) => {
    try {
      const notesManager = getNotesManager();
      if (!notesManager) {
        throw new Error('Notes manager not available');
      }
      
      // If the note doesn't have a remoteId, create it as a new note
      if (!note.remoteId) {
        // Create a new note directly instead of using createNote thunk
        const remoteNote = localToRemoteNote(note);
        const createdRemoteNote = await notesManager.CreateMeNotes(remoteNote);
        return remoteToLocalNote(createdRemoteNote);
      }
      
      const remoteNote = localToRemoteNote(note);
      const updatedRemoteNote = await notesManager.UpdateMeNotes(remoteNote);
      return remoteToLocalNote(updatedRemoteNote);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update note');
    }
  }
);

export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (note: { localId: string, remoteId?: string }, { rejectWithValue }) => {
    try {
      const notesManager = getNotesManager();
      if (!notesManager) {
        throw new Error('Notes manager not available');
      }
      
      // If there's no remoteId, we can just remove from local state
      if (note.remoteId) {
        await notesManager.DeleteMeNotes(note.remoteId);
      }
      
      return note.localId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete note');
    }
  }
);

const initialState: NotesState = {
  notes: [],
  activeNote: null,
  loading: false,
  error: null,
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setActiveNote: (state, action: PayloadAction<Note | null>) => {
      state.activeNote = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetch notes
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.notes = action.payload;
        state.loading = false;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message || null;
      })
      
      // Handle create note
      .addCase(createNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.notes.push(action.payload);
        state.loading = false;
        state.activeNote = action.payload;
      })
      .addCase(createNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message || null;
      })
      
      // Handle update note
      .addCase(updateNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        const index = state.notes.findIndex(note => note.localId === action.payload.localId);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
        if (state.activeNote?.localId === action.payload.localId) {
          state.activeNote = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message || null;
      })
      
      // Handle delete note
      .addCase(deleteNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter(note => note.localId !== action.payload);
        if (state.activeNote?.localId === action.payload) {
          state.activeNote = null;
        }
        state.loading = false;
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message || null;
      })
  },
});

export const { setActiveNote } = notesSlice.actions;
export default notesSlice.reducer;
