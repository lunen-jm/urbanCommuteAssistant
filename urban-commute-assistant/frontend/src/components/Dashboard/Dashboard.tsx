import React from 'react';
import { useSelector } from 'react-redux';
import DataCard from './DataCard';
import { RootState, TransitData } from '../../types';

const Dashboard: React.FC = () => {
    const userLocation = useSelector((state: RootState) => state.user.preferences.location);
    const transitData = useSelector((state: RootState) => state.transitData.data as TransitData[] | null);
    const notificationsEnabled = useSelector((state: RootState) => state.user.preferences.notifications);
    const transitLoading = useSelector((state: RootState) => state.transitData.loading);
    const transitError = useSelector((state: RootState) => state.transitData.error);

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            {userLocation && <h2>Your Location: {userLocation}</h2>}
            <h3>Notification Preferences: {notificationsEnabled ? 'Enabled' : 'Disabled'}</h3>

            <h3>Transit Data</h3>
            {transitLoading && <p>Loading transit data...</p>}
            {transitError && <p>Error loading transit data: {transitError}</p>}
            <div className="data-cards">
                {Array.isArray(transitData) && transitData.length > 0 ? (
                    transitData.map((data, index) => (
                        <DataCard key={index} title={data.line} value={data.status} />
                    ))
                ) : (
                    !transitLoading && <p>No transit data available.</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;