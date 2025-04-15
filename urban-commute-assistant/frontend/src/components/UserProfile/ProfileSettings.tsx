import React, { useState, ChangeEvent } from 'react';

const ProfileSettings: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const handleSave = () => {
        // Logic to save user profile settings
        console.log('Profile settings saved:', { username, email, notificationsEnabled });
    };

    return (
        <div className="profile-settings">
            <h2>Profile Settings</h2>
            <div>
                <label>
                    Username:
                    <input
                        type="text"
                        value={username}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                    />
                </label>
            </div>
            <div>
                <label>
                    Email:
                    <input
                        type="email"
                        value={email}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    />
                </label>
            </div>
            <div>
                <label>
                    Enable Notifications:
                    <input
                        type="checkbox"
                        checked={notificationsEnabled}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNotificationsEnabled(e.target.checked)}
                    />
                </label>
            </div>
            <button onClick={handleSave}>Save Settings</button>
        </div>
    );
};

export default ProfileSettings;