# User Project Profile

- Mission: `software-dev`
- Interview profile: `comprehensive`

## Interview Answers

- **Project Intent**: Tablet-first assistive communication SPA for post-surgery patients who temporarily cannot speak. Enables non-verbal communication with caregivers through tap-based category grids (feelings, pain scale, body parts, food, daily tasks, people, places, objects, questions). Users may be cognitively slowed by sedatives so the UI must be extremely simple, high contrast, and require minimal mental effort. Large touch targets, emoji-based icons, and minimal navigation depth.
- **Languages Frameworks**: TypeScript 6, React 19, Vite 8, Tailwind CSS 4, lucide-react for icons. Supabase (PostgreSQL) for backend data persistence and auth. No external state management — React hooks only.
- **Testing Requirements**: Vitest for unit/integration tests, Playwright for e2e. Coverage target 80%+. Test accessibility (a11y) on all interactive components. No test framework installed yet — to be set up.
- **Quality Gates**: Tests pass, ESLint clean, TypeScript strict mode, no unresolved review findings, Lighthouse accessibility score 90+.
- **Review Policy**: At least one focused reviewer approves before merge.
- **Performance Targets**: First contentful paint under 2s on mobile 3G. Bundle size kept minimal — code-split aggressively. Touch targets minimum 48px (currently 70-90px on category tiles).
- **Deployment Constraints**: Deployable to Netlify and/or Coolify. SPA with static build output via Vite.
- **Documentation Policy**: Keep README current with setup instructions and architecture overview. Document accessibility design decisions.
- **Risk Boundaries**: Never expose Supabase service-role keys in frontend code. All data access must go through RLS policies. Patient data is sensitive — no analytics or third-party tracking without explicit consent.
- **Amendment Process**: Amendments proposed by PR and reviewed before adoption.
- **Exception Policy**: Exceptions must include rationale and expiration criteria.

## Selected Doctrine

- Paradigms: test-first
- Directives: TEST_FIRST
- Tools: git, spec-kitty

