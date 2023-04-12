import Session from '@/types/types';
import React, { useEffect } from 'react';
import { Box, Button, Divider, List, ListItem, ListItemButton, ListItemText, TextField, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

type Props = {
  activeSession: Session;
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
  setActiveSession: (session: Session) => void;
  newSession: () => void
  refreshData: () => void
};

const SidePanel: React.FC<Props> = ({ sessions, setSessions, activeSession, setActiveSession, newSession, refreshData }) => {
  useEffect(() => {
    return () => {
      refreshData()
    }
  }, [activeSession])

  const onDeleteSession = (event: React.MouseEvent, sessionName: string) => {
    event.stopPropagation();
    console.log(`Delete session: ${sessionName}`)
    let newSessions = sessions.filter((value) => value.name !== sessionName)
    setSessions(newSessions)
    // if delete session is active, switch to the first session after delete
    if (sessionName === activeSession.name) {
      setActiveSession(newSessions[0])
    }
  }

  return (
    <Box mt={2} p={2} style={{ minWidth: '250px', overflow: "auto" }}>
      <CssBaseline />
      <Button
        disabled={sessions.length > 8}
        variant='contained'
        color='secondary'
        onClick={newSession}
        endIcon={<AddIcon />}
        style={{ width: "100%" }}
      >
        New session
      </Button>
      <List>
        {sessions.map((session) => (
          <ListItem key={session.name} style={{display: 'flex', flexDirection: 'row'}}>
            <ListItemButton selected={session.name === activeSession.name} 
              key={session.name} onClick={() => setActiveSession(session)}>
              <ListItemText color={session.name === activeSession.name ? "#008394" : "#33c9dc"}>
                {session.name === activeSession.name ? <strong style={{color: 'ActiveCaption'}}>{session.name + ' '}</strong> : session.name + ' '}
              </ListItemText>
            </ListItemButton>
            <ListItemButton disabled={sessions.length === 1} color='inherit'
              onClick={event => onDeleteSession(event, session.name)} style={{ padding: '6px', minWidth: '10px' }} >
              {<DeleteForeverIcon/>} 
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )
};

export default SidePanel;