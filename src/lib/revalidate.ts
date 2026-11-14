import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * On-demand cache invalidation.
 *
 * Public pages and their data caches (src/lib/queries.ts) are long-lived so
 * crawlers don't force a re-render of ~5k pages every few minutes. Every write
 * path calls one of these helpers so edits still show up immediately.
 *
 * Tags:
 *  - `listing:<slug>` / `article:<slug>`  one detail page's data
 *  - `listings-list` / `articles-list`    lists, homepage blocks, counts
 *  - `listings` / `articles` / `categories` / `cities` / `facilities`
 *                                          everything of that kind
 */

function safe(fn: () => void) {
  try {
    fn();
  } catch (err) {
    // Never fail a successful write because cache invalidation threw.
    console.error('[revalidate] failed:', err);
  }
}

function uniq(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v)))];
}

/** A listing was created, edited or deleted (pass old and new slug on rename). */
export function revalidateListings(...slugs: Array<string | null | undefined>) {
  safe(() => {
    for (const s of uniq(slugs)) {
      revalidateTag(`listing:${s}`);
      revalidatePath(`/tempat-makan/${s}`);
    }
    revalidateTag('listings-list');
  });
}

/** An article was created, edited or deleted (pass old and new slug on rename). */
export function revalidateArticles(...slugs: Array<string | null | undefined>) {
  safe(() => {
    for (const s of uniq(slugs)) {
      revalidateTag(`article:${s}`);
      revalidatePath(`/blog/${s}`);
    }
    revalidateTag('articles-list');
  });
}

/**
 * Invalidate everything. For rare, wide-reaching admin actions (bulk edits,
 * imports, category/city changes, image re-sync). Pages only re-render when
 * they are next visited, so back-to-back calls cost nothing extra.
 */
export function revalidateAllContent() {
  safe(() => {
    for (const t of ['listings', 'articles', 'categories', 'cities', 'facilities']) {
      revalidateTag(t);
    }
    revalidatePath('/', 'layout');
  });
}
