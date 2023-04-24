import ChatMessage from './chat_message'

class ChatSession {
    name: string
    messages: ChatMessage[]

    constructor(name: string, messages: ChatMessage[] = []) {
        this.name = name
        this.messages = messages
    }

    addMessage(message: ChatMessage) {
        this.messages.push(message)
    }

    clean() {
        this.messages = []
    }

    static fromObj(input: any) {
        return new ChatSession(input.name, input.messages.map((msgObj: any) => ChatMessage.fromObj(msgObj)));
    }

    toObj() {
        return {
            name: this.name,
            messages: this.messages.map(msg => msg.toString())
        };
    }
}

export default ChatSession