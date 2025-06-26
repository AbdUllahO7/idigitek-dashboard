// src/lib/api-client.ts
// If you don't need to send cookies/credentials, remove withCredentials

import axios, { AxiosError, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

const apiClient = axios.create({
  baseURL: `${API_URL}/api/${API_VERSION}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // ❌ Remove this line if you don't need credentials
  // withCredentials: true,
});

// Keep your existing interceptors...
apiClient.interceptors.request.use(
  (config) => {
    console.log('🚀 Making API request:', {
      url: config.url,
      method: config.method?.toUpperCase(),
      fullURL: `${config.baseURL}${config.url}`,
    });
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('✅ API response received:', {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ API Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

export default apiClient;