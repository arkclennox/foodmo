import { z } from 'zod';
import { LISTING_STATUSES, ARTICLE_STATUSES, PRICE_RANGES } from './constants';

const nullableString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => (v == null || v === '' ? null : String(v)));

const stringOrEmptyToNull = (max = 1000) =>
  z
    .union([z.string().max(max), z.null(), z.undefined()])
    .transform((v) => (v == null || v === '' ? null : v));

export const listingInputSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().min(1),
  shortDescription: stringOrEmptyToNull(500).optional(),
  categoryId: nullableString.optional(),
  cityId: nullableString.optional(),
  address: z.string().min(1).max(500),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  phone: stringOrEmptyToNull(100).optional(),
  whatsapp: stringOrEmptyToNull(100).optional(),
  websiteUrl: stringOrEmptyToNull(500).optional(),
  instagramUrl: stringOrEmptyToNull(500).optional(),
  shopeeFoodUrl: stringOrEmptyToNull(500).optional(),
  tiktokUrl: stringOrEmptyToNull(500).optional(),
  priceRange: z
    .union([z.enum(PRICE_RANGES), z.literal(''), z.null(), z.undefined()])
    .transform((v) => (v == null || v === '' ? null : v))
    .optional(),
  openingHours: stringOrEmptyToNull(5000).optional(),
  facilities: z.array(z.string()).optional(),
  menuHighlights: z.array(z.string()).optional(),
  featuredImageUrl: stringOrEmptyToNull(1000).optional(),
  galleryImages: z.array(z.string()).optional(),
  status: z.enum(LISTING_STATUSES).default('draft'),
  isFeatured: z.boolean().optional(),
  metaTitle: stringOrEmptyToNull(300).optional(),
  metaDescription: stringOrEmptyToNull(500).optional(),
});

export type ListingInput = z.infer<typeof listingInputSchema>;

export const listingPatchSchema = listingInputSchema.partial();

export const articleInputSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(300).optional(),
  excerpt: stringOrEmptyToNull(1000).optional(),
  content_html: z.string().min(1).optional(),
  contentHtml: z.string().min(1).optional(),
  content_markdown: stringOrEmptyToNull(200000).optional(),
  contentMarkdown: stringOrEmptyToNull(200000).optional(),
  featuredImageUrl: stringOrEmptyToNull(1000).optional(),
  featured_image_url: stringOrEmptyToNull(1000).optional(),
  categoryId: nullableString.optional(),
  category_slug: nullableString.optional(),
  categorySlug: nullableString.optional(),
  tags: z.array(z.string()).optional(),
  relatedListingIds: z.array(z.string()).optional(),
  related_listing_ids: z.array(z.string()).optional(),
  authorName: stringOrEmptyToNull(200).optional(),
  author_name: stringOrEmptyToNull(200).optional(),
  status: z.enum(ARTICLE_STATUSES).default('draft'),
  publishedAt: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (v == null || v === '' ? null : new Date(v)))
    .optional(),
  published_at: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (v == null || v === '' ? null : new Date(v)))
    .optional(),
  metaTitle: stringOrEmptyToNull(300).optional(),
  meta_title: stringOrEmptyToNull(300).optional(),
  metaDescription: stringOrEmptyToNull(500).optional(),
  meta_description: stringOrEmptyToNull(500).optional(),
});

export const articlePatchSchema = articleInputSchema.partial();

export const categoryInputSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  description: stringOrEmptyToNull(5000).optional(),
  type: z.enum(['listing', 'article']).default('listing'),
  metaTitle: stringOrEmptyToNull(300).optional(),
  metaDescription: stringOrEmptyToNull(500).optional(),
});

export const cityInputSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  province: stringOrEmptyToNull(200).optional(),
  description: stringOrEmptyToNull(5000).optional(),
  metaTitle: stringOrEmptyToNull(300).optional(),
  metaDescription: stringOrEmptyToNull(500).optional(),
});
