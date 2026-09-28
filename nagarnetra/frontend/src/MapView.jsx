import {useEffect,useRef} from 'react'
import L from 'leaflet'; import 'leaflet/dist/leaflet.css'
import {TILE_URL,CLASS_COLOR} from './config'
const heat=v=>v==null?'#4a5563':v<25?'#3ee6c4':v<50?'#f2a93b':'#ff5d5d'
const hp=v=>v>80?'#3ee6c4':v>55?'#f2a93b':'#ff5d5d'
export default function MapView({buses,defects,segs,zones,layer,onSelect}){
  const el=useRef(),M=useRef(),G=useRef({}),B=useRef({}),fitted=useRef(false)
  useEffect(()=>{const m=L.map(el.current).setView([18.515,73.85],13)
    L.tileLayer(TILE_URL,{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(m)
    G.current={seg:L.layerGroup().addTo(m),zone:L.layerGroup().addTo(m),def:L.layerGroup().addTo(m)};M.current=m;return()=>m.remove()},[])
  useEffect(()=>{const g=G.current.seg;if(!g)return;g.clearLayers()
    segs.forEach(s=>L.polyline(s.coords,{weight:7,opacity:.85,color:layer==='health'?hp(s.health):layer==='congestion'?heat(s.congestion):s.color})
      .bindTooltip(`${s.id} · health ${s.health}${s.congestion!=null?` · congestion ${s.congestion}% · ~${s.vehicles} veh`:''}`).addTo(g))
    if(segs.length&&!fitted.current){fitted.current=true;M.current.fitBounds(L.latLngBounds(segs.flatMap(s=>s.coords)),{padding:[30,30]})}},[segs,layer])
  useEffect(()=>{const g=G.current.def;if(!g)return;g.clearLayers()
    defects.filter(d=>d.status!=='closed').forEach(d=>{const v=d.status==='verified',c=CLASS_COLOR[d.cls]
      L.circleMarker([d.lat,d.lon],{radius:v?9:5,color:d.status==='resolved'?'#7fd68a':'#0a0d12',weight:2,fillColor:c,fillOpacity:v?1:.35}).bindTooltip(`${d.name} · ${d.status} · P${d.priority}`).on('click',()=>onSelect(d.id)).addTo(g)})},[defects])
  useEffect(()=>{const g=G.current.zone;if(!g)return;g.clearLayers()
    zones.forEach(z=>L.circle([z.lat,z.lon],{radius:120,color:'#b98af0',weight:1,dashArray:'4 4',fillOpacity:.08}).bindTooltip(z.name).addTo(g))},[zones.length])
  useEffect(()=>{if(!M.current)return;buses.forEach(b=>{const st={radius:8,color:'#0a0d12',weight:2,fillOpacity:1,fillColor:b.online?'#ffffff':'#ff5d5d'}
    if(!B.current[b.id])B.current[b.id]=L.circleMarker([b.lat,b.lon],st).bindTooltip(b.id,{permanent:true,direction:'top',className:'bus-tip'}).addTo(M.current)
    else{B.current[b.id].setLatLng([b.lat,b.lon]);B.current[b.id].setStyle(st)}})},[buses])
  return <div ref={el} className="map"/>
}
