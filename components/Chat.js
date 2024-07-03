'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Layout, Tabs, Spin, Menu } from 'antd';
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

const { Header, Sider, Content } = Layout;

const Chat = () => {
    const socket = useSocket();
    const { state, dispatch } = useChat();
    const { user } = useUser();
    const router = useRouter();
    const [collapsedLeft, setCollapsedLeft] = useState(false);
    const [collapsedRight, setCollapsedRight] = useState(false);
    const onlineUsersRef = useRef(state.onlineUsers);
    const isMobile = useMediaQuery({ maxWidth: 767 });

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

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header className="header" style={{ display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between', backgroundColor: '#b2cc63' }}>
                <Link href='/' style={{ display: 'flex', alignItems: 'center' }}>
                    <Image src={'/logo-white.svg'} alt="Coco" width={100} height={32} />
                </Link>
                <Menu
                    mode="horizontal"
                    selectedKeys={['1']}
                    className='topbar-menu'
                    style={{ flex: 1, justifyContent: 'flex-end' }}
                    overflowedIndicator={<DownOutlined />}
                    items={[
                        {
                            key: '1',
                            label: (
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <UserOutlined />
                                    <span style={{ marginLeft: '8px' }}>
                                        {user.nickname || 'Inconnu'}
                                    </span>
                                </div>
                            )
                        }
                    ]}
                />
            </Header>

            <Layout>
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={isMobile ? collapsedLeft : false}
                    onCollapse={setCollapsedLeft}
                    breakpoint="lg"
                    collapsedWidth={isMobile ? 0 : 80}
                    theme='light'
                    width={250}
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
                            tabBarStyle={{ background: '#fff', padding: '0 16px' }}
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
                    width={400}
                    style={{ background: '#f0f2f5' }}
                >
                    <UsersList onUserClick={handleUserClick} />
                </Sider>
            </Layout>

            {isMobile && (
                <Tabs
                    defaultActiveKey="1"
                    centered
                    tabBarStyle={{
                        position: 'fixed',
                        bottom: 0,
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        background: '#fff',
                        padding: '8px 0',
                        margin: 0,
                        borderTop: '1px solid #f0f0f0'
                    }}
                    onTabClick={handleNavTabChange}
                >
                    <Tabs.TabPane
                        tab={
                            <span>
                                <UnorderedListOutlined style={{ fontSize: 20 }} />
                            </span>
                        }
                        key="rooms"
                    />
                    <Tabs.TabPane
                        tab={
                            <span>
                                <UserOutlined style={{ fontSize: 20 }} />
                            </span>
                        }
                        key="users"
                    />
                </Tabs>
            )}
        </Layout>
    );
};

export default Chat;
