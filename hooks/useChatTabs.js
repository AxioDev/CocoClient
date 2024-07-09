import React, { useEffect, useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import PrivateChat from '@/components/PrivateChat';
import RoomChat from '@/components/RoomChat';
import { createNewTab } from '@/utils/tabs';

const useChatTabs = () => {
    const { state, dispatch } = useChat();
    const [tabs, setTabs] = useState(state.tabs);

    useEffect(() => {
        setTabs(state.tabs);
    }, [state.tabs]);

    const handleTabClose = (e, key) => {
        e.stopPropagation();
        dispatch({ type: 'REMOVE_TAB', payload: key });
    };

    const openPrivateChat = (user, recipient) => {
        console.log('Tabs', tabs);
        if (!tabs.find(tab => tab.key === recipient._id)) {
            const newTabRef = React.createRef();
            const newTab = createNewTab(
                recipient._id,
                recipient.nickname,
                <PrivateChat ref={newTabRef} initialMessages={[]} user={user} recipient={recipient} />,
                handleTabClose
            );

            dispatch({
                type: 'ADD_TAB',
                payload: { ...newTab, ref: newTabRef }
            });
        } else {
            console.log('Setting active tab:', recipient._id);
            dispatch({ type: 'SET_ACTIVE_TAB', payload: recipient._id });
        }
    };

    const openRoomChat = (room) => {
        if (!tabs.find(tab => tab.key === room._id)) {
            const newTabRef = React.createRef();
            const newTab = createNewTab(
                room._id,
                room.name,
                <RoomChat ref={newTabRef} room={room} />,
                handleTabClose
            );

            dispatch({
                type: 'ADD_TAB',
                payload: { ...newTab, ref: newTabRef }
            });
        } else {
            dispatch({ type: 'SET_ACTIVE_TAB', payload: room._id });
        }
    };

    return { openPrivateChat, openRoomChat };
};

export default useChatTabs;
