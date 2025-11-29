'use client';

import { useTranslations } from 'next-intl';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Container } from './Container';
import { Separator } from '@/components/ui/separator';
import { Link } from '@/i18n/navigation';

interface FooterProps {
  locale?: string;
}

const social = [
  { name: 'Facebook', href: '#', icon: Facebook },
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'Twitter', href: '#', icon: Twitter },
];

export function Footer(_props: FooterProps) {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('footer');

  const navigation = {
    shop: [
      { name: t('shop.allProducts'), href: '/products' },
      { name: t('shop.tShirts'), href: '/products?type=shirt' },
      { name: t('shop.hoodies'), href: '/products?type=hoodie' },
      { name: t('shop.hats'), href: '/products?type=hat' },
    ],
    company: [
      { name: t('company.about'), href: '/about' },
      { name: t('company.contact'), href: '/contact' },
      { name: t('company.trackOrder'), href: '/track' },
    ],
    legal: [
      { name: t('legal.privacy'), href: '/privacy' },
      { name: t('legal.terms'), href: '/terms' },
      { name: t('legal.refunds'), href: '/refunds' },
    ],
  };

  return (
    <footer className="border-t border-border bg-muted/30">
      <Container>
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link href="/" className="inline-block">
                <span className="text-2xl font-bold text-primary">{t('brand.name')}</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">{t('brand.description')}</p>
              {/* Social Links */}
              <div className="mt-6 flex space-x-4">
                {social.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="sr-only">{item.name}</span>
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation Links */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{t('shop.title')}</h3>
                <ul className="mt-4 space-y-3">
                  {navigation.shop.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{t('company.title')}</h3>
                <ul className="mt-4 space-y-3">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{t('legal.title')}</h3>
                <ul className="mt-4 space-y-3">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h3 className="text-sm font-semibold text-foreground">{t('contact.title')}</h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${t('contact.email')}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {t('contact.email')}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${t('contact.phone').replace(/[^0-9+]/g, '')}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {t('contact.phone')}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {t('contact.address')}
                    <br />
                    {t('contact.cityState')}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Copyright */}
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {currentYear} {t('brand.name')}. {t('copyright')}
            </p>
            <p className="text-xs text-muted-foreground">{t('tagline')}</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
