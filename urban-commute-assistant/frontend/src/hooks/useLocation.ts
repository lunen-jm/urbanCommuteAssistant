import { useEffect, useState } from 'react';

const useLocation = () => {
    const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleSuccess = (position: GeolocationPosition) => {
            setLocation(position.coords);
        };

        const handleError = (error: GeolocationPositionError) => {
            setError(error.message);
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
        } else {
            setError('Geolocation is not supported by this browser.');
        }
    }, []);

    return { userLocation: location, error };
};

export default useLocation;