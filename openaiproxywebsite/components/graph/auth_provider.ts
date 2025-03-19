import { protectedResources } from "../auth/auth_config"
import UserManager from "../auth/user_manager"
import * as msal from "@azure/msal-browser";

export default class AuthProvider {
    static instance: AuthProvider

    authResult: msal.AuthenticationResult | undefined

    async getAccessToken() {
        try {
            this.authResult = await UserManager.instance.acquireTokenSlient(protectedResources.graphMe.scopes)
            // console.debug('Get graph token: ' + this.authResult?.accessToken)
            return this.authResult?.accessToken ?? ''
        }
        catch (err) {
            console.error('Get graph token error: ' +  err)
        }

        return ''
    }
}

AuthProvider.instance = new AuthProvider()
