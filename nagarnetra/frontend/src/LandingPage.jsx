import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, MapPin, AlertTriangle, Activity, CheckCircle, Navigation2, FileWarning, ArrowRight, Video, FileText, Cpu, Map, ShieldAlert } from 'lucide-react';
import AviraLogo from './AviraLogo';
import './landing.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-layout">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <AviraLogo />
        </div>
        <div className="nav-links">
          <a href="#problem">Overview</a>
          <a href="#how-it-works">How it works</a>
          <a href="#intelligence">Urban Intelligence</a>
          <a href="#portals">For Authorities</a>
        </div>
        <div className="nav-actions">
          <button className="btn-text" onClick={() => navigate('/citizen-login')}>Citizen Access</button>
          <button className="btn-primary" onClick={() => navigate('/authority-login')}>Authority Login</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        {/* Full-bleed animated background */}
        <div className="hero-background">
          <svg viewBox="0 0 1440 650" className="hero-bg-svg" preserveAspectRatio="xMidYMid slice">
            <path d="M -100,200 C 300,50 600,450 1500,200" className="hero-road r1" />
            <path d="M 200,-50 C 400,300 800,200 1200,700" className="hero-road r2" />
            <path d="M -50,550 C 400,600 1000,300 1500,600" className="hero-road r3" />
            <path d="M 600,-50 C 700,250 1100,400 1500,50" className="hero-road r4" />
          </svg>
          <div className="hero-elements">
            <div className="hero-bus hb1"><Bus size={16} /></div>
            <div className="hero-bus hb2"><Bus size={16} /></div>
            <div className="hero-bus hb3"><Bus size={16} /></div>
            <div className="hero-event he1"><AlertTriangle size={12} /></div>
            <div className="hero-event he2"><Activity size={12} /></div>
            <div className="hero-event he3"><CheckCircle size={12} /></div>
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-label">MOBILE URBAN INTELLIGENCE</div>
          <h1 className="hero-title">Every bus can help<br />the city see.</h1>
          <p className="hero-subtitle">
            AVIRA transforms public transport fleets into mobile sensing units, helping authorities understand roads, traffic, infrastructure and incidents in near real time.
          </p>
          <div className="hero-ctas">
            <button className="btn-large btn-primary" onClick={() => navigate('/citizen-login')}>
              Explore AVIRA
            </button>
            <button className="btn-large btn-outline" onClick={() => navigate('/authority-login')}>
              Access Portal
            </button>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section id="problem" className="problem-section">
        <div className="section-header">
          <h2>Cities already have eyes.<br />They just don't always move.</h2>
          <p>Fixed cameras cover selected locations. Manual inspections cover selected roads. Public buses, however, travel across the city every day.</p>
        </div>
        
        <div className="comparison-grid">
          <div className="comp-card">
            <Video className="comp-icon" />
            <h3>FIXED CCTV</h3>
            <ul>
              <li>Limited coverage</li>
              <li>Fixed location</li>
              <li>Requires dedicated infrastructure</li>
            </ul>
          </div>
          <div className="comp-card">
            <FileText className="comp-icon" />
            <h3>MANUAL INSPECTION</h3>
            <ul>
              <li>Slow reporting</li>
              <li>Periodic observation</li>
              <li>Limited frequency</li>
            </ul>
          </div>
          <div className="comp-card">
            <ShieldAlert className="comp-icon" />
            <h3>CITIZEN REPORTS</h3>
            <ul>
              <li>Reactive</li>
              <li>Inconsistent coverage</li>
              <li>Needs verification</li>
            </ul>
          </div>
          <div className="comp-card highlight">
            <Bus className="comp-icon" />
            <h3>PUBLIC BUS FLEET</h3>
            <ul>
              <li>Existing mobility</li>
              <li>Repeated road coverage</li>
              <li>Continuous observations</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-header">
          <h2>One journey.<br />Multiple layers of intelligence.</h2>
        </div>
        <div className="process-flow">
          <div className="step">
            <div className="step-num">01</div>
            <h4>OBSERVE</h4>
            <p>Bus cameras + GPS</p>
          </div>
          <ArrowRight className="step-arrow" />
          <div className="step">
            <div className="step-num">02</div>
            <h4>UNDERSTAND</h4>
            <p>AI detects road, traffic and safety events</p>
          </div>
          <ArrowRight className="step-arrow" />
          <div className="step">
            <div className="step-num">03</div>
            <h4>VERIFY</h4>
            <p>Repeated observations and confidence scoring</p>
          </div>
          <ArrowRight className="step-arrow" />
          <div className="step">
            <div className="step-num">04</div>
            <h4>MAP</h4>
            <p>Events are attached to road segments</p>
          </div>
          <ArrowRight className="step-arrow" />
          <div className="step">
            <div className="step-num">05</div>
            <h4>ACT</h4>
            <p>Authorities receive actionable information</p>
          </div>
        </div>
      </section>

      {/* What the Fleet Can See */}
      <section id="intelligence" className="intelligence-section">
        <div className="section-header">
          <h2>A moving network of urban sensors.</h2>
        </div>
        <div className="intel-grid">
          <div className="intel-card">
            <div className="intel-icon-wrapper"><Activity className="intel-icon" /></div>
            <h3>ROAD HEALTH</h3>
            <p>Potholes, damaged roads, and waterlogging</p>
          </div>
          <div className="intel-card">
            <div className="intel-icon-wrapper"><Navigation2 className="intel-icon" /></div>
            <h3>TRAFFIC</h3>
            <p>Vehicle counts, density, and bottlenecks</p>
          </div>
          <div className="intel-card">
            <div className="intel-icon-wrapper"><Map className="intel-icon" /></div>
            <h3>INFRASTRUCTURE</h3>
            <p>Road dividers, zebra crossings, and traffic signs</p>
          </div>
          <div className="intel-card">
            <div className="intel-icon-wrapper"><AlertTriangle className="intel-icon" /></div>
            <h3>SAFETY</h3>
            <p>Pedestrian risk, near-miss situations, and hazardous areas</p>
          </div>
          <div className="intel-card">
            <div className="intel-icon-wrapper"><Cpu className="intel-icon" /></div>
            <h3>INCIDENTS</h3>
            <p>Vehicle tracking, plate extraction, and evidence</p>
          </div>
          <div className="intel-card">
            <div className="intel-icon-wrapper"><CheckCircle className="intel-icon" /></div>
            <h3>COVERAGE</h3>
            <p>Bus routes, repeated observations, and history</p>
          </div>
        </div>
      </section>

      {/* Two Portals */}
      <section id="portals" className="portals-section">
        <div className="section-header">
          <h2>One city.<br />Two ways to participate.</h2>
        </div>
        <div className="portals-container">
          <div className="portal-card citizen-portal">
            <div className="portal-content">
              <h3>CITIZEN</h3>
              <p className="portal-sub">Report. Track. Stay informed.</p>
              <ul className="portal-features">
                <li><CheckCircle size={16} /> Report a road issue</li>
                <li><CheckCircle size={16} /> Upload a photo/video</li>
                <li><CheckCircle size={16} /> Track complaint status</li>
                <li><CheckCircle size={16} /> View nearby reported issues</li>
              </ul>
            </div>
            <div className="portal-actions">
              <button className="btn-primary full-width" onClick={() => navigate('/citizen-login')}>Citizen Login</button>
              <button className="btn-outline full-width" onClick={() => navigate('/citizen-login')}>Report an Issue</button>
            </div>
          </div>
          <div className="portal-card auth-portal">
            <div className="portal-content">
              <h3>GOVERNMENT / AUTHORITY</h3>
              <p className="portal-sub">Monitor. Verify. Act.</p>
              <ul className="portal-features">
                <li><CheckCircle size={16} /> View fleet-wide events</li>
                <li><CheckCircle size={16} /> Monitor buses & GIS map</li>
                <li><CheckCircle size={16} /> Assign work orders</li>
                <li><CheckCircle size={16} /> View analytics & insights</li>
              </ul>
            </div>
            <div className="portal-actions">
              <button className="btn-primary full-width" onClick={() => navigate('/authority-login')}>Authority Login</button>
            </div>
          </div>
        </div>
      </section>

      {/* City Intelligence & Fleet Intelligence merged briefly */}
      <section className="map-preview-section">
        <div className="section-header text-center">
          <h2>From individual events<br />to a city-wide picture.</h2>
        </div>
        <div className="map-preview-container">
          <div className="map-preview-visual">
            <div className="story-container">
              <div className="demo-badge">DEMO DATA</div>
              
              <svg className="story-svg" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
                {/* Background Roads */}
                <path d="M -50,150 L 250,150 L 400,200 L 600,200 L 850,150" className="story-road" />
                <path d="M 250,150 L 150,-50" className="story-road" />
                <path d="M 400,200 L 300,450" className="story-road" />
                <path d="M 600,200 L 750,-50" className="story-road" />
                <path d="M 600,200 L 700,450" className="story-road" />

                {/* Verification Connection */}
                <path d="M 320,180 L 450,180" className="story-connect" />
              </svg>

              {/* Buses */}
              <div className="story-bus sb1"><div className="sb-dot" /><span className="sb-label">Bus 01</span></div>
              <div className="story-bus sb2"><div className="sb-dot" /><span className="sb-label">Bus 07</span></div>
              <div className="story-bus sb3"><div className="sb-dot" /><span className="sb-label">Bus 12</span></div>
              
              {/* Observations */}
              <div className="story-obs so1" />
              <div className="story-obs so2" />
              <div className="story-obs so3" />

              {/* Verified Card */}
              <div className="story-card">
                <div className="sc-top"><span className="sc-dot"></span>VERIFIED EVENT</div>
                <div className="sc-title">Pothole</div>
                <div className="sc-sub">Deccan Gymkhana · R101<br/>Observed by 3 buses</div>
                <div className="sc-badge">Verified</div>
              </div>

              {/* Texts */}
              <div className="story-text st-observe">OBSERVE</div>
              <div className="story-text st-verify">VERIFY</div>
              <div className="story-text st-understand">UNDERSTAND</div>
            </div>
          </div>
          <div className="map-metrics">
            <div className="metric">
              <span className="m-val">124</span>
              <span className="m-label">Buses Connected</span>
            </div>
            <div className="metric">
              <span className="m-val">8,432</span>
              <span className="m-label">Road Segments Observed</span>
            </div>
            <div className="metric">
              <span className="m-val">412</span>
              <span className="m-label">Active Events</span>
            </div>
            <div className="metric">
              <span className="m-val">1,204</span>
              <span className="m-label">Resolved Issues</span>
            </div>
          </div>
        </div>
      </section>

      {/* SEE WHAT THE CITY IS EXPERIENCING */}
      <section className="city-experience" style={{padding:'80px 48px',background:'var(--l-bg)'}}>
        <div className="section-header text-center" style={{marginBottom:'48px'}}>
          <h2 style={{fontSize:'32px',marginBottom:'12px'}}>See what the city is experiencing.</h2>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))',gap:'24px',maxWidth:'1200px',margin:'0 auto'}}>
          <div className="intel-card" style={{background:'var(--l-card)',border:'1px solid var(--l-border)',padding:'24px',borderRadius:'12px',boxShadow:'0 4px 12px rgba(0,0,0,0.02)'}}>
            <div style={{color:'var(--l-primary)',marginBottom:'12px'}}><Activity size={24}/></div>
            <h3 style={{fontSize:'14px',marginBottom:'8px'}}>ROAD HEALTH</h3>
            <div style={{height:'60px',borderTop:'1px solid var(--l-border)',marginTop:'16px',paddingTop:'12px'}}>
              <span className="demo-badge-small" style={{fontSize:'10px',background:'#E6F3F1',color:'var(--l-teal)',padding:'2px 6px',borderRadius:'4px'}}>89% Coverage</span>
            </div>
          </div>
          <div className="intel-card" style={{background:'var(--l-card)',border:'1px solid var(--l-border)',padding:'24px',borderRadius:'12px',boxShadow:'0 4px 12px rgba(0,0,0,0.02)'}}>
            <div style={{color:'var(--l-primary)',marginBottom:'12px'}}><Navigation2 size={24}/></div>
            <h3 style={{fontSize:'14px',marginBottom:'8px'}}>TRAFFIC</h3>
            <div style={{height:'60px',borderTop:'1px solid var(--l-border)',marginTop:'16px',paddingTop:'12px'}}>
              <span className="demo-badge-small" style={{fontSize:'10px',background:'#FDF3E8',color:'var(--l-accent)',padding:'2px 6px',borderRadius:'4px'}}>7 Hotspots</span>
            </div>
          </div>
          <div className="intel-card" style={{background:'var(--l-card)',border:'1px solid var(--l-border)',padding:'24px',borderRadius:'12px',boxShadow:'0 4px 12px rgba(0,0,0,0.02)'}}>
            <div style={{color:'var(--l-primary)',marginBottom:'12px'}}><Map size={24}/></div>
            <h3 style={{fontSize:'14px',marginBottom:'8px'}}>INFRASTRUCTURE</h3>
            <div style={{height:'60px',borderTop:'1px solid var(--l-border)',marginTop:'16px',paddingTop:'12px'}}>
              <span className="demo-badge-small" style={{fontSize:'10px',background:'#E6F3F1',color:'var(--l-teal)',padding:'2px 6px',borderRadius:'4px'}}>1,204 Verified</span>
            </div>
          </div>
          <div className="intel-card" style={{background:'var(--l-card)',border:'1px solid var(--l-border)',padding:'24px',borderRadius:'12px',boxShadow:'0 4px 12px rgba(0,0,0,0.02)'}}>
            <div style={{color:'var(--l-primary)',marginBottom:'12px'}}><AlertTriangle size={24}/></div>
            <h3 style={{fontSize:'14px',marginBottom:'8px'}}>SAFETY</h3>
            <div style={{height:'60px',borderTop:'1px solid var(--l-border)',marginTop:'16px',paddingTop:'12px'}}>
              <span className="demo-badge-small" style={{fontSize:'10px',background:'#E9F0F4',color:'var(--l-primary)',padding:'2px 6px',borderRadius:'4px'}}>Active monitoring</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="cta-content">
          <h2>Build a city that can see<br />what is changing on its roads.</h2>
          <p>AVIRA connects public transport, computer vision and civic response into one urban intelligence layer.</p>
          <div className="hero-ctas">
            <button className="btn-large btn-primary" onClick={() => navigate('/citizen-login')}>Citizen Portal</button>
            <button className="btn-large btn-outline" onClick={() => navigate('/authority-login')}>Authority Portal</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <AviraLogo />
            <p>AI-powered mobile urban intelligence</p>
            <span className="proto-badge">Prototype / Demonstration System</span>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Portals</h4>
              <a onClick={() => navigate('/citizen-login')}>Citizen Portal</a>
              <a onClick={() => navigate('/authority-login')}>Authority Portal</a>
            </div>
            <div className="link-group">
              <h4>Legal</h4>
              <a href="#">About</a>
              <a href="#">Contact</a>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
