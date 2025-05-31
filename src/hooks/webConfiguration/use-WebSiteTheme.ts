import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api-client';
import { useAuth } from '@/src/context/AuthContext'; // Import your auth context if available
import { CreateWebSiteThemeDto, UpdateWebSiteThemeDto, WebSiteTheme } from '@/src/api/types/hooks/useWebSiteTheme';


// WebSite Theme hook
export function useWebSiteThemes() {
  const queryClient = useQueryClient();
  const endpoint = '/themes';
  
  // Get current user ID from auth context to include in query keys (if available)
  const { user } = useAuth?.() || { user: { id: 'anonymous' } };
  const userId = user?.id || 'anonymous';
  
  // Query keys now include user ID to prevent cross-user cache conflicts
  const themesKey = ['themes', userId];
  const themeKey = (id: string) => [...themesKey, id];
  const websiteThemesKey = (websiteId: string) => [...themesKey, 'website', websiteId];
  const activeThemeKey = (websiteId: string) => [...themesKey, 'website', websiteId, 'active'];

  // Get all themes (admin function - paginated)
  const useGetAll = (options?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    
    if (options?.page) {
      queryParams.append('page', options.page.toString());
    }
    
    if (options?.limit) {
      queryParams.append('limit', options.limit.toString());
    }
    
    // Create a unique query key based on pagination
    const queryKey = options 
      ? [...themesKey, 'all', JSON.stringify(options)]
      : [...themesKey, 'all'];
    
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

  // Get all themes for a specific website
  const useGetByWebsite = (websiteId: string) => {
    return useQuery({
      queryKey: websiteThemesKey(websiteId),
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/website/${websiteId}`);
        return data;
      },
      enabled: !!websiteId,
      staleTime: 30 * 1000, // 30 seconds
    });
  };

  // Get active theme for a specific website
  const useGetActiveTheme = (websiteId: string) => {
    return useQuery({
      queryKey: activeThemeKey(websiteId),
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/website/${websiteId}/active`);
        return data;
      },
      enabled: !!websiteId,
      staleTime: 30 * 1000, // 30 seconds
    });
  };

  // Get a single theme by ID
  const useGetById = (id: string) => {
    return useQuery({
      queryKey: themeKey(id),
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/${id}`);
        return data;
      },
      enabled: !!id,
      staleTime: 30 * 1000, // 30 seconds
    });
  };

  // Create a new theme
  const useCreate = () => {
    return useMutation({
      mutationFn: async (createDto: CreateWebSiteThemeDto) => {
        const { data } = await apiClient.post(endpoint, createDto);
        return data;
      },
      onSuccess: (data) => {
        // Update general themes cache
        queryClient.invalidateQueries({ queryKey: [...themesKey, 'all'] });
        
        // Update website-specific cache if websiteId is available
        if (data.data?.websiteId) {
          queryClient.invalidateQueries({ 
            queryKey: websiteThemesKey(data.data.websiteId)
          });
          
          // Update active theme cache if this theme is active
          if (data.data.isActive) {
            queryClient.setQueryData(activeThemeKey(data.data.websiteId), data);
          }
        }
        
        // Update specific theme cache if ID is available
        if (data.data?._id) {
          queryClient.setQueryData(themeKey(data.data._id), data);
        }
      },
    });
  };

  // Update a theme
  const useUpdate = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: string; data: UpdateWebSiteThemeDto }) => {
        const { data: responseData } = await apiClient.put(`${endpoint}/${id}`, data);
        return responseData;
      },
      onSuccess: (data, { id }) => {
        // Update specific theme cache
        queryClient.setQueryData(themeKey(id), data);
        
        // Update general themes cache
        queryClient.invalidateQueries({ queryKey: [...themesKey, 'all'] });
        
        // Update website-specific cache if websiteId is available
        if (data.data?.websiteId) {
          queryClient.invalidateQueries({ 
            queryKey: websiteThemesKey(data.data.websiteId)
          });
          
          // Update active theme cache if this theme is active
          if (data.data.isActive) {
            queryClient.setQueryData(activeThemeKey(data.data.websiteId), data);
          }
        }
        
        // If the websiteId was changed, also invalidate the old website's themes
        const previousTheme = queryClient.getQueryData<{ data: { websiteId: string } }>(themeKey(id));
        if (previousTheme?.data?.websiteId && 
            previousTheme.data.websiteId !== data.data?.websiteId) {
          queryClient.invalidateQueries({ 
            queryKey: websiteThemesKey(previousTheme.data.websiteId)
          });
          queryClient.invalidateQueries({ 
            queryKey: activeThemeKey(previousTheme.data.websiteId)
          });
        }
      },
    });
  };

  // Update theme colors only
  const useUpdateColors = () => {
    return useMutation({
      mutationFn: async ({ id, colors }: { id: string; colors: Partial<WebSiteTheme['colors']> }) => {
        const { data: responseData } = await apiClient.patch(`${endpoint}/${id}/colors`, { colors });
        return responseData;
      },
      onSuccess: (data, { id }) => {
        // Update specific theme cache
        queryClient.setQueryData(themeKey(id), data);
        
        // Update website-specific cache if websiteId is available
        if (data.data?.websiteId) {
          queryClient.invalidateQueries({ 
            queryKey: websiteThemesKey(data.data.websiteId)
          });
          
          // Update active theme cache if this theme is active
          if (data.data.isActive) {
            queryClient.setQueryData(activeThemeKey(data.data.websiteId), data);
          }
        }
      },
    });
  };

  // Update theme fonts only
  const useUpdateFonts = () => {
    return useMutation({
      mutationFn: async ({ id, fonts }: { id: string; fonts: Partial<WebSiteTheme['fonts']> }) => {
        const { data: responseData } = await apiClient.patch(`${endpoint}/${id}/fonts`, { fonts });
        return responseData;
      },
      onSuccess: (data, { id }) => {
        // Update specific theme cache
        queryClient.setQueryData(themeKey(id), data);
        
        // Update website-specific cache if websiteId is available
        if (data.data?.websiteId) {
          queryClient.invalidateQueries({ 
            queryKey: websiteThemesKey(data.data.websiteId)
          });
          
          // Update active theme cache if this theme is active
          if (data.data.isActive) {
            queryClient.setQueryData(activeThemeKey(data.data.websiteId), data);
          }
        }
      },
    });
  };

  // Set active theme
  const useSetActiveTheme = () => {
    return useMutation({
      mutationFn: async ({ websiteId, themeId }: { websiteId: string; themeId: string }) => {
        const { data: responseData } = await apiClient.patch(`${endpoint}/website/${websiteId}/active/${themeId}`);
        return responseData;
      },
      onSuccess: (data, { websiteId, themeId }) => {
        // Update specific theme cache
        queryClient.setQueryData(themeKey(themeId), data);
        
        // Update active theme cache
        queryClient.setQueryData(activeThemeKey(websiteId), data);
        
        // Invalidate all themes for this website to update isActive status
        queryClient.invalidateQueries({ 
          queryKey: websiteThemesKey(websiteId)
        });
        
        // Update general themes cache
        queryClient.invalidateQueries({ queryKey: [...themesKey, 'all'] });
      },
    });
  };

  // Clone theme
  const useCloneTheme = () => {
    return useMutation({
      mutationFn: async ({ id, themeName }: { id: string; themeName: string }) => {
        const { data: responseData } = await apiClient.post(`${endpoint}/${id}/clone`, { themeName });
        return responseData;
      },
      onSuccess: (data) => {
        // Update general themes cache
        queryClient.invalidateQueries({ queryKey: [...themesKey, 'all'] });
        
        // Update website-specific cache if websiteId is available
        if (data.data?.websiteId) {
          queryClient.invalidateQueries({ 
            queryKey: websiteThemesKey(data.data.websiteId)
          });
        }
        
        // Update specific theme cache if ID is available
        if (data.data?._id) {
          queryClient.setQueryData(themeKey(data.data._id), data);
        }
      },
    });
  };

  // Delete a theme
  const useDelete = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        // Get theme data before deleting to know which website cache to invalidate
        const { data } = await apiClient.get(`${endpoint}/${id}`);
        const websiteId = data?.data?.websiteId;
        const isActive = data?.data?.isActive;
        
        // Delete the theme
        await apiClient.delete(`${endpoint}/${id}`);
        
        return { websiteId, isActive };
      },
      onSuccess: (result, id) => {
        // Remove the specific theme from cache
        queryClient.removeQueries({ queryKey: themeKey(id) });
        
        // Update general themes cache
        queryClient.invalidateQueries({ queryKey: [...themesKey, 'all'] });
        
        // Update website-specific cache if websiteId was available
        if (result.websiteId) {
          queryClient.invalidateQueries({ 
            queryKey: websiteThemesKey(result.websiteId)
          });
          
          // If the deleted theme was active, invalidate active theme cache
          if (result.isActive) {
            queryClient.invalidateQueries({ 
              queryKey: activeThemeKey(result.websiteId)
            });
          }
        }
      },
    });
  };

  // Batch operations for themes
  const useBatchUpdateStatuses = () => {
    return useMutation({
      mutationFn: async (updates: { id: string; isActive: boolean }[]) => {
        const { data: responseData } = await apiClient.post(`${endpoint}/batch-update`, { updates });
        return responseData;
      },
      onSuccess: () => {
        // Invalidate all theme queries as we don't know which ones changed
        queryClient.invalidateQueries({ queryKey: themesKey });
      },
    });
  };

  // Bulk delete themes
  const useBulkDelete = () => {
    return useMutation({
      mutationFn: async (ids: string[]) => {
        const { data: responseData } = await apiClient.post(`${endpoint}/bulk-delete`, { ids });
        return responseData;
      },
      onSuccess: () => {
        // Invalidate all theme queries as multiple themes were deleted
        queryClient.invalidateQueries({ queryKey: themesKey });
      },
    });
  };

  // Return all hooks
  return {
    useGetAll,
    useGetByWebsite,
    useGetActiveTheme,
    useGetById,
    useCreate,
    useUpdate,
    useUpdateColors,
    useUpdateFonts,
    useSetActiveTheme,
    useCloneTheme,
    useDelete,
    useBatchUpdateStatuses,
    useBulkDelete,
  };
}