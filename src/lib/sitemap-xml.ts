export type UrlEntry = {
  loc: string;
  lastmod?: Date | string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isoDate(value: Date | string): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

export function urlsetXml(entries: UrlEntry[]): string {
  const body = entries
    .map((e) => {
      const lastmod = e.lastmod ? `<lastmod>${isoDate(e.lastmod)}</lastmod>` : '';
      const changefreq = e.changefreq ? `<changefreq>${e.changefreq}</changefreq>` : '';
      const priority =
        e.priority != null ? `<priority>${e.priority.toFixed(1)}</priority>` : '';
      return `<url><loc>${escapeXml(e.loc)}</loc>${lastmod}${changefreq}${priority}</url>`;
    })
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

export function indexXml(sitemaps: { loc: string; lastmod?: Date | string }[]): string {
  const body = sitemaps
    .map((s) => {
      const lastmod = s.lastmod ? `<lastmod>${isoDate(s.lastmod)}</lastmod>` : '';
      return `<sitemap><loc>${escapeXml(s.loc)}</loc>${lastmod}</sitemap>`;
    })
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`;
}

export function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
