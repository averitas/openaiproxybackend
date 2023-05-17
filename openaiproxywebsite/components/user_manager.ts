class UserManager extends EventTarget {
    static USER_CHANGE_EVENT: 'userChange'

    static instance: UserManager

    isSignedIn: boolean
    id: string
    username: string
    email: string

    constructor() {
        super()

        this.isSignedIn = false
        this.id = ''
        this.username = 'Unknown User'
        this.email = ''
    }

    get shortName() {
        return this.username
            .split(' ')
            .filter(item => item.length > 0)
            .map(item => item[0])
            .join('')
            .substring(0, 2);
    }

    signIn(username: string, password: string) {
        // do the sign in ajax

        this.isSignedIn = true
        this.id = '65535'
        this.username = username
        this.email = ''
        this.dispatchEvent(new Event(UserManager.USER_CHANGE_EVENT))
    }
}

UserManager.instance = new UserManager()

export default UserManager