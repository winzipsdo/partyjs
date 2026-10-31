# AGENTS.md - PartyJS Project Guide

This document provides comprehensive guidance for AI coding agents working on the PartyJS project.

## Project Overview

PartyJS is a collection of party games built with React + TypeScript + Vite. It's designed as a single-page application (SPA) with multiple mini-games accessible through a unified interface.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS + CSS Modules
- **UI Components**: Shadcn UI (Radix UI primitives)
- **Routing**: TanStack Router (file-based routing)
- **State Management**: Zustand + ahooks (useLocalStorageState)
- **Tables**: TanStack Table
- **Graphics**: PixiJS (for advanced game rendering)
- **Package Manager**: pnpm

## Project Structure

```
partyjs/
├── public/              # Static assets
│   └── partyjs.svg      # Logo
├── src/
│   ├── assets/          # Images and icons
│   ├── components/      # Reusable components
│   │   ├── Dice/        # Dice component with animations
│   │   ├── PlayingCard/ # Playing card component
│   │   └── ui/          # Shadcn UI components
│   ├── constants/       # App constants
│   │   └── storage.ts   # LocalStorage key helpers
│   ├── lib/             # Utility functions
│   │   └── utils.ts     # cn() for class merging
│   ├── pages/           # Game page implementations
│   │   ├── home/        # Home page with logo
│   │   ├── dice-roll/   # Dice rolling game
│   │   ├── russian-roulette/  # Russian roulette game
│   │   ├── liar-card/   # Liar card drawing game
│   │   ├── crocodile-dentist/ # Crocodile dentist game
│   │   ├── color-memory-quest/ # Color memory matching game
│   │   ├── gomoku/      # Local 2-player Gomoku (Five in a Row)
│   │   ├── othello/     # Local 2-player Othello (Reversi)
│   │   └── kegel-trainer/ # Daily pelvic floor (Kegel) follow-along trainer
│   ├── routes/          # TanStack Router route definitions
│   │   ├── __root.tsx   # Root layout with navigation
│   │   └── [game]/      # Each game has its own route folder
│   ├── main.tsx         # App entry point
│   ├── index.css        # Global styles
│   └── routeTree.gen.ts # Auto-generated route tree
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── eslint.config.js
```

## Key Conventions

### File Naming

- React components use PascalCase: `PlayingCard/index.tsx`
- CSS Modules use: `styles.module.css`
- Route files follow TanStack Router conventions: `index.lazy.tsx` for lazy-loaded routes

### Path Aliases

Use `@/` prefix for imports from `src/`:

```typescript
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createStorageKey } from '@/constants/storage';
```

### Component Structure

Each game/page typically has:
- `index.tsx` - Main component logic
- `styles.module.css` - Component-specific styles (optional)
- `components/` - Sub-components (if needed)

### State Persistence

Use `useLocalStorageState` from `ahooks` with `createStorageKey()`:

```typescript
import { useLocalStorageState } from 'ahooks';
import { createStorageKey } from '@/constants/storage';

const [value, setValue] = useLocalStorageState(
  createStorageKey('game-name-key'),
  { defaultValue: initialValue }
);
```

### Styling Approach

1. **Tailwind CSS** for utility-first styling
2. **CSS Modules** for complex animations and game-specific styles
3. **Shadcn UI** for common UI components (buttons, dialogs, tables)
4. Use `cn()` utility to merge Tailwind classes conditionally

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  'base-classes',
  condition && 'conditional-classes'
)} />
```

## Routing System

Routes are defined in `src/routes/` using TanStack Router file-based routing:

- `__root.tsx` - Root layout with command palette navigation
- `home/index.lazy.tsx` - Lazy-loaded home route
- `dice-roll/index.lazy.tsx` - Lazy-loaded game routes
- Route tree is auto-generated in `routeTree.gen.ts`

The router uses hash history (`createHashHistory()`) for GitHub Pages compatibility.

### Adding a New Game Route

1. Create page in `src/pages/[game-name]/index.tsx`
2. Create route in `src/routes/[game-name]/index.lazy.tsx`:

```typescript
import { createLazyFileRoute } from '@tanstack/react-router';
import { GameNamePage } from '@/pages/game-name';

export const Route = createLazyFileRoute('/game-name/')({
  component: GameNamePage,
});
```

3. Add to navigation in `src/routes/__root.tsx`:

```typescript
const gameRoutes = [
  // ... existing games
  { label: '🎮 Game Name', path: '/game-name' },
];
```

## UI Components

Shadcn UI components are in `src/components/ui/`:

- `button.tsx` - Button with variants
- `command.tsx` - Command palette (cmdk)
- `dialog.tsx` - Modal dialogs
- `popover.tsx` - Popovers
- `table.tsx` - Table components

Custom game components:

- `Dice/` - Animated dice with dot patterns
- `PlayingCard/` - Standard playing card display

## Build & Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production (outputs to /docs for GitHub Pages)
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint
```

## Deployment

- Build output: `docs/` folder
- Base URL: `/partyjs/` (configured in vite.config.ts)
- Hosting: GitHub Pages

## Code Style Guidelines

1. **TypeScript**: Strict typing, define interfaces for game state
2. **React**: Functional components with hooks
3. **Exports**: Named exports for components (not default)
4. **Comments**: Code comments in Chinese are acceptable
5. **Animations**: Prefer CSS animations, use CSS Modules for complex ones

## Common Patterns

### Game State Management

```typescript
interface GameState {
  isPlaying: boolean;
  currentPlayer: number;
  // ... game-specific state
}

const [gameState, setGameState] = useState<GameState>(initialState);
// or with persistence:
const [gameState, setGameState] = useLocalStorageState<GameState>(
  createStorageKey('game-state'),
  { defaultValue: initialState }
);
```

### Animation Pattern

```typescript
const [isAnimating, setIsAnimating] = useState(false);

const handleAction = () => {
  setIsAnimating(true);
  setTimeout(() => {
    // Update state
    setIsAnimating(false);
  }, animationDuration);
};
```

### Responsive Design

Use Tailwind's responsive prefixes:

```typescript
<div className="text-sm sm:text-base md:text-lg">
<div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4">
```

## Testing

Currently no test framework configured. When adding tests:
- Recommended: Vitest + React Testing Library
- Focus on game logic testing

## Notes for AI Agents

1. This project was primarily developed using Cursor AI
2. Keep games simple and fun - they're meant for party entertainment
3. Games should work well on both desktop and mobile
4. Prioritize smooth animations and responsive UI
5. Use localStorage for game state persistence when appropriate
6. Follow existing patterns when adding new games
