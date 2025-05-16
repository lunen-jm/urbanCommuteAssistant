/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_MAPBOX_TOKEN: string;
  readonly VITE_ENV_NAME: string;
  readonly VITE_ENABLE_DEBUG: string;
  readonly VITE_ENABLE_CACHE: string;
  // Add other environment variables as needed
  [key: string]: string | undefined; // Allow string indexing for dynamic access
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}