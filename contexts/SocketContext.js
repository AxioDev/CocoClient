// app/contexts/SocketContext.js
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Spin } from 'antd';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  const wsUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

  console.log('WS URL:', wsUrl);

  useEffect(() => {
    const socketInstance = io(wsUrl);
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Socket connected');
    });

    // debug every event
    socketInstance.onAny((event, ...args) => {
      console.log('Socket event:', event, args);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  if (!socket) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" />
    </div>
  }

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
