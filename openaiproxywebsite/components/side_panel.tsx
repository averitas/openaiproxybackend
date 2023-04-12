import Session from '@/types/types';
import React from 'react';
import { Box, Button, Divider, List, ListItem, ListItemButton, ListItemText, TextField, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

type Props = {
  activeSession: Session;
  sessions: Session[];
  setSessions : (sessions: Session[]) => void;
  setActiveSession: (session: Session) => void;
  newSession: () => void
};

const SidePanel: React.FC<Props> = ({ sessions, setSessions, activeSession, setActiveSession, newSession }) => {
  const onDeleteSession = (sessionName: string) => {
    console.log(`Delete session: ${sessionName}`)
    let newSessions = sessions.filter((value) => value.name !== sessionName)
    setSessions(newSessions)
    // if delete session is active, switch to the first session after delete
    if (sessionName === activeSession.name) {
      setActiveSession(newSessions[0])
    }
  }
  return (
    <Box mt={2} p={2} style={{ overflow: "auto" }}>
      <CssBaseline />
      <Button disabled={sessions.length > 8} variant='contained' color='secondary' onClick={newSession} endIcon={<AddIcon />}>
        New session
      </Button>
      <List>
        {sessions.map((session) => (
          <ListItemButton selected={session.name === activeSession.name} 
            key={session.name} onClick={() => setActiveSession(session)}>
            <ListItemText color={session.name === activeSession.name ? "#008394" : "#33c9dc"}>
              {session.name === activeSession.name ? <strong style={{color: 'ActiveCaption'}}>{session.name + ' '}</strong> : session.name + ' '}
            </ListItemText>
            <Button disabled={sessions.length === 1} color='inherit' variant='contained'
              onClick={() => onDeleteSession(session.name)} style={{maxWidth: '10px'}} >
              {<DeleteForeverIcon/>} 
            </Button>
          </ListItemButton>
        ))}
      </List>
    </Box>
  )
};

export default SidePanel;