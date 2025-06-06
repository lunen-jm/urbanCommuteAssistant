import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectSavedLocation } from '../../store/userSlice';
import './LocationSelector.css';

const LocationSelector = () => {
  const dispatch = useDispatch();
  const { savedLocations, selectedLocation } = useSelector((state) => state.user);

  // Handle location selection change
  const handleSelectLocation = (e) => {
    const locationId = e.target.value;
    dispatch(selectSavedLocation(locationId));
  };

  return (
    <div className="location-selector">
      <label htmlFor="location-select">Commute destination:</label>
      <select 
        id="location-select"
        value={selectedLocation}
        onChange={handleSelectLocation}
      >
        {savedLocations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LocationSelector;
