import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Upload, message, Image, Flex } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { uploadFile } from '@/api/upload';
import { getUserProfile, updateUserProfile } from '@/api/user';

const ProfileModal = ({ visible, onClose, user }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getUserProfile(user._id);
                form.setFieldsValue(response);
                setAvatarUrl(response.avatarUrl);
            } catch (error) {
                console.error('Error getting profile:', error);
                message.error('Erreur lors de la récupération du profil');
            }
        };
        if (visible) {
            fetchProfile();
        }
    }, [visible, user._id]);

    const handleUpload = async ({ file }) => {
        try {
            const fileUrl = await uploadFile(file);
            setAvatarUrl(fileUrl);
            form.setFieldsValue({ avatarUrl: fileUrl });

            const responseUpdate = await updateUserProfile(user._id, { avatarUrl: fileUrl });

            message.success('Avatar téléchargé avec succès');
        } catch (error) {
            message.error('Erreur lors du téléchargement de l\'avatar');
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            await updateUserProfile(user._id, values);
            message.success('Profil mis à jour avec succès');
            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
            message.error('Erreur lors de la mise à jour du profil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Mettre à jour le profil"
            open={visible}
            onCancel={onClose}
            footer={null}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item name="bio" label="Biographie">
                    <Input.TextArea rows={4} />
                </Form.Item>
                <Form.Item label="Télécharger l'avatar">
                    <Flex align="center" justify='space-between' gap={10}>
                        <Upload
                            customRequest={handleUpload}
                            showUploadList={false}
                            accept="image/*"
                        >
                            <Button icon={<UploadOutlined />}>Cliquez pour télécharger</Button>
                        </Upload>
                        {avatarUrl && (
                            <div style={{ marginTop: 10 }}>
                                <Image src={avatarUrl} alt="Avatar" style={{ width: 100 }} />
                            </div>
                        )}
                    </Flex>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Mettre à jour le profil
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ProfileModal;
