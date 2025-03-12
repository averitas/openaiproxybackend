import { configureStore } from '@reduxjs/toolkit';
import notesReducer from '../components/note/redux/notesSlice';
import chatReducer from '../components/chat/redux/chatSlice';
import { chatMiddleware } from '../components/chat/redux/chatMiddleware';

// Import other existing reducers
// import authReducer from './authReducer';
// import backgroundReducer from './backgroundReducer';

export const store = configureStore({
  reducer: {
    notes: notesReducer,
    // auth: authReducer,
    // background: backgroundReducer
    // Add other reducers here
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(chatMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
