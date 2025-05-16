import { WeatherData } from '../../types';

// This data structure is no longer type-compatible with WeatherData 
// but will be transformed by the adapter
export const sampleWeatherData = {
  temperature: 15.7,
  description: 'Partly Cloudy',
  humidity: 65,
  windSpeed: 4.2,
  feelsLike: 14.8,
  icon: 'https://openweathermap.org/img/wn/02d@2x.png'
};
