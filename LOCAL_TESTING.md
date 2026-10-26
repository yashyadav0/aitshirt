# Run locally with no login and no MongoDB

Needs Node 18+ and internet on first run (downloads a MongoDB binary once, ~100MB).

1. Put your Gemini key in `backend/.env` (GEMINI_API_KEY=...).
2. Terminal 1:  cd backend  && npm install && node server.js
3. Terminal 2:  cd frontend && npm install && npm run dev
4. Open the printed URL (http://localhost:5173/workspace). You are logged in automatically as a dev admin.

How it works (all disabled in production):
- backend  USE_MEMORY_DB=true -> throwaway in-memory MongoDB (data resets on restart)
- backend  DEV_LOGIN=true     -> POST /api/auth/dev-login returns a token for a dev admin with 999 prompts
- frontend VITE_DEV_AUTOLOGIN=true (frontend/.env.local, `npm run dev` only) -> calls dev-login automatically

To go back to normal: delete frontend/.env.local and remove DEV_LOGIN / USE_MEMORY_DB from backend/.env.
