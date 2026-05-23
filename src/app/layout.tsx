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
  title: 'BizPilot AI — Business Dashboard for Leads, Invoices & Appointments',
  description: 'Manage leads, appointments, invoices, reports, billing, and business profile settings with a full-stack SaaS-style dashboard.',
  keywords: ['CRM', 'AI', 'Business', 'Sales', 'Follow-ups', 'Bookings', 'Scheduling', 'Invoices'],
  openGraph: {
    title: 'BizPilot AI — Business Dashboard for Leads, Invoices & Appointments',
    description: 'Manage leads, appointments, invoices, reports, and billing flows with a full-stack SaaS-style dashboard.',
    url: 'https://bizpilot-ai-ten.vercel.app',
    siteName: 'BizPilot AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BizPilot AI — Business Dashboard for Leads, Invoices & Appointments',
    description: 'Manage leads, appointments, invoices, reports, billing, and business profile settings with a full-stack SaaS-style dashboard.',
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
