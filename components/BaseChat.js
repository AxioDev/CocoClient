// components/BaseChat.js
import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Input, Button, List, Upload, Image, Layout, Space, Row, Col, Tag, Typography } from 'antd';
import { UploadOutlined, SendOutlined, EyeOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import Styles from '@/styles/chat.module.css';

const { Content } = Layout;
const { TextArea } = Input;

const BaseChat = forwardRef(({ messages, setMessages, handleSendMessage, handleFileUpload, socketEvents, users, children, socket, user }, ref) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesContainerRef = useRef(null);
    const isMobile = useMediaQuery({ maxWidth: 767 });


    useImperativeHandle(ref, () => ({
        addMessage: (message) => {
            setMessages(prevMessages => [...prevMessages, message]);
        }
    }));

    useEffect(() => {
        socketEvents.forEach(({ event, handler }) => {
            socket.on(event, handler);
        });

        return () => {
            socketEvents.forEach(({ event, handler }) => {
                socket.off(event, handler);
            });
        };
    }, [socketEvents, socket]);

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(newMessage);
            setNewMessage('');
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

    const canSendMessage = () => {
        return newMessage.trim();
    };

    const handleCollapseUsersList = () => {
        setUsersListCollapsed(!usersListCollapsed);
    };

    const printFile = (file) => {
        // Display file depending on its extension
        const fileExtension = file.split('.').pop().toLowerCase();

        const imagesExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif', 'jp2', 'j2k', 'jpf', 'jpx', 'jpm', 'mj2'];
        const videosExtensions = ['mp4', 'webm', 'avi', 'mov', 'flv', 'wmv', 'mkv', '3gp', 'hevc', 'h264', 'h265', 'vp9', 'av1'];

        if (imagesExtensions.includes(fileExtension)) {
            return <div>
                <Image
                    src={file}
                    alt="file"
                    style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px', cursor: 'pointer' }}
                    preview={{ mask: <Button icon={<EyeOutlined />} type="primary" shape="circle" size="large" /> }} />
            </div>;
        } else if (videosExtensions.includes(fileExtension)) {
            return <video controls style={{ maxWidth: '200px', borderRadius: '4px' }}>
                <source src={file} type={`video/${fileExtension}`} />
                Your browser does not support the video tag.
            </video>;
        } else {
            return <Button type="link" href={file} target="_blank" rel="noopener noreferrer">
                Télécharger le fichier
            </Button>;
        }
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages?.length]);

    return (
        <>
            <div style={{ overflowY: 'auto', position: 'relative', flexGrow: 1 }}>
                <Content style={{ padding: '0 0', overflowY: 'auto', position: 'relative', flexGrow: 1 }}>
                    <Row>
                        <Col lg={18} xs={24} style={{}} order={isMobile ? 2 : 1}>
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
                                            printFile(message.file)
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
                            {children ? children : null}
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
                        <Button type="primary" onClick={() => handleSendMessage(newMessage)} disabled={!canSendMessage()} icon={<SendOutlined />} />
                    </Space.Compact>
                </Space>
            </div>
        </>
    );
});

BaseChat.displayName = 'BaseChat';

export default BaseChat;
