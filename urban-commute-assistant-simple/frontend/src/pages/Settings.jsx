import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import './Settings.css';

const Settings = () => {
  const user = useSelector((state) => state.user);
  
  const [formData, setFormData] = useState({
    theme: user.preferences?.theme || 'light',
    transitTypes: user.preferences?.transitTypes || ['bus', 'rail'],
    homeAddress: '',
    workAddress: '',
    morningStart: user.preferences?.commuteTimes?.morningStart || '08:00',
    morningEnd: user.preferences?.commuteTimes?.morningEnd || '09:30',
    eveningStart: user.preferences?.commuteTimes?.eveningStart || '17:00',
    eveningEnd: user.preferences?.commuteTimes?.eveningEnd || '18:30',
  });
  
  const [saved, setSaved] = useState(false);
  
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
  };
    const handleSubmit = (e) => {
    e.preventDefault();
    
    // In a real app, this would update user preferences in the backend
    // console.log('Saving settings:', formData);
    
    // Show saved message
    setSaved(true);
    
    // Hide saved message after 3 seconds
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };
  
  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>User Preferences</h2>
        <p>Customize your Urban Commute Assistant experience</p>
      </div>
      
      <div className="settings-card">
        <form className="settings-form" onSubmit={handleSubmit}>
          {saved && (
            <div className="success-message">
              Your preferences have been saved successfully!
            </div>
          )}
          
          <div className="form-section">
            <h3>Display Settings</h3>
            
            <div className="form-group">
              <label htmlFor="theme">Theme</label>
              <select
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
