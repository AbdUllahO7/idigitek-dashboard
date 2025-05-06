"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button"
import { Loader2 } from "lucide-react"

interface DeleteServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceName: string;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  title?: string,
  confirmText?:string
}

export default function DeleteServiceDialog({
  open,
  onOpenChange,
  serviceName,
  onConfirm,
  isDeleting,
  title,
  confirmText
}: DeleteServiceDialogProps) {
  
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <span className="font-semibold">{serviceName}</span>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              `${confirmText}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}