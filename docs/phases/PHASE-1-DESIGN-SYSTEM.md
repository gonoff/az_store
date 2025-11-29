# Phase 1: Design System & Layout

**Status**: ✅ COMPLETED
**Completed**: 2025-11-28

## Overview

Visual foundation with AZTEAM branding, component library, and internationalization.

## Goals

- Configure Tailwind with AZTEAM brand colors
- Install and customize shadcn/ui components
- Create base layout components (Header, Footer, Container)
- Setup bilingual support (English + Portuguese)

---

## Step 1.1: Tailwind Configuration

**Status**: ✅ Completed

### Brand Colors

| Color       | Hex       | Usage                   |
| ----------- | --------- | ----------------------- |
| Primary     | `#E5192B` | Buttons, links, accents |
| Primary-50  | `#FEF2F2` | Light backgrounds       |
| Primary-600 | `#CC1626` | Hover states            |
| Primary-700 | `#B31221` | Active states           |
| Background  | `#FFFFFF` | Page background         |
| Foreground  | `#171717` | Text                    |
| Muted       | `#64748B` | Secondary text          |
| Border      | `#E2E8F0` | Borders, dividers       |

### Files Modified

- `src/app/globals.css` - CSS variables and theme (Tailwind v4 CSS-based config)

---

## Step 1.2: shadcn/ui Installation

**Status**: ✅ Completed

### Installed Components (19)

```bash
accordion, avatar, badge, button, card, checkbox,
dialog, dropdown-menu, form, input, label,
navigation-menu, radio-group, select, separator,
sheet, skeleton, sonner (toast), tabs
```

### Component Locations

- `src/components/ui/` - All shadcn/ui components
- `src/lib/utils.ts` - cn() utility function

---

## Step 1.3: Utility Functions

**Status**: ✅ Completed

**File**: `src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Step 1.4: Layout Components

**Status**: ✅ Completed

### Created Components

| File                                   | Description                                            |
| -------------------------------------- | ------------------------------------------------------ |
| `src/components/layout/Container.tsx`  | Max-width wrapper with responsive padding              |
| `src/components/layout/Header.tsx`     | Sticky header with navigation, cart, language switcher |
| `src/components/layout/Footer.tsx`     | Footer with navigation, contact, social links          |
| `src/components/layout/MainLayout.tsx` | Full page layout combining Header + content + Footer   |
| `src/components/layout/index.ts`       | Barrel exports                                         |

### Header Features

- AZTEAM logo
- Desktop navigation (Home, Products, About, Contact)
- Language switcher dropdown
- Cart icon with item count badge
- User menu dropdown (Login/Register)
- Mobile hamburger menu with Sheet component

### Footer Features

- Brand section with description
- Shop links (All Products, T-Shirts, Hoodies, Hats)
- Company links (About, Contact, Track Order)
- Legal links (Privacy, Terms, Refunds)
- Contact information
- Social media icons
- Copyright notice

---

## Step 1.5: i18n Setup (next-intl)

**Status**: ✅ Completed

### Configuration Files

| File                     | Purpose                                    |
| ------------------------ | ------------------------------------------ |
| `src/i18n/config.ts`     | Locale constants and types                 |
| `src/i18n/routing.ts`    | Locale routing definition                  |
| `src/i18n/navigation.ts` | Navigation helpers (Link, useRouter, etc.) |
| `src/i18n/request.ts`    | Server-side i18n config                    |
| `src/middleware.ts`      | Locale detection middleware                |
| `next.config.ts`         | next-intl plugin configuration             |

### App Router Structure

```
src/app/
├── layout.tsx           # Root layout (minimal)
├── page.tsx             # Root redirect to default locale
├── globals.css          # Global styles
└── [locale]/
    ├── layout.tsx       # Locale-aware layout with providers
    └── page.tsx         # Homepage with translations
```

### Translation Files

| File                   | Language          |
| ---------------------- | ----------------- |
| `src/messages/en.json` | English (default) |
| `src/messages/pt.json` | Portuguese        |

### Translation Namespaces

- `metadata` - Page titles and descriptions
- `navigation` - Nav links
- `header` - Header UI strings
- `footer` - Footer content
- `home` - Homepage content
- `products` - Product listing
- `cart` - Shopping cart
- `checkout` - Checkout flow
- `auth` - Login/Register
- `common` - Shared strings

---

## Step 1.6: LanguageSwitcher Component

**Status**: ✅ Completed

**File**: `src/components/common/LanguageSwitcher.tsx`

### Features

- Three variants: `icon`, `text`, `full`
- Dropdown alignment options
- Preserves current page path on language change
- Shows current language with highlight

### Usage

```tsx
import { LanguageSwitcher } from '@/components/common';

<LanguageSwitcher currentLocale="en" variant="full" />;
```

---

## Step 1.7: Storybook Stories

**Status**: ✅ Completed

### Created Stories

| File                                                             | Stories                                                       |
| ---------------------------------------------------------------- | ------------------------------------------------------------- |
| `src/components/layout/__stories__/Container.stories.tsx`        | Default, AsSection, WithCustomClass, FullWidthComparison      |
| `src/components/layout/__stories__/Header.stories.tsx`           | Default, WithCartItems, ManyCartItems, Portuguese, MobileView |
| `src/components/layout/__stories__/Footer.stories.tsx`           | Default, Portuguese, MobileView                               |
| `src/components/layout/__stories__/MainLayout.stories.tsx`       | Default, WithCartItems, Portuguese, MinimalContent            |
| `src/components/common/__stories__/LanguageSwitcher.stories.tsx` | IconOnly, TextOnly, Full, Portuguese, AllVariants             |

### Storybook Configuration

- `.storybook/preview.ts` - Includes globals.css, NextIntlClientProvider, locale toolbar

---

## Deliverables Checklist

- [x] Tailwind configured with AZTEAM colors
- [x] shadcn/ui components installed (19 components)
- [x] cn() utility function working
- [x] Header component (responsive)
- [x] Footer component
- [x] Container component
- [x] MainLayout wrapper
- [x] next-intl configured
- [x] English translations file
- [x] Portuguese translations file
- [x] LanguageSwitcher component
- [x] Storybook stories for layout
- [x] Homepage styled with new layout

---

## Commands

```bash
# Development
npm run dev           # http://localhost:3000

# Storybook
npm run storybook     # http://localhost:6006

# Testing
npm run test          # Run all tests
npm run typecheck     # Check types (npx tsc --noEmit)

# Build
npm run build         # Production build
```

---

## Next Phase

→ **Phase 2: API Layer & Types**
