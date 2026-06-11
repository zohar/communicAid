# communicAid

## Overview

communicAid is a tablet-first single-page application (SPA) designed to help post-surgery patients with temporary cognitive impairment communicate with their care team, caregivers, and family. The app enables simple, low-effort communication for patients who are unable to speak or are cognitively slowed by sedatives.

## Purpose

Post-surgery patients often face temporary challenges with speech and cognition due to anesthesia and medication effects. communicAid bridges this communication gap by providing an intuitive, accessible interface that requires minimal cognitive effort to navigate and use.

## Key Features

- **9 Communication Categories** with emoji icons for quick recognition
  - Pain scale, yes/no responses, medical needs, family notifications, and more
- **Large, High-Contrast UI** optimized for sedated patients
  - 70–90px tiles with accessible touch targets (48px minimum)
- **Quick Actions Bar** at the bottom for frequent needs (Yes/No/Help/family member names)
- **Recent Items Tracking** to learn user preferences over time
- **Favorite Quick-Names** for frequently contacted people
- **Accessibility-First Design** targeting Lighthouse accessibility score 90+

## Design Principles

1. **Cognitive Simplicity** – Minimal navigation, obvious actions, large targets
2. **Accessibility** – High contrast, keyboard/voice-friendly, WCAG compliant
3. **Security** – Row-Level Security (RLS) policies, no service-role keys exposed
4. **Performance** – First Contentful Paint (FCP) <2s on mobile 3G

## Tech Stack

**Frontend:**
- TypeScript
- React 19
- Vite
- Tailwind CSS
- lucide-react (icons)
- React hooks (no external state management)

**Backend:**
- Supabase (PostgreSQL)
- Row-Level Security (RLS) policies

**Deployment:**
- Static SPA via Netlify or Coolify

## Current Status

- ✅ UI functional with hardcoded categories
- ⏳ Supabase schema exists but not fully integrated
- ❌ Authentication not yet implemented
- ❌ Tests not yet implemented
- ❌ Deployment configuration pending

## Getting Started

(Setup instructions coming soon)

## Contributing

(Contribution guidelines coming soon)
