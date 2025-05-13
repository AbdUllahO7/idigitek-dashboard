import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api-client';
import { ContentElement } from '@/src/api/types/hooks/content.types';

// Base content element hook
export function useContentElements() {
  const queryClient = useQueryClient();
  const endpoint = '/content-elements';

  // Query keys
  const elementsKey = ['contentElements'];
  const elementKey = (id: string) => [...elementsKey, id];
  const elementsBySubsectionKey = (subsectionId: string) => [...elementsKey, 'subsection', subsectionId];

  // Get a single content element by ID
  const useGetById = (id: string, includeTranslations: boolean = false) => {
    return useQuery({
      queryKey: elementKey(id),
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/${id}`, {
          params: { translations: includeTranslations }
        });
        return data;
      },
      enabled: !!id,
    });
  };

  // Get all content elements for a subsection
  const useGetBySubsection = (subsectionId: string, includeTranslations: boolean = false) => {
    return useQuery({
      queryKey: elementsBySubsectionKey(subsectionId),
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/subsection/${subsectionId}`, {
          params: { translations: includeTranslations }
        });
        return data;
      },

      enabled: !!subsectionId,
    });
  };

  // Create a new content element
  const useCreate = () => {
    return useMutation({
      mutationFn: async (createDto: Omit<ContentElement, '_id'>) => {
        const { data } = await apiClient.post(endpoint, createDto);
        return data;
      },
      onSuccess: (data) => {
        if (data._id) {
          queryClient.setQueryData(elementKey(data._id), data);
        }
        if (data.parent) {
          queryClient.invalidateQueries({ queryKey: elementsBySubsectionKey(data.parent.toString()) });
        }
      },
    });
  };

  // Update a content element
  const useUpdate = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: string; data: Partial<ContentElement> }) => {
        const { data: responseData } = await apiClient.put(`${endpoint}/${id}`, data);
        return responseData;
      },
      onSuccess: (data, { id }) => {
        queryClient.setQueryData(elementKey(id), data);
        if (data.parent) {
          queryClient.invalidateQueries({ queryKey: elementsBySubsectionKey(data.parent.toString()) });
        }
      },
    });
  };

  // Delete a content element
  const useDelete = (hardDelete: boolean = false) => {
    return useMutation({
      mutationFn: async (id: string) => {
        await apiClient.delete(`${endpoint}/${id}`, {
          params: { hardDelete }
        });
      },
      onSuccess: (_, id) => {
        queryClient.removeQueries({ queryKey: elementKey(id) });
        // Since we don't know which subsection the element belonged to,
        // we don't invalidate specific subsection queries here
      },
    });
  };

  // Update order of multiple elements
  const useUpdateOrder = () => {
    return useMutation({
      mutationFn: async (elements: { id: string; order: number }[]) => {
        const { data } = await apiClient.put(`${endpoint}/order`, { elements });
        return data;
      },
      onSuccess: (_, elements) => {
        // Find unique parent IDs from the cache to invalidate
        const affectedElementIds = elements.map(el => el.id);
        affectedElementIds.forEach(id => {
          queryClient.invalidateQueries({ queryKey: elementKey(id) });
        });
        
        // Invalidate all subsection-element lists that might be affected
        // This is a shotgun approach, but it ensures the UI updates correctly
        queryClient.invalidateQueries({ 
          queryKey: elementsKey,
          predicate: (query) => query.queryKey.length > 1 && query.queryKey[1] === 'subsection'
        });
      },
    });
  };
  

  // Return all hooks
  return {
    useGetById,
    useGetBySubsection,
    useCreate,
    useUpdate,
    useDelete,
    useUpdateOrder,
  };
}