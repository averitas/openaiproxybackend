import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import Session from '@/types/types';
import { Box, Button, CircularProgress, Divider, List, ListItem, ListItemText, Paper, TextField, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown from 'react-markdown';
import { css } from '@emotion/react';
import Message from '@/types/message';
import styled from '@emotion/styled';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

type ChatWindowProps = {
  activeSession: Session;
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
  setActiveSession: (session: Session) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
};

const ChatWindow: React.FC<ChatWindowProps> = ({ sessions, setSessions, activeSession, setActiveSession, messages, setMessages }) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const colors = ['#80cbc4', '#b2dfdb']; // set up colors
  const [boxMaxWidth, setBoxMaxWidth] = useState('70%')
  const [boxPadding, setBoxPadding] = useState('8px 12px')
  const [boxMargin, setBoxMargin] = useState('0 5%')

  const messageListRef = useRef<HTMLUListElement>(null);

  const setWaiting = (newMessages: Message[]) => {
    const newResponse: Message = {
      id: messages.length + 2,
      text: '',
      isWait: true,
    };

    setMessages([...newMessages, newResponse])
  }

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

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  const handlerMessageClean = () => {
    let newActiveSession: Session = {
      id: '',
      name: activeSession.name
    }
    let newSesssions: Session[] = []
    sessions.forEach(session => {
      if (session.name === newActiveSession.name) {
        newSesssions.push(newActiveSession)
      }
      else {
        newSesssions.push(session)
      }
    });
    setMessages([])
    setSessions(newSesssions)
    setActiveSession(newActiveSession)
  }

  const handleMessageSend = async () => {
    console.log(`Current session name ${activeSession.name}, id: ${activeSession.id}`)
    const inputValue = inputText
    const newMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      isWait: false,
    };
    const newMessages = [...messages, newMessage]
    try {
      setMessages(newMessages);
      setInputText('');
      setWaiting(newMessages)
      messageListRef.current && messageListRef.current.scrollTo({ top: messageListRef.current.scrollHeight, behavior: 'smooth' });
      setLoading(true)

      const response = await axios.post('/api/chat', {
        session: activeSession.id,
        message: inputValue,
      });

      if (response.data) {
        const newResponse: Message = {
          id: messages.length + 2,
          text: response.data.data,
          isWait: false,
        };

        console.log(`session id now: ${activeSession.id}, comming: ${response.data.sessionId}`)

        // if sessionId updated, update local sessionId
        if (response.data.sessionId !== activeSession.id) {
          console.log(`Update session id of session ${activeSession.name} to ${response.data.sessionId}`)
          const updateSession: Session = {
            id: response.data.sessionId,
            name: activeSession.name,
          }
          setActiveSession(updateSession)
          var newSessions: Session[] = []
          for (let index = 0; index < sessions.length; index++) {
            if (sessions[index].name === activeSession.name) {
              newSessions.push(updateSession)
            } else {
              newSessions.push(sessions[index])
            }
          }
          setSessions(newSessions)
        }

        setMessages([...newMessages, newResponse])
      }
    } catch (error) {
      setInputText('');
      setMessages([...newMessages, {
        id: messages.length + 2,
        text: 'Error',
        isWait: false,
      }])
      console.error(error);
    } finally {
      messageListRef.current && messageListRef.current.scrollTo({ top: messageListRef.current.scrollHeight, behavior: 'smooth' })
      setLoading(false)
    }
  };

  return (
    <Box sx={{
      '&': {
        margin: boxMargin, // sets margin for the root element of ListItem
        paddingTop: '100px',
        height: '100vh'
      },
    }}>
      <Typography variant='h5' align='center' gutterBottom>
        {activeSession.name}
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
                {message.isWait ? <CircularProgress /> :
                  <ReactMarkdown>{message.text}</ReactMarkdown>}
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box mt={2} display='flex' alignItems='center'>
        <TextField
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
        <Box display='flex' flexDirection='column'>
          <Button
            variant="contained"
            color="primary"
            onClick={handleMessageSend}
            disabled={!inputText || loading}
            endIcon={<SendIcon />}>
            Send
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handlerMessageClean}
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