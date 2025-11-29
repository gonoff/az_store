# Development Workflow

## Git Workflow

### Branch Naming

- `feature/` - New features (e.g., `feature/product-catalog`)
- `fix/` - Bug fixes (e.g., `fix/cart-total`)
- `refactor/` - Code improvements (e.g., `refactor/api-client`)
- `docs/` - Documentation updates (e.g., `docs/readme`)

### Commit Messages

Follow conventional commits:

```
feat: add product listing page
fix: correct price calculation
refactor: extract cart store logic
docs: update API reference
test: add cart unit tests
chore: update dependencies
```

## Development Process

### Before Starting

1. Pull latest changes: `git pull origin main`
2. Create feature branch: `git checkout -b feature/my-feature`
3. Install dependencies if needed: `npm install`

### During Development

1. Run dev server: `npm run dev`
2. Run Storybook for component development: `npm run storybook`
3. Check types frequently: `npm run typecheck`
4. Format code: `npm run format`

### Before Committing

1. Run linter: `npm run lint:fix`
2. Run type check: `npm run typecheck`
3. Run tests: `npm run test`
4. Stage changes: `git add .`
5. Commit (pre-commit hooks will run): `git commit -m "feat: description"`

### Code Review Checklist

- [ ] TypeScript types are correct (no `any`)
- [ ] Components have Storybook stories
- [ ] Tests cover new functionality
- [ ] No console.logs in production code
- [ ] Environment variables documented
- [ ] i18n keys added for new text

## Testing Strategy

### Unit Tests (Vitest)

Location: `tests/unit/`

```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage
```

### E2E Tests (Playwright)

Location: `tests/e2e/`

```bash
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # With UI
npm run test:e2e:debug    # Debug mode
```

### What to Test

- **Unit**: Utility functions, Zustand stores, form validation
- **Component**: User interactions, form submissions
- **Integration**: API hooks with MSW mocks
- **E2E**: Critical user journeys (browse → cart → checkout)

## Component Development

### Creating New Components

1. Create component file in appropriate folder
2. Add TypeScript interface for props
3. Create Storybook story
4. Write unit tests if complex logic
5. Add to index.ts exports

### Component Structure

```tsx
// src/components/product/ProductCard.tsx
import { cn } from '@/lib/utils/cn';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  return <div className={cn('rounded-lg border p-4', className)}>{/* ... */}</div>;
}
```

### Storybook Story

```tsx
// src/components/product/ProductCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ProductCard } from './ProductCard';

const meta: Meta<typeof ProductCard> = {
  component: ProductCard,
  title: 'Product/ProductCard',
};

export default meta;
type Story = StoryObj<typeof ProductCard>;

export const Default: Story = {
  args: {
    product: mockProduct,
  },
};
```

## Deployment

### Local Docker Build

```bash
docker build -t azteam-store .
docker run -p 3000:3000 azteam-store
```

### Production Deploy (VPS)

```bash
# On VPS
cd /var/www/az_store
git pull origin main
docker compose up -d --build
```

### Environment Setup (Production)

1. Copy `.env.example` to `.env.production`
2. Fill in production values
3. Ensure `JWT_COOKIE_SECRET` is secure (32+ chars)
4. Set `NODE_ENV=production`
