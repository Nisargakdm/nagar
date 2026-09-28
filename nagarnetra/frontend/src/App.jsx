import {useEffect,useState} from 'react'
import {api,useSnapshot} from './api'
import MapView from './MapView'
import {Defects,DefectDetail,Work,Incidents,Fleet} from './Panels'
export default function App(){
  const {snap,err}=useSnapshot(),[tab,setTab]=useState('defects'),[sel,setSel]=useState(null),[layer,setLayer]=useState('health')
  const [defects,setDefects]=useState([]),[wos,setWos]=useState([]),[incs,setIncs]=useState([]),[segs,setSegs]=useState([]),[nonce,setN]=useState(0)
  const v=snap?.version
  useEffect(()=>{Promise.all([api('/api/defects'),api('/api/workorders'),api('/api/incidents')]).then(([d,w,i])=>{setDefects(d);setWos(w);setIncs(i)}).catch(()=>{})},[v,nonce])
  useEffect(()=>{const t=()=>api('/api/segments').then(setSegs).catch(()=>{});t();const i=setInterval(t,4000);return()=>clearInterval(i)},[])
  const ch=()=>setN(n=>n+1)
  if(!snap)return <div className="boot">{err?<>Cannot reach the NagarNetra server.<br/><small>Start it with run.bat and open http://localhost:8000<br/>({err})</small></>:'Connecting…'}</div>
  const s=snap.stats,K=[['Buses online',snap.buses.filter(b=>b.online).length+'/'+s.buses],['Detections',s.events],['Verified defects',s.verified],['Filtered (1 bus)',s.filtered],['Open work orders',s.open_wo],['Fixes re-verified',s.closed],['Road health',s.health],['Edge bandwidth saved',s.bw_saved+'%']]
  return <div className="app"><header><div><h1>Nagar<b>Netra</b></h1><div className="sub">Public buses as mobile urban sensors · Pune demo · sim clock {snap.sim_time}</div></div>
    <div className={`pill ${err?'bad':'ok'}`}>{err?'server unreachable':'live'}</div></header>
    <div className="kpis">{K.map(([l,x])=><div className="kpi" key={l}><b>{x}</b><small>{l}</small></div>)}</div>
    {snap.alerts.length>0&&<div className="alerts">{snap.alerts.slice(0,3).map(a=><span key={a.id} className={`al ${a.sev}`}>{a.msg}</span>)}</div>}
    <main><section className="mapbox"><div className="layers">{[['health','Road health'],['congestion','Congestion'],['route','Routes']].map(([k,l])=><button key={k} className={layer===k?'on':''} onClick={()=>setLayer(k)}>{l}</button>)}</div>
      <MapView buses={snap.buses} defects={defects} segs={segs} zones={snap.zones} layer={layer} onSelect={setSel}/></section>
      <aside><nav>{[['defects','Defects'],['work','Work orders'],['incidents','Incidents'],['fleet','Fleet & edge']].map(([k,l])=><button key={k} className={tab===k?'on':''} onClick={()=>setTab(k)}>{l}</button>)}</nav>
        <div className="panel">{tab==='defects'&&<Defects defects={defects} onSelect={setSel} sel={sel}/>}{tab==='work'&&<Work wos={wos} onChanged={ch} onSelect={setSel}/>}
          {tab==='incidents'&&<Incidents incs={incs} onChanged={ch}/>}{tab==='fleet'&&<Fleet buses={snap.buses} stats={s} recent={snap.recent}/>}</div></aside></main>
    {sel&&<DefectDetail id={sel} onClose={()=>setSel(null)} onChanged={ch}/>}</div>
}
