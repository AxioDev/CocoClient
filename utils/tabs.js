import React from 'react';
import { Space } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import PrivateChat from '../components/PrivateChat';

export const createNewTab = (key, label, content, handleTabClose) => ({
    key,
    label: (
        <Space>
            {label}
            <CloseOutlined onClick={(e) => handleTabClose(e, key)} style={{ cursor: 'pointer' }} />
        </Space>
    ),
    children: content,
    handleTabClose,
});


export const updateTab = (tab, label) => ({
    ...tab,
    label: (
        <Space>
            {label}
            <CloseOutlined onClick={(e) => tab.handleTabClose(e, tab.key)} style={{ cursor: 'pointer' }} />
        </Space>
    ),

});