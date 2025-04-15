import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTransitData } from '../store/transitDataSlice';
import { fetchTransitData } from '../services/api';
import { TransitData, RootState } from '../types';

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export const useTransitData = (userLocation: LocationCoordinates | null) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const dispatch = useDispatch();
    const transitData = useSelector((state: RootState) => state.transitData.data);

    useEffect(() => {
        const getTransitData = async () => {
            if (!userLocation) {
                setLoading(false);
                return;
            }
            
            setLoading(true);
            setError(null);
            try {
                const location = {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude
                };
                const data = await fetchTransitData(location);
                dispatch(setTransitData(data));
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Error fetching transit data');
            } finally {
                setLoading(false);
            }
        };

        getTransitData();
    }, [userLocation, dispatch]);

    return { transitData, loading, error };
};