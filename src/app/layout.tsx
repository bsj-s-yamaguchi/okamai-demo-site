import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BodyWrapper from '@/components/BodyWrapper';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Demo Site - ChatPlus Demo',
  description: 'Demo Site with ChatPlus integration',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="dns-prefetch" href="//demo-site.local" />
        <link rel="dns-prefetch" href="//okamai-web.local" />
        <link rel="dns-prefetch" href="//client-console.local" />
        <link rel="dns-prefetch" href="//brave-console.local" />
        <link rel="dns-prefetch" href="//app-api.local" />
        <link rel="dns-prefetch" href="//console-api.local" />
        <link rel="preconnect" href="//demo-site.local" />
        <link rel="preconnect" href="//okamai-web.local" />
        <link rel="preconnect" href="//client-console.local" />
        <link rel="preconnect" href="//brave-console.local" />
        <link rel="preconnect" href="//app-api.local" />
        <link rel="preconnect" href="//console-api.local" />
        {/* Service Worker disabled for HTTPS development */}
        {/* <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        /> */}
      </head>
      <body
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <BodyWrapper>{children}</BodyWrapper>
      </body>
    </html>
  );
}
