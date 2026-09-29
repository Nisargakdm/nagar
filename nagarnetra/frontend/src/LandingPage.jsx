import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, MapPin, AlertTriangle, Activity, CheckCircle, Navigation2, FileWarning, ArrowRight, Video, FileText, Cpu, Map, ShieldAlert } from 'lucide-react';
import './landing.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-layout">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <span className="brand-logo">
            <Navigation2 className="brand-icon" />
          </span>
          <span className="brand-text">Nagar<b>Netra</b></span>
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
        <div className="hero-content">
          <div className="hero-label">MOBILE URBAN INTELLIGENCE</div>
          <h1 className="hero-title">Every bus can help<br />the city see.</h1>
          <p className="hero-subtitle">
            NagarNetra transforms public transport fleets into mobile sensing units, helping authorities understand roads, traffic, infrastructure and incidents in near real time.
          </p>
          <div className="hero-ctas">
            <button className="btn-large btn-primary" onClick={() => navigate('/citizen-login')}>
              Explore NagarNetra
            </button>
            <button className="btn-large btn-outline" onClick={() => navigate('/authority-login')}>
              Access Portal
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="map-simulation">
            {/* Minimal SVG path for road */}
            <svg viewBox="0 0 400 400" className="map-svg">
              <path d="M 50,350 C 100,200 200,300 350,50" className="road-path" />
              <path d="M 50,50 C 150,150 250,100 350,350" className="road-path" />
            </svg>
            
            {/* Moving Bus Marker */}
            <div className="bus-marker">
              <Bus size={20} />
            </div>

            {/* Event Markers */}
            <div className="event-marker e-pothole">
              <AlertTriangle size={14} />
            </div>
            <div className="event-marker e-traffic">
              <Activity size={14} />
            </div>
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
            <div className="fake-map">
              <div className="demo-badge">DEMO DATA</div>
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

      {/* Final CTA */}
      <section className="final-cta">
        <div className="cta-content">
          <h2>Build a city that can see<br />what is changing on its roads.</h2>
          <p>NagarNetra connects public transport, computer vision and civic response into one urban intelligence layer.</p>
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
            <Navigation2 size={24} />
            <span className="brand-text">Nagar<b>Netra</b></span>
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
