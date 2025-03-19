import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Note, NotesState, remoteToLocalNote, localToRemoteNote } from '../../../types/note';
import { v4 as uuidv4 } from 'uuid';
import NotesService from '../../../services/notesService';
import { RootState } from '@/redux/store';

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
      const localNotes = remoteNotes.map(remoteToLocalNote);
      return localNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

// Sync notes action to compare local and remote notes
export const syncNotes = createAsyncThunk(
  'notes/syncNotes',
  async (_, { getState, dispatch }) => {
    try {
      console.log('Running sync')
      const notesManager = getNotesManager();
      const response = await notesManager?.GetMeNotes();
      const remoteNotes = response?.map(remote => remoteToLocalNote(remote)) || [];
      const localNotes = selectLocalNotes(getState() as RootState);
      
      // Compare local and remote notes
      const mergedNotes = mergeNotes(localNotes, remoteNotes);
      
      // Update any out-of-sync notes with the server
      for (const note of mergedNotes.notesToUpdate) {
        await dispatch(updateNote(note))
      }
      
      // Push any new local notes to the server
      for (const note of mergedNotes.notesToCreate) {
        await dispatch(createNote(note));
      }
      
      // Get the final updated list
      const responseLater = await notesManager?.GetMeNotes();
      const updatedNotes = responseLater?.map(remote => remoteToLocalNote(remote)) || [];
      return updatedNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      throw error;
    }
  }
);

// Helper function to merge local and remote notes
function mergeNotes(localNotes: Note[], remoteNotes: Note[]) {
  const notesToUpdate: Note[] = [];
  const notesToCreate: Note[] = [];
  const finalNotes: Note[] = [];
  
  // Process local notes
  localNotes.forEach(localNote => {
    // Check if note exists on remote
    const remoteNote = remoteNotes.find(remote => 
      remote.remoteId && remote.remoteId === localNote.remoteId
    );
    
    if (remoteNote) {
      // Compare timestamps to see which is newer
      const localDate = new Date(localNote.date).getTime();
      const remoteDate = new Date(remoteNote.date).getTime();
      
      if (localDate > remoteDate) {
        // Local is newer, update remote
        notesToUpdate.push(localNote);
        finalNotes.push(localNote);
      } else {
        // Remote is newer or same, use remote
        finalNotes.push(remoteNote);
      }
    } else {
      // Local note doesn't exist on remote, create it
      if (!localNote.remoteId) {
        notesToCreate.push(localNote);
      }
      finalNotes.push(localNote);
    }
  });
  
  // Check for remote notes that don't exist locally
  remoteNotes.forEach(remoteNote => {
    const exists = finalNotes.some(note => 
      note.remoteId && note.remoteId === remoteNote.remoteId
    );
    
    if (!exists) {
      finalNotes.push(remoteNote);
    }
  });
  
  return {
    finalNotes,
    notesToUpdate,
    notesToCreate
  };
}

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
    updateActiveNoteContent: (state, action: PayloadAction<{ content: string }>) => {
      if (state.activeNote) {
        state.activeNote.content = action.payload.content;
        state.activeNote.date = new Date().toISOString();
      }
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
      
      // Add cases for syncNotes
      .addCase(syncNotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(syncNotes.fulfilled, (state, action) => {
        state.notes = action.payload;
        state.loading = false;
      })
      .addCase(syncNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      });
  },
});

export const selectLocalNotes = (state: RootState) => state.notes.notes;
export const selectActiveNote = (state: RootState) => state.notes.activeNote;

export const { setActiveNote, updateActiveNoteContent } = notesSlice.actions;
export default notesSlice.reducer;
