import bisect, json, math, os, urllib.request
from .config import *
R = 6371000.0
def hav(a, b):
    p1, p2 = math.radians(a[0]), math.radians(b[0]); dl = math.radians(b[1] - a[1])
    h = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))

class Poly:
    def __init__(s, pts):
        s.pts = pts; s.cum = [0.0]
        for i in range(1, len(pts)): s.cum.append(s.cum[-1] + hav(pts[i - 1], pts[i]))
        s.length = s.cum[-1]
    def at(s, d):
        d = max(0.0, min(d, s.length)); i = min(bisect.bisect_right(s.cum, d) - 1, len(s.pts) - 2)
        f = (d - s.cum[i]) / ((s.cum[i + 1] - s.cum[i]) or 1e-9); a, b = s.pts[i], s.pts[i + 1]
        return (a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f)
    def project(s, p):  # map-matching: nearest point on the polyline -> (metres along, metres away)
        best = (0.0, 1e18); k = math.cos(math.radians(p[0]))
        for i in range(len(s.pts) - 1):
            a, b = s.pts[i], s.pts[i + 1]
            bx, by = (b[1] - a[1]) * k, b[0] - a[0]; px, py = (p[1] - a[1]) * k, p[0] - a[0]
            t = max(0, min(1, (px * bx + py * by) / (bx * bx + by * by or 1e-18)))
            dist = math.hypot(px - t * bx, py - t * by) * 111320
            if dist < best[1]: best = (s.cum[i] + t * (s.cum[i + 1] - s.cum[i]), dist)
        return best
    def slice(s, d0, d1):
        i, j = bisect.bisect_right(s.cum, d0), bisect.bisect_left(s.cum, d1)
        return [s.at(d0)] + s.pts[i:j] + [s.at(d1)]

ROUTE_DEFS = [
 dict(id="R101", name="Shivajinagar – Swargate – Pune Stn", color="#5b8ef2", loop=True, dead=(0.55, 0.62), hot=[0.2, 0.6],
  stops=[("Shivajinagar",18.5308,73.8475),("Deccan Gymkhana",18.5166,73.8410),("Shaniwar Wada",18.5195,73.8553),("Swargate",18.5018,73.8636),("Pune Station",18.5289,73.8744),("Shivajinagar",18.5308,73.8475)]),
 dict(id="R202", name="Kothrud – Deccan – Pune Stn", color="#3ee6c4", loop=False, dead=(0.30, 0.38), hot=[0.5, 0.8],
  stops=[("Kothrud Depot",18.5074,73.8077),("Nal Stop",18.5019,73.8300),("Deccan Gymkhana",18.5166,73.8410),("Shaniwar Wada",18.5195,73.8553),("Pune Station",18.5289,73.8744)]),
]

def parse_osrm(d):  # OSRM geojson -> [(lat,lon)] thinned to >=5 m spacing
    out = []
    for lo, la in d["routes"][0]["geometry"]["coordinates"]:
        if not out or hav(out[-1], (la, lo)) >= 5: out.append((la, lo))
    return out

def load_routes():
    os.makedirs(os.path.join(BASE, "..", "data"), exist_ok=True); routes = {}
    for rd in ROUTE_DEFS:
        wps = [(la, lo) for _, la, lo in rd["stops"]]; pts, src = wps, "waypoints"
        cache = os.path.join(BASE, "..", "data", f"route_{rd['id']}.json")
        try:
            if os.path.exists(cache): pts, src = [tuple(p) for p in json.load(open(cache))], "osrm-cached"
            elif USE_OSRM:
                c = ";".join(f"{lo},{la}" for la, lo in wps)
                d = json.load(urllib.request.urlopen(f"{OSRM}/route/v1/driving/{c}?overview=full&geometries=geojson", timeout=8))
                pts, src = parse_osrm(d), "osrm"; json.dump(pts, open(cache, "w"))
        except Exception as e:
            print(f"[routes] OSRM unavailable for {rd['id']} ({type(e).__name__}); using straight waypoints")
        poly = Poly(pts)
        stops = [(n, poly.project((la, lo))[0]) for n, la, lo in rd["stops"]]
        routes[rd["id"]] = dict(rd, poly=poly, source=src, stops_s=stops)
    return routes
