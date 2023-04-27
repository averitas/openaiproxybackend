import React, { useRef, useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Divider, List, ListItem, ListItemText, Paper, TextField, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send'
import ReactMarkdown from 'react-markdown'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import ChatManager from './chat_manager'
import ChatMessage from './chat_message'

import styles from '../styles/chat_window.module.scss'

const ChatWindow = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const colors = ['#80cbc4', '#b2dfdb']; // set up colors
  const [boxMaxWidth, setBoxMaxWidth] = useState('70%')
  const [boxPadding, setBoxPadding] = useState('8px 12px')
  const [boxMargin, setBoxMargin] = useState('0 5%')
  const activeSession = useRef(ChatManager.instance.activeSession)
  const [messages, setMessages] = useState<ChatMessage[]>(ChatManager.instance.activeSession.messages.slice(0))

  const messageListRef = useRef<HTMLUListElement>(null)
  const inputAreaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    function handleOrientationChange() {
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      if (isLandscape) {
        setBoxMaxWidth('70%')
        setBoxMargin('5% 5%')
        setBoxPadding('8px 12px')
      } else {
        setBoxMaxWidth('95%')
        setBoxMargin('1% 1%')
        setBoxPadding('4px 7px')
      }
    }

    const messagesChangeHandler = () => {
      const newMessages = activeSession.current.messages.slice(0)
      setMessages(newMessages)

      if (newMessages.length > 0 && newMessages[newMessages.length - 1].isWaiting) {
        setLoading(true)
      } else {
        setLoading(false)
      }

      setTimeout(() => {
        messageListRef.current && messageListRef.current.scrollTo({ top: messageListRef.current.scrollHeight, behavior: 'smooth' });
        inputAreaRef.current?.focus();
      }, 0)
    }

    const activeSessionChangeHandler = () => {
      const newActiveSession = ChatManager.instance.activeSession

      activeSession.current = newActiveSession
      setMessages(newActiveSession.messages.slice(0))

      setTimeout(() => {
        messageListRef.current && messageListRef.current.scrollTo({ top: messageListRef.current.scrollHeight, behavior: 'smooth' });
        inputAreaRef.current?.focus();
      }, 0)
    }

    window.addEventListener('orientationchange', handleOrientationChange);
    ChatManager.instance.addEventListener(ChatManager.ACTIVE_SESSION_CHANGE_EVENT, activeSessionChangeHandler)
    ChatManager.instance.addEventListener(ChatManager.MESSAGES_CHANGE_EVENT, messagesChangeHandler)

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      ChatManager.instance.removeEventListener(ChatManager.ACTIVE_SESSION_CHANGE_EVENT, activeSessionChangeHandler)
      ChatManager.instance.removeEventListener(ChatManager.MESSAGES_CHANGE_EVENT, messagesChangeHandler)
    };
  }, []);

  const sendMessage = async () => {
    console.log(`Current session name ${ChatManager.instance.activeSession.name}, id: ${ChatManager.instance.activeSession.id}`)
    const inputValue = inputText
    setInputText('')
    activeSession.current.sendMessage(inputValue)
  }

  const cleanActiveSession = () => {
    ChatManager.instance.activeSession.clean()
  }

  return (
    <Box sx={{
      '&': {
        display: 'flex',
        flexDirection: 'column',
        margin: boxMargin, // sets margin for the root element of ListItem
        paddingTop: '100px',
        paddingBottom: '2%',
        height: '100vh',
        overflow: 'hidden'
      },
    }}>
      <Typography variant='h5' align='center' gutterBottom>
        {activeSession.current.name || 'Session 0'}
      </Typography>
      <Divider />
      <Box mt={2} p={2} style={{ flexGrow: '1', overflow: 'hidden' }}>
        <List
          ref={messageListRef}
          style={{
            height: '100%',
            background: '#eceff1',
            overflowY: 'scroll'
          }}
        >
          {messages.map((message, index) => (
            <ListItem
              key={index}
              style={{
                flexDirection: message.type === 0 ? 'row' : 'row-reverse',
                alignItems: 'start'
              }}
            >
              {message.type === 0 ?
                <div>
                  <img
                    src="bot_avatar.jpg"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      marginRight: '2px',
                      overflow: 'hidden'
                    }}
                  />
                </div>
                : <></>}
              <Box
                component='div'
                style={{
                  maxWidth: boxMaxWidth,
                  borderRadius: '9px',
                  margin: '1px',
                  padding: boxPadding,
                  backgroundColor: colors[index % 2]
                }}>
                <p style={{
                  margin: '0',
                  color: message.type === 0 ? '#666' : '#fff',
                  fontSize: '0.6em',
                  lineHeight: '1'
                }}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
                {message.isWaiting ? <CircularProgress /> :
                  <ReactMarkdown className={styles['message-content']}>{message.content}</ReactMarkdown>}
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box mt={2} display='flex' alignItems='center'>
        <TextField
          inputRef={inputAreaRef}
          disabled={loading}
          fullWidth
          placeholder='Type your message here...'
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          variant='outlined'
          multiline
          rows={2}
          style={{ marginRight: '10px' }}
        />
        <Box display='flex' flexDirection='column' gap='5px'>
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            disabled={!inputText || loading}
            endIcon={<SendIcon />}>
            Send
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={cleanActiveSession}
            disabled={loading}
            endIcon={<DeleteForeverIcon />}>
            Clean
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatWindow;