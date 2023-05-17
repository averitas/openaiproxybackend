import React, { useEffect, useState } from 'react'
import { Box, Button, Divider, List, ListItem, ListItemButton, ListItemText, TextField, Typography } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import AddIcon from '@mui/icons-material/Add'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import DeleteSweep from '@mui/icons-material/DeleteSweep'
import ChatManager from './chat_manager'
import ChatSession from './chat_session'

const SidePanel = () => {
  const [sessions, setSessions] = useState<ChatSession[]>(ChatManager.instance.getSessions())
  const [activeSessionName, setActiveSessionName] = useState(ChatManager.instance.activeSession.name)

  const createSession = () => {
    ChatManager.instance.createSession()
  }

  const cleanSessions = () => {
    ChatManager.instance.clean()
  }

  const setActiveSession = (sessionName: string) => {
    ChatManager.instance.setActiveSession(sessionName)
  }

  const deleteSession = (event: React.MouseEvent, sessionName: string) => {
    event.stopPropagation();
    ChatManager.instance.removeSession(sessionName)
  }

  useEffect(() => {
    const sessionsUpdateHandler = () => {
      setSessions(Array.from(ChatManager.instance.sessions.values()))
    }

    const activeSessionChangeHandler = () => {
      setActiveSessionName(ChatManager.instance.activeSession.name)
    }

    ChatManager.instance.addEventListener(ChatManager.SESSIONS_CHANGE_EVENT, sessionsUpdateHandler)
    ChatManager.instance.addEventListener(ChatManager.ACTIVE_SESSION_CHANGE_EVENT, activeSessionChangeHandler)

    return () => {
      ChatManager.instance.removeEventListener(ChatManager.SESSIONS_CHANGE_EVENT, sessionsUpdateHandler)
      ChatManager.instance.removeEventListener(ChatManager.ACTIVE_SESSION_CHANGE_EVENT, activeSessionChangeHandler)
    }
  }, [])

  return (
    <Box mt={2} p={2} style={{ minWidth: '250px', overflow: "auto" }}>
      <CssBaseline />
      <Button
        disabled={sessions.length > 8}
        variant='contained'
        color='secondary'
        onClick={createSession}
        startIcon={<AddIcon />}
        style={{ width: "100%" }}
      >
        New session
      </Button>
      <Button
        disabled={sessions.length > 8}
        variant='contained'
        color='error'
        onClick={cleanSessions}
        startIcon={<DeleteSweep />}
        style={{ width: "100%", marginTop: '5px' }}
      >
        Clean sessions
      </Button>
      <List>
        {sessions.map((session) => (
          <ListItem key={session.name} style={{ display: 'flex', flexDirection: 'row' }}>
            <ListItemButton
              selected={session.name === activeSessionName}
              key={session.name}
              onClick={() => setActiveSession(session.name)}
              style={{ width: '100%' }}
            >
              <ListItemText color={session.name === activeSessionName ? "#008394" : "#33c9dc"}>
                {session.name === activeSessionName ? <strong style={{ color: 'ActiveCaption' }}>{session.name + ' '}</strong> : session.name + ' '}
              </ListItemText>
            </ListItemButton>
            <ListItemButton disabled={sessions.length === 1} color='inherit'
              onClick={event => deleteSession(event, session.name)} style={{ padding: '3px', minWidth: '10px' }} >
              {<DeleteForeverIcon />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )
};

export default SidePanel;