# NagarNetra — rules for any AI agent (Antigravity, etc.)
This project WORKS. Extend it with small, targeted edits. Never regenerate files wholesale.
1. Map tiles: only `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` via `frontend/src/config.js`. No API-keyed providers.
2. Every `/api/...` path the UI calls must exist in `backend/app/main.py`. Change both sides together.
3. The backend serves the built UI from `backend/static`. After editing `frontend/src`, run `cd frontend && npm install && npm run build`.
4. Keep the single-server model: one process on port 8000. No second dev server.
5. Do not remove: idempotent `ingest`, the >=2 independent buses verification rule, explainable `score()` components, human-review-only incidents.
Before saying "done": `python check.py` (must print CHECK OK) and `python backend/selftest.py` (must print SELFTEST OK), then open http://localhost:8000 and confirm map tiles, live buses, non-zero KPIs. Then `git commit`.
