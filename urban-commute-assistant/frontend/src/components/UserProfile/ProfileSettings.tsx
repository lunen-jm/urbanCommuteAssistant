import React, { useState, useEffect, ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { updatePreferences } from '../../store/userSlice';
import { RootState } from '../../types';
import './ProfileSettings.css';

const ProfileSettings: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.user);
    
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        preferences: {
            notificationsEnabled: user.preferences.notifications || false,
            preferredTransportModes: [...(user.preferences.preferredTransportModes || [])]
        }
    });
    
    const [isEditing, setIsEditing] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    // Update form when user state changes
    useEffect(() => {
        setFormData({
            name: user.name || '',
            email: user.email || '',
            preferences: {
                notificationsEnabled: user.preferences.notifications || false,
                preferredTransportModes: [...(user.preferences.preferredTransportModes || [])]
            }
        });
    }, [user]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox' && name === 'notificationsEnabled') {
            setFormData(prev => ({
                ...prev,
                preferences: {
                    ...prev.preferences,
                    notificationsEnabled: checked
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleTransportModeToggle = (mode: string) => {
        setFormData(prev => {
            const currentModes = [...prev.preferences.preferredTransportModes];
            const index = currentModes.indexOf(mode);
            
            if (index > -1) {
                currentModes.splice(index, 1);
            } else {
                currentModes.push(mode);
            }
            
            return {
                ...prev,
                preferences: {
                    ...prev.preferences,
                    preferredTransportModes: currentModes
                }
            };
        });
    };

    const handleSave = async () => {
        setSaveStatus('saving');
        try {
            // Dispatch action to update user preferences - remove the unwrap call
            dispatch(updatePreferences({
                notifications: formData.preferences.notificationsEnabled,
                preferredTransportModes: formData.preferences.preferredTransportModes
            }));
            
            setSaveStatus('success');
            setIsEditing(false);
            
            // Reset status after delay
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err) {
            setSaveStatus('error');
            console.error('Failed to save profile:', err);
            
            // Reset status after delay
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    const transportModes = ['Bus', 'Train', 'Subway', 'Car', 'Bicycle', 'Walking'];

    return (
        <div className="profile-settings">
            <h2>Profile Settings</h2>
            
            {saveStatus === 'success' && (
                <div className="alert alert-success">Profile updated successfully!</div>
            )}
            
            {saveStatus === 'error' && (
                <div className="alert alert-error">Failed to update profile. Please try again.</div>
            )}
            
            <div className="profile-form">
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={!isEditing ? 'disabled' : ''}
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={!isEditing ? 'disabled' : ''}
                    />
                </div>
                
                <fieldset className="transport-modes">
                    <legend>Preferred Transport Modes</legend>
                    <div className="checkbox-group">
                        {transportModes.map(mode => (
                            <label key={mode} className={`checkbox-label ${!isEditing ? 'disabled' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={formData.preferences.preferredTransportModes.includes(mode)}
                                    onChange={() => handleTransportModeToggle(mode)}
                                    disabled={!isEditing}
                                />
                                <span className="checkbox-icon"></span>
                                {mode}
                            </label>
                        ))}
                    </div>
                </fieldset>
                
                <div className="form-group">
                    <label className={`checkbox-label ${!isEditing ? 'disabled' : ''}`}>
                        <input
                            type="checkbox"
                            name="notificationsEnabled"
                            checked={formData.preferences.notificationsEnabled}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />
                        <span className="checkbox-icon"></span>
                        Enable Notifications
                    </label>
                </div>
                
                <div className="action-buttons">
                    {!isEditing ? (
                        <button 
                            className="btn btn-primary" 
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleSave}
                                disabled={saveStatus === 'saving'}
                            >
                                {saveStatus === 'saving' ? 'Saving...' : 'Save Profile'}
                            </button>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => setIsEditing(false)}
                                disabled={saveStatus === 'saving'}
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;