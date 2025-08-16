# Eloquent Frontend — Local Development

Run the React app locally in a few steps. This project uses React + TypeScript, TailwindCSS, and a small set of reusable UI primitives for consistency and code quality.

## Requirements
- Node.js 18+ (recommended) and npm 9+
- Backend API available (default: `http://localhost:8000`)

## Install
```bash
npm ci
```

## Start (development)
```bash
npm start
```
- App: `http://localhost:3000`
- Hot reload enabled

## Build (production)
```bash
npm run build
```
- Output written to `build/`

## Environment / API configuration
Endpoints are derived from a single base URL. By default the app targets `http://localhost:8000`.

- Configure via `.env` (create at the project root):
```bash
REACT_APP_API_BASE=http://localhost:8000
```
- See `src/config/env.ts` for how URLs are formed:
  - `CHAT_API_BASE = ${REACT_APP_API_BASE}/api/chat`
  - `AUTH_API_BASE = ${REACT_APP_API_BASE}/api/auth`

## Project structure (high-level)
```
src/
  api/            # Typed API clients
  components/
    ui/           # Reusable UI primitives (Button, IconButton, Input, Textarea, Card, Loader)
    auth/         # Auth-specific components
  context/        # React context (auth)
  hooks/          # Reusable hooks
  pages/          # Route-level components
  types/          # Shared TypeScript types
  utils/          # Utilities (storage, time, cn)
```

## Reusable UI primitives
- `Button`: variants `primary | ghost | destructive | neutral`, sizes `sm | md | lg | icon`.
- `IconButton`: compact button for icons/actions.
- `Input`, `Textarea`: consistent form fields.
- `Card`: surface container with theming-aware styles.
- `Loader`: spinner + optional label.

Examples:
```tsx
import { Button } from './src/components/ui/Button';
import { Input } from './src/components/ui/Input';

<Button variant="primary" size="md">Save</Button>
<Input type="email" placeholder="you@example.com" />
```

## Code quality guidelines
- TypeScript-first: explicit prop types and return types for exported components.
- Naming: prefer descriptive, intention-revealing names (e.g., `currentConversationId`, `conversationSummaries`).
- UI consistency: use primitives from `components/ui` instead of ad-hoc buttons/inputs.
- Hooks: follow the Rules of Hooks; keep effects minimal and list all dependencies.
- Accessibility: label icon buttons (`title`/`aria-label`), ensure anchors have accessible content.
- Theming: use `useTheme` and conditional classes via `utils/cn` for light/dark variations.
- Error handling: surface user-friendly messages; avoid swallowing errors silently.

## Scripts
```bash
npm start   # dev server
npm run build   # production build
npm test   # CRA test runner
```

## Troubleshooting
- Backend not running → login/chat will fail. Start your API and/or set `REACT_APP_API_BASE`.
- CORS errors → enable CORS in your backend for `http://localhost:3000`.
- Port in use → `PORT=3001 npm start`.
