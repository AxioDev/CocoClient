'use client';

import React, { createContext, useReducer, useContext, useRef } from 'react';
import { createNewTab, updateTab } from '../utils/tabs';
import PrivateChat from '../components/PrivateChat';
import HomeTab from '../components/HomeTab';
import warning from 'antd/es/_util/warning';

// Initial state
const initialState = {
    onlineUsers: [],
    tabs: [
        {
            key: 'home',
            label: 'Accueil',
            children: <HomeTab />
        }
    ],
    activeTab: 'home',
    handleTabClose: (e, key) => {
        e.preventDefault();
        dispatch({ type: 'REMOVE_TAB', payload: key });
    }
};

// Reducer
const chatReducer = (state, action) => {
    switch (action.type) {
        case 'SET_TYPING':

            const user = action.payload.user;
            const isTyping = action.payload.typing;

            console.log('Setting typing:', user, isTyping);

            return {
                ...state,
                tabs: state.tabs.map(tab => {
                    if (tab.key === user._id) {
                        return updateTab(tab, <span style={{ color: isTyping ? 'blue' : 'unset' }}>{user.nickname}</span>);
                    }
                    return tab;
                })
            };
        case 'SET_ONLINE_USERS':
            return {
                ...state,
                onlineUsers: action.payload,
                tabs: state.tabs.map(tab => 
                    tab.key === 'home' ? { ...tab, children: <HomeTab /> } : tab
                )
            };
        case 'SET_ACTIVE_TAB':
            return {
                ...state,
                activeTab: action.payload
            };
        case 'ADD_TAB':
            return {
                ...state,
                tabs: [...state.tabs, action.payload],
                activeTab: action.payload.key
            };
        case 'REMOVE_TAB':
            const newTabs = state.tabs.filter(tab => tab.key !== action.payload);
            return {
                ...state,
                tabs: newTabs.length > 0 ? newTabs : state.tabs,
                activeTab: newTabs.length > 0 ? newTabs[0].key : state.activeTab
            };
        case 'ADD_PRIVATE_MESSAGE':

            const existingTab = state.tabs.find(tab => tab.key === action.payload.key);

            if (existingTab) {

                if (existingTab.ref && existingTab.ref.current) {
                    console.log('Adding message to existing tab:', action.payload);
                    existingTab.ref.current.addMessage({ ...action.payload });
                }

                return state;

            } else {

                const newTabRef = React.createRef();
                const newTab = createNewTab(
                    action.payload.sender._id,
                    action.payload.sender.nickname,
                    <PrivateChat
                        ref={newTabRef}
                        initialMessages={[{ sender: action.payload.sender, content: action.payload.content, type: action?.payload?.type }]}
                        user={action.payload.user}
                        recipient={action.payload.sender}
                    />,
                    action.payload.handleTabClose
                );

                console.log('Adding new tab:', newTab);

                return {
                    ...state,
                    tabs: [
                        ...state.tabs,
                        { ...newTab, ref: newTabRef }
                    ],
                    activeTab: action.payload.sender._id
                };
            }
        default:
            return state;
    }
};

// Create context
const ChatContext = createContext();

// Provider component
export const ChatProvider = ({ children }) => {
    const [state, dispatch] = useReducer(chatReducer, initialState);

    return (
        <ChatContext.Provider value={{ state, dispatch }}>
            {children}
        </ChatContext.Provider>
    );
};

// Custom hook to use the ChatContext
export const useChat = () => {
    return useContext(ChatContext);
};
