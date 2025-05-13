import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api-client';
import { SectionItem } from '@/src/api/types/hooks/section.types';

// Base section item hook
export function useSectionItems() {
  const queryClient = useQueryClient();
  const endpoint = '/section-items';

  // Query keys
  const sectionItemsKey = ['sectionItems'];
  const sectionItemKey = (id: string) => [...sectionItemsKey, id];
  const sectionItemsBySectionKey = (sectionId: string) => [...sectionItemsKey, 'section', sectionId];
  const sectionItemsByWebSiteKey = (websiteId: string) => [...sectionItemsKey, 'website', websiteId];

  // Get all section items
  const useGetAll = (activeOnly = true, limit = 100, skip = 0, includeSubSectionCount = false) => {
    return useQuery({
      queryKey: [...sectionItemsKey, { activeOnly, limit, skip, includeSubSectionCount }],
      queryFn: async () => {
        const { data } = await apiClient.get(endpoint, {
          params: { activeOnly, limit, skip, includeSubSectionCount }
        });
        return data;
      }
    });
  };

  // Get a single section item by ID
  const useGetById = (id: string, populateSection = true, includeSubSections = false) => {
    return useQuery({
      queryKey: [...sectionItemKey(id), { populateSection, includeSubSections }],
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/${id}`, {
          params: { populate: populateSection, includeSubSections }
        });
        return data;
      },
      enabled: !!id
    });
  };

  // Get section items by section ID
  const useGetBySectionId = (
    sectionId: string, 
    activeOnly = true, 
    limit = 100, 
    skip = 0, 
    includeSubSectionCount = false
  ) => {
    return useQuery({
      queryKey: [...sectionItemsBySectionKey(sectionId), { activeOnly, limit, skip, includeSubSectionCount }],
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/section/${sectionId}`, {
          params: { activeOnly, limit, skip, includeSubSectionCount }
        });
        return data;
      },
      enabled: !!sectionId && sectionId !== "null"
    });
  };

  // Get section items by WebSite ID - NEW FUNCTION
  const useGetByWebSiteId = (
    websiteId: string,
    activeOnly = true,
    limit = 100,
    skip = 0,
    includeSubSectionCount = false
  ) => {
    return useQuery({
      queryKey: [...sectionItemsByWebSiteKey(websiteId), { activeOnly, limit, skip, includeSubSectionCount }],
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/website/${websiteId}`, {
          params: { activeOnly, limit, skip, includeSubSectionCount }
        });
        return data;
      },
      enabled: !!websiteId && websiteId !== "null"
    });
  };

  // Create a new section item
  const useCreate = () => {
    return useMutation({
      mutationFn: async (createDto: Omit<SectionItem, '_id'>) => {
        try {
          const { data } = await apiClient.post(endpoint, createDto);
          return data;
        } catch (error: any) {
          if (error.message?.includes('duplicate') || 
              error.message?.includes('E11000') || 
              error.message?.includes('already exists')) {
            const enhancedError = new Error(`A section item with this name already exists.`);
            throw enhancedError;
          }
          throw error;
        }
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: sectionItemsKey });
        if (data._id) {
          queryClient.setQueryData(sectionItemKey(data._id), data);
        }
        if (data.section) {
          queryClient.invalidateQueries({ queryKey: sectionItemsBySectionKey(data.section) });
        }
        // Add invalidation for WebSite
        if (data.WebSite) {
          queryClient.invalidateQueries({ queryKey: sectionItemsByWebSiteKey(data.WebSite) });
        }
      },
    });
  };

  // Update a section item
  const useUpdate = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: string; data: Partial<SectionItem> }) => {
        try {
          const { data: responseData } = await apiClient.put(`${endpoint}/${id}`, data);
          return responseData;
        } catch (error: any) {
          if (error.message?.includes('duplicate') || 
              error.message?.includes('E11000') || 
              error.message?.includes('already exists')) {
            const enhancedError = new Error(`A section item with this name already exists.`);
            throw enhancedError;
          }
          throw error;
        }
      },
      onSuccess: (data, { id }) => {
        queryClient.setQueryData(sectionItemKey(id), data);
        queryClient.invalidateQueries({ queryKey: sectionItemsKey });
        
        // Invalidate parent section queries
        if (data.section) {
          queryClient.invalidateQueries({ queryKey: sectionItemsBySectionKey(data.section) });
        }
        
        // Invalidate WebSite queries
        if (data.WebSite) {
          queryClient.invalidateQueries({ queryKey: sectionItemsByWebSiteKey(data.WebSite) });
        }
      },
    });
  };

  // Delete a section item
  const useDelete = (hardDelete: boolean = false) => {
    return useMutation({
      mutationFn: async (id: string) => {
        const { data } = await apiClient.delete(`${endpoint}/${id}`, {
          params: { hardDelete }
        });
        return data;
      },
      onSuccess: (_, id) => {
        // Get the cached data to find the parent section and WebSite
        const cachedData = queryClient.getQueryData(sectionItemKey(id)) as SectionItem | undefined;
        
        queryClient.removeQueries({ queryKey: sectionItemKey(id) });
        queryClient.invalidateQueries({ queryKey: sectionItemsKey });
        
        // Invalidate parent section queries
        if (cachedData?.section) {
          if (typeof cachedData.section === 'string') {
            queryClient.invalidateQueries({ queryKey: sectionItemsBySectionKey(cachedData.section) });
          }
        }
        
        // Invalidate WebSite queries
        if (cachedData?.WebSite) {
          if (typeof cachedData.WebSite === 'string') {
            queryClient.invalidateQueries({ queryKey: sectionItemsByWebSiteKey(cachedData.WebSite) });
          }
        }
      },
    });
  };

  // Update order of multiple section items
  const useUpdateOrder = () => {
    return useMutation({
      mutationFn: async (sectionItems: { id: string; order: number }[]) => {
        const { data } = await apiClient.put(`${endpoint}/order`, { sectionItems });
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: sectionItemsKey });
      },
    });
  };

  // Return all hooks
  return {
    useGetAll,
    useGetById,
    useGetBySectionId,
    useGetByWebSiteId, 
    useCreate,
    useUpdate,
    useDelete,
    useUpdateOrder
  };
}