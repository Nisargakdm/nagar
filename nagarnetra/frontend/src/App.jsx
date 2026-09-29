import {useEffect,useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import {api,useSnapshot} from './api'
import MapView from './MapView'
import {Defects,DefectDetail,Work,Incidents,Fleet,CitizenReports,AttentionPanel,Trends} from './Panels'
import { useCitizenReports } from './citizenReports'
import AviraLogo from './AviraLogo'
export default function App(){
  const navigate = useNavigate();
  const {snap,err}=useSnapshot(),[tab,setTab]=useState('attention'),[sel,setSel]=useState(null),[layer,setLayer]=useState('health')
  const { reports, updateReportStatus } = useCitizenReports();
  const [defects,setDefects]=useState([]),[wos,setWos]=useState([]),[incs,setIncs]=useState([]),[segs,setSegs]=useState([]),[nonce,setN]=useState(0)
  const v=snap?.version
  useEffect(()=>{Promise.all([api('/api/defects'),api('/api/workorders'),api('/api/incidents')]).then(([d,w,i])=>{setDefects(d);setWos(w);setIncs(i)}).catch(()=>{})},[v,nonce])
  useEffect(()=>{const t=()=>api('/api/segments').then(setSegs).catch(()=>{});t();const i=setInterval(t,4000);return()=>clearInterval(i)},[])
  const ch=()=>setN(n=>n+1)
  if(!snap)return <div className="boot">{err?<>Cannot reach the AVIRA server.<br/><small>Start it with run.bat and open http://localhost:8000<br/>({err})</small></>:'Connecting…'}</div>
  const s=snap.stats
  const pulse = [['Verified road issues','11','var(--amber)'],['Congestion hotspots','7','var(--red)'],['Waterlogging locations','3','var(--blue)'],['Active incidents','2','var(--t)'],['Sensing buses online',`${snap.buses.filter(b=>b.online).length}/${s.buses}`,'var(--teal)']];
  return <div className="app"><header><div><AviraLogo className="mb-2" /><div className="sub" style={{marginTop:'8px',fontWeight:500,color:'var(--t)'}}>Urban Intelligence Command Center</div><div className="sub" style={{marginTop:'4px'}}>Public buses as mobile urban sensors · Pune demonstration · sim clock {snap.sim_time}</div></div>
    <div style={{display:'flex',gap:'16px',alignItems:'center'}}>
      <div className={`pill ${err?'bad':'ok'}`}>{err?'server unreachable':'live'}</div>
      <button style={{background:'transparent',border:'1px solid var(--l)',color:'var(--t)',padding:'6px 12px',borderRadius:'6px',display:'flex',gap:'6px',alignItems:'center',cursor:'pointer',fontSize:'13px'}} onClick={()=>navigate('/')}><LogOut size={14}/> Logout</button>
    </div></header>
    <div className="city-pulse" style={{display:'flex',alignItems:'center',padding:'12px 20px',borderBottom:'1px solid var(--l)',overflowX:'auto',whiteSpace:'nowrap'}}>
      <span style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.05em',color:'var(--m)',marginRight:'12px'}}>CITY PULSE</span>
      {pulse.map(([l,x,c],i)=><span key={l} style={{fontSize:'13px',display:'inline-flex',alignItems:'center',gap:'6px',marginRight:'16px'}}>
        <span style={{color:c}}>●</span> <b>{x}</b> {l}
      </span>)}
      <span className="demo-badge" style={{position:'static',padding:'2px 6px',marginLeft:'auto'}}>DEMO DATA</span>
    </div>
    {snap.alerts.length>0&&<div className="alerts">{snap.alerts.slice(0,3).map(a=><span key={a.id} className={`al ${a.sev}`}>{a.msg}</span>)}</div>}
    <main><section className="mapbox"><div className="layers">{[['health','Road Conditions'],['traffic','Traffic'],['waterlogging','Waterlogging'],['incidents','Incidents'],['infrastructure','Infrastructure'],['coverage','Bus Coverage']].map(([k,l])=><button key={k} className={layer===k?'on':''} onClick={()=>setLayer(k)}>{l}</button>)}</div>
      <MapView buses={snap.buses} defects={defects} segs={segs} zones={snap.zones} layer={layer} onSelect={setSel} reports={reports} incs={incs} wos={wos} /></section>
      <aside><nav style={{flexWrap:'wrap'}}>{[['attention','What Needs Attention'],['defects','All Events'],['trends','Trends'],['citizenReports','Citizen Reports'],['work','Work Orders'],['fleet','Fleet']].map(([k,l])=><button key={k} className={tab===k?'on':''} onClick={()=>setTab(k)}>{l}</button>)}</nav>
        <div className="panel">{tab==='attention'&&<AttentionPanel defects={defects} incs={incs} onSelect={setSel}/>}
          {tab==='defects'&&<Defects defects={defects} onSelect={setSel} sel={sel}/>}{tab==='trends'&&<Trends/>}
          {tab==='work'&&<Work wos={wos} onChanged={ch} onSelect={setSel}/>}
          {tab==='fleet'&&<Fleet buses={snap.buses} stats={s} recent={snap.recent}/>}{tab==='citizenReports'&&<CitizenReports/>}</div></aside></main>
    {sel&&<DefectDetail id={sel} onClose={()=>setSel(null)} onChanged={ch}/>}</div>
}
