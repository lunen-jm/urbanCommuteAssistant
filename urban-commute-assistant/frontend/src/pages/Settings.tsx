import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePreferences } from '../store/userSlice';
import { RootState } from '../types';
import ProfileSettings from '../components/UserProfile/ProfileSettings';
import './Settings.css';

interface NotificationPreferences {
    email: boolean;
    push: boolean;
    sms: boolean;
}

interface AppPreferences {
    theme: 'light' | 'dark' | 'system';
    language: string;
    autoRefresh: boolean;
    refreshInterval: number;
}

const Settings: React.FC = () => {
    const dispatch = useDispatch();
    const userPreferences = useSelector((state: RootState) => state.user.preferences);
    
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'appearance' | 'data'>('profile');
    
    const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
        email: true,
        push: true,
        sms: false,
    });
    
    const [appPreferences, setAppPreferences] = useState<AppPreferences>({
        theme: 'system',
        language: 'en',
        autoRefresh: true,
        refreshInterval: 5,
    });
    
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    const handleNotificationToggle = (preference: keyof NotificationPreferences) => {
        setNotificationPreferences((prev) => ({
            ...prev,
            [preference]: !prev[preference],
        }));
    };
    
    const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAppPreferences(prev => ({
            ...prev,
            theme: e.target.value as AppPreferences['theme']
        }));
    };
    
    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAppPreferences(prev => ({
            ...prev,
            language: e.target.value
        }));
    };
    
    const handleAutoRefreshToggle = () => {
        setAppPreferences(prev => ({
            ...prev,
            autoRefresh: !prev.autoRefresh
        }));
    };
    
    const handleRefreshIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAppPreferences(prev => ({
            ...prev,
            refreshInterval: parseInt(e.target.value)
        }));
    };

    const handleSave = async () => {
        setSaveStatus('saving');
        try {
            // Combine all preferences and dispatch to Redux
            await dispatch(updatePreferences({
                notifications: Object.values(notificationPreferences).some(v => v),
                notificationChannels: Object.entries(notificationPreferences)
                    .filter(([_, enabled]) => enabled)
                    .map(([channel]) => channel),
                theme: appPreferences.theme,
                language: appPreferences.language,
                autoRefresh: appPreferences.autoRefresh,
                refreshInterval: appPreferences.refreshInterval,
            }));
            
            setSaveStatus('success');
            
            // Reset status after delay
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err) {
            setSaveStatus('error');
            console.error('Failed to save settings:', err);
            
            // Reset status after delay
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-container">
                <div className="settings-sidebar">
                    <h2>Settings</h2>
                    <nav className="settings-nav">
                        <button 
                            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            Profile
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                            onClick={() => setActiveTab('notifications')}
                        >
                            Notifications
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
                            onClick={() => setActiveTab('appearance')}
                        >
                            Appearance
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'data' ? 'active' : ''}`}
                            onClick={() => setActiveTab('data')}
                        >
                            Data & Privacy
                        </button>
                    </nav>
                </div>

                <div className="settings-content">
                    {saveStatus === 'success' && (
                        <div className="alert alert-success">Settings saved successfully!</div>
                    )}
                    
                    {saveStatus === 'error' && (
                        <div className="alert alert-error">Failed to save settings. Please try again.</div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="settings-section">
                            <ProfileSettings />
                        </div>
                    )}
                    
                    {activeTab === 'notifications' && (
                        <div className="settings-section">
                            <h2>Notification Preferences</h2>
                            <div className="notification-settings">
                                <p className="section-description">
                                    Configure how and when you receive notifications about your commute, traffic updates, and weather alerts.
                                </p>
                                
                                <h3>Notification Channels</h3>
                                <div className="preferences-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={notificationPreferences.email}
                                            onChange={() => handleNotificationToggle('email')}
                                        />
                                        <span className="checkbox-icon"></span>
                                        Email Notifications
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={notificationPreferences.push}
                                            onChange={() => handleNotificationToggle('push')}
                                        />
                                        <span className="checkbox-icon"></span>
                                        Push Notifications
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={notificationPreferences.sms}
                                            onChange={() => handleNotificationToggle('sms')}
                                        />
                                        <span className="checkbox-icon"></span>
                                        SMS Notifications
                                    </label>
                                </div>
                                
                                <h3>Notification Types</h3>
                                <div className="preferences-group">
                                    <div className="toggle-item">
                                        <div className="toggle-label">
                                            <span>Traffic Alerts</span>
                                            <p className="toggle-description">Receive notifications about accidents, construction, and other traffic disruptions on your route.</p>
                                        </div>
                                        <label className="switch">
                                            <input type="checkbox" checked={true} />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                    
                                    <div className="toggle-item">
                                        <div className="toggle-label">
                                            <span>Weather Alerts</span>
                                            <p className="toggle-description">Be notified of severe weather that may impact your commute.</p>
                                        </div>
                                        <label className="switch">
                                            <input type="checkbox" checked={true} />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                    
                                    <div className="toggle-item">
                                        <div className="toggle-label">
                                            <span>Transit Disruptions</span>
                                            <p className="toggle-description">Get updates on delays, cancellations, and service changes for transit options.</p>
                                        </div>
                                        <label className="switch">
                                            <input type="checkbox" checked={true} />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                    
                                    <div className="toggle-item">
                                        <div className="toggle-label">
                                            <span>Daily Commute Reminders</span>
                                            <p className="toggle-description">Receive reminders and suggested departure times for your daily commute.</p>
                                        </div>
                                        <label className="switch">
                                            <input type="checkbox" checked={false} />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                className="btn btn-primary save-btn" 
                                onClick={handleSave}
                                disabled={saveStatus === 'saving'}
                            >
                                {saveStatus === 'saving' ? 'Saving...' : 'Save Preferences'}
                            </button>
                        </div>
                    )}
                    
                    {activeTab === 'appearance' && (
                        <div className="settings-section">
                            <h2>Appearance Settings</h2>
                            <p className="section-description">
                                Customize how the application looks and functions to suit your preferences.
                            </p>
                            
                            <div className="form-group">
                                <label htmlFor="theme">Theme</label>
                                <select 
                                    id="theme" 
                                    value={appPreferences.theme}
                                    onChange={handleThemeChange}
                                    className="form-select"
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    <option value="system">System Default</option>
                                </select>
                                <p className="form-hint">Choose how the app appears on your device.</p>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="language">Language</label>
                                <select 
                                    id="language" 
                                    value={appPreferences.language}
                                    onChange={handleLanguageChange}
                                    className="form-select"
                                >
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                </select>
                                <p className="form-hint">Select your preferred language for the application interface.</p>
                            </div>
                            
                            <div className="form-group">
                                <div className="toggle-item">
                                    <div className="toggle-label">
                                        <span>Auto-refresh Data</span>
                                        <p className="toggle-description">Automatically update traffic, weather, and transit data.</p>
                                    </div>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={appPreferences.autoRefresh}
                                            onChange={handleAutoRefreshToggle}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                            
                            {appPreferences.autoRefresh && (
                                <div className="form-group">
                                    <label htmlFor="refreshInterval">Refresh Interval</label>
                                    <select 
                                        id="refreshInterval" 
                                        value={appPreferences.refreshInterval}
                                        onChange={handleRefreshIntervalChange}
                                        className="form-select"
                                    >
                                        <option value="1">1 minute</option>
                                        <option value="5">5 minutes</option>
                                        <option value="10">10 minutes</option>
                                        <option value="15">15 minutes</option>
                                        <option value="30">30 minutes</option>
                                    </select>
                                    <p className="form-hint">How often to fetch new data from our servers.</p>
                                </div>
                            )}
                            
                            <button 
                                className="btn btn-primary save-btn" 
                                onClick={handleSave}
                                disabled={saveStatus === 'saving'}
                            >
                                {saveStatus === 'saving' ? 'Saving...' : 'Save Preferences'}
                            </button>
                        </div>
                    )}
                    
                    {activeTab === 'data' && (
                        <div className="settings-section">
                            <h2>Data & Privacy</h2>
                            <p className="section-description">
                                Manage your data and privacy settings.
                            </p>
                            
                            <div className="preferences-group">
                                <div className="toggle-item">
                                    <div className="toggle-label">
                                        <span>Location Tracking</span>
                                        <p className="toggle-description">Allow the app to track your location to provide more accurate commute recommendations.</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" checked={true} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                                
                                <div className="toggle-item">
                                    <div className="toggle-label">
                                        <span>Save Commute History</span>
                                        <p className="toggle-description">Save your commute patterns to improve recommendations over time.</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" checked={true} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                                
                                <div className="toggle-item">
                                    <div className="toggle-label">
                                        <span>Data Analytics</span>
                                        <p className="toggle-description">Allow anonymous usage data to be collected for improving the app.</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" checked={false} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                            
                            <div className="data-actions">
                                <button className="btn btn-outline">Export My Data</button>
                                <button className="btn btn-outline">Delete My Account</button>
                            </div>
                            
                            <button 
                                className="btn btn-primary save-btn" 
                                onClick={handleSave}
                                disabled={saveStatus === 'saving'}
                            >
                                {saveStatus === 'saving' ? 'Saving...' : 'Save Preferences'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;