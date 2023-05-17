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

    constructor(id: number, content: string, type: number, timestamp: number) {
        this.id = id
        this.content = content
        this.type = type
        this.timestamp = timestamp
        this.isWaiting = false
    }

    static fromObj(input: any) {
        return new ChatMessage(input.id, input.content, input.type, input.timestamp)
    }

    toObj() {
        return {
            id: this.id,
            content: this.content,
            type: this.type,
            timestamp: this.timestamp
        }
    }
}

export default ChatMessage