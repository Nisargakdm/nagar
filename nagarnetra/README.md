# NagarNetra — buses as mobile urban sensors (React + FastAPI + SQLite)
Run: `python run.py` (Windows: double-click `run.bat`) -> open http://localhost:8000. No Node, Docker or API keys needed.
Data persists in `backend/data/nagarnetra.db` (delete it to reset). Routes are snapped to real roads via the free public OSRM server on first run (cached); offline it falls back to straight waypoints.
Real edge devices can POST batches to `/api/edge/ingest` (idempotent). API docs: http://localhost:8000/docs
Edit UI: `cd frontend && npm install && npm run build`. Guards: `python check.py`, `python backend/selftest.py`.
