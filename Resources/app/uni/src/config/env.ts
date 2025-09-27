let defaultApiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL,
  accessToken: import.meta.env.VITE_API_ACCESS_TOKEN || ''
}

// #ifdef H5

defaultApiConfig.baseURL = '/front-api'
// #endif

export const apiConfig =
  (typeof window !== 'undefined' && (window as any).apiConfig) || defaultApiConfig
