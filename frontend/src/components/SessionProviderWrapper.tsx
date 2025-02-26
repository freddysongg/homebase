'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const SessionContext = createContext(null);

export default function SessionProviderWrapper({ children }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setSession({ token });
    }
  }, []);

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);
