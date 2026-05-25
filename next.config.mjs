/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Skip Vercel image optimization: the bulk of listing photos already
    // come from Google's CDN (googleusercontent.com) which serves
    // browser-appropriate formats. Re-optimizing burns Vercel's transform
    // quota with negligible gain. Browsers still benefit from Image
    // component's lazy loading and CLS-safe aspect ratios.
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
