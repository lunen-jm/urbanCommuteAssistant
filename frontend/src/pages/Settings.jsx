import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile, addSavedLocation, updateSavedLocation, deleteSavedLocation } from '../store/userSlice';
import BackButton from '../components/BackButton/BackButton';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  
  const [formData, setFormData] = useState({
    userName: user.name || '',
    theme: user.preferences?.theme || 'dark',
    transitTypes: user.preferences?.transitTypes || ['bus', 'rail'],
    homeAddress: '',
    workAddress: '',
    morningStart: user.preferences?.commuteTimes?.morningStart || '08:00',
    morningEnd: user.preferences?.commuteTimes?.morningEnd || '09:30',
    eveningStart: user.preferences?.commuteTimes?.eveningStart || '17:00',
    eveningEnd: user.preferences?.commuteTimes?.eveningEnd || '18:30',
  });
  
  const [saved, setSaved] = useState(false);
  const [savedLocations, setSavedLocations] = useState(user.savedLocations || []);
  const [isEditingLocations, setIsEditingLocations] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', address: '', type: 'other' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Add validation helper
  const validateLocation = (location) => {
    return location.name?.trim() && 
           location.address?.trim() && 
           typeof location.lat === 'number' && 
           typeof location.lng === 'number' &&
           location.lat >= -90 && location.lat <= 90 &&
           location.lng >= -180 && location.lng <= 180;
  };

  // Add geocoding function
  const geocodeAddress = async (address) => {
    try {
      // Using a free geocoding service (Nominatim) - you can replace with TomTom if you have an API key
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
    }
    // Fallback to Seattle coordinates
    return { lat: 47.6062, lng: -122.3321 };
  };

  // Generate better ID instead of timestamp
  const generateId = () => {
    return 'loc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const getUserInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };// Sync local savedLocations with Redux store
  useEffect(() => {
    if (user.savedLocations) {
      setSavedLocations(user.savedLocations);
    }
  }, [user.savedLocations]);
    const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const transitTypes = [...(formData.transitTypes || [])];
      
      if (checked) {
        transitTypes.push(value);
      } else {
        const index = transitTypes.indexOf(value);
        if (index > -1) {
          transitTypes.splice(index, 1);
        }
      }
      
      setFormData((prev) => ({
        ...prev,
        transitTypes,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };  const handleAddLocation = async () => {
    if (newLocation.name?.trim() && newLocation.address?.trim()) {
      setIsGeocoding(true);
      
      try {
        // Geocode the address to get real coordinates
        const coordinates = await geocodeAddress(newLocation.address);
        
        const newLoc = {
          id: generateId(),
          name: newLocation.name.trim(),
          address: newLocation.address.trim(),
          type: newLocation.type,
          lat: coordinates.lat,
          lng: coordinates.lng,
          favorite: false
        };
        
        // Validate the location before adding
        if (validateLocation(newLoc)) {
          // Dispatch to Redux store
          dispatch(addSavedLocation(newLoc));
          
          // Reset form
          setNewLocation({ name: '', address: '', type: 'other' });
          setShowAddForm(false);
        } else {
          alert('Invalid location data. Please check your input and try again.');
        }
      } catch (error) {
        console.error('Error adding location:', error);
        alert('Failed to add location. Please try again.');
      } finally {
        setIsGeocoding(false);
      }
    } else {
      alert('Please fill in both name and address fields.');
    }
  };
  const handleEditLocation = (id, field, value) => {
    // Update both local state for immediate UI feedback and Redux store for persistence
    setSavedLocations(prev => prev.map(loc => 
      loc.id === id ? { ...loc, [field]: value } : loc
    ));
    
    // Dispatch to Redux store to persist changes
    dispatch(updateSavedLocation({
      id: id,
      updates: { [field]: value }
    }));
  };

  const handleDeleteLocation = (id) => {
    // Update local state for immediate UI feedback
    setSavedLocations(prev => prev.filter(loc => loc.id !== id));
    
    // Dispatch to Redux store to persist changes
    dispatch(deleteSavedLocation(id));
  };

  const toggleLocationFavorite = (id) => {
    // Find the current favorite state
    const currentLocation = savedLocations.find(loc => loc.id === id);
    const newFavoriteState = !currentLocation?.favorite;
    
    // Update local state for immediate UI feedback
    setSavedLocations(prev => prev.map(loc => 
      loc.id === id ? { ...loc, favorite: newFavoriteState } : loc
    ));
    
    // Dispatch to Redux store to persist changes
    dispatch(updateSavedLocation({
      id: id,
      updates: { favorite: newFavoriteState }
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Dispatch Redux action to update user profile
    dispatch(updateUserProfile({
      name: formData.userName,
      preferences: {
        theme: formData.theme,
        transitTypes: formData.transitTypes,
        commuteTimes: {
          morningStart: formData.morningStart,
          morningEnd: formData.morningEnd,
          eveningStart: formData.eveningStart,
          eveningEnd: formData.eveningEnd,
        }
      }
    }));
    
    // Show saved message
    setSaved(true);
    
    // Hide saved message after 3 seconds
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };
    return (
    <div className="settings-container dark-theme">
      {/* Header with Back Button */}
      <div className="settings-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <div className="user-profile">
          <div className="user-avatar">
            {getUserInitials(formData.userName)}
          </div>
          <div className="user-info">
            <h2>Settings</h2>
            <p>Customize your Urban Commute Assistant experience</p>
          </div>
        </div>
      </div>
      
      <div className="settings-card">
        <form className="settings-form" onSubmit={handleSubmit}>
          {saved && (
            <div className="success-message">
              Your preferences have been saved successfully!
            </div>
          )}
            <div className="form-section">
            <h3>Personal Information</h3>
            
            <div className="form-group">
              <label htmlFor="userName">Your Name</label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="Enter your name for initials display"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Display Settings</h3>
            
            <div className="form-group">
              <label htmlFor="theme">Theme</label>              <select
                id="theme"
                name="theme"
                value={formData.theme}
                onChange={handleChange}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">System Default</option>
              </select>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Transit Preferences</h3>
            
            <div className="form-group">
              <label>Transit Types</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="transitTypes"
                    value="bus"
                    checked={formData.transitTypes.includes('bus')}
                    onChange={handleChange}
                  />
                  Bus
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="transitTypes"
                    value="rail"
                    checked={formData.transitTypes.includes('rail')}
                    onChange={handleChange}
                  />
                  Rail/Light Rail
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="transitTypes"
                    value="ferry"
                    checked={formData.transitTypes.includes('ferry')}
                    onChange={handleChange}
                  />
                  Ferry
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="transitTypes"
                    value="shared"
                    checked={formData.transitTypes.includes('shared')}
                    onChange={handleChange}
                  />
                  Shared Mobility (Bike/Scooter)
                </label>
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Commute Times</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="morningStart">Morning Commute Start</label>
                <input
                  type="time"
                  id="morningStart"
                  name="morningStart"
                  value={formData.morningStart}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="morningEnd">Morning Commute End</label>
                <input
                  type="time"
                  id="morningEnd"
                  name="morningEnd"
                  value={formData.morningEnd}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="eveningStart">Evening Commute Start</label>
                <input
                  type="time"
                  id="eveningStart"
                  name="eveningStart"
                  value={formData.eveningStart}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="eveningEnd">Evening Commute End</label>
                <input
                  type="time"
                  id="eveningEnd"
                  name="eveningEnd"
                  value={formData.eveningEnd}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          {/* Saved Locations Section */}
          <div className="form-section">
            <div className="section-header">
              <h3>Saved Locations</h3>
              <div className="section-actions">
                <button 
                  type="button"
                  className="edit-button"
                  onClick={() => setIsEditingLocations(!isEditingLocations)}
                >
                  {isEditingLocations ? 'Done' : 'Edit'}
                </button>                <button 
                  type="button"
                  className="add-button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  disabled={isGeocoding}
                >
                  + Add Location
                </button>
              </div>
            </div>            {showAddForm && (
              <div className="add-location-form">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Location name (e.g., Home, Office)"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                    disabled={isGeocoding}
                  />
                  <input
                    type="text"
                    placeholder="Full address (e.g., 123 Main St, Seattle, WA)"
                    value={newLocation.address}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, address: e.target.value }))}
                    disabled={isGeocoding}
                  />
                  <select
                    value={newLocation.type}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, type: e.target.value }))}
                    disabled={isGeocoding}
                  >
                    <option value="home">🏠 Home</option>
                    <option value="work">🏢 Work</option>
                    <option value="gym">💪 Gym</option>
                    <option value="school">🏫 School</option>
                    <option value="shopping">🛒 Shopping</option>
                    <option value="other">📍 Other</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={handleAddLocation} 
                    className="save-button"
                    disabled={isGeocoding || !newLocation.name.trim() || !newLocation.address.trim()}
                  >
                    {isGeocoding ? 'Finding location...' : 'Save Location'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)} 
                    className="cancel-button"
                    disabled={isGeocoding}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="locations-list">
              {savedLocations.map(location => (
                <div key={location.id} className="location-item">                  <div className="location-type-icon">
                    {location.type === 'home' ? '🏠' : 
                     location.type === 'work' ? '🏢' : 
                     location.type === 'gym' ? '💪' :
                     location.type === 'school' ? '🏫' :
                     location.type === 'shopping' ? '🛒' : '📍'}
                  </div>
                  <div className="location-details">
                    {isEditingLocations ? (                      <div className="edit-fields">
                        <input
                          type="text"
                          value={location.name || ''}
                          onChange={(e) => handleEditLocation(location.id, 'name', e.target.value)}
                          className="edit-name"
                          placeholder="Location name"
                        />
                        <input
                          type="text"
                          value={location.address || ''}
                          onChange={(e) => handleEditLocation(location.id, 'address', e.target.value)}
                          className="edit-address"
                          placeholder="Address"
                        />
                      </div>
                    ) : (                      <div className="location-info">
                        <h4 className="location-name">{location.name}</h4>
                        <p className="location-address">{location.address || 'No address specified'}</p>
                        <small className="location-coords">
                          {location.lat?.toFixed(4)}, {location.lng?.toFixed(4)}
                        </small>
                      </div>
                    )}
                  </div>
                  <div className="location-actions">
                    <button
                      className={`favorite-button ${location.favorite ? 'active' : ''}`}
                      onClick={() => toggleLocationFavorite(location.id)}
                    >
                      {location.favorite ? '⭐' : '☆'}
                    </button>
                    {isEditingLocations && (
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteLocation(location.id)}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-button">
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
