import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const Chat = () => {
    return (
        <div style={{ margin: '20px' }}>

            <Typography>
                <Paragraph>
                    <strong>Coco</strong> est une plateforme de discussion en ligne qui offre une expérience de tchat simple et immédiate. Vous pouvez vous connecter rapidement en entrant simplement un pseudonyme, sans besoin de mot de passe ni de procédure d'inscription complexe.
                </Paragraph>
                <Paragraph>
                    Ce site se distingue par sa facilité d'utilisation, permettant aux utilisateurs de rejoindre divers salons de discussion selon leurs intérêts, allant des rencontres amicales aux discussions thématiques comme les voitures, les jeux vidéo ou encore la gastronomie.
                </Paragraph>
                <Paragraph>
                    Le site met en avant une grande liberté d'accès, ce qui le rend très attractif pour ceux qui cherchent à se connecter et échanger sans contrainte. De plus, Coco est entièrement gratuit, permettant aux utilisateurs de profiter pleinement des fonctionnalités de la plateforme sans avoir à dépenser de l'argent.
                </Paragraph>
                <Paragraph>
                    En somme, Coco se veut un espace convivial et accessible pour faire des rencontres et discuter de divers sujets avec des personnes partageant les mêmes intérêts.
                </Paragraph>
            </Typography>

        </div>
    );
};

export default Chat;