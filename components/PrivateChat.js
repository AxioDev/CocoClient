import React, { useState, useImperativeHandle, forwardRef, useEffect, useRef } from 'react';
import { Input, Button, List, Avatar, Form, Upload, message, Image, Layout, Space, Card, Row, Col, Tag, Badge, Divider } from 'antd';
import { UserOutlined, UserAddOutlined, UploadOutlined, CameraOutlined, EyeOutlined, SendOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useUser } from '../contexts/UserContext';
import { useSocket } from '@/contexts/SocketContext';
import { uploadFile } from '../api/upload';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import Peer from 'simple-peer';
import { io } from 'socket.io-client';

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
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [peer, setPeer] = useState(null);

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

        const handleOffer = ({ signalData, from }) => {
            const newPeer = new Peer({
                initiator: false,
                trickle: false,
                stream: stream
            });

            newPeer.signal(signalData);

            newPeer.on('signal', data => {
                socket.emit('videoAnswer', { signalData: data, to: from._id });
            });

            newPeer.on('stream', stream => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = stream;

                }
            });

            newPeer.on('error', error => {
                console.error('handleOffer(): ', error);
                message.error("Une erreur est survenue lors de la réception de l'offre: " + error);
            });

            setPeer(newPeer);
        };

        const handleUserTyping = ({ user }) => {
            if (!typingUsers.includes(user._id)) {
                setTypingUsers(prevUsers => [...prevUsers, user]);

                setTimeout(() => {
                    handleUserStopTyping({ user });
                }, 5000);
            }
        };

        const handleUserStopTyping = ({ user }) => {
            setTypingUsers(prevUsers => prevUsers.filter(user => user._id !== user._id));
        };

        socket.on('videoOffer', handleOffer);
        socket.on('typing', handleUserTyping);
        socket.on('stopTyping', handleUserStopTyping);

        return () => {
            socket.off('videoOffer', handleOffer);
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

    const canSendMessage = () => {
        return newMessage.trim();
    }

    const getDefaultAvatarUrl = () => {
        return recipient.gender == 'man' ? '/avatar-man.webp' : '/avatar.webp';
    }

    const startCamera = () => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                setStream(stream);

                const newPeer = new Peer({
                    initiator: true,
                    trickle: false,
                    stream: stream
                });

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                    localVideoRef.current.play();
                }

                newPeer.on('signal', data => {
                    socket.emit('videoOffer', { signalData: data, to: recipient._id });
                });

                newPeer.on('stream', stream => {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = stream;
                    }
                });

                newPeer.on('error', error => {
                    console.error("startCamera(): ", error);
                    message.error("Une erreur est survenue lors de la connexion à la caméra: " + error);
                });

                setPeer(newPeer);
            })
            .catch(error => {
                console.error('Error accessing camera:', error);
                message.error(`Vous devez autoriser l'accès à la caméra pour démarrer la conversation vidéo`);
            });
    }

    return (
        <>

            <div style={{ padding: '10px', position: 'absolute', top: 0, width: '100%', background: '#f1f1f1' }}>
                <video id="localVideo" ref={localVideoRef} style={{ width: '100%', maxHeight: '300px' }} autoPlay muted></video>
                <video id="remoteVideo" ref={remoteVideoRef} style={{ width: '100%', maxHeight: '300px' }} autoPlay></video>
            </div>
            <div style={{ overflowY: 'auto', position: 'relative', flexGrow: 1 }}>


                <Content style={{ padding: '10px', overflowY: 'auto', position: 'relative', flexGrow: 1 }}>
                    <Row>
                        <Col lg={20}>
                            <div style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
                                {messages.length === 0 && (
                                    <div style={{ textAlign: 'center', color: 'gray' }}>
                                        Pas de message pour le moment, envoyez un message pour commencer la conversation.
                                    </div>
                                )}
                                {messages.map((message, index) => (
                                    <div key={index} style={{
                                        padding: '8px 16px',
                                        borderRadius: '2px',
                                        maxWidth: '80%',
                                        wordBreak: 'break-word',
                                    }}>
                                        <strong style={{ color: 'green' }}>
                                            {message.sender?.nickname}:&nbsp;
                                        </strong>
                                        {message.content && (
                                            <span>
                                                {message.content}
                                            </span>
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
                        </Col>
                        <Col lg={4}>
                            <Card
                                hoverable
                                actions={[
                                    <UserAddOutlined key="add-friend" onClick={() => message.info('Ajouter en ami: Cette fonctionnalité n\'est pas encore disponible')} />,
                                    <InfoCircleOutlined key="info" onClick={() => message.info('Info: Cette fonctionnalité n\'est pas encore disponible')} />,
                                    <CameraOutlined key="ellipsis" onClick={startCamera} />,
                                ]}

                                cover={<img alt={`image de profil de ${recipient.nickname}`} src={recipient.avatarUrl || getDefaultAvatarUrl()} />}
                            >
                                <Card.Meta
                                    title={<>
                                        <Space>
                                            <span>{recipient.nickname}</span>

                                        </Space>
                                    </>}
                                    description={<>
                                        <Space direction="vertical">
                                            <span style={{ fontSize: '0.8em', color: 'gray' }}>
                                                {recipient.city?.name || 'Ville inconnue'}
                                            </span>
                                            <Tag>{recipient.age || 99} ans</Tag>
                                        </Space>
                                    </>}
                                />

                                {recipient.bio && (
                                    <div>
                                        <Divider />
                                        {recipient.bio}
                                    </div>
                                )}
                            </Card>
                        </Col>
                    </Row>
                </Content>
                <div ref={messagesEndRef} />
            </div>



            <div style={{ padding: '10px 0 10px 10px', position: 'absolute', bottom: 0, width: '100%', background: '#f1f1f1' }}>

                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Space.Compact style={{ width: '100%' }} size='large'>
                        <Upload {...uploadProps} showUploadList={false}>
                            <Button icon={<UploadOutlined />} />
                        </Upload>
                        {/* <Button icon={<CameraOutlined />} onClick={() => message.info('Cette fonctionnalité n\'est pas encore disponible')} /> */}
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
});

PrivateChat.displayName = 'PrivateChat';

export default PrivateChat;
