import { apiSuccess, ERR } from '@/lib/api-response';
import { findListingBySlug } from '@/lib/queries';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const listing = await findListingBySlug(slug);
  if (!listing) return ERR.notFound('Listing tidak ditemukan');
  return apiSuccess(listing);
}
