'use client';

import { useTranslations } from 'next-intl';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, localeNames, type Locale } from '@/i18n/config';

interface LanguageSwitcherProps {
  currentLocale?: Locale;
  variant?: 'icon' | 'text' | 'full';
  align?: 'start' | 'center' | 'end';
}

export function LanguageSwitcher({
  currentLocale = 'en',
  variant = 'icon',
  align = 'end',
}: LanguageSwitcherProps) {
  const t = useTranslations('header');
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  const renderTrigger = () => {
    switch (variant) {
      case 'text':
        return (
          <Button variant="ghost" size="sm">
            {localeNames[currentLocale]}
          </Button>
        );
      case 'full':
        return (
          <Button variant="ghost" size="sm" className="gap-2">
            <Globe className="h-4 w-4" />
            {localeNames[currentLocale]}
          </Button>
        );
      default:
        return (
          <Button variant="ghost" size="icon">
            <Globe className="h-5 w-5" />
            <span className="sr-only">{t('changeLanguage')}</span>
          </Button>
        );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{renderTrigger()}</DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLanguageChange(locale)}
            className={cn(currentLocale === locale && 'bg-muted')}
          >
            {localeNames[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
