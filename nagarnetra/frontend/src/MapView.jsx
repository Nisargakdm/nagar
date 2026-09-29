import {useEffect,useRef,useState} from 'react'
import L from 'leaflet'; import 'leaflet/dist/leaflet.css'
import {TILE_URL,CLASS_COLOR} from './config'
import { Search, X } from 'lucide-react'

const heat=v=>v==null?'#66757D':v<25?'#4C8A82':v<50?'#D98B32':'#D32F2F'
const hp=v=>v>80?'#4C8A82':v>55?'#D98B32':'#D32F2F'

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export default function MapView({buses=[],defects=[],segs=[],zones=[],layer,onSelect,reports=[],incs=[],wos=[]}){
  const el=useRef(),M=useRef(),G=useRef({}),B=useRef({}),fitted=useRef(false)
  const [query, setQuery] = useState('');
  const [searchPos, setSearchPos] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const searchMarkerRef = useRef(null);

  useEffect(()=>{
    const m=L.map(el.current, { zoomControl: false }).setView([18.515,73.85],13)
    L.control.zoom({ position: 'bottomright' }).addTo(m);
    L.tileLayer(TILE_URL,{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(m)
    G.current={seg:L.layerGroup().addTo(m),zone:L.layerGroup().addTo(m),def:L.layerGroup().addTo(m)};
    M.current=m;
    return()=>m.remove()
  },[])

  useEffect(()=>{const g=G.current.seg;if(!g)return;g.clearLayers()
    segs.forEach((s,i)=>L.polyline(s.coords,{weight:7,opacity:.85,color:layer==='health'?hp(s.health):layer==='traffic'?heat(s.congestion):(i%3===0?'#17324D':'#4C8A82')})
      .bindTooltip(`${s.id} · health ${s.health}${s.congestion!=null?` · congestion ${s.congestion}% · ~${s.vehicles} veh`:''}`).addTo(g))
    if(segs.length&&!fitted.current){fitted.current=true;M.current.fitBounds(L.latLngBounds(segs.flatMap(s=>s.coords)),{padding:[30,30]})}
  },[segs,layer])

  useEffect(()=>{const g=G.current.def;if(!g)return;g.clearLayers()
    defects.filter(d=>d.status!=='closed').forEach(d=>{
      // layer filtering
      if (layer === 'health' && !['pothole','damaged_road','broken_divider','missing_sign'].includes(d.cls)) return;
      if (layer === 'traffic' && d.cls !== 'traffic') return;
      if (layer === 'waterlogging' && d.cls !== 'waterlogging') return;
      
      const v=d.status==='verified',c=CLASS_COLOR[d.cls] || '#17324D'
      L.circleMarker([d.lat,d.lon],{radius:v?9:5,color:d.status==='resolved'?'#7fd68a':'#17324D',weight:2,fillColor:c,fillOpacity:v?1:.35})
       .bindTooltip(`${d.name} · ${d.status} · P${d.priority}`)
       .on('click',()=>onSelect(d.id)).addTo(g)
    })
  },[defects, layer])

  useEffect(()=>{const g=G.current.zone;if(!g)return;g.clearLayers()
    zones.forEach(z=>L.circle([z.lat,z.lon],{radius:120,color:'#b98af0',weight:1,dashArray:'4 4',fillOpacity:.08}).bindTooltip(z.name).addTo(g))
  },[zones.length])

  useEffect(()=>{if(!M.current)return;buses.forEach(b=>{const st={radius:8,color:'#17324D',weight:2,fillOpacity:1,fillColor:b.online?'#FFFFFF':'#D32F2F'}
    if(!B.current[b.id])B.current[b.id]=L.circleMarker([b.lat,b.lon],st).bindTooltip(b.id,{permanent:true,direction:'top',className:'bus-tip'}).addTo(M.current)
    else{B.current[b.id].setLatLng([b.lat,b.lon]);B.current[b.id].setStyle(st)}
  })},[buses])

  const handleSearch = async (e) => {
    e.preventDefault();
    if(!query) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query+', Pune')}&format=json&limit=1`);
      const data = await res.json();
      if(data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        setSearchPos({lat, lon, name: query});
        setShowAll(false);
        
        if (M.current) {
          M.current.flyTo([lat, lon], 15);
          if (searchMarkerRef.current) M.current.removeLayer(searchMarkerRef.current);
          searchMarkerRef.current = L.marker([lat, lon], {
            icon: L.divIcon({className: 'search-marker', html: `<div style="background:var(--blue);width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.2)"></div>`})
          }).addTo(M.current);
        }
        
        let results = [];
        defects.forEach(d => {
          if (layer === 'health' && !['pothole','damaged_road','broken_divider','missing_sign'].includes(d.cls)) return;
          if (layer === 'traffic' && d.cls !== 'traffic') return;
          if (layer === 'waterlogging' && d.cls !== 'waterlogging') return;
          const dist = haversine(lat, lon, d.lat, d.lon);
          if (dist <= 1.0) results.push({ id: d.id, type: d.cls.replace('_',' '), location: d.label, dist, status: d.status, isDefect: true });
        });
        
        reports.forEach(r => {
          if (r.lat && r.lon) {
            const dist = haversine(lat, lon, r.lat, r.lon);
            if (dist <= 1.0) results.push({ id: r.id, type: 'Citizen Report: ' + r.type, location: r.location, dist, status: r.status, isDefect: false });
          }
        });
        
        incs.forEach(i => {
           if (layer !== 'incidents' && layer !== 'health' && layer !== 'attention') return;
           const dist = haversine(lat, lon, i.lat, i.lon);
           if (dist <= 1.0) results.push({ id: i.id, type: 'Incident', location: i.plate, dist, status: i.status, isDefect: false });
        });
        
        results.sort((a,b)=>a.dist - b.dist);
        setNearby(results);
      } else {
        alert("Location not found.");
      }
    } catch(err) {
      console.error(err);
    }
  };

  const clearSearch = () => {
    setSearchPos(null);
    setQuery('');
    if(searchMarkerRef.current && M.current) {
      M.current.removeLayer(searchMarkerRef.current);
      searchMarkerRef.current = null;
    }
  };

  const clickReport = (r) => {
    if(r.isDefect) onSelect(r.id);
  }

  return <div style={{position:'relative', width:'100%', height:'100%'}}>
    <div ref={el} className="map" style={{width:'100%', height:'100%'}}/>
    
    {/* Map Search Overlay */}
    <div style={{position:'absolute', top:'10px', left:'10px', zIndex:1000, width:'300px'}}>
      <form onSubmit={handleSearch} style={{display:'flex', alignItems:'center', background:'white', borderRadius:'8px', padding:'8px 12px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)', border:'1px solid var(--l-border)'}}>
        <Search size={16} color="var(--l-text-sec)" style={{marginRight:'8px'}} />
        <input type="text" placeholder="Search a place, road or area" value={query} onChange={e=>setQuery(e.target.value)} style={{border:'none', outline:'none', width:'100%', fontSize:'13px', fontFamily:'inherit'}} />
        {searchPos && <button type="button" onClick={clearSearch} style={{background:'none',border:'none',color:'var(--l-text-sec)',cursor:'pointer',display:'flex',alignItems:'center'}}><X size={16}/></button>}
      </form>

      {searchPos && !showAll && (
        <div style={{background:'white', borderRadius:'8px', padding:'16px', marginTop:'8px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)', border:'1px solid var(--l-border)'}}>
          <div style={{fontSize:'11px', fontWeight:700, color:'var(--l-text-sec)', letterSpacing:'0.05em', marginBottom:'4px'}}>SEARCH RESULTS</div>
          <div style={{fontSize:'16px', fontWeight:600, marginBottom:'12px'}}>{searchPos.name}</div>
          
          {nearby.length > 0 ? (
            <>
              <div style={{fontSize:'13px', color:'var(--l-text-sec)', marginBottom:'12px'}}>
                {nearby.length} nearby AVIRA report{nearby.length>1?'s':''} within 1 km
              </div>
              <ul style={{margin:0, padding:0, listStyle:'none', fontSize:'13px', marginBottom:'16px', color:'var(--l-text)'}}>
                {Object.entries(nearby.reduce((acc, r) => { acc[r.type] = (acc[r.type]||0)+1; return acc; }, {})).map(([type, count]) => (
                  <li key={type} style={{marginBottom:'4px'}}>● {count} {type}</li>
                ))}
              </ul>
              <button onClick={() => setShowAll(true)} style={{width:'100%', background:'none', border:'1px solid var(--l-border)', padding:'8px', borderRadius:'6px', cursor:'pointer', fontSize:'12px', color:'var(--l-primary)', fontWeight:600}}>
                View all nearby reports
              </button>
            </>
          ) : (
            <div style={{fontSize:'13px', color:'var(--l-text-sec)'}}>
              No AVIRA reports found within 1 km of this location.
            </div>
          )}
        </div>
      )}
      
      {searchPos && showAll && (
        <div style={{background:'white', borderRadius:'8px', padding:'16px', marginTop:'8px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)', border:'1px solid var(--l-border)', maxHeight:'400px', overflowY:'auto'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px'}}>
            <div style={{fontSize:'11px', fontWeight:700, color:'var(--l-text-sec)', letterSpacing:'0.05em'}}>NEARBY REPORTS</div>
            <button onClick={() => setShowAll(false)} style={{background:'none', border:'none', cursor:'pointer', color:'var(--l-text-sec)', fontSize:'12px'}}>Back</button>
          </div>
          
          <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
            {nearby.map((r, idx) => (
              <div key={idx} onClick={() => clickReport(r)} style={{padding:'12px', border:'1px solid var(--l-border)', borderRadius:'6px', cursor: r.isDefect ? 'pointer' : 'default'}}>
                <div style={{fontSize:'12px', fontWeight:600, textTransform:'uppercase', color:'var(--l-text)', marginBottom:'4px'}}>{r.type}</div>
                <div style={{fontSize:'12px', color:'var(--l-text-sec)', marginBottom:'4px'}}>{r.location}</div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <span style={{fontSize:'11px', color:'var(--l-primary)', fontWeight:600}}>{r.dist.toFixed(1)} km away</span>
                  <span style={{fontSize:'10px', background:'#f0f0f0', padding:'2px 6px', borderRadius:'10px', textTransform:'capitalize'}}>{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
}
