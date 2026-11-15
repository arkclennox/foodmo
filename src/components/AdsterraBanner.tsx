'use client';

import { useEffect, useState } from 'react';
import { ADSTERRA, type BannerUnit } from '@/lib/ads';

/** Tailwind's `lg` breakpoint: below it the listing sidebar stacks under the content. */
const LG_MIN_WIDTH = 1024;

/**
 * Adsterra display banner. Each banner runs inside its own iframe because
 * Adsterra's banner code reads a global `atOptions`, which would collide when
 * several banners share one page. Space is reserved up front so the layout
 * doesn't jump when the ad loads.
 *
 * `mobileOnly` hides the slot from `lg` up and doesn't load the ad there at all.
 */
export function AdsterraBanner({
  unit = 'banner300x250',
  mobileOnly = false,
  className = '',
}: {
  unit?: BannerUnit;
  mobileOnly?: boolean;
  className?: string;
}) {
  const { key, src, width, height } = ADSTERRA[unit];
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(!mobileOnly || window.innerWidth < LG_MIN_WIDTH);
  }, [mobileOnly]);
  if (!key || !src) return null;

  const srcDoc = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body><script>atOptions={'key':${JSON.stringify(key)},'format':'iframe','height':${height},'width':${width},'params':{}};</script><script src=${JSON.stringify(src)}></script></body></html>`;

  return (
    <div className={`flex flex-col items-center ${mobileOnly ? 'lg:hidden' : ''} ${className}`}>
      <span className="mb-1 text-[10px] uppercase tracking-wide text-black/40">Iklan</span>
      <div style={{ width, height, maxWidth: '100%' }} className="overflow-hidden">
        {show && (
          <iframe
            title="Iklan"
            srcDoc={srcDoc}
            width={width}
            height={height}
            loading={mobileOnly ? 'eager' : 'lazy'}
            scrolling="no"
            style={{ border: 0, display: 'block' }}
          />
        )}
      </div>
    </div>
  );
}
