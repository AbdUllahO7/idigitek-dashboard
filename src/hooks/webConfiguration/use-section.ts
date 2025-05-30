import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api-client';
import { Section } from '@/src/api/types/hooks/section.types';
import { useAuth } from '@/src/context/AuthContext'; // Import auth context to get current user
import { toast } from '../use-toast';

// Base section hook
export function useSections() {
  const queryClient = useQueryClient();
  const endpoint = '/sections';
  const { user } = useAuth(); // Get current user to include in cache keys
  
  // Get a user-specific prefix for cache keys
  const getUserPrefix = () => {
    const userId = user?.id || user?.id;
    return userId ? `user-${userId}` : 'anonymous';
  };

  // Query keys
  const sectionsKey = ['sections', getUserPrefix()]; // Include user in base key
  const sectionKey = (id: string) => [...sectionsKey, id];
  const completeDataKey = (id: string) => [...sectionKey(id), 'complete'];
  const allCompleteDataKey = [...sectionsKey, 'allComplete'];
  const websiteSectionsKey = (websiteId: string) => [...sectionsKey, 'website', websiteId];
  const websiteSectionsCompleteKey = (websiteId: string) => [...websiteSectionsKey(websiteId), 'complete'];

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
   * Get all sections for a specific website
   * @param websiteId Website ID
   * @param includeInactive Whether to include inactive sections
   */
  const useGetByWebsiteId = (
    websiteId: string,
    includeInactive = false,
    enabled = true
  ) => {
    // Include both websiteId and user in the query key
    return useQuery({
      queryKey: [...websiteSectionsKey(websiteId), { includeInactive }],
      queryFn: async () => {
        try {
          const params = new URLSearchParams();
          params.append('includeInactive', String(includeInactive));
          
          const { data } = await apiClient.get(`${endpoint}/website/${websiteId}?${params.toString()}`);
          return data;
        } catch (error: any) {
          console.error(`Error fetching sections for website ${websiteId}:`, error);
          throw error;
        }
      },
      enabled: !!websiteId && enabled,
      // Force refetching when user changes
      staleTime: 0, 
    });
  };


  //   websiteId: string,
  //   includeInactive = false,
  //   languageId?: string,
  //   enabled = true
  // ) => {
  //   return useQuery({
  //     queryKey: [...websiteSectionsCompleteKey(websiteId), { includeInactive, languageId }],
  //     queryFn: async () => {
  //       try {
  //         const params = new URLSearchParams();
  //         params.append('includeInactive', String(includeInactive));
  //         if (languageId) {
  //           params.append('languageId', languageId);
  //         }
          
  //         const { data } = await apiClient.get(`${endpoint}/website/${websiteId}/complete?${params.toString()}`);
  //         return data;
  //       } catch (error: any) {
  //         console.error(`Error fetching complete section data for website ${websiteId}:`, error);
  //         throw error;
  //       }
  //     },
  //     enabled: !!websiteId && enabled,
  //     // Force refetching when user changes
  //     staleTime: 0,
  //   });
  // };

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
        // Also invalidate website-specific queries if the section has a WebSiteId
        if (data.WebSiteId) {
          queryClient.invalidateQueries({ 
            queryKey: websiteSectionsKey(data.WebSiteId.toString()) 
          });
          queryClient.invalidateQueries({ 
            queryKey: websiteSectionsCompleteKey(data.WebSiteId.toString()) 
          });
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
        // Also invalidate website-specific queries if the section has a WebSiteId
        if (data.WebSiteId) {
          queryClient.invalidateQueries({ 
            queryKey: websiteSectionsKey(data.WebSiteId.toString()) 
          });
          queryClient.invalidateQueries({ 
            queryKey: websiteSectionsCompleteKey(data.WebSiteId.toString()) 
          });
        }
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
        // Also invalidate website-specific queries if the section has a WebSiteId
        if (data.WebSiteId) {
          queryClient.invalidateQueries({ 
            queryKey: websiteSectionsKey(data.WebSiteId.toString()) 
          });
          queryClient.invalidateQueries({ 
            queryKey: websiteSectionsCompleteKey(data.WebSiteId.toString()) 
          });
        }
      },
    });
  };

  // Delete a section
  const useDelete = (hardDelete: boolean = false) => {
    return useMutation({
      mutationFn: async (id: string) => {
        try {
          // First, get the section to know its WebSiteId
          const { data: section } = await apiClient.get(`${endpoint}/${id}`);
          const websiteId = section?.data?.WebSiteId;
          
          // Then delete the section
          await apiClient.delete(`${endpoint}/${id}`, {
            params: { hardDelete }
          });
          
          // Return the websiteId for use in onSuccess
          return { websiteId };
        } catch (error) {
          console.error(`Error deleting section ${id}:`, error);
          throw error;
        }
      },
      onSuccess: ({ websiteId }, id) => {
        // Remove and invalidate all related queries
        queryClient.removeQueries({ queryKey: sectionKey(id) });
        queryClient.removeQueries({ queryKey: completeDataKey(id) });
        queryClient.invalidateQueries({ queryKey: sectionsKey });
        queryClient.invalidateQueries({ queryKey: allCompleteDataKey });
        
        // Also invalidate website-specific queries if we have the WebSiteId
        if (websiteId) {
          queryClient.invalidateQueries({ 
            queryKey: websiteSectionsKey(websiteId.toString()) 
          });
          queryClient.invalidateQueries({ 
            queryKey: websiteSectionsCompleteKey(websiteId.toString()) 
          });
        }
      },
    });
  };

    // const useUpdateOrder = () => {
    // const queryClient = useQueryClient();
    // const { user } = useAuth();

    // const getUserPrefix = () => {
    //   const userId = user?.id || 'anonymous';
    //   return userId ? `user-${userId}` : 'anonymous';
    // };

    // const sectionsKey = ['sections', getUserPrefix()];
    // const sectionKey = (id: string) => [...sectionsKey, id];
    // const websiteSectionsKey = (websiteId: string) => [...sectionsKey, 'website', websiteId];
    // const websiteSectionsCompleteKey = (websiteId: string) => [...websiteSectionsKey(websiteId), 'complete'];

    // return useMutation({
    //   mutationFn: async (sections: { id: string; order: number; websiteId: string }[]) => {
    //     try {
    //       const response = await apiClient.patch(`/sections/order`, sections);
    //       // Ensure response.data is an array
    //       if (!Array.isArray(response.data)) {
    //         throw new Error('Expected an array of sections in the response');
    //       }
    //       return response.data; // Return the array of updated sections
    //     } catch (error: any) {
    //       console.error('Error updating section orders:', error);
    //       if (error.message?.includes('Max retries reached')) {
    //         throw new Error('Unable to update section order due to high system load. Please try again later.');
    //       }
    //       if (error.message?.includes('Order value')) {
    //         throw new Error(error.message);
    //       }
    //       if (error.message?.includes('Section not found')) {
    //         throw new Error('One or more sections not found or do not belong to the specified website');
    //       }
    //       throw new Error('Failed to update section orders');
    //     }
    //   },
    //   onSuccess: (data: Section[]) => {
    //     // Ensure data is an array before iterating
    //     if (Array.isArray(data)) {
    //       data.forEach((section: Section) => {
    //         if (section._id) {
    //           queryClient.setQueryData(sectionKey(section._id), section);
    //         }
    //       });
    //       // Invalidate queries
    //       queryClient.invalidateQueries({ queryKey: sectionsKey });
    //       queryClient.invalidateQueries({ queryKey: allCompleteDataKey });
    //       const websiteIds = [...new Set(data.map((section: Section) => section.WebSiteId.toString()))];
    //       websiteIds.forEach((websiteId) => {
    //         queryClient.invalidateQueries({ queryKey: websiteSectionsKey(websiteId) });
    //         queryClient.invalidateQueries({ queryKey: websiteSectionsCompleteKey(websiteId) });
    //       });
    //     } else {
    //       console.error('onSuccess: Expected data to be an array, received:', data);
    //     }
    //   },
    //   onError: (error: any) => {
    //     console.error('Mutation error:', error);
    //     toast({
    //       title: 'Error updating order',
    //       description: error.message || 'An error occurred while updating section order.',
    //       variant: 'destructive',
    //     });
    //   },
    // });
    // };

  // Add a manual function to clear all section-related cache for a user
  const clearUserSectionsCache = () => {
    // This can be called when a user logs out or switches
    queryClient.invalidateQueries({ queryKey: sectionsKey });
  };

  // Return all hooks, including the new website-specific ones and the cache clearing function
  return {
    useGetAll,
    useGetById,
    // useGetWithCompleteData,        
    // useGetAllWithCompleteData,
    useGetByWebsiteId,             
    // useGetCompleteByWebsiteId,      
    useCreate,
    useUpdate,
    useToggleActive,
    useDelete,
    // useUpdateOrder,
    clearUserSectionsCache  // New helper to explicitly clear cache between users
  };
}
