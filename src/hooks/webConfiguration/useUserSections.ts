import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api-client';

// User-Section relationship hooks
export function useUserSections() {
  const queryClient = useQueryClient();
  const endpoint = '/user-sections';
  const sectionsEndpoint = '/sections'; // For direct section-related endpoints

  // Query keys
  const userSectionsKey = ['user-sections'];
  const userSectionKey = (userId: string) => [...userSectionsKey, userId];
  const sectionUsersKey = (sectionId: string) => [...userSectionsKey, 'section', sectionId];
  const sectionsKey = ['sections'];
  const currentUserSectionsKey = ['current-user-sections'];
  
  /**
   * Get all active sections for a specific user
   * @param userId User ID
   */
  const useGetUserSections = (userId: string) => {
    return useQuery({
      queryKey: userSectionKey(userId),
      queryFn: async () => {
        try {
          const { data } = await apiClient.get(`${endpoint}/${userId}`);
          return data;
        } catch (error: any) {
          console.error(`Error fetching sections for user ${userId}:`, error);
          throw error;
        }
      },
      enabled: !!userId,
    });
  };

  /**
   * Get sections for the currently authenticated user
   * This uses the new endpoint added to SectionController
   */
  const useGetCurrentUserSections = () => {
    return useQuery({
      queryKey: currentUserSectionsKey,
      queryFn: async () => {
        try {
          const { data } = await apiClient.get(`${sectionsEndpoint}/user`);
          return data;
        } catch (error: any) {
          console.error('Error fetching sections for current user:', error);
          throw error;
        }
      },
    });
  };

  /**
   * Get all users who have a specific section activated
   * @param sectionId Section ID
   */
  const useGetSectionUsers = (sectionId: string) => {
    return useQuery({
      queryKey: sectionUsersKey(sectionId),
      queryFn: async () => {
        try {
          const { data } = await apiClient.get(`${endpoint}/section/${sectionId}/users`);
          return data;
        } catch (error: any) {
          console.error(`Error fetching users for section ${sectionId}:`, error);
          throw error;
        }
      },
      enabled: !!sectionId,
    });
  };

  /**
   * Activate a section for a user
   */
  const useActivateSection = () => {
    return useMutation({
      mutationFn: async ({ userId, sectionId }: { userId: string; sectionId: string }) => {
        try {
          const { data } = await apiClient.post(`${endpoint}/${userId}/${sectionId}/activate`);
          return data;
        } catch (error: any) {
          console.error(`Error activating section ${sectionId} for user ${userId}:`, error);
          throw error;
        }
      },
      onSuccess: (_, { userId, sectionId }) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: userSectionKey(userId) });
        queryClient.invalidateQueries({ queryKey: sectionUsersKey(sectionId) });
        queryClient.invalidateQueries({ queryKey: currentUserSectionsKey });
      },
    });
  };

  /**
   * Deactivate a section for a user
   */
  const useDeactivateSection = () => {
    return useMutation({
      mutationFn: async ({ userId, sectionId }: { userId: string; sectionId: string }) => {
        try {
          const { data } = await apiClient.post(`${endpoint}/${userId}/${sectionId}/deactivate`);
          return data;
        } catch (error: any) {
          console.error(`Error deactivating section ${sectionId} for user ${userId}:`, error);
          throw error;
        }
      },
      onSuccess: (_, { userId, sectionId }) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: userSectionKey(userId) });
        queryClient.invalidateQueries({ queryKey: sectionUsersKey(sectionId) });
        queryClient.invalidateQueries({ queryKey: currentUserSectionsKey });
      },
    });
  };

  /**
   * Toggle a section for a user (activate if inactive, deactivate if active)
   */
  const useToggleSection = () => {
    return useMutation({
      mutationFn: async ({ userId, sectionId }: { userId: string; sectionId: string }) => {
        try {
          const { data } = await apiClient.post(`${endpoint}/${userId}/${sectionId}/toggle`);
          return data;
        } catch (error: any) {
          console.error(`Error toggling section ${sectionId} for user ${userId}:`, error);
          throw error;
        }
      },
      onSuccess: (_, { userId, sectionId }) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: userSectionKey(userId) });
        queryClient.invalidateQueries({ queryKey: sectionUsersKey(sectionId) });
        queryClient.invalidateQueries({ queryKey: currentUserSectionsKey });
      },
    });
  };

  /**
   * Create a section and automatically activate it for the current user
   * This uses the updated endpoint in SectionController that handles auto-relationship creation
   */
  const useCreateUserSection = () => {
    return useMutation({
      mutationFn: async (sectionData: any) => {
        try {
          const { data } = await apiClient.post(`${sectionsEndpoint}`, sectionData);
          return data;
        } catch (error: any) {
          console.error(`Error creating section:`, error);
          throw error;
        }
      },
      onSuccess: () => {
        // Invalidate sections and user-sections queries
        queryClient.invalidateQueries({ queryKey: sectionsKey });
        queryClient.invalidateQueries({ queryKey: userSectionsKey });
        queryClient.invalidateQueries({ queryKey: currentUserSectionsKey });
      },
    });
  };

  /**
   * Batch activate multiple sections for a user
   */
  const useBatchActivateSections = () => {
    return useMutation({
      mutationFn: async ({ userId, sectionIds }: { userId: string; sectionIds: string[] }) => {
        try {
          // Execute all activation requests in parallel
          const promises = sectionIds.map(sectionId => 
            apiClient.post(`${endpoint}/${userId}/${sectionId}/activate`)
          );
          
          const results = await Promise.all(promises);
          return results.map(result => result.data);
        } catch (error: any) {
          console.error(`Error batch activating sections for user ${userId}:`, error);
          throw error;
        }
      },
      onSuccess: (_, { userId }) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: userSectionKey(userId) });
        queryClient.invalidateQueries({ queryKey: userSectionsKey });
        queryClient.invalidateQueries({ queryKey: currentUserSectionsKey });
        // Also invalidate any section users queries that might be affected
        queryClient.invalidateQueries({ 
          predicate: (query) => query.queryKey[0] === userSectionsKey[0] && query.queryKey[1] === 'section'
        });
      },
    });
  };

  return {
    // Original hooks
    useGetUserSections,
    useGetSectionUsers,
    useActivateSection,
    useDeactivateSection,
    useToggleSection,
    
    // New hooks
    useGetCurrentUserSections,
    useCreateUserSection,
    useBatchActivateSections
  };
}