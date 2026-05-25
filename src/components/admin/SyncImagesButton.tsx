'use client';

import { useEffect, useState } from 'react';

type SyncResp = {
  success: boolean;
  processed?: number;
  images?: { ok: number; fail: number };
  remaining?: number;
  totalPending?: number;
  error?: { message?: string };
};

export function SyncImagesButton() {
  const [pending, setPending] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function refreshCount() {
    try {
      const res = await fetch('/api/admin/sync-images', { method: 'GET' });
      const json = (await res.json()) as { success: boolean; pending?: number };
      if (json.success) setPending(json.pending ?? 0);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    refreshCount();
  }, []);

  async function runSync() {
    setBusy(true);
    setStatus('Memulai sinkron…');
    let processed = 0;
    let ok = 0;
    let fail = 0;
    let iterations = 0;
    const HARD_STOP = 300;
    try {
      while (iterations < HARD_STOP) {
        const res = await fetch('/api/admin/sync-images?limit=15', {
          method: 'POST',
        });
        const json: SyncResp = await res.json();
        if (!json.success) {
          setStatus(`Error: ${json.error?.message ?? 'unknown'}`);
          break;
        }
        processed += json.processed ?? 0;
        ok += json.images?.ok ?? 0;
        fail += json.images?.fail ?? 0;
        iterations++;
        const remaining = json.remaining ?? 0;
        setStatus(
          `${processed} listing diproses · ${ok} image OK · ${fail} gagal · sisa ${remaining}…`,
        );
        if (remaining === 0 || (json.processed ?? 0) === 0) break;
      }
      setStatus(`Selesai. ${processed} listing · ${ok} OK · ${fail} gagal.`);
      await refreshCount();
    } catch (e) {
      setStatus(`Terhenti: ${e instanceof Error ? e.message : 'unknown'}`);
    } finally {
      setBusy(false);
    }
  }

  if (pending === null) return null;
  if (pending === 0 && !status) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-amber-900">
            {pending > 0
              ? `${pending} listing punya gambar belum di R2`
              : 'Semua gambar sudah di R2'}
          </div>
          {status && (
            <div className="mt-1 text-xs text-amber-800">{status}</div>
          )}
        </div>
        {pending > 0 && (
          <button
            type="button"
            onClick={runSync}
            disabled={busy}
            className="btn-primary"
          >
            {busy ? 'Sedang sync…' : 'Sync gambar ke R2'}
          </button>
        )}
      </div>
    </div>
  );
}
