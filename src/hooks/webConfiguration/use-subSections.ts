import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api-client';
import { SubSection } from '@/src/api/types/hooks/section.types';

// Define interface for activation options
export interface SubSectionActivationOptions {
  isActive: boolean;
  affectChildren?: boolean;
  recursive?: boolean;
  reason?: string;
}

// Define interface for bulk activation
export interface BulkActivationRequest {
  ids: string[];
  isActive: boolean;
  affectChildren?: boolean;
  recursive?: boolean;
  reason?: string;
}

// Define interface for scheduling activation
export interface ScheduleActivationRequest {
  id: string;
  scheduledDate: Date | string;
  options: SubSectionActivationOptions;
}

// Define interface for activation results
export interface ActivationResult {
  subsection: SubSection;
  contentElementsAffected: number;
  childSubsectionsAffected?: number;
  previousMainId?: string;
  newMainId?: string;
  statusChangeLog?: {
    timestamp: Date;
    action: string;
    reason?: string;
    performedBy?: string;
  };
  error?: string;
}

// Base subsection hook
export function useSubSections() {
  const queryClient = useQueryClient();
  const endpoint = '/subsections';

  // Query keys
  const subsectionsKey = ['subsections']; 
  const subsectionKey = (id: string | null ) => [...subsectionsKey, id];
  const subsectionSlugKey = (slug: string) => [...subsectionsKey, 'slug', slug];
  const subsectionBySectionItemKey = (sectionItemId: string) => [...subsectionsKey, 'sectionItem', sectionItemId];
  const subsectionBySectionKey = (sectionId: string) => [...subsectionsKey, 'section', sectionId];
  const mainSubsectionBySectionKey = (sectionId: string) => [...subsectionBySectionKey(sectionId), 'main'];
  const completeSubsectionBySectionKey = (sectionId: string) => [...subsectionBySectionKey(sectionId), 'complete'];
  const subsectionsByWebSiteKey = (websiteId: string) => [...subsectionsKey, 'website', websiteId];
  const completeSubsectionsByWebSiteKey = (websiteId: string) => [...subsectionsByWebSiteKey(websiteId), 'complete'];
  const mainSubsectionByWebSiteKey = (websiteId: string) => [...subsectionsByWebSiteKey(websiteId), 'main'];
  // New keys for activation-related queries
  const activationKey = (id: string) => [...subsectionKey(id), 'activation'];
  const bulkActivationKey = [...subsectionsKey, 'bulk-activation'];
  const scheduledActivationsKey = [...subsectionsKey, 'scheduled-activations'];

  const useGetByWebSiteId = (
    websiteId: string,
    activeOnly = true,
    limit = 100,
    skip = 0,
    includeContentCount = false
  ) => {
    return useQuery({
      queryKey: [...subsectionsByWebSiteKey(websiteId), { activeOnly, limit, skip, includeContentCount }],
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/website/${websiteId}`, {
          params: { activeOnly, limit, skip, includeContentCount }
        });
        return data;
      },
      enabled: !!websiteId && websiteId !== "null"
    });
  };
  
  // Get complete subsections by WebSite ID with all content elements and translations
  const useGetCompleteByWebSiteId = (
    websiteId: string,
    activeOnly = true,
    limit = 100,
    skip = 0
  ) => {
    return useQuery({
      queryKey: [...completeSubsectionsByWebSiteKey(websiteId), { activeOnly, limit, skip }],
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/website/${websiteId}/complete`, {
          params: { activeOnly, limit, skip }
        });
        return data;
      },
      enabled: !!websiteId && websiteId !== "null"
    });
  };
  // Get all subsections
  const useGetAll = (activeOnly = true, limit = 100, skip = 0, includeContentCount = false) => {
    return useQuery({
      queryKey: [...subsectionsKey, { activeOnly, limit, skip, includeContentCount }],
      queryFn: async () => {
        const { data } = await apiClient.get(endpoint, {
          params: { activeOnly, limit, skip, includeContentCount }
        });
        return data;
      }
    });
  };

  // Get a single subsection by ID
  const useGetById = (id: string, populateSectionItem = true, includeContent = false) => {
    return useQuery({
      queryKey: [...subsectionKey(id), { populateSectionItem, includeContent }],
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/${id}`, {
          params: { populate: populateSectionItem, includeContent }
        });
        return data;
      },
      enabled: !!id
    });
  };

  // Get subsection by slug
  const useGetBySlug = (slug: string, populateSectionItem = true, includeContent = false) => {
    return useQuery({
      queryKey: [...subsectionSlugKey(slug), { populateSectionItem, includeContent }],
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/slug/${slug}`, {
          params: { populate: populateSectionItem, includeContent }
        });
        return data;
      },
      enabled: !!slug
    });
  };

  // Get subsections by section item ID
  const useGetBySectionItemId = (
    sectionItemId: string, 
    activeOnly = true, 
    limit = 100, 
    skip = 0, 
    includeContentCount = false
  ) => {
    return useQuery({
      queryKey: [...subsectionBySectionItemKey(sectionItemId), { activeOnly, limit, skip, includeContentCount }],
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/sectionItem/${sectionItemId}`, {
          params: { activeOnly, limit, skip, includeContentCount }
        });
        return data;
      },
      enabled: !!sectionItemId && sectionItemId !== "null"
    });
  };

  // Get subsections by section ID
  const useGetBySectionId = (
    sectionId: string, 
    activeOnly = true, 
    limit = 100, 
    skip = 0
  ) => {
    return useQuery({
      queryKey: [...subsectionBySectionKey(sectionId), { activeOnly, limit, skip }],
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/section/${sectionId}`, {
          params: { activeOnly, limit, skip }
        });
        return data;
      },
      enabled: !!sectionId && sectionId !== "null"
    });
  };

  // Get complete subsections by section ID with all content elements and translations
  const useGetCompleteBySectionId = (
    sectionId: string, 
    activeOnly = true, 
    limit = 100, 
    skip = 0
  ) => {
    return useQuery({
      queryKey: [...completeSubsectionBySectionKey(sectionId), { activeOnly, limit, skip }],
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/section/${sectionId}/complete`, {
          params: { activeOnly, limit, skip }
        });
        return data;
      },
      enabled: !!sectionId && sectionId !== "null"
    });
  };

  // Get main subsection for a section
  const useGetMainBySectionId = (sectionId: string) => {
    return useQuery({
      queryKey: mainSubsectionBySectionKey(sectionId),
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/section/${sectionId}/main`);
        return data;
      },
      enabled: !!sectionId && sectionId !== "null"
    });
  };

  // Create a new subsection
  const useCreate = () => {
    return useMutation({
      mutationFn: async (createDto: Omit<SubSection, '_id'>) => {
        try {
          const { data } = await apiClient.post(endpoint, createDto);
          return data;
        } catch (error: any) {
          if (error.message?.includes('duplicate') || 
              error.message?.includes('E11000') || 
              error.message?.includes('already exists')) {
            const enhancedError = new Error(`A subsection with the slug "${createDto.slug}" already exists.`);
            throw enhancedError;
          }
          throw error;
        }
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: subsectionsKey });
        if (data._id) {
          queryClient.setQueryData(subsectionKey(data._id), data);
        }
        if (data.slug) {
          queryClient.setQueryData(subsectionSlugKey(data.slug), data);
        }
        if (data.sectionItem) {
          queryClient.invalidateQueries({ 
            queryKey: subsectionBySectionItemKey(typeof data.sectionItem === 'string' ? data.sectionItem : data.sectionItem._id) 
          });
        }
        if (data.section) {
          queryClient.invalidateQueries({
            queryKey: subsectionBySectionKey(typeof data.section === 'string' ? data.section : data.section._id)
          });
        }
        if (data.WebSite) {
          queryClient.invalidateQueries({ 
            queryKey: subsectionsByWebSiteKey(typeof data.WebSite === 'string' ? data.WebSiteId : data.WebSite._id) 
          });
        }
      },
    });
  };

  // Update a subsection
  const useUpdate = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: string | null ; data: Partial<SubSection> }) => {
        try {
          const { data: responseData } = await apiClient.put(`${endpoint}/${id}`, data);
          return responseData;
        } catch (error: any) {
          if (error.message?.includes('duplicate') || 
              error.message?.includes('E11000') || 
              error.message?.includes('already exists')) {
            const enhancedError = new Error(`A subsection with the slug "${data.slug}" already exists.`);
            throw enhancedError;
          }
          throw error;
        }
      },
      onSuccess: (data, { id }) => {
        queryClient.setQueryData(subsectionKey(id), data);
        if (data.slug) {
          queryClient.setQueryData(subsectionSlugKey(data.slug), data);
        }
        if (data.sectionItem) {
          queryClient.invalidateQueries({ 
            queryKey: subsectionBySectionItemKey(typeof data.sectionItem === 'string' ? data.sectionItem : data.sectionItem._id) 
          });
        }
        if (data.section) {
          queryClient.invalidateQueries({
            queryKey: subsectionBySectionKey(typeof data.section === 'string' ? data.section : data.section._id)
          });
          // Also invalidate complete subsections by section queries
          queryClient.invalidateQueries({
            queryKey: completeSubsectionBySectionKey(typeof data.section === 'string' ? data.section : data.section._id)
          });
        }
        if (data.WebSite) {
          queryClient.invalidateQueries({ 
            queryKey: subsectionsByWebSiteKey(typeof data.WebSite === 'string' ? data.WebSiteId : data.WebSite._id) 
          });
          queryClient.invalidateQueries({ 
            queryKey: completeSubsectionsByWebSiteKey(typeof data.WebSite === 'string' ? data.WebSiteId : data.WebSite._id) 
          });
        } 
        queryClient.invalidateQueries({ queryKey: subsectionsKey });
      },
    });
  };

  // Delete a subsection
  const useDelete = (hardDelete: boolean = false) => {
    return useMutation({
      mutationFn: async (id: string) => {
        const { data } = await apiClient.delete(`${endpoint}/${id}`, {
          params: { hardDelete }
        });
        return data;
      },
      onSuccess: (_, id) => {
        const cachedData = queryClient.getQueryData(subsectionKey(id)) as SubSection | undefined;
        
        queryClient.removeQueries({ queryKey: subsectionKey(id) });
        if (cachedData?.slug) {
          queryClient.removeQueries({ queryKey: subsectionSlugKey(cachedData.slug) });
        }
        if (cachedData?.sectionItem) {
          queryClient.invalidateQueries({ 
            queryKey: subsectionBySectionItemKey(
              typeof cachedData.sectionItem === 'string' ? cachedData.sectionItem : cachedData.sectionItem._id
            ) 
          });
        }
        if (cachedData?.section) {
          queryClient.invalidateQueries({
            queryKey: subsectionBySectionKey(
              typeof cachedData.section === 'string' ? cachedData.section : cachedData.section._id
            )
          });
          // Also invalidate complete subsections by section queries
          queryClient.invalidateQueries({
            queryKey: completeSubsectionBySectionKey(
              typeof cachedData.section === 'string' ? cachedData.section : cachedData.section._id
            )
          });
        }
        queryClient.invalidateQueries({ queryKey: subsectionsKey });
      },
    });
  };

  // Update order of multiple subsections
  const useUpdateOrder = () => {
    return useMutation({
      mutationFn: async (subsections: { id: string; order: number }[]) => {
        const { data } = await apiClient.put(`${endpoint}/order`, { subsections });
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: subsectionsKey });
      },
    });
  };

  // Get complete subsection by ID (with all elements and translations)
  const useGetCompleteById = (id: string, populateSectionItem = true) => {
    return useQuery({
      queryKey: [...subsectionKey(id), 'complete', { populateSectionItem }],
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/${id}/complete`, {
          params: { populate: populateSectionItem }
        });
        return data;
      },
      enabled: !!id
    });
  };

  // Get complete subsection by slug (with all elements and translations)
  const useGetCompleteBySlug = (slug: string, populateSectionItem = true) => {
    return useQuery({
      queryKey: [...subsectionSlugKey(slug), 'complete', { populateSectionItem }],
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/slug/${slug}/complete`, {
          params: { populate: populateSectionItem }
        });
        return data;
      },
      enabled: !!slug && slug !== ""
    });
  };

  // Get main subsection for a WebSite
  const useGetMainByWebSiteId = (websiteId: string) => {
    return useQuery({
      queryKey: mainSubsectionByWebSiteKey(websiteId),
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/website/${websiteId}/main`);
        return data;
      },
      enabled: !!websiteId && websiteId !== "null"
    });
  };

  // NEW FUNCTIONS FOR SUBSECTION ACTIVATION

  // Manage subsection activation state
  const useManageActivation = () => {
    return useMutation({
      mutationFn: async ({ id, options }: { id: string; options: SubSectionActivationOptions }) => {
        const { data } = await apiClient.patch(`${endpoint}/${id}/activation`, options);
        return data;
      },
      onSuccess: (data) => {
        // Get the updated subsection from the result
        const updatedSubsection = data.subsection;
        
        // Update cached data
        if (updatedSubsection._id) {
          queryClient.setQueryData(subsectionKey(updatedSubsection._id), updatedSubsection);
        }
        
        if (updatedSubsection.slug) {
          queryClient.setQueryData(subsectionSlugKey(updatedSubsection.slug), updatedSubsection);
        }
        
        // Invalidate related queries
        if (updatedSubsection.sectionItem) {
          queryClient.invalidateQueries({ 
            queryKey: subsectionBySectionItemKey(
              typeof updatedSubsection.sectionItem === 'string' 
                ? updatedSubsection.sectionItem 
                : updatedSubsection.sectionItem._id
            ) 
          });
        }
        
        if (updatedSubsection.section) {
          const sectionId = typeof updatedSubsection.section === 'string' 
            ? updatedSubsection.section 
            : updatedSubsection.section._id;
            
          queryClient.invalidateQueries({
            queryKey: subsectionBySectionKey(sectionId)
          });
          
          queryClient.invalidateQueries({
            queryKey: completeSubsectionBySectionKey(sectionId)
          });
          
          // If main subsection changed, invalidate main subsection query
          if (data.previousMainId || data.newMainId) {
            queryClient.invalidateQueries({
              queryKey: mainSubsectionBySectionKey(sectionId)
            });
          }
        }
        
        if (updatedSubsection.WebSiteId) {
          const websiteId = typeof updatedSubsection.WebSiteId === 'string'
            ? updatedSubsection.WebSiteId
            : updatedSubsection.WebSiteId._id;
            
          queryClient.invalidateQueries({ 
            queryKey: subsectionsByWebSiteKey(websiteId) 
          });
          
          queryClient.invalidateQueries({ 
            queryKey: completeSubsectionsByWebSiteKey(websiteId) 
          });
          
          // If main subsection changed, invalidate main subsection query
          if (data.previousMainId || data.newMainId) {
            queryClient.invalidateQueries({
              queryKey: mainSubsectionByWebSiteKey(websiteId)
            });
          }
        }
        
        // Invalidate all subsections queries to ensure lists are updated
        queryClient.invalidateQueries({ queryKey: subsectionsKey });
      },
    });
  };
  
  // Simple toggle active status for a subsection (original simpler implementation)
  const useToggleActive = () => {
    return useMutation({
      mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
        const { data } = await apiClient.patch(`${endpoint}/${id}/toggle-active`, { status });
        return data;
      },
      onSuccess: (data) => {
        if (data._id) {
          queryClient.setQueryData(subsectionKey(data._id), data);
        }
        
        if (data.slug) {
          queryClient.setQueryData(subsectionSlugKey(data.slug), data);
        }
        
        // Invalidate related queries
        if (data.sectionItem) {
          queryClient.invalidateQueries({ 
            queryKey: subsectionBySectionItemKey(
              typeof data.sectionItem === 'string' ? data.sectionItem : data.sectionItem._id
            ) 
          });
        }
        
        if (data.section) {
          const sectionId = typeof data.section === 'string' ? data.section : data.section._id;
          
          queryClient.invalidateQueries({
            queryKey: subsectionBySectionKey(sectionId)
          });
          
          queryClient.invalidateQueries({
            queryKey: completeSubsectionBySectionKey(sectionId)
          });
        }
        
        if (data.WebSiteId) {
          const websiteId = typeof data.WebSiteId === 'string' ? data.WebSiteId : data.WebSiteId._id;
          
          queryClient.invalidateQueries({ 
            queryKey: subsectionsByWebSiteKey(websiteId) 
          });
          
          queryClient.invalidateQueries({ 
            queryKey: completeSubsectionsByWebSiteKey(websiteId) 
          });
        }
        
        // Invalidate all subsections queries
        queryClient.invalidateQueries({ queryKey: subsectionsKey });
      },
    });
  };

  // Return all hooks including the new activation hooks
  return {
    useGetAll,
    useGetById,
    useGetBySlug,
    useGetBySectionItemId,
    useGetBySectionId,
    useGetCompleteBySectionId,
    useGetMainBySectionId,
    useCreate,
    useUpdate,
    useDelete,
    useUpdateOrder,
    useGetCompleteById,
    useGetCompleteBySlug,
    useGetByWebSiteId,
    useGetCompleteByWebSiteId,
    useGetMainByWebSiteId,
    useManageActivation,
    useToggleActive,
  };
}