import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import CredentialManager from './components/CredentialManager';
import UserManager from './components/UserManager';
import NavBar from './components/NavBar'; // Import the new NavBar

import './App.css';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const navigate = useNavigate(); // Now this works, as we're inside Router

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const expirationTime = decodedToken.exp * 1000;
        if (Date.now() > expirationTime) {
          setIsTokenExpired(true);
          localStorage.removeItem('token');
          setToken(null);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        setToken(null);
        setIsTokenExpired(true);
      }
    }
  }, [token]);

  const handleLogin = (token) => {
    setToken(token);
    localStorage.setItem('token', token);
  };

  const handleRegister = (token) => {
    setToken(token);
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    navigate('/'); // Redirect to home page
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      {token && !isTokenExpired && <NavBar handleLogout={handleLogout} />}
      <h1 className="text-4xl font-semibold text-center text-blue-600 mb-8">CoolTech CredVault</h1>
      
      <Routes>
        <Route path="/" element={
          isTokenExpired || !token ? (
            <div className="flex flex-col items-center space-y-6">
              <LoginForm onLogin={handleLogin} />
              <RegisterForm onRegister={handleRegister} />
            </div>
          ) : (
            <Navigate to="/manage-users" /> // Redirect to a main authenticated page
          )
        } />

        <Route path="/credentials" element={token && !isTokenExpired ? (
          <CredentialManager token={token} handleLogout={handleLogout} />
        ) : (
          <Navigate to="/" />
        )} />

        <Route path="/manage-users" element={token && !isTokenExpired ? (
          <UserManager handleLogout={handleLogout} />
        ) : (
          <Navigate to="/" />
        )} />
      </Routes>
    </div>
  );
};

export default App;
