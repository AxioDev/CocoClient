import React, { useEffect, useState } from 'react';
import { Badge, List, Avatar, Space, Radio, Divider, Dropdown, Button, Tag, Row, Col, Spin } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { genders, ageFilters } from '../utils/common';
import { useSocket } from '../contexts/SocketContext';
import { useUser } from '../contexts/UserContext';
import { useChat } from '../contexts/ChatContext';

const initialFilters = {
    gender: 'all',
    age: 'all'
};

const UsersList = ({ onUserClick }) => {
    const socket = useSocket();
    const { state, dispatch } = useChat();
    const { user } = useUser();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filters, setFilters] = useState(initialFilters);

    useEffect(() => {
        const handleOnlineUsers = (users) => {
            dispatch({ type: 'SET_ONLINE_USERS', payload: users });
            setUsers(users);
            applyFilters(users);
        };

        const handleUserStatusChange = ({ userId, status }) => {
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.user._id === userId ? { ...user, status } : user
                )
            );
        };

        socket.emit('getOnlineUsers');

        const interval = setInterval(() => {
            socket.emit('getOnlineUsers');
        }, 1000 * 60);

        socket.on('onlineUsers', handleOnlineUsers);
        socket.on('userStatusChange', handleUserStatusChange);

        // Cleanup on unmount
        return () => {
            clearInterval(interval);
            socket.off('onlineUsers', handleOnlineUsers);
            socket.off('userStatusChange', handleUserStatusChange);
        };
    }, [dispatch, socket]);

    const applyFilters = (users) => {
        let newFilteredUsers = users;

        if (filters.gender !== 'all') {
            newFilteredUsers = newFilteredUsers.filter(user => user.user.gender === filters.gender);
        }

        if (filters.age !== 'all') {
            const ageFilter = ageFilters.find(filter => filter.key === filters.age);
            if (ageFilter && ageFilter.range) {
                const [minAge, maxAge] = ageFilter.range;
                newFilteredUsers = newFilteredUsers.filter(user => user.user.age >= minAge && user.user.age <= maxAge);
            }
        }

        setFilteredUsers(newFilteredUsers);
    };

    useEffect(() => {
        applyFilters(users);
    }, [filters, users, applyFilters]);

    const handleGenderChange = (e) => {
        setFilters({ ...filters, gender: e.target.value });
    };

    const handleAgeChange = ({ key }) => {
        setFilters({ ...filters, age: key });
    };

    const distanceToKm = (distance) => {
        return Math.round(distance / 1000);
    };

    const ageMenuItems = [
        {
            key: 'all',
            label: 'Tout',
            onClick: () => handleAgeChange({ key: 'all' })
        },
        ...ageFilters.map(filter => ({
            key: filter.key,
            label: filter.label,
            onClick: () => handleAgeChange(filter)
        }))
    ];

    const printCity = (city) => {
        if (city.length >= 20) {
            return city.substring(0, 20) + '...';
        }
        return city;
    };

    if (!user || !socket) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '12px' }}>
            <Row gutter={[4, 8]} justify="space-between" align="middle" wrap>
                <Col flex="auto">
                    <Radio.Group defaultValue="all" buttonStyle="solid" onChange={handleGenderChange}>
                        <Radio.Button key={'all'} value='all'>
                            Tout
                        </Radio.Button>
                        {genders.map((gender, idx) => (
                            <Radio.Button key={idx} value={gender.key}>
                                {gender.label}
                            </Radio.Button>
                        ))}
                    </Radio.Group>
                </Col>

                <Col flex="auto">
                    <Dropdown
                        menu={{ items: ageMenuItems }}
                        trigger={['click']}
                    >
                        <Button>
                            Âge: {ageFilters.find(f => f.key === filters.age)?.label ?? 'Tout'} <DownOutlined />
                        </Button>
                    </Dropdown>
                </Col>
            </Row>

            <Divider style={{ margin: '16px 0' }} />

            <List
                itemLayout="horizontal"
                dataSource={filteredUsers}
                locale={{ emptyText: 'Aucun utilisateur en ligne correspondant à vos critères' }}
                style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
                renderItem={(user, index) => (
                    <List.Item 
                        key={index} 
                        style={{ 
                            cursor: 'pointer', 
                            border: '1px solid #ddd',
                            borderRadius: '4px', 
                            marginBottom: '8px', 
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            padding: '8px'
                        }}
                        onClick={() => onUserClick(user.user)}
                    >
                        <List.Item.Meta
                            avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${user.user.gender === 'man' ? 1 : 0}&options[width]=40&options[height]=40`} style={{ border: '1px solid #dd' }} />}
                            title={
                                <Space>
                                    {user.user.nickname}
                                    <Tag color={user.user.gender === 'man' ? 'blue' : 'magenta'}>
                                        {user.user.gender === 'man' ? 'Homme' : 'Femme'}
                                    </Tag>
                                </Space>
                            }
                            description={
                                <>
                                    {user.user.age} ans, <em>{printCity(user.user.city?.name)}</em> ({distanceToKm(user.distance)} km)
                                </>
                            }
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};

export default UsersList;
