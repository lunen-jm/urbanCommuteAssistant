from typing import List, Dict
import requests

class DataAggregator:
    def __init__(self, traffic_api_key: str, weather_api_key: str, transit_api_key: str):
        self.traffic_api_key = traffic_api_key
        self.weather_api_key = weather_api_key
        self.transit_api_key = transit_api_key

    def get_traffic_data(self, location: str) -> Dict:
        response = requests.get(f"https://api.traffic.com/data?location={location}&key={self.traffic_api_key}")
        return response.json()

    def get_weather_data(self, location: str) -> Dict:
        response = requests.get(f"https://api.weather.com/data?location={location}&key={self.weather_api_key}")
        return response.json()

    def get_transit_data(self, location: str) -> Dict:
        response = requests.get(f"https://api.transit.com/data?location={location}&key={self.transit_api_key}")
        return response.json()

    def aggregate_data(self, location: str) -> Dict:
        traffic_data = self.get_traffic_data(location)
        weather_data = self.get_weather_data(location)
        transit_data = self.get_transit_data(location)

        aggregated_data = {
            "traffic": traffic_data,
            "weather": weather_data,
            "transit": transit_data
        }

        return aggregated_data

    def get_commuting_suggestions(self, location: str) -> List[str]:
        data = self.aggregate_data(location)
        suggestions = []

        # Example logic for generating suggestions based on aggregated data
        if data['traffic']['congestion_level'] > 5:
            suggestions.append("Consider taking public transport due to heavy traffic.")
        if data['weather']['condition'] == 'rainy':
            suggestions.append("Bring an umbrella as it's going to rain.")
        if not data['transit']['on_time']:
            suggestions.append("Check for alternative transit options due to delays.")

        return suggestions