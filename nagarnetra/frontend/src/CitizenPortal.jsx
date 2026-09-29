import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation2, LogOut, MapPin, Camera, AlertTriangle } from 'lucide-react';
import './landing.css';

export default function CitizenPortal() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([
    { id: 'RPT-842', type: 'Pothole', location: 'MG Road, near Metro', status: 'Under Review', date: 'Oct 2' },
    { id: 'RPT-791', type: 'Broken Divider', location: 'FC Road', status: 'Resolved', date: 'Sep 28' },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Report submitted successfully! (Demo)');
  };

  return (
    <div className="citizen-layout">
      <header className="citizen-header">
        <div className="nav-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <span className="brand-logo"><Navigation2 className="brand-icon" /></span>
          <span className="brand-text">Nagar<b>Netra</b> Citizen</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>Welcome, Citizen</span>
          <button className="btn-outline" style={{ padding: '6px 12px', display: 'flex', gap: '6px', alignItems: 'center' }} onClick={() => navigate('/')}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <main className="citizen-main">
        {/* Left Column: Report Form */}
        <div>
          <div className="citizen-card">
            <h3>Report an Issue</h3>
            <form className="issue-form" onSubmit={handleSubmit}>
              <label style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>Issue Type</label>
              <select required>
                <option value="">Select an issue type...</option>
                <option value="pothole">Pothole</option>
                <option value="waterlogging">Waterlogging</option>
                <option value="damaged-road">Damaged Road</option>
                <option value="missing-sign">Missing Traffic Sign</option>
                <option value="broken-divider">Broken Divider</option>
                <option value="zebra-crossing">Faded Zebra Crossing</option>
                <option value="other">Other</option>
              </select>

              <label style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>Location</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" placeholder="Enter landmark or street" required style={{ flex: 1 }} />
                <button type="button" className="btn-outline" style={{ padding: '10px' }} title="Use Current Location">
                  <MapPin size={18} />
                </button>
              </div>

              <label style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>Photo / Video</label>
              <div style={{ border: '1px dashed var(--l-border)', padding: '24px', textAlign: 'center', borderRadius: '6px', marginBottom: '16px', cursor: 'pointer', background: '#fafafa' }}>
                <Camera size={24} style={{ color: 'var(--l-text-sec)', marginBottom: '8px' }} />
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--l-text-sec)' }}>Click to upload media</p>
              </div>

              <label style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>Description (Optional)</label>
              <textarea rows="3" placeholder="Additional details..."></textarea>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Submit Report</button>
            </form>
          </div>
        </div>

        {/* Right Column: Status & Reports */}
        <div>
          <div className="citizen-card">
            <h3>Nearby City Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f9f9f9', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} style={{ color: 'var(--l-accent)' }} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Road Condition</span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--l-accent)', fontWeight: '600' }}>3 Issues Nearby</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f9f9f9', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Navigation2 size={16} style={{ color: 'var(--l-primary)' }} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Traffic</span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--l-text-sec)' }}>Normal Flow</span>
              </div>
            </div>
          </div>

          <div className="citizen-card">
            <h3>My Reports</h3>
            <div className="issue-list">
              {reports.map(r => (
                <div key={r.id} className="issue-item">
                  <div>
                    <h4>{r.type}</h4>
                    <p>{r.location}</p>
                    <p style={{ marginTop: '4px', fontSize: '11px' }}>ID: {r.id} • {r.date}</p>
                  </div>
                  <div>
                    <span className={`status-badge ${r.status === 'Resolved' ? 'resolved' : r.status === 'Under Review' ? 'review' : 'submitted'}`}>
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
