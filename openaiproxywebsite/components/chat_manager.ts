import ChatSession from './chat_session'

const HISTORY_STORAGE_KEY = 'openaiproxy_histories'

/**
 * chat session persistent class
 */
class ChatManager extends EventTarget {
    static ACTIVE_SESSION_CHANGE_EVENT: 'activeSessionChange'
    static SESSIONS_CHANGE_EVENT: 'session_change'

    static instance: ChatManager

    /**
     * persistent when messages change
     */
    static messagesChangeHandler() {
        ChatManager.instance.save()
    }

    activeSession: ChatSession

    loaded: bool

    /**
     * use session name as index
     */
    sessions: Map<string, ChatSession>

    constructor() {
        super()

        this.sessions = new Map()
        // create an init session
        this.createSession()
        this.activeSession = this.sessions.values().next().value
        this.loaded = false
    }

    save() {
        if (!global.window || !this.loaded) {
            return
        }

        const historyJson = JSON.stringify({
            sessions: Array.from(this.sessions.values()).map(session => session.toObj()),
            activeSession: this.activeSession.name
        })

        global.window.localStorage.setItem(HISTORY_STORAGE_KEY, historyJson)
    }

    load() {
        if (!global.window) {
            return
        }

        this.loaded = true
        const historyJson = global.window.localStorage.getItem(HISTORY_STORAGE_KEY)

        if (historyJson) {
            const historyObj = JSON.parse(historyJson)
            const sessionsArr: ChatSession[] = historyObj.sessions.map((sessionObj: any) => ChatSession.fromObj(sessionObj))
            this.sessions = new Map()
            sessionsArr.forEach(session => {
                this.sessions.set(session.name, session)
                session.addEventListener(ChatSession.MESSAGES_CHANGE_EVENT, ChatManager.messagesChangeHandler)
            })
            if (this.sessions.size === 0) {
                this.createSession()
            }
            this.activeSession = this.getFirstSession()
            this.setActiveSession(historyObj.activeSession)
            this.dispatchEvent(new Event(ChatManager.SESSIONS_CHANGE_EVENT))
        } else {
            // invoke for default session
            this.dispatchEvent(new Event(ChatManager.SESSIONS_CHANGE_EVENT))
            this.dispatchEvent(new Event(ChatManager.ACTIVE_SESSION_CHANGE_EVENT))
            throw new Error('History storage is empty');
        }
    }

    clean() {
        Array.from(this.sessions.values()).forEach(session => {
            session.removeEventListener(ChatSession.MESSAGES_CHANGE_EVENT, ChatManager.messagesChangeHandler)
        });
        this.sessions = new Map()
        // create an init session
        this.createSession()
        this.activeSession = this.getFirstSession()
        this.save()
        this.dispatchEvent(new Event(ChatManager.SESSIONS_CHANGE_EVENT))
    }

    createSession() {
        let seqId = 0
        while (this.sessions.has(`Session ${seqId}`)) {
            seqId++
        }
        const newSession = new ChatSession('', `Session ${seqId}`)
        this.sessions.set(newSession.name, newSession)
        this.activeSession = newSession
        this.save()
        newSession.addEventListener(ChatSession.MESSAGES_CHANGE_EVENT, ChatManager.messagesChangeHandler)
        this.dispatchEvent(new Event(ChatManager.SESSIONS_CHANGE_EVENT))
        this.dispatchEvent(new Event(ChatManager.ACTIVE_SESSION_CHANGE_EVENT))
    }

    getSession(name: string) {
        return this.sessions.get(name)
    }

    getSessions() {
        return Array.from(this.sessions.values())
    }

    getFirstSession() {
        return this.sessions.values().next().value
    }

    removeSession(name: string) {
        if (this.sessions.size > 1) {
            const removedSession = this.sessions.get(name)
            if (removedSession) {
                removedSession.removeEventListener(ChatSession.MESSAGES_CHANGE_EVENT, ChatManager.messagesChangeHandler)

                this.sessions.delete(name)
                if (this.activeSession.name === name) {
                    this.activeSession = this.sessions.values().next().value
                }
                this.save()
                this.dispatchEvent(new Event(ChatManager.SESSIONS_CHANGE_EVENT))
            }
        } else {
            throw new Error('Cannot remove the only session')
        }
    }

    setActiveSession(name: string) {
        const newActiveSession = this.sessions.get(name)
        if (newActiveSession) {
            this.activeSession = newActiveSession
        }
        this.save()
        this.dispatchEvent(new Event(ChatManager.ACTIVE_SESSION_CHANGE_EVENT))
    }
}

ChatManager.instance = new ChatManager()

export default ChatManager