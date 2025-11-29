# Phase 0: Foundation & DevOps

**Status**: ✅ COMPLETED
**Duration**: Day 1

## Overview

Project scaffolding with quality gates from the start.

## Completed Tasks

### 1. Next.js Project Initialization

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

- Next.js 16 with App Router
- React 19
- TypeScript 5
- Tailwind CSS 4

### 2. Git Repository

- Initialized git repository
- Comprehensive `.gitignore` with:
  - Node modules, build outputs
  - Environment files (except `.env.example`)
  - IDE files, Storybook, Playwright artifacts
  - Claude Code files

### 3. Environment Configuration

**Files created**:

- `.env.example` - Template with all variables documented
- `.env.local` - Local development config
- `src/lib/env.ts` - Zod validation for environment variables

**Key variables**:

```env
NEXT_PUBLIC_API_URL=https://erp.azteamtech.com
NEXT_PUBLIC_STORE_NAME=AZTEAM Custom Apparel
NEXT_PUBLIC_STORE_URL=https://azteamonline.com
JWT_COOKIE_NAME=azteam_auth
JWT_COOKIE_SECRET=<32+ chars>
```

### 4. Code Quality Tools

- **Prettier**: Code formatting (`.prettierrc`, `.prettierignore`)
- **ESLint**: Linting with Next.js config
- **Husky**: Git hooks (`.husky/pre-commit`)
- **lint-staged**: Run linters on staged files only

### 5. Testing Infrastructure

- **Vitest**: Unit and integration tests
  - Config: `vitest.config.ts`
  - Setup: `tests/setup.ts`
  - Sample test: `tests/unit/env.test.ts`
- **Playwright**: E2E tests
  - Config: `playwright.config.ts`
  - Sample test: `tests/e2e/homepage.spec.ts`

### 6. Storybook

- Initialized Storybook 10 for Next.js
- Sample stories in `src/stories/`

### 7. Documentation

- `CLAUDE.md` - AI context file
- `docs/TECH_STACK.md` - Full implementation plan
- `docs/NEXTJS_STORE_API_REFERENCE.md` - ERP API docs
- `docs/WORKFLOW.md` - Development workflow

## Available Commands

| Command              | Description                 |
| -------------------- | --------------------------- |
| `npm run dev`        | Start development server    |
| `npm run build`      | Production build            |
| `npm run lint`       | Run ESLint                  |
| `npm run lint:fix`   | Fix ESLint issues           |
| `npm run format`     | Format with Prettier        |
| `npm run typecheck`  | TypeScript check            |
| `npm run test`       | Run Vitest tests            |
| `npm run test:watch` | Vitest in watch mode        |
| `npm run test:e2e`   | Run Playwright E2E tests    |
| `npm run storybook`  | Start Storybook (port 6006) |
| `npm run prepare`    | Install Husky hooks (auto)  |

## Project Structure After Phase 0

```
az_store/
├── .husky/                 # Git hooks
├── .storybook/             # Storybook config
├── docs/                   # Documentation
│   ├── TECH_STACK.md
│   ├── NEXTJS_STORE_API_REFERENCE.md
│   └── WORKFLOW.md
├── public/                 # Static assets
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   └── env.ts         # Environment validation
│   └── stories/           # Storybook examples
├── tests/
│   ├── e2e/               # Playwright tests
│   ├── integration/
│   ├── mocks/
│   └── unit/              # Vitest tests
├── .env.example
├── .env.local
├── .gitignore
├── .prettierrc
├── .prettierignore
├── CLAUDE.md
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── playwright.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── vitest.config.ts
```

## Dependencies Installed

```json
{
  "dependencies": {
    "next": "16.0.5",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "zod": "^4.1.13"
  },
  "devDependencies": {
    "@playwright/test": "^1.57.0",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "@vitejs/plugin-react": "^5.1.1",
    "eslint": "^9",
    "husky": "^9.1.7",
    "jsdom": "^27.2.0",
    "lint-staged": "^16.2.7",
    "msw": "^2.12.3",
    "prettier": "^3.7.2",
    "storybook": "^10.1.2",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^4.0.14"
  }
}
```

## Next Phase

→ **Phase 1: Design System & Layout**
