import {useEffect,useState} from 'react'
import {api} from './api'
import { useCitizenReports } from './citizenReports'
import {CLASS_COLOR} from './config'
const ago=t=>{const s=Math.max(0,Date.now()/1000-t);return s<90?`${Math.round(s)}s ago`:s<5400?`${Math.round(s/60)}m ago`:s<172800?`${Math.round(s/3600)}h ago`:`${Math.round(s/86400)}d ago`}
const lvl=p=>p>=75?['Critical','crit']:p>=55?['High','high']:p>=35?['Medium','med']:['Low','low']
export const Chip=({s})=><span className={`chip ${s}`}>{s}</span>

const Section = ({title, count, open, children}) => (
  <details open={open} style={{marginBottom:'12px',background:'var(--p)',borderRadius:'8px',overflow:'hidden',border:'1px solid var(--l)'}}>
    <summary style={{padding:'12px',background:'var(--bg)',borderBottom:'1px solid var(--l)',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',fontWeight:600,fontSize:'12px',color:'var(--t)',textTransform:'uppercase',letterSpacing:'0.05em',userSelect:'none'}}>
      <span>{title}</span> {count!=null && <span style={{background:'var(--l)',padding:'2px 8px',borderRadius:'12px',fontSize:'11px'}}>{count}</span>}
    </summary>
    <div style={{padding:'12px'}}>
      {children}
    </div>
  </details>
)

export function Defects({defects,onSelect,sel}){
  const roads = defects.filter(d=>['pothole','damaged_road','broken_divider','missing_sign'].includes(d.cls));
  const water = defects.filter(d=>d.cls==='waterlogging');
  const traffic = defects.filter(d=>d.cls==='traffic');
  
  const renderList = (list) => {
    if(!list.length) return <div className="meta">No events in this category.</div>;
    return list.map(d=>{const [l,c]=lvl(d.priority);return <div key={d.id} className={`card ${sel===d.id?'sel':''}`} onClick={()=>onSelect(d.id)}>
      <div className="row"><b><i className="dot" style={{background:CLASS_COLOR[d.cls]}}/>{d.name}</b><Chip s={d.status}/></div>
      <div className="meta">{d.label} · {d.route_id} · {d.n_buses} bus{d.n_buses>1?'es':''} · {d.n_obs} obs</div>
      <div className="bar"><span className={c} style={{width:d.priority+'%'}}/></div><div className="meta">Priority {d.priority} · {l} · conf {(d.confidence*100).toFixed(0)}%</div></div>})
  };

  return <div>
    <Section title="ROAD ISSUES" count={roads.length} open={true}>{renderList(roads)}</Section>
    <Section title="TRAFFIC" count={traffic.length} open={true}>{renderList(traffic)}</Section>
    <Section title="WATERLOGGING" count={water.length} open={true}>{renderList(water)}</Section>
  </div>
}
export function DefectDetail({id,onClose,onChanged}){
  const [d,setD]=useState(null),[msg,setMsg]=useState('');useEffect(()=>{api('/api/defects/'+id).then(setD).catch(e=>setMsg(String(e.message)))},[id])
  if(!d)return <div className="drawer-bg" onClick={onClose}><div className="drawer">{msg||'Loading…'}</div></div>
  const mk=async()=>{try{await api('/api/workorders',{method:'POST',body:{defect_id:id}});onChanged();onClose()}catch(e){setMsg('A work order is already open for this defect.')}}
  return <div className="drawer-bg" onClick={onClose}><div className="drawer" onClick={e=>e.stopPropagation()}>
    <button className="x" onClick={onClose}>×</button>
    <h3 style={{fontSize:'20px',marginBottom:'4px',textTransform:'uppercase'}}>{d.name}</h3>
    <div className="meta" style={{fontSize:'14px',marginBottom:'24px'}}>{d.label} · Segment {d.seg_id}</div>
    
    <div className="row" style={{marginBottom:'16px'}}><b>STATUS</b> <Chip s={d.status}/></div>
    <div className="row" style={{marginBottom:'8px'}}><b>OBSERVED BY</b> <span>{d.n_buses} buses</span></div>
    <div className="row" style={{marginBottom:'8px'}}><b>OBSERVATIONS</b> <span>{d.n_obs}</span></div>
    <div className="row" style={{marginBottom:'8px'}}><b>FIRST OBSERVED</b> <span>09:12</span></div>
    <div className="row" style={{marginBottom:'24px'}}><b>LAST OBSERVED</b> <span>09:28</span></div>

    <div style={{background:'var(--bg)',padding:'16px',borderRadius:'8px',marginBottom:'24px',border:'1px solid var(--l)'}}>
      <h4 style={{marginBottom:'8px'}}>WHY THIS MATTERS</h4>
      <ul style={{margin:0,paddingLeft:'20px',fontSize:'13px',color:'var(--t)',lineHeight:1.5}}>
        <li>Observed by {d.n_buses} independent buses</li>
        <li>Repeated {d.n_obs} times across the same road segment</li>
        <li>Still present in recent observations</li>
        {d.priority >= 75 && <li>High severity classification requires immediate attention</li>}
      </ul>
    </div>

    <h4 style={{marginBottom:'12px'}}>EVIDENCE</h4>
    {d.events.slice(0,6).map(e=><div className="row" key={e.id} style={{marginBottom:'8px',fontSize:'13px'}}><span>Bus {e.bus_id}</span><span className="meta">{ago(e.ts)}</span></div>)}
    
    <h4 style={{marginTop:'24px',marginBottom:'12px'}}>ACTION</h4>
    {msg&&<p className="hint">{msg}</p>}
    {d.status==='verified'&&!d.work_order&&<button className="primary" style={{width:'100%',padding:'12px',marginBottom:'8px'}} onClick={mk}>Create Work Order</button>}
    <button className="ghost" style={{width:'100%',padding:'12px',border:'1px solid var(--l)'}} onClick={()=>onClose()}>Mark Resolved</button>
    {d.work_order&&<div className="meta" style={{marginTop:'8px'}}>Work order {d.work_order.id}: {d.work_order.status}</div>}
  </div></div>
}
export function Work({wos,onChanged,onSelect}){
  const next={New:'Assigned',Assigned:'InProgress',InProgress:'Resolved'},go=async(w)=>{await api('/api/workorders/'+w.id,{method:'PATCH',body:{status:next[w.status]}});onChanged()}
  
  const renderList = (status) => {
    const list = wos.filter(w=>w.status===status);
    if (!list.length) return <div className="meta">No work orders here.</div>;
    return list.map(w=><div className="card" key={w.id}><div onClick={()=>onSelect(w.defect_id)}><b>{w.cls.replace('_',' ')}</b><div className="meta">{w.label} · P{w.priority}</div></div>
      {next[status]&&<button className="ghost" onClick={()=>go(w)}>→ {next[status]}</button>}
      {status==='Resolved'&&<div className="meta" style={{marginTop:'8px'}}>Awaiting fleet re-verification</div>}</div>)
  }

  return <div>
    <Section title="NEW — Issues requiring action" count={wos.filter(w=>w.status==='New').length} open={true}>
      {renderList('New')}
    </Section>
    <Section title="ASSIGNED — Assigned to field teams" count={wos.filter(w=>w.status==='Assigned').length} open={wos.filter(w=>w.status==='Assigned').length > 0}>
      {renderList('Assigned')}
    </Section>
    <Section title="IN PROGRESS — Currently being resolved" count={wos.filter(w=>w.status==='InProgress').length} open={wos.filter(w=>w.status==='InProgress').length > 0}>
      {renderList('InProgress')}
    </Section>
    <Section title="RESOLVED — Completed and verified" count={wos.filter(w=>w.status==='Resolved').length} open={false}>
      {renderList('Resolved')}
    </Section>
  </div>
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
  return <div>
    <Section title="BUSES ONLINE" count={buses.filter(b=>b.online).length} open={true}>
      {buses.map(b=><div className="card" key={b.id}><div className="row"><b>Bus {b.id} <span className="meta">{b.route} · {b.speed} km/h</span></b><Chip s={b.online?'online':'offline'}/></div>
        <button className="ghost" onClick={()=>tog(b)}>{b.forced_off?'Restore network':'Simulate network loss'}</button></div>)}
    </Section>
    <Section title="EDGE STATUS" count={buses.length} open={false}>
      <div className="kv" style={{marginBottom:'12px'}}><span>Bandwidth saved (vs streaming)</span><b>{stats.bw_saved}%</b></div>
      <p className="hint">Each bus analyses video on-board and uploads only structured events plus a short clip.</p>
      {buses.map(b=><div className="card" key={b.id}>
        <div className="row"><b>Bus {b.id}</b></div>
        <div className="meta">Buffered: {b.buffered} · Synced: {b.synced} · Uploaded: {b.mb_sent} MB</div>
      </div>)}
    </Section>
    <Section title="RECENT OBSERVATIONS" count={recent.length} open={true}>
      {recent.length === 0 && <div className="meta">No recent observations.</div>}
      {recent.map(e=><div className="kv small" key={e.id}><span style={{color:CLASS_COLOR[e.cls]}}>{e.cls.replace('_',' ')}</span><span>{e.bus_id} · {(e.confidence*100).toFixed(0)}% · {ago(e.ts)}</span></div>)}
    </Section>
  </div>
}

export function CitizenReports() {
  const { reports, updateReportStatus } = useCitizenReports();
  const nextStatus = { 'Submitted': 'Under Review', 'Under Review': 'Assigned', 'Assigned': 'In Progress', 'In Progress': 'Resolved' };

  const renderList = (status) => {
    const list = reports.filter(r=>r.status===status);
    if (!list.length) return <div className="meta">No reports in this status.</div>;
    return list.map(r => (
      <div className="card" key={r.id}>
        <div className="row"><b>{r.type}</b><Chip s={r.status.replace(' ', '_').toLowerCase()} /></div>
        <div className="meta">{r.location} · {r.date}</div>
        {r.description && <div className="hint" style={{marginTop:'8px', marginBottom:'8px'}}>{r.description}</div>}
        {nextStatus[r.status] && (
          <button className="ghost" onClick={() => updateReportStatus(r.id, nextStatus[r.status])}>→ Mark {nextStatus[r.status]}</button>
        )}
      </div>
    ))
  }

  return <div>
    <p className="hint" style={{marginBottom:'16px'}}>Citizen-submitted issues from the public portal.</p>
    <Section title="SUBMITTED" count={reports.filter(r=>r.status==='Submitted').length} open={true}>{renderList('Submitted')}</Section>
    <Section title="UNDER REVIEW" count={reports.filter(r=>r.status==='Under Review').length} open={reports.filter(r=>r.status==='Under Review').length>0}>{renderList('Under Review')}</Section>
    <Section title="ASSIGNED" count={reports.filter(r=>r.status==='Assigned').length} open={reports.filter(r=>r.status==='Assigned').length>0}>{renderList('Assigned')}</Section>
    <Section title="IN PROGRESS" count={reports.filter(r=>r.status==='In Progress').length} open={reports.filter(r=>r.status==='In Progress').length>0}>{renderList('In Progress')}</Section>
    <Section title="RESOLVED" count={reports.filter(r=>r.status==='Resolved').length} open={false}>{renderList('Resolved')}</Section>
  </div>
}

export function AttentionPanel({defects,onSelect}){
  const critical = defects.filter(d=>d.priority >= 75 && d.status === 'verified');
  const high = defects.filter(d=>d.priority >= 55 && d.priority < 75 && d.status === 'verified');
  const monitor = defects.filter(d=>d.status === 'new');
  
  const actionFor = (cls) => {
    if(cls==='pothole') return 'Create road maintenance work order';
    if(cls==='waterlogging') return 'Dispatch field inspection';
    if(cls==='traffic') return 'Monitor corridor / consider traffic intervention';
    return 'Verify incident and coordinate response';
  };

  const renderCards = (list, color) => {
    if(list.length===0) return <div className="meta">No events in this category.</div>;
    return list.map((d,i) => (
      <div key={d.id} className="card" onClick={()=>onSelect(d.id)} style={{borderLeft:`3px solid ${color}`}}>
        <div className="row"><b>{d.name}</b> <button className="ghost" style={{margin:0,padding:'2px 8px'}} onClick={(e)=>{e.stopPropagation();onSelect(d.id)}}>View on Map</button></div>
        <div className="meta" style={{marginBottom:'12px'}}>{d.label}</div>
        <div className="meta" style={{marginBottom:'12px'}}>Observed by {d.n_buses} buses</div>
        <div className="hint" style={{fontSize:'11px',color:'var(--t)',fontWeight:600,textTransform:'uppercase'}}>Recommended Action:</div>
        <div className="meta">{actionFor(d.cls)}</div>
      </div>
    ))
  }

  return <div>
    <Section title="CRITICAL / REQUIRES ACTION" count={critical.length} open={true}>{renderCards(critical, 'var(--red)')}</Section>
    <Section title="HIGH PRIORITY" count={high.length} open={true}>{renderCards(high, 'var(--amber)')}</Section>
    <Section title="RECENT / MONITOR" count={monitor.length} open={false}>{renderCards(monitor, 'var(--blue)')}</Section>
  </div>
}

export function Trends() {
  return <div>
    <div className="row" style={{marginBottom:'24px',gap:'8px'}}>
      <button className="pill on" style={{flex:1,textAlign:'center',padding:'8px'}}>Last 24 hours</button>
      <button className="pill" style={{flex:1,textAlign:'center',padding:'8px'}}>Last 7 days</button>
      <button className="pill" style={{flex:1,textAlign:'center',padding:'8px'}}>Last 30 days</button>
    </div>
    
    <div style={{marginBottom:'32px'}}>
      <h4 style={{marginBottom:'12px',textTransform:'uppercase',fontSize:'12px',letterSpacing:'0.05em'}}>ROAD ISSUES (Last 7 days)</h4>
      <div style={{height:'120px',display:'flex',alignItems:'flex-end',gap:'6px',borderBottom:'1px solid var(--l)',paddingBottom:'8px'}}>
        {[30, 45, 20, 60, 80, 50, 40].map((h,i) => (
          <div key={i} style={{flex:1, background:'var(--blue)', height:h+'%', borderRadius:'4px 4px 0 0', opacity:0.8}}></div>
        ))}
      </div>
    </div>
    
    <div className="card" style={{cursor:'default'}}>
      <div className="row" style={{padding:'8px 0',borderBottom:'1px solid var(--l)'}}><b>Detected road issues</b><span>412</span></div>
      <div className="row" style={{padding:'8px 0',borderBottom:'1px solid var(--l)'}}><b>Verified issues</b><span>124</span></div>
      <div className="row" style={{padding:'8px 0',borderBottom:'1px solid var(--l)'}}><b>Resolved issues</b><span>89</span></div>
      <div className="row" style={{padding:'8px 0',borderBottom:'1px solid var(--l)'}}><b>Congestion events</b><span>45</span></div>
      <div className="row" style={{padding:'8px 0'}}><b>Waterlogging events</b><span>12</span></div>
    </div>
  </div>
}
