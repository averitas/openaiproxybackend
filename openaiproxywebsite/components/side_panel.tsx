import Session from '@/types/types';
import React from 'react';
import { Box, Button, Divider, List, ListItem, ListItemButton, ListItemText, TextField, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import AddIcon from '@mui/icons-material/Add';

type Props = {
  activeSession: Session;
  sessions: Session[];
  setSessions : (sessions: Session[]) => void;
  setActiveSession: (session: Session) => void;
  newSession: () => void
};

const SidePanel: React.FC<Props> = ({ sessions, setSessions, activeSession, setActiveSession, newSession }) => {
  return (
    <Box mt={2} p={2} style={{ overflow: "auto" }}>
      <CssBaseline />
      <Button variant='contained' color='secondary' onClick={newSession} endIcon={<AddIcon />}>
        New session
      </Button>
      <List>
        {sessions.map((session) => (
          <ListItemButton selected={session.name === activeSession.name} 
            key={session.name} onClick={() => setActiveSession(session)}>
            <ListItemText color={session.name === activeSession.name ? "#008394" : "#33c9dc"}>
              {session.name} {session.name === activeSession.name && <strong>(Active)</strong>}
            </ListItemText>
          </ListItemButton>
        ))}
      </List>
    </Box>
  )
};

export default SidePanel;