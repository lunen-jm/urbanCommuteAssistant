import React, { useState } from 'react';

interface NotificationPreferences {
    email: boolean;
    sms: boolean;
    push: boolean;
    [key: string]: boolean;
}

const Settings: React.FC = () => {
    const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
        email: true,
        sms: false,
        push: true,
    });

    const handleToggle = (preference: string) => {
        setNotificationPreferences((prev) => ({
            ...prev,
            [preference]: !prev[preference],
        }));
    };

    const handleSave = () => {
        // Logic to save user preferences
        console.log('Saved preferences:', notificationPreferences);
    };

    return (
        <div className="settings-page">
            <h1>Settings</h1>
            <div className="notification-settings">
                <h2>Notification Preferences</h2>
                <label>
                    <input
                        type="checkbox"
                        checked={notificationPreferences.email}
                        onChange={() => handleToggle('email')}
                    />
                    Email Notifications
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={notificationPreferences.sms}
                        onChange={() => handleToggle('sms')}
                    />
                    SMS Notifications
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={notificationPreferences.push}
                        onChange={() => handleToggle('push')}
                    />
                    Push Notifications
                </label>
                <button onClick={handleSave}>Save Preferences</button>
            </div>
        </div>
    );
};

export default Settings;