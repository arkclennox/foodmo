import type { Metadata } from 'next';

export const SITE_NAME = 'Direktori Kuliner';
export const SITE_DESCRIPTION =
  'Temukan restoran, cafe, dan warung makan terbaik di seluruh Indonesia — lengkap dengan alamat, harga, fasilitas, dan artikel kuliner pilihan.';

export function siteUrl(path = ''): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  if (!path) return base;
  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildMetadata(input: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}): Metadata {
  const description = input.description ?? SITE_DESCRIPTION;
  const url = siteUrl(input.path ?? '/');
  const image = input.image;
  return {
    title: input.title,
    description,
    alternates: { canonical: url },
    robots: input.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: input.title,
      description,
      url,
      siteName: SITE_NAME,
      type: input.type ?? 'website',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: input.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}
