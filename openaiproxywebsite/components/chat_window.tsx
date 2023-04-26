import React, { useRef, useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Divider, List, ListItem, ListItemText, Paper, TextField, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send'
import ReactMarkdown from 'react-markdown'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import ChatManager from './chat_manager'
import ChatSession from './chat_session'
import ChatMessage from './chat_message'

const ChatWindow = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const colors = ['#80cbc4', '#b2dfdb']; // set up colors
  const [boxMaxWidth, setBoxMaxWidth] = useState('70%')
  const [boxPadding, setBoxPadding] = useState('8px 12px')
  const [boxMargin, setBoxMargin] = useState('0 5%')
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])

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
      setMessages(activeSession?.messages || [])
      messageListRef.current && messageListRef.current.scrollTo({ top: messageListRef.current.scrollHeight, behavior: 'smooth' });

      if (messages.length > 0 && messages[messages.length - 1].isWaiting) {
        setLoading(true)
      } else {
        setLoading(false)
      }
      setTimeout(() => inputAreaRef.current?.focus(), 0)
    }

    const activeSessionChangeHandler = () => {
      const newActiveSession = ChatManager.instance.activeSession

      activeSession?.removeListener(ChatSession.MESSAGES_CHANGE_EVENT, messagesChangeHandler)

      setActiveSession(newActiveSession)
      setMessages(newActiveSession.messages)
      newActiveSession.on(ChatSession.MESSAGES_CHANGE_EVENT, messagesChangeHandler)
    }

    window.addEventListener('orientationchange', handleOrientationChange);
    ChatManager.instance.on(ChatManager.ACTIVE_SESSION_CHANGE_EVENT, activeSessionChangeHandler)

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      activeSession?.removeListener(ChatSession.MESSAGES_CHANGE_EVENT, messagesChangeHandler)
      ChatManager.instance.removeListener(ChatManager.ACTIVE_SESSION_CHANGE_EVENT, activeSessionChangeHandler)
    };
  }, []);

  const sendMessage = async () => {
    console.log(`Current session name ${ChatManager.instance.activeSession.name}, id: ${ChatManager.instance.activeSession.id}`)
    const inputValue = inputText
    setInputText('')
    activeSession?.sendMessage(inputValue)
  }

  const cleanActiveSession = () => {
    ChatManager.instance.activeSession.clean()
  }

  return (
    <Box sx={{
      '&': {
        margin: boxMargin, // sets margin for the root element of ListItem
        paddingTop: '100px',
        height: '100vh',
        overflow: 'hidden'
      },
    }}>
      <Typography variant='h5' align='center' gutterBottom>
        {activeSession?.name || 'Session 0'}
      </Typography>
      <Divider />
      <Box mt={2} p={2} style={{ height: '80%', overflow: 'hidden' }}>
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
                flexDirection: (message.id % 2) === 0 ? 'row' : 'row-reverse'
              }}
            >
              <ListItemText
                style={{
                  maxWidth: '3%',
                  textAlign: (message.id % 2) === 1 ? 'right' : 'left'
                }}
                primary={message.id}
                secondary={(message.id % 2) === 1 ? 'Ask' : 'Bot'}
              />
              <Box
                component='div'
                style={{
                  maxWidth: boxMaxWidth,
                  borderRadius: '9px',
                  margin: '1px',
                  padding: boxPadding,
                  backgroundColor: colors[index % 2]
                }}>
                {message.isWaiting ? <CircularProgress /> :
                  <ReactMarkdown>{message.content}</ReactMarkdown>}
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