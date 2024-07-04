// components/Chat.js
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Layout, Spin,  Flex, Avatar, Button } from 'antd';
import { useUser } from '@/contexts/UserContext';
import { useSocket } from '@/contexts/SocketContext';
import { useRouter } from 'next/navigation';
import RoomsList from '@/components/RoomsList';
import UsersList from '@/components/UsersList';
import ChatTabsManager from '@/components/ChatTabsManager';
import { useMediaQuery } from 'react-responsive';
import { UnorderedListOutlined, UserOutlined } from '@ant-design/icons';
import Topbar from './Topbar';
import ProfileModal from './ProfileModal';
import useChatTabs from '@/hooks/useChatTabs';

const { Header, Sider, Content } = Layout;

const Chat = () => {
    const socket = useSocket();
    const { user } = useUser();
    const router = useRouter();
    const { openPrivateChat, openRoomChat } = useChatTabs();
    const [collapsedLeft, setCollapsedLeft] = useState(false);
    const [collapsedRight, setCollapsedRight] = useState(false);
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [modalProfileVisible, setModalProfileVisible] = useState(false);

    useEffect(() => {
        if (user && socket) {
            socket.emit('userOnline', user._id);

            const handlePrivateMessage = ({ sender, message, type, code }) => {
                console.log('Received private message:', sender, message);

                if (type === 'system' && code === 'USER_OFFLINE') {
                    message = `L'utilisateur est hors ligne`;
                }

                openPrivateChat(user, sender);
            };

            const handleUserTyping = ({ user }) => {
                console.log('User is typing:', user);
                dispatch({
                    type: 'SET_TYPING',
                    payload: { user: user, typing: true }
                });
            };

            const handleUserStopTyping = ({ user }) => {
                console.log('User stopped typing:', user);
                dispatch({
                    type: 'SET_TYPING',
                    payload: { user: user, typing: false }
                });
            };

            socket.on('privateMessage', handlePrivateMessage);
            socket.on('typing', handleUserTyping);
            socket.on('stopTyping', handleUserStopTyping);

            return () => {
                socket.emit('userOffline', user._id);
                socket.off('privateMessage', handlePrivateMessage);
                socket.off('typing', handleUserTyping);
                socket.off('stopTyping', handleUserStopTyping);
            };
        }
    }, [user, socket, openPrivateChat]);

    if (!user || !socket) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    const handleUserClick = (clickedUser) => {
        openPrivateChat(user, clickedUser);
    };

    const handleRoomClick = (clickedRoom) => {
        openRoomChat(clickedRoom);
    };

    const toggleLeft = () => setCollapsedLeft(!collapsedLeft);
    const toggleRight = () => setCollapsedRight(!collapsedRight);

    const handleTopBarItemClick = ({ item, key, keyPath }) => {
        if (key === 'update_profile') {
            setModalProfileVisible(true);
        }
    };

    return (
        <>
            {modalProfileVisible ? <ProfileModal user={user} visible={true} onClose={() => setModalProfileVisible(false)} /> : null}
            <Layout style={{
                height: isMobile ? 'calc(100vh - 82px)' : '100vh',
                overflowY: 'hidden'
            }}>
                <Topbar user={user} onItemClick={handleTopBarItemClick} />

                <Layout>
                    <Sider
                        trigger={null}
                        collapsible
                        collapsed={isMobile ? collapsedLeft : false}
                        onCollapse={setCollapsedLeft}
                        breakpoint="lg"
                        collapsedWidth={isMobile ? 0 : 80}
                        theme='light'
                        width={isMobile ? '100%' : '250px'}
                        style={{ background: '#f0f2f5' }}
                    >
                        <RoomsList onRoomClick={handleRoomClick} />
                    </Sider>

                    <Layout>
                        <Content style={{ background: '#fff' }}>
                            <ChatTabsManager />
                        </Content>
                    </Layout>

                    <Sider
                        trigger={null}
                        collapsible
                        collapsed={isMobile ? collapsedRight : false}
                        onCollapse={setCollapsedRight}
                        breakpoint="lg"
                        collapsedWidth={isMobile ? 0 : 80}
                        theme='light'
                        width={isMobile ? '100%' : '380px'}
                        style={{ background: '#f0f2f5' }}
                    >
                        <UsersList onUserClick={handleUserClick} />
                    </Sider>
                </Layout>

                {isMobile && (
                    <Flex gap={0} align='center' justify='center' style={{
                        position: 'fixed',
                        bottom: 0,
                        right: 0,
                        left: 0,
                        background: '#f5f5f5',
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'center',
                    }}>

                        <div type="text"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexDirection: 'column',
                                gap: '16px',
                                borderRight: '1px solid #DDD',
                                background: collapsedLeft ? '#f0f2f5' : '#fff',
                                padding: '16px',
                                flex: 1
                            }}
                            onClick={toggleLeft}>
                            <UnorderedListOutlined />
                            <span>
                                Salons
                            </span>
                        </div>

                        <div type="text"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexDirection: 'column',
                                gap: '16px',
                                padding: '16px',
                                background: collapsedRight ? '#f0f2f5' : '#fff',
                                flex: 1
                            }}
                            onClick={toggleRight}>
                            <UserOutlined />
                            <span>
                                Utilisateurs
                            </span>
                        </div>

                    </Flex>
                )}
            </Layout>
        </>
    );
};

export default Chat;
