import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        await u.reload();
        if (!u.emailVerified) {
          await signOut(auth);
          setUser(null);
        } else {
          setUser(u);
        }
      } else {
        setUser(null);
      }
      setChecking(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, checking }}>
      {children}
    </AuthContext.Provider>
  );
};
