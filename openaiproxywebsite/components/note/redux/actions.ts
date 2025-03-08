import { Note, NotesActionTypes, remoteToLocalNote, localToRemoteNote } from '../../../types/note';
import { AppDispatch } from '../../../redux/store';
import NotesService from '../../../services/notesService';
import { v4 as uuidv4 } from 'uuid';

// Action Creators
export const fetchNotesRequest = () => ({
  type: NotesActionTypes.FETCH_NOTES_REQUEST,
});

export const fetchNotesSuccess = (notes: Note[]) => ({
  type: NotesActionTypes.FETCH_NOTES_SUCCESS,
  payload: notes,
});

export const fetchNotesFailure = (error: string) => ({
  type: NotesActionTypes.FETCH_NOTES_FAILURE,
  payload: error,
});

export const createNoteRequest = (note: Note) => ({
  type: NotesActionTypes.CREATE_NOTE_REQUEST,
  payload: note,
});

export const createNoteSuccess = (note: Note) => ({
  type: NotesActionTypes.CREATE_NOTE_SUCCESS,
  payload: note,
});

export const createNoteFailure = (error: string) => ({
  type: NotesActionTypes.CREATE_NOTE_FAILURE,
  payload: error,
});

export const updateNoteRequest = (note: Note) => ({
  type: NotesActionTypes.UPDATE_NOTE_REQUEST,
  payload: note,
});

export const updateNoteSuccess = (note: Note) => ({
  type: NotesActionTypes.UPDATE_NOTE_SUCCESS,
  payload: note,
});

export const updateNoteFailure = (error: string) => ({
  type: NotesActionTypes.UPDATE_NOTE_FAILURE,
  payload: error,
});

export const deleteNoteRequest = (noteId: string) => ({
  type: NotesActionTypes.DELETE_NOTE_REQUEST,
  payload: noteId,
});

export const deleteNoteSuccess = (noteId: string) => ({
  type: NotesActionTypes.DELETE_NOTE_SUCCESS,
  payload: noteId,
});

export const deleteNoteFailure = (error: string) => ({
  type: NotesActionTypes.DELETE_NOTE_FAILURE,
  payload: error,
});

export const setActiveNote = (note: Note | null) => ({
  type: NotesActionTypes.SET_ACTIVE_NOTE,
  payload: note,
});

// Get the notes manager instance
const getNotesManager = () => {
  if (typeof window !== 'undefined') {
    return NotesService.getInstance().getNotesManager();
  }
  return null;
};

// Thunk Actions
export const fetchNotes = () => async (dispatch: AppDispatch) => {
  dispatch(fetchNotesRequest());
  try {
    const notesManager = getNotesManager();
    if (!notesManager) {
      throw new Error('Notes manager not available');
    }
    
    const remoteNotes = await notesManager.GetMeNotes();
    const notes = remoteNotes.map(remoteToLocalNote);
    
    dispatch(fetchNotesSuccess(notes));
    if (notes.length > 0) {
      dispatch(setActiveNote(notes[0]));
    }
  } catch (error: unknown) {
    dispatch(fetchNotesFailure(error instanceof Error ? error.message : 'An unknown error occurred'));
  }
};

export const createNote = (note: Note) => async (dispatch: AppDispatch) => {
  dispatch(createNoteRequest(note));
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
    const createdNote = remoteToLocalNote(createdRemoteNote);
    
    dispatch(createNoteSuccess(createdNote));
    dispatch(setActiveNote(createdNote));
  } catch (error: unknown) {
    dispatch(createNoteFailure(error instanceof Error ? error.message : 'An unknown error occurred'));
  }
};

export const updateNote = (note: Note) => async (dispatch: AppDispatch) => {
  dispatch(updateNoteRequest(note));
  try {
    const notesManager = getNotesManager();
    if (!notesManager) {
      throw new Error('Notes manager not available');
    }
    
    // If the note doesn't have a remoteId, create it instead
    if (!note.remoteId) {
      return dispatch(createNote(note));
    }
    
    const remoteNote = localToRemoteNote(note);
    const updatedRemoteNote = await notesManager.UpdateMeNotes(remoteNote);
    const updatedNote = remoteToLocalNote(updatedRemoteNote);
    
    dispatch(updateNoteSuccess(updatedNote));
  } catch (error: unknown) {
    dispatch(updateNoteFailure(error instanceof Error ? error.message : 'An unknown error occurred'));
  }
};

export const deleteNote = (noteId: string, remoteId?: string) => async (dispatch: AppDispatch) => {
  dispatch(deleteNoteRequest(noteId));
  try {
    const notesManager = getNotesManager();
    if (!notesManager) {
      throw new Error('Notes manager not available');
    }
    
    // If there's a remoteId, delete from remote storage
    if (remoteId) {
      await notesManager.DeleteMeNotes(remoteId);
    }
    
    dispatch(deleteNoteSuccess(noteId));
  } catch (error: unknown) {
    dispatch(deleteNoteFailure(error instanceof Error ? error.message : 'An unknown error occurred'));
  }
};
