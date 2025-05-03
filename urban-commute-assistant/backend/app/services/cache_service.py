import redis
import json
from datetime import datetime
from typing import Any, Optional, Dict, List

class CacheService:
    """Advanced caching service with tiered TTLs based on data type"""
    
    # Define cache TTLs in seconds for different data types
    CACHE_TIERS = {
        "weather": {
            "current": 30 * 60,       # 30 minutes for current weather
            "forecast": 2 * 60 * 60,  # 2 hours for forecast
            "historical": 24 * 60 * 60 # 24 hours for historical data
        },
        "traffic": {
            "flow": 5 * 60,           # 5 minutes for traffic flow
            "incidents": 10 * 60,     # 10 minutes for incidents
            "historical": 12 * 60 * 60 # 12 hours for historical data
        },
        "transit": {
            "schedule": 24 * 60 * 60, # 24 hours for static schedules
            "realtime": 60,           # 1 minute for real-time data
            "alerts": 5 * 60          # 5 minutes for service alerts
        },
        "composite": {
            "comprehensive": 60,      # 1 minute for comprehensive data
            "dashboard": 2 * 60       # 2 minutes for dashboard data
        }
    }
    
    def __init__(self, redis_client: redis.Redis):
        """Initialize with Redis client"""
        self.redis = redis_client
    
    def get(self, key: str) -> Optional[Dict[str, Any]]:
        """Get data from cache with metadata"""
        data = self.redis.get(key)
        if data:
            try:
                cached_data = json.loads(data)
                # Add flag to indicate this came from cache
                if isinstance(cached_data, dict):
                    cached_data['_cached'] = True
                    cached_data['_cache_timestamp'] = datetime.now().isoformat()
                return cached_data
            except json.JSONDecodeError:
                # If data is corrupted, return None
                return None
        return None
    
    def set(self, key: str, data: Any, data_type: str, subtype: str) -> None:
        """Set data in cache with appropriate TTL based on type"""
        # Get the appropriate TTL based on data type
        ttl = self.CACHE_TIERS.get(data_type, {}).get(subtype, 60 * 60)  # Default 1 hour
        
        # Add metadata
        cache_data = data
        if isinstance(data, dict):
            cache_data = {
                **data,
                "_cached_at": datetime.now().isoformat(),
                "_cache_type": f"{data_type}:{subtype}"
            }
        
        # Store in Redis with TTL
        try:
            self.redis.setex(key, ttl, json.dumps(cache_data))
        except Exception as e:
            print(f"Error caching data for key {key}: {str(e)}")
    
    def invalidate(self, pattern: str) -> int:
        """Invalidate cache entries matching a pattern"""
        keys = self.redis.keys(pattern)
        count = 0
        if keys:
            count = self.redis.delete(*keys)
        return count
    
    def invalidate_by_type(self, data_type: str, subtype: Optional[str] = None) -> int:
        """Invalidate all cache entries of a specific type"""
        pattern = f"*_cache_type:{data_type}:{subtype if subtype else '*'}"
        return self.invalidate(pattern)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        stats = {
            "total_keys": len(self.redis.keys("*")),
            "memory_used": self.redis.info("memory").get("used_memory_human", "unknown"),
            "types": {},
            "timestamp": datetime.now().isoformat()
        }
        
        # Count keys by type
        for data_type in self.CACHE_TIERS.keys():
            type_keys = len(self.redis.keys(f"*{data_type}*"))
            stats["types"][data_type] = type_keys
            
            # Get subtypes
            subtypes = {}
            for subtype in self.CACHE_TIERS[data_type].keys():
                subtype_keys = len(self.redis.keys(f"*_cache_type:{data_type}:{subtype}*"))
                subtypes[subtype] = subtype_keys
                
            stats["types"][f"{data_type}_subtypes"] = subtypes
        
        return stats
    
    def get_multi(self, keys: List[str]) -> Dict[str, Any]:
        """Get multiple cache entries at once"""
        if not keys:
            return {}
            
        # Get all values in one batch
        pipe = self.redis.pipeline()
        for key in keys:
            pipe.get(key)
        values = pipe.execute()
        
        # Process results
        result = {}
        for i, key in enumerate(keys):
            if values[i]:
                try:
                    data = json.loads(values[i])
                    # Add cache flag
                    if isinstance(data, dict):
                        data['_cached'] = True
                    result[key] = data
                except json.JSONDecodeError:
                    # Skip corrupted data
                    continue
                    
        return result