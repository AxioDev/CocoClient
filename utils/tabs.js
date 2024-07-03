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
    children: content
});
