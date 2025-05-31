import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BackButton from '../components/BackButton/BackButton';
import './ProfilePage.css';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', address: '', type: 'other' });
  const [showAddForm, setShowAddForm] = useState(false);

  const user = useSelector(state => state.user?.data || {
    name: 'Alex Chen',
    email: 'alex.chen@email.com',
    avatar: '👤',
    preferences: {
      theme: 'auto',
      notifications: true,
      units: 'metric'
    }
  });

  const savedLocations = useSelector(state => state.locations?.saved || [
    { id: 1, name: 'Home', address: '123 Downtown Ave', type: 'home', favorite: true },
    { id: 2, name: 'Work', address: '456 Tech District St', type: 'work', favorite: true },
    { id: 3, name: 'Gym', address: '789 Fitness Blvd', type: 'other', favorite: false },
    { id: 4, name: 'Coffee Shop', address: '321 Main St', type: 'other', favorite: true },
    { id: 5, name: 'Airport', address: 'Terminal 1, City Airport', type: 'other', favorite: false }
  ]);

  const handleAddLocation = () => {    if (newLocation.name && newLocation.address) {
      // In real app, dispatch action to add location
      // console.log('Adding location:', newLocation);
      setNewLocation({ name: '', address: '', type: 'other' });
      setShowAddForm(false);
    }
  };

  const toggleFavorite = (locationId) => {
    // In real app, dispatch action to toggle favorite
    // console.log('Toggling favorite for location:', locationId);
  };

  const deleteLocation = (locationId) => {
    // In real app, dispatch action to delete location
    // console.log('Deleting location:', locationId);
  };
  return (
    <div className="profile-container">
      <BackButton variant="default" />
      {/* Header */}
      <header className="profile-header">
        <div className="header-background"></div>
        <div className="header-content">
          <BackButton />
          <h1>Profile</h1>
          <button 
            className="edit-button"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Done' : 'Edit'}
          </button>
        </div>
      </header>

      {/* User Info Section */}
      <div className="user-section">
        <div className="user-card">
          <div className="user-avatar">
            <span className="avatar-icon">{user.avatar}</span>
            {isEditing && <div className="avatar-edit">📷</div>}
          </div>
          <div className="user-info">
            <h2 className="user-name">{user.name}</h2>
            <p className="user-email">{user.email}</p>
            <div className="user-stats">
              <div className="stat-item">
                <span className="stat-value">{savedLocations.length}</span>
                <span className="stat-label">Saved Places</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">127</span>
                <span className="stat-label">Trips</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">45min</span>
                <span className="stat-label">Avg Commute</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Locations Section */}
      <div className="locations-section">
        <div className="section-header">
          <h3>Saved Locations</h3>
          <button 
            className="add-button"
            onClick={() => setShowAddForm(true)}
          >
            + Add
          </button>
        </div>

        {/* Add Location Form */}
        {showAddForm && (
          <div className="add-form-overlay">
            <div className="add-form">
              <div className="form-header">
                <h4>Add New Location</h4>
                <button 
                  className="close-button"
                  onClick={() => setShowAddForm(false)}
                >
                  ×
                </button>
              </div>
              <div className="form-content">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                    placeholder="e.g., Home, Work, Gym"
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={newLocation.address}
                    onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                    placeholder="Enter full address"
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={newLocation.type}
                    onChange={(e) => setNewLocation({...newLocation, type: e.target.value})}
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button className="cancel-button" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </button>
                  <button className="save-button" onClick={handleAddLocation}>
                    Save Location
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Locations List */}
        <div className="locations-list">
          {savedLocations.map(location => (
            <div key={location.id} className="location-card">
              <div className="location-icon">
                {location.type === 'home' && '🏠'}
                {location.type === 'work' && '🏢'}
                {location.type === 'other' && '📍'}
              </div>
              <div className="location-info">
                <h4 className="location-name">{location.name}</h4>
                <p className="location-address">{location.address}</p>
              </div>
              <div className="location-actions">
                <button
                  className={`favorite-button ${location.favorite ? 'active' : ''}`}
                  onClick={() => toggleFavorite(location.id)}
                >
                  {location.favorite ? '⭐' : '☆'}
                </button>
                {isEditing && (
                  <button
                    className="delete-button"
                    onClick={() => deleteLocation(location.id)}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Section */}
      <div className="settings-section">
        <div className="section-header">
          <h3>Preferences</h3>
        </div>
        
        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-icon">🌙</span>
              <div className="setting-text">
                <span className="setting-name">Theme</span>
                <span className="setting-value">Auto</span>
              </div>
            </div>
            <div className="setting-control">
              <select value={user.preferences.theme}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-icon">🔔</span>
              <div className="setting-text">
                <span className="setting-name">Notifications</span>
                <span className="setting-value">Enabled</span>
              </div>
            </div>
            <div className="setting-control">
              <label className="toggle">
                <input type="checkbox" checked={user.preferences.notifications} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-icon">📏</span>
              <div className="setting-text">
                <span className="setting-name">Units</span>
                <span className="setting-value">Metric</span>
              </div>
            </div>
            <div className="setting-control">
              <select value={user.preferences.units}>
                <option value="metric">Metric</option>
                <option value="imperial">Imperial</option>
              </select>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-icon">🔄</span>
              <div className="setting-text">
                <span className="setting-name">Auto Refresh</span>
                <span className="setting-value">Every 5 minutes</span>
              </div>
            </div>
            <div className="setting-control">
              <select>
                <option value="1">1 minute</option>
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="0">Manual</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="action-card">
          <span className="action-icon">📊</span>
          <span className="action-text">View Analytics</span>
        </button>
        <button className="action-card">
          <span className="action-icon">📤</span>
          <span className="action-text">Export Data</span>
        </button>
        <button className="action-card">
          <span className="action-icon">❓</span>
          <span className="action-text">Help & Support</span>
        </button>
        <button className="action-card logout">
          <span className="action-icon">🚪</span>
          <span className="action-text">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
