import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { GameProvider } from '@/contexts/GameContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WebSocketProvider } from '@/contexts/WebSocketContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Checkmate.Uno - Chess Meets Uno',
  description: 'A fusion of chess strategy and Uno power cards',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-black">
        <AuthProvider>
          <ThemeProvider>
            <GameProvider>
              <WebSocketProvider>
                {children}
              </WebSocketProvider>
            </GameProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
