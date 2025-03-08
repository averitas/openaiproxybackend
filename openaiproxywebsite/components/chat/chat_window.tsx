import React, { useRef, useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Divider, List, ListItem, ListItemText, Paper, TextField, Typography, Link } from '@mui/material';
import SendIcon from '@mui/icons-material/Send'
import ReactMarkdown from 'react-markdown'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import ChatManager from './chat_manager'
import ChatMessage from './chat_message'
import ThoughtBubble from './thought_bubble';
import Image from 'next/image'
import LinkIcon from '@mui/icons-material/Link'
import CircleIcon from '@mui/icons-material/Circle'

import styles from '../../styles/chat_window.module.scss'

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

      // Scroll to bottom whenever messages change, including streaming updates
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
    // Use the streaming version by default (true parameter)
    activeSession.current.sendMessage(inputValue, true)
    
    // Focus the input field after sending
    setTimeout(() => {
      inputAreaRef.current?.focus();
    }, 100);
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
        paddingBottom: '2px',
        height: 'calc(100vh - 80px)',
        overflow: 'hidden'
      },
    }}>
      <Typography variant='h5' align='center' gutterBottom>
        {activeSession.current.name || 'Session 0'}
      </Typography>
      <Divider />
      <Box mt={2} p={0} style={{ flexGrow: '1', overflow: 'hidden' }}>
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
                  <Image
                    src="/bot_avatar.jpg"
                    alt="Landscape picture"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      marginRight: '2px',
                      overflow: 'hidden'
                    }}
                    width={40}
                    height={40}
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
                  backgroundColor: colors[index % 2],
                  position: 'relative' // Added for positioning CircularProgress
                }}>
                <p style={{
                  margin: '0',
                  color: message.type === 0 ? '#666' : '#fff',
                  fontSize: '0.6em',
                  lineHeight: '1'
                }}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
                
                {/* Always show thought bubble and message content */}
                {message.thought && message.type === 0 && (
                  <ThoughtBubble thought={message.thought} defaultExpanded={message.isWaiting} />
                )}
                <ReactMarkdown className={styles['message-content']}>
                  {message.content}
                </ReactMarkdown>
                
                {/* Display references if they exist */}
                {message.references && message.references.length > 0 && (
                  <Box 
                    sx={{
                      mt: 2,
                      pt: 1,
                      borderTop: '1px solid rgba(0,0,0,0.1)',
                      fontSize: '0.9em'
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <LinkIcon fontSize="small" sx={{ mr: 0.5 }} /> References:
                    </Typography>
                    <List dense sx={{ py: 0, mt: 0.5 }}>
                      {message.references.map((ref, idx) => (
                        <ListItem 
                          key={idx} 
                          sx={{ 
                            py: 0.25, 
                            px: 0,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <CircleIcon sx={{ fontSize: 8, mr: 1, color: 'text.secondary' }} />
                          {ref.url ? 
                            <Link 
                              href={ref.url}
                              underline="hover"
                              color="primary"
                              sx={{ fontSize: '0.95em' }}
                            >
                              {(ref.id ?? '') + ' ' + (ref.name ?? '')}
                            </Link>
                            : 
                            <Typography variant="body2">
                              {(ref.id ?? '') + ' ' + (ref.name ?? '')}
                            </Typography>
                          }
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                
                {/* Show CircularProgress overlay when waiting */}
                {message.isWaiting && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.7)', // semi-transparent backdrop
                      borderRadius: '9px',
                      zIndex: 1
                    }}
                  >
                    <CircularProgress size={30} />
                  </Box>
                )}
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