import LoginForm from '../components/LoginForm';
import { Button, Form, Input, Radio, Typography, Row, Col, AutoComplete, message, Spin, Card } from 'antd';
const { Title, Paragraph, Text } = Typography;
import styles from "@/styles/landing.module.css";
import Illu1 from '@/assets/illu1.webp';
import Illu2 from '@/assets/illu2.webp';
import Illu3 from '@/assets/illu3.webp';
import Illu4 from '@/assets/illu4.webp';
import Illu5 from '@/assets/illu5.webp';
import Illu6 from '@/assets/illu6.webp';
import Illu7 from '@/assets/illu7.webp';
import Step1 from '@/assets/step1.webp';
import Step2 from '@/assets/step2.webp';
import Step3 from '@/assets/step3.webp';
import Logo from '@/components/Logo';
import Image from 'next/image';

export default function LandingPage() {
    return (
        <div className={styles.page}>
            <Row justify="center" align="middle" className={styles.loginSection}>
                <Col xs={22} sm={16} md={12} lg={8} >
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>

                        <h1 className="visually-hidden">Coco (anciennement coco.fr, coco.gg) - Chat en Ligne sans inscription Populaire en France</h1>

                        <Logo width={300} height={120} />

                        <p className={styles.baseLine}>
                            Le chat <strong>sans inscription</strong>, pour discuter en toute <strong>liberté</strong> !
                        </p>

                    </div>
                    <LoginForm />
                </Col>
            </Row>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                {/* Section 1: Introduction */}
                <section style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <Title level={2}>Bienvenue sur Coco</Title>
                    <Paragraph style={{ color: '#666' }}>
                        Discutez en live sur le premier site de chat gratuit de France avec des milliers de connectés. Tout est instantané et direct : salons publics, rooms privés ou messages privés. Coco n'est pas seulement un tchat mais aussi un réseau social où vous pouvez retrouver vos amis, multiplier les rencontres et développer votre réseau de connaissances. Coco est un forum de discussion sympa.
                    </Paragraph>
                    <Paragraph style={{ color: '#333' }}>
                        coco est le premier chat gratuit de France : tchater et voir des webcam . le chat sans inscription pour discuter avec des milliers de connectés.
                    </Paragraph>
                    <Image src={Illu1} alt="Coco Platform" sizes="100vw" style={{
                        objectFit: 'cover',
                        width: '100%',
                        height: '200px',
                        borderRadius: '4px'
                    }} />
                </section>

                {/* Section 2: Fonctionnalités */}
                <section style={{ marginBottom: '50px' }}>
                    <Title level={3} style={{ textAlign: 'center' }}>
                        Fonctionnalités uniques de Coco
                    </Title>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                            <Card title="Chat en Direct" bordered={false} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'start', textAlign: 'center', height: '100%' }}>
                                <Paragraph style={{ color: '#666' }}>
                                    Discutez en direct avec des milliers d'utilisateurs connectés. Rejoignez des salons publics, créez des rooms privées ou envoyez des messages privés instantanément.
                                </Paragraph>
                                <Image src={Illu2} alt="Chat en Direct" style={{ width: '30%', height: 'auto', borderRadius: '50%' }} />
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card title="Webcam et Médias" bordered={false} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'start', textAlign: 'center', height: '100%' }}>
                                <Paragraph style={{ color: '#666' }}>
                                    Échangez votre webcam en haute définition, envoyez des photos, partagez des vidéos et de la musique. Participez aux salons vocaux avec votre micro.
                                </Paragraph>
                                <Image src={Illu3} alt="Webcam et Médias" style={{ width: '30%', height: 'auto', borderRadius: '50%' }} />
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card title="Réseau Social" bordered={false} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'start', textAlign: 'center', height: '100%' }}>
                                <Paragraph style={{ color: '#666' }}>
                                    Retrouvez vos amis, faites des rencontres et développez votre réseau. Coco combine le meilleur du chat et du réseau social.
                                </Paragraph>
                                <Image src={Illu4} alt="Réseau Social" style={{ width: '30%', height: 'auto', borderRadius: '50%' }} />
                            </Card>
                        </Col>
                    </Row>
                </section>

                {/* Section 3: Avantages */}
                <section style={{ marginBottom: '50px' }}>
                    <Title level={3}>Pourquoi choisir Coco ?</Title>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                            <Card bordered={false} cover={<Image alt="Accessibilité" src={Illu6} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                                <Title level={4}>Accessibilité</Title>
                                <Paragraph style={{ color: '#666' }}>
                                    Coco est facile à utiliser et accessible à tous. Il suffit de créer un pseudo, d'entrer quelques informations de base pour commencer à discuter.
                                </Paragraph>
                            </Card>
                        </Col>
                        <Col xs={24} md={12}>
                            <Card bordered={false} cover={<Image alt="Rencontres Sociales" src={Illu7} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                                <Title level={4}>Rencontres Sociales</Title>
                                <Paragraph style={{ color: '#666' }}>
                                    Faites des rencontres intéressantes et enrichissantes avec des personnes du monde entier. Partagez vos expériences et découvrez celles des autres.
                                </Paragraph>
                            </Card>
                        </Col>
                    </Row>
                </section>

                {/* Section 4: Utilisation */}
                <section style={{ marginBottom: '50px', textAlign: 'center' }}>
                    <Title level={3}>Comment utiliser Coco</Title>
                    <Row gutter={[16, 16]} justify="center">
                        <Col xs={24} md={8}>
                            <Card
                                bordered={false}
                                cover={<Image alt="Étape 1" src={Step1} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />}
                                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'start', 'height': '100%' }}>
                                <Title level={4}>Étape 1</Title>
                                <Paragraph style={{ color: '#666' }}>
                                    Rentrez un pseudo, un âge, votre genre et votre code postal pour accéder au chat Coco.
                                </Paragraph>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card
                                bordered={false}
                                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'start', height: '100%' }}
                                cover={<Image alt="Étape 2" src={Step2} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />}
                            >
                                <Title level={4}>Étape 2</Title>
                                <Paragraph style={{ color: '#666' }}>
                                    Utilisez un pseudonyme original pour vous différencier des autres connectés de Coco et avoir plus de succès.
                                </Paragraph>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card
                                bordered={false}
                                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'start', height: '100%' }}
                                cover={<Image alt="Étape 3" src={Step3} style={{ width: '100%', height: 'auto', height: '100px', objectFit: 'cover' }} />}
                            >
                                <Title level={4}>Étape 3</Title>
                                <Paragraph style={{ color: '#666' }}>
                                    Pensez à charger votre avatar pour augmenter vos chances de rencontres sur le chat et améliorer votre tchatche.
                                </Paragraph>
                            </Card>
                        </Col>
                    </Row>
                </section>

                {/* Section 5: Témoignages */}
                <section style={{ marginBottom: '50px', textAlign: 'center' }}>
                    <Title level={3}>Ce que disent nos utilisateurs</Title>
                    <Row gutter={[16, 16]} justify="center">
                        <Col xs={24} md={8}>
                            <Card bordered={false} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                                <Text strong>Marie, 28 ans</Text>
                                <Paragraph style={{ color: '#666' }}>
                                    «Coco m'a permis de rencontrer des personnes incroyables avec qui je partage beaucoup de choses en commun. L'anonymat m'a vraiment mise à l'aise.»
                                </Paragraph>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card bordered={false} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                                <Text strong>Jean, 35 ans</Text>
                                <Paragraph style={{ color: '#666' }}>
                                    « La simplicité de l'interface est ce qui m'a tout de suite plu. En quelques clics, j'étais déjà en train de discuter avec des gens du monde entier. »
                                </Paragraph>
                            </Card>
                        </Col>
                    </Row>
                </section>

                {/* Section 6: Appel à l'action */}
                <section style={{ textAlign: 'center', marginTop: '50px', padding: '40px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                    <Title level={3}>Rejoignez-nous maintenant</Title>
                    <Paragraph>
                        Inscrivez-vous gratuitement et commencez à discuter dès maintenant. Rencontrez de nouvelles personnes et vivez des expériences uniques sur Coco.
                    </Paragraph>
                    <a href="#login-form">
                        <Button type="primary" size="large">
                            Commencer à discuter
                        </Button>
                    </a>
                </section>
            </div>
        </div>
    );
}