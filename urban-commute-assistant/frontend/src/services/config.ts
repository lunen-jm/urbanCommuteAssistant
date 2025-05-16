// Frontend configuration service to centralize API and environment variable handling
// This provides a single source of truth for configuration in the frontend

/**
 * Environment variables available to the frontend application
 * These will be loaded from .env or environment at build time
 */
export interface EnvConfig {
  /** Base URL for the backend API */
  apiUrl: string;
  
  /** Environment name: development, staging, production */
  envName: string;
  
  /** Feature flags */
  features: {
    enableDebug: boolean;
    enableCache: boolean;
  };
}

/**
 * Default configuration values
 * Will be used if environment variables are not set
 */
const DEFAULT_CONFIG: EnvConfig = {
  apiUrl: 'http://localhost:8000/api',
  envName: 'development',
  features: {
    enableDebug: true,
    enableCache: true,
  }
};

/**
 * Get configuration from environment variables
 * Follows the standard Vite environment variable pattern with VITE_ prefix
 */
function loadEnvConfig(): EnvConfig {
  console.log('Loading environment configuration...');

  // When running in browser, we need to handle API URLs correctly
  let apiUrl = import.meta.env.VITE_API_URL || DEFAULT_CONFIG.apiUrl;
  
  // In browser context
  if (typeof window !== 'undefined') {
    console.log('Original API URL:', apiUrl);
    
    // For Docker Compose setups, try to use the window's hostname
    if (window.location.hostname !== 'localhost' && apiUrl.includes('localhost')) {
      // Keep the original port but replace localhost with the current hostname
      const port = apiUrl.match(/:(\d+)/)?.[1] || '8000';
      apiUrl = `http://${window.location.hostname}:${port}/api`;
      console.log('Adjusted API URL for Docker environment:', apiUrl);
    }
  }
  
  return {
    apiUrl,
    envName: import.meta.env.VITE_ENV_NAME || DEFAULT_CONFIG.envName,
    features: {
      enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true' || DEFAULT_CONFIG.features.enableDebug,
      enableCache: import.meta.env.VITE_ENABLE_CACHE !== 'false' && DEFAULT_CONFIG.features.enableCache,
    }
  };
}

// Create a singleton instance of the configuration
export const config = loadEnvConfig();

/**
 * Configuration service for the application
 * Provides methods to access configuration values
 */
export class ConfigService {
  private static instance: ConfigService;
  private config: EnvConfig;

  private constructor() {
    this.config = loadEnvConfig();
  }

  /**
   * Get the singleton instance of the ConfigService
   */
  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * Get the API URL with an optional path
   * @param path Optional path to append to the API URL
   * @returns The full API URL
   */
  public getApiUrl(path?: string): string {
    const baseUrl = this.config.apiUrl;
    if (!path) return baseUrl;
    
    // Ensure proper path joining with slashes
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    return `${baseUrl}/${normalizedPath}`;
  }

  /**
   * Get a feature flag value
   * @param featureName Name of the feature flag
   * @returns Boolean indicating if the feature is enabled
   */
  public isFeatureEnabled(featureName: keyof EnvConfig['features']): boolean {
    return this.config.features[featureName];
  }

  /**
   * Check if we're in development mode
   */
  public isDevelopment(): boolean {
    return this.config.envName === 'development';
  }

  /**
   * Get the full configuration object
   */
  public getConfig(): EnvConfig {
    return { ...this.config }; // Return a copy to prevent modification
  }
}

// Export a singleton instance for easy import
export default ConfigService.getInstance();
