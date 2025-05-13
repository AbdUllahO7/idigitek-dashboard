import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api-client';
import { Language } from '@/src/api/types/hooks/language.types';
import { useAuth } from '@/src/context/AuthContext'; // Import your auth context if available

// Base language hook
export function useLanguages() {
  const queryClient = useQueryClient();
  const endpoint = '/languages';
  
  // Get current user ID from auth context to include in query keys (if available)
  const { user } = useAuth?.() || { user: { id: 'anonymous' } };
  const userId = user?.id || 'anonymous';
  
  // Query keys now include user ID to prevent cross-user cache conflicts
  const languagesKey = ['languages', userId];
  const languageKey = (id: string) => [...languagesKey, id];
  const websiteLanguagesKey = (websiteId: string) => [...languagesKey, 'website', websiteId];

  // Get all languages (optionally filtered by websiteId and/or isActive)
  const useGetAll = (filters?: { websiteId?: string; isActive?: boolean }) => {
    const queryParams = new URLSearchParams();
    
    if (filters?.websiteId) {
      queryParams.append('websiteId', filters.websiteId);
    }
    
    if (filters?.isActive !== undefined) {
      queryParams.append('isActive', filters.isActive.toString());
    }
    
    // Create a unique query key based on filters
    const queryKey = filters 
      ? [...languagesKey, JSON.stringify(filters)]
      : languagesKey;
    
    return useQuery({
      queryKey: queryKey,
      queryFn: async () => {
        const url = queryParams.toString() 
          ? `${endpoint}?${queryParams.toString()}` 
          : endpoint;
        const { data } = await apiClient.get(url);
        return data;
      },
      staleTime: 30 * 1000, // 30 seconds
    });
  };

  // Get all languages for a specific website
  const useGetByWebsite = (websiteId: string, options?: { isActive?: boolean }) => {
    const queryParams = new URLSearchParams();
    
    if (options?.isActive !== undefined) {
      queryParams.append('isActive', options.isActive.toString());
    }
    
    return useQuery({
      queryKey: websiteLanguagesKey(websiteId),
      queryFn: async () => {
        const url = queryParams.toString() 
          ? `${endpoint}/website/${websiteId}?${queryParams.toString()}` 
          : `${endpoint}/website/${websiteId}`;
        const { data } = await apiClient.get(url);
        return data;
      },
      enabled: !!websiteId,
      staleTime: 30 * 1000, // 30 seconds
    });
  };

  // Get a single language by ID
  const useGetById = (id: string) => {
    return useQuery({
      queryKey: languageKey(id),
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/${id}`);
        return data;
      },
      enabled: !!id,
      staleTime: 30 * 1000, // 30 seconds
    });
  };

  // Create a new language
  const useCreate = () => {
    return useMutation({
      mutationFn: async (createDto: Omit<Language, '_id'>) => {
        const { data } = await apiClient.post(endpoint, createDto);
        return data;
      },
      onSuccess: (data) => {
        // Update general languages cache
        queryClient.invalidateQueries({ queryKey: languagesKey, exact: true });
        
        // Update website-specific cache if websiteId is available
        if (data.data?.websiteId) {
          queryClient.invalidateQueries({ 
            queryKey: websiteLanguagesKey(data.data.websiteId)
          });
        }
        
        // Update specific language cache if ID is available
        if (data.data?._id) {
          queryClient.setQueryData(languageKey(data.data._id), data);
        }
      },
    });
  };

  // Update a language
  const useUpdate = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: string; data: Partial<Language> }) => {
        const { data: responseData } = await apiClient.put(`${endpoint}/${id}`, data);
        return responseData;
      },
      onSuccess: (data, { id }) => {
        // Update specific language cache
        queryClient.setQueryData(languageKey(id), data);
        
        // Update general languages cache
        queryClient.invalidateQueries({ queryKey: languagesKey, exact: true });
        
        // Update website-specific cache if websiteId is available
        if (data.data?.websiteId) {
          queryClient.invalidateQueries({ 
            queryKey: websiteLanguagesKey(data.data.websiteId)
          });
        }
        
        // If the websiteId was changed, also invalidate the old website's languages
        const previousLanguage = queryClient.getQueryData<{ data: { websiteId: string } }>(languageKey(id));
        if (previousLanguage?.data?.websiteId && 
            previousLanguage.data.websiteId !== data.data?.websiteId) {
          queryClient.invalidateQueries({ 
            queryKey: websiteLanguagesKey(previousLanguage.data.websiteId)
          });
        }
      },
    });
  };

  // Toggle active status
  const useToggleActive = () => {
    return useMutation({
      mutationFn: async ({ id }: { id: string }) => {
        const { data: responseData } = await apiClient.patch(`${endpoint}/${id}/toggle`);
        return responseData;
      },
      onSuccess: (data, { id }) => {
        // Update specific language cache
        queryClient.setQueryData(languageKey(id), data);
        
        // Update general languages cache
        queryClient.invalidateQueries({ queryKey: languagesKey, exact: true });
        
        // Update website-specific cache if websiteId is available
        if (data.data?.websiteId) {
          queryClient.invalidateQueries({ 
            queryKey: websiteLanguagesKey(data.data.websiteId)
          });
        }
      },
    });
  };

  // Update active status
  const useUpdateActive = () => {
    return useMutation({
      mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
        const { data: responseData } = await apiClient.patch(`${endpoint}/${id}/status`, { isActive });
        return responseData;
      },
      onSuccess: (data, { id }) => {
        // Update specific language cache
        queryClient.setQueryData(languageKey(id), data);
        
        // Update general languages cache
        queryClient.invalidateQueries({ queryKey: languagesKey, exact: true });
        
        // Update website-specific cache if websiteId is available
        if (data.data?.websiteId) {
          queryClient.invalidateQueries({ 
            queryKey: websiteLanguagesKey(data.data.websiteId)
          });
        }
      },
    });
  };

  // Batch update language statuses
  const useBatchUpdateStatuses = () => {
    return useMutation({
      mutationFn: async (updates: { id: string; isActive: boolean }[]) => {
        const { data: responseData } = await apiClient.post(`${endpoint}/batch-update`, { updates });
        return responseData;
      },
      onSuccess: () => {
        // Invalidate all language queries as we don't know which ones changed
        queryClient.invalidateQueries({ queryKey: languagesKey });
      },
    });
  };

  // Delete a language
  const useDelete = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        // Get language data before deleting to know which website cache to invalidate
        const { data } = await apiClient.get(`${endpoint}/${id}`);
        const websiteId = data?.data?.websiteId;
        
        // Delete the language
        await apiClient.delete(`${endpoint}/${id}`);
        
        return { websiteId };
      },
      onSuccess: (result, id) => {
        // Remove the specific language from cache
        queryClient.removeQueries({ queryKey: languageKey(id) });
        
        // Update general languages cache
        queryClient.invalidateQueries({ queryKey: languagesKey, exact: true });
        
        // Update website-specific cache if websiteId was available
        if (result.websiteId) {
          queryClient.invalidateQueries({ 
            queryKey: websiteLanguagesKey(result.websiteId)
          });
        }
      },
    });
  };

  // Return all hooks
  return {
    useGetAll,
    useGetByWebsite,
    useGetById,
    useCreate,
    useUpdate,
    useToggleActive,
    useUpdateActive,
    useBatchUpdateStatuses,
    useDelete,
  };
}