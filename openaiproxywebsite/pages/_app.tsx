import ChatWindow from '@/components/chat_window';
import SidePanel from '@/components/side_panel';
import React, { useState } from 'react';
import Session from '../types/types';
import Message from '@/types/message';
import { AppBar, Drawer, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const App: React.FC = () => {
  const [sessionIndex, setSessionIndex] = useState<number>(1)
  const [sessions, setSessions] = useState<Session[]>([{name: 'Session 0', id: ''}]);
  const [activeSession, setActiveSession] = useState<Session>({name: 'Session 0', id: ''});
  const [messages, setMessages] = useState<Message[]>([]);
  const [session2MessageHistory, setSession2MessageHistory] 
    = useState<Map<string, Message[]>>(new Map<string, Message[]>([['Session 0', []]]))
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const NewSession = () => {
    // create new session
    const newSession : Session = {
      name: `Session ${sessionIndex}`,
      id: ''
    }
    session2MessageHistory.set(newSession.name, [])
    setSessionIndex(sessionIndex + 1)

    setSessions([...sessions, newSession])

    // switchSession to new one
    switchSession(newSession)
  }

  const switchSession = (session: Session) => {
    console.log(`switching from session: ${activeSession.name}, ${activeSession.id} to ` +
        `session: ${session.name}, ${session.id}. Current Messages length: ${messages.length}`)
        
    let newSessionHistory = new Map<string, Message[]>()
    session2MessageHistory.forEach((v, k) => {
      newSessionHistory.set(k, v)
    })
    newSessionHistory.set(activeSession.name, messages)
    let newMessages = newSessionHistory.get(session.name) ?? []
    console.log(`New messages length is ${newMessages.length} of session: ${session.name}, ${session.id}`)
    setSession2MessageHistory(newSessionHistory)
    setMessages(newMessages)
    setActiveSession(session)
  }

  return (
    <div style={{display: 'flex'}}>
      <AppBar position="fixed" style={{zIndex: 1400}}>
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" onClick={handleDrawerToggle} edge="start" style={{marginRight: '36px'}}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Chat App
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="temporary" anchor='left' style={{width: '240px', flexShrink: 0}} 
        onClose={handleDrawerToggle} ModalProps={{keepMounted: true}} open={mobileOpen}>
        <div style={{minHeight: '30px'}}/>
        <SidePanel sessions={sessions} setSessions={setSessions} activeSession={activeSession} setActiveSession={switchSession} newSession={NewSession}/>
      </Drawer>
      <main style={{flexGrow: 1, padding: '3px', marginLeft: "10%"}}>
        <div />
        <ChatWindow sessions={sessions} setSessions={setSessions} activeSession={activeSession} setActiveSession={setActiveSession} 
        messages={messages} setMessages={setMessages}/>
      </main>
    </div>
  );
  return (
    <div>
      <SidePanel sessions={sessions} setSessions={setSessions} activeSession={activeSession} setActiveSession={switchSession} newSession={NewSession}/>
      <ChatWindow sessions={sessions} setSessions={setSessions} activeSession={activeSession} setActiveSession={setActiveSession} 
        messages={messages} setMessages={setMessages}/>
    </div>
  );
};


export default App;