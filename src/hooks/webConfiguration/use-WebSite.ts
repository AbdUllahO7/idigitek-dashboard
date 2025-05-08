import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api-client';
import { WebSiteProps } from '@/src/api/types/hooks/WebSite.types';
import { Roles } from '@/src/api/user.types';

// Base WebSite hook
export function useWebSite() {
  const queryClient = useQueryClient();
  const endpoint = '/websites';

  // Query keys
  const websitesKey = ['websites'];
  const websiteKey = (id: string) => [...websitesKey, id];
  const myWebsitesKey = [...websitesKey, 'my'];
  const websiteUsersKey = (websiteId: string) => [...websitesKey, websiteId, 'users'];

  // Get all websites
  const useGetAll = () => {
    return useQuery({
      queryKey: websitesKey,
      queryFn: async () => {
        const { data } = await apiClient.get(endpoint);
        return data?.data?.websites || [];
      },
    });
  };

  // Get a single website by ID
  const useGetById = (id: string) => {
    return useQuery({
      queryKey: websiteKey(id),
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/${id}`);
        return data?.data?.website;
      },
      enabled: !!id,
    });
  };

  // Get all websites for the current user
  const useGetMyWebsites = () => {
    return useQuery({
      queryKey: myWebsitesKey,
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/my`);
        return data?.data?.websites || [];
      },
    });
  };

  // Get all users for a website
  const useGetWebsiteUsers = (websiteId: string) => {
    return useQuery({
      queryKey: websiteUsersKey(websiteId),
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/${websiteId}/users`);
        return data?.data?.users || [];
      },
      enabled: !!websiteId,
    });
  };

  // Create a new website
  const useCreate = () => {
    return useMutation({
      mutationFn: async (createDto: Omit<WebSiteProps, '_id'>) => {
        const { data } = await apiClient.post(endpoint, createDto);
        return data?.data?.website;
      },
      onSuccess: (data) => {
        // Update cache for all websites
        queryClient.invalidateQueries({ queryKey: websitesKey });
        
        // Update cache for my websites
        queryClient.invalidateQueries({ queryKey: myWebsitesKey });
        
        // Add new website to cache if it has an ID
        if (data?._id) {
          queryClient.setQueryData(websiteKey(data._id), data);
          // Store the website ID in localStorage
          localStorage.setItem('websiteId', data._id);
        }
      },
    });
  };

  // Update a website
  const useUpdate = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: string; data: Partial<WebSiteProps> }) => {
        const { data: responseData } = await apiClient.patch(`${endpoint}/${id}`, data);
        return responseData?.data?.website;
      },
      onSuccess: (data, { id }) => {
        // Update specific website cache
        queryClient.setQueryData(websiteKey(id), data);
        
        // Invalidate lists that could contain this website
        queryClient.invalidateQueries({ queryKey: websitesKey, exact: true });
        queryClient.invalidateQueries({ queryKey: myWebsitesKey });
      },
    });
  };

  // Upload logo for a website
  const useUploadLogo = () => {
    return useMutation({
      mutationFn: async ({ id, file }: { id: string; file: File }) => {
        // Create form data for file upload
        const formData = new FormData();
        formData.append('logo', file);
        
        try {
          const response = await apiClient.post(
            `${endpoint}/${id}/logo`, 
            formData, 
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          return response?.data?.data?.website;
        } catch (error) {
          console.error('Error uploading logo:', error);
          throw error;
        }
      },
      onSuccess: (data, { id }) => {
        if (data) {
          // Update specific website cache
          queryClient.setQueryData(websiteKey(id), data);
          
          // Invalidate lists that could contain this website
          queryClient.invalidateQueries({ queryKey: websitesKey, exact: true });
          queryClient.invalidateQueries({ queryKey: myWebsitesKey });
        }
      },
    });
  };

  // Delete a website
  const useDelete = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        await apiClient.delete(`${endpoint}/${id}`);
        return id;
      },
      onSuccess: (id) => {
        // Remove the specific website from cache
        queryClient.removeQueries({ queryKey: websiteKey(id) });
        
        // Invalidate lists of websites
        queryClient.invalidateQueries({ queryKey: websitesKey, exact: true });
        queryClient.invalidateQueries({ queryKey: myWebsitesKey });
        
        // Remove users for this website from cache
        queryClient.removeQueries({ queryKey: websiteUsersKey(id) });
      },
    });
  };

  // Add a user to a website
  const useAddUser = () => {
    return useMutation({
      mutationFn: async ({ 
        websiteId, 
        userId, 
        role 
      }: { 
        websiteId: string; 
        userId: string; 
        role: Roles
      }) => {
        const { data } = await apiClient.post(`${endpoint}/${websiteId}/users`, { userId, role });
        return data?.data?.websiteUser;
      },
      onSuccess: (_, { websiteId }) => {
        // Invalidate the users list for this website
        queryClient.invalidateQueries({ queryKey: websiteUsersKey(websiteId) });
      },
    });
  };

  // Remove a user from a website
  const useRemoveUser = () => {
    return useMutation({
      mutationFn: async ({ websiteId, userId }: { websiteId: string; userId: string }) => {
        await apiClient.delete(`${endpoint}/${websiteId}/users/${userId}`);
        return { websiteId, userId };
      },
      onSuccess: ({ websiteId }) => {
        // Invalidate the users list for this website
        queryClient.invalidateQueries({ queryKey: websiteUsersKey(websiteId) });
      },
    });
  };

  // Return all hooks
  return {
    useGetAll,
    useGetById,
    useGetMyWebsites,
    useGetWebsiteUsers,
    useCreate,
    useUpdate,
    useUploadLogo,
    useDelete,
    useAddUser,
    useRemoveUser,
  };
}