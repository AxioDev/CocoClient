import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, List, Typography, Col, Row, Avatar, Upload, message, Form } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import { useUser } from '@/contexts/UserContext';
import { uploadFile } from '../api/upload';
import { useSocket } from '@/contexts/SocketContext';
import Image from 'next/image';

const { TextArea } = Input;

const RoomChat = ({ room }) => {
    const socket = useSocket();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const { user } = useUser();
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [users, setUsers] = useState([]);

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

    return (
        <Row style={{ height: '100%', overflow: 'hidden' }}>
            <Col span={18} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div ref={messagesContainerRef} style={{ flex: 1, overflowY: 'auto', maxHeight: '500px', padding: '20px', backgroundColor: '#fff' }}>
                    <List
                        bordered={false}
                        itemLayout="horizontal"
                        locale={{ emptyText: 'Aucun message' }}
                        dataSource={messages}
                        renderItem={(message, index) => (
                            <List.Item key={index} style={{ textAlign: message.sender._id === user._id ? 'right' : 'left' }}>
                                <List.Item.Meta
                                    title={<Typography.Text strong>{message.sender.nickname}</Typography.Text>}
                                    description={
                                        <div>
                                            {message.content && (
                                                <div style={{
                                                    backgroundColor: message.sender._id === user._id ? '#dcf8c6' : '#d9d9d9',
                                                    padding: '8px 16px',
                                                    borderRadius: '20px',
                                                    display: 'inline-block',
                                                    maxWidth: '80%',
                                                    wordBreak: 'break-word'
                                                }}>
                                                    {message.content}
                                                </div>
                                            )}
                                            {message.file && (
                                                <div>
                                                    <a href={message.file} target="_blank" rel="noopener noreferrer">
                                                        <Image src={message.file} alt="file" width={200} height={200} style={{ maxWidth: '200px', maxHeight: '200px' }} />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                    <div ref={messagesEndRef} />
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', padding: '10px', backgroundColor: '#fff' }}>
                    <Form layout="inline" style={{ display: 'flex', alignItems: 'center' }}>
                        <Form.Item style={{ marginRight: '10px' }}>
                            <Upload {...uploadProps} showUploadList={false}>
                                <Button icon={<UploadOutlined />}>Fichier</Button>
                            </Upload>
                        </Form.Item>
                        <Form.Item style={{ flex: 1, marginRight: '10px' }}>
                            <TextArea
                                value={newMessage}
                                onChange={handleInputChange}
                                onPressEnter={handleKeyPress}
                                rows={1}
                                autoSize={{ minRows: 1, maxRows: 3 }}
                                placeholder="Tapez votre message..."
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" onClick={() => handleSendMessage()}>
                                Envoyer
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Col>
            <Col span={6} style={{ padding: '0 20px', borderLeft: '1px solid #f0f0f0', maxHeight: '500px', overflowY: 'auto' }}>
                <List
                    header={<div style={{ fontWeight: 'bold' }}>Utilisateurs</div>}
                    itemLayout="horizontal"
                    dataSource={users}
                    renderItem={(user) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar icon={<UserOutlined />} />}
                                title={user.nickname}
                            />
                        </List.Item>
                    )}
                />
            </Col>
        </Row>
    );
};

export default RoomChat;
