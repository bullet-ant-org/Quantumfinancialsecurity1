import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MatrixRain from '../components/MatrixRain';
import './Auth.css';

const LOGIN_STEPS = [
  { key: 'email', title: 'Welcome back', desc: 'Enter the email linked to your vault to continue.' },
  { key: 'password', title: 'Enter your password', desc: 'For your security, confirm your password to unlock your dashboard.' },
];

const SIGNUP_STEPS = [
  { key: 'name', title: "Let's get acquainted", desc: 'Tell us your name and pick a username for your vault.' },
  { key: 'email', title: 'Where should we reach you', desc: "We'll use this email to secure your account and send important alerts." },
  { key: 'password', title: 'Lock it down', desc: 'Choose a strong password — this is the only key to your vault.' },
  { key: 'review', title: 'Review & confirm', desc: 'Double-check your details before we create your account.' },
];

const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Very weak', color: '#dc3545' },
    { label: 'Weak', color: '#e2673a' },
    { label: 'Fair', color: '#ffc107' },
    { label: 'Good', color: '#2ee6a8' },
    { label: 'Strong', color: '#00e1ff' },
    { label: 'Excellent', color: '#00e1ff' },
  ];
  return { score, ...levels[Math.min(score, levels.length - 1)] };
};

const Auth = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('form'); // 'form' | 'processing' | 'success'

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
      }, 1400);
    } catch (err) {
      setPhase('form');
      setError('Could not reach the server. Please try again.');
    }
  };

  const runRegister = async () => {
    setPhase('processing');
    setStatusText('Encrypting your vault\u2026');
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

      setStatusText('Vault created');
      setPhase('success');
      setTimeout(() => {
        switchMode('login');
        setStatusText('');
      }, 1600);
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
    <div className="auth-page">
      <Link to="/" className="back-button">
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Home
      </Link>

      <div className="auth-shell">
        <aside className="auth-visual">
          <MatrixRain active={phase !== 'form'} />
          <div className="auth-visual__scrim" />
          <div className="auth-visual__content">
            <span className="auth-visual__badge">
              <span className="material-symbols-outlined">shield_lock</span>
              Quantum Financial Security
            </span>
            <h2>Every session is a vault.</h2>
            <p>
              Your credentials never leave an encrypted channel, and your keys
              never leave your device. This is what custody should feel like.
            </p>
            <ul className="auth-visual__list">
              <li><span className="material-symbols-outlined">check_circle</span> Non-custodial by design</li>
              <li><span className="material-symbols-outlined">check_circle</span> Real-time balance sync</li>
              <li><span className="material-symbols-outlined">check_circle</span> 24/7 human support</li>
            </ul>
          </div>
        </aside>

        <div className="auth-panel">
          <div className="auth-mode-switch">
            <button
              className={mode === 'login' ? 'active' : ''}
              onClick={() => switchMode('login')}
              type="button"
            >
              Sign in
            </button>
            <button
              className={mode === 'signup' ? 'active' : ''}
              onClick={() => switchMode('signup')}
              type="button"
            >
              Create account
            </button>
          </div>

          <div className="auth-progress">
            {steps.map((s, i) => (
              <div className={`auth-progress__step ${i <= step ? 'done' : ''} ${i === step ? 'current' : ''}`} key={s.key}>
                <span className="auth-progress__dot">
                  {i < step ? <span className="material-symbols-outlined">check</span> : i + 1}
                </span>
                {i !== steps.length - 1 && <span className="auth-progress__line" />}
              </div>
            ))}
          </div>

          <div className="auth-card">
            <div className="auth-step" key={`${mode}-${step}`}>
              <p className="auth-step__eyebrow">Step {step + 1} of {steps.length}</p>
              <h1 className="auth-title">{current.title}</h1>
              <p className="auth-subtitle">{current.desc}</p>

              <form onSubmit={handleSubmit} className="auth-form">
                {mode === 'signup' && current.key === 'name' && (
                  <>
                    <div className="input-group">
                      <label htmlFor="fullName">Full name</label>
                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jordan Rivera"
                        autoFocus
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="username">Username</label>
                      <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="jordan.rivera"
                        required
                      />
                      <span className="input-hint">This is how you'll appear across the platform.</span>
                    </div>
                  </>
                )}

                {current.key === 'email' && (
                  <div className="input-group">
                    <label htmlFor="email">Email address</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoFocus
                      required
                    />
                    {mode === 'login' && (
                      <span className="input-hint">We'll ask for your password next.</span>
                    )}
                  </div>
                )}

                {mode === 'login' && current.key === 'password' && (
                  <>
                    <div className="auth-identity-chip">
                      <span className="material-symbols-outlined">mail</span>
                      {email}
                      <button type="button" onClick={goBack}>Change</button>
                    </div>
                    <div className="input-group">
                      <label htmlFor="password">Password</label>
                      <div className="input-with-action">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          autoFocus
                          required
                        />
                        <button type="button" onClick={() => setShowPassword((v) => !v)} className="input-action">
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
                    <div className="input-group">
                      <label htmlFor="password">Password</label>
                      <div className="input-with-action">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 8 characters"
                          autoFocus
                          required
                        />
                        <button type="button" onClick={() => setShowPassword((v) => !v)} className="input-action">
                          <span className="material-symbols-outlined">
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                      {password && (
                        <div className="password-strength">
                          <div className="password-strength__track">
                            <div
                              className="password-strength__fill"
                              style={{ width: `${(strength.score / 5) * 100}%`, background: strength.color }}
                            />
                          </div>
                          <span style={{ color: strength.color }}>{strength.label}</span>
                        </div>
                      )}
                    </div>
                    <div className="input-group">
                      <label htmlFor="confirmPassword">Confirm password</label>
                      <input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
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
                    <div className="review-list">
                      <div className="review-row">
                        <span>Full name</span>
                        <strong>{fullName}</strong>
                      </div>
                      <div className="review-row">
                        <span>Username</span>
                        <strong>{username}</strong>
                      </div>
                      <div className="review-row">
                        <span>Email</span>
                        <strong>{email}</strong>
                      </div>
                      <div className="review-row">
                        <span>Password</span>
                        <strong>{'•'.repeat(Math.min(password.length, 12))}</strong>
                      </div>
                    </div>
                    <label className="agree-check">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                      />
                      <span>I agree to the Terms of Service and Privacy Policy.</span>
                    </label>
                  </>
                )}

                {error && <div className="auth-message error">{error}</div>}

                <div className="auth-actions">
                  {step > 0 && (
                    <button type="button" className="auth-button auth-button--ghost" onClick={goBack}>
                      Back
                    </button>
                  )}
                  <button type="submit" className="auth-button">
                    {current.key === 'review' ? 'Create account'
                      : mode === 'login' && current.key === 'password' ? 'Sign in'
                      : 'Continue'}
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </form>
            </div>

            {phase !== 'form' && (
              <div className="auth-overlay">
                <MatrixRain active className="auth-overlay__rain" />
                <div className="auth-overlay__content">
                  {phase === 'processing' && <div className="auth-overlay__spinner" />}
                  {phase === 'success' && (
                    <span className="auth-overlay__check material-symbols-outlined">check_circle</span>
                  )}
                  <p>{statusText}</p>
                </div>
              </div>
            )}
          </div>

          <div className="auth-footer">
            {mode === 'login' ? (
              <p>Don't have an account? <button type="button" onClick={() => switchMode('signup')} className="auth-link">Create one</button></p>
            ) : (
              <p>Already have an account? <button type="button" onClick={() => switchMode('login')} className="auth-link">Sign in</button></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
