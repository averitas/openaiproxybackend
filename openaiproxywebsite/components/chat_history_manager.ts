import ChatSession from './chat_session'

const HISTORY_STORAGE_KEY = 'openaiproxy_histories'

/**
 * history persistent class
 */
class ChatHistoryManager {
    sessions: ChatSession[]

    constructor() {
        this.sessions = []
    }

    save() {
        const historyJson = JSON.stringify({
            sessions: this.sessions.map(session => session.toObj())
        })

        localStorage.setItem(HISTORY_STORAGE_KEY, historyJson)
    }

    load() {
        try {
            const historyJson = localStorage.getItem(HISTORY_STORAGE_KEY)

            if (historyJson) {
                this.sessions = JSON.parse(historyJson).sessions.map((sessionObj: any) => ChatSession.fromObj(sessionObj))
            }
        } catch (ex) {
            console.error('Load history failed!', ex)
        }
    }

    clean() {
        this.sessions = []
        localStorage.removeItem(HISTORY_STORAGE_KEY)
    }

    addSession(name: string) {
        this.sessions.push(new ChatSession(name))
    }

    getSession(name: string) {
        return this.sessions.find(session => session.name === name)
    }
}

export default ChatHistoryManager