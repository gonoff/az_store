'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Palette, Truck, Package, CheckCircle, Clock } from 'lucide-react';
import { clientEnv } from '@/lib/env';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-background py-20 lg:py-32">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {t('hero.title')}
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">{t('hero.subtitle')}</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link href="/products">
                  {t('hero.cta')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">{t('hero.secondary')}</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">
                {t('features.quality.title')}
              </h3>
              <p className="mt-2 text-muted-foreground">{t('features.quality.description')}</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Palette className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">
                {t('features.customization.title')}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t('features.customization.description')}
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">
                {t('features.fast.title')}
              </h3>
              <p className="mt-2 text-muted-foreground">{t('features.fast.description')}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Order Tracking Portal Section */}
      {clientEnv.NEXT_PUBLIC_PORTAL_URL && (
        <section className="border-t border-border bg-muted/30 py-20 lg:py-28">
          <Container>
            <div className="mx-auto max-w-4xl">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {t('portal.title')}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">{t('portal.description')}</p>
              </div>

              <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="flex flex-col items-center rounded-lg border border-border bg-background p-6 text-center">
                  <Package className="h-10 w-10 text-primary" />
                  <p className="mt-4 font-medium text-foreground">
                    {t('portal.features.tracking')}
                  </p>
                </div>
                <div className="flex flex-col items-center rounded-lg border border-border bg-background p-6 text-center">
                  <CheckCircle className="h-10 w-10 text-primary" />
                  <p className="mt-4 font-medium text-foreground">{t('portal.features.artwork')}</p>
                </div>
                <div className="flex flex-col items-center rounded-lg border border-border bg-background p-6 text-center">
                  <Clock className="h-10 w-10 text-primary" />
                  <p className="mt-4 font-medium text-foreground">{t('portal.features.updates')}</p>
                </div>
              </div>

              <div className="mt-10 text-center">
                <Button asChild size="lg" className="gap-2">
                  <a
                    href={clientEnv.NEXT_PUBLIC_PORTAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('portal.cta')}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
