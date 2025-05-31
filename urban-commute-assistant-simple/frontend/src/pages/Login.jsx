import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/userSlice';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState(null);
  
  const { loading, error: authError, isAuthenticated } = useSelector((state) => state.user);
  
  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
    const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Simple validation
    if (!formData.username || !formData.password) {
      setError('Username and password are required');
      return;
    }
    
    try {
      const result = await dispatch(loginUser(formData));
      if (result.type === 'user/loginUser/fulfilled') {
        navigate('/');
      } else {
        setError(result.payload || 'Login failed');
      }
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Log in to Urban Commute Assistant</h2>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {(error || authError) && (
            <div className="error-message">
              {error || authError}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </div>
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
          <div className="login-footer">
          <p className="help-text">
            Enter your credentials to access the Urban Commute Assistant.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
