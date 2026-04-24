import { prisma } from './db';
import { slugify } from './slug';
import { toJsonString } from './json-fields';

function firstDefined<T>(...values: (T | null | undefined)[]): T | undefined {
  for (const v of values) {
    if (v !== undefined) return v ?? undefined;
  }
  return undefined;
}

type RawArticleInput = {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content_html?: string;
  contentHtml?: string;
  content_markdown?: string | null;
  contentMarkdown?: string | null;
  featured_image_url?: string | null;
  featuredImageUrl?: string | null;
  categoryId?: string | null;
  category_slug?: string | null;
  categorySlug?: string | null;
  tags?: string[];
  related_listing_ids?: string[];
  relatedListingIds?: string[];
  author_name?: string | null;
  authorName?: string | null;
  status?: string;
  published_at?: Date | null;
  publishedAt?: Date | null;
  meta_title?: string | null;
  metaTitle?: string | null;
  meta_description?: string | null;
  metaDescription?: string | null;
};

async function resolveCategoryId(
  input: RawArticleInput,
): Promise<string | null | undefined> {
  if (input.categoryId !== undefined) return input.categoryId ?? null;
  const slug = input.categorySlug ?? input.category_slug;
  if (slug !== undefined) {
    if (!slug) return null;
    const cat = await prisma.category.findUnique({ where: { slug } });
    if (!cat) throw new Error(`Category slug "${slug}" tidak ditemukan`);
    return cat.id;
  }
  return undefined;
}

export async function createArticleFromInput(input: RawArticleInput) {
  const title = input.title;
  if (!title) throw new Error('title wajib diisi');
  const contentHtml = input.contentHtml ?? input.content_html;
  if (!contentHtml) throw new Error('content_html wajib diisi');
  const slug = (input.slug ?? slugify(title)).trim() || slugify(title);
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) throw new Error(`Slug "${slug}" sudah dipakai`);

  const categoryId = await resolveCategoryId(input);
  const status = input.status ?? 'draft';
  const publishedAt =
    firstDefined<Date | null>(input.publishedAt, input.published_at) ??
    (status === 'published' ? new Date() : null);

  return prisma.article.create({
    data: {
      title,
      slug,
      excerpt: input.excerpt ?? null,
      contentHtml,
      contentMarkdown: firstDefined(input.contentMarkdown, input.content_markdown) ?? null,
      featuredImageUrl: firstDefined(input.featuredImageUrl, input.featured_image_url) ?? null,
      categoryId: categoryId ?? null,
      tags: toJsonString(input.tags ?? []),
      relatedListingIds: toJsonString(
        input.relatedListingIds ?? input.related_listing_ids ?? [],
      ),
      authorName: firstDefined(input.authorName, input.author_name) ?? null,
      status,
      publishedAt,
      metaTitle: firstDefined(input.metaTitle, input.meta_title) ?? null,
      metaDescription: firstDefined(input.metaDescription, input.meta_description) ?? null,
    },
  });
}

export async function updateArticleFromInput(idOrSlug: string, input: RawArticleInput) {
  const existing = await prisma.article.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
  });
  if (!existing) throw new Error('Artikel tidak ditemukan');

  const data: Record<string, unknown> = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.slug !== undefined && input.slug !== null) {
    const newSlug = input.slug.trim() || slugify(input.title ?? existing.title);
    if (newSlug !== existing.slug) {
      const conflict = await prisma.article.findUnique({ where: { slug: newSlug } });
      if (conflict && conflict.id !== existing.id) {
        throw new Error(`Slug "${newSlug}" sudah dipakai`);
      }
      data.slug = newSlug;
    }
  }
  if (input.excerpt !== undefined) data.excerpt = input.excerpt;
  const contentHtml = input.contentHtml ?? input.content_html;
  if (contentHtml !== undefined) data.contentHtml = contentHtml;
  const contentMd = firstDefined(input.contentMarkdown, input.content_markdown);
  if (contentMd !== undefined || input.contentMarkdown === null || input.content_markdown === null) {
    data.contentMarkdown = contentMd ?? null;
  }
  const featured = firstDefined(input.featuredImageUrl, input.featured_image_url);
  if (featured !== undefined || input.featuredImageUrl === null || input.featured_image_url === null) {
    data.featuredImageUrl = featured ?? null;
  }
  const categoryId = await resolveCategoryId(input);
  if (categoryId !== undefined) data.categoryId = categoryId;
  if (input.tags !== undefined) data.tags = toJsonString(input.tags);
  const related = input.relatedListingIds ?? input.related_listing_ids;
  if (related !== undefined) data.relatedListingIds = toJsonString(related);
  const author = firstDefined(input.authorName, input.author_name);
  if (author !== undefined || input.authorName === null || input.author_name === null) {
    data.authorName = author ?? null;
  }
  if (input.status !== undefined) data.status = input.status;
  const publishedAt = firstDefined(input.publishedAt, input.published_at);
  if (
    publishedAt !== undefined ||
    input.publishedAt === null ||
    input.published_at === null
  ) {
    data.publishedAt = publishedAt ?? null;
  }
  if (data.status === 'published' && data.publishedAt == null && !existing.publishedAt) {
    data.publishedAt = new Date();
  }
  const metaT = firstDefined(input.metaTitle, input.meta_title);
  if (metaT !== undefined || input.metaTitle === null || input.meta_title === null) {
    data.metaTitle = metaT ?? null;
  }
  const metaD = firstDefined(input.metaDescription, input.meta_description);
  if (metaD !== undefined || input.metaDescription === null || input.meta_description === null) {
    data.metaDescription = metaD ?? null;
  }

  return prisma.article.update({ where: { id: existing.id }, data });
}
