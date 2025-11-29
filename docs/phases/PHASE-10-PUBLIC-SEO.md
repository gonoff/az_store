# Phase 10: Public Features & SEO

**Status**: ⏳ Pending
**Dependencies**: Phase 9 (Account Management)

## Overview

Build public-facing pages, SEO optimization, and discovery features to maximize visibility and user engagement.

## Goals

- Static pages (About, Contact, FAQ)
- Dynamic sitemap generation
- Open Graph & Twitter meta tags
- JSON-LD structured data
- Contact form with validation
- Newsletter subscription
- Search functionality

---

## Step 10.1: Static Page Layout

**File**: `src/components/layout/StaticPageLayout.tsx`

```typescript
'use client';

import { useTranslations } from 'next-intl';

interface StaticPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function StaticPageLayout({ title, children }: StaticPageLayoutProps) {
  return (
    <div className="py-12">
      <div className="container max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold lg:text-4xl">{title}</h1>
        <div className="prose prose-lg max-w-none dark:prose-invert">
          {children}
        </div>
      </div>
    </div>
  );
}
```

---

## Step 10.2: About Page

**File**: `src/app/[locale]/about/page.tsx`

```typescript
import { getTranslations } from 'next-intl/server';
import { StaticPageLayout } from '@/components/layout/StaticPageLayout';
import Image from 'next/image';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'about' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
    },
  };
}

export default async function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'about' });

  return (
    <StaticPageLayout title={t('title')}>
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">{t('mission.title')}</h2>
        <p>{t('mission.content')}</p>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">{t('history.title')}</h2>
        <p>{t('history.content')}</p>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">{t('team.title')}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Team members rendered here */}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">{t('values.title')}</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>{t('values.quality')}</li>
          <li>{t('values.innovation')}</li>
          <li>{t('values.customer')}</li>
          <li>{t('values.sustainability')}</li>
        </ul>
      </section>
    </StaticPageLayout>
  );
}
```

---

## Step 10.3: Contact Page with Form

**File**: `src/app/[locale]/contact/page.tsx`

```typescript
import { getTranslations } from 'next-intl/server';
import { StaticPageLayout } from '@/components/layout/StaticPageLayout';
import { ContactForm } from '@/components/forms/ContactForm';
import { Mail, Phone, MapPin } from 'lucide-react';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'contact' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ContactPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'contact' });

  return (
    <StaticPageLayout title={t('title')}>
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Contact Info */}
        <div className="space-y-6">
          <p className="text-lg">{t('intro')}</p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <a href="mailto:info@azteamonline.com" className="hover:underline">
                info@azteamonline.com
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <a href="tel:+1234567890" className="hover:underline">
                +1 (234) 567-890
              </a>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-primary" />
              <address className="not-italic">
                123 Business Street<br />
                City, State 12345<br />
                United States
              </address>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">{t('hours.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('hours.weekdays')}: 9:00 AM - 6:00 PM EST<br />
              {t('hours.weekends')}: Closed
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <ContactForm />
      </div>
    </StaticPageLayout>
  );
}
```

---

## Step 10.4: Contact Form Component

**File**: `src/components/forms/ContactForm.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const t = useTranslations('contact.form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSuccess(true);
        reset();
      }
    } catch (error) {
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Alert className="border-green-500 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-700">
          {t('success')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">{t('name')}</Label>
        <Input
          id="name"
          {...register('name')}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t('email')}</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">{t('subject')}</Label>
        <Select onValueChange={(value) => setValue('subject', value)}>
          <SelectTrigger className={errors.subject ? 'border-red-500' : ''}>
            <SelectValue placeholder={t('subjectPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">{t('subjects.general')}</SelectItem>
            <SelectItem value="order">{t('subjects.order')}</SelectItem>
            <SelectItem value="quote">{t('subjects.quote')}</SelectItem>
            <SelectItem value="support">{t('subjects.support')}</SelectItem>
          </SelectContent>
        </Select>
        {errors.subject && (
          <p className="text-sm text-red-500">{errors.subject.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">{t('message')}</Label>
        <Textarea
          id="message"
          rows={5}
          {...register('message')}
          className={errors.message ? 'border-red-500' : ''}
        />
        {errors.message && (
          <p className="text-sm text-red-500">{errors.message.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('sending')}
          </>
        ) : (
          t('submit')
        )}
      </Button>
    </form>
  );
}
```

---

## Step 10.5: Contact Form API

**File**: `src/app/api/contact/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Send to ERP or email service
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
```

---

## Step 10.6: FAQ Page with Accordion

**File**: `src/app/[locale]/faq/page.tsx`

```typescript
import { getTranslations } from 'next-intl/server';
import { StaticPageLayout } from '@/components/layout/StaticPageLayout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'faq' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function FAQPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'faq' });

  const faqCategories = [
    {
      title: t('categories.ordering.title'),
      items: [
        { q: t('categories.ordering.q1'), a: t('categories.ordering.a1') },
        { q: t('categories.ordering.q2'), a: t('categories.ordering.a2') },
        { q: t('categories.ordering.q3'), a: t('categories.ordering.a3') },
      ],
    },
    {
      title: t('categories.customization.title'),
      items: [
        { q: t('categories.customization.q1'), a: t('categories.customization.a1') },
        { q: t('categories.customization.q2'), a: t('categories.customization.a2') },
      ],
    },
    {
      title: t('categories.shipping.title'),
      items: [
        { q: t('categories.shipping.q1'), a: t('categories.shipping.a1') },
        { q: t('categories.shipping.q2'), a: t('categories.shipping.a2') },
      ],
    },
    {
      title: t('categories.returns.title'),
      items: [
        { q: t('categories.returns.q1'), a: t('categories.returns.a1') },
        { q: t('categories.returns.q2'), a: t('categories.returns.a2') },
      ],
    },
  ];

  return (
    <StaticPageLayout title={t('title')}>
      <p className="mb-8 text-lg">{t('intro')}</p>

      <div className="space-y-8">
        {faqCategories.map((category, index) => (
          <section key={index}>
            <h2 className="mb-4 text-xl font-semibold">{category.title}</h2>
            <Accordion type="single" collapsible className="w-full">
              {category.items.map((item, itemIndex) => (
                <AccordionItem key={itemIndex} value={`item-${index}-${itemIndex}`}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>
    </StaticPageLayout>
  );
}
```

---

## Step 10.7: Dynamic Sitemap

**File**: `src/app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://azteamonline.com';

async function getProducts() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products?limit=1000`, {
      next: { revalidate: 3600 },
    });
    const data = await response.json();
    return data.products || [];
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/categories`, {
      next: { revalidate: 3600 },
    });
    return await response.json();
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const categories = await getCategories();

  const staticPages = ['', '/about', '/contact', '/faq', '/products'];

  const sitemap: MetadataRoute.Sitemap = [];

  // Static pages for each locale
  for (const locale of locales) {
    for (const page of staticPages) {
      sitemap.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : 0.8,
      });
    }
  }

  // Product pages
  for (const product of products) {
    for (const locale of locales) {
      sitemap.push({
        url: `${baseUrl}/${locale}/products/${product.slug}`,
        lastModified: new Date(product.updatedAt || Date.now()),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  // Category pages
  for (const category of categories) {
    for (const locale of locales) {
      sitemap.push({
        url: `${baseUrl}/${locale}/products?category=${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  }

  return sitemap;
}
```

---

## Step 10.8: Robots.txt

**File**: `src/app/robots.ts`

```typescript
import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://azteamonline.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/checkout/', '/account/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

---

## Step 10.9: JSON-LD Structured Data

**File**: `src/components/seo/JsonLd.tsx`

```typescript
interface OrganizationJsonLdProps {
  name: string;
  url: string;
  logo: string;
  sameAs?: string[];
}

export function OrganizationJsonLd({ name, url, logo, sameAs }: OrganizationJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    sameAs: sameAs || [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface ProductJsonLdProps {
  name: string;
  description: string;
  image: string;
  sku: string;
  price: number;
  currency: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand: string;
}

export function ProductJsonLd({
  name,
  description,
  image,
  sku,
  price,
  currency,
  availability,
  brand,
}: ProductJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    sku,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    offers: {
      '@type': 'Offer',
      price: price.toFixed(2),
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: Array<{ name: string; url: string }>;
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface FAQJsonLdProps {
  questions: Array<{ question: string; answer: string }>;
}

export function FAQJsonLd({ questions }: FAQJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

---

## Step 10.10: Newsletter Subscription

**File**: `src/components/forms/NewsletterForm.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle } from 'lucide-react';

export function NewsletterForm() {
  const t = useTranslations('newsletter');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setEmail('');
      } else {
        setError(t('error'));
      }
    } catch {
      setError(t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="h-5 w-5" />
        <span>{t('success')}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('placeholder')}
        required
        className="max-w-xs"
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('subscribe')}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}
```

---

## Step 10.11: Search Component

**File**: `src/components/search/SearchDialog.tsx`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import type { Product } from '@/types/api';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const t = useTranslations('search');
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data.products || []);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  const handleSelect = (product: Product) => {
    onOpenChange(false);
    router.push(`/products/${product.slug}`);
    setQuery('');
    setResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('placeholder')}
            className="pl-10 pr-10"
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
              onClick={() => setQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {!isLoading && results.length === 0 && query.length >= 2 && (
            <p className="py-8 text-center text-muted-foreground">{t('noResults')}</p>
          )}

          {!isLoading && results.length > 0 && (
            <div className="space-y-2">
              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted"
                >
                  {product.images[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="rounded object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${product.basePrice.toFixed(2)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Step 10.12: Search API

**File**: `src/app/api/search/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ products: [] });
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/search?q=${encodeURIComponent(query)}&limit=10`
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ products: [] });
  }
}
```

---

## Step 10.13: Debounce Hook

**File**: `src/hooks/useDebounce.ts`

```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

---

## Deliverables Checklist

- [ ] Static page layout component
- [ ] About page
- [ ] Contact page with form
- [ ] Contact form API
- [ ] FAQ page with accordion
- [ ] Dynamic sitemap
- [ ] Robots.txt
- [ ] JSON-LD structured data components
- [ ] Newsletter subscription form
- [ ] Search dialog component
- [ ] Search API
- [ ] Debounce hook
- [ ] Translation keys for all pages

---

## Files to Create

| File                                         | Purpose                   |
| -------------------------------------------- | ------------------------- |
| `src/components/layout/StaticPageLayout.tsx` | Shared static page layout |
| `src/app/[locale]/about/page.tsx`            | About us page             |
| `src/app/[locale]/contact/page.tsx`          | Contact page              |
| `src/components/forms/ContactForm.tsx`       | Contact form              |
| `src/app/api/contact/route.ts`               | Contact form API          |
| `src/app/[locale]/faq/page.tsx`              | FAQ page                  |
| `src/app/sitemap.ts`                         | Dynamic sitemap           |
| `src/app/robots.ts`                          | Robots.txt                |
| `src/components/seo/JsonLd.tsx`              | JSON-LD components        |
| `src/components/forms/NewsletterForm.tsx`    | Newsletter form           |
| `src/components/search/SearchDialog.tsx`     | Search component          |
| `src/app/api/search/route.ts`                | Search API                |
| `src/hooks/useDebounce.ts`                   | Debounce utility          |

---

## Next Phase

→ **Phase 11: Testing & Quality**
