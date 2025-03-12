import { Middleware } from '@reduxjs/toolkit';
import ChatManager from '../chat_manager';
import { activeSessionChanged, messagesUpdated } from './chatSlice';

export const chatMiddleware: Middleware = store => {
  // Set up event listeners when middleware is created
  const activeSessionChangeHandler = () => {
    const newActiveSession = ChatManager.instance.activeSession;
    store.dispatch(activeSessionChanged({
      id: newActiveSession.id,
      name: newActiveSession.name,
      messages: newActiveSession.messages.slice(0),
    }));
  };

  const messagesChangeHandler = () => {
    const newMessages = ChatManager.instance.activeSession.messages.slice(0);
    store.dispatch(messagesUpdated(newMessages));
  };

  // Add event listeners
  ChatManager.instance.addEventListener(ChatManager.ACTIVE_SESSION_CHANGE_EVENT, activeSessionChangeHandler);
  ChatManager.instance.addEventListener(ChatManager.MESSAGES_CHANGE_EVENT, messagesChangeHandler);

  return next => action => {
    return next(action);
  };
};
