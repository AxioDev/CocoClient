import React, { useState, useEffect } from 'react';
import { Menu, Modal, Input, Button } from 'antd';
import { PlusOutlined, AppstoreOutlined, TeamOutlined } from '@ant-design/icons';
import { useSocket } from '@/contexts/SocketContext';

const RoomsList = ({ onRoomClick }) => {

    const socket = useSocket();
    const [rooms, setRooms] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');

    useEffect(() => {
        socket.emit('getRooms');

        socket.on('roomsList', (rooms) => {
            setRooms(rooms);
        });

        socket.on('roomCreated', (room) => {
            setRooms(prevRooms => [...prevRooms, room]);
        });

        socket.on('roomDeleted', (roomId) => {
            setRooms(prevRooms => prevRooms.filter(room => room._id !== roomId));
        });

        return () => {
            socket.off('roomsList');
            socket.off('roomCreated');
            socket.off('roomDeleted');
        };
    }, [socket]);

    const handleRoomClick = (room) => {
        onRoomClick(room);
    };

    const handleCreateRoom = () => {
        socket.emit('createRoom', { name: newRoomName, type: 'private', moderators: [] });
        setIsModalVisible(false);
        setNewRoomName('');
    };

    const publicRooms = rooms.filter(room => room.type === 'public');
    const privateRooms = rooms.filter(room => room.type === 'private');

    return (
        <>
            <Menu 
                mode="inline" 
                style={{ height: 'calc(100vh - 64px)', overflowY: 'auto', background: '#f0f2f5' }}
                defaultOpenKeys={['public-rooms', 'private-rooms']}
            >
                <Menu.SubMenu key="public-rooms" icon={<AppstoreOutlined />} title="Salons publics">
                    {publicRooms.map(room => (
                        <Menu.Item key={room._id} onClick={() => handleRoomClick(room)} style={{ height: 25, lineHeight: '25px' }}>
                            {room.name}
                        </Menu.Item>
                    ))}
                </Menu.SubMenu>

                <Menu.SubMenu key="private-rooms" icon={<TeamOutlined />} title="Salons privés">
                    {privateRooms.map(room => (
                        <Menu.Item key={room._id} onClick={() => handleRoomClick(room)} style={{ height: 25, lineHeight: '25px' }}>
                            {room.name}
                        </Menu.Item>
                    ))}
                    <Menu.Item key="create-room">
                        <Button type="link" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                            Créer un salon privé
                        </Button>
                    </Menu.Item>
                </Menu.SubMenu>
            </Menu>
            <Modal
                title="Créer un salon privé"
                open={isModalVisible}
                onOk={handleCreateRoom}
                onCancel={() => setIsModalVisible(false)}
            >
                <Input
                    placeholder="Nom du salon"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                />
            </Modal>
        </>
    );
};

export default RoomsList;
