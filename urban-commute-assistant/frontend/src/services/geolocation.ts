import { useEffect, useState } from 'react';

const useGeolocation = () => {
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleSuccess = (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
        };

        const handleError = (error: GeolocationPositionError) => {
            setError(error.message);
        };

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
        } else {
            setError('Geolocation is not supported by this browser.');
        }
    }, []);

    return { location, error };
};

export default useGeolocation;