import React, { useState } from 'react';
import styles from './LoginStep.module.css';

export default function LoginStep({ onLogin, onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    // Simulate authentication
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Demo: accept any valid email/password combination
      onLogin({ email, userName: email.split('@')[0] });
    }, 1000);
  };

  const handleRegister = () => {
    setError('');
    if (typeof onRegister === 'function') {
      onRegister();
      return;
    }

    setError('Registration flow is not configured yet. Please contact administrator.');
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        {/* Header with Logo and Branding */}
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <svg 
              viewBox="0 0 120 120" 
              xmlns="http://www.w3.org/2000/svg"
              className={styles.logo}
            >
              {/* Background circle */}
              <circle cx="60" cy="60" r="55" fill="#ffffff" opacity="0.1" />
              
              {/* Main tooth - filled */}
              <path
                d="M 50 25 C 45 25 40 30 40 40 L 40 75 C 40 85 48 95 60 100 C 72 95 80 85 80 75 L 80 40 C 80 30 75 25 70 25 C 65 25 60 20 60 20 C 60 20 55 25 50 25 Z"
                fill="#ffffff"
                stroke="#0f172a"
                strokeWidth="1.5"
              />
              
              {/* Highlight on tooth */}
              <ellipse cx="55" cy="45" rx="5" ry="10" fill="#0f172a" opacity="0.15" />
              
              {/* Stent/Shield accent */}
              <path
                d="M 45 70 L 75 70"
                stroke="#00c99c"
                strokeWidth="3"
                strokeLinecap="round"
              />
              
              {/* DNA helix lines */}
              <path
                d="M 50 80 Q 60 85 70 80"
                stroke="#1ed7c3"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 50 88 Q 60 93 70 88"
                stroke="#1ed7c3"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className={styles.brandName}>kallisio</h1>
          <p className={styles.subtitle}>Stentra Design System </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.loginBtn}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Register Option */}
        <div className={styles.divider}>or</div>
        
        <button
          type="button"
          className={styles.demoBtn}
          onClick={handleRegister}
          disabled={isLoading}
        >
          Register
        </button>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Kallisio Inc. proprietary & confidential
          </p>
        </div>
      </div>

      {/* Background accent */}
      <div className={styles.bgAccent}></div>
    </div>
  );
}
