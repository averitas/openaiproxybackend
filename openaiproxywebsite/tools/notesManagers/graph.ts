// Copyright (c) Microsoft.
// Licensed under the MIT license.

import { Client } from '@microsoft/microsoft-graph-client';
import * as msal from "@azure/msal-browser";
import { RemoteNote } from '../../types/note';
import { NotesManager } from './notesManager';
import { B2CClient, config } from '../msal';

interface fetchResponse {
    "@odata.nextLink": string,
    "@odata.context": string,
    value: RemoteNote[]
}

export class GraphNotesManager implements NotesManager {
    private graphClient: Client;
    private publicClient: msal.PublicClientApplication;
    private token: string = "";
    private email: string = "";
    private authResult: msal.AuthenticationResult | undefined;
    private isSignedIn: boolean = false;

    constructor(publicClient: msal.PublicClientApplication) {
        this.graphClient = Client.initWithMiddleware({
            authProvider: {
              getAccessToken: async () => {
                const tokenRes = await this.TryGetToken(publicClient);
                return tokenRes;
              }
            },
        });
        this.publicClient = publicClient;
    }

    public async GetAvatar(): Promise<Blob> {
        const resp = await this.graphClient
            .api('me/photo/$value')
            .get();
        return resp;
    }

    public async GetMeNotes(): Promise<RemoteNote[]> {
        var resp: fetchResponse = await this.graphClient
            .api('me/MailFolders/notes/messages')
            .get();
        var rawNotes: RemoteNote[] = resp.value;

        while (resp['@odata.nextLink']) {
            resp = await fetch(resp['@odata.nextLink'], {
                method: 'GET',
                headers: {
                    'Content-Type':'application/json',
                    'Authorization': 'Bearer ' + this.token}
              })
              .then(response => response.json());
            rawNotes.push(...resp.value);
            console.log("GetMeNotes for loop get response: " + resp);
        }

        return rawNotes;
    }

    public async UpdateMeNotes(note: RemoteNote): Promise<RemoteNote> {
        const resp: RemoteNote = await this.graphClient
            .api('me/MailFolders/notes/messages/' + note.id)
            .patch(note);
        console.log("UpdateMeNotes response: " + resp);
        return resp;
    }

    public async CreateMeNotes(note: RemoteNote): Promise<RemoteNote> {
        const resp: RemoteNote = await this.graphClient
            .api('me/MailFolders/notes/messages')
            .post(note);
        console.log("CreateMeNotes response: " + resp);
        return resp;
    }

    public async DeleteMeNotes(noteId: string) {
        const resp = await this.graphClient
            .api('me/MailFolders/notes/messages/' + noteId)
            .delete();
        console.log("DeleteMeNotes response: " + resp);
        return resp;
    }

    private async TryGetToken(client: msal.PublicClientApplication): Promise<string> {
        const loginRequest = {
            scopes: config.auth.scopes,
        };
        try {
            const tokenRes = await client.acquireTokenSilent(loginRequest)
            .then(tokenResponse => {
                this.authResult = tokenResponse
                this.token = this.authResult.accessToken
                this.email = tokenResponse.account?.username ?? "Anonymous"
                this.isSignedIn = true
                return true;
            }).catch(async (error) => {
                if (error instanceof msal.InteractionRequiredAuthError) {
                    // fallback to interaction when silent call fails
                    await client.acquireTokenPopup(loginRequest).then(res => {
                        this.authResult = res
                        this.token = this.authResult.accessToken
                        this.email = res.account?.username ?? "Anonymous"
                        this.isSignedIn = true
                    })
                    .catch(err => {
                        console.warn('UserManager.acquireTokenPopup error: ' + err)
                        throw new Error('UserManager.acquireTokenPopup error: ' + err)
                    })
                    return true
                }
                else {
                    await client.loginPopup(loginRequest).then(res => {
                        this.authResult = res
                        this.token = this.authResult.accessToken
                        this.email = res.account?.username ?? "Anonymous"
                        this.isSignedIn = true
                    })
                    .catch(err => {
                        console.warn('UserManager.loginPopup error: ' + err)
                        throw new Error('UserManager.loginPopup error: ' + err)
                    })
                    return true
                }
            });
            console.log("GraphNotesManager getAccessToken response: " + tokenRes);
            return this.token;
        } catch (error) {
            console.warn("GraphNotesManager getAccessToken error: " + error);
            return "";
        }
    }
}
