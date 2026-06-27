import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Plan My Trip | AI-Powered Travel Architect',
  description: 'Immersive AI-first travel planning for Indian travelers. Generate itineraries, budgets, and 3D previews instantly.',
  openGraph: {
    title: 'Plan My Trip',
    description: 'Immersive AI-first travel planning for Indian travelers.',
    type: 'website',
  }
};

import { Providers } from '@/components/Providers';
import Navbar from '@/components/Navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased`}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
