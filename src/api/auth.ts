// src/api/auth.ts
import { useMutation } from '@tanstack/react-query';
import apiClient from '../lib/api-client';

// For debugging - each instance gets a unique ID
const API_ID = Math.random().toString(36).substring(2, 9);

// Request types
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name: string;
}

// Response types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: AuthTokens;
  };
  timestamp: string;
  requestId: string;
}

// Error processing function to get clear error messages
export const extractErrorMessage = (error: any): string => {
  // Check for axios error response format
  if (error.response) {
    // Check for error message in response data
    if (error.response.data) {
      // Common API error patterns
      if (error.response.data.message) {
        return error.response.data.message;
      }
      if (error.response.data.error) {
        return typeof error.response.data.error === 'string' 
          ? error.response.data.error 
          : error.response.data.error.message || JSON.stringify(error.response.data.error);
      }
      if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
        return error.response.data.errors[0]?.message || error.response.data.errors[0] || "Multiple errors occurred";
      }
    }
    
    // If no structured message, use status text
    if (error.response.statusText) {
      return `${error.response.status}: ${error.response.statusText}`;
    }
  }
  
  // Fallback to error message or default
  return error.message || "An unknown error occurred";
}

// Helper to safely store tokens
const storeTokens = (tokens: AuthTokens | undefined | null) => {
  if (!tokens) {
    console.log(`[AuthAPI ${API_ID}] No tokens to store`);
    return false;
  }
  
  try {
    localStorage.setItem('token', tokens.accessToken);
    if (tokens.refreshToken) {
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
    return true;
  } catch (e) {
    console.error(`[AuthAPI ${API_ID}] Failed to store tokens:`, e);
    return false;
  }
};

// Resend activation email
export const useResendActivation = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      try {
        const response = await apiClient.post('/auth/resend-activation', { email });
        return response.data;
      } catch (error) {
        console.error(`[AuthAPI ${API_ID}] Resend activation failed:`, error);
        const errorMessage = extractErrorMessage(error);
        // Create a structured error with the message
        const structuredError = new Error(errorMessage);
        // Add the original error properties
        Object.assign(structuredError, error);
        throw structuredError;
      }
    }
  });
};

// Login hook with improved error handling
export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        const response = await apiClient.post('/auth/login', credentials);
        const responseData = response.data;
        
        // Store tokens in localStorage
        if (responseData?.data?.tokens) {
          storeTokens(responseData.data.tokens);
        } else {
          console.error(`[AuthAPI ${API_ID}] No tokens in login response`);
        }
        
        return responseData;
      } catch (error) {
        console.error(`[AuthAPI ${API_ID}] Login request failed:`, extractErrorMessage(error));
        
        // Create a structured error with the extracted message
        const errorMessage = extractErrorMessage(error);
        const structuredError = new Error(errorMessage);
        
        // Add the original error properties
        Object.assign(structuredError, error);
        
        throw structuredError;
      }
    }
  });
};

// Register hook with improved error handling
export const useRegister = () => {
  return useMutation({
    mutationFn: async (userData: RegisterData): Promise<AuthResponse> => {
      
      try {
        const response = await apiClient.post('/auth/register', userData);
        const responseData = response.data;
        
        
        // Store tokens in localStorage
        if (responseData?.data?.tokens) {
          storeTokens(responseData.data.tokens);
        } else {
          console.error(`[AuthAPI ${API_ID}] No tokens in register response`);
        }
        
        return responseData;
      } catch (error) {
        console.error(`[AuthAPI ${API_ID}] Registration request failed:`, extractErrorMessage(error));
        
        // Create a structured error with the extracted message
        const errorMessage = extractErrorMessage(error);
        const structuredError = new Error(errorMessage);
        
        // Add the original error properties
        Object.assign(structuredError, error);
        
        throw structuredError;
      }
    }
  });
};

// Logout hook
export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      try {
        // Check if we have a token before attempting to call the logout endpoint
        const token = localStorage.getItem('token');
        if (token) {
          // Send logout request to API but don't wait for it to complete
          // This way we always clear local storage regardless of API response
          apiClient.post('/auth/logout').catch(err => {
            // Silent catch - we'll clear storage anyway
          });
        }
      } catch (error) {
        // Silent catch
      } finally {
        // Always clear local storage, even if API call fails
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('userData');
      }
      return true; // Always return success
    }
  });
};

// Get current user hook with retry mechanism
export const useCurrentUser = () => {
  return useMutation({
    mutationFn: async () => {
      try {
        const response = await apiClient.get('/users/me');
        
        // Check all possible paths for user data
        let userData = null;
        
        if (response.data && response.data.user) {
          // First check the expected path
          userData = response.data.user;
        } else if (response.data && response.data.data) {
          // Check if data is nested in a 'data' field
          if (response.data.data.user) {
            // Check if user is in data.data.user
            userData = response.data.data.user;
          } else {
            // Maybe the data itself is the user object - check for required fields
            const possibleUser = response.data.data;
            if (possibleUser.id && possibleUser.email) {
              userData = possibleUser;
            }
          }
        }
        
        if (userData) {
          return userData;
        } else {
          return null;
        }
      } catch (error: any) {
        console.error(`[AuthAPI ${API_ID}] Current user request failed:`, extractErrorMessage(error));
        
        // For 401/403 errors, clear tokens
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          sessionStorage.removeItem('userData');
        }
        
        // Always return null for user on error
        return null;
      }
    }
  });
};