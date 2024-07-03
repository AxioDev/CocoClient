import React, { useState, useImperativeHandle, forwardRef, useEffect, useRef } from 'react';
import { Input, Button, List, Avatar, Form, Upload, message, Image, Layout } from 'antd';
import { UserOutlined, UploadOutlined, CameraOutlined, EyeOutlined } from '@ant-design/icons';
import { useUser } from '../contexts/UserContext';
import { useSocket } from '@/contexts/SocketContext';
import { uploadFile } from '../api/upload';

const { TextArea } = Input;
const { Content } = Layout;

const PrivateChat = forwardRef(({ recipient, initialMessages }, ref) => {
    const socket = useSocket();
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const { user } = useUser();
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const handleSendMessage = async (fileUrl = null) => {
        socket.emit('privateMessage', { senderId: user._id, receiverId: recipient._id, message: newMessage, file: fileUrl });
        setMessages([...messages, { sender: user, content: newMessage, file: fileUrl }]);
        setNewMessage('');
        stopTyping();
    };

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
        startTyping();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useImperativeHandle(ref, () => ({
        addMessage: (message) => {
            setMessages(prevMessages => [...prevMessages, message]);
        }
    }));

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {

        const handleUserTyping = ({ user }) => {
            if (!typingUsers.includes(user._id)) {
                setTypingUsers(prevUsers => [...prevUsers, user]);
            }
        };

        const handleUserStopTyping = ({ user }) => {
            setTypingUsers(prevUsers => prevUsers.filter(user => user._id !== user._id));
        };

        socket.on('typing', handleUserTyping);
        socket.on('stopTyping', handleUserStopTyping);

        return () => {
            socket.off('typing', handleUserTyping);
            socket.off('stopTyping', handleUserStopTyping);
        };
    }, [socket, typingUsers]);

    const startTyping = () => {
        if (!isTyping) {
            setIsTyping(true);
            socket.emit('typing', { recipientId: recipient._id });
            typingTimeoutRef.current = setTimeout(stopTyping, 3000);
        } else {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(stopTyping, 3000);
        }
    };

    const stopTyping = () => {
        if (isTyping) {
            setIsTyping(false);
            socket.emit('stopTyping', { recipientId: recipient._id });
        }
    };

    const handleFileUpload = async (file) => {
        try {
            const fileUrl = await uploadFile(file);
            handleSendMessage(fileUrl);
        } catch (error) {
            console.error("Failed to upload file:", error);
        }
    };

    const uploadProps = {
        beforeUpload: (file) => {
            handleFileUpload(file);
            return false; // Prevent automatic upload
        }
    };

    return (
        <>
            <div style={{ overflowY: 'auto', position: 'relative', flexGrow: 1 }}>
                <Content style={{ padding: '10px', overflowY: 'auto', position: 'relative', flexGrow: 1 }}>
                    <div style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
                        {messages.map((message, index) => (
                            <div key={index}>
                                {message.content && (
                                    <div style={{
                                        padding: '2px 16px',
                                        borderRadius: '2px',
                                        maxWidth: '80%',
                                        wordBreak: 'break-word',
                                    }}>
                                        <strong style={{ color: message.sender === 'Me' ? 'green' : 'black' }}>
                                            {message.sender?.nickname}:&nbsp;
                                        </strong>
                                        {message.content}
                                    </div>
                                )}
                                {message.file && (
                                    <div>
                                        <Image src={message.file} alt="file" style={{ maxWidth: '200px', maxHeight: '200px' }} preview={{ mask: <Button icon={<EyeOutlined />} type="primary" shape="circle" size="large" /> }} />
                                    </div>
                                )}
                            </div>
                        ))}
                        {typingUsers.length > 0 && (
                            <div style={{ color: 'gray', fontStyle: 'italic' }}>
                                {typingUsers.map(user => user.nickname).join(', ')} est en train d'écrire...
                            </div>
                        )}
                    </div>
                </Content>
                <div ref={messagesEndRef} />
            </div>
            <div style={{ display: 'flex', padding: '10px', position: 'absolute', bottom: 0, width: '100%', background: '#f1f1f1' }}>
                <Form layout="inline" style={{ width: '100%' }}>
                    <Form.Item style={{ marginBottom: 0 }}>
                        <Upload {...uploadProps} showUploadList={false}>
                            <Button icon={<UploadOutlined />}>
                                Fichier
                            </Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button icon={<CameraOutlined />}>
                            Caméra
                        </Button>
                    </Form.Item>
                    <Form.Item style={{ flex: 1, marginBottom: 0 }}>
                        <TextArea
                            value={newMessage}
                            onChange={handleInputChange}
                            onPressEnter={handleKeyPress}
                            rows={1}
                            autoSize={{ minRows: 1, maxRows: 1 }}
                            placeholder="Tapez votre message..."
                        />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button type="primary" onClick={() => handleSendMessage()} block>
                            Envoyer
                        </Button>
                    </Form.Item>
                </Form>
            </div>
            <style jsx>{`
                ::-webkit-scrollbar {
                    width: 6px;
                }

                ::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }

                ::-webkit-scrollbar-thumb {
                    background: #CCC;
                    border-radius: 10px;
                }

                ::-webkit-scrollbar-thumb:hover {
                    background: #888;
                }
            `}</style>
        </>
    );
});

PrivateChat.displayName = 'PrivateChat';

export default PrivateChat;
