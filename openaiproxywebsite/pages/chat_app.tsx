import ChatWindow from '@/components/chat_window';
import SidePanel from '@/components/side_panel';
import React, { useEffect, useRef, useState } from 'react';
import Session from '../types/types';
import Message from '@/types/message';
import { AppBar, Drawer, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const HistoryMessageMap: string = "historyMessageMap"
const HistorySessionList: string = "historySessionList"
const HistoryDataVersion: string = "historyDataVersion"

const ChatApp: React.FC = () => {
  const [sessionIndex, setSessionIndex] = useState<number>(1)
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session>({name: 'Session 0', id: ''});
  const [session2MessageHistory, setSession2MessageHistory]
    = useState<Map<string, Message[]>>(new Map())
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [dataVersion, setDataVersion] = useState<number>(0);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getStorageDataVersion = () => {
    const localDataVersionString = localStorage.getItem(HistoryDataVersion)
    if (!localDataVersionString) {
      return 0
    }
    const dataVersionNumber = parseInt(localDataVersionString)
    if (!dataVersionNumber) {
      return 0
    }
    return dataVersionNumber
  }

  const DataVersionInc = (version: number): number => {
    const newVersion = version + 1
    if (newVersion >= Number.MAX_SAFE_INTEGER - 1) {
      localStorage.setItem(HistoryDataVersion, '0')
      return 1
    }

    return newVersion
  }

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

  const cleanSession = () => {
    setActiveSession({name: "Session 0", id: ""})
    setSessions([{name: "Session 0", id: ""}])
    setSessionIndex(1)
    setMessages([])
    setSession2MessageHistory(new Map<string, Message[]>([['Session 0', []]]))
  }

  const getSession2MessageHistory = (): Map<string, Message[]> => {
    if (typeof window === 'undefined') {
      return new Map<string, Message[]>([['Session 0', []]])
    }

    let historyData = localStorage.getItem(HistoryMessageMap);
    if (!historyData) {
      let newHistoryData = new Map<string, Message[]>([['Session 0', []]])
      historyData = JSON.stringify(Array.from(newHistoryData.entries()));
      localStorage.setItem(HistoryMessageMap, historyData);
      return newHistoryData
    }
    console.log(`Restore from LocalStorage Set session history to ${historyData}`)
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
      console.log(`Restore from LocalStorage Set session index to ${localIndex}`)
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
      console.log(`Restore from LocalStorage Set Sessions to ${localSessions.toString()}`)
      const renderSessionList = JSON.parse(localSessions)
      if (renderSessionList.length == 0) {
        return [{ name: "Session 0", id: "" }]
      }
      const newSession: Session[] = renderSessionList.map((obj: any) => {
        return {
          id: obj.id,
          name: obj.name,
        };
      })
      return newSession
    }
    return [{ name: "Session 0", id: "" }]
  }

  useEffect(() => {
    console.log(`--Setup callback started--`);
    const localDataVersion = getStorageDataVersion()
    try {
      const localSessionHistory = getSession2MessageHistory()
      const localSessionIdx = getStorageSessionIdx()
      const localSessions = getStorageSessions()
      setSession2MessageHistory(localSessionHistory)
      setMessages(localSessionHistory.get(localSessions[0].name) ?? [])
      setSessionIndex(localSessionIdx)
      setSessions(localSessions)
      setActiveSession(localSessions[0])
    } catch (error) {
      console.error('Error getting temporary data from localStorage:', error);
    } finally {
      setDataVersion(DataVersionInc(localDataVersion))
    }
    console.log(`--Setup callback end--`);
  }, []);

  useEffect(() => {
    console.log(`--Update callback started--`);
    const localDataVersion = getStorageDataVersion()
    if (localDataVersion > dataVersion) {
      console.log(`storage data version: [${localDataVersion}] is higher than state: [${dataVersion}], stop refresh`);
      return
    }

    const sessionHistory: string[] = []
    session2MessageHistory.forEach((v, k) => {
      sessionHistory.push(`Session name: ${k}, message length: ${v.length}`)
    })
    console.log(`Current messages length is: ${messages.length}, session2MessageHistory is ${sessionHistory.join(', ')}`)
    const refreshStorageSessionData = (newHistory: Map<string, Message[]>, newMessages: Message[], sidx: number, lsessions: Session[]) => {
      // Save messages to localStorage when component unmounts
      // save and update local storage history
      newHistory.set(activeSession.name, newMessages)
      const historyData = JSON.stringify(Array.from(newHistory.entries()));
      console.log(`Update LocalStorage Session2HistoryMap to ${historyData}`)
      localStorage.setItem(HistoryMessageMap, historyData);
      console.log(`Update LocalStorage sessionIndex to ${sidx}`)
      localStorage.setItem('sessionIndex', sidx.toString())
      const sessionsData = JSON.stringify(lsessions);
      console.log(`Update LocalStorage Sessions to ${sessionsData}`)
      localStorage.setItem(HistorySessionList, sessionsData)
      console.log(`Update LocalStorage Data version to ${dataVersion}`)
      localStorage.setItem(HistoryDataVersion, dataVersion.toString());
    }
    refreshStorageSessionData(session2MessageHistory, messages, sessionIndex, sessions)
    console.log(`--Update callback end--`);
    setDataVersion(DataVersionInc(localDataVersion))
  }, [messages, sessions, sessionIndex, session2MessageHistory, activeSession, dataVersion])

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
            setActiveSession={switchSession} newSession={NewSession} cleanSession={cleanSession} />
        </Drawer>
        <main style={{ height: '100vh', flexGrow: 1, padding: '3px' }}>
          <div style={{ minHeight: '30px' }} />
          <ChatWindow sessions={sessions} setSessions={setSessions} activeSession={activeSession} setActiveSession={setActiveSession}
            messages={messages} setMessages={setMessages} />
        </main>
      </div>
    </>
  );
};


export default ChatApp;