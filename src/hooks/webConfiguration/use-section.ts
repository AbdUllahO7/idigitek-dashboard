import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api-client';
import { Section } from '@/src/api/types/hooks/section.types';

// Enhanced section hook with user-section functionality
export function useSections() {
  const queryClient = useQueryClient();
  const endpoint = '/sections';
  const userSectionsEndpoint = '/user-sections';

  // Query keys
  const sectionsKey = ['sections'];
  const sectionKey = (id: string) => [...sectionsKey, id];
  const completeDataKey = (id: string) => [...sectionKey(id), 'complete'];
  const allCompleteDataKey = [...sectionsKey, 'allComplete'];
  const userSectionsKey = (userId: string) => ['user-sections', userId];

  // Get all sections (optionally with section items count)
  const useGetAll = (includeItemsCount = false, activeOnly = true) => {
    return useQuery({
      queryKey: [...sectionsKey, { includeItemsCount, activeOnly }],
      queryFn: async () => {
        try {
          const { data } = await apiClient.get(endpoint, {
            params: { includeItemsCount, activeOnly }
          });
          return data;
        } catch (error: any) {
          console.error("Error fetching sections:", error);
          throw error;
        }
      },
    });
  };

  // Get a single section by ID (optionally with section items)
  const useGetById = (id: string, includeItems = false) => {
    return useQuery({
      queryKey: [...sectionKey(id), { includeItems }],
      queryFn: async () => {
        try {
          const { data } = await apiClient.get(`${endpoint}/${id}`, {
            params: { includeItems }
          });
          return data;
        } catch (error: any) {
          console.error(`Error fetching section ${id}:`, error);
          throw error;
        }
      },
      enabled: !!id,
    });
  };

  /**
   * Get section with complete data (section items and subsections)
   * @param id Section ID
   * @param includeInactive Whether to include inactive items
   * @param languageId Optional language ID for translations
   */
  const useGetWithCompleteData = (
    id: string,
    includeInactive = false,
    languageId?: string,
    enabled = true
  ) => {
    return useQuery({
      queryKey: [...completeDataKey(id), { includeInactive, languageId }],
      queryFn: async () => {
        try {
          const params = new URLSearchParams();
          params.append('includeInactive', String(includeInactive));
          if (languageId) {
            params.append('languageId', languageId);
          }
          
          const { data } = await apiClient.get(`${endpoint}/${id}/complete?${params.toString()}`);
          return data;
        } catch (error: any) {
          console.error(`Error fetching complete section data for ${id}:`, error);
          throw error;
        }
      },
      enabled: !!id && enabled,
    });
  };

  /**
   * Get all sections with complete data
   * @param isActive Filter by active status
   * @param includeInactive Whether to include inactive items
   * @param languageId Optional language ID for translations
   */
  const useGetAllWithCompleteData = (
    isActive?: boolean,
    includeInactive = false,
    languageId?: string
  ) => {
    return useQuery({
      queryKey: [...allCompleteDataKey, { isActive, includeInactive, languageId }],
      queryFn: async () => {
        try {
          const params = new URLSearchParams();
          if (isActive !== undefined) {
            params.append('isActive', String(isActive));
          }
          params.append('includeInactive', String(includeInactive));
          if (languageId) {
            params.append('languageId', languageId);
          }
          
          const { data } = await apiClient.get(`${endpoint}/all/complete?${params.toString()}`);
          return data;
        } catch (error: any) {
          console.error("Error fetching all sections with complete data:", error);
          throw error;
        }
      },
    });
  };

  /**
   * NEW: Get all active sections for the current user
   * @param userId User ID
   */
  const useGetUserActiveSections = (userId: string) => {
    return useQuery({
      queryKey: userSectionsKey(userId),
      queryFn: async () => {
        try {
          const { data } = await apiClient.get(`${userSectionsEndpoint}/${userId}`);
          return data;
        } catch (error: any) {
          console.error(`Error fetching active sections for user ${userId}:`, error);
          throw error;
        }
      },
      enabled: !!userId,
    });
  };

  /**
   * NEW: Toggle section activation for the current user
   */
  const useToggleSectionForUser = () => {
    return useMutation({
      mutationFn: async ({ userId, sectionId }: { userId: string; sectionId: string }) => {
        try {
          const { data } = await apiClient.post(`${userSectionsEndpoint}/${userId}/${sectionId}/toggle`);
          return data;
        } catch (error: any) {
          console.error(`Error toggling section ${sectionId} for user ${userId}:`, error);
          throw error;
        }
      },
      onSuccess: (_, { userId }) => {
        // Invalidate the user's active sections query
        queryClient.invalidateQueries({ queryKey: userSectionsKey(userId) });
      },
    });
  };

  // Create a new section
  const useCreate = () => {
    return useMutation({
      mutationFn: async (createDto: Omit<Section, '_id'>) => {
        try {
          const { data } = await apiClient.post(endpoint, createDto);
          return data;
        } catch (error: any) {
          // Enhance error handling for duplicate entries
          if (error.message?.includes('duplicate') || 
              error.message?.includes('E11000') || 
              error.message?.includes('already exists')) {
            const enhancedError = new Error(`A section with the name "${createDto.name}" already exists.`);
            throw enhancedError;
          }
          
          // Forward the original error
          throw error;
        }
      },
      onSuccess: (data) => {
        // Invalidate all section queries to ensure fresh data
        queryClient.invalidateQueries({ queryKey: sectionsKey });
        if (data._id) {
          queryClient.setQueryData(sectionKey(data._id), data);
        }
      },
    });
  };

  // Update a section
  const useUpdate = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: string; data: Partial<Section> }) => {
        try {
          const { data: responseData } = await apiClient.put(`${endpoint}/${id}`, data);
          return responseData;
        } catch (error: any) {
          // Enhance error handling for duplicate entries
          if (error.message?.includes('duplicate') || 
              error.message?.includes('E11000') || 
              error.message?.includes('already exists')) {
            const enhancedError = new Error(`A section with the name "${data.name}" already exists.`);
            throw enhancedError;
          }
          
          // Forward the original error
          throw error;
        }
      },
      onSuccess: (data, { id }) => {
        // Update cached data and invalidate queries
        queryClient.setQueryData(sectionKey(id), data);
        queryClient.invalidateQueries({ queryKey: sectionsKey });
        // Also invalidate complete data queries that include this section
        queryClient.invalidateQueries({ queryKey: completeDataKey(id) });
        queryClient.invalidateQueries({ queryKey: allCompleteDataKey });
      },
    });
  };

  // Toggle active status
  const useToggleActive = () => {
    return useMutation({
      mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
        try {
          const { data: responseData } = await apiClient.patch(`${endpoint}/${id}/status`, { isActive });
          return responseData;
        } catch (error: any) {
          console.error(`Error toggling section ${id} active status:`, error);
          throw error;
        }
      },
      onSuccess: (data, { id }) => {
        // Update cached data and invalidate queries
        queryClient.setQueryData(sectionKey(id), data);
        queryClient.invalidateQueries({ queryKey: sectionsKey });
        // Also invalidate complete data queries that include this section
        queryClient.invalidateQueries({ queryKey: completeDataKey(id) });
        queryClient.invalidateQueries({ queryKey: allCompleteDataKey });
        
        // If a section is deactivated globally, also invalidate all user-section queries
        // since this will affect all users who had this section active
        if (!data.isActive) {
          queryClient.invalidateQueries({ queryKey: ['user-sections'] });
        }
      },
    });
  };

  // Delete a section
  const useDelete = (hardDelete: boolean = false) => {
    return useMutation({
      mutationFn: async (id: string) => {
        try {
          await apiClient.delete(`${endpoint}/${id}`, {
            params: { hardDelete }
          });
        } catch (error: any) {
          console.error(`Error deleting section ${id}:`, error);
          throw error;
        }
      },
      onSuccess: (_, id) => {
        // Remove and invalidate all related queries
        queryClient.removeQueries({ queryKey: sectionKey(id) });
        queryClient.removeQueries({ queryKey: completeDataKey(id) });
        queryClient.invalidateQueries({ queryKey: sectionsKey });
        queryClient.invalidateQueries({ queryKey: allCompleteDataKey });
        
        // Also invalidate all user-section queries since this will affect users who had this section
        queryClient.invalidateQueries({ queryKey: ['user-sections'] });
      },
    });
  };

  // Update order of multiple sections
  const useUpdateOrder = () => {
    return useMutation({
      mutationFn: async (sections: { id: string; order: number }[]) => {
        const { data } = await apiClient.put(`${endpoint}/order`, { sections });
        return data;
      },
      onSuccess: () => {
        // Invalidate all section queries to ensure order changes are reflected
        queryClient.invalidateQueries({ queryKey: sectionsKey });
        queryClient.invalidateQueries({ queryKey: allCompleteDataKey });
      },
    });
  };

  // Return all hooks, including the new user-section related hooks
  return {
    useGetAll,
    useGetById,
    useGetWithCompleteData,        
    useGetAllWithCompleteData,
    useGetUserActiveSections,     // NEW
    useToggleSectionForUser,      // NEW
    useCreate,
    useUpdate,
    useToggleActive,
    useDelete,
    useUpdateOrder
  };
}