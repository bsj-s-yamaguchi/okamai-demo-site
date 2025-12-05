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
  const widgetUrl = process.env.NEXT_PUBLIC_WIDGET_URL || 'https://okamai-web.local';
  const widgetDomain = widgetUrl.replace(/^https?:\/\//, '//');

  return (
    <html lang="ja">
      <head>
        <link rel="dns-prefetch" href="//demo-site.local" />
        <link rel="dns-prefetch" href={widgetDomain} />
        <link rel="dns-prefetch" href="//client-console.local" />
        <link rel="dns-prefetch" href="//brave-console.local" />
        <link rel="dns-prefetch" href="//app-api.local" />
        <link rel="dns-prefetch" href="//console-api.local" />
        <link rel="preconnect" href="//demo-site.local" />
        <link rel="preconnect" href={widgetDomain} />
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
