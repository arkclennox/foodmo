'use client';

import { useEffect, useState } from 'react';

type SyncResp = {
  success: boolean;
  processed?: number;
  images?: { ok: number; fail: number };
  remaining?: number;
  totalPending?: number;
  earlyExit?: boolean;
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
    let consecutiveFailures = 0;
    const HARD_STOP = 500;
    try {
      while (iterations < HARD_STOP) {
        let json: SyncResp;
        try {
          const res = await fetch('/api/admin/sync-images?limit=3', {
            method: 'POST',
          });
          const text = await res.text();
          try {
            json = JSON.parse(text);
          } catch {
            // Server returned HTML (timeout/crash). Treat as one failed
            // batch but keep going.
            consecutiveFailures++;
            setStatus(
              `Batch ${iterations + 1} gagal (timeout/HTML response). Mencoba lanjut… [${consecutiveFailures}/3]`,
            );
            if (consecutiveFailures >= 3) {
              setStatus(
                `Terhenti setelah 3 batch berturut-turut gagal. Sudah selesai: ${processed} listing, ${ok} OK, ${fail} gagal. Coba lagi nanti.`,
              );
              break;
            }
            iterations++;
            continue;
          }
        } catch (netErr) {
          consecutiveFailures++;
          setStatus(
            `Network error: ${netErr instanceof Error ? netErr.message : 'unknown'}. Mencoba lanjut… [${consecutiveFailures}/3]`,
          );
          if (consecutiveFailures >= 3) break;
          iterations++;
          continue;
        }

        if (!json.success) {
          consecutiveFailures++;
          setStatus(
            `Sync error: ${json.error?.message ?? 'unknown'}. [${consecutiveFailures}/3]`,
          );
          if (consecutiveFailures >= 3) break;
          iterations++;
          continue;
        }

        consecutiveFailures = 0;
        processed += json.processed ?? 0;
        ok += json.images?.ok ?? 0;
        fail += json.images?.fail ?? 0;
        iterations++;
        const remaining = json.remaining ?? 0;
        setStatus(
          `${processed} listing diproses · ${ok} image OK · ${fail} gagal · sisa ${remaining}…`,
        );
        if (remaining === 0) break;
        if ((json.processed ?? 0) === 0 && !json.earlyExit) break;
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
