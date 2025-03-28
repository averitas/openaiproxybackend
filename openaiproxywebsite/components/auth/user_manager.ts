import * as msal from "@azure/msal-browser";
import { loginRequest, msalConfig } from "./auth_config";
import { MsalAuthenticationResult } from "@azure/msal-react";

class UserManager extends EventTarget {
    static USER_CHANGE_EVENT: 'userChange'

    static instance: UserManager

    isSignedIn: boolean
    id: string
    email: string
    msalInstance: msal.PublicClientApplication
    authResult: msal.AuthenticationResult | undefined
    isInited: boolean = false
    private tokenRefreshInterval: NodeJS.Timer | null = null
    private readonly TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000 // 15 minutes

    constructor() {
        super()

        this.isSignedIn = false
        this.id = ''
        this.email = 'Anonymous'
        this.msalInstance = new msal.PublicClientApplication(msalConfig);
    }

    private async startTokenRefresh() {
        // Clear any existing interval
        if (this.tokenRefreshInterval) {
            clearInterval(this.tokenRefreshInterval);
        }

        // Set up new refresh interval
        this.tokenRefreshInterval = setInterval(async () => {
            try {
                const response = await this.msalInstance.acquireTokenSilent(loginRequest);
                this.authResult = response;
                console.log('Token refreshed successfully');
            } catch (error) {
                console.error('Failed to refresh token:', error);
                // If silent refresh fails, we don't want to interrupt the user with popups
                // The next API call will handle the token refresh with user interaction if needed
            }
        }, this.TOKEN_REFRESH_INTERVAL);
    }

    async init() {
        if (this.isInited) {
            return
        }
        // query user sign in session(cookie) in server
        console.log('init user manager')
        await this.msalInstance.initialize()
        const accounts = this.msalInstance.getAllAccounts()
        if (accounts.length > 0) {
            console.log('init set email to ' + accounts[0].username)
            this.email = accounts[0].username
            this.msalInstance.setActiveAccount(accounts[0])
            await this.msalInstance.acquireTokenSilent(loginRequest).then(res => {
                this.authResult = res
                this.isSignedIn = true
                this.email = this.authResult.account?.username ?? 'Anonymous'
                // Start token refresh after successful sign in
                this.startTokenRefresh()
            })
            .catch(err => {
                console.log('No account cache or cache is out of date: ' + err)
            })
        }
        this.dispatchEvent(new Event(UserManager.USER_CHANGE_EVENT))
        this.isInited = true
    }

    async acquireTokenSlient(scopes: string[]) {
        const accounts = this.msalInstance.getAllAccounts()
        if (accounts.length > 0) {
            this.msalInstance.setActiveAccount(accounts[0])
            return await this.msalInstance.acquireTokenSilent({scopes: scopes})
        }

        return undefined
    }

    async signIn(email: string, password: string) {
        // query the sign in API

        this.isSignedIn = true
        this.id = '65535'
        this.email = email
        this.dispatchEvent(new Event(UserManager.USER_CHANGE_EVENT))

        return true
    }

    async signInMsal() {
        await this.msalInstance.acquireTokenSilent(loginRequest)
        .then(tokenResponse => {
            this.authResult = tokenResponse
            this.email = tokenResponse.account?.username ?? "Anonymous"
            this.isSignedIn = true
            this.startTokenRefresh()
            this.dispatchEvent(new Event(UserManager.USER_CHANGE_EVENT))

            return true;
        }).catch(async (error) => {
            if (error instanceof msal.InteractionRequiredAuthError) {
                // fallback to interaction when silent call fails
                await this.msalInstance.acquireTokenPopup(loginRequest).then(res => {
                    this.authResult = res
                    this.email = res.account?.username ?? "Anonymous"
                    this.isSignedIn = true
                    this.startTokenRefresh()
                    this.dispatchEvent(new Event(UserManager.USER_CHANGE_EVENT))
                })
                .catch(err => {
                    console.warn('UserManager.acquireTokenPopup error: ' + err)
                })
                return true
            }
            else {
                this.msalInstance.loginPopup(loginRequest).then(res => {
                    this.authResult = res
                    this.email = res.account?.username ?? "Anonymous"
                    this.isSignedIn = true
                    this.startTokenRefresh()
                    this.dispatchEvent(new Event(UserManager.USER_CHANGE_EVENT))
                })
                .catch(err => {
                    console.warn('UserManager.loginPopup error: ' + err)
                })
                return true
            }
        })

        return true;
    }

    async signOut() {
        // remove user sign in session in server
        if (this.tokenRefreshInterval) {
            clearInterval(this.tokenRefreshInterval);
            this.tokenRefreshInterval = null;
        }
        try {
            await this.msalInstance.logoutPopup({'postLogoutRedirectUri': '/'})
            this.authResult = undefined
            this.email = 'Anonymous';
            this.isSignedIn = false;
            this.dispatchEvent(new Event(UserManager.USER_CHANGE_EVENT))
        }
        catch (err) {
            console.warn('Logout cancelled: ' + err)
        }

        return true
    }

    printToken() {
        console.log('Print token: ' + this.authResult?.accessToken);
    }

    async signUp(email: string, password: string) {
        // send mail to user email address

        return true
    }

    async confirmSignUp(email: string, rand: string) {
        // query the sign up confirmation API

        return true
    }

    async sendResetPasswordMail(email: string) {
        // send reset password mail

        return true
    }

    async resetPassword(email: string, password: string, rand: string) {
        // query the reset password API

        return true
    }
}

UserManager.instance = new UserManager()

export default UserManager
