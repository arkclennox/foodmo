import { ImportListingsForm } from '@/components/admin/ImportListingsForm';
import { Breadcrumb } from '@/components/Breadcrumb';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ImportListingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/listings" className="p-2 hover:bg-black/5 rounded-full transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-black">Import Listings</h1>
          <Breadcrumb 
            items={[
              { label: 'Admin', href: '/admin' },
              { label: 'Listings', href: '/admin/listings' },
              { label: 'Import' }
            ]} 
          />
        </div>
      </div>

      <ImportListingsForm />
    </div>
  );
}
