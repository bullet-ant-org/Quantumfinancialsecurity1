import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/qfs.png';
import './Auth.css';

const LOGIN_STEPS = [
  { key: 'email', title: 'Sign in', desc: 'Use your Quantum Financial Security account.' },
  { key: 'password', title: 'Welcome back', desc: 'Enter your password to continue.' },
];

const SIGNUP_STEPS = [
  { key: 'name', title: 'Create your account', desc: 'Tell us your name and pick a username.' },
  { key: 'email', title: 'Add your email', desc: "We'll use this to secure your account and send alerts." },
  { key: 'password', title: 'Create a password', desc: 'Use at least 8 characters with a mix of letters and numbers.' },
  { key: 'review', title: 'Review your details', desc: 'Make sure everything looks right before you continue.' },
];

const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Very weak', color: '#d93025' },
    { label: 'Weak', color: '#ea8600' },
    { label: 'Fair', color: '#f9ab00' },
    { label: 'Good', color: '#1e8e3e' },
    { label: 'Strong', color: '#1a73e8' },
    { label: 'Excellent', color: '#1a73e8' },
  ];
  return { score, ...levels[Math.min(score, levels.length - 1)] };
};

const Auth = () => {
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('form');

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [statusText, setStatusText] = useState('');

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const steps = mode === 'login' ? LOGIN_STEPS : SIGNUP_STEPS;
  const current = steps[step];
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const resetAll = () => {
    setStep(0);
    setPhase('form');
    setError('');
    setStatusText('');
    setPassword('');
    setConfirmPassword('');
    setAgreed(false);
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    resetAll();
    if (nextMode === 'login') setUsername('');
  };

  const validateStep = () => {
    setError('');
    if (mode === 'signup') {
      if (current.key === 'name') {
        if (!fullName.trim() || !username.trim()) {
          setError('Please fill in both fields to continue.');
          return false;
        }
        if (username.trim().length < 3) {
          setError('Username must be at least 3 characters.');
          return false;
        }
      }
      if (current.key === 'email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setError('Enter a valid email address.');
          return false;
        }
      }
      if (current.key === 'password') {
        if (password.length < 8) {
          setError('Password must be at least 8 characters long.');
          return false;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return false;
        }
      }
    } else {
      if (current.key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Enter a valid email address.');
        return false;
      }
      if (current.key === 'password' && !password) {
        setError('Enter your password.');
        return false;
      }
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const goBack = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  };

  const runLogin = async () => {
    setPhase('processing');
    setStatusText('Verifying credentials\u2026');
    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setPhase('form');
        setError(data.message || 'Login failed.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setStatusText('Access granted');
      setPhase('success');
      setTimeout(() => {
        navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
      }, 1000);
    } catch (err) {
      setPhase('form');
      setError('Could not reach the server. Please try again.');
    }
  };

  const runRegister = async () => {
    setPhase('processing');
    setStatusText('Creating your account\u2026');
    try {
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, fullName }),
      });
      const data = await response.json();

      if (!response.ok) {
        setPhase('form');
        setError(data.message || 'Registration failed.');
        return;
      }

      setStatusText('Account created');
      setPhase('success');
      setTimeout(() => {
        switchMode('login');
        setStatusText('');
      }, 1200);
    } catch (err) {
      setPhase('form');
      setError('Could not reach the server. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    const isLastStep = step === steps.length - 1;

    if (mode === 'signup' && current.key === 'review') {
      if (!agreed) {
        setError('Please agree to the terms to continue.');
        return;
      }
      await runRegister();
      return;
    }

    if (mode === 'login' && current.key === 'password') {
      await runLogin();
      return;
    }

    if (!isLastStep) goNext();
  };

  return (
    <div className="gauth-page">
      <div className="gauth-card">
        {phase !== 'form' && (
          <div className="gauth-overlay">
            {phase === 'processing' && <div className="gauth-spinner" />}
            {phase === 'success' && <span className="material-symbols-outlined gauth-check">check_circle</span>}
            <p>{statusText}</p>
          </div>
        )}

        <div className="gauth-brand">
          <img src={logo} alt="QuantumFS" />
        </div>

        <div className="gauth-progress">
          {steps.map((s, i) => (
            <span key={s.key} className={`gauth-progress__dot ${i <= step ? 'done' : ''}`} />
          ))}
        </div>

        <h1 className="gauth-title">{current.title}</h1>
        <p className="gauth-subtitle">{current.desc}</p>

        <form onSubmit={handleSubmit} className="gauth-form" autoComplete="off">
          {mode === 'signup' && current.key === 'name' && (
            <>
              <div className="gauth-field">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="off"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jordan Rivera"
                  autoFocus
                  required
                />
              </div>
              <div className="gauth-field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="jordan.rivera"
                  required
                />
              </div>
            </>
          )}

          {current.key === 'email' && (
            <div className="gauth-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoFocus
                required
              />
            </div>
          )}

          {mode === 'login' && current.key === 'password' && (
            <>
              <div className="gauth-identity-chip">
                <span className="material-symbols-outlined">mail</span>
                {email}
                <button type="button" onClick={goBack}>Change</button>
              </div>
              <div className="gauth-field">
                <label htmlFor="password">Password</label>
                <div className="gauth-field__input-row">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="off"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoFocus
                    required
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="gauth-field__toggle">
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}

          {mode === 'signup' && current.key === 'password' && (
            <>
              <div className="gauth-field">
                <label htmlFor="password">Password</label>
                <div className="gauth-field__input-row">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="off"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoFocus
                    required
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="gauth-field__toggle">
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {password && (
                  <div className="gauth-strength">
                    <div className="gauth-strength__track">
                      <div
                        className="gauth-strength__fill"
                        style={{ width: `${(strength.score / 5) * 100}%`, background: strength.color }}
                      />
                    </div>
                    <span style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                )}
              </div>
              <div className="gauth-field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="off"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                />
              </div>
            </>
          )}

          {mode === 'signup' && current.key === 'review' && (
            <>
              <div className="gauth-review">
                <div className="gauth-review__row">
                  <span>Full name</span>
                  <strong>{fullName}</strong>
                </div>
                <div className="gauth-review__row">
                  <span>Username</span>
                  <strong>{username}</strong>
                </div>
                <div className="gauth-review__row">
                  <span>Email</span>
                  <strong>{email}</strong>
                </div>
              </div>
              <label className="gauth-agree">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span>I agree to the Terms of Service and Privacy Policy.</span>
              </label>
            </>
          )}

          {error && <div className="gauth-error">{error}</div>}

          <div className="gauth-actions">
            {mode === 'signup' && step === 0 ? (
              <Link to="/" className="gauth-btn gauth-btn--text">Cancel</Link>
            ) : step > 0 ? (
              <button type="button" className="gauth-btn gauth-btn--text" onClick={goBack}>Back</button>
            ) : (
              <button type="button" className="gauth-btn gauth-btn--text" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}>
                {mode === 'login' ? 'Create account' : 'Sign in instead'}
              </button>
            )}
            <button type="submit" className="gauth-btn gauth-btn--primary">
              {current.key === 'review' ? 'Create account'
                : mode === 'login' && current.key === 'password' ? 'Sign in'
                : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
