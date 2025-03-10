import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const NavBar = ({ handleLogout }) => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/manage-users" className="nav-link">Manage Users</Link>
        <Link to="/credentials" className="nav-link">Manage Credentials</Link>
      </div>
      <div className="nav-right">
        <button onClick={handleLogout} className="logout-btn">Log Out</button>
      </div>
    </nav>
  );
};

export default NavBar;
