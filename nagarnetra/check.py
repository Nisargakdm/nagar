"""python check.py — fails if the app regressed (keyed map tiles, front/back route mismatch, missing UI build)."""
import glob, os, re, sys
h = os.path.dirname(os.path.abspath(__file__)); err = []
src = "".join(open(f, encoding="utf-8").read() for f in glob.glob(h + "/frontend/src/*"))
built = "".join(open(f, encoding="utf-8", errors="ignore").read() for f in glob.glob(h + "/backend/static/**/*.*", recursive=True))
be = open(h + "/backend/app/main.py", encoding="utf-8").read()
if not built: err.append("backend/static is empty — the UI must be built (cd frontend && npm run build).")
for bad in ("cartocdn", "mapbox.com", "maptiler", "stadiamaps"):
    if bad in (src + built).lower(): err.append(f"keyed tile provider found: {bad} — use tile.openstreetmap.org only")
if built and "tile.openstreetmap.org" not in built: err.append("OpenStreetMap tile URL missing from the built UI")
n = lambda p: re.sub(r"\$\{[^}]*\}|\{[^}]*\}", "{}", p.split("?")[0]).rstrip("/")
routes = {n(m) for m in re.findall(r'@app\.(?:get|post|patch|put|delete)\("([^"]+)"', be)}
calls = {n(m) for m in re.findall(r"""['"`](/api/[A-Za-z0-9_/${}.\-]*)""", src)}
for c in sorted(calls):
    if c not in routes: err.append(f"UI calls {c} but backend has no such route")
print("CHECK FAILED:\n - " + "\n - ".join(err) if err else f"CHECK OK ({len(calls)} UI calls match backend routes; tiles = OpenStreetMap; UI built)")
sys.exit(1 if err else 0)
