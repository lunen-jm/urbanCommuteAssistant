from typing import Callable, Any
import time
from functools import wraps
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class CircuitState(Enum):
    CLOSED = "CLOSED"  # Normal operation, requests pass through
    OPEN = "OPEN"      # Circuit is open, requests fail fast
    HALF_OPEN = "HALF_OPEN"  # Testing if service is back online

class CircuitBreaker:
    """
    Implementation of the circuit breaker pattern to prevent repeated calls to failing services.
    """
    def __init__(self, failure_threshold: int = 5, recovery_timeout: int = 30, 
                 name: str = "default"):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time = 0
        self.name = name
        
    def __call__(self, func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            return self.call(func, *args, **kwargs)
        return wrapper
    
    def call(self, func: Callable, *args, **kwargs) -> Any:
        """Execute the function with circuit breaker protection"""
        if self.state == CircuitState.OPEN:
            if time.time() > self.last_failure_time + self.recovery_timeout:
                logger.info(f"Circuit {self.name} attempting recovery (half-open)")
                self.state = CircuitState.HALF_OPEN
            else:
                logger.warning(f"Circuit {self.name} is OPEN - failing fast")
                raise CircuitBreakerError(f"Circuit {self.name} is open")
        
        try:
            result = func(*args, **kwargs)
            
            # Reset on success if in half-open state
            if self.state == CircuitState.HALF_OPEN:
                logger.info(f"Circuit {self.name} recovery successful, closing circuit")
                self.reset()
            
            return result
            
        except Exception as e:
            self._handle_failure(e)
            raise
    
    def _handle_failure(self, exception: Exception):
        """Handle a failure by incrementing counters and potentially opening the circuit"""
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.state == CircuitState.HALF_OPEN or self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN
            logger.error(f"Circuit {self.name} OPENED after {self.failure_count} failures")
    
    def reset(self):
        """Reset the circuit breaker to closed state"""
        self.failure_count = 0
        self.state = CircuitState.CLOSED


class CircuitBreakerError(Exception):
    """Exception raised when circuit is open"""
    pass


# Example usage:
# @CircuitBreaker(failure_threshold=3, recovery_timeout=60, name="weather-api")
# def get_weather_data(lat, lon):
#     response = requests.get(f"https://api.weather.com/data?lat={lat}&lon={lon}")
#     response.raise_for_status()
#     return response.json()