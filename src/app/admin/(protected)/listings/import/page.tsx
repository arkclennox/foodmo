import { ImportListingsForm } from '@/components/admin/ImportListingsForm';
import { Breadcrumb } from '@/components/Breadcrumb';
import Link from 'next/link';

export default function ImportListingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/listings" className="p-2 hover:bg-black/5 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
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
