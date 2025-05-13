'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin, useLogout, useRegister, useCurrentUser } from '../api/auth';
import apiClient from '../lib/api-client';
import { useQueryClient } from '@tanstack/react-query'; // Add this import

// Define user type
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  firstName: string
}

// Define auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// For debugging - each context instance gets a unique ID
const CONTEXT_ID = Math.random().toString(36).substring(2, 9);

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Store for keeping track of the auth state, isolating changes
interface UserStore {
  user: User | null;
  version: number;
  timestamp: number;
}

// Create the auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  // Main state
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  // Get query client for cache management
  const queryClient = useQueryClient();
  
  // Refs for stabilizing state and preventing double updates
  const userRef = useRef<User | null>(null);
  const isAuthCheckedRef = useRef(false);
  const stateLockRef = useRef(false);
  const stateVersionRef = useRef(0);
  const prevUserIdRef = useRef<string | null>(null);
  
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const currentUserMutation = useCurrentUser();

  // Function to reset the React Query cache
  const resetQueryCache = () => {
    
    // This marks all queries as stale, forcing them to refetch
    queryClient.invalidateQueries();
    
    // For critical user-specific data, consider removing them entirely
    queryClient.removeQueries({ queryKey: ['websites'] });
    queryClient.removeQueries({ queryKey: ['website'] });
    queryClient.removeQueries({ queryKey: ['languages'] });
    queryClient.removeQueries({ queryKey: ['sections'] });
  };

  // Persist user data to both refs and sessionStorage
  const persistUser = (userData: User | null) => {
    if (stateLockRef.current) {
      return;
    }

    // Check if user has changed - if so, reset cache
    const currentUserId = userRef.current?.id;
    const newUserId = userData?.id;
    
    if (currentUserId !== newUserId) {
      // User has changed - clear the cache
      resetQueryCache();
      prevUserIdRef.current = newUserId;
    }
    
    // Lock the state to prevent rapid changes
    stateLockRef.current = true;
    
    // Update ref immediately
    userRef.current = userData;
    stateVersionRef.current += 1;
    
    // Store in sessionStorage for persistence across page navigations
    if (userData) {
      try {
        const userStore: UserStore = {
          user: userData,
          version: stateVersionRef.current,
          timestamp: Date.now()
        };
        sessionStorage.setItem('userData', JSON.stringify(userStore));
      } catch (e) {
        // Handle storage error silently
      }
    } else if (typeof window !== 'undefined') {
      // Clear sessionStorage when user is null
      sessionStorage.removeItem('userData');
    }
    
    // Update state
    setUser(userData);
    
    // Release lock after a short delay to ensure state updates complete
    setTimeout(() => {
      stateLockRef.current = false;
    }, 100);
  };

  // Set up auth header whenever the token changes
  const setupAuthHeader = (token: string | null) => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  };
  
  // Check if user is logged in on initial load
  useEffect(() => {
    // Skip if already checked or server-side
    if (isAuthCheckedRef.current || typeof window === 'undefined') {
      return;
    }

    const checkAuth = async () => {
      try {
        // First, try to restore from sessionStorage (faster than API call)
        let restoredFromSession = false;
        
        try {
          const storedUserData = sessionStorage.getItem('userData');
          if (storedUserData) {
            const userStore = JSON.parse(storedUserData) as UserStore;
            
            // Check if data is reasonably fresh (less than 30 minutes old)
            const isFresh = Date.now() - userStore.timestamp < 30 * 60 * 1000;
            
            if (userStore.user && isFresh) {
              userRef.current = userStore.user;
              stateVersionRef.current = userStore.version;
              setUser(userStore.user);
              restoredFromSession = true;
              
              // Even if we restore from session, still set up auth header
              const token = localStorage.getItem('token');
              if (token) {
                setupAuthHeader(token);
              }
            }
          }
        } catch (e) {
          sessionStorage.removeItem('userData');
        }
        
        // Proceed with API check if we have a token
        const token = localStorage.getItem('token');
        
        if (!token) {
          if (!restoredFromSession) {
            persistUser(null);
          }
          return;
        }
        
        // Set up the auth header
        setupAuthHeader(token);
        
        // Always verify with API for security, even if restored from session
        try {
          const userData = await currentUserMutation.mutateAsync();
          
          if (userData) {
            persistUser(userData);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            sessionStorage.removeItem('userData');
            setupAuthHeader(null);
            persistUser(null);
          }
        } catch (apiError) {
          if (restoredFromSession) {
            // Keep the session data if API fails but we restored from session
          } else {
            // Clear auth if API fails and we didn't restore from session
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            sessionStorage.removeItem('userData');
            setupAuthHeader(null);
            persistUser(null);
          }
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('userData');
        setupAuthHeader(null);
        persistUser(null);
      } finally {
        isAuthCheckedRef.current = true;
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Listen for storage events (in case another tab logs out)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (!e.newValue) {
          persistUser(null);
          setupAuthHeader(null);
        } else if (e.newValue !== localStorage.getItem('token')) {
          window.location.reload();
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUserMutation]);
  
  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // First, clear previous user's cache data before login
      resetQueryCache();
      
      // Call login mutation
      const response = await loginMutation.mutateAsync({ email, password });
      
      // Get the token from the response or localStorage
      const token = response?.data?.tokens?.accessToken || localStorage.getItem('token');
      
      if (token) {
        setupAuthHeader(token);
        
        // Get user data
        if (response?.data?.user) {
          persistUser(response.data.user);
        } else {
          // If no user in response, try to fetch it
          try {
            const userData = await currentUserMutation.mutateAsync();
            if (userData) {
              persistUser(userData);
            } else {
              throw new Error("Failed to get user data");
            }
          } catch (userError) {
            // Clear tokens if we can't get user data
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            sessionStorage.removeItem('userData');
            setupAuthHeader(null);
            throw userError;
          }
        }
        
        // Navigate to dashboard or redirect URL
        router.push('/dashboard');
      } else {
        throw new Error("Authentication failed - no token received");
      }
    } catch (error) {
      // Clear tokens on login failure
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('userData');
      setupAuthHeader(null);
      persistUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Clear cache before registration
      resetQueryCache();
      
      const response = await registerMutation.mutateAsync({ name, email, password });
      
      // Get token from response or localStorage
      const token = response?.data?.tokens?.accessToken || localStorage.getItem('token');
      
      if (token) {
        setupAuthHeader(token);
        
        // Get user data
        if (response?.data?.user) {
          persistUser(response.data.user);
        } else {
          // If no user in response, try to fetch it
          const userData = await currentUserMutation.mutateAsync();
          if (userData) {
            persistUser(userData);
          } else {
            throw new Error("Failed to get user data after registration");
          }
        }
        
        router.push('/dashboard');
      } else {
        throw new Error("Registration failed - no token received");
      }
    } catch (error) {
      // Clear tokens on registration failure
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('userData');
      setupAuthHeader(null);
      persistUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Clear cache immediately when logging out
      resetQueryCache();
      
      await logoutMutation.mutateAsync();
    } catch (error) {
      // Silent catch
    } finally {
      // Always clear everything, even if server-side logout fails
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('userData');
      setupAuthHeader(null);
      persistUser(null);
      setIsLoading(false);
      router.push('/sign-in');
    }
  };
  
  // Calculate authentication status
  const isAuthenticated = user !== null;
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}