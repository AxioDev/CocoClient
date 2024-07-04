// components/ChatTabsManager.js
'use client';

import React from 'react';
import { Tabs } from 'antd';
import PrivateChat from '@/components/PrivateChat';
import RoomChat from '@/components/RoomChat';
import { createNewTab } from '@/utils/tabs';
import { useChat } from '@/contexts/ChatContext';

const ChatTabsManager = () => {
    const { state, dispatch } = useChat();

    const handleTabClose = (e, key) => {
        e.stopPropagation();
        dispatch({ type: 'REMOVE_TAB', payload: key });
    };

    const handleTabChange = (key) => {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: key });
    };

    return (
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
    );
};

export default ChatTabsManager;
