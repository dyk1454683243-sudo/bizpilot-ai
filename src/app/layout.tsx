import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'BizPilot AI — Your AI Business Operator',
  description:
    'Your AI Employee for Sales, Follow-ups, Bookings & Payments. Never lose a customer again.',
  keywords: ['CRM', 'AI', 'Business', 'Sales', 'Follow-ups', 'Bookings'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
