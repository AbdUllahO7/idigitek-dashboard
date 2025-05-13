// src/hooks/webConfiguration/use-users.ts

import { UserStatus } from '@/src/api/user.types';
import apiClient from '@/src/lib/api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Define User interface that matches both frontend and backend
export interface User {
  id: string; // Backend user id
  _id?: string; // Frontend user _id
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status: UserStatus;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  password?: string; // Only used for creation, never returned from API
}

// Define query keys
export const usersKey = ['users'];
export const userKey = (id: string) => [...usersKey, id];
export const ownerUsersKey = [...usersKey, 'owners'];

// API endpoint
const endpoint = '/users';

/**
 * Hook for managing users data and operations
 */
export const useUsers = () => {
    const queryClient = useQueryClient();

  // Get all users
  const useGetAll = () => {
    return useQuery({
      queryKey: usersKey,
      queryFn: async () => {
        const { data: responseData } = await apiClient.get(endpoint);
        
        // Transform response to match frontend expected format
        // Assuming responseData has a data property containing the users array
        if (responseData && responseData.data) {
            responseData.data = responseData.data.map((user: User) => ({
                ...user,
                _id: user.id // Ensure _id is available for frontend
            }));
        }
        
        return responseData;
      }
    });
  };    

  // Get user by ID
  const useGetById = (id: string) => {
    return useQuery({
      queryKey: userKey(id),
      queryFn: async () => {
        const { data: responseData } = await apiClient.get(`${endpoint}/${id}`);
        
        // Transform to match frontend expected format
        if (responseData && responseData.data) {
          responseData.data = {
            ...responseData.data,
            _id: responseData.data.id
          };
        }
        
        return responseData;
      },
      enabled: !!id
    });
  };

  // Create a new user
  const useCreate = () => {
    return useMutation({
      mutationFn: async (userData: Partial<User>) => {
        const { data: responseData } = await apiClient.post(endpoint, userData);
        return responseData;
      },
      onSuccess: () => {
        // Invalidate users query to refresh the list
        queryClient.invalidateQueries({ queryKey: usersKey });
      }
    });
  };

  // Update a user
  const useUpdate = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
        // For general updates (admin)
        let url = `${endpoint}/${id}`;
        
        // Handle special case for updating profile
        // If only firstName/lastName is being updated, use the profile endpoint
        if (Object.keys(data).every(key => ['firstName', 'lastName'].includes(key))) {
          url = `${endpoint}/me`;
        }
        
        // For role or status updates, use specific endpoints
        if (data.role && Object.keys(data).length === 1) {
          url = `${endpoint}/${id}/role`;
        } else if (data.status && Object.keys(data).length === 1) {
          url = `${endpoint}/${id}/status`;
        }
        
        const { data: responseData } = await apiClient.put(url, data);
        return responseData;
      },
      onSuccess: (data, { id }) => {
        // Update cache and invalidate queries
        queryClient.setQueryData(userKey(id), data);
        queryClient.invalidateQueries({ queryKey: usersKey });
      }
    });
  };

  // Update user profile (current user only)
  const useUpdateProfile = () => {
    return useMutation({
      mutationFn: async (profileData: Partial<User>) => {
        // Only allow these fields to be updated in profile
        const allowedFields = ['firstName', 'lastName', 'email', 'password'];
        const filteredData = Object.fromEntries(
          Object.entries(profileData).filter(([key]) => allowedFields.includes(key))
        );
        
        const { data: responseData } = await apiClient.put(`${endpoint}/me`, filteredData);
        return responseData;
      },
      onSuccess: (data) => {
        // Invalidate current user query and general users query
        queryClient.invalidateQueries({ queryKey: [...usersKey, 'me'] });
        queryClient.invalidateQueries({ queryKey: usersKey });
      }
    });
  };

  // Delete a user
  const useDelete = () => {
      return useMutation({
      mutationFn: async (id: string) => {
          const { data: responseData } = await apiClient.delete(`${endpoint}/${id}`);
          return responseData;
      },
      onSuccess: () => {
          // Invalidate users query to refresh the list
          queryClient.invalidateQueries({ queryKey: usersKey });
      }
      });
  };

  // Get current user profile
  const useGetCurrentUser = () => {
      return useQuery({
      queryKey: [...usersKey, 'me'],
      queryFn: async () => {
          const { data: responseData } = await apiClient.get(`${endpoint}/me`);
          
          // Transform to match frontend expected format
          if (responseData && responseData.data) {
          responseData.data = {
              ...responseData.data,
              _id: responseData.data.id
          };
          }
          
          return responseData;
      }
      });
  };

  const useGetOwners = () => {
    return useQuery({
      queryKey: ownerUsersKey,
      queryFn: async () => {
        const { data: responseData } = await apiClient.get(`${endpoint}/owners`);
        // Transform response to match frontend expected format
        if (responseData && responseData.data) {
          responseData.data = responseData.data.map((user: User) => ({
            ...user,
            _id: user.id // Ensure _id is available for frontend
          }));
        }
        
        return responseData;
      }
    });
  }

    return {
        useGetAll,
        useGetById,
        useCreate,
        useUpdate,
        useDelete,
        useGetCurrentUser,
        useUpdateProfile,
        useGetOwners
    };
};


export default useUsers;