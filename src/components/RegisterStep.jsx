import React, { useState } from 'react';
import styles from './RegisterStep.module.css';

export default function RegisterStep({ onRegisterSuccess, onBackToLogin }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (typeof onRegisterSuccess === 'function') {
        onRegisterSuccess({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          userName: firstName.trim(),
        });
      }
    }, 900);
  };

  return (
    <div className={styles.container}>
      <div className={styles.registerCard}>
        <div className={styles.header}>
          <h1 className={styles.brandName}>Create Account</h1>
          <p className={styles.subtitle}>Demo registration for Dental CAD Viewer</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.nameRow}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.label}>First Name</label>
              <input
                id="firstName"
                type="text"
                className={styles.input}
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isLoading}
                autoComplete="given-name"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastName" className={styles.label}>Last Name</label>
              <input
                id="lastName"
                type="text"
                className={styles.input}
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isLoading}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="reg-email" className={styles.label}>Email Address</label>
            <input
              id="reg-email"
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
            <label htmlFor="reg-password" className={styles.label}>Password</label>
            <input
              id="reg-password"
              type="password"
              className={styles.input}
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={onBackToLogin}
          disabled={isLoading}
        >
          Back to Login
        </button>
      </div>

      <div className={styles.bgAccent}></div>
    </div>
  );
}
