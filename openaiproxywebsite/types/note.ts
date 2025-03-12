export interface RemoteNote {
    id: string;
    subject: string;
    body: {
        content: string;
        contentType: string;
    };
    createdDateTime?: string;
    lastModifiedDateTime?: string;
    categories?: string[];
    importance?: string;
    isDraft?: boolean;
    isRead?: boolean;
    hasAttachments?: boolean;
    webLink?: string;
    parentFolderId?: string;
    conversationId?: string;
    conversationIndex?: string;
}

export const HiddenCategoryPrefix = "#sys:"

export const MarkdownCategory = `${HiddenCategoryPrefix}Markdown`;

export interface Note {
    localId: string;
    remoteId?: string; // ID from the remote source if synced
    title: string;
    content: string;
    date: string;
    isDraft: boolean;
    isMarkdown?: boolean;
    categories?: string[];
}

export enum NotesActionTypes {
    FETCH_NOTES_REQUEST = 'FETCH_NOTES_REQUEST',
    FETCH_NOTES_SUCCESS = 'FETCH_NOTES_SUCCESS',
    FETCH_NOTES_FAILURE = 'FETCH_NOTES_FAILURE',
    CREATE_NOTE_REQUEST = 'CREATE_NOTE_REQUEST',
    CREATE_NOTE_SUCCESS = 'CREATE_NOTE_SUCCESS',
    CREATE_NOTE_FAILURE = 'CREATE_NOTE_FAILURE',
    UPDATE_NOTE_REQUEST = 'UPDATE_NOTE_REQUEST',
    UPDATE_NOTE_SUCCESS = 'UPDATE_NOTE_SUCCESS',
    UPDATE_NOTE_FAILURE = 'UPDATE_NOTE_FAILURE',
    DELETE_NOTE_REQUEST = 'DELETE_NOTE_REQUEST',
    DELETE_NOTE_SUCCESS = 'DELETE_NOTE_SUCCESS',
    DELETE_NOTE_FAILURE = 'DELETE_NOTE_FAILURE',
    SET_ACTIVE_NOTE = 'SET_ACTIVE_NOTE',
}

export interface NotesState {
    notes: Note[];
    activeNote: Note | null;
    loading: boolean;
    error: string | null;
}

// Conversion utilities between local and remote notes
export const remoteToLocalNote = (remoteNote: RemoteNote): Note => {
    return {
        localId: remoteNote.id,
        remoteId: remoteNote.id,
        title: remoteNote.subject,
        content: remoteNote.body.content,
        date: remoteNote.lastModifiedDateTime || remoteNote.createdDateTime || new Date().toISOString(),
        isDraft: false,
        isMarkdown: remoteNote.categories ? remoteNote.categories.includes(MarkdownCategory) : false,
        categories: remoteNote.categories?.filter(c => !c.startsWith(HiddenCategoryPrefix)) ?? []
    };
};

export const localToRemoteNote = (note: Note): RemoteNote => {
    let categories = note.categories ? note.categories.filter(c => !c.startsWith(HiddenCategoryPrefix)) : [];
    if (note.isMarkdown) {
        categories = [...categories, MarkdownCategory];
    }
    return {
        id: note.remoteId || '',
        subject: note.title,
        body: {
            content: note.content,
            contentType: 'text'
        },
        categories: categories,
    };
};
