'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Layout, Tabs, Spin, Menu, Segmented, Flex, Avatar, Button } from 'antd';
import { useChat } from '@/contexts/ChatContext';
import { useUser } from '@/contexts/UserContext';
import { useSocket } from '@/contexts/SocketContext';
import { useRouter } from 'next/navigation'; // Utilisez le hook useRouter de next/navigation
import RoomsList from '@/components/RoomsList';
import UsersList from '@/components/UsersList';
import PrivateChat from '@/components/PrivateChat';
import RoomChat from '@/components/RoomChat';
import { createNewTab } from '@/utils/tabs';
import { useMediaQuery } from 'react-responsive';
import Image from 'next/image';
import { CloseOutlined, UserOutlined, DownOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UnorderedListOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Topbar from './Topbar';
import ProfileModal from './ProfileModal';
import { updateUserProfile } from '@/api/user';

const { Header, Sider, Content } = Layout;

const Chat = () => {
    const socket = useSocket();
    const { state, dispatch } = useChat();
    const { user, logout } = useUser();
    const router = useRouter();
    const [collapsedLeft, setCollapsedLeft] = useState(false);
    const [collapsedRight, setCollapsedRight] = useState(false);
    const onlineUsersRef = useRef(state.onlineUsers);
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [modalProfileVisible, setModalProfileVisible] = useState(false);

    useEffect(() => {
        onlineUsersRef.current = state.onlineUsers;
    }, [state.onlineUsers]);

    useEffect(() => {
        if (user && socket) {
            socket.emit('userOnline', user._id);

            const handlePrivateMessage = ({ sender, message, type, code }) => {
                console.log('Received private message:', sender, message);

                switch (type) {
                    case 'system':
                        switch (code) {
                            case 'USER_OFFLINE':
                                message = `L'utilisateur est hors ligne`;
                                break;
                            default:
                                console.log('Unknown system message code:', code);
                                break;
                        }
                        break;
                }

                dispatch({
                    type: 'ADD_PRIVATE_MESSAGE',
                    payload: {
                        key: sender._id,
                        content: message,
                        type: type,
                        sender,
                        handleTabClose: handleTabClose,
                    }
                });
            };

            const handleUserTyping = ({ user }) => {
                console.log('User is typing:', user);
                dispatch({
                    type: 'SET_TYPING',
                    payload: { user: user, typing: true }
                });
            }

            const handleUserStopTyping = ({ user }) => {
                console.log('User stopped typing:', user);
                dispatch({
                    type: 'SET_TYPING',
                    payload: { user: user, typing: false }
                });
            }

            socket.on('privateMessage', handlePrivateMessage);

            socket.on('typing', handleUserTyping);

            socket.on('stopTyping', handleUserStopTyping);

            // Intercept each message received from the server and log it
            socket.onAny((event, ...args) => {
                console.log(`Received event: ${event}`, args);
            });

            return () => {
                console.log('Chat component unmounting');
                socket.emit('userOffline', user._id);
                socket.off('privateMessage', handlePrivateMessage);
                socket.off('typing', handleUserTyping);
                socket.off('stopTyping', handleUserStopTyping);
            };
        }
    }, [user, socket, dispatch]);

    if (!user || !socket) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    const handleUserClick = (clickedUser) => {
        if (!state.tabs.find(tab => tab.key === clickedUser._id)) {
            const newTabRef = React.createRef();
            const newTab = createNewTab(
                clickedUser._id,
                clickedUser.nickname,
                <PrivateChat ref={newTabRef} initialMessages={[]} user={user} recipient={clickedUser} />,
                handleTabClose
            );

            dispatch({
                type: 'ADD_TAB',
                payload: { ...newTab, ref: newTabRef }
            });
        } else {
            dispatch({ type: 'SET_ACTIVE_TAB', payload: clickedUser._id });
        }
    };

    const handleRoomClick = (clickedRoom) => {
        if (!state.tabs.find(tab => tab.key === clickedRoom._id)) {
            const newTabRef = React.createRef();
            const newTab = createNewTab(
                clickedRoom._id,
                clickedRoom.name,
                <RoomChat ref={newTabRef} room={clickedRoom} />,
                handleTabClose
            );

            dispatch({
                type: 'ADD_TAB',
                payload: { ...newTab, ref: newTabRef }
            });
        } else {
            dispatch({ type: 'SET_ACTIVE_TAB', payload: clickedRoom._id });
        }
    };

    const handleTabClose = (e, key) => {
        e.stopPropagation();
        dispatch({ type: 'REMOVE_TAB', payload: key });
    };

    const handleTabChange = (key) => {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: key });
    };

    const toggleLeft = () => setCollapsedLeft(!collapsedLeft);
    const toggleRight = () => setCollapsedRight(!collapsedRight);

    const handleNavTabChange = (key) => {
        console.log('Nav tab change:', key);
        switch (key) {
            case 'rooms':
                toggleLeft();
                break;
            case 'users':
                toggleRight();
                break;
            default:
                break;
        }
    }

    const handleTopBarItemClick = ({ item, key, keyPath }) => {
        console.log('Top bar item click:', key);
        if (key === 'update_profile') {
            setModalProfileVisible(true);
        } else if (key === 'logout') {
            logout();
        }
    }

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
                            <Tabs
                                defaultActiveKey="1"
                                activeKey={state.activeTab}
                                onChange={handleTabChange}
                                style={{ height: '100%', padding: '0' }}
                                size='large'
                                tabBarStyle={{ background: '#fff', padding: '0 16px', margin: '0' }}
                            >
                                {state.tabs.map(tab => (
                                    <Tabs.TabPane tab={tab.label} key={tab.key} style={{ height: '100%' }}>
                                        {tab.children}
                                    </Tabs.TabPane>
                                ))}
                            </Tabs>
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
