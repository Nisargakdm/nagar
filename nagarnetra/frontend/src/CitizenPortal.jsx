import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation2, LogOut, MapPin, Camera, AlertTriangle } from 'lucide-react';
import MapView from './MapView';
import { api, useSnapshot } from './api';
import { useCitizenReports } from './citizenReports';
import AviraLogo from './AviraLogo';
import './landing.css';

export default function CitizenPortal() {
  const navigate = useNavigate();
  const { reports, addReport } = useCitizenReports();
  const { snap, err } = useSnapshot();
  
  const [defects, setDefects] = useState([]);
  const [segs, setSegs] = useState([]);
  const [layer, setLayer] = useState('health'); // 'health' (Road Issues), 'congestion' (Traffic), 'route'
  const [sel, setSel] = useState(null);

  // Form state
  const [issueType, setIssueType] = useState('');
  const [locationStr, setLocationStr] = useState('');
  const [desc, setDesc] = useState('');

  const v = snap?.version;
  useEffect(() => {
    api('/api/defects').then(setDefects).catch(() => {});
  }, [v]);
  
  useEffect(() => {
    const t = () => api('/api/segments').then(setSegs).catch(() => {});
    t();
    const i = setInterval(t, 4000);
    return () => clearInterval(i);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!issueType || !locationStr) return;
    addReport({
      type: issueType,
      location: locationStr,
      description: desc,
      // Default to roughly Pune center for the prototype
      lat: 18.515 + (Math.random() * 0.02 - 0.01),
      lon: 73.85 + (Math.random() * 0.02 - 0.01)
    });
    setIssueType('');
    setLocationStr('');
    setDesc('');
    alert('Report submitted successfully!');
  };

  if (!snap) return <div className="boot">{err ? 'Cannot reach server' : 'Connecting…'}</div>;

  return (
    <div className="citizen-layout light-theme">
      <header className="citizen-header">
        <div className="nav-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <AviraLogo />
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>Welcome, Citizen</span>
          <button className="btn-outline" style={{ padding: '6px 12px', display: 'flex', gap: '6px', alignItems: 'center' }} onClick={() => navigate('/')}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <main className="citizen-main">
        <div style={{gridColumn:'1 / -1',marginBottom:'8px'}}>
          <h1 style={{fontSize:'28px',margin:'0 0 8px 0'}}>Good Morning.</h1>
          <p style={{fontSize:'16px',color:'var(--l-text-sec)',margin:0}}>What is happening around you?</p>
        </div>

        {/* Left Column: Map & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="citizen-card" style={{ padding: '24px' }}>
            <h3 style={{fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.05em',color:'var(--l-text-sec)',marginBottom:'16px'}}>CITY CONDITIONS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{padding:'8px',background:'#FDF3E8',color:'var(--l-accent)',borderRadius:'8px'}}><Navigation2 size={20} /></div>
                <div>
                  <div style={{fontSize:'14px',fontWeight:'600'}}>Traffic</div>
                  <div style={{fontSize:'13px',color:'var(--l-text-sec)'}}>Heavy near Deccan Gymkhana</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{padding:'8px',background:'#E9F0F4',color:'var(--l-blue)',borderRadius:'8px'}}><AlertTriangle size={20} /></div>
                <div>
                  <div style={{fontSize:'14px',fontWeight:'600'}}>Waterlogging</div>
                  <div style={{fontSize:'13px',color:'var(--l-text-sec)'}}>Reported near Shaniwar Wada</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{padding:'8px',background:'#FBEDED',color:'var(--l-red)',borderRadius:'8px'}}><MapPin size={20} /></div>
                <div>
                  <div style={{fontSize:'14px',fontWeight:'600'}}>Road Issue</div>
                  <div style={{fontSize:'13px',color:'var(--l-text-sec)'}}>Pothole near Nal Stop</div>
                </div>
              </div>
            </div>
          </div>

          <div className="citizen-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '400px' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--l-border)', display: 'flex', gap: '8px', background: 'var(--l-bg)', flexWrap:'wrap' }}>
              {[
                { k: 'congestion', l: 'Traffic' },
                { k: 'waterlogging', l: 'Waterlogging' },
                { k: 'health', l: 'Road Issues' },
                { k: 'incidents', l: 'Incidents' }
              ].map(({ k, l }) => (
                <button
                  key={k}
                  style={{
                    background: layer === k ? 'var(--l-primary)' : 'transparent',
                    color: layer === k ? '#fff' : 'var(--l-text-sec)',
                    border: '1px solid',
                    borderColor: layer === k ? 'var(--l-primary)' : 'var(--l-border)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: layer === k ? '600' : '400'
                  }}
                  onClick={() => setLayer(k)}
                >
                  {l}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <MapView buses={snap.buses} defects={defects} segs={segs} zones={snap.zones} layer={layer} onSelect={setSel} reports={reports} incs={[]} wos={[]} />
            </div>
            <div style={{ padding: '8px 16px', borderTop: '1px solid var(--l-border)', background: 'var(--l-bg)', display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--l-text-sec)', alignItems: 'center' }}>
              <span style={{fontWeight: 600}}>LEGEND:</span>
              <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><span style={{width:'8px',height:'8px',borderRadius:'50%',background:'#ff5d5d'}}></span> Critical</span>
              <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><span style={{width:'8px',height:'8px',borderRadius:'50%',background:'#f2a93b'}}></span> High</span>
              <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><span style={{width:'8px',height:'8px',borderRadius:'50%',background:'#3ee6c4'}}></span> Good</span>
            </div>
          </div>
        </div>

        {/* Right Column: Report Form & My Reports */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="citizen-card">
            <h3>Report an Issue</h3>
            <form className="issue-form" onSubmit={handleSubmit}>
              <label style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>Issue Type</label>
              <select required value={issueType} onChange={e => setIssueType(e.target.value)}>
                <option value="">Select an issue type...</option>
                <option value="Pothole">Pothole</option>
                <option value="Waterlogging">Waterlogging</option>
                <option value="Damaged Road">Damaged Road</option>
                <option value="Missing Sign">Missing Traffic Sign</option>
                <option value="Broken Divider">Broken Divider</option>
                <option value="Zebra Crossing">Faded Zebra Crossing</option>
                <option value="Other">Other</option>
              </select>

              <label style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>Location</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" placeholder="Enter landmark or street" required style={{ flex: 1 }} value={locationStr} onChange={e => setLocationStr(e.target.value)} />
                <button type="button" className="btn-outline" style={{ padding: '10px' }} title="Use Current Location" onClick={() => setLocationStr('Current GPS Location')}>
                  <MapPin size={18} />
                </button>
              </div>

              <label style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>Photo / Video</label>
              <div style={{ border: '1px dashed var(--l-border)', padding: '24px', textAlign: 'center', borderRadius: '6px', marginBottom: '16px', cursor: 'pointer', background: '#fafafa' }}>
                <Camera size={24} style={{ color: 'var(--l-text-sec)', marginBottom: '8px' }} />
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--l-text-sec)' }}>Click to upload media</p>
              </div>

              <label style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>Description (Optional)</label>
              <textarea rows="2" placeholder="Additional details..." value={desc} onChange={e => setDesc(e.target.value)}></textarea>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Submit Report</button>
            </form>
          </div>

          <div className="citizen-card">
            <h3>My Reports</h3>
            <div className="issue-list">
              {reports.length === 0 && <div style={{ fontSize: '13px', color: 'var(--l-text-sec)', textAlign: 'center', padding: '20px' }}>No reports submitted yet.</div>}
              {reports.map(r => (
                <div key={r.id} className="issue-item">
                  <div>
                    <h4>{r.type}</h4>
                    <p>{r.location}</p>
                    <p style={{ marginTop: '4px', fontSize: '11px' }}>ID: {r.id} • {r.date}</p>
                  </div>
                  <div>
                    <span className={`status-badge ${r.status === 'Resolved' ? 'resolved' : (r.status === 'Under Review' || r.status === 'In Progress' || r.status === 'Assigned') ? 'review' : 'submitted'}`}>
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
