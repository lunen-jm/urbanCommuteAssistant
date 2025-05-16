import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/userSlice';
import './Header.css';

const Header = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const isAuthenticated = user.isAuthenticated;

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">Urban Commute Assistant</Link>
        </div>
        
        <nav className="main-nav">
          <ul>
            <li>
              <Link to="/">Dashboard</Link>
            </li>
            {isAuthenticated && (
              <li>
                <Link to="/settings">Settings</Link>
              </li>
            )}
          </ul>
        </nav>
        
        <div className="auth-nav">
          {isAuthenticated ? (
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link to="/login" className="login-button">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
