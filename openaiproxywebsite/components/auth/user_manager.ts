class UserManager extends EventTarget {
    static USER_CHANGE_EVENT: 'userChange'

    static instance: UserManager

    isSignedIn: boolean
    id: string
    email: string

    constructor() {
        super()

        this.isSignedIn = false
        this.id = ''
        this.email = 'user@example.com'
    }

    init() {
        // query user sign in session(cookie) in server
    }

    async signIn(email: string, password: string) {
        // query the sign in API

        this.isSignedIn = true
        this.id = '65535'
        this.email = email
        this.dispatchEvent(new Event(UserManager.USER_CHANGE_EVENT))

        return true
    }

    async signOut() {
        // remove user sign in session in server

        return true
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