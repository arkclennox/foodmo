/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Vercel image optimization quota is exhausted this billing cycle.
    // Any cache-miss triggers a 400 from /_next/image, so we bypass the
    // optimizer entirely until we migrate sources to Supabase Storage.
    // Roughly 40% of source URLs are still alive (Google's gps-cs-s
    // tokens that haven't expired yet); the rest will fall back to the
    // SVG placeholder until migrated.
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  compress: true,
  poweredByHeader: false,
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
    optimizePackageImports: ['geist'],
  },
};

export default nextConfig;
