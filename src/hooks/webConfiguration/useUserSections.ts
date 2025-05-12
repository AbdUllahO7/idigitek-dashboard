import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api-client';

// User-Section relationship hooks
export function useUserSections() {
  const queryClient = useQueryClient();
  const endpoint = '/user-sections';

  // Query keys
  const userSectionsKey = ['user-sections'];
  const userSectionKey = (userId: string) => [...userSectionsKey, userId];
  const sectionUsersKey = (sectionId: string) => [...userSectionsKey, 'section', sectionId];
  
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
      },
    });
  };

  return {
    useGetUserSections,
    useGetSectionUsers,
    useActivateSection,
    useDeactivateSection,
    useToggleSection
  };
}