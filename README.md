# Eloquent AI — Frontend

Modern React + TypeScript chat UI with dark mode, Markdown rendering, and simple authentication. Built with TailwindCSS and small reusable UI primitives.

## Quick start

1) Requirements
- Node.js 18+ and npm 9+
- A running backend API

2) Install
```bash
npm ci
```

3) Configure environment
- Create a `.env` in the project root and set your API base URL:
```bash
REACT_APP_API_BASE=http://localhost:5000
```
- The app derives endpoints from this base, e.g. `AUTH_API_BASE = ${REACT_APP_API_BASE}/api/auth`, `CHAT_API_BASE = ${REACT_APP_API_BASE}/api/chat` (see `src/config/env.ts`).

4) Start the dev server
```bash
npm start
```
- App: `http://localhost:3000`

5) Build for production
```bash
npm run build
```
- Output in `build/`

## Features
- Chat interface with conversation list, message history, and one-shot send
- Markdown rendering with GFM and syntax highlighting
- Light/dark theme with no flash on load
- Basic auth: login, signup, and guest mode
- Conversation actions: summarize, delete

## Theming (no flash dark mode)
- The theme is persisted in `localStorage` and applied pre-hydration.
- An inline script in `public/index.html` sets the `dark` class before first paint to prevent white flash.
- See `src/hooks/useTheme.ts` for the theme hook (uses `useLayoutEffect` to toggle classes before paint).

## Project structure
```
src/
  api/            # API clients (auth, chat)
  components/
    auth/         # Auth UI (forms)
    ui/           # UI primitives (Button, IconButton, Input, Textarea, Card, Loader)
  context/        # React contexts (auth)
  hooks/          # Custom hooks (theme, auth, localStorage)
  pages/          # Route-level pages (AuthPage)
  types/          # Shared TypeScript types
  utils/          # Utilities (cn, storage, time)
```

## Environment & API
- Configure `REACT_APP_API_BASE` to point at your backend (prefer HTTPS in production).
- Endpoints used by the app:
  - Auth: `/api/auth/signup`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout` (optional on backend)
  - Chat: `/api/chat/conversations`, `/api/chat/messages/:id`, `/api/chat/create`, `/api/chat/delete/:id`, `/api/chat/summarize/:id`
- If using cookie-based auth, ensure your backend CORS allows credentials and set cookies with `SameSite=None; Secure`.

## Scripts
```bash
npm start        # start dev server
npm run build    # production build
npm test         # test runner (CRA)
```

## Security notes
- Markdown: raw HTML is not rendered; links open with `rel="noopener noreferrer nofollow"`.
- Theme: class toggling before paint avoids visual flashes.
- CORS/cookies: if you rely on cookies, configure your backend accordingly.

## Troubleshooting
- API not reachable → set `REACT_APP_API_BASE` or start backend
- CORS errors → allow `http://localhost:3000` on the backend (and credentials if needed)
- Dev server port in use → `PORT=3001 npm start`
