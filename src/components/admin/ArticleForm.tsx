'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { slugify } from '@/lib/slug';
import { ARTICLE_STATUSES } from '@/lib/constants';

export type ArticleFormData = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  contentMarkdown: string;
  featuredImageUrl: string;
  categoryId: string;
  tags: string[];
  relatedListingIds: string[];
  authorName: string;
  status: string;
  publishedAt: string; // ISO yyyy-mm-dd
  metaTitle: string;
  metaDescription: string;
};

export const emptyArticleForm: ArticleFormData = {
  title: '',
  slug: '',
  excerpt: '',
  contentHtml: '',
  contentMarkdown: '',
  featuredImageUrl: '',
  categoryId: '',
  tags: [],
  relatedListingIds: [],
  authorName: '',
  status: 'draft',
  publishedAt: '',
  metaTitle: '',
  metaDescription: '',
};

type Option = { id: string; name: string };
type ListingOption = { id: string; name: string; slug: string };

export function ArticleForm({
  initial,
  categories,
  listings,
  articleId,
}: {
  initial: ArticleFormData;
  categories: Option[];
  listings: ListingOption[];
  articleId?: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<ArticleFormData>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoSlug = useMemo(() => slugify(data.title), [data.title]);

  const update = <K extends keyof ArticleFormData>(key: K, value: ArticleFormData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      ...data,
      slug: data.slug || autoSlug,
      categoryId: data.categoryId || null,
      publishedAt:
        data.status === 'published' && !data.publishedAt
          ? new Date().toISOString()
          : data.publishedAt || null,
    };
    const url = articleId ? `/api/admin/articles/${articleId}` : '/api/admin/articles';
    const method = articleId ? 'PATCH' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as { success: boolean; error?: { message?: string } };
      if (!res.ok || !body.success) {
        throw new Error(body.error?.message ?? 'Gagal menyimpan');
      }
      router.push('/admin/articles');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="card space-y-4 p-5">
        <div>
          <label className="label-base">Judul *</label>
          <input
            required
            value={data.title}
            onChange={(e) => update('title', e.target.value)}
            className="input-base"
          />
        </div>
        <div>
          <label className="label-base">Slug</label>
          <input
            value={data.slug}
            onChange={(e) => update('slug', e.target.value)}
            placeholder={autoSlug}
            className="input-base"
          />
          <p className="mt-1 text-xs text-black/50">
            Kosongkan untuk otomatis. /blog/{data.slug || autoSlug || '…'}
          </p>
        </div>
        <div>
          <label className="label-base">Excerpt</label>
          <textarea
            rows={2}
            value={data.excerpt}
            onChange={(e) => update('excerpt', e.target.value)}
            className="input-base"
          />
        </div>
        <div>
          <label className="label-base">Konten (HTML) *</label>
          <textarea
            required
            rows={14}
            value={data.contentHtml}
            onChange={(e) => update('contentHtml', e.target.value)}
            className="input-base font-mono text-xs"
          />
          <p className="mt-1 text-xs text-black/50">
            MVP editor: masukkan HTML langsung. Gunakan tag seperti &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;a&gt;.
          </p>
        </div>
        <div>
          <label className="label-base">Konten markdown (opsional)</label>
          <textarea
            rows={6}
            value={data.contentMarkdown}
            onChange={(e) => update('contentMarkdown', e.target.value)}
            className="input-base font-mono text-xs"
          />
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="text-base font-semibold text-black">Metadata</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-base">Kategori</label>
            <select
              value={data.categoryId}
              onChange={(e) => update('categoryId', e.target.value)}
              className="input-base"
            >
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-base">Author</label>
            <input
              value={data.authorName}
              onChange={(e) => update('authorName', e.target.value)}
              className="input-base"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label-base">URL gambar utama</label>
            <input
              type="url"
              value={data.featuredImageUrl}
              onChange={(e) => update('featuredImageUrl', e.target.value)}
              className="input-base"
            />
          </div>
        </div>
        <div>
          <label className="label-base">Tags</label>
          <TagInput value={data.tags} onChange={(v) => update('tags', v)} />
        </div>
        <div>
          <label className="label-base">Listing terkait</label>
          <select
            multiple
            value={data.relatedListingIds}
            onChange={(e) =>
              update(
                'relatedListingIds',
                Array.from(e.target.selectedOptions).map((o) => o.value),
              )
            }
            className="input-base h-40"
          >
            {listings.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-black/50">
            Ctrl/Cmd-klik untuk memilih banyak. Artikel ini akan muncul di halaman
            listing yang dipilih.
          </p>
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="text-base font-semibold text-black">Publikasi & SEO</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-base">Status</label>
            <select
              value={data.status}
              onChange={(e) => update('status', e.target.value)}
              className="input-base"
            >
              {ARTICLE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-base">Tanggal publish</label>
            <input
              type="date"
              value={data.publishedAt ? data.publishedAt.slice(0, 10) : ''}
              onChange={(e) => update('publishedAt', e.target.value)}
              className="input-base"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label-base">Meta title</label>
            <input
              value={data.metaTitle}
              onChange={(e) => update('metaTitle', e.target.value)}
              className="input-base"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label-base">Meta description</label>
            <textarea
              rows={3}
              value={data.metaDescription}
              onChange={(e) => update('metaDescription', e.target.value)}
              className="input-base"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Menyimpan…' : articleId ? 'Simpan perubahan' : 'Buat artikel'}
        </button>
      </div>
    </form>
  );
}

function TagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [draft, setDraft] = useState('');
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Tambah tag, tekan Enter"
          className="input-base"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (draft.trim()) {
                onChange([...value, draft.trim()]);
                setDraft('');
              }
            }
          }}
        />
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            if (draft.trim()) {
              onChange([...value, draft.trim()]);
              setDraft('');
            }
          }}
        >
          Tambah
        </button>
      </div>
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((v, i) => (
            <li
              key={`${v}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1 text-xs text-navy"
            >
              #{v}
              <button
                type="button"
                className="text-navy/60 hover:text-red-600"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
