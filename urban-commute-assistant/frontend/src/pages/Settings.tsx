import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePreferences } from '../store/userSlice';
import { RootState } from '../types';
import ProfileSettings from '../components/UserProfile/ProfileSettings';
import './Settings.css';
import { AppDispatch } from '../store';

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
    const dispatch = useDispatch<AppDispatch>();
    const userPreferences = useSelector((state: RootState) => state.user.preferences);
    
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'appearance' | 'data'>('profile');
    
    // Initialize with values from the notificationSettings in user preferences if available
    const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
        email: userPreferences.notificationSettings?.email || false,
        push: userPreferences.notificationSettings?.push || false,
        sms: userPreferences.notificationSettings?.sms || false,
    });
    
    // Initialize with default values since we don't have these in our UserState interface
    const [appPreferences, setAppPreferences] = useState<AppPreferences>({
        theme: 'system',
        language: 'en',
        autoRefresh: true,
        refreshInterval: 5,
    });
    
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    
    const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
        setAppPreferences(prev => ({ ...prev, theme }));
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
    
    const handleNotificationToggle = (channel: keyof NotificationPreferences) => {
        setNotificationPreferences(prev => ({
            ...prev,
            [channel]: !prev[channel]
        }));
    };
    
    const handleRefreshIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAppPreferences(prev => ({
            ...prev,
            refreshInterval: parseInt(e.target.value)
        }));
    };

    const handleSave = async () => {
        setSaveStatus('saving');
        try {
            // Map the notification preferences to our UserState structure
            dispatch(updatePreferences({
                darkMode: appPreferences.theme === 'dark',
                preferredTransportModes: userPreferences.preferredTransportModes || [],
                notificationSettings: {
                    email: notificationPreferences.email,
                    push: notificationPreferences.push,
                    sms: notificationPreferences.sms
                }
            }));
            
            setSaveStatus('success');
            
            // Reset status after delay
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            console.error('Failed to save settings:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };
    
    const handleClearAllData = () => {
        // This would be handled by a different action
        if (window.confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
            console.log('Clearing all user data...');
            // Implementation would go here
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-container">
                <div className="settings-sidebar">
                    <h2>Settings</h2>
                    <nav>
                        <ul>
                            <li
                                className={activeTab === 'profile' ? 'active' : ''}
                                onClick={() => setActiveTab('profile')}
                            >
                                Profile
                            </li>
                            <li
                                className={activeTab === 'notifications' ? 'active' : ''}
                                onClick={() => setActiveTab('notifications')}
                            >
                                Notifications
                            </li>
                            <li
                                className={activeTab === 'appearance' ? 'active' : ''}
                                onClick={() => setActiveTab('appearance')}
                            >
                                Appearance
                            </li>
                            <li
                                className={activeTab === 'data' ? 'active' : ''}
                                onClick={() => setActiveTab('data')}
                            >
                                Data & Privacy
                            </li>
                        </ul>
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
                            <h3>Profile Settings</h3>
                            <ProfileSettings />
                        </div>
                    )}
                    
                    {activeTab === 'notifications' && (
                        <div className="settings-section">
                            <h3>Notification Preferences</h3>
                            <p>Choose how you'd like to receive notifications about your commute.</p>
                            
                            <div className="notification-options">
                                <label className="switch-wrapper">
                                    <span>Email Notifications</span>
                                    <input
                                        type="checkbox"
                                        checked={notificationPreferences.email}
                                        onChange={() => handleNotificationToggle('email')}
                                    />
                                    <span className="slider"></span>
                                </label>
                                
                                <label className="switch-wrapper">
                                    <span>Push Notifications</span>
                                    <input
                                        type="checkbox"
                                        checked={notificationPreferences.push}
                                        onChange={() => handleNotificationToggle('push')}
                                    />
                                    <span className="slider"></span>
                                </label>
                                
                                <label className="switch-wrapper">
                                    <span>SMS Notifications</span>
                                    <input
                                        type="checkbox"
                                        checked={notificationPreferences.sms}
                                        onChange={() => handleNotificationToggle('sms')}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            
                            <div className="notification-timing">
                                <h4>Notification Timing</h4>
                                <p>When should we send you notifications about your commute?</p>
                                
                                <div className="timing-options">
                                    <label>
                                        <input type="radio" name="timing" value="morning" defaultChecked />
                                        Morning (30 minutes before departure)
                                    </label>
                                    <label>
                                        <input type="radio" name="timing" value="evening" />
                                        Evening (30 minutes before departure)
                                    </label>
                                    <label>
                                        <input type="radio" name="timing" value="both" />
                                        Both morning and evening
                                    </label>
                                </div>
                            </div>
                            
                            <button
                                className="save-button"
                                onClick={handleSave}
                                disabled={saveStatus === 'saving'}
                            >
                                {saveStatus === 'saving' ? 'Saving...' : 'Save Preferences'}
                            </button>
                        </div>
                    )}
                    
                    {activeTab === 'appearance' && (
                        <div className="settings-section">
                            <h3>Appearance Settings</h3>
                            <p>Customize how Urban Commute Assistant looks.</p>
                            
                            <div className="theme-options">
                                <h4>Theme</h4>
                                <div className="theme-selector">
                                    <div
                                        className={`theme-option ${appPreferences.theme === 'light' ? 'selected' : ''}`}
                                        onClick={() => handleThemeChange('light')}
                                    >
                                        <div className="theme-preview light-theme"></div>
                                        <span>Light</span>
                                    </div>
                                    
                                    <div
                                        className={`theme-option ${appPreferences.theme === 'dark' ? 'selected' : ''}`}
                                        onClick={() => handleThemeChange('dark')}
                                    >
                                        <div className="theme-preview dark-theme"></div>
                                        <span>Dark</span>
                                    </div>
                                    
                                    <div
                                        className={`theme-option ${appPreferences.theme === 'system' ? 'selected' : ''}`}
                                        onClick={() => handleThemeChange('system')}
                                    >
                                        <div className="theme-preview system-theme"></div>
                                        <span>System</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="language-options">
                                <h4>Language</h4>
                                <select
                                    value={appPreferences.language}
                                    onChange={handleLanguageChange}
                                >
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                    <option value="zh">Chinese</option>
                                    <option value="ja">Japanese</option>
                                </select>
                            </div>
                            
                            <div className="data-refresh">
                                <h4>Auto-Refresh</h4>
                                <label className="switch-wrapper">
                                    <span>Enable auto-refresh of commute data</span>
                                    <input
                                        type="checkbox"
                                        checked={appPreferences.autoRefresh}
                                        onChange={handleAutoRefreshToggle}
                                    />
                                    <span className="slider"></span>
                                </label>
                                
                                {appPreferences.autoRefresh && (
                                    <div className="refresh-interval">
                                        <span>Refresh every</span>
                                        <input
                                            type="range"
                                            min="1"
                                            max="15"
                                            value={appPreferences.refreshInterval}
                                            onChange={handleRefreshIntervalChange}
                                        />
                                        <span>{appPreferences.refreshInterval} minutes</span>
                                    </div>
                                )}
                            </div>
                            
                            <button
                                className="save-button"
                                onClick={handleSave}
                                disabled={saveStatus === 'saving'}
                            >
                                {saveStatus === 'saving' ? 'Saving...' : 'Save Preferences'}
                            </button>
                        </div>
                    )}
                    
                    {activeTab === 'data' && (
                        <div className="settings-section">
                            <h3>Data & Privacy</h3>
                            <p>Manage your data and privacy settings.</p>
                            
                            <div className="data-usage">
                                <h4>Location Data</h4>
                                <p>
                                    Urban Commute Assistant uses your location data to provide
                                    accurate commute information. Your location is only stored
                                    when you explicitly save a location.
                                </p>
                                
                                <label className="switch-wrapper">
                                    <span>Allow location tracking</span>
                                    <input
                                        type="checkbox"
                                        defaultChecked
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            
                            <div className="data-retention">
                                <h4>Data Retention</h4>
                                <p>
                                    We store your commute history to provide better recommendations.
                                    You can clear this data at any time.
                                </p>
                                
                                <button
                                    className="clear-data-button"
                                    onClick={handleClearAllData}
                                >
                                    Clear All Data
                                </button>
                            </div>
                            
                            <div className="export-data">
                                <h4>Export Your Data</h4>
                                <p>
                                    Download a copy of all the data we have stored about your account.
                                </p>
                                
                                <button className="export-button">
                                    Export Data (JSON)
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
