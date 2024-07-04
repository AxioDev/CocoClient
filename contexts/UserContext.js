'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Spin, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useSocket } from '../contexts/SocketContext';
import { LoadingOutlined } from '@ant-design/icons';
import Styles from '@/styles/loading.module.css';

const { Text } = Typography;

const UserContext = createContext(null);

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const socket = useSocket();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      socket.emit('reconnect', token);

      socket.on('logged', ({ user, token }) => {
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        setLoading(false);
      });

      socket.on('reconnectFailed', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
        setLoading(false);
      });
    } else {
      router.push('/');
      setLoading(false);
    }
  }, [router, socket]);

  const login = (userInfo, token) => {
    setUser(userInfo);
    localStorage.setItem('user', JSON.stringify(userInfo));
    localStorage.setItem('token', token);
    router.push('/chat');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className={Styles.loadingScreen}>
        <Spin size="large" indicator={<LoadingOutlined spin />} />
        <Text style={{ marginLeft: 10 }}>Chargement...</Text>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
