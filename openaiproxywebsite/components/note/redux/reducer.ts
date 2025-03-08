import { NotesActionTypes, NotesState } from '../../../types/note';

// Define a base Action interface
interface Action {
  type: string;
  payload?: any;
}

const initialState: NotesState = {
  notes: [],
  activeNote: null,
  loading: false,
  error: null,
};

const notesReducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case NotesActionTypes.FETCH_NOTES_REQUEST:
    case NotesActionTypes.CREATE_NOTE_REQUEST:
    case NotesActionTypes.UPDATE_NOTE_REQUEST:
    case NotesActionTypes.DELETE_NOTE_REQUEST:
      return { ...state, loading: true, error: null };

    case NotesActionTypes.FETCH_NOTES_SUCCESS:
      return {
        ...state,
        notes: action.payload,
        loading: false,
      };

    case NotesActionTypes.CREATE_NOTE_SUCCESS:
      return {
        ...state,
        notes: [...state.notes, action.payload],
        loading: false,
      };

    case NotesActionTypes.UPDATE_NOTE_SUCCESS:
      return {
        ...state,
        notes: state.notes.map(note =>
          note.localId === action.payload.localId ? action.payload : note
        ),
        loading: false,
        activeNote: state.activeNote?.localId === action.payload.localId 
          ? action.payload 
          : state.activeNote,
      };

    case NotesActionTypes.DELETE_NOTE_SUCCESS:
      return {
        ...state,
        notes: state.notes.filter(note => note.localId !== action.payload),
        loading: false,
        activeNote: state.activeNote?.localId === action.payload 
          ? null 
          : state.activeNote,
      };

    case NotesActionTypes.FETCH_NOTES_FAILURE:
    case NotesActionTypes.CREATE_NOTE_FAILURE:
    case NotesActionTypes.UPDATE_NOTE_FAILURE:
    case NotesActionTypes.DELETE_NOTE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case NotesActionTypes.SET_ACTIVE_NOTE:
      return { ...state, activeNote: action.payload };

    default:
      return state;
  }
};

export default notesReducer;
