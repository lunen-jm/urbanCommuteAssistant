import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { Notification } from '../../types';

const NotificationPanel: React.FC = () => {
    const { notifications, markAsRead, removeNotification } = useNotifications();

    return (
        <div className="notification-panel">
            <h2>Notifications</h2>
            {notifications.length === 0 ? (
                <p>No notifications available.</p>
            ) : (
                <ul>
                    {notifications.map((notification: Notification) => (
                        <li key={notification.id} className={notification.read ? 'read' : 'unread'}>
                            <p>{notification.message}</p>
                            <button onClick={() => markAsRead(notification.id)}>Mark as Read</button>
                            <button onClick={() => removeNotification(notification.id)}>Remove</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NotificationPanel;