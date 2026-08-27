import type { Metadata } from 'next';
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google';
import { Header, Footer } from '@/components/layout';
import { CartProvider } from '@/contexts/CartContext';
import { CartDrawer } from '@/components/cart/CartDrawer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const playfair = Playfair_Display({
  variable: '--font-serif',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AURA - Modern Premium Fashion Storefront',
  description:
    'A refined customer-facing portal for online fashion and accessories. Built with Next.js and Tailwind CSS.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-base text-text-base transition-colors duration-200">
        <CartProvider>
          <Header />
          <main className="flex-grow flex flex-col w-full animate-fade-in">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
