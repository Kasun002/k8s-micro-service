import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/providers';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'MQ Demo — Cart & Purchase',
  description: 'Microservices demo with NestJS + AWS SQS + LocalStack',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 font-sans antialiased">
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
