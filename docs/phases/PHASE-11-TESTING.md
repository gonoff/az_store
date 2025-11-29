# Phase 11: Testing & Quality Assurance

**Status**: ⏳ Pending
**Dependencies**: Phases 1-10

## Overview

Comprehensive testing strategy covering unit tests, integration tests, end-to-end tests, and accessibility audits.

## Goals

- Unit testing with Vitest
- Component testing with React Testing Library
- E2E testing with Playwright
- API mocking with MSW
- Accessibility testing
- Performance testing
- Type checking & linting

---

## Step 11.1: Install Testing Dependencies

```bash
npm install -D vitest @vitejs/plugin-react jsdom
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @playwright/test
npm install -D msw
npm install -D @axe-core/react axe-playwright
```

---

## Step 11.2: Vitest Configuration

**File**: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/', '**/*.d.ts', '**/*.config.*', '**/types/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

## Step 11.3: Test Setup File

**File**: `src/test/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

// Extend matchers
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// MSW setup
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));
```

---

## Step 11.4: MSW Handlers

**File**: `src/test/mocks/handlers.ts`

```typescript
import { http, HttpResponse } from 'msw';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const handlers = [
  // Products
  http.get(`${API_URL}/api/v1/products`, () => {
    return HttpResponse.json({
      products: [
        {
          id: 1,
          name: 'Test T-Shirt',
          slug: 'test-t-shirt',
          basePrice: 25.99,
          categoryId: 1,
          description: 'A test t-shirt',
          images: ['/test-image.jpg'],
          variants: [{ id: 1, size: 'M', color: 'black', stock: 10 }],
        },
      ],
      total: 1,
      page: 1,
      limit: 12,
    });
  }),

  http.get(`${API_URL}/api/v1/products/:slug`, ({ params }) => {
    return HttpResponse.json({
      id: 1,
      name: 'Test T-Shirt',
      slug: params.slug,
      basePrice: 25.99,
      categoryId: 1,
      description: 'A test t-shirt',
      images: ['/test-image.jpg'],
      variants: [{ id: 1, size: 'M', color: 'black', stock: 10 }],
    });
  }),

  // Categories
  http.get(`${API_URL}/api/v1/categories`, () => {
    return HttpResponse.json([
      { id: 1, name: 'T-Shirts', slug: 't-shirts' },
      { id: 2, name: 'Hoodies', slug: 'hoodies' },
    ]);
  }),

  // Auth
  http.post(`${API_URL}/api/v1/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === 'test@example.com' && body.password === 'password') {
      return HttpResponse.json({
        user: { id: 1, email: 'test@example.com', name: 'Test User' },
        token: 'mock-jwt-token',
      });
    }

    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),

  http.get(`${API_URL}/api/v1/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (authHeader === 'Bearer mock-jwt-token') {
      return HttpResponse.json({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      });
    }

    return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }),

  // Orders
  http.get(`${API_URL}/api/v1/orders`, () => {
    return HttpResponse.json({
      orders: [
        {
          id: 1,
          orderNumber: 'ORD-001',
          status: 'processing',
          total: 75.99,
          createdAt: '2024-01-15T10:00:00Z',
        },
      ],
      total: 1,
    });
  }),

  // Contact
  http.post(`${API_URL}/api/v1/contact`, () => {
    return HttpResponse.json({ success: true });
  }),
];
```

---

## Step 11.5: MSW Server

**File**: `src/test/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

---

## Step 11.6: Test Utilities

**File**: `src/test/utils.tsx`

```typescript
import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';

// Create a new QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface AllProvidersProps {
  children: ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllProviders, ...options }),
  };
}

export * from '@testing-library/react';
export { customRender as render };
```

---

## Step 11.7: Component Test Example

**File**: `src/components/ui/__tests__/Button.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import { Button } from '../button';

describe('Button', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const { user } = render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders with destructive variant', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive');
  });

  it('renders as a link when asChild is used with an anchor', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    expect(screen.getByRole('link', { name: /link button/i })).toHaveAttribute('href', '/test');
  });
});
```

---

## Step 11.8: Hook Test Example

**File**: `src/hooks/__tests__/useDebounce.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    });

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('cancels previous timeout on value change', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'first' },
    });

    rerender({ value: 'second' });
    act(() => {
      vi.advanceTimersByTime(250);
    });

    rerender({ value: 'third' });
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current).toBe('third');
  });
});
```

---

## Step 11.9: Cart Store Test Example

**File**: `src/lib/stores/__tests__/cart.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../cart';

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('adds items to cart', () => {
    const { addItem, items } = useCartStore.getState();

    addItem({
      productId: 1,
      productName: 'Test Shirt',
      size: 'M',
      color: 'black',
      method: 'dtg',
      quantity: 2,
      unitPrice: 25.99,
      image: '/test.jpg',
    });

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it('updates item quantity', () => {
    const { addItem, updateQuantity } = useCartStore.getState();

    addItem({
      productId: 1,
      productName: 'Test Shirt',
      size: 'M',
      color: 'black',
      method: 'dtg',
      quantity: 1,
      unitPrice: 25.99,
      image: '/test.jpg',
    });

    const itemId = useCartStore.getState().items[0].id;
    updateQuantity(itemId, 5);

    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it('removes items from cart', () => {
    const { addItem, removeItem } = useCartStore.getState();

    addItem({
      productId: 1,
      productName: 'Test Shirt',
      size: 'M',
      color: 'black',
      method: 'dtg',
      quantity: 1,
      unitPrice: 25.99,
      image: '/test.jpg',
    });

    const itemId = useCartStore.getState().items[0].id;
    removeItem(itemId);

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('calculates total correctly', () => {
    const { addItem } = useCartStore.getState();

    addItem({
      productId: 1,
      productName: 'Test Shirt',
      size: 'M',
      color: 'black',
      method: 'dtg',
      quantity: 2,
      unitPrice: 25.0,
      image: '/test.jpg',
    });

    addItem({
      productId: 2,
      productName: 'Test Hoodie',
      size: 'L',
      color: 'blue',
      method: 'screen',
      quantity: 1,
      unitPrice: 50.0,
      image: '/test2.jpg',
    });

    expect(useCartStore.getState().total).toBe(100.0);
  });

  it('clears cart', () => {
    const { addItem, clearCart } = useCartStore.getState();

    addItem({
      productId: 1,
      productName: 'Test Shirt',
      size: 'M',
      color: 'black',
      method: 'dtg',
      quantity: 1,
      unitPrice: 25.99,
      image: '/test.jpg',
    });

    clearCart();

    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().total).toBe(0);
  });
});
```

---

## Step 11.10: Playwright Configuration

**File**: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Step 11.11: E2E Test Example - Homepage

**File**: `e2e/homepage.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en');
  });

  test('displays header with navigation', async ({ page }) => {
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('link', { name: /products/i })).toBeVisible();
  });

  test('displays hero section', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /shop now/i })).toBeVisible();
  });

  test('navigates to products page', async ({ page }) => {
    await page.getByRole('link', { name: /products/i }).click();
    await expect(page).toHaveURL(/\/products/);
  });

  test('switches language', async ({ page }) => {
    await page.getByRole('button', { name: /language/i }).click();
    await page.getByRole('menuitem', { name: /português/i }).click();
    await expect(page).toHaveURL(/\/pt/);
  });
});
```

---

## Step 11.12: E2E Test Example - Product Flow

**File**: `e2e/product-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Product Flow', () => {
  test('adds product to cart', async ({ page }) => {
    // Navigate to products
    await page.goto('/en/products');

    // Click on first product
    await page.locator('[data-testid="product-card"]').first().click();

    // Wait for product page
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Select options
    await page.getByLabel(/size/i).selectOption('M');
    await page.getByLabel(/color/i).selectOption('black');

    // Add to cart
    await page.getByRole('button', { name: /add to cart/i }).click();

    // Verify cart updated
    await expect(page.getByTestId('cart-count')).toContainText('1');
  });

  test('completes checkout as guest', async ({ page }) => {
    // Add item to cart first
    await page.goto('/en/products/test-t-shirt');
    await page.getByLabel(/size/i).selectOption('M');
    await page.getByRole('button', { name: /add to cart/i }).click();

    // Go to checkout
    await page.getByRole('link', { name: /checkout/i }).click();

    // Fill customer info
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/first name/i).fill('John');
    await page.getByLabel(/last name/i).fill('Doe');
    await page.getByRole('button', { name: /continue/i }).click();

    // Fill shipping
    await page.getByLabel(/address/i).fill('123 Test St');
    await page.getByLabel(/city/i).fill('Test City');
    await page.getByLabel(/zip/i).fill('12345');
    await page.getByRole('button', { name: /continue/i }).click();

    // Verify on payment step
    await expect(page.getByText(/payment/i)).toBeVisible();
  });
});
```

---

## Step 11.13: E2E Test Example - Authentication

**File**: `e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('shows login form', async ({ page }) => {
    await page.goto('/en/login');

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('shows validation errors', async ({ page }) => {
    await page.goto('/en/login');

    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText(/email is required/i)).toBeVisible();
  });

  test('redirects to account after login', async ({ page }) => {
    await page.goto('/en/login');

    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/account/);
  });

  test('shows register form', async ({ page }) => {
    await page.goto('/en/register');

    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });
});
```

---

## Step 11.14: Accessibility Tests

**File**: `e2e/accessibility.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage has no accessibility violations', async ({ page }) => {
    await page.goto('/en');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('products page has no accessibility violations', async ({ page }) => {
    await page.goto('/en/products');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('checkout page has no accessibility violations', async ({ page }) => {
    // Add item to cart first
    await page.goto('/en/products');
    await page.locator('[data-testid="product-card"]').first().click();
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.goto('/en/checkout');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('forms have proper labels', async ({ page }) => {
    await page.goto('/en/contact');

    // All form inputs should have associated labels
    const inputs = page.locator('input, textarea, select');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }
  });
});
```

---

## Step 11.15: Package.json Test Scripts

**Update**: `package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:a11y": "playwright test --grep @accessibility",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "validate": "npm run typecheck && npm run lint && npm run test:run"
  }
}
```

---

## Step 11.16: CI/CD Pipeline

**File**: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: .next/
```

---

## Deliverables Checklist

- [ ] Vitest configuration
- [ ] Test setup file
- [ ] MSW handlers for API mocking
- [ ] Test utilities wrapper
- [ ] Component tests
- [ ] Hook tests
- [ ] Store tests
- [ ] Playwright configuration
- [ ] E2E tests for critical flows
- [ ] Accessibility tests
- [ ] CI/CD pipeline
- [ ] Test scripts in package.json
- [ ] Coverage reporting

---

## Files to Create

| File                         | Purpose                  |
| ---------------------------- | ------------------------ |
| `vitest.config.ts`           | Vitest configuration     |
| `src/test/setup.ts`          | Test setup & MSW         |
| `src/test/mocks/handlers.ts` | API mock handlers        |
| `src/test/mocks/server.ts`   | MSW server               |
| `src/test/utils.tsx`         | Test utilities           |
| `playwright.config.ts`       | Playwright config        |
| `e2e/homepage.spec.ts`       | Homepage E2E tests       |
| `e2e/product-flow.spec.ts`   | Product flow E2E tests   |
| `e2e/auth.spec.ts`           | Authentication E2E tests |
| `e2e/accessibility.spec.ts`  | Accessibility tests      |
| `.github/workflows/ci.yml`   | CI pipeline              |

---

## Next Phase

→ **Phase 12: Production Preparation**
