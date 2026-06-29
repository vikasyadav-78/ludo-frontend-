import React from 'react';
import type { Metadata } from 'next';
import AppProvider from '@/providers/AppProvider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'BattleLudo - Premium Gaming Arena',
  description: 'Enter the battle arena and compete in real-time Ludo tournaments with secure ledger entries.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
