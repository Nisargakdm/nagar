import {useEffect,useState} from 'react'
import {API_BASE} from './config'
export async function api(path,opts){
  const r=await fetch(API_BASE+path,opts&&opts.body?{...opts,headers:{'Content-Type':'application/json'},body:JSON.stringify(opts.body)}:opts)
  if(!r.ok) throw new Error((await r.text())||r.status); return r.json()
}
export function useSnapshot(){
  const [snap,setSnap]=useState(null),[err,setErr]=useState(null)
  useEffect(()=>{let on=true;const t=async()=>{try{const s=await api('/api/snapshot');if(on){setSnap(s);setErr(null)}}catch(e){on&&setErr(String(e.message||e))}}
    t();const i=setInterval(t,1000);return()=>{on=false;clearInterval(i)}},[])
  return {snap,err}
}
