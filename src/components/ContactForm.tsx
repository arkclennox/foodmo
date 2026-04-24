'use client';

import { useState } from 'react';

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<
    { ok: true } | { ok: false; message: string } | null
  >(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get('name') ?? ''),
      email: String(fd.get('email') ?? ''),
      subject: String(fd.get('subject') ?? ''),
      message: String(fd.get('message') ?? ''),
    };
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { success: boolean; error?: { message?: string } };
      if (res.ok && data.success) {
        setResult({ ok: true });
        e.currentTarget.reset();
      } else {
        setResult({ ok: false, message: data.error?.message ?? 'Gagal mengirim pesan.' });
      }
    } catch {
      setResult({ ok: false, message: 'Jaringan bermasalah, coba lagi.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-5">
      <div>
        <label htmlFor="contact-name" className="label-base">
          Nama
        </label>
        <input id="contact-name" name="name" required className="input-base" />
      </div>
      <div>
        <label htmlFor="contact-email" className="label-base">
          Email
        </label>
        <input id="contact-email" name="email" type="email" required className="input-base" />
      </div>
      <div>
        <label htmlFor="contact-subject" className="label-base">
          Subjek
        </label>
        <input id="contact-subject" name="subject" className="input-base" />
      </div>
      <div>
        <label htmlFor="contact-message" className="label-base">
          Pesan
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          className="input-base"
        />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Mengirim…' : 'Kirim pesan'}
        </button>
        {result && result.ok && (
          <span className="text-sm text-green-700">Pesan terkirim — terima kasih!</span>
        )}
        {result && !result.ok && (
          <span className="text-sm text-red-600">{result.message}</span>
        )}
      </div>
    </form>
  );
}
