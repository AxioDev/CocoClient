import React, { useEffect, useState } from 'react';
import { Badge, List, Avatar, Space, Radio, Divider, Dropdown, Button, Tag, Row, Col, Spin, Skeleton, Flex } from 'antd';
import { DownOutlined, ManOutlined, WomanOutlined } from '@ant-design/icons';
import { genders, ageFilters } from '../utils/common';
import { useSocket } from '../contexts/SocketContext';
import { useUser } from '../contexts/UserContext';
import { useChat } from '../contexts/ChatContext';
import Styles from '@/styles/usersList.module.css';
import useChatTabs from '@/hooks/useChatTabs';

const initialFilters = {
    gender: 'all',
    age: 'all'
};

const UsersList = ({  }) => {
    const socket = useSocket();
    const { openPrivateChat } = useChatTabs();
    const { dispatch } = useChat();
    const { user } = useUser();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filters, setFilters] = useState(initialFilters);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleOnlineUsers = (users) => {
            dispatch({ type: 'SET_ONLINE_USERS', payload: users });
            setUsers(users);
            applyFilters(users);
            setIsLoading(false);
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

        socket.on('getOnlineUsers', handleOnlineUsers);
        socket.on('userStatusChange', handleUserStatusChange);

        // Cleanup on unmount
        return () => {
            clearInterval(interval);
            socket.off('getOnlineUsers', handleOnlineUsers);
            socket.off('userStatusChange', handleUserStatusChange);
        };
    }, [socket]);

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

    const getAvatarIcon = (user) => {

        if (user.user.avatarUrl) {
            return <Avatar size="large" src={user.user.avatarUrl} />;
        }

        return user.user.gender == 'man' ? <ManOutlined /> : <WomanOutlined />;
    }

    const handleUserClick = (onlineUser) => {
        openPrivateChat(user, onlineUser);
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
            <Flex align="middle" justify="space-between">

                <Radio.Group defaultValue="all" buttonStyle="solid"  onChange={handleGenderChange}>
                    <Radio.Button key={'all'} value='all'>
                        Tout
                    </Radio.Button>
                    {genders.map((gender, idx) => (
                        <Radio.Button key={idx} value={gender.key}>
                            {gender.label}
                        </Radio.Button>
                    ))}
                </Radio.Group>



                <Dropdown
                    
                    menu={{ items: ageMenuItems }}
                    trigger={['click']}
                >
                    <Button>
                        {ageFilters.find(f => f.key === filters.age)?.label ?? 'Tout'} <DownOutlined />
                    </Button>
                </Dropdown>

            </Flex>

            <Divider style={{ margin: '12px 0' }} />

            {isLoading ? (
                <Skeleton active />
            ) : (
                <div className={Styles.onlineUsersWrapper}>
                    <List
                        itemLayout="horizontal"
                        dataSource={filteredUsers}
                        locale={{ emptyText: 'Aucun utilisateur en ligne correspondant à vos critères' }}
                        className={Styles.onlineUsers}
                        renderItem={(user, index) => (
                            <List.Item
                                key={index}
                                className={`${Styles.onlineUser} ${user.user.gender === 'man' ? Styles.onlineUserGenderMan : Styles.onlineUserGenderWoman}`}
                                onClick={() => handleUserClick(user.user)}
                            >
                                <List.Item.Meta
                                    className={Styles.onlineUserMeta}
                                    avatar={
                                        <Badge status={user.status === 'online' ? 'success' : 'default'}>
                                            <Avatar 
                                                size="large" 
                                                icon={getAvatarIcon(user)} 
                                            />
                                        </Badge>
                                    }
                                    title={
                                        <Space>
                                            {user.user.nickname}
                                            <Tag color={user.user.gender === 'man' ? 'blue' : 'magenta'}>
                                                {user.user.age} ans
                                            </Tag>
                                        </Space>
                                    }
                                    description={
                                        <div className={Styles.onlineUserDescription}>
                                            <em>
                                                {printCity(user.user.city?.name)}
                                            </em> 
                                            ({distanceToKm(user.distance)} km)
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </div>
            )}
        </div>
    );
};

export default UsersList;
