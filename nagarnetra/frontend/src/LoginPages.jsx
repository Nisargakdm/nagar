import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation2, Shield } from 'lucide-react';
import './landing.css';

export function CitizenLogin() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/citizen');
  };

  return (
    <div className="auth-layout" style={{ position: 'relative', display: 'flex' }}>
      <button className="btn-text auth-back" onClick={() => navigate('/')}>
        <ArrowLeft size={16} /> Back to Home
      </button>
      
      <div className="auth-box">
        <div className="auth-header">
          <Navigation2 size={32} style={{ color: 'var(--l-accent)', margin: '0 auto 16px auto' }} />
          <h2>Citizen Access</h2>
          <p>Login or register to report issues</p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="auth-form-group">
            <label>Mobile Number or Email</label>
            <input type="text" placeholder="Enter your mobile or email" required />
          </div>
          <div className="auth-form-group">
            <label>Password or OTP</label>
            <input type="password" placeholder="Enter password or OTP" required />
          </div>
          <button type="submit" className="btn-primary full-width" style={{ marginTop: '12px' }}>
            Login / Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export function AuthorityLogin() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/command-center');
  };

  return (
    <div className="auth-layout" style={{ position: 'relative', display: 'flex' }}>
      <button className="btn-text auth-back" onClick={() => navigate('/')}>
        <ArrowLeft size={16} /> Back to Home
      </button>
      
      <div className="auth-box" style={{ borderTop: '4px solid var(--l-primary)' }}>
        <div className="auth-header">
          <Shield size={32} style={{ color: 'var(--l-primary)', margin: '0 auto 16px auto' }} />
          <h2>Authority Portal</h2>
          <p>Official Government Access</p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="auth-form-group">
            <label>Official ID / Email</label>
            <input type="text" placeholder="name@gov.in" required />
          </div>
          <div className="auth-form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn-primary full-width" style={{ marginTop: '12px', background: 'var(--l-primary)' }}>
            Secure Login
          </button>
        </form>
      </div>
    </div>
  );
}
