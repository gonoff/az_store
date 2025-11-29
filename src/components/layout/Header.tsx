'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, ShoppingCart, User, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Container } from './Container';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { locales, localeNames, type Locale } from '@/i18n/config';

interface HeaderProps {
  locale?: string;
  cartItemCount?: number;
}

export function Header({ locale = 'en', cartItemCount = 0 }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations('navigation');
  const tHeader = useTranslations('header');
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    { name: t('home'), href: '/' },
    { name: t('products'), href: '/products' },
    { name: t('about'), href: '/about' },
    { name: t('contact'), href: '/contact' },
  ];

  const handleLanguageChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <nav className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="text-2xl font-bold text-primary">AZTEAM</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-m-2.5">
                  <span className="sr-only">{tHeader('openMenu')}</span>
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm">
                <SheetHeader>
                  <SheetTitle className="text-left text-2xl font-bold text-primary">
                    AZTEAM
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flow-root">
                  <div className="-my-6 divide-y divide-border">
                    <div className="space-y-2 py-6">
                      {navigation.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-muted"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                    <div className="py-6">
                      <Link
                        href="/login"
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-foreground hover:bg-muted"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('login')}
                      </Link>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold leading-6 text-foreground transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side icons */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-5 w-5" />
                  <span className="sr-only">{tHeader('changeLanguage')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {locales.map((loc) => (
                  <DropdownMenuItem
                    key={loc}
                    onClick={() => handleLanguageChange(loc)}
                    className={cn(locale === loc && 'bg-muted')}
                  >
                    {localeNames[loc]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
                <span className="sr-only">{tHeader('shoppingCart')}</span>
              </Button>
            </Link>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">{tHeader('userMenu')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/login">{t('login')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/register">{t('register')}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </Container>
    </header>
  );
}
