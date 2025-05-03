import redis
from datetime import datetime
from typing import Dict, Any, Optional, Tuple

class ApiRateLimiter:
    """Rate limiter for external API calls to prevent exceeding usage limits"""
    
    # Define API limits
    API_LIMITS = {
        "weather": {
            "daily": 950,  # Slightly below the typical 1000 limit
            "hourly": 40,   # Distributed evenly throughout the day
        },
        "traffic": {
            "daily": 2000,
            "hourly": 100,
        },
        "transit": {
            "daily": 1000,
            "hourly": 50,
        }
    }
    
    def __init__(self, redis_client: redis.Redis):
        """Initialize with Redis client"""
        self.redis = redis_client
    
    def check_rate_limit(self, api_name: str) -> bool:
        """Check if the API call is allowed under rate limits"""
        current_date = datetime.now().strftime("%Y-%m-%d")
        current_hour = datetime.now().strftime("%Y-%m-%d-%H")
        
        daily_key = f"api_limit:{api_name}:daily:{current_date}"
        hourly_key = f"api_limit:{api_name}:hourly:{current_hour}"
        
        # Get current counts
        daily_count = int(self.redis.get(daily_key) or 0)
        hourly_count = int(self.redis.get(hourly_key) or 0)
        
        # Check against limits
        daily_limit = self.API_LIMITS.get(api_name, {}).get("daily", 1000)
        hourly_limit = self.API_LIMITS.get(api_name, {}).get("hourly", 50)
        
        if daily_count >= daily_limit or hourly_count >= hourly_limit:
            return False
        
        return True
    
    def increment(self, api_name: str) -> Tuple[bool, Dict[str, Any]]:
        """Increment the API call counter and return status"""
        # First check if we're within limits
        if not self.check_rate_limit(api_name):
            return False, self.get_usage_stats_for_api(api_name)
        
        current_date = datetime.now().strftime("%Y-%m-%d")
        current_hour = datetime.now().strftime("%Y-%m-%d-%H")
        
        daily_key = f"api_limit:{api_name}:daily:{current_date}"
        hourly_key = f"api_limit:{api_name}:hourly:{current_hour}"
        
        # Increment counters in a transaction
        pipe = self.redis.pipeline()
        pipe.incr(daily_key)
        pipe.expire(daily_key, 24 * 60 * 60)  # 24 hours
        pipe.incr(hourly_key)
        pipe.expire(hourly_key, 60 * 60)  # 1 hour
        results = pipe.execute()
        
        # Log the increment for monitoring
        self._log_api_usage(api_name, daily_key, results[0])
        
        return True, self.get_usage_stats_for_api(api_name)
    
    def get_usage_stats_for_api(self, api_name: str) -> Dict[str, Any]:
        """Get usage statistics for a specific API"""
        current_date = datetime.now().strftime("%Y-%m-%d")
        current_hour = datetime.now().strftime("%Y-%m-%d-%H")
        
        daily_key = f"api_limit:{api_name}:daily:{current_date}"
        hourly_key = f"api_limit:{api_name}:hourly:{current_hour}"
        
        daily_count = int(self.redis.get(daily_key) or 0)
        hourly_count = int(self.redis.get(hourly_key) or 0)
        
        daily_limit = self.API_LIMITS.get(api_name, {}).get("daily", 1000)
        hourly_limit = self.API_LIMITS.get(api_name, {}).get("hourly", 50)
        
        return {
            "api": api_name,
            "daily": {
                "current": daily_count,
                "limit": daily_limit,
                "percent": round(daily_count / daily_limit * 100, 2) if daily_limit > 0 else 0,
                "remaining": daily_limit - daily_count
            },
            "hourly": {
                "current": hourly_count,
                "limit": hourly_limit,
                "percent": round(hourly_count / hourly_limit * 100, 2) if hourly_limit > 0 else 0,
                "remaining": hourly_limit - hourly_count
            },
            "timestamp": datetime.now().isoformat()
        }
    
    def get_usage_stats(self) -> Dict[str, Any]:
        """Get usage statistics for all APIs"""
        stats = {}
        for api_name in self.API_LIMITS.keys():
            stats[api_name] = self.get_usage_stats_for_api(api_name)
        
        return {
            "timestamp": datetime.now().isoformat(),
            "apis": stats
        }
    
    def _log_api_usage(self, api_name: str, key: str, count: int) -> None:
        """Log API usage for monitoring and analytics (could be extended to DB storage)"""
        if count % 100 == 0:  # Log every 100th request
            print(f"API Usage Milestone: {api_name} has reached {count} requests for {key}")
            
            # Here you could implement additional logging or alerts
            # Such as sending a notification to administrators when approaching limits