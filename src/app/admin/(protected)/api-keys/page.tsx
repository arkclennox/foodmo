import { prisma } from '@/lib/db';
import { ApiKeysManager } from '@/components/admin/ApiKeysManager';
import { parseJsonArray } from '@/lib/json-fields';

export const dynamic = 'force-dynamic';

export default async function AdminApiKeysPage() {
  const keys = await prisma.apiKey.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-black">API Keys</h1>
      <p className="mb-4 max-w-2xl text-sm text-black/60">
        Buat API key untuk sistem eksternal. Key hanya ditampilkan satu kali
        saat dibuat — simpan di tempat aman. Panggil endpoint eksternal dengan
        header <code className="rounded bg-soft px-1">x-api-key: &lt;key&gt;</code>.
      </p>
      <ApiKeysManager
        keys={keys.map((k) => ({
          id: k.id,
          name: k.name,
          keyPreview: k.keyPreview,
          permissions: parseJsonArray<string>(k.permissions),
          status: k.status,
          lastUsedAt: k.lastUsedAt ? k.lastUsedAt.toISOString() : null,
          createdAt: k.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
