import axios from 'axios'
import ChatMessage from './chat_message'
import UserManager from '../auth/user_manager'
import { SSEEvent, SSEReferenceEvent, SSEReplyEvent, SSEThoughtEvent, SSETokenStatEvent, ReferenceItem } from './chat_interfaces'

class ChatSession extends EventTarget {
    static MESSAGES_CHANGE_EVENT = 'messageChange'

    id: string
    name: string
    messages: ChatMessage[]
    abortController: AbortController | null = null

    constructor(id: string, name: string, messages: ChatMessage[] = []) {
        super()

        this.id = id
        this.name = name
        this.messages = messages
    }

    addMessage(message: ChatMessage) {
        this.messages.push(message)
    }

    async sendMessage(content: string, useStreaming: boolean = true) {
        this.createUser(content)

        const botMsg = this.createBot()
        botMsg.isWaiting = true
        if (!UserManager.instance.isSignedIn) {
            botMsg.content = 'Please login you Microsoft account with top right corner'
            botMsg.isWaiting = false
            this.dispatchEvent(new Event(ChatSession.MESSAGES_CHANGE_EVENT))
            return;
        }

        this.dispatchEvent(new Event(ChatSession.MESSAGES_CHANGE_EVENT))

        // Use streaming if enabled
        if (useStreaming) {
            return this.sendMessageStreaming(botMsg, content);
        }

        try {
            console.log('call api with token: ' + UserManager.instance.authResult?.accessToken)
            const response = await axios.post('/api/chat', {
                session: this.id,
                message: content,
            }, {
                headers: {
                  'Authorization': `Bearer ${UserManager.instance.authResult?.accessToken}`,
                  'content-type': 'application/json'
                }
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
            this.dispatchEvent(new Event(ChatSession.MESSAGES_CHANGE_EVENT))
        }
    }

    async sendMessageStreaming(botMsg: ChatMessage, ask: string) {
        // SSE we need to create our own id. Take uuid as id
        if (!this.id) {
            this.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        }

        // Cancel any existing SSE connection
        if (this.abortController) {
            this.abortController.abort();
        }
        
        this.abortController = new AbortController();
        const signal = this.abortController.signal;
        
        try {
            // Use fetch instead of EventSource to make a POST request
            // Note: No timeout is set intentionally to allow for long-running connections
            const response = await fetch('/api/chatsse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${UserManager.instance.authResult?.accessToken}`,
                },
                body: JSON.stringify({
                    sessionId: this.id,
                    promo: ask
                }),
                signal
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    UserManager.instance.isSignedIn = false;
                    await UserManager.instance.signInMsal();
                    return;
                }

                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Process the response stream
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            
            if (!reader) {
                throw new Error('No response body available');
            }
            
            // Clear message and update UI
            botMsg.content = '';
            botMsg.isWaiting = true;
            this.dispatchEvent(new Event(ChatSession.MESSAGES_CHANGE_EVENT));
            
            // Process the SSE stream
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                // Process SSE format: "data: {...}\n\n"
                const events = chunk.split('\n\n').filter(Boolean);
                
                for (const eventText of events) {
                    if (eventText.startsWith('data:')) {
                        try {
                            const data = eventText.substring(5); // Remove "data: " prefix
                            const sseEvent = JSON.parse(data) as SSEEvent;
                            
                            switch (sseEvent.type) {
                                case 'reply':
                                    const replyEvent = sseEvent as SSEReplyEvent;
                                    if (!replyEvent.payload.is_from_self && replyEvent.payload.content) {
                                        botMsg.content = replyEvent.payload.content;
                                        this.dispatchEvent(new Event(ChatSession.MESSAGES_CHANGE_EVENT));
                                    }
                                    
                                    if (replyEvent.payload.session_id && replyEvent.payload.session_id !== this.id) {
                                        console.log(`Update session id of session ${this.name} to ${replyEvent.payload.session_id}`);
                                        this.id = replyEvent.payload.session_id;
                                    }
                                    break;
                                    
                                case 'thought':
                                    if (!botMsg.thought) {
                                        botMsg.thought = '';
                                    }
                                    const thoughtEvent = sseEvent as SSEThoughtEvent;
                                    const procedures = thoughtEvent.payload.procedures;
                                    if (procedures && procedures.length > 0) {
                                        botMsg.thought = procedures[0].debugging?.content ?? '';
                                        this.dispatchEvent(new Event(ChatSession.MESSAGES_CHANGE_EVENT));
                                    }
                                    break;
                                    
                                case 'token_stat':
                                    // Currently not using token stats in UI
                                    break;

                                case 'reference':
                                    const referenceEvent = sseEvent as SSEReferenceEvent;
                                    if (referenceEvent.payload && referenceEvent.payload.references) {
                                        botMsg.references = referenceEvent.payload.references;
                                        this.dispatchEvent(new Event(ChatSession.MESSAGES_CHANGE_EVENT));
                                    }
                                    break;
                                
                                case 'unauthorize':
                                    console.error('SSE Error:', sseEvent.payload.content);
                                    botMsg.content = sseEvent.payload.content;
                                    this.dispatchEvent(new Event(ChatSession.MESSAGES_CHANGE_EVENT));
                                    break;
                                    
                                default:
                                    console.log('Unknown event type:', sseEvent);
                                    break;
                            }
                        } catch (error) {
                            console.error('Error parsing SSE message:', error, eventText);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Failed to establish SSE connection:', error);
            if (!botMsg.content) {
                botMsg.content = 'Connection error occurred';
            }
            this.dispatchEvent(new Event(ChatSession.MESSAGES_CHANGE_EVENT));
        } finally {
            this.abortController = null;
            botMsg.isWaiting = false;
            this.dispatchEvent(new Event(ChatSession.MESSAGES_CHANGE_EVENT));
        }
    }

    clean() {
        this.messages = []
        this.dispatchEvent(new Event(ChatSession.MESSAGES_CHANGE_EVENT))
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
            messages: this.messages.map(msg => msg.toObj())
        };
    }
}

export default ChatSession