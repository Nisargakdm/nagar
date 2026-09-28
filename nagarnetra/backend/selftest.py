"""Headless invariants: python selftest.py"""
import os, tempfile, random
os.environ["NN_DB"] = os.path.join(tempfile.mkdtemp(), "t.db"); os.environ["NN_USE_OSRM"] = "0"; random.seed(7)
from app import core
core.init(); import time
st = core.snapshot()["stats"]; assert st["verified"] > 0, "seed should give verified defects"
for i in range(4000):
    for b in core.BUSES: b.step(6, 9.0)
st = core.snapshot()["stats"]; print("stats", st)
assert st["events"] > 30 and st["bw_saved"] > 90
ev = dict(id="dup1", bus="B1", route="R101", cls="pothole", conf=.9, lat=core.HAZ[0]["lat"], lon=core.HAZ[0]["lon"], ts=time.time())
assert core.ingest(ev) and core.ingest(ev) is None, "ingest must be idempotent"
d = core.db.q("select * from defects where status='verified' and id not in (select defect_id from work_orders) order by priority desc")[0]
w = core.create_wo(d["id"]); assert w and core.create_wo(d["id"]) is None
core.set_wo(w, "Resolved"); assert core.db.q("select status from defects where id=?", (d["id"],))[0]["status"] == "resolved"
for i in range(9000):
    for b in core.BUSES: b.step(6, 9.0)
print("after repair:", core.db.q("select status from defects where id=?", (d["id"],))[0]["status"])
i = core.simulate_incident(); r = core.db.q("select * from incidents where id=?", (i,))[0]; print("incident", r["plate"], r["plate_conf"]); assert r["status"] == "pending_review"
assert core.snapshot()["buses"][0]["lat"] != 0; print("SELFTEST OK")
