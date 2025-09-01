import React, { useState } from 'react';
import './Login.css';
import bannerImage from '../../assets/img/banner4.png';
import logoImage from '../../assets/img/20250701_wala_logo_02 1.png';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate login logic
      if (formData.email === 'admin@cockfighting.com' && formData.password === 'admin123') {
        alert('Login successful! Welcome to Cock Fighting LiveStream.');
        // Here you would typically redirect to dashboard
      } else {
        setError('Invalid email or password. Try admin@cockfighting.com / admin123');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-split">
        {/* Left Section - Image/Branding */}
        <div className="login-left-section">
          <img 
            src={bannerImage} 
            alt="Cock Fighting Banner" 
            className="login-banner-image"
          />
          <div className="image-overlay">
            <div className="overlay-content">
              <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: '1rem', fontWeight: 'bold' }}>
                Cock Fighting LiveStream
              </h2>
              <p style={{ color: 'white', fontSize: '1.1rem', opacity: 0.9 }}>
                Experience the thrill of live cock fighting matches
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="login-form-section">
          <div className="login-card">
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <img 
                src={logoImage} 
                alt="Wala Logo" 
                style={{
                  height: '60px',
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
              />
            </div>
            


            {error && (
              <div style={{
                backgroundColor: '#fed7d7',
                color: '#c53030',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                marginBottom: '1rem',
                border: '1px solid #feb2b2'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="login-label" style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#374151',
                  fontFamily: 'Poppins, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
                }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled={isLoading}
                  className="login-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    color: '#374151',
                    outline: 'none',
                    fontFamily: 'Poppins, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="login-label" style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#374151',
                  fontFamily: 'Poppins, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
                }}>
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className="login-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    color: '#374151',
                    outline: 'none',
                    fontFamily: 'Poppins, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#4a5568'
                }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="login-checkbox"
                    style={{ marginRight: '0.5rem' }}
                  />
                  Remember me
                </label>
                <a href="#" className="login-link" style={{
                  color: '#3182ce',
                  textDecoration: 'none',
                  fontSize: '0.9rem'
                }}>
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="login-button"
                data-loading={isLoading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  backgroundColor: isLoading ? '#a0aec0' : '#3182ce',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  marginBottom: '1rem',
                  fontFamily: 'Poppins, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              <div style={{ textAlign: 'center', color: '#718096', fontSize: '0.9rem' }}>
                Don't have an account?{' '}
                <a href="#" className="login-link" style={{ color: '#3182ce', textDecoration: 'none' }}>
                  Sign up here
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;