import { RemoteNote } from "../../types/note";

export interface NotesManager {
    GetAvatar: () => Promise<Blob>;
    GetMeNotes: () => Promise<RemoteNote[]>;
    UpdateMeNotes: (note: RemoteNote) => Promise<RemoteNote>;
    CreateMeNotes: (note: RemoteNote) => Promise<RemoteNote>;
    DeleteMeNotes: (noteId: string) => Promise<any>;
}
