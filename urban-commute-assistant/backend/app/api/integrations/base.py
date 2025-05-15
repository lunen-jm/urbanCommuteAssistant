from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, TypeVar, Generic, List, Union
from pydantic import BaseModel

# Generic type for query parameters
QueryParameters = TypeVar('QueryParameters', bound=BaseModel)
# Generic type for normalized data
NormalizedData = TypeVar('NormalizedData', bound=BaseModel)
# Generic type for fallback data
FallbackData = TypeVar('FallbackData', bound=BaseModel)

class DataSourceAdapter(Generic[QueryParameters, NormalizedData, FallbackData], ABC):
    """
    Base adapter interface for all data sources.
    Implements the Adapter Pattern to standardize interfaces for different data providers.
    """
    
    @abstractmethod
    async def fetch_data(self, params: QueryParameters) -> NormalizedData:
        """
        Fetch data from the external API and return normalized data
        """
        pass
    
    @abstractmethod
    async def handle_errors(self, error: Any) -> Optional[FallbackData]:
        """
        Handle errors from the external API, and optionally return fallback data
        """
        pass
    
    @abstractmethod
    async def health_check(self) -> bool:
        """
        Check if the external API is healthy and responding
        """
        pass
    
    @abstractmethod
    def get_cache_key(self, params: QueryParameters) -> str:
        """
        Generate a cache key for the given parameters
        """
        pass
    
    @abstractmethod
    def get_cache_ttl(self) -> int:
        """
        Get the TTL (time to live) for cached data in seconds
        """
        pass
