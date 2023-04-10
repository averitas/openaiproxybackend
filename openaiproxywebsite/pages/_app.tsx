import ChatWindow from '@/components/chat_window';
import SidePanel from '@/components/side_panel';
import React, { useState } from 'react';
import Session from '../types/types';

const App: React.FC = () => {
  const [sessionIndex, setSessionIndex] = useState<number>(1)
  const [sessions, setSessions] = useState<Session[]>([{name: 'Session 0', id: ''}]);
  const [activeSession, setActiveSession] = useState<Session>({name: 'Session 0', id: ''});

  const NewSession = () => {
    const newSession : Session = {
      name: `Session ${sessionIndex}`,
      id: ''
    }
    setSessionIndex(sessionIndex + 1)

    setSessions([...sessions, newSession])
    setActiveSession(newSession)
  }

  return (
    <div>
      <SidePanel sessions={sessions} setSessions={setSessions} activeSession={activeSession} setActiveSession={setActiveSession} newSession={NewSession}/>
      <ChatWindow sessions={sessions} setSessions={setSessions} activeSession={activeSession} setActiveSession={setActiveSession} />
    </div>
  );
};


export default App;