import Session from '@/types/types';
import React from 'react';
import { Box, Button, Divider, List, ListItem, ListItemText, TextField, Typography } from '@mui/material';

type Props = {
  activeSession: Session;
  sessions: Session[];
  setSessions : (sessions: Session[]) => void;
  setActiveSession: (session: Session) => void;
  newSession: () => void
};

const SidePanel: React.FC<Props> = ({ sessions, setSessions, activeSession, setActiveSession, newSession }) => {
  return (
    <Box mt={2} p={2} style={{ maxHeight: "20%", overflow: "auto" }}>
        <List>
          {sessions.map((session) => (
            <ListItem key={session.name} onClick={() => setActiveSession(session)}>
              <ListItemText>
                {session.name} {session.name === activeSession.name && <strong>(Active)</strong>}
              </ListItemText>
            </ListItem>
          ))}
        </List>
        <Button onClick={newSession}>New session</Button>
      </Box>
  )
  return (
    <div>
      <h2>Side Panel</h2>
      <ul>
        {sessions.map((session) => (
          <li key={session.name} onClick={() => setActiveSession(session)}>
            {session.name} {session.name === activeSession.name && <strong>(Active)</strong>}
          </li>
        ))}
      </ul>
      <button onClick={newSession}>New session</button>
    </div>
  );
};

export default SidePanel;