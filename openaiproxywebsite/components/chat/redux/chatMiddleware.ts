import { Middleware } from '@reduxjs/toolkit';
import ChatManager from '../chat_manager';
import { activeSessionChanged, messagesUpdated } from './chatSlice';
import ChatMessage from '../chat_message';

// Helper function to convert ChatMessage instances to plain serializable objects
const serializeChatMessages = (messages: ChatMessage[]) => {
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

export const chatMiddleware: Middleware = store => {
  // Set up event listeners when middleware is created
  const activeSessionChangeHandler = () => {
    const newActiveSession = ChatManager.instance.activeSession;
    store.dispatch(activeSessionChanged({
      id: newActiveSession.id,
      name: newActiveSession.name,
      messages: serializeChatMessages(newActiveSession.messages),
    }));
  };

  const messagesChangeHandler = () => {
    const newMessages = ChatManager.instance.activeSession.messages;
    store.dispatch(messagesUpdated(serializeChatMessages(newMessages)));
  };

  // Add event listeners
  ChatManager.instance.addEventListener(ChatManager.ACTIVE_SESSION_CHANGE_EVENT, activeSessionChangeHandler);
  ChatManager.instance.addEventListener(ChatManager.MESSAGES_CHANGE_EVENT, messagesChangeHandler);

  return next => action => {
    return next(action);
  };
};
