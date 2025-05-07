import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import { cn } from '@/lib/utils';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'FileShare - Easy Text File Sharing',
  description: 'Upload .txt files and share them easily with a unique link.',
  icons: {
    // Consider adding a generic icon or removing this if no specific icon is available
    // icon: "/favicon.ico", 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased flex flex-col',
          geistSans.variable,
          geistMono.variable
        )}
      >
        <Header />
        <main className="flex-grow flex flex-col items-center p-4 sm:p-6 md:p-8">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
