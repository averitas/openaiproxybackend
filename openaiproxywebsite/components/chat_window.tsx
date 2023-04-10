import React, { useState } from 'react';
import axios from 'axios';
import Session from '@/types/types';
import { Box, Button, CircularProgress, Divider, List, ListItem, ListItemText, TextField, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown from 'react-markdown';
import { css } from '@emotion/react';
const listItemStyle = css`
  margin: 20% 20%;
`;

type Message = {
  id: number;
  text: string;
  isWait: boolean;
};

type ChatWindowProps = {
    activeSession: Session;
    sessions: Session[];
    setSessions : (sessions: Session[]) => void;
    setActiveSession: (session: Session) => void;
};


const ChatWindow: React.FC<ChatWindowProps> = ({ sessions, setSessions, activeSession, setActiveSession }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const colors = ["#BDBDBD", "#E0E0E0"]; // set up colors

  const setWaiting = (newMessages: Message[]) => {
    const newResponse: Message = {
      id: messages.length + 2,
      text: '',
      isWait: true,
    };

    setMessages([...newMessages, newResponse])
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
            const updateSession : Session = {
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

        setMessages([...newMessages, newResponse]);
      }
    } catch (error) {
      setInputText('');
      setMessages([...newMessages, {
        id: messages.length + 2,
        text: "Error",
        isWait: false,
      }])
      console.error(error);
    }
  };

  return (
    <Box sx={{
        '&': {
          margin: '5% 5%', // sets margin for the root element of ListItem
        },
      }}>
      <Typography variant="h5" align="center" gutterBottom>
        Chat Window
      </Typography>
      <Divider />
      <Box mt={2} p={2} style={{ maxHeight: "80%", overflow: "auto" }}>
        <List>
          {messages.map((message, index) => (
            <ListItem key={index} style={{backgroundColor: colors[index % 2]}}>
              <ListItemText style={{maxWidth: "10%"}}
                primary={message.id}
                secondary={(message.id % 2) === 1 ? 'Ask' : 'Answer'}
              />
              <Typography variant="body1" component="div" style={{maxWidth: "80%"}}>
                {message.isWait? <CircularProgress/> : 
                <ReactMarkdown>{message.text}</ReactMarkdown>}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box mt={2} display="flex" alignItems="center">
        <TextField
          fullWidth
          placeholder="Type your message here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          variant="outlined"
          multiline
          rows={2}
          style={{ marginRight: "10px" }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleMessageSend}
          disabled={!inputText}
          endIcon={<SendIcon />}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatWindow;