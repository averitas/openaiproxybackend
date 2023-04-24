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
    isWait: boolean

    constructor(content: string, type: number, timestamp: number) {
        this.id = 0
        this.content = content
        this.type = type
        this.timestamp = timestamp
        this.isWait = false
    }

    static fromObj(input: any) {
        return new ChatMessage(input.content, input.type, input.timestamp)
    }

    toObj() {
        return {
            content: this.content,
            type: this.type,
            timestamp: this.timestamp
        }
    }
}

export default ChatMessage