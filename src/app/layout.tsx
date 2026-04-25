import './globals.css';
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE_NAME} — Direktori Restoran, Cafe & Warung Makan Indonesia`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    url: siteUrl(),
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: '#01083C',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-white font-sans text-black antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      </body>
    </html>
  );
}
