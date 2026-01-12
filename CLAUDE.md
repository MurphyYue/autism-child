# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Star Cat (星童)** - An autism communication assistant that helps parents communicate with their autistic children using AI-powered behavioral simulations. The application provides realistic conversation simulations with an AI acting as the child, along with expert AI guidance for improving parent-child interactions.

**Tech Stack:**
- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Backend/Database**: Supabase (PostgreSQL with Row Level Security)
- **AI Processing**: Dify Chatflow API (dual API keys for different AI personas)
- **UI**: Tailwind CSS, shadcn/ui (Radix UI primitives), next-themes
- **i18n**: next-intl (English and Chinese, default is Chinese)
- **Forms**: React Hook Form with Zod validation

## Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

### App Router Structure

The app uses Next.js 15 App Router with the following key routes:

- `/` - Home/landing page
- `/auth/*` - Authentication pages (login, register, callback, verify-email)
- `/profiles` - Child profile creation and management
- `/scenarios` - Scenario creation and management
- `/scenarios/chat` - Interactive chat with AI simulation
- `/chat` - Direct chat interface

### Database Schema (Supabase)

**Key tables:**
- **`profiles`** - Child profiles with behavioral data, sensory preferences, communication style, interests, routines, and triggers. One profile per user (enforced by unique constraint on `user_id`).
- **`scenarios`** - Structured real-life situations with child behavior, triggers, and parent responses
- **`conversations`** - Chat sessions linked to profiles
- **`messages`** - Individual messages within conversations (role: 'parent' or 'ai')

All tables have Row Level Security (RLS) enabled with policies ensuring users can only access their own data.

### Authentication & Authorization

- Uses Supabase Auth with session persistence and auto-refresh
- `AuthProvider` component (components/auth-provider.tsx) wraps the app and provides auth context
- Custom hook `useAuth()` available in any component
- Protected routes check user authentication status
- Email verification flow implemented

### AI Integration (Dify API)

Located in `lib/dify.ts`:

**Two AI personas with separate API keys:**
1. **Main AI** (`getStarCatResponse`) - Simulates autistic child responses
2. **Scenario AI** (`getScenarioResponse`) - Provides expert guidance and analysis

**Key environment variables:**
- `NEXT_PUBLIC_DIFY_MAIN_API_KEY` - Child simulation AI
- `NEXT_PUBLIC_DIFY_SCENARIO_API_KEY` - Expert guidance AI
- `NEXT_PUBLIC_DIFY_API_URL` - Dify API endpoint
- `NEXT_PUBLIC_DIFY_USERID` - User identifier for Dify

**Response format:**
```typescript
interface DifyResponse {
  answer: string;
  conversation_id: string;
  suggestions?: string[];
}
```

### Internationalization

- Uses `next-intl` for translations
- Supported locales: `en`, `zh` (default: Chinese)
- Translation files in `messages/` directory
- Locale detection via `getUserLocale()` service
- Configuration in `i18n/config.ts` and `i18n/request.tsx`

### Component Organization

```
components/
├── ui/                    # shadcn/ui components (50+ reusable components)
├── auth-provider.tsx     # Authentication context
├── theme-provider.tsx    # Theme switching (dark/light mode)
├── PWAInstallModal.tsx   # PWA installation prompt
├── locale-switcher/      # Language switcher component
├── profiles/             # Profile management components
└── scenarios/            # Scenario-related components
```

### Type Definitions

Shared types in `types/` directory:
- `Profile` interface (types/profile.ts) - Child profile structure
- `Scenario` interface (types/scenario.ts) - Scenario data structure

### State Management

- React Context for authentication
- React hooks for local component state
- Supabase queries for server state
- No global state management library (Redux/Zustand) - uses React's built-in patterns

### Special Patterns

**Profile Structure:**
- JSONB columns for flexible data: `behavior_features`, `sensory_preferences`, `communication_style`, `interests`, `routines`, `triggers`
- Allows dynamic data structure without schema changes
- One profile per user constraint ensures single child profile per account

**Conversation Flow:**
1. User creates scenario with structured inputs
2. Dify API processes scenario and provides expert analysis
3. Interactive chat simulates child responses
4. Expert AI provides feedback and suggestions throughout

**RLS Policy Pattern:**
All tables use nested queries to verify ownership through `profiles.user_id = auth.uid()`, ensuring users can only access data linked to their own profiles.

## Important Implementation Notes

### Adding New Features

1. **Database changes**: Create new migration in `supabase/migrations/` with proper RLS policies
2. **Types**: Add/update TypeScript interfaces in `types/` directory
3. **Translations**: Update both `messages/en.json` and `messages/zh.json`
4. **UI components**: Use shadcn/ui patterns from `components/ui/` for consistency

### Working with AI

- Always use the appropriate API key based on the AI persona needed
- Handle conversation IDs properly to maintain context
- Parse the response for `suggestions` array to display optional responses
- Error handling: Dify API failures should be gracefully handled with user feedback

### Form Validation

- Uses React Hook Form with Zod schemas
- Follow existing validation patterns in profile/scenario forms
- Provide clear error messages in both English and Chinese

### Styling

- Uses Tailwind CSS with custom theme in `app/globals.css`
- Dark mode support via `next-themes`
- Gradient backgrounds and modern UI patterns (see `app/globals.css` for custom classes)
- Maintain responsive design (mobile-first approach)

### Environment Variables

Required for development:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DIFY_MAIN_API_KEY=your_dify_main_key
NEXT_PUBLIC_DIFY_SCENARIO_API_KEY=your_dify_scenario_key
NEXT_PUBLIC_DIFY_API_URL=your_dify_api_url
NEXT_PUBLIC_DIFY_USERID=your_dify_user_id
```

## Testing & Deployment

- ESLint configured but ignored during builds (`eslint: { ignoreDuringBuilds: true }`)
- Images are unoptimized for compatibility
- PWA support with install prompt modal
- Deployment optimized for Vercel
- Webpack externals configured for WebSocket libraries (utf-8-validate, bufferutil)
