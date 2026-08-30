import type { Metadata } from 'next';
import './globals.css';
import { PwaRegister } from '@/components/pwa-register';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Sema 7 – Mein persönlicher Sprachweg',
  description: 'Offlinefähiger persönlicher Vokabeltrainer für Swahili – sieben Lernschritte pro Runde.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg' },
  openGraph: {
    title: 'Sema 7',
    description: 'Mein persönlicher Sprachweg – sieben Wörter, eine machbare Runde.',
    images: [{ url: '/og.png', width: 1600, height: 900, alt: 'Sema 7 – Mein persönlicher Sprachweg' }],
  },
  twitter: { card: 'summary_large_image', title: 'Sema 7', description: 'Mein persönlicher Sprachweg', images: ['/og.png'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body><PwaRegister />{children}</body>
    </html>
  );
}
