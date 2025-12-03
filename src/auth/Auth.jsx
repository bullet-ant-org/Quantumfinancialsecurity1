import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';
import SecuritySetupModal from './SecuritySetupModal';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, sum: 0 });
  const [captchaInput, setCaptchaInput] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 6); // 0-5
    const num2 = Math.floor(Math.random() * (10 - num1)); // Ensure sum <= 10
    setCaptcha({ num1, num2, sum: num1 + num2 });
    setCaptchaInput('');
  };

  const handleSuccess = (message) => {
    console.log(message);
    setError(message);
  }

  const register = async () => {
    setIsLoading(true);
    console.log('Registering with:', { username, email, password, fullName: username });
    const response = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, fullName: username }),
    });
    const data = await response.json();
    console.log('Registration response:', { status: response.status, data });

    if (response.ok) {
      setShowSecurityModal(true);
    } else {
      setError(data.message || 'Signup failed.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, [isLogin]);

  const handleModalClose = () => {
    setShowSecurityModal(false);
    handleSuccess('Signup was successful! Please login.');
    setIsLogin(true);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const login = async () => {
    setIsLoading(true);
    console.log('Logging in with:', { email, password });
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('Login response:', { status: response.status, data });

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      handleSuccess('Login was successful!');
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } else {
      setError(data.message || 'Login failed.');
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (parseInt(captchaInput, 10) !== captcha.sum) {
      setError('Incorrect captcha. Please try again.');
      generateCaptcha();
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!isLogin && password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (isLogin) {
      await login();
    } else {
      await register();
    }
  };

  return (
    <div className="auth-page">
      {showSecurityModal && <SecuritySetupModal onClose={handleModalClose} />}
      <Link to="/" className="back-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="back-button-icon">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Back to Home
      </Link>
      <div className="auth-wrapper">
        <div className="auth-image-container">
          <img src="https://thumbs.dreamstime.com/b/d-illustration-male-guy-qadir-holding-phone-mobile-screen-transparent-background-mockup-d-illustration-male-guy-qadir-391374366.jpg" alt="Person using a phone" />
        </div>
        <div className="auth-form-container">
          <div className="auth-container">
            <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="auth-subtitle">{isLogin ? 'Login to continue your journey.' : 'Join us and secure your future.'}</p>
            <form onSubmit={handleSubmit}>
              
              {!isLogin && (
                <div className="input-group">
                  <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                  <label htmlFor="username">Username</label>
                </div>
              )}

              <div className="input-group">
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <label htmlFor="email">Email</label>
              </div>

              <div className="input-group">
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <label htmlFor="password">Password</label>
              </div>

              {!isLogin && (
                <div className="input-group">
                  <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  <label htmlFor="confirmPassword">Confirm Password</label>
                </div>
              )}
              

              <div className="captcha-group">
                <label htmlFor="captcha">What is {captcha.num1} + {captcha.num2}?</label>
                <input
                  type="number"
                  id="captcha"
                  className="captcha-input"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  required
                />
                 <button type="button" className="captcha-refresh-button" onClick={generateCaptcha}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="captcha-refresh-icon">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <polyline points="1 20 1 14 7 14"></polyline>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14a9 9 0 0 0 16.5 3.36L17 14"></path>
                      </svg>
                 </button>
              </div>


              {error && <p className="error-message">{error}</p>}



              <button 
                type="submit" 
                className="auth-button"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : (isLogin ? 'Login' : 'Create Account')}
              </button>
            </form>
            <div className="toggle-form">
              <p>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <span onClick={toggleForm}>
                  {isLogin ? ' Sign Up' : ' Login'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;