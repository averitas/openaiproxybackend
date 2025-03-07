import { ReferenceItem } from "./chat_interfaces"

/**
 * message class
 */
class ChatMessage {
    /**
     * message seq id
     */
    id: number

    /**
     * message content
     */
    content: string

    /**
     * message type, 0 for bot, 1 for user
     */
    type: number

    /**
     * message timestamp
     */
    timestamp: number

    /**
     * is the message waiting for server
     */
    isWaiting: boolean

    /**
     * thought process from the AI
     */
    thought: string | null
    
    /**
     * references from the AI
     */
    references: ReferenceItem[]

    constructor(id: number, content: string, type: number, timestamp: number) {
        this.id = id
        this.content = content
        this.type = type
        this.timestamp = timestamp
        this.isWaiting = false
        this.thought = null
        this.references = []
    }

    static fromObj(input: any) {
        const message = new ChatMessage(input.id, input.content, input.type, input.timestamp);
        if (input.thought) {
            message.thought = input.thought;
        }
        if (input.references) {
            message.references = input.references;
        }
        return message;
    }

    toObj() {
        return {
            id: this.id,
            content: this.content,
            type: this.type,
            timestamp: this.timestamp,
            thought: this.thought,
            references: this.references
        }
    }
}

export default ChatMessage