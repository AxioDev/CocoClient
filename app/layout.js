// app/layout.js
import { Metadata } from 'next';
import Head from 'next/head';
import './globals.css';
import { SocketProvider } from '../contexts/SocketContext';
import { UserProvider } from '../contexts/UserContext';
import { ChatProvider } from '../contexts/ChatContext';

export const metadata = {
  title: 'Coco - Chat en Ligne Populaire en France',
  description: 'Coco est un site de chat en ligne populaire en France, permettant aux utilisateurs de discuter et de se connecter avec d\'autres sans inscription préalable. Sécurisé, rapide et convivial.',
  keywords: 'chat en ligne, Coco, discuter en ligne, tchat France, chat gratuit, sécurité, simplicité',
  author: 'Coco',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://chatcoco.app',
    title: 'Coco - Chat en Ligne Populaire en France',
    description: 'Coco est un site de chat en ligne populaire en France, permettant aux utilisateurs de discuter et de se connecter avec d\'autres sans inscription préalable. Sécurisé, rapide et convivial.',
    site_name: 'Coco',
    images: [
      {
        url: 'https://chatcoco.app/opengraph.png',
        width: 800,
        height: 600,
        alt: 'Coco Logo',
      },
    ],
  },
  twitter: {
    handle: '@chatcoco',
    site: '@chatcoco',
    cardType: 'summary_large_image',
  },
  manifest : "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="robots" content="index, follow" />
        <meta name="google-site-verification" content="your-google-site-verification-code" />
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <meta name="author" content={metadata.author} />
        <meta property="og:type" content={metadata.openGraph.type} />
        <meta property="og:locale" content={metadata.openGraph.locale} />
        <meta property="og:url" content={metadata.openGraph.url} />
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta property="og:description" content={metadata.openGraph.description} />
        <meta property="og:site_name" content={metadata.openGraph.site_name} />
        {metadata.openGraph.images.map((image, index) => (
          <meta key={index} property="og:image" content={image.url} />
        ))}
        <meta name="twitter:card" content={metadata.twitter.cardType} />
        <meta name="twitter:site" content={metadata.twitter.site} />
        <meta name="twitter:creator" content={metadata.twitter.handle} />
        <meta name="twitter:title" content={metadata.openGraph.title} />
        <meta name="twitter:description" content={metadata.openGraph.description} />
        {metadata.openGraph.images.map((image, index) => (
          <meta key={index} name="twitter:image" content={image.url} />
        ))}
      </Head>
      <body>
        <p className='visually-hidden'>coco est le premier chat gratuit de France : tchater et voir des webcam . le chat sans inscription pour discuter avec des milliers de connectés.</p>
        <SocketProvider>
          <UserProvider>
            <ChatProvider>
              {children}
            </ChatProvider>
          </UserProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
