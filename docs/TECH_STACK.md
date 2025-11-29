# Next.js Online Store - Complete Technology Stack Plan

**Date**: 2025-11-28
**Purpose**: Define complete technology stack for AZTEAM custom apparel online store
**Integration**: AZTEAM ERP REST API (documented in NEXTJS_STORE_API_REFERENCE.md)

---

## Confirmed Stack (User-Specified)

| Category         | Technology         | Notes                               |
| ---------------- | ------------------ | ----------------------------------- |
| Framework        | **Next.js 14+**    | App Router recommended              |
| UI Library       | **React 18+**      | Concurrent features                 |
| 3D Visualization | **Three.js**       | Dynamic color-changing shirt models |
| Components       | **shadcn/ui**      | Tailwind-based, customizable        |
| Accent Color     | **Red (#E5192B)**  | AZTEAM brand color                  |
| Backend          | **AZTEAM ERP API** | Existing MySQL database via REST    |

---

## Complete Technology Stack Recommendation

### 1. Core Framework & Build

```
Next.js 14+ (App Router)
├── TypeScript 5+           # Type safety (types provided in API doc)
├── Tailwind CSS 3.4+       # Utility-first CSS (comes with shadcn)
├── PostCSS                  # CSS processing
└── ESLint + Prettier        # Code quality
```

**Key Next.js Features to Use**:

- App Router for modern routing
- Server Components for SEO (product pages)
- Server Actions for form handling
- Streaming for loading states
- Image optimization (for non-3D images like logos)

---

### 2. 3D Product Visualization

```
React Three Fiber (R3F)      # React renderer for Three.js
├── @react-three/drei        # Useful helpers (OrbitControls, etc.)
├── @react-three/fiber       # Core React integration
├── three                    # Three.js core
└── GLTF/GLB models          # 3D shirt models per style
```

**3D Features Needed**:
| Feature | Implementation |
|---------|---------------|
| Color changing | Material color swap on mesh |
| Rotation | OrbitControls for 360° view |
| Zoom | Camera controls |
| Design placement preview | Decal projection or texture mapping |
| Size visualization | Scale adjustments or size labels |
| Multiple shirt styles | Separate GLTF models per style |

**Model Requirements**:

- ~5-10 base models (T-Shirt, V-Neck, Hoodie, Polo, Long Sleeve, etc.)
- UV-mapped for potential design texture application
- Optimized for web (< 1MB per model)
- Materials set up for color swapping

---

### 3. State Management

```
Client State
├── Zustand                  # Cart, UI state (lightweight)
├── React Context            # Auth state, theme
└── URL State                # Filters, pagination (Next.js searchParams)

Server State
├── TanStack Query (React Query)  # API data fetching & caching
└── Next.js Server Components     # Initial data loading
```

**Why This Combination**:

- Zustand: Simple cart management, persists to localStorage
- TanStack Query: Automatic caching, refetching, optimistic updates
- Server Components: SEO-friendly product listings

---

### 4. Authentication & Security

```
JWT Token Management
├── httpOnly cookies         # Secure token storage (recommended)
├── next-auth (optional)     # Or custom JWT handling
├── API route handlers       # Token refresh proxy
└── Middleware               # Protected route checks
```

**Auth Flow**:

```
1. Login → API returns access_token + refresh_token
2. Store in httpOnly cookies (via API route)
3. Middleware checks auth on protected routes
4. Automatic refresh via interceptor
```

**Security Considerations**:

- Never store tokens in localStorage (XSS vulnerable)
- Use httpOnly cookies with SameSite=Strict
- CSRF protection for cookie-based auth
- API already has CORS configured for store domain

---

### 5. Form Handling & Validation

```
React Hook Form              # Performance-optimized forms
├── @hookform/resolvers      # Validation adapter
├── Zod                      # Schema validation
└── shadcn Form components   # Pre-built form UI
```

**Forms Needed**:

- Registration form
- Login form
- Profile update form
- Checkout form
- Contact/support form
- Design request form

---

### 6. API Integration

```
Fetch/Axios Client
├── Custom API client        # Base URL, interceptors
├── Type-safe hooks          # useProducts, useOrders, etc.
├── Error handling           # Centralized error management
└── Optimistic updates       # Cart, profile changes
```

**API Client Structure**:

```typescript
// lib/api-client.ts
const api = {
  auth: {
    login,
    register,
    refresh,
    logout,
    me,
  },
  products: {
    list,
    get,
    calculatePrice,
    validate,
  },
  orders: {
    create,
    track,
    list,
    get,
    requestChange,
  },
  customer: {
    getProfile,
    updateProfile,
    changePassword,
  },
};
```

---

### 7. E-commerce Features

```
Shopping Cart
├── Zustand store            # Cart state
├── localStorage persistence # Persist between sessions
├── Cart drawer/modal        # shadcn Sheet component
└── Price calculation        # API integration

Checkout Flow
├── Multi-step form          # Address → Review → Confirm
├── Order summary            # Live total calculation
├── Guest checkout (optional)# Or require account
└── Order confirmation       # Success page with tracking code

Product Configuration
├── Size selector            # From API product.sizes
├── Color selector           # Updates 3D model
├── Method selector          # DTF, Embroidery
├── Design placement         # Front, Back, Sleeve selectors
├── Quantity input           # With price updates
└── Design upload            # File upload for artwork
```

---

### 8. UI/UX Components

**shadcn/ui Components to Install**:

```bash
# Core
npx shadcn-ui@latest add button card dialog sheet
npx shadcn-ui@latest add input label select checkbox radio-group
npx shadcn-ui@latest add form toast sonner
npx shadcn-ui@latest add tabs accordion dropdown-menu
npx shadcn-ui@latest add avatar badge skeleton
npx shadcn-ui@latest add separator scroll-area

# E-commerce specific
npx shadcn-ui@latest add carousel slider
npx shadcn-ui@latest add table pagination
```

**Custom Components Needed**:
| Component | Purpose |
|-----------|---------|
| ProductCard | Product grid display |
| Product3DViewer | Three.js canvas wrapper |
| ColorPicker | Visual color selection |
| SizeSelector | Size buttons with availability |
| DesignConfigurator | Placement area selector |
| CartItem | Cart line item |
| OrderStatusBadge | Status display |
| PriceDisplay | Formatted pricing |

---

### 9. Design System (Red Accent)

**Tailwind Config**:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E5192B', // AZTEAM Red
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#E5192B',
          600: '#CC1626',
          700: '#B31221',
        },
        // Neutral palette for contrast
      },
    },
  },
};
```

**Design Tokens**:

- Primary: #E5192B (red) - buttons, links, accents
- Background: White (#FFFFFF) - clean, modern
- Text: Gray-900 for headings, Gray-600 for body
- Success: Green for completed orders
- Warning: Amber for pending states
- Error: Red for validation errors

---

### 10. Performance & SEO

```
Next.js Optimizations
├── Server Components        # Static product pages
├── Streaming                # Progressive loading
├── Image optimization       # For logos, banners
├── Font optimization        # next/font
└── Bundle analysis          # @next/bundle-analyzer

SEO
├── Metadata API             # Dynamic meta tags
├── JSON-LD                  # Structured data for products
├── Sitemap generation       # next-sitemap
├── robots.txt               # Search engine directives
└── OpenGraph images         # Social sharing
```

---

### 11. Analytics & Monitoring

```
Analytics
├── Google Analytics 4       # Or privacy-focused alternative
├── Vercel Analytics         # If hosting on Vercel
└── Custom event tracking    # Add to cart, checkout, etc.

Error Tracking
├── Sentry                   # Error monitoring
└── LogRocket (optional)     # Session replay

Performance
├── Vercel Speed Insights    # Core Web Vitals
└── Lighthouse CI            # Automated audits
```

---

### 12. Deployment & Hosting

```
Recommended: Vercel
├── Automatic deployments    # GitHub integration
├── Edge functions           # Low-latency API routes
├── Preview deployments      # PR previews
├── Environment variables    # Secure secrets
└── Analytics built-in       # No extra setup
```

**Environment Variables**:

```env
# .env.local
NEXT_PUBLIC_API_URL=https://erp.azteamtech.com
NEXT_PUBLIC_STORE_NAME=AZTEAM Custom Apparel

# Server-only (for API routes)
JWT_COOKIE_NAME=azteam_auth
```

---

### 13. Optional Enhancements

**Payment Processing** (if needed):

```
Stripe
├── @stripe/stripe-js        # Client SDK
├── stripe                   # Server SDK
└── Stripe Elements          # Payment UI
```

_Note: ERP tracks payment_status, so payments could be:_

- Online via Stripe/PayPal
- In-person at pickup
- Invoice-based for businesses

**PWA Features**:

```
next-pwa                     # Service worker generation
├── Offline product browsing
├── Cart persistence
└── Push notifications (order updates)
```

**Email (Transactional)**:

```
Resend or SendGrid
├── Order confirmation emails
├── Shipping updates
└── Marketing (with consent)
```

_Note: ERP already sends verification/reset emails_

**File Upload (Design Artwork)**:

```
UploadThing or Cloudinary
├── Customer artwork upload
├── Image optimization
├── Secure storage
└── Preview generation
```

---

## Recommended Package.json Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",

    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.88.0",
    "three": "^0.159.0",

    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",

    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",

    "tailwindcss": "^3.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.292.0",

    "sonner": "^1.2.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0",
    "@types/three": "^0.159.0",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0"
  }
}
```

---

## Project Structure

```
src/
├── app/
│   ├── (shop)/                    # Shop layout group
│   │   ├── page.tsx               # Homepage
│   │   ├── products/
│   │   │   ├── page.tsx           # Product listing
│   │   │   └── [id]/page.tsx      # Product detail
│   │   ├── cart/page.tsx          # Cart page
│   │   └── checkout/page.tsx      # Checkout flow
│   ├── (auth)/                    # Auth layout group
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── verify-email/page.tsx
│   ├── (account)/                 # Protected account pages
│   │   ├── orders/page.tsx
│   │   ├── orders/[id]/page.tsx
│   │   └── profile/page.tsx
│   ├── track/[code]/page.tsx      # Public order tracking
│   ├── api/                       # API routes (auth proxy)
│   └── layout.tsx                 # Root layout
├── components/
│   ├── ui/                        # shadcn components
│   ├── 3d/                        # Three.js components
│   │   ├── ProductViewer.tsx
│   │   ├── ShirtModel.tsx
│   │   └── models/                # GLTF files
│   ├── cart/
│   ├── product/
│   └── layout/
├── lib/
│   ├── api/                       # API client
│   ├── stores/                    # Zustand stores
│   ├── hooks/                     # Custom hooks
│   └── utils/                     # Utilities
├── types/                         # TypeScript types (from API doc)
└── styles/
    └── globals.css                # Tailwind + custom styles
```

---

## Finalized Requirements (User Confirmed)

### 1. Payment Processing: ALL OPTIONS

```
Payment Methods
├── Stripe                   # Online credit/debit cards
├── PayPal                   # Alternative online payment
├── In-person at pickup      # Cash/card when collecting
└── Invoice for businesses   # Net 30 terms, tracked in ERP
```

**Implementation**:

- Stripe Checkout for cards (simplest integration)
- PayPal button as alternative
- "Pay Later" option → sets payment_status = "unpaid" in ERP
- Order notes field for invoice/billing info

### 2. Design Upload: YES, DURING ORDER

```
File Upload Integration
├── UploadThing or Cloudinary  # File storage service
├── Accept: PNG, JPG, PDF, AI, EPS, SVG
├── Max file size: 25MB
├── Preview thumbnail generation
└── Stores in ERP design_files table
```

**Workflow**:

1. Customer uploads artwork during checkout
2. Files stored in cloud (UploadThing/Cloudinary)
3. Reference saved to order in ERP
4. Links to ERP's existing artwork queue workflow

### 3. Guest Checkout: EMAIL REQUIRED

```
Checkout Flow
├── Email always required     # For order confirmation & tracking
├── Account creation optional # "Create password?" checkbox
├── Guest orders linked by email
└── Can claim orders later with account
```

**Implementation**:

- Collect email first in checkout
- Check if account exists → prompt login
- If new email → continue as guest
- Optional: "Save as account" at end
- Guest orders tracked via email + tracking code

### 4. Languages: BILINGUAL (EN + PT)

```
Internationalization
├── next-intl                 # i18n library for Next.js
├── /en/ and /pt/ routes      # URL-based locale
├── Language switcher         # Header component
├── Match ERP portal system   # Consistent translations
└── Browser detection         # Auto-detect preference
```

**Implementation**:

- Middleware for locale detection
- Translation JSON files (messages/en.json, messages/pt.json)
- Use ERP's existing translation keys where applicable
- Date/currency formatting per locale

---

## Implementation Priority (Updated with Finalized Requirements)

| Phase     | Features                                                  | Est. Time      |
| --------- | --------------------------------------------------------- | -------------- |
| 1         | Project setup, shadcn, Tailwind, i18n setup, basic layout | 3-4 days       |
| 2         | 3D viewer with color changing (React Three Fiber)         | 4-5 days       |
| 3         | Product catalog (API integration, bilingual)              | 2-3 days       |
| 4         | Cart & price calculator with design upload                | 3-4 days       |
| 5         | Auth (register/login/JWT + guest email flow)              | 3-4 days       |
| 6         | Checkout with Stripe/PayPal + pay-later options           | 4-5 days       |
| 7         | Account pages (orders, profile)                           | 2-3 days       |
| 8         | Public order tracking (bilingual)                         | 1-2 days       |
| 9         | Polish, testing, SEO, PWA                                 | 4-5 days       |
| **Total** | **Full MVP**                                              | **~5-6 weeks** |

---

## Updated Dependencies (with all requirements)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",

    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.88.0",
    "three": "^0.159.0",

    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",

    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",

    "tailwindcss": "^3.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.292.0",
    "sonner": "^1.2.0",

    "next-intl": "^3.4.0",

    "@stripe/stripe-js": "^2.2.0",
    "@paypal/react-paypal-js": "^8.1.0",

    "uploadthing": "^6.0.0",
    "@uploadthing/react": "^6.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0",
    "@types/three": "^0.159.0",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0",
    "stripe": "^14.0.0"
  }
}
```

---

## API Modifications Needed (ERP Backend)

To fully support guest checkout and file uploads, consider these ERP API enhancements:

### 1. Guest Order Creation

Current API requires JWT. For guest checkout, options:

**Option A: Create guest customer record**

```
POST /api/auth/guest
Body: { "email": "guest@example.com", "full_name": "Guest" }
Response: { "customer_id": 999, "access_token": "..." }
```

**Option B: Allow orders without auth but with email**

```
POST /api/v1/orders (modified)
Body: { "guest_email": "guest@example.com", "items": [...] }
```

### 2. File Upload Endpoint

```
POST /api/v1/orders/{id}/upload-artwork
Headers: Authorization: Bearer <token>
Body: multipart/form-data with file
Response: { "file_id": 123, "url": "..." }
```

_Or use external service (UploadThing) and just store reference URL in order notes_

---

## Complete Project Structure (Final)

```
src/
├── app/
│   ├── [locale]/                  # Locale wrapper (en, pt)
│   │   ├── (shop)/
│   │   │   ├── page.tsx           # Homepage
│   │   │   ├── products/
│   │   │   │   ├── page.tsx       # Product listing
│   │   │   │   └── [id]/page.tsx  # Product detail + 3D viewer
│   │   │   ├── cart/page.tsx
│   │   │   └── checkout/
│   │   │       ├── page.tsx       # Checkout flow
│   │   │       ├── success/page.tsx
│   │   │       └── cancel/page.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (account)/
│   │   │   ├── layout.tsx         # Protected layout
│   │   │   ├── orders/page.tsx
│   │   │   ├── orders/[id]/page.tsx
│   │   │   └── profile/page.tsx
│   │   └── track/[code]/page.tsx  # Public tracking
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # Auth handlers
│   │   ├── uploadthing/route.ts   # File upload
│   │   └── webhooks/
│   │       └── stripe/route.ts    # Stripe webhooks
│   └── layout.tsx
├── components/
│   ├── ui/                        # shadcn components
│   ├── 3d/
│   │   ├── ProductViewer.tsx      # Main 3D canvas
│   │   ├── ShirtModel.tsx         # Shirt with color props
│   │   ├── HoodieModel.tsx        # Hoodie with color props
│   │   └── controls/
│   │       ├── ColorSelector.tsx
│   │       └── DesignPlacer.tsx   # Visual design placement
│   ├── cart/
│   │   ├── CartDrawer.tsx
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│   ├── checkout/
│   │   ├── CheckoutForm.tsx
│   │   ├── PaymentOptions.tsx
│   │   ├── StripePayment.tsx
│   │   ├── PayPalPayment.tsx
│   │   └── DesignUpload.tsx
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── SizeSelector.tsx
│   │   └── MethodSelector.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── LanguageSwitcher.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts              # API client
│   │   ├── auth.ts                # Auth hooks
│   │   ├── products.ts            # Product hooks
│   │   └── orders.ts              # Order hooks
│   ├── stores/
│   │   ├── cart.ts                # Zustand cart store
│   │   └── auth.ts                # Auth state
│   ├── stripe.ts                  # Stripe config
│   └── uploadthing.ts             # Upload config
├── messages/
│   ├── en.json                    # English translations
│   └── pt.json                    # Portuguese translations
├── types/
│   └── index.ts                   # TypeScript types (from API doc)
└── middleware.ts                  # Locale + auth middleware
```
