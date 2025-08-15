# Eloquent Frontend — Local Development

Run the React app locally in a few steps.

## Requirements
- Node.js 18+ (recommended) and npm 9+
- The backend API available at `http://localhost:8000` (see API section)

## Install
```bash
npm ci
```

## Start (development)
```bash
npm start
```
- App will be available at `http://localhost:3000`.
- Hot reload is enabled.

## Build (production)
```bash
npm run build
```
- Output is written to the `build/` directory.

## API configuration
This app calls a backend at `http://localhost:8000` by default.
- Chat endpoints: `src/api/chatApi.ts` (`API_BASE = 'http://localhost:8000/api/chat'`)
- Auth endpoints: `src/api/authApi.ts` (`API_BASE = 'http://localhost:8000/api/auth'`)

If your backend runs elsewhere, update these `API_BASE` constants accordingly.

## Project structure (high-level)
```
src/
  api/            # typed API clients
  components/     # UI components
  context/        # React context (auth, etc.)
  hooks/          # reusable hooks
  pages/          # route-level components
  types/          # shared TypeScript types
  utils/          # utilities (storage, time)
```

## Troubleshooting
- Backend not running on port 8000 → login/chat will fail. Start your API or change `API_BASE`.
- CORS errors → enable CORS in your backend for `http://localhost:3000`.
- Port already in use → set `PORT=3001 npm start` to use another port.
