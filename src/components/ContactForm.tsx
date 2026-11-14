'use client';

import { useState } from 'react';

const CONTACT_EMAIL = 'hello@foodmo.id';

/**
 * The site is a static export (no server to receive POSTs), so the form
 * composes an email in the visitor's mail app instead.
 */
export function ContactForm() {
  const [opened, setOpened] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') ?? '').trim();
    const email = String(fd.get('email') ?? '').trim();
    const subject = String(fd.get('subject') ?? '').trim() || `Pesan dari ${name}`;
    const message = String(fd.get('message') ?? '').trim();
    const body = `${message}\n\n—\n${name} <${email}>`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
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
        <button type="submit" className="btn-primary">
          Kirim lewat email
        </button>
        {opened && (
          <span className="text-sm text-black/70">
            Aplikasi email Anda akan terbuka. Tidak terbuka? Kirim ke{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-navy hover:underline">
              {CONTACT_EMAIL}
            </a>
            .
          </span>
        )}
      </div>
    </form>
  );
}
