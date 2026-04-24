import { prisma } from '@/lib/db';
import { TaxonomyManager } from '@/components/admin/TaxonomyManager';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-black">Kategori</h1>
      <TaxonomyManager
        type="category"
        endpoint="/api/admin/categories"
        items={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description ?? '',
          type: c.type,
        }))}
      />
    </div>
  );
}
