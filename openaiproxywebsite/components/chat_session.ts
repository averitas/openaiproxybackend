import axios from 'axios'
import { EventEmitter } from 'stream'
import ChatMessage from './chat_message'

class ChatSession extends EventEmitter {
    static MESSAGES_CHANGE_EVENT = 'messageChange'

    id: string
    name: string
    messages: ChatMessage[]

    constructor(id: string, name: string, messages: ChatMessage[] = []) {
        super()

        this.id = id
        this.name = name
        this.messages = messages
    }

    addMessage(message: ChatMessage) {
        this.messages.push(message)
    }

    async sendMessage(content: string) {
        const userMsg = this.createUser(content)

        const botMsg = this.createBot()
        botMsg.isWaiting = true

        this.emit(ChatSession.MESSAGES_CHANGE_EVENT)

        try {
            const response = await axios.post('/api/chat', {
                session: this.id,
                message: content,
            });

            if (response.data) {
                botMsg.content = response.data.data
                botMsg.isWaiting = false

                console.log(`session id now: ${this.id}, comming: ${response.data.sessionId}`)
                // if sessionId updated, update local sessionId
                if (response.data.sessionId !== this.id) {
                    console.log(`Update session id of session ${this.name} to ${response.data.sessionId}`)
                    this.id = response.data.sessionId
                }
                botMsg.content = response.data.data
            }
        } catch (error) {
            botMsg.content = 'Error'
            console.error(error);
        } finally {
            botMsg.isWaiting = false
            this.emit(ChatSession.MESSAGES_CHANGE_EVENT)
        }
    }

    clean() {
        this.messages = []
    }

    createBot(msgContent: string = '') {
        const botMessage = new ChatMessage(this.messages.length, msgContent, 0, new Date().getTime())
        this.messages.push(botMessage)
        return botMessage
    }

    createUser(msgContent: string = '') {
        const userMessage = new ChatMessage(this.messages.length, msgContent, 1, new Date().getTime())
        this.messages.push(userMessage)
        return userMessage
    }

    static fromObj(input: any) {
        return new ChatSession(input.id, input.name, input.messages.map((msgObj: any) => ChatMessage.fromObj(msgObj)));
    }

    toObj() {
        return {
            id: this.id,
            name: this.name,
            messages: this.messages.map(msg => msg.toString())
        };
    }
}

export default ChatSession