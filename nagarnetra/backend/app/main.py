import asyncio, os
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from . import core
from .config import BASE

@asynccontextmanager
async def lifespan(app):
    core.init(); t = asyncio.create_task(core.run()); yield; t.cancel()

app = FastAPI(title="NagarNetra API", lifespan=lifespan)

@app.get("/api/snapshot")
def snapshot(): return core.snapshot()

@app.get("/api/segments")
def segments(): return core.segments()

@app.get("/api/defects")
def defects(status: Optional[str] = None):
    rows = core.db.q("select * from defects" + (" where status=?" if status else "") + " order by priority desc", (status,) if status else ())
    return [dict(r, name=core.NAMES[r["cls"]]) for r in rows]

@app.get("/api/defects/{did}")
def defect(did: str):
    r = core.db.q("select * from defects where id=?", (did,))
    if not r: raise HTTPException(404, "defect not found")
    import json
    d = r[0]; d["name"] = core.NAMES[d["cls"]]; d["components"] = json.loads(d.pop("priority_json"))
    d["events"] = core.db.q("select id,bus_id,confidence,ts,camera from events where defect_id=? order by ts desc limit 20", (did,))
    d["audit"] = core.db.q("select ts,actor,action,detail from audit where ref=? order by ts desc", (did,))
    d["work_order"] = (core.db.q("select * from work_orders where defect_id=? order by created_at desc limit 1", (did,)) or [None])[0]
    return d

@app.get("/api/workorders")
def workorders():
    return core.db.q("select w.*,d.cls,d.label,d.priority from work_orders w join defects d on d.id=w.defect_id order by w.updated_at desc")

class WOIn(BaseModel): defect_id: str
class WOPatch(BaseModel): status: str

@app.post("/api/workorders")
def wo_create(b: WOIn):
    if not core.db.q("select 1 x from defects where id=?", (b.defect_id,)): raise HTTPException(404, "defect not found")
    w = core.create_wo(b.defect_id)
    if not w: raise HTTPException(409, "open work order already exists")
    return {"id": w}

@app.patch("/api/workorders/{wid}")
def wo_patch(wid: str, b: WOPatch):
    if b.status not in ("New", "Assigned", "InProgress", "Resolved"): raise HTTPException(400, "bad status")
    if not core.set_wo(wid, b.status): raise HTTPException(404, "work order not found")
    return {"ok": True}

@app.get("/api/incidents")
def incidents(): return core.db.q("select * from incidents order by ts desc limit 30")

@app.post("/api/incidents/simulate")
def inc_sim(): return {"id": core.simulate_incident()}

class Review(BaseModel): decision: str; note: str = ""

@app.post("/api/incidents/{iid}/review")
def inc_review(iid: str, b: Review):
    if b.decision not in ("forwarded_to_police", "dismissed"): raise HTTPException(400, "bad decision")
    core.db.x("update incidents set status=?,note=? where id=?", (b.decision, b.note, iid)); core.audit("operator", b.decision, iid); core.bump(); return {"ok": True}

class EvIn(BaseModel):
    id: str; bus: str; cls: str; conf: float; lat: float; lon: float; ts: float
    route: Optional[str] = None; camera: str = "front"
class Batch(BaseModel): events: List[EvIn]

@app.post("/api/edge/ingest")  # real edge devices POST here; safe to retry (idempotent by event id)
def edge_ingest(b: Batch):
    bad = [e.cls for e in b.events if e.cls not in core.CLASS_BASE]
    if bad: raise HTTPException(422, f"unknown class {bad[0]}")
    return {"accepted": core.ingest_batch([e.model_dump() for e in b.events]), "received": len(b.events)}

class Conn(BaseModel): offline: bool

@app.post("/api/edge/{bus}/connectivity")
def conn(bus: str, b: Conn):
    n = next((x for x in core.BUSES if x.id == bus), None)
    if not n: raise HTTPException(404, "bus not found")
    n.forced_off = b.offline; return {"ok": True}

_static = os.path.join(BASE, "..", "static")
if os.path.isdir(_static): app.mount("/", StaticFiles(directory=_static, html=True), name="ui")
else:
    @app.get("/", response_class=HTMLResponse)
    def _noui(): return "<h3>NagarNetra API is running. UI build missing - see /docs</h3>"
