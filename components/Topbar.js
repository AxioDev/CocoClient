import Styles from '@/styles/topbar.module.css';
import { Layout, Tabs, Spin, Menu, Button } from 'antd';
import Link from 'next/link';
import { UserOutlined, DownOutlined, EditOutlined } from '@ant-design/icons';
import Image from 'next/image';

const { Header, Sider, Content } = Layout;

export default function Topbar({ user, onItemClick }) {
    return <Header className={Styles.header}>
        <Link href='/' style={{ display: 'flex', alignItems: 'center' }}>
            <Image src={'/logo-white.svg'} alt="Coco" width={100} height={32} />
        </Link>
        <Menu
            mode="horizontal"
            selectedKeys={['1']}
            className='topbar-menu'
            style={{ flex: 1, justifyContent: 'flex-end' }}
            onClick={onItemClick}
            overflowedIndicator={<DownOutlined />}
            items={[
                {
                    key: 'update_profile',
                    label: <>
                        <Button type="link">
                            <EditOutlined />
                            Modifier mon profil
                        </Button>
                    </>,
                    href: '/'
                },
                {
                    key: '1',
                    label: (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <UserOutlined />
                            <span style={{ marginLeft: '8px' }}>
                                {user.nickname || 'Inconnu'}
                            </span>
                        </div>
                    )
                }
            ]}
        />
    </Header>
}