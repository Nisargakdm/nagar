"""Heavy core: persistence, fleet-corroboration, explainable scoring, edge-node simulation
(offline store-and-forward), work-order closed loop, incident evidence, congestion/health analytics."""
import asyncio, json, math, os, random, sqlite3, threading, time, uuid
from collections import deque
from .config import *
from .geo import hav, load_routes, ROUTE_DEFS

SCHEMA = """
CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY,bus_id TEXT,route_id TEXT,seg_id TEXT,cls TEXT,confidence REAL,lat REAL,lon REAL,ts REAL,camera TEXT,defect_id TEXT);
CREATE TABLE IF NOT EXISTS defects(id TEXT PRIMARY KEY,cls TEXT,lat REAL,lon REAL,route_id TEXT,seg_id TEXT,label TEXT,status TEXT,confidence REAL,first_seen REAL,last_seen REAL,n_obs INTEGER,n_buses INTEGER,priority REAL,priority_json TEXT);
CREATE TABLE IF NOT EXISTS work_orders(id TEXT PRIMARY KEY,defect_id TEXT,status TEXT,assignee TEXT,created_at REAL,updated_at REAL);
CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY AUTOINCREMENT,ts REAL,actor TEXT,action TEXT,ref TEXT,detail TEXT);
CREATE TABLE IF NOT EXISTS incidents(id TEXT PRIMARY KEY,bus_id TEXT,ts REAL,lat REAL,lon REAL,status TEXT,plate TEXT,plate_conf REAL,frames_json TEXT,note TEXT);
CREATE TABLE IF NOT EXISTS clears(defect_id TEXT,bus_id TEXT,ts REAL);
CREATE INDEX IF NOT EXISTS ix_ev_def ON events(defect_id);
"""
class DB:
    def __init__(s, path):
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
        s.c = sqlite3.connect(path, check_same_thread=False); s.c.row_factory = sqlite3.Row
        s.lock = threading.RLock(); s.c.executescript(SCHEMA)
    def q(s, sql, a=()):
        with s.lock: return [dict(r) for r in s.c.execute(sql, a).fetchall()]
    def x(s, sql, a=()):
        with s.lock: s.c.execute(sql, a); s.c.commit()

db = None; ROUTES = {}; HAZ = []; ZONES = []; BUSES = []
ALERTS = deque(maxlen=25); TRAFFIC = {}; S = {"ver": 0, "t0": time.time()}
CLASS_BASE = {"pothole": 34, "waterlogging": 30, "broken_divider": 26, "crack": 20, "damaged_sign": 18, "missing_marking": 16}
NAMES = {"pothole": "Pothole", "waterlogging": "Waterlogging", "broken_divider": "Broken divider", "crack": "Road crack", "damaged_sign": "Damaged sign", "missing_marking": "Faded zebra crossing"}
def bump(): S["ver"] += 1
def audit(actor, action, ref, detail=""): db.x("insert into audit(ts,actor,action,ref,detail) values(?,?,?,?,?)", (time.time(), actor, action, ref, detail))
def alert(kind, msg, sev, lat=None, lon=None, bus=None):
    ALERTS.appendleft(dict(id=uuid.uuid4().hex[:6], ts=time.time(), kind=kind, msg=msg, sev=sev, lat=lat, lon=lon, bus=bus))
def near_zone(lat, lon): return any(hav((lat, lon), (z["lat"], z["lon"])) <= 150 for z in ZONES)
def label_at(rid, s):
    return min(ROUTES[rid]["stops_s"], key=lambda t: abs(t[1] - s))[0]

def score(d):  # explainable priority: every component is returned, not just the total
    days = (time.time() - d["first_seen"]) / 86400
    comp = [("severity", "Hazard class risk", CLASS_BASE[d["cls"]]),
            ("confidence", "Fused detection confidence", round(d["confidence"] * 20, 1)),
            ("recurrence", "Repeat observations", min(d["n_obs"], 12) * 1.5),
            ("buses", "Independent buses agreeing", min(d["n_buses"], 4) * 3),
            ("vulnerable", "Near school / hospital zone", 12 if near_zone(d["lat"], d["lon"]) else 0),
            ("age", "Days unresolved", round(min(days, 14) * 0.8, 1))]
    return min(100, round(sum(c[2] for c in comp), 1)), [dict(key=k, label=l, value=v) for k, l, v in comp]

def seg_of(ev):  # map-matching: snap GPS to the nearest route segment
    best = None
    for rid, r in ROUTES.items():
        if ev.get("route") in ROUTES and rid != ev["route"]: continue
        s, dm = r["poly"].project((ev["lat"], ev["lon"]))
        if best is None or dm < best[2]: best = (rid, s, dm)
    return best[0], f"{best[0]}-S{int(best[1] // SEG):02d}", best[1]

def recompute(did):
    d = db.q("select * from defects where id=?", (did,))[0]
    per = db.q("select bus_id,max(confidence) c,count(*) n from events where defect_id=? group by bus_id", (did,))
    d["confidence"] = round(1 - math.prod(1 - 0.9 * p["c"] for p in per), 3)  # noisy-OR across independent buses
    d["n_buses"] = len(per); d["n_obs"] = sum(p["n"] for p in per)
    if d["status"] == "new" and d["n_buses"] >= MIN_BUSES:
        d["status"] = "verified"; audit("system", "verified", did, f"{d['n_buses']} independent buses agree"); bump()
        alert("defect", f"New verified defect: {NAMES[d['cls']]} near {d['label']}", "high", d["lat"], d["lon"])
    d["priority"], comp = score(d)
    db.x("update defects set status=?,confidence=?,n_buses=?,n_obs=?,priority=?,priority_json=? where id=?",
         (d["status"], d["confidence"], d["n_buses"], d["n_obs"], d["priority"], json.dumps(comp), did))

def ingest(ev):  # idempotent: safe to retry after a network drop
    with db.lock:
        if db.q("select 1 x from events where id=?", (ev["id"],)): return None
        rid, seg, s = seg_of(ev); best = None
        for c in db.q("select * from defects where cls=? and status!='closed'", (ev["cls"],)):
            dd = hav((c["lat"], c["lon"]), (ev["lat"], ev["lon"]))
            if dd <= RADIUS and (best is None or dd < best[0]): best = (dd, c)
        if best:
            c = best[1]; did = c["id"]; n = max(c["n_obs"], 1)
            db.x("update defects set lat=?,lon=?,last_seen=? where id=?", ((c["lat"] * n + ev["lat"]) / (n + 1), (c["lon"] * n + ev["lon"]) / (n + 1), ev["ts"], did))
            if c["status"] == "resolved":
                db.x("update defects set status='verified' where id=?", (did,)); audit("system", "regression", did, "seen again after repair"); bump()
                alert("defect", f"Repair failed / regressed: {NAMES[c['cls']]} near {c['label']}", "high", c["lat"], c["lon"])
        else:
            did = uuid.uuid4().hex[:8]
            db.x("insert into defects values(?,?,?,?,?,?,?,?,?,?,?,0,0,0,'[]')", (did, ev["cls"], ev["lat"], ev["lon"], rid, seg, label_at(rid, s), "new", ev["conf"], ev["ts"], ev["ts"]))
        db.x("insert into events values(?,?,?,?,?,?,?,?,?,?,?)", (ev["id"], ev["bus"], rid, seg, ev["cls"], ev["conf"], ev["lat"], ev["lon"], ev["ts"], ev.get("camera", "front"), did))
        recompute(did); bump(); return did

def ingest_batch(evs): return sum(1 for e in evs if ingest(e))

def create_wo(did, assignee="Road Dept. Ward Office"):
    with db.lock:
        if db.q("select 1 x from work_orders where defect_id=? and status!='Resolved'", (did,)): return None
        wid = uuid.uuid4().hex[:6]; now = time.time()
        db.x("insert into work_orders values(?,?,?,?,?,?)", (wid, did, "New", assignee, now, now)); audit("operator", "work_order_created", wid, did); bump(); return wid

def set_wo(wid, status):
    with db.lock:
        w = db.q("select * from work_orders where id=?", (wid,))
        if not w: return False
        db.x("update work_orders set status=?,updated_at=? where id=?", (status, time.time(), wid)); audit("operator", f"work_order_{status}", wid, w[0]["defect_id"])
        if status == "Resolved":
            db.x("update defects set status='resolved' where id=?", (w[0]["defect_id"],))
            d = db.q("select * from defects where id=?", (w[0]["defect_id"],))[0]
            for h in HAZ:  # the crew "fixes" the real hazard; buses must now prove it is gone
                if hav((h["lat"], h["lon"]), (d["lat"], d["lon"])) <= 45: h["repaired"] = True
        bump(); return True

def clear_pass(h, bus):  # a bus drove past a repaired spot and saw nothing -> re-verification
    with db.lock:
        for d in db.q("select * from defects where status='resolved'"):
            if hav((d["lat"], d["lon"]), (h["lat"], h["lon"])) <= RADIUS + 15:
                db.x("insert into clears values(?,?,?)", (d["id"], bus, time.time()))
                if len(db.q("select distinct bus_id from clears where defect_id=?", (d["id"],))) >= MIN_BUSES:
                    db.x("update defects set status='closed' where id=?", (d["id"],)); audit("system", "re_verified_closed", d["id"], "2 buses passed, nothing detected"); bump()
                    alert("defect", f"Repair verified by fleet: {NAMES[d['cls']]} near {d['label']}", "info", d["lat"], d["lon"])

def congestion(rid, f, hour):
    peak = math.exp(-((hour - 9.0) / 1.6) ** 2) * 0.7 + math.exp(-((hour - 18.0) / 1.6) ** 2) * 0.6 + 0.15
    hot = max(math.exp(-((f - h) / 0.07) ** 2) for h in ROUTES[rid]["hot"])
    return max(0.05, min(0.95, peak * (0.35 + 0.65 * hot)))

class Edge:  # one bus = one edge node with a local buffer (store-and-forward)
    def __init__(s, bid, rid, s0, base, d=1):
        s.id, s.rid, s.s, s.base, s.dir = bid, rid, s0, base, d
        s.buf, s.forced_off, s.online, s.speed = [], False, True, base
        s.bytes, s.raw, s.sent, s.lat, s.lon = 0, 0, 0, 0, 0; s.laps, s.lap_t = 0, time.time()
    def step(s, dt, hour):
        r = ROUTES[s.rid]; L = r["poly"].length; f = s.s / L; lvl = congestion(s.rid, f, hour)
        s.speed = s.base * (1 - 0.7 * lvl); ds = s.speed * dt * s.dir; prev = s.s; new = prev + ds
        lo, hi = min(prev, new), max(prev, new)
        for h in HAZ:
            hs = h["on"].get(s.rid)
            if hs is None: continue
            if any(lo < hs + k * L <= hi for k in ((0, 1) if r["loop"] else (0,))): s.pass_hazard(h)
        for z in ZONES:
            zs = z["on"].get(s.rid)
            if zs is not None and lo <= zs <= hi and random.random() < 0.4:
                s.alert_now("children", f"Children crossing detected near {z['name']}", "critical", z)
        if r["loop"]: new %= L
        elif new >= L: new, s.dir = 2 * L - new, -1
        elif new <= 0: new, s.dir = -new, 1
        s.s = new; p = r["poly"].at(new); s.lat, s.lon = p[0] + random.gauss(0, 3e-5), p[1] + random.gauss(0, 3e-5)
        if random.random() < 0.5:
            seg = f"{s.rid}-S{int(new // SEG):02d}"; TRAFFIC.setdefault(seg, deque(maxlen=24)).append((max(2, int(lvl * 60 + random.gauss(0, 4))), s.speed * 3.6))
        if random.random() < 0.0015: s.emit(random.choice(list(CLASS_BASE)), random.uniform(0.45, 0.66), s.lat, s.lon)  # false positive noise
        s.raw += 1_000_000 * dt; dead = r["dead"]; s.online = not s.forced_off and not (dead[0] < new / L < dead[1])
        if s.online and s.buf:
            batch, s.buf = s.buf, []; ingest_batch(batch); s.sent += len(batch); s.bytes += len(batch) * 240_000
    def pass_hazard(s, h):
        if h["repaired"]:
            if random.random() < 0.9: clear_pass(h, s.id)
        elif random.random() < 0.82:
            j = lambda: random.gauss(0, 6) / 111320
            s.emit(h["cls"], min(0.98, max(0.5, random.gauss(0.8, 0.09))), h["lat"] + j(), h["lon"] + j())
    def emit(s, cls, conf, lat, lon):
        s.buf.append(dict(id=uuid.uuid4().hex[:10], bus=s.id, route=s.rid, cls=cls, conf=round(conf, 2), lat=lat, lon=lon, ts=time.time(), camera=random.choice(["front", "left", "rear"])))
    def alert_now(s, kind, msg, sev, z): alert(kind, msg, sev, z["lat"], z["lon"], s.id)  # safety alerts skip the queue

def init():
    global db
    db = DB(DB_PATH); ROUTES.update(load_routes())
    spec = [("pothole","R101",.13),("waterlogging","R101",.33),("damaged_sign","R101",.47),("missing_marking","R101",.70),("crack","R101",.86),
            ("pothole","R202",.22),("broken_divider","R202",.46),("waterlogging","R202",.66),("damaged_sign","R202",.90)]
    for cls, rid, f in spec:
        p = ROUTES[rid]["poly"].at(ROUTES[rid]["poly"].length * f)
        h = dict(id=f"H{len(HAZ)+1}", cls=cls, lat=p[0], lon=p[1], repaired=False, on={})
        for r2, R in ROUTES.items():
            s, dm = R["poly"].project(p)
            if dm <= 25: h["on"][r2] = s
        HAZ.append(h)
    for name, rid, f in [("Deccan school zone", "R101", .22), ("Sassoon hospital zone", "R202", .97)]:
        p = ROUTES[rid]["poly"].at(ROUTES[rid]["poly"].length * f); z = dict(name=name, lat=p[0], lon=p[1], on={})
        for r2, R in ROUTES.items():
            s, dm = R["poly"].project(p)
            if dm <= 60: z["on"][r2] = s
        ZONES.append(z)
    BUSES.extend([Edge("B1","R101",0,8.0), Edge("B2","R101",ROUTES["R101"]["poly"].length*.35,7.2), Edge("B3","R101",ROUTES["R101"]["poly"].length*.7,8.6),
                  Edge("B4","R202",0,7.6), Edge("B5","R202",ROUTES["R202"]["poly"].length*.5,8.2,-1)])
    if not db.q("select 1 x from defects limit 1"): seed()

def seed():  # believable history so the dashboard is never empty on first open
    now = time.time(); ids = [b.id for b in BUSES]
    for h in HAZ:
        for bus in random.sample(ids, random.choice([0, 2, 2, 3, 3])):
            ingest(dict(id=uuid.uuid4().hex[:10], bus=bus, route=list(h["on"])[0], cls=h["cls"], conf=round(random.uniform(.65, .93), 2),
                        lat=h["lat"] + random.gauss(0, 5) / 111320, lon=h["lon"] + random.gauss(0, 5) / 111320, ts=now - random.uniform(3600, 6 * 86400)))
    v = [d["id"] for d in db.q("select id from defects where status='verified' order by priority desc")]
    for i, did in enumerate(v[:2]):
        w = create_wo(did)
        if i == 1: set_wo(w, "Assigned")

def make_plate():
    L = "ABCDEFGHJKLMNPRSTUVWXYZ"; return f"MH12{random.choice(L)}{random.choice(L)}{random.randint(1000, 9999)}"
def simulate_incident(kind="hit_and_run"):
    b = random.choice(BUSES); truth = make_plate(); frames = []
    for i in range(6):  # multi-frame OCR: each frame may misread characters
        txt = "".join(c if random.random() > 0.12 else random.choice("0123456789ABCDEFGHJKLMNPRSTUVWXYZ") for c in truth)
        frames.append(dict(frame=i + 1, text=txt, conf=round(random.uniform(.55, .96), 2)))
    cons = "".join(max(set(col := [f["text"][i] for f in frames]), key=col.count) for i in range(len(truth)))
    agree = sum(f["text"][i] == cons[i] for f in frames for i in range(len(cons))) / (len(frames) * len(cons))
    conf = round(agree * sum(f["conf"] for f in frames) / len(frames), 2); iid = uuid.uuid4().hex[:6]
    db.x("insert into incidents values(?,?,?,?,?,?,?,?,?,'')", (iid, b.id, time.time(), b.lat, b.lon, "pending_review", cons, conf, json.dumps(frames)))
    alert("incident", f"{kind.replace('_',' ').title()} candidate from bus {b.id} - evidence packaged for human review", "critical", b.lat, b.lon, b.id); bump(); return iid

def segments():
    out = []
    for rid, r in ROUTES.items():
        L = r["poly"].length
        for i in range(math.ceil(L / SEG)):
            sid = f"{rid}-S{i:02d}"; obs = TRAFFIC.get(sid)
            pen = sum(d["priority"] * 0.9 for d in db.q("select priority from defects where seg_id=? and status='verified'", (sid,)))
            cong = round(100 * (1 - (sum(o[1] for o in obs) / len(obs)) / 35), 0) if obs else None
            out.append(dict(id=sid, route=rid, color=r["color"], health=round(max(0, 100 - pen)), congestion=max(0, cong) if cong is not None else None,
                            vehicles=round(sum(o[0] for o in obs) / len(obs)) if obs else None, coords=r["poly"].slice(i * SEG, min(L, (i + 1) * SEG))))
    return out

def snapshot():
    hour = 8.5 + (time.time() - S["t0"]) * SCALE / 3600; sg = segments()
    raw = sum(b.raw for b in BUSES) or 1; sent = sum(b.bytes for b in BUSES)
    ev = db.q("select e.*,d.status ds from events e left join defects d on d.id=e.defect_id order by e.ts desc limit 8")
    return dict(version=S["ver"], sim_time=f"{int(hour) % 24:02d}:{int((hour % 1) * 60):02d}", alerts=list(ALERTS)[:8], recent=ev,
        zones=[dict(name=z["name"], lat=z["lat"], lon=z["lon"]) for z in ZONES],
        buses=[dict(id=b.id, route=b.rid, lat=b.lat, lon=b.lon, speed=round(b.speed * 3.6), online=b.online, forced_off=b.forced_off, buffered=len(b.buf), synced=b.sent, mb_sent=round(b.bytes / 1e6, 1)) for b in BUSES],
        stats=dict(buses=len(BUSES), events=db.q("select count(*) n from events")[0]["n"], verified=db.q("select count(*) n from defects where status='verified'")[0]["n"],
                   filtered=db.q("select count(*) n from defects where status='new'")[0]["n"], open_wo=db.q("select count(*) n from work_orders where status!='Resolved'")[0]["n"],
                   health=round(sum(s["health"] for s in sg) / len(sg)), bw_saved=round(100 * (1 - sent / raw), 2),
                   closed=db.q("select count(*) n from defects where status='closed'")[0]["n"]),
        routes=[dict(id=r["id"], name=r["name"], color=r["color"], source=r["source"]) for r in ROUTES.values()])

async def run():
    while True:
        await asyncio.sleep(TICK); hour = 8.5 + (time.time() - S["t0"]) * SCALE / 3600
        for b in BUSES:
            try: b.step(TICK * SCALE, hour)
            except Exception as e: print("[sim]", b.id, e)
