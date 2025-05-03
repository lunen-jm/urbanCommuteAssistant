import logging
import time
from functools import wraps
from typing import Dict, Any, Optional, Callable
import json
from datetime import datetime

logger = logging.getLogger(__name__)

class MetricsCollector:
    """
    Collects metrics for API operations and performance monitoring.
    Singleton pattern to ensure metrics are shared across the application.
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MetricsCollector, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize the metrics storage"""
        self.api_call_counts: Dict[str, int] = {}
        self.api_error_counts: Dict[str, int] = {}
        self.api_latencies: Dict[str, list] = {}
        self.cache_hits: int = 0
        self.cache_misses: int = 0
        self.last_reset_time = datetime.now()
    
    def record_api_call(self, api_name: str, latency: float, success: bool):
        """Record an API call with its latency and success/failure status"""
        # Update call count
        self.api_call_counts[api_name] = self.api_call_counts.get(api_name, 0) + 1
        
        # Update latency metrics
        if api_name not in self.api_latencies:
            self.api_latencies[api_name] = []
        self.api_latencies[api_name].append(latency)
        
        # Update error count if applicable
        if not success:
            self.api_error_counts[api_name] = self.api_error_counts.get(api_name, 0) + 1
    
    def record_cache_result(self, hit: bool):
        """Record a cache hit or miss"""
        if hit:
            self.cache_hits += 1
        else:
            self.cache_misses += 1
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get a snapshot of current metrics"""
        metrics = {
            "api_calls": self.api_call_counts,
            "api_errors": self.api_error_counts,
            "cache": {
                "hits": self.cache_hits,
                "misses": self.cache_misses,
                "hit_ratio": self._calculate_hit_ratio()
            },
            "api_latencies": {},
            "since": self.last_reset_time.isoformat()
        }
        
        # Calculate average latencies
        for api_name, latencies in self.api_latencies.items():
            if latencies:
                metrics["api_latencies"][api_name] = {
                    "avg": sum(latencies) / len(latencies),
                    "min": min(latencies),
                    "max": max(latencies),
                    "count": len(latencies)
                }
        
        return metrics
    
    def _calculate_hit_ratio(self) -> float:
        """Calculate cache hit ratio"""
        total = self.cache_hits + self.cache_misses
        if total == 0:
            return 0
        return self.cache_hits / total
    
    def reset(self):
        """Reset all metrics"""
        self.api_call_counts = {}
        self.api_error_counts = {}
        self.api_latencies = {}
        self.cache_hits = 0
        self.cache_misses = 0
        self.last_reset_time = datetime.now()


def track_api_call(api_name: Optional[str] = None):
    """Decorator to track API calls, measure latency, and log results"""
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            metrics = MetricsCollector()
            endpoint = api_name or func.__name__
            
            logger.info(f"API call started: {endpoint}")
            
            try:
                result = func(*args, **kwargs)
                success = True
                logger.info(f"API call succeeded: {endpoint}")
                return result
            except Exception as e:
                success = False
                logger.error(f"API call failed: {endpoint} - {str(e)}")
                raise
            finally:
                end_time = time.time()
                latency = end_time - start_time
                metrics.record_api_call(endpoint, latency, success)
                logger.info(f"API call completed: {endpoint} - Latency: {latency:.3f}s")
        
        return wrapper
    return decorator


def track_cache_operation(hit: bool):
    """Record a cache hit or miss"""
    metrics = MetricsCollector()
    metrics.record_cache_result(hit)


# Example usage:
# @track_api_call(api_name="weather.current")
# def get_current_weather(lat, lon):
#     pass