import { Header } from './Header';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  locale?: string;
  cartItemCount?: number;
}

export function MainLayout({ children, locale = 'en', cartItemCount = 0 }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} cartItemCount={cartItemCount} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
