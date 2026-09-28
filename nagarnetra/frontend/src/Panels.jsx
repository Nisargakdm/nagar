import {useEffect,useState} from 'react'
import {api} from './api'
import {CLASS_COLOR} from './config'
const ago=t=>{const s=Math.max(0,Date.now()/1000-t);return s<90?`${Math.round(s)}s ago`:s<5400?`${Math.round(s/60)}m ago`:s<172800?`${Math.round(s/3600)}h ago`:`${Math.round(s/86400)}d ago`}
const lvl=p=>p>=75?['Critical','crit']:p>=55?['High','high']:p>=35?['Medium','med']:['Low','low']
export const Chip=({s})=><span className={`chip ${s}`}>{s}</span>

export function Defects({defects,onSelect,sel}){
  const [f,setF]=useState('verified'),list=defects.filter(d=>f==='all'?true:d.status===f)
  return <div><div className="seg">{['verified','new','resolved','closed','all'].map(x=><button key={x} className={f===x?'on':''} onClick={()=>setF(x)}>{x}</button>)}</div>
    {f==='new'&&<p className="hint">Single-bus sightings. Not trusted until a second independent bus confirms — this is how false positives are filtered.</p>}
    {list.map(d=>{const [l,c]=lvl(d.priority);return <div key={d.id} className={`card ${sel===d.id?'sel':''}`} onClick={()=>onSelect(d.id)}>
      <div className="row"><b><i className="dot" style={{background:CLASS_COLOR[d.cls]}}/>{d.name}</b><Chip s={d.status}/></div>
      <div className="meta">{d.label} · {d.route_id} · {d.n_buses} bus{d.n_buses>1?'es':''} · {d.n_obs} obs</div>
      <div className="bar"><span className={c} style={{width:d.priority+'%'}}/></div><div className="meta">Priority {d.priority} · {l} · conf {(d.confidence*100).toFixed(0)}%</div></div>})}
    {!list.length&&<div className="empty">Nothing here yet.</div>}</div>
}
export function DefectDetail({id,onClose,onChanged}){
  const [d,setD]=useState(null),[msg,setMsg]=useState('');useEffect(()=>{api('/api/defects/'+id).then(setD).catch(e=>setMsg(String(e.message)))},[id])
  if(!d)return <div className="modal-bg" onClick={onClose}><div className="modal">{msg||'Loading…'}</div></div>
  const mk=async()=>{try{await api('/api/workorders',{method:'POST',body:{defect_id:id}});onChanged();onClose()}catch(e){setMsg('A work order is already open for this defect.')}}
  return <div className="modal-bg" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}>
    <button className="x" onClick={onClose}>×</button><h3>{d.name}</h3><div className="meta">{d.label} · segment {d.seg_id} · <Chip s={d.status}/></div>
    <h4>Why this priority — {d.priority}/100</h4>{d.components.map(c=><div className="kv" key={c.key}><span>{c.label}</span><b>+{c.value}</b></div>)}
    <h4>Evidence trail (independent buses)</h4>{d.events.slice(0,6).map(e=><div className="kv small" key={e.id}><span>Bus {e.bus_id} · {e.camera} cam</span><span>{(e.confidence*100).toFixed(0)}% · {ago(e.ts)}</span></div>)}
    <h4>Audit log</h4>{d.audit.length?d.audit.map((a,i)=><div className="kv small" key={i}><span>{a.action.replaceAll('_',' ')}</span><span>{a.actor} · {ago(a.ts)}</span></div>):<div className="meta">No actions yet.</div>}
    {msg&&<p className="hint">{msg}</p>}{d.status==='verified'&&!d.work_order&&<button className="primary" onClick={mk}>Create work order</button>}
    {d.work_order&&<div className="meta">Work order {d.work_order.id}: {d.work_order.status}</div>}</div></div>
}
export function Work({wos,onChanged,onSelect}){
  const next={New:'Assigned',Assigned:'InProgress',InProgress:'Resolved'},go=async(w)=>{await api('/api/workorders/'+w.id,{method:'PATCH',body:{status:next[w.status]}});onChanged()}
  return <div className="cols">{['New','Assigned','InProgress','Resolved'].map(k=><div key={k}><h4>{k} ({wos.filter(w=>w.status===k).length})</h4>
    {wos.filter(w=>w.status===k).map(w=><div className="card" key={w.id}><div onClick={()=>onSelect(w.defect_id)}><b>{w.cls.replace('_',' ')}</b><div className="meta">{w.label} · P{w.priority}</div></div>
      {next[k]&&<button className="ghost" onClick={()=>go(w)}>→ {next[k]}</button>}{k==='Resolved'&&<div className="meta">Awaiting fleet re-verification</div>}</div>)}</div>)}</div>
}
export function Incidents({incs,onChanged}){
  const sim=async()=>{await api('/api/incidents/simulate',{method:'POST'});onChanged()},rv=async(i,d)=>{await api(`/api/incidents/${i.id}/review`,{method:'POST',body:{decision:d}});onChanged()}
  return <div><button className="primary" onClick={sim}>Simulate hit-and-run detection</button>
    <p className="hint">Evidence package only (candidate plate from multi-frame OCR voting + confidence + GPS + time). A human decides — the system never assigns fault.</p>
    {incs.map(i=><div className="card" key={i.id}><div className="row"><b className="plate">{i.plate}</b><Chip s={i.status.replaceAll('_',' ')}/></div>
      <div className="meta">OCR consensus confidence {(i.plate_conf*100).toFixed(0)}% · bus {i.bus_id} · {ago(i.ts)} · {i.lat.toFixed(4)}, {i.lon.toFixed(4)}</div>
      <div className="frames">{JSON.parse(i.frames_json).map(f=><span key={f.frame} title={`conf ${f.conf}`}>{f.text}</span>)}</div>
      {i.status==='pending_review'&&<div className="row"><button className="ghost" onClick={()=>rv(i,'forwarded_to_police')}>Forward for review</button><button className="ghost" onClick={()=>rv(i,'dismissed')}>Dismiss</button></div>}</div>)}</div>
}
export function Fleet({buses,stats,recent}){
  const tog=async b=>{await api(`/api/edge/${b.id}/connectivity`,{method:'POST',body:{offline:!b.forced_off}})}
  return <div><div className="kv"><span>Bandwidth saved vs streaming raw video</span><b>{stats.bw_saved}%</b></div>
    <p className="hint">Each bus analyses video on-board and uploads only structured events plus a short clip. Modelled against 4 cameras at 8 Mbps total.</p>
    {buses.map(b=><div className="card" key={b.id}><div className="row"><b>Bus {b.id} <span className="meta">{b.route} · {b.speed} km/h</span></b><Chip s={b.online?'online':'offline'}/></div>
      <div className="meta">Buffered on-board: {b.buffered} · synced: {b.synced} · uploaded {b.mb_sent} MB</div>
      <button className="ghost" onClick={()=>tog(b)}>{b.forced_off?'Restore network':'Simulate network loss'}</button></div>)}
    <h4>Live detections</h4>{recent.map(e=><div className="kv small" key={e.id}><span style={{color:CLASS_COLOR[e.cls]}}>{e.cls.replace('_',' ')}</span><span>{e.bus_id} · {(e.confidence*100).toFixed(0)}% · {ago(e.ts)}</span></div>)}</div>
}
