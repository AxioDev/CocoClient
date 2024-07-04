// components/RoomChat.js
import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, List, Typography, Col, Row, Avatar, Upload, message, Form, Layout, Image, Tag, Space } from 'antd';
import { UploadOutlined, UserOutlined, UpOutlined, DownOutlined, EyeOutlined, SendOutlined } from '@ant-design/icons';
import { useUser } from '@/contexts/UserContext';
import { useChat } from '@/contexts/ChatContext';
import { uploadFile } from '../api/upload';
import { useSocket } from '@/contexts/SocketContext';
import Styles from '@/styles/roomChat.module.css';
import { useMediaQuery } from 'react-responsive';
import useChatTabs from '@/hooks/useChatTabs';

const { Content } = Layout;
const { TextArea } = Input;

const RoomChat = ({ room }) => {
    const socket = useSocket();
    const { user } = useUser();
    const { openPrivateChat } = useChatTabs();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [users, setUsers] = useState([]);
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [usersListCollapsed, setUsersListCollapsed] = useState(false);

    useEffect(() => {
        socket.emit('joinRoom', { userId: user._id, roomId: room._id });

        socket.on('lastRoomMessages', ({ roomId, messages }) => {
            if (roomId === room._id) {
                setMessages(messages);
            }
        });

        socket.on('roomMessage', message => {
            console.log('Received room message:', message);
            if (message.roomId === room._id) {
                setMessages(prevMessages => [...prevMessages, message]);
            }
        });

        socket.on('roomUsers', ({ roomId, users }) => {
            if (roomId === room._id) {
                setUsers(users);
            }
        });

        socket.on('kicked', ({ roomId }) => {
            if (roomId === room._id) {
                message.info('Vous avez été expulsé du salon.');
                // Rediriger l'utilisateur hors du salon
            }
        });

        socket.on('banned', ({ roomId }) => {
            if (roomId === room._id) {
                message.info('Vous avez été banni du salon.');
                // Rediriger l'utilisateur hors du salon
            }
        });

        return () => {
            socket.emit('leaveRoom', { userId: user._id, roomId: room._id });
            socket.off('lastRoomMessages');
            socket.off('roomMessage');
            socket.off('roomUsers');
            socket.off('kicked');
            socket.off('banned');
        };
    }, [room._id, user._id, socket]);

    const handleSendMessage = async (fileUrl = null) => {
        if (!newMessage.trim() && !fileUrl) {
            return; // Ne pas envoyer de message vide
        }

        if (newMessage.startsWith('/')) {
            handleSlashCommand(newMessage);
            setNewMessage('');
            return;
        }

        socket.emit('sendRoomMessage', { roomId: room._id, userId: user._id, message: newMessage, file: fileUrl });
        setNewMessage('');
    };

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleFileUpload = async (file) => {
        try {
            const fileUrl = await uploadFile(file);
            handleSendMessage(fileUrl);
        } catch (error) {
            console.error("Failed to upload file:", error);
            message.error('Failed to upload file.');
        }
    };

    const uploadProps = {
        beforeUpload: (file) => {
            handleFileUpload(file);
            return false; // Prevent automatic upload
        }
    };

    const scrollToBottom = () => {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSlashCommand = (command) => {
        socket.emit('slashCommand', { command, roomId: room._id, userId: user._id });
    };

    const canSendMessage = () => {
        return newMessage.trim();
    };

    const handleCollapseUsersList = () => {
        setUsersListCollapsed(!usersListCollapsed);
    };

    const handleRoomUserClick = (user) => {
        openPrivateChat(user, user);
    };

    return (
        <>
            <div style={{ overflowY: 'auto', position: 'relative', flexGrow: 1 }}>
                <Content style={{ padding: '0 0', overflowY: 'auto', position: 'relative', flexGrow: 1 }}>
                    <Row>
                        <Col
                            lg={18}
                            xs={24}
                            style={{}}
                            order={isMobile ? 2 : 1}
                        >
                            <div style={{ maxHeight: isMobile ? 'calc(100vh - 306px)' : 'calc(100vh - 174px)', overflowY: 'auto', padding: '16px' }} ref={messagesContainerRef}>
                                {messages.length === 0 && (
                                    <div style={{ textAlign: 'center', color: 'gray' }}>
                                        Pas de message pour le moment, envoyez un message pour commencer la conversation.
                                    </div>
                                )}
                                {messages.map((message, index) => (
                                    <div key={index} style={{
                                        padding: '4px 16px',
                                        borderRadius: '2px',
                                        maxWidth: '80%',
                                        wordBreak: 'break-word',
                                    }}>
                                        <strong style={{ color: message.sender === 'Me' ? 'green' : 'black' }}>
                                            {message.sender?.nickname || 'Inconnu'}:&nbsp;
                                        </strong>
                                        {message.content && (
                                            <span>
                                                {message.content}
                                            </span>
                                        )}
                                        {message.file && (
                                            <div>
                                                <Image
                                                    src={message.file}
                                                    alt="file"
                                                    style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px', cursor: 'pointer' }}
                                                    preview={{ mask: <Button icon={<EyeOutlined />} type="primary" shape="circle" size="large" /> }} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                        </Col>
                        <Col
                            lg={6}
                            xs={24}
                            style={{
                                borderLeft: '1px solid #f0f0f0',
                                backgroundColor: '#f9f9f9',
                                borderBottom: isMobile ? '1px solid #f0f0f0' : 'none',
                                height: isMobile ? 'auto' : 'calc(100vh - 64px)',
                            }}
                            order={isMobile ? 1 : 2}
                        >
                            {usersListCollapsed || !isMobile ?
                                <List
                                    size='small'
                                    bordered={false}
                                    header={<div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',

                                    }}>
                                        <Typography.Text strong>Utilisateurs</Typography.Text>
                                        <Tag style={{ marginLeft: '10px' }}>{users.length}</Tag>
                                    </div>}

                                    style={{ padding: '0px 8px', paddingBottom: '8px' }}
                                    dataSource={users}
                                    renderItem={(item) => (
                                        <List.Item className={`${Styles.userItem} ${user.gender == 'man' ? Styles.userItemMan : Styles.userItemWoman}`} onClick={() => handleRoomUserClick(item)}>
                                            <strong>{item.nickname}</strong>
                                            <span>{item.age}</span>
                                            <em>{item.city.name}</em>
                                        </List.Item>
                                    )}
                                /> : null}

                            {isMobile ? <div style={{
                                padding: '10px',
                                display: 'flex',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                backgroundColor: 'rgb(240, 240, 240)',
                                gap: '8px',
                            }}
                                onClick={handleCollapseUsersList}>
                                {!usersListCollapsed ? <DownOutlined /> :
                                    <UpOutlined />}
                                <span>
                                    Voir les utilisateurs
                                </span>
                            </div> : null}
                        </Col>
                    </Row>
                </Content>
            </div>
            <div style={{ padding: '10px 10px 10px 10px', position: 'absolute', bottom: 0, width: '100%', background: '#f1f1f1', paddingRight: isMobile ? '10px' : '0' }}>

                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Space.Compact style={{ width: '100%' }} size='large'>
                        <Upload {...uploadProps} showUploadList={false}>
                            <Button icon={<UploadOutlined />} />
                        </Upload>
                        <Input
                            size='large'
                            value={newMessage}
                            onChange={handleInputChange}
                            onPressEnter={handleKeyPress}
                            rows={1}
                            autoSize={{ minRows: 1, maxRows: 1 }}
                            placeholder="Tapez votre message..."
                        />
                        <Button type="primary" onClick={() => handleSendMessage()} disabled={!canSendMessage()} icon={<SendOutlined />} />
                    </Space.Compact>
                </Space>
            </div>
        </>
    );
};

export default RoomChat;
