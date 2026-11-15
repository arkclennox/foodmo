'use client';

import { useEffect, useState } from 'react';
import { ADSTERRA } from '@/lib/ads';

/**
 * Adsterra display banner (300x250). Each banner runs inside its own iframe
 * because Adsterra's banner code reads a global `atOptions`, which would
 * collide when several banners share one page. Space is reserved up front so
 * the layout doesn't jump when the ad loads.
 */
export function AdsterraBanner({ className = '' }: { className?: string }) {
  const { key, src } = ADSTERRA.banner300x250;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!key || !src) return null;

  const width = 300;
  const height = 250;
  const srcDoc = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body><script>atOptions={'key':${JSON.stringify(key)},'format':'iframe','height':${height},'width':${width},'params':{}};</script><script src=${JSON.stringify(src)}></script></body></html>`;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <span className="mb-1 text-[10px] uppercase tracking-wide text-black/40">Iklan</span>
      <div style={{ width, height }} className="overflow-hidden">
        {mounted && (
          <iframe
            title="Iklan"
            srcDoc={srcDoc}
            width={width}
            height={height}
            loading="lazy"
            scrolling="no"
            style={{ border: 0, display: 'block' }}
          />
        )}
      </div>
    </div>
  );
}
