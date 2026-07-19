import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME || 'Popay'} - Crypto Invoice SaaS`,
  description: `Professional Crypto Invoice SaaS Platform powered by ${process.env.NEXT_PUBLIC_APP_NAME || 'Popay'}`,
  icons: {
    icon: '/favicon.PNG',
  },
};

import ToastProvider from '@/components/ToastProvider';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider />
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
