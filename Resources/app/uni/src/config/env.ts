 const defaultApiConfig = {
  baseURL: import.meta.env.DEV
    ? '/front-api'
    : import.meta.env.VITE_API_BASE_URL,
  accessToken: import.meta.env.VITE_API_ACCESS_TOKEN || ''
};

export const apiConfig =
  (typeof window !== 'undefined' && (window as any).apiConfig) || defaultApiConfig;
