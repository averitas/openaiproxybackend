import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../../redux/store';
import ChatManager from '../chat_manager';
import ChatMessage from '../chat_message';

// Define a serializable message type (plain object version of ChatMessage)
export interface SerializableChatMessage {
  id: number;
  content: string;
  type: number;
  timestamp: number;
  isWaiting: boolean;
  thought?: string | null | undefined;
  references?: Array<{
    id?: string;
    name?: string;
    url?: string;
  }>;
}

// Define the chat state interface with serializable messages
interface ChatState {
  activeSession: {
    id: string;
    name: string;
    messages: SerializableChatMessage[];
  };
  loading: boolean;
}

// Helper function to convert ChatMessage instances to serializable objects
const serializeMessages = (messages: ChatMessage[]) => {
  return messages.map(message => ({
    id: message.id,
    content: message.content,
    type: message.type,
    timestamp: message.timestamp,
    isWaiting: message.isWaiting,
    thought: message.thought,
    references: message.references ? message.references.map(ref => ({
      id: ref.id,
      name: ref.name,
      url: ref.url
    })) : undefined
  }));
};

// Initial state
const initialState: ChatState = {
  activeSession: {
    id: ChatManager.instance.activeSession.id,
    name: ChatManager.instance.activeSession.name,
    messages: serializeMessages(ChatManager.instance.activeSession.messages),
  },
  loading: false,
};

// Async thunk for sending a message
export const sendChatMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ message, stream = true }: { message: string; stream?: boolean }, { dispatch }) => {
    const result = await ChatManager.instance.activeSession.sendMessage(message, stream);
    
    // If streaming is enabled, the messages will be updated gradually
    // through the messagesUpdated action dispatched by the middleware
    return result;
  }
);

// Async thunk for cleaning the active session
export const cleanActiveSession = createAsyncThunk(
  'chat/cleanActiveSession',
  async (_, { dispatch }) => {
    await ChatManager.instance.activeSession.clean();
    return true;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    activeSessionChanged: (state, action: PayloadAction<{
      id: string;
      name: string;
      messages: SerializableChatMessage[];
    }>) => {
      state.activeSession = action.payload;
    },
    messagesUpdated: (state, action: PayloadAction<SerializableChatMessage[]>) => {
      state.activeSession.messages = action.payload;
      
      // Update loading state based on last message
      const messages = action.payload;
      if (messages.length > 0) {
        state.loading = messages[messages.length - 1].isWaiting;
      } else {
        state.loading = false;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendChatMessage.fulfilled, (state) => {
        // The actual messages will be updated through the messagesUpdated action
      })
      .addCase(sendChatMessage.rejected, (state) => {
        state.loading = false;
      })
      .addCase(cleanActiveSession.fulfilled, (state) => {
        state.activeSession.messages = [];
        state.loading = false;
      });
  },
});

export const { activeSessionChanged, messagesUpdated, setLoading } = chatSlice.actions;

// Selectors
export const selectActiveSession = (state: RootState) => state.chat.activeSession;
export const selectMessages = (state: RootState) => state.chat.activeSession.messages;
export const selectLoading = (state: RootState) => state.chat.loading;

export default chatSlice.reducer;
