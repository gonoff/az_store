/**
 * Shop Layout
 * Wrapper for public shopping pages
 */

import { setRequestLocale } from 'next-intl/server';

interface ShopLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function ShopLayout({ children, params }: ShopLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <>{children}</>;
}
