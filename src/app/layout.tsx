import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'BizPilot AI — Your AI Business Operator',
  description: 'Your AI Employee for Sales, Follow-ups, Bookings & Payments. Never lose a customer again.',
  keywords: ['CRM', 'AI', 'Business', 'Sales', 'Follow-ups', 'Bookings', 'Scheduling', 'Invoices'],
  openGraph: {
    title: 'BizPilot AI — Your AI Business Operator',
    description: 'Automate lead scoring, custom Hinglish WhatsApp follow-ups, calendar bookings, and test-mode invoices in one place.',
    url: 'https://bizpilot-ai-ten.vercel.app',
    siteName: 'BizPilot AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BizPilot AI — Your AI Business Operator',
    description: 'Your AI Employee for Sales, Follow-ups, Bookings & Payments. Never lose a customer again.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
