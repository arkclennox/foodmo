import { prisma } from '@/lib/db';
import { TaxonomyManager } from '@/components/admin/TaxonomyManager';

export const dynamic = 'force-dynamic';

export default async function AdminCitiesPage() {
  const cities = await prisma.city.findMany({ orderBy: { name: 'asc' } });
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-black">Kota</h1>
      <TaxonomyManager
        type="city"
        endpoint="/api/admin/cities"
        items={cities.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description ?? '',
          province: c.province ?? '',
        }))}
      />
    </div>
  );
}
