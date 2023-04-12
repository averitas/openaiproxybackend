import ChatWindow from '@/components/chat_window';
import SidePanel from '@/components/side_panel';
import React, { useEffect, useState } from 'react';
import Session from '../types/types';
import Message from '@/types/message';
import { AppBar, Drawer, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const HistoryMessageMap: string = "historyMessageMap"
const HistorySessionList: string = "historySessionList"

const ChatApp: React.FC = () => {
  const getSession2MessageHistory = (): Map<string, Message[]> => {
    if (typeof window === 'undefined') {
      return new Map<string, Message[]>([['Session 0', []]])
    }

    let historyData = localStorage.getItem(HistoryMessageMap);
    console.log(`Set session history to ${historyData}`)
    if (!historyData) {
      let newHistoryData = new Map<string, Message[]>([['Session 0', []]])
      historyData = JSON.stringify(Array.from(newHistoryData.entries()));
      localStorage.setItem(HistoryMessageMap, historyData);
      return newHistoryData
    }
    let historyDataJson = JSON.parse(historyData)
    let retmap = new Map<string, Message[]>(historyDataJson)
    return retmap
  };

  const getStorageSessionIdx = (): number => {
    if (typeof window === 'undefined') {
      return 1
    }
    const localIndex = localStorage.getItem('sessionIndex')
    if (localIndex) {
      console.log(`Set session index to ${localIndex}`)
      return parseInt(localIndex)
    }
    return 1
  }

  const getStorageSessions = (): Session[] => {
    if (typeof window === 'undefined') {
      return [{ name: "Session 0", id: "" }]
    }

    const localSessions = localStorage.getItem(HistorySessionList)
    if (localSessions) {
      const newSession: Session[] = JSON.parse(localSessions).map((obj: any) => {
        return {
          id: obj.id,
          name: obj.name,
        };
      })
      console.log(`Set Sessions to ${localSessions}`)
      return newSession
    }
    return [{ name: "Session 0", id: "" }]
  }

  const [sessionIndex, setSessionIndex] = useState<number>(getStorageSessionIdx())
  const [sessions, setSessions] = useState<Session[]>(getStorageSessions());
  const [activeSession, setActiveSession] = useState<Session>(sessions[0]);
  const [session2MessageHistory, setSession2MessageHistory]
    = useState<Map<string, Message[]>>(getSession2MessageHistory())
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const getMessages = (): Message[] => {
    const localMessages = session2MessageHistory.get(activeSession.name)
    if (localMessages) {
      return localMessages
    }
    return []
  }

  const [messages, setMessages] = useState<Message[]>([]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const NewSession = () => {
    // create new session
    const newSession: Session = {
      name: `Session ${sessionIndex}`,
      id: ''
    }
    session2MessageHistory.set(newSession.name, [])
    setSessionIndex(sessionIndex + 1)

    setSessions([...sessions, newSession])

    // switchSession to new one
    switchSession(newSession)
  }

  const saveSession2MessageHistory = (newHistory: Map<string, Message[]>, sidx: number, lsessions: Session[]) => {
    const historyData = JSON.stringify(Array.from(newHistory.entries()));
    console.log(`Update Session2HistoryMap to ${historyData}`)
    localStorage.setItem(HistoryMessageMap, historyData);
    console.log(`Update sessionIndex to ${sidx}`)
    localStorage.setItem('sessionIndex', sidx.toString())
    const sessionsData = JSON.stringify(lsessions);
    console.log(`Update Sessions to ${sessionsData}`)
    localStorage.setItem(HistorySessionList, sessionsData)
  };

  const refreshStorageSessionData = () => {
    // Save messages to localStorage when component unmounts
    // save and update local storage history
    let updatedHistory = new Map<string, Message[]>()
    session2MessageHistory.forEach((v, k) => {
      console.log(`refresh sessionhistory key:${k}, value:${v}`)
      if (k === activeSession.name) {
        updatedHistory.set(k, messages)
      } else {
        updatedHistory.set(k, v)
      }
    });
    saveSession2MessageHistory(updatedHistory, sessionIndex, sessions);
  }

  const cleanSession = () => {
    setActiveSession({name: "Session 0", id: ""})
    setSessions([{name: "Session 0", id: ""}])
    setSessionIndex(1)
    setMessages([])
    setSession2MessageHistory(new Map<string, Message[]>([['Session 0', []]]))
  }

  useEffect(() => {
    try {
      setMessages(getMessages())
    } catch (error) {
      console.error('Error getting temporary data from localStorage:', error);
    }
  }, []);

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

  const drawerWidth = '250px'

  return (
    <>
      <div style={{ display: 'flex' }}>
        <AppBar position="fixed" style={{ zIndex: 1400 }}>
          <Toolbar>
            <IconButton color="inherit" aria-label="open drawer" onClick={handleDrawerToggle} edge="start" style={{ marginRight: '36px' }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Chat App
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer variant="temporary" anchor='left' style={{ width: drawerWidth, flexShrink: 0 }}
          onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} open={mobileOpen}>
          <div style={{ minHeight: '45px' }} />
          <SidePanel sessions={sessions} setSessions={setSessions} activeSession={activeSession}
            setActiveSession={switchSession} newSession={NewSession} cleanSession={cleanSession} refreshData={refreshStorageSessionData} />
        </Drawer>
        <main style={{ height: '100vh', flexGrow: 1, padding: '3px' }}>
          <div style={{ minHeight: '30px' }} />
          <ChatWindow sessions={sessions} setSessions={setSessions} activeSession={activeSession} setActiveSession={switchSession}
            messages={messages} setMessages={setMessages} refreshData={refreshStorageSessionData} />
        </main>
      </div>
    </>
  );
};


export default ChatApp;