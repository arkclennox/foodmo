/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Vercel image optimization stays ON because it doubles as a permanent
    // proxy-cache: Google's `gps-cs-s` photo URLs are token-protected and
    // expire silently, so once we lose the cached version we cannot
    // re-fetch the source. Settings below minimise transformation usage
    // to stay inside the Hobby tier:
    //  - WebP only (skipping AVIF halves the transform count per image)
    //  - 3 deviceSizes + 2 imageSizes = max 5 variants per source URL
    //  - 1-year TTL so cached variants are not re-transformed
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    formats: ['image/webp'],
    deviceSizes: [640, 1024, 1600],
    imageSizes: [96, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
  compress: true,
  poweredByHeader: false,
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
    optimizePackageImports: ['geist'],
  },
};

export default nextConfig;
