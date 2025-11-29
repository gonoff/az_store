'use client';

/**
 * User Menu Component
 * Header dropdown for authenticated users
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { useLogout } from '@/hooks';
import { Button } from '@/components/ui/button';

export function UserMenu() {
  const t = useTranslations('navigation');
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const customer = useAuthStore((state) => state.customer);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  if (!customer) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-gray-100 p-1 text-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
          {getInitials(customer.full_name)}
        </span>
        <span className="sr-only md:not-sr-only md:pr-2">{customer.full_name.split(' ')[0]}</span>
        <svg
          className="hidden h-4 w-4 text-gray-500 md:block"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="border-b border-gray-100 px-4 py-2">
            <p className="text-sm font-medium text-gray-900">{customer.full_name}</p>
            <p className="truncate text-xs text-gray-500">{customer.email}</p>
          </div>

          <Link
            href="/account"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            {t('account')}
          </Link>

          <Link
            href="/orders"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            {t('orders')}
          </Link>

          <div className="border-t border-gray-100">
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? '...' : t('logout')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
