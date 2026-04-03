# communicAid

Tablet-first assistive communication SPA for post-surgery patients who temporarily cannot speak. Users may be cognitively slowed by sedatives — the UI must be extremely simple, high-contrast, and require minimal mental effort.

## Stack

- **Frontend**: TypeScript 6, React 19, Vite 8, Tailwind CSS 4, lucide-react
- **Backend**: Supabase (PostgreSQL) with RLS policies
- **State**: React hooks only (no external state management)
- **Testing** (planned): Vitest + Playwright
- **Deployment**: Netlify and/or Coolify (static SPA build)

## Project Structure

```
src/
  components/
    screens/       # HomeScreen, CategoryScreen
    Header.tsx     # Title, clock, navigation buttons
    ActionBar.tsx  # Bottom fixed actions (Yes/No/Help/etc) + quick names
    RecentItems.tsx
    CategoryTile.tsx
    ItemButton.tsx
  data/
    categories.ts  # All category/item definitions (hardcoded)
  types.ts         # TypeScript interfaces
  App.tsx          # Root component + navigation state
supabase/
  migrations/      # PostgreSQL schema (recent_items, quick_names)
```

## Key Design Principles

1. **Cognitive simplicity**: Large touch targets (70-90px tiles, 48px minimum), emoji icons, minimal navigation depth
2. **Accessibility first**: Lighthouse a11y score 90+, test all interactive components
3. **Security**: Never expose Supabase service-role keys in frontend. All DB access via RLS. No analytics/tracking without consent
4. **Performance**: FCP under 2s on mobile 3G, aggressive code-splitting

## Scripts

```bash
npm run dev        # Vite dev server
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

## Current State

- UI is functional with 9 communication categories, pain scale, action bar
- Data is hardcoded in categories.ts (not yet loading from Supabase)
- Supabase schema exists but integration is not wired up
- No auth, no tests, no deployment config yet
