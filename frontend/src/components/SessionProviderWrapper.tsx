'use client';

import React, { createContext, useState, useEffect, ReactNode } from "react";

interface SessionType {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface SessionContextType {
  session: SessionType | null;
  setSession: React.Dispatch<React.SetStateAction<SessionType | null>>; 
}

const SessionContext = createContext<SessionContextType | null>(null);

interface SessionProviderProps {
  children: ReactNode;
}

export default function SessionProviderWrapper({ children }: SessionProviderProps) {
  const [session, setSession] = useState<SessionType | null>(null); 

  useEffect(() => {
    const storedSession = localStorage.getItem("session");
    if (storedSession) {
      setSession(JSON.parse(storedSession));
    }
  }, []);

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
}