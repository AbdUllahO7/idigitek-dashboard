import apiClient from '@/src/lib/api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Contact Form Types
export interface CreateContactFormData {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormData {
  _id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'read' | 'responded';
  createdAt: string;
  updatedAt: string;
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
  data?: ContactFormData;
  errors?: any[];
}

export interface ContactsListResponse {
  success: boolean;
  message: string;
  data?: {
    contacts: ContactFormData[];
    totalPages: number;
    currentPage: number;
    total: number;
  };
}

export interface ContactStatsResponse {
  success: boolean;
  message: string;
  data?: {
    total: number;
    byStatus: {
      pending?: number;
      read?: number;
      responded?: number;
    };
  };
}

export interface UpdateContactStatusData {
  status: 'pending' | 'read' | 'responded';
}

// Contact Form hook
export function useContactForm() {
  const queryClient = useQueryClient();
  
  // Get API version from environment or config
  const apiVersion = process.env.REACT_APP_API_VERSION || 'v1';
  const endpoint = `/contactForm`;

  // Query keys
  const contactsKey = ['contactForm'];
  const contactStatsKey = ['contactForm', 'stats'];

  // ==================== PUBLIC OPERATIONS ====================

  // Create contact form submission (public)
  const useCreateContactForm = () => {
    return useMutation<ContactFormResponse, Error, CreateContactFormData>({
      mutationFn: async (contactData: CreateContactFormData) => {
        const { data } = await apiClient.post(endpoint, contactData);
        return data;
      },
      onSuccess: (data) => {
        console.log('Contact form submitted successfully:', data);
        
        // Invalidate contacts list to show new submission (if admin is viewing)
        queryClient.invalidateQueries({ queryKey: contactsKey });
        queryClient.invalidateQueries({ queryKey: contactStatsKey });
      },
      onError: (error) => {
        console.error('Error submitting contact form:', error);
      },
    });
  };

  // ==================== ADMIN OPERATIONS ====================

  // Get all contact forms with pagination (admin)
  const useGetAllContactForms = (
    page: number = 1, 
    limit: number = 10, 
    status?: 'pending' | 'read' | 'responded'
  ) => {
    return useQuery<ContactsListResponse, Error>({
      queryKey: [...contactsKey, 'list', page, limit, status],
      queryFn: async () => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(status && { status })
        });
        
        const { data } = await apiClient.get(`${endpoint}?${params}`);
        return data;
      },
      // Refetch when component mounts
      refetchOnMount: true,
      // Cache for 30 seconds
      staleTime: 30 * 1000,
    });
  };

  // Get single contact form by ID (admin)
  const useGetContactFormById = (id: string, enabled: boolean = true) => {
    return useQuery<ContactFormResponse, Error>({
      queryKey: [...contactsKey, 'detail', id],
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/${id}`);
        return data;
      },
      enabled: enabled && !!id,
      // Cache for 5 minutes
      staleTime: 5 * 60 * 1000,
    });
  };

  // Get contact forms statistics (admin)
  const useGetContactFormsStats = () => {
    return useQuery<ContactStatsResponse, Error>({
      queryKey: contactStatsKey,
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/stats`);
        return data;
      },
      // Refetch when component mounts
      refetchOnMount: true,
      // Cache for 1 minute
      staleTime: 60 * 1000,
    });
  };

  // Update contact form status (admin)
  const useUpdateContactFormStatus = () => {
    return useMutation<ContactFormResponse, Error, { id: string; status: string }>({
      mutationFn: async ({ id, status }) => {
        const { data } = await apiClient.patch(`${endpoint}/${id}/status`, { status });
        return data;
      },
      onSuccess: (data, variables) => {
        console.log('Contact status updated successfully:', data);
        
        // Update the specific contact in cache
        queryClient.invalidateQueries({ queryKey: [...contactsKey, 'detail', variables.id] });
        // Update the contacts list
        queryClient.invalidateQueries({ queryKey: [...contactsKey, 'list'] });
        // Update statistics
        queryClient.invalidateQueries({ queryKey: contactStatsKey });
      },
      onError: (error) => {
        console.error('Error updating contact status:', error);
      },
    });
  };

  // Delete contact form (admin)
  const useDeleteContactForm = () => {
    return useMutation<ContactFormResponse, Error, string>({
      mutationFn: async (id: string) => {
        const { data } = await apiClient.delete(`${endpoint}/${id}`);
        return data;
      },
      onSuccess: (data, id) => {
        console.log('Contact deleted successfully:', data);
        
        // Remove from cache
        queryClient.removeQueries({ queryKey: [...contactsKey, 'detail', id] });
        // Update the contacts list
        queryClient.invalidateQueries({ queryKey: [...contactsKey, 'list'] });
        // Update statistics
        queryClient.invalidateQueries({ queryKey: contactStatsKey });
      },
      onError: (error) => {
        console.error('Error deleting contact:', error);
      },
    });
  };

  // ==================== CACHE MANAGEMENT ====================

  // Reset all contact form cache
  const resetContactFormCache = () => {
    queryClient.invalidateQueries({ queryKey: contactsKey });
    queryClient.invalidateQueries({ queryKey: contactStatsKey });
  };

  // Prefetch contact details (useful for admin list)
  const prefetchContactForm = async (id: string) => {
    await queryClient.prefetchQuery({
      queryKey: [...contactsKey, 'detail', id],
      queryFn: async () => {
        const { data } = await apiClient.get(`${endpoint}/${id}`);
        return data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  return {
    // Public operations
    useCreateContactForm,
    
    // Admin operations
    useGetAllContactForms,
    useGetContactFormById,
    useGetContactFormsStats,
    useUpdateContactFormStatus,
    useDeleteContactForm,
    
    // Cache management
    resetContactFormCache,
    prefetchContactForm,
  };
}