// Set the authProvider to an instance

import { Client, ClientOptions, ResponseType, GraphError } from "@microsoft/microsoft-graph-client";
import * as msal from "@azure/msal-browser";
import { protectedResources } from "../auth/auth_config";
import AuthProvider from "./auth_provider";

class GraphClient {
    static instance: GraphClient
    authResult: msal.AuthenticationResult | undefined
    client: Client

    constructor() {
        this.client = Client.initWithMiddleware({
            authProvider: AuthProvider.instance,
        });
    }

    async GetUserPicUrl() {
        try {
            const response = await this.client.api('/me/photo/$value')
                .responseType(ResponseType.BLOB)
                .get();
            const url = window.URL || window.webkitURL;
            return url.createObjectURL(response.data);
        }
        catch (err) {
            if (err instanceof GraphError) {
                if (err.statusCode != 404) {
                    throw err
                }
                else {
                    console.warn("This user hasn't set icon yet.")
                }
            } else {
                throw err;
            }
        }

        return undefined
    }
}

GraphClient.instance = new GraphClient()

export default GraphClient
