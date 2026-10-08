import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const ReadingSessionContext = createContext(null);

export function ReadingSessionProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [activeSession, setActiveSession] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);
  const heartbeatRef = useRef(null);

  // Check for active session on login
  useEffect(() => {
    if (isAuthenticated) {
      api.getActiveSession()
        .then((res) => {
          if (res?.active_session) {
            setActiveSession(res.active_session);
            setSeconds(res.active_session.duration_seconds || 0);
          }
        })
        .catch(() => {});
    } else {
      setActiveSession(null);
      setSeconds(0);
    }
  }, [isAuthenticated]);

  // Local second-by-second ticker
  useEffect(() => {
    if (activeSession && !isPaused) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [activeSession, isPaused]);

  // Server heartbeat every 30 seconds
  useEffect(() => {
    if (activeSession && !isPaused) {
      heartbeatRef.current = setInterval(() => {
        api.heartbeatSession(activeSession.id).catch(() => {});
      }, 30000);
    } else {
      clearInterval(heartbeatRef.current);
    }
    return () => clearInterval(heartbeatRef.current);
  }, [activeSession, isPaused]);

  const startSession = async (book = null) => {
    try {
      const bookId = book?.id || null;
      const session = await api.startReadingSession(bookId);
      // Attach book object for UI convenience
      session.book = book;
      setActiveSession(session);
      setSeconds(0);
      setIsPaused(false);
      return session;
    } catch (err) {
      console.error("Failed to start reading session:", err);
      throw err;
    }
  };

  const pauseSession = () => {
    setIsPaused(true);
  };

  const resumeSession = () => {
    setIsPaused(false);
  };

  const endSession = async (pagesRead = 0) => {
    if (!activeSession) return null;
    try {
      const result = await api.endReadingSession(activeSession.id, pagesRead);
      setActiveSession(null);
      setSeconds(0);
      setIsPaused(false);
      return result;
    } catch (err) {
      console.error("Failed to end reading session:", err);
      throw err;
    }
  };

  const formatTimer = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ReadingSessionContext.Provider
      value={{
        activeSession,
        isPaused,
        seconds,
        formattedTime: formatTimer(seconds),
        startSession,
        pauseSession,
        resumeSession,
        endSession,
      }}
    >
      {children}
    </ReadingSessionContext.Provider>
  );
}

export function useReadingSession() {
  const context = useContext(ReadingSessionContext);
  if (!context) {
    throw new Error('useReadingSession must be used within ReadingSessionProvider');
  }
  return context;
}
