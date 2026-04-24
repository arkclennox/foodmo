'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import {
  LayoutIcon,
  UtensilsIcon,
  BookOpenIcon,
  TagIcon,
  MapPinIcon,
  KeyIcon,
  SettingsIcon,
  BuildingIcon,
} from '@/components/icons';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutIcon, exact: true },
  { href: '/admin/listings', label: 'Listing', icon: UtensilsIcon },
  { href: '/admin/articles', label: 'Artikel', icon: BookOpenIcon },
  { href: '/admin/categories', label: 'Kategori', icon: TagIcon },
  { href: '/admin/cities', label: 'Kota', icon: BuildingIcon },
  { href: '/admin/api-keys', label: 'API Keys', icon: KeyIcon },
  { href: '/admin/settings', label: 'Settings', icon: SettingsIcon },
];

export function AdminSidebar() {
  const pathname = usePathname() || '';
  return (
    <aside className="w-full shrink-0 rounded-xl border border-border bg-white p-3 lg:w-60">
      <div className="mb-2 px-2 py-1 text-base font-semibold text-navy">
        FoodMo
      </div>
      <nav className="flex flex-col gap-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition',
                active
                  ? 'bg-navy text-white'
                  : 'text-black/80 hover:bg-soft hover:text-navy',
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
