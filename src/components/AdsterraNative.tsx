'use client';

import { useEffect, useRef } from 'react';
import { ADSTERRA } from '@/lib/ads';

/**
 * Adsterra native banner. Its script fills `#container-<key>`, so use at most
 * one per page. The script is re-added on every mount so it also works after
 * client-side navigation.
 */
export function AdsterraNative({ className = '' }: { className?: string }) {
  const { key, src } = ADSTERRA.native;
  const slot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = slot.current;
    if (!el || !key || !src) return;
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = src;
    el.appendChild(script);
    return () => {
      script.remove();
      const box = el.querySelector(`#container-${key}`);
      if (box) box.innerHTML = '';
    };
  }, [key, src]);

  if (!key || !src) return null;
  return (
    <div className={className}>
      <span className="mb-1 block text-[10px] uppercase tracking-wide text-black/40">Iklan</span>
      <div ref={slot}>
        <div id={`container-${key}`} />
      </div>
    </div>
  );
}
