import React, { useState } from 'react';
import axios from 'axios';

const Auth = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check for admin login
    if (username === 'admin' && password === '123') {
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('token', 'admin-token'); // Simple admin token
      onLogin('admin-token', true);
      return;
    }

    try {
      if (isRegistering) {
        // Don't allow registration with admin username
        if (username === 'admin') {
          setError('Username not allowed');
          return;
        }
        await axios.post('http://localhost:5001/api/auth/register', {
          username,
          password
        });
        setIsRegistering(false);
      } else {
        const response = await axios.post('http://localhost:5001/api/auth/login', {
          username,
          password
        });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('isAdmin', 'false');
        onLogin(response.data.token, false);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div className="auth-container">
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">
          {isRegistering ? 'Register' : 'Login'}
        </button>
      </form>
      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Switch to Login' : 'Switch to Register'}
      </button>
    </div>
  );
};

export default Auth;
