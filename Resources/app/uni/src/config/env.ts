export const apiConfig = {
  baseURL: import.meta.env.DEV
    ? '/front-api'
    : import.meta.env.VITE_API_BASE_URL,
  accessToken: import.meta.env.VITE_API_ACCESS_TOKEN || ''
};
