// components/DeleteConfirmationDialog.tsx

"use client";

import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ContentElement } from "@/src/api/types/hooks/content.types";

export interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isDeleting: boolean;
  isRefreshing?: boolean;
  title?: string;
  sectionName?: string;
  description?: string;
  contentElements?: ContentElement[];
  customWarnings?: string[];
}

export const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  isRefreshing = false,
  title,
  sectionName = "section",
  description,
  contentElements = [],
  customWarnings = [],
}: DeleteConfirmationDialogProps) => {
  if (!isOpen) return null;

  const displayTitle = title || `Delete ${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}`;
  const displayDescription = description || `Are you sure you want to delete this ${sectionName}? This action cannot be undone.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {displayTitle}
        </h3>
        
        <div className="text-gray-600 mb-4">
          <p className="mb-2">{displayDescription}</p>
          
          {/* Content Elements Warning */}
          {contentElements.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-2">
              <p className="text-sm text-amber-800">
                <strong>This will also delete:</strong>
              </p>
              <ul className="text-sm text-amber-700 mt-1 ml-4 list-disc">
                <li>{contentElements.length} content elements</li>
                <li>All translations for these elements</li>
                <li>All {sectionName} configuration data</li>
              </ul>
            </div>
          )}

          {/* Custom Warnings */}
          {customWarnings.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-2">
              <p className="text-sm text-red-800">
                <strong>Additional warnings:</strong>
              </p>
              <ul className="text-sm text-red-700 mt-1 ml-4 list-disc">
                {customWarnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting || isRefreshing}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting || isRefreshing}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Permanently
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};