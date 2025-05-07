import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api-client';
import { ContentTranslation } from '@/src/api/types/hooks/content.types';

// Base content translation hook
export function useContentTranslations() {
  const queryClient = useQueryClient();
  const endpoint = '/translations';

  // Query keys
  const translationsKey = ['contentTranslations'];
  const translationKey = (id: string) => [...translationsKey, id];
  const translationsByElementKey = (elementId: string) => [...translationsKey, 'element', elementId];
  const translationsByLanguageKey = (languageId: string) => [...translationsKey, 'language', languageId];
  const specificTranslationKey = (elementId: string, languageId: string) => 
    [...translationsKey, 'element', elementId, 'language', languageId];

  // Get a single translation by ID
  const useGetById = (id: string) => {
    return useQuery({
      queryKey: translationKey(id),
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/${id}`);
        return data;
      },
      enabled: !!id,
    });
  };

  // Get all translations for a content element
  const useGetByElement = (elementId: string, activeOnly: boolean = true) => {
    return useQuery({
      queryKey: translationsByElementKey(elementId),
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/content-elements/${elementId}`, {
          params: { activeOnly }
        });
        console.log("useGetByElement" , data)
        return data;
      },
      enabled: !!elementId,
    });
  };

  // Get all translations for a language
  const useGetByLanguage = (languageId: string, activeOnly: boolean = true) => {
    return useQuery({
      queryKey: translationsByLanguageKey(languageId),
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/language/${languageId}`, {
          params: { activeOnly }
        });
        return data;
      },
      enabled: !!languageId,
    });
  };

  // Get specific translation by content element and language
  const useGetSpecific = (elementId: string, languageId: string) => {
    return useQuery({
      queryKey: specificTranslationKey(elementId, languageId),
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/element/${elementId}/language/${languageId}`);
        return data;
      },
      enabled: !!elementId && !!languageId,
    });
  };

  // Create a new translation
  const useCreate = () => {
    return useMutation({
      mutationFn: async (createDto: Omit<ContentTranslation, '_id'>) => {
        const { data } = await apiClient.post(endpoint, createDto);
        return data;
      },
      onSuccess: (data) => {
        if (data._id) {
          queryClient.setQueryData(translationKey(data._id), data);
        }
        if (data.contentElement) {
          queryClient.invalidateQueries({ 
            queryKey: translationsByElementKey(data.contentElement.toString()) 
          });
        }
        if (data.language) {
          queryClient.invalidateQueries({ 
            queryKey: translationsByLanguageKey(data.language.toString()) 
          });
        }
        if (data.contentElement && data.language) {
          queryClient.setQueryData(
            specificTranslationKey(
              data.contentElement.toString(), 
              data.language.toString()
            ), 
            data
          );
        }
      },
    });
  };

  // Update a translation
  const useUpdate = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: string; data: Partial<ContentTranslation> }) => {
        const { data: responseData } = await apiClient.put(`${endpoint}/${id}`, data);
        return responseData;
      },
      onSuccess: (data, { id }) => {
        queryClient.setQueryData(translationKey(id), data);
        if (data.contentElement) {
          queryClient.invalidateQueries({ 
            queryKey: translationsByElementKey(data.contentElement.toString()) 
          });
        }
        if (data.language) {
          queryClient.invalidateQueries({ 
            queryKey: translationsByLanguageKey(data.language.toString()) 
          });
        }
        if (data.contentElement && data.language) {
          queryClient.setQueryData(
            specificTranslationKey(
              data.contentElement.toString(), 
              data.language.toString()
            ), 
            data
          );
        }
      },
    });
  };

  // Delete a translation
  const useDelete = (hardDelete: boolean = false) => {
    return useMutation({
      mutationFn: async (id: string) => {
        await apiClient.delete(`${endpoint}/${id}`, {
          params: { hardDelete }
        });
      },
      onSuccess: (_, id) => {
        // Get the translation data from cache if available
        const cachedData = queryClient.getQueryData(translationKey(id)) as ContentTranslation | undefined;
        
        // Remove the specific query
        queryClient.removeQueries({ queryKey: translationKey(id) });
        
        // Invalidate related queries if we have the data
        if (cachedData) {
          if (cachedData.contentElement) {
            queryClient.invalidateQueries({ 
              queryKey: translationsByElementKey(cachedData.contentElement.toString()) 
            });
          }
          if (cachedData.language) {
            queryClient.invalidateQueries({ 
              queryKey: translationsByLanguageKey(cachedData.language.toString()) 
            });
          }
          if (cachedData.contentElement && cachedData.language) {
            queryClient.removeQueries({ 
              queryKey: specificTranslationKey(
                cachedData.contentElement.toString(), 
                cachedData.language.toString()
              ) 
            });
          }
        }
      },
    });
  };

  // Bulk create or update translations
  const useBulkUpsert = () => {
    return useMutation({
      mutationFn: async (translations: (Omit<ContentTranslation, '_id'> & { id?: string })[]) => {
        const { data } = await apiClient.post(`${endpoint}/bulk`, { translations });
        return data;
      },
      onSuccess: (_, translations) => {
        // Find all unique element and language IDs to invalidate
        const elementIds = new Set(translations.map(t => t.contentElement.toString()));
        const languageIds = new Set(translations.map(t => t.language.toString()));
        
        // Invalidate all affected queries
        elementIds.forEach(elementId => {
          queryClient.invalidateQueries({ queryKey: translationsByElementKey(elementId) });
        });
        
        languageIds.forEach(languageId => {
          queryClient.invalidateQueries({ queryKey: translationsByLanguageKey(languageId) });
        });
        
        // Invalidate specific translation pairs
        translations.forEach(t => {
          queryClient.invalidateQueries({ 
            queryKey: specificTranslationKey(
              t.contentElement.toString(), 
              t.language.toString()
            ) 
          });
          if (t.id) {
            queryClient.invalidateQueries({ queryKey: translationKey(t.id) });
          }
        });
      },
    });
  };

  // Return all hooks
  return {
    useGetById,
    useGetByElement,
    useGetByLanguage,
    useGetSpecific,
    useCreate,
    useUpdate,
    useDelete,
    useBulkUpsert,
  };
}