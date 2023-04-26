import { EventEmitter } from 'stream'
import ChatSession from './chat_session'

const HISTORY_STORAGE_KEY = 'openaiproxy_histories'

/**
 * chat session persistent class
 */
class ChatManager extends EventEmitter {
    static ACTIVE_SESSION_CHANGE_EVENT: 'activeSessionChange'
    static SESSIONS_CHANGE_EVENT: 'session_change'

    static instance: ChatManager

    activeSession: ChatSession

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
    }

    save() {
        const historyJson = JSON.stringify({
            sessions: Array.from(this.sessions.values()).map(session => session.toObj()),
            activeSession: this.activeSession.name
        })

        localStorage.setItem(HISTORY_STORAGE_KEY, historyJson)
    }

    load() {
        const historyJson = localStorage.getItem(HISTORY_STORAGE_KEY)

        if (historyJson) {
            const historyObj = JSON.parse(historyJson)
            const sessionsArr: ChatSession[] = historyObj.sessions.map((sessionObj: any) => ChatSession.fromObj(sessionObj))
            this.sessions = new Map()
            sessionsArr.forEach(session => {
                this.sessions.set(session.id, session)
            })
            if (this.sessions.size === 0) {
                this.createSession()
            }
            this.activeSession = this.getFirstSession()
            this.emit(ChatManager.SESSIONS_CHANGE_EVENT)
            this.setActiveSession(historyObj.activeSession)
        } else {
            throw new Error('History storage is empty');
        }
    }

    clean() {
        this.sessions = new Map()
        // create an init session
        this.createSession()
        this.activeSession = this.getFirstSession()
        this.emit(ChatManager.SESSIONS_CHANGE_EVENT)
    }

    createSession() {
        let seqId = 0
        while (this.sessions.has(`Session ${seqId}`)) {
            seqId++
        }
        const newSession = new ChatSession('', `Session ${seqId}`)
        this.sessions.set(newSession.name, newSession)
        this.activeSession = newSession
        this.emit(ChatManager.SESSIONS_CHANGE_EVENT)
        this.emit(ChatManager.ACTIVE_SESSION_CHANGE_EVENT)
    }

    getSession(name: string) {
        return this.sessions.get(name)
    }

    getFirstSession() {
        return this.sessions.values().next().value
    }

    removeSession(name: string) {
        if (this.sessions.size > 1) {
            this.sessions.delete(name)
            if (this.activeSession.name === name) {
                this.activeSession = this.sessions.values().next().value
            }
            this.emit(ChatManager.SESSIONS_CHANGE_EVENT)
        } else {
            throw new Error('Cannot remove the only session')
        }
    }

    setActiveSession(name: string) {
        const newActiveSession = this.sessions.get(name)
        if (newActiveSession) {
            this.activeSession = newActiveSession
        }
        this.emit(ChatManager.ACTIVE_SESSION_CHANGE_EVENT)
    }
}

ChatManager.instance = new ChatManager()

export default ChatManager