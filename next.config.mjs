/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // After migrating all listing/article images to Cloudflare R2, we no
    // longer rely on Vercel image optimization as a proxy-cache. R2
    // already serves WebP via Cloudflare's CDN, so optimizer round-trips
    // would only burn quota for negligible gain.
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
