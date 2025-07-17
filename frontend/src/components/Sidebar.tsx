'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  MicrophoneIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Contacts', href: '/contacts', icon: UserGroupIcon },
  { name: 'Events', href: '/events', icon: CalendarIcon },
  { name: 'Audio Processing', href: '/audio', icon: MicrophoneIcon },
  { name: 'Search & Query', href: '/search', icon: MagnifyingGlassIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-gray-900">
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
        <h1 className="text-white text-lg font-semibold">Personal AI DB</h1>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                )}
              >
                <item.icon
                  className={classNames(
                    isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300',
                    'mr-3 flex-shrink-0 h-6 w-6'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        {/* Logout button at bottom */}
        <div className="px-2 pb-4">
          <button
            onClick={() => {
              // For now, just redirect to login page
              window.location.href = '/login';
            }}
            className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <ArrowRightOnRectangleIcon
              className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-300"
              aria-hidden="true"
            />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
