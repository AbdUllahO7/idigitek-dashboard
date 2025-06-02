// hooks/useDeleteSubsection.ts

import { useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/src/hooks/use-toast';
import apiClient from '@/src/lib/api-client';

export interface DeleteSubsectionOptions {
  subsectionId: string | null;
  websiteId?: string;
  slug?: string;
  sectionName?: string; // For custom success/error messages
  onDeleteSuccess?: () => void | Promise<void>;
  onDeleteError?: (error: any) => void;
  shouldRefetch?: boolean;
  refetchFn?: () => Promise<any>;
  resetForm?: () => void;
  resetState?: () => void;
  onDataChange?: (data: any) => void;
}

export interface DeleteSubsectionResult {
  deleteSubsection: () => Promise<boolean>;
  isDeleting: boolean;
  error: any;
  reset: () => void;
}

export const useDeleteSubsection = (options: DeleteSubsectionOptions): DeleteSubsectionResult => {
  const {
    subsectionId,
    websiteId,
    slug,
    sectionName = "section",
    onDeleteSuccess,
    onDeleteError,
    shouldRefetch = true,
    refetchFn,
    resetForm,
    resetState,
    onDataChange,
  } = options;

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const dataProcessed = useRef(false);

  // Custom delete mutation with backend cascade delete
  const deleteSubsectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/subsections/${id}`, {
        params: { 
          hardDelete: true,
          cascadeDelete: true  // Let backend handle cascade deletion
        }
      });
      return data;
    },
    onSuccess: async (data) => {
      // Invalidate all related queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['subsections'] });
      queryClient.invalidateQueries({ queryKey: ['content-elements'] });
      queryClient.invalidateQueries({ queryKey: ['content-translations'] });
      
      // If we have a slug, also invalidate the specific slug query
      if (slug) {
        queryClient.invalidateQueries({ queryKey: ['subsections', 'slug', slug] });
      }
      
      // Invalidate website-specific queries if we have websiteId
      if (websiteId) {
        queryClient.invalidateQueries({ queryKey: ['subsections', 'website', websiteId] });
      }
      
      // Show success message with details
      toast({
        title: `${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)} deleted successfully!`,
        description: data.deletedElements 
          ? `Deleted subsection and ${data.deletedElements} content elements.`
          : `The ${sectionName} has been removed.`,
      });

      // Call custom success handler
      if (onDeleteSuccess) {
        await onDeleteSuccess();
      }
    },
    onError: (error) => {
      console.error("Delete mutation failed:", error);
      toast({
        title: `Failed to delete ${sectionName}`,
        variant: "destructive",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });

      // Call custom error handler
      if (onDeleteError) {
        onDeleteError(error);
      }
    },
  });

  // Main delete function
  const deleteSubsection = useCallback(async (): Promise<boolean> => {
    if (!subsectionId) {
      toast({
        title: "Error",
        description: "No subsection to delete",
        variant: "destructive",
      });
      return false;
    }

    try {
      await deleteSubsectionMutation.mutateAsync(subsectionId);

      // Reset form and state
      if (resetForm) {
        resetForm();
      }

      if (resetState) {
        resetState();
      }

      // Handle refetch logic for slug-based components
      if (shouldRefetch && refetchFn && slug) {
        dataProcessed.current = false;
        
        try {
          const result = await refetchFn();
          if (result.data?.data) {
            // Component should handle processing the refetched data
            // This is handled by the component's processData function
          } else {
            // If no data returned, it means the subsection was successfully deleted
            // Keep the form in its reset state
          }
        } catch (refetchError) {
          // If refetch fails (404 expected after deletion), that's normal
          console.log("Refetch after deletion resulted in expected error (subsection deleted)");
        }
      }

      // Notify parent component about the deletion
      if (onDataChange) {
        onDataChange(null); // Pass null to indicate deletion
      }

      return true;
    } catch (error) {
      console.error("Delete operation failed:", error);
      toast({
        title: `Error deleting ${sectionName}`,
        variant: "destructive",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      return false;
    }
  }, [
    subsectionId,
    deleteSubsectionMutation,
    toast,
    resetForm,
    resetState,
    shouldRefetch,
    refetchFn,
    slug,
    onDataChange,
    sectionName
  ]);

  return {
    deleteSubsection,
    isDeleting: deleteSubsectionMutation.isPending,
    error: deleteSubsectionMutation.error,
    reset: deleteSubsectionMutation.reset,
  };
};