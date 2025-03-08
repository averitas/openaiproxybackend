import * as msal from "@azure/msal-browser";
import { GraphNotesManager } from "../tools/notesManagers/graph";
import { config } from "../tools/msal";
import UserManager from "@/components/auth/user_manager";

class NotesService {
    private static instance: NotesService;
    private msalInstance: msal.PublicClientApplication;
    private notesManager: GraphNotesManager | null = null;

    private constructor() {
        // Initialize MSAL
        // this.msalInstance = new msal.PublicClientApplication({
        //     auth: {
        //         clientId: config.auth.clientId,
        //         authority: config.auth.authority,
        //         redirectUri: window.location.origin
        //     },
        //     cache: {
        //         cacheLocation: "localStorage",
        //         storeAuthStateInCookie: true
        //     }
        // });
        this.msalInstance = UserManager.instance.msalInstance;
        UserManager.instance.init();
    }

    public static getInstance(): NotesService {
        if (!NotesService.instance) {
            NotesService.instance = new NotesService();
        }
        return NotesService.instance;
    }

    public getNotesManager(): GraphNotesManager {
        if (!this.notesManager) {
            this.notesManager = new GraphNotesManager(this.msalInstance);
        }
        return this.notesManager;
    }

    public getMsalInstance(): msal.PublicClientApplication {
        return this.msalInstance;
    }
}

export default NotesService;
