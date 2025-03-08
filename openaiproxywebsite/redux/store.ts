import { configureStore } from '@reduxjs/toolkit';
import notesReducer from '../components/note/redux/notesSlice';

// Import other existing reducers
// import authReducer from './authReducer';
// import backgroundReducer from './backgroundReducer';

export const store = configureStore({
  reducer: {
    notes: notesReducer,
    // auth: authReducer,
    // background: backgroundReducer
    // Add other reducers here
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
