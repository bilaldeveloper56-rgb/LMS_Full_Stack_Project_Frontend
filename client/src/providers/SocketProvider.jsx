import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/features/auth/auth.context';
import { getAccessToken, onTokenChange } from '@/features/auth/auth.token';
import { getApiBaseUrl } from '@/lib/utils';

const SocketContext = createContext({
  socket: null,
  isConnected: false,
});

/**
 * SocketProvider manages a single shared authenticated Socket.io connection.
 * Connects when the user is authenticated, disconnects on logout.
 * Implements graceful degradation so temporary real-time failure never breaks REST APIs.
 */
export function SocketProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    let socketUrl = import.meta.env.VITE_SOCKET_URL;
    if (!socketUrl) {
      const apiBase = getApiBaseUrl();
      if (apiBase.startsWith('http://') || apiBase.startsWith('https://')) {
        try {
          socketUrl = new URL(apiBase).origin;
        } catch {
          socketUrl = import.meta.env.PROD ? 'https://api.lmsprime.online' : window.location.origin;
        }
      } else {
        socketUrl = import.meta.env.PROD ? 'https://api.lmsprime.online' : window.location.origin;
      }
    }
    const token = getAccessToken();

    const socket = io(socketUrl, {
      auth: { token: token ? `Bearer ${token}` : undefined },
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      setIsConnected(false);
      // Graceful degradation: real-time down does not impact REST API usage
      if (import.meta.env.DEV) {
        console.warn('[Socket.io] Real-time connection temporarily unavailable:', err.message);
      }
    });

    // Update socket auth token if access token refreshes
    const unsubscribe = onTokenChange((newToken) => {
      if (socketRef.current) {
        socketRef.current.auth = { token: newToken ? `Bearer ${newToken}` : undefined };
      }
    });

    return () => {
      unsubscribe();
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, user?.id]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

export default SocketProvider;
