import React, { useState } from 'react';
import { loginUser } from '../services/api';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await loginUser({ username, password });
      const { token, user } = response; // Now you have both token and user details
      
      // Store token and user data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user)); // Store user data as a string
      
      onLogin(token, user); // Pass both token and user to parent
    } catch (error) {
      setError(error.message || 'Login failed');
    }
  };
  
  

  return (
    <div>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="Username" 
          required 
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          required 
        />
        <button type="submit">Log In</button>
      </form>
    </div>
  );
};

export default LoginForm;
