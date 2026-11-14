import { execSync } from 'node:child_process';

/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === '1';

// A build ID that only changes with the code (not on every build), so a
// content-only re-publish leaves unchanged pages byte-identical and wrangler
// uploads just the pages that actually changed.
function stableBuildId() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'static';
  }
}

const nextConfig = {
  // The public site is published as a static export (see scripts/build-static.mjs)
  // and served from Cloudflare static assets. `next dev` keeps the full app
  // (admin + API) for managing content locally.
  ...(isStaticExport
    ? {
        output: 'export',
        generateBuildId: stableBuildId,
        // The listing index reads all ~5k listings while thousands of pages
        // render against the same DB pool; give it more than the 60 s default.
        staticPageGenerationTimeout: 300,
      }
    : {}),
  images: {
    // Images are served from Cloudflare R2 as WebP already; no optimizer.
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
    // ~5k listing pages are rendered at build time; keep the number of pages
    // rendered at once low so they don't exhaust the DB connection pool.
    ...(isStaticExport
      ? { cpus: 4, staticGenerationMaxConcurrency: 4, staticGenerationRetryCount: 3 }
      : {}),
  },
};

export default nextConfig;
