// hooks/useSubsectionDeleteManager.ts

import { useState, useCallback } from 'react';
import { useDeleteSubsection, DeleteSubsectionOptions } from './useDeleteSubsection';
import { ContentElement } from '@/src/api/types/hooks/content.types';

export interface SubsectionDeleteManagerOptions extends Omit<DeleteSubsectionOptions, 'onDeleteSuccess'> {
  contentElements?: ContentElement[];
  customWarnings?: string[];
  onDeleteSuccess?: () => void | Promise<void>;
}

export interface SubsectionDeleteManagerResult {
  // Dialog state
  showDeleteConfirm: boolean;
  openDeleteDialog: () => void;
  closeDeleteDialog: () => void;
  
  // Delete functionality
  handleDelete: () => Promise<boolean>;
  isDeleting: boolean;
  
  // For the confirmation dialog
  confirmationDialogProps: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    isDeleting: boolean;
    sectionName?: string;
    contentElements?: ContentElement[];
    customWarnings?: string[];
  };
}

export const useSubsectionDeleteManager = (
  options: SubsectionDeleteManagerOptions
): SubsectionDeleteManagerResult => {
  const {
    contentElements = [],
    customWarnings = [],
    onDeleteSuccess,
    ...deleteOptions
  } = options;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Enhanced delete success handler
  const handleDeleteSuccess = useCallback(async () => {
    setShowDeleteConfirm(false);
    if (onDeleteSuccess) {
      await onDeleteSuccess();
    }
  }, [onDeleteSuccess]);

  // Use the base delete hook
  const { deleteSubsection, isDeleting, error, reset } = useDeleteSubsection({
    ...deleteOptions,
    onDeleteSuccess: handleDeleteSuccess,
  });

  // Dialog management
  const openDeleteDialog = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  // Handle delete with dialog management
  const handleDelete = useCallback(async (): Promise<boolean> => {
    const result = await deleteSubsection();
    return result;
  }, [deleteSubsection]);

  return {
    showDeleteConfirm,
    openDeleteDialog,
    closeDeleteDialog,
    handleDelete,
    isDeleting,
    confirmationDialogProps: {
      isOpen: showDeleteConfirm,
      onClose: closeDeleteDialog,
      onConfirm: async () => { await handleDelete(); },
      isDeleting,
      sectionName: deleteOptions.sectionName,
      contentElements,
      customWarnings,
    },
  };
};