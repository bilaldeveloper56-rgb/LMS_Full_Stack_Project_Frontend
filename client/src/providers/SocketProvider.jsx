import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/features/auth/auth.context';
import { getAccessToken, onTokenChange } from '@/features/auth/auth.token';

const SocketContext = createContext({
  socket: null,
  isConnected: false,
});

/**
 * SocketProvider manages a single shared authenticated Socket.io connection.
 * Connects when the user is authenticated, disconnects on logout.
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

    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    const token = getAccessToken();

    const socket = io(socketUrl, {
      auth: { token: token ? `Bearer ${token}` : undefined },
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
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
