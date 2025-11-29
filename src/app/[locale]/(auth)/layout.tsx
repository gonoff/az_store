/**
 * Auth Layout
 * Minimal centered layout for authentication pages
 */

import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const t = await getTranslations('footer.brand');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-bold text-primary">{t('name')}</span>
          </Link>
        </div>
        <div className="rounded-lg bg-white px-6 py-8 shadow-md sm:px-10">{children}</div>
      </div>
    </div>
  );
}
