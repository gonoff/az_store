# AZTEAM Store - Implementation Phases

This folder contains detailed documentation for each implementation phase.

## Phase Overview

| Phase | Name                     | Status       | Duration   |
| ----- | ------------------------ | ------------ | ---------- |
| 0     | Foundation & DevOps      | ✅ Completed | Day 1      |
| 1     | Design System & Layout   | ✅ Completed | Days 2-3   |
| 2     | API Layer & Types        | ⏳ Pending   | Days 4-5   |
| 3     | Authentication System    | ⏳ Pending   | Days 6-8   |
| 4     | Product Catalog          | ⏳ Pending   | Days 9-11  |
| 5     | 3D Product Visualization | ⏳ Pending   | Days 12-15 |
| 6     | Shopping Cart            | ⏳ Pending   | Days 16-18 |
| 7     | Checkout Flow            | ⏳ Pending   | Days 19-22 |
| 8     | Payment Integration      | ⏳ Pending   | Days 23-26 |
| 9     | Account Management       | ⏳ Pending   | Days 27-29 |
| 10    | Public Features & SEO    | ⏳ Pending   | Days 30-32 |
| 11    | Testing & Quality        | ⏳ Pending   | Days 33-35 |
| 12    | Production Prep          | ⏳ Pending   | Days 36-38 |

## Phase Documents

- [Phase 0: Foundation & DevOps](./PHASE-0-FOUNDATION.md) ✅
- [Phase 1: Design System & Layout](./PHASE-1-DESIGN-SYSTEM.md) ✅
- Phase 2: API Layer & Types (coming soon)
- Phase 3: Authentication System (coming soon)
- Phase 4: Product Catalog (coming soon)
- Phase 5: 3D Product Visualization (coming soon)
- Phase 6: Shopping Cart (coming soon)
- Phase 7: Checkout Flow (coming soon)
- Phase 8: Payment Integration (coming soon)
- Phase 9: Account Management (coming soon)
- Phase 10: Public Features & SEO (coming soon)
- Phase 11: Testing & Quality (coming soon)
- Phase 12: Production Prep (coming soon)

## Quick Reference

### Current Phase: 2 - API Layer & Types

**Goals**:

1. Create TypeScript types for all API entities (products, cart, orders, etc.)
2. Build API client with axios/ky
3. Setup TanStack Query for server state management
4. Create custom hooks for data fetching
5. Handle API errors consistently

### Key Decisions Made

- **3D Models**: Programmatic Three.js models (replaceable with GLTF later)
- **Hosting**: Hostinger VPS with Docker + Nginx
- **Payments**: Stripe + PayPal + Pay Later
- **i18n**: next-intl (English + Portuguese)
- **Analytics**: Google Analytics 4

### Important Files

| File                                 | Purpose                    |
| ------------------------------------ | -------------------------- |
| `CLAUDE.md`                          | AI context for Claude Code |
| `docs/TECH_STACK.md`                 | Full technology plan       |
| `docs/NEXTJS_STORE_API_REFERENCE.md` | ERP API documentation      |
| `docs/WORKFLOW.md`                   | Development workflow       |
| `.env.example`                       | Environment template       |

## Legend

- ✅ Completed
- 🔄 In Progress
- ⏳ Pending
- ❌ Blocked
