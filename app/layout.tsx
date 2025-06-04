import type React from 'react';
import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { PostHogProvider } from './providers';
import Script from 'next/script';
import Header from '../components/Header';
import Footer from '../components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Score to MIDI - Convert Music Scores to MIDI Files Fast',
  description: 'Easily convert your PDF or image-based music scores into high-quality MIDI files. Try our fast, free conversion tool today!',
  keywords: 'music score conversion, PDF to MIDI, image to MIDI, MIDI converter, score-to-midi',
  openGraph: {
    title: 'Convert sheet music into MIDI.',
    description: 'Convert your music scores to MIDI files with our fast and accurate tool.',
    url: 'https://score-to-midi.com/',
    type: 'website',
    icons: {
      icon: '/favicon.ico',
    },
    images: [
      {
        url: 'https://score-to-midi.com/open_graph.png',
        width: 1200,
        height: 630,
        alt: 'Score to MIDI Preview',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className="dark"> 
      <head>
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="afterInteractive">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            'name': 'Score to MIDI',
            'url': 'https://score-to-midi.com/',
          })}
        </Script>
      </head>
      <body className={inter.className}>
        {/* Global notification toaster */}
        <Toaster
          richColors
          position="top-center"
          theme="dark"
          closeButton
        />
        {/* Main header with authentication and subscription controls */}
        <Header />
        <PostHogProvider>
          {children}
        </PostHogProvider>
        <Footer />
      </body>
    </html>
  );
}