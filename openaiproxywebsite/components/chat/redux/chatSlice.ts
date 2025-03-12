import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../../redux/store';
import ChatManager from '../chat_manager';
import ChatMessage from '../chat_message';

// Define the chat state interface
interface ChatState {
  activeSession: {
    id: string;
    name: string;
    messages: ChatMessage[];
  };
  loading: boolean;
}

// Initial state
const initialState: ChatState = {
  activeSession: {
    id: ChatManager.instance.activeSession.id,
    name: ChatManager.instance.activeSession.name,
    messages: ChatManager.instance.activeSession.messages.slice(0),
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
      messages: ChatMessage[];
    }>) => {
      state.activeSession = action.payload;
    },
    messagesUpdated: (state, action: PayloadAction<ChatMessage[]>) => {
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
