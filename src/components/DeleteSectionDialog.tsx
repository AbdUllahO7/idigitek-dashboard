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
import { useTranslation } from "react-i18next"

interface DeleteSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceName: string;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  title?: string;
  confirmText?: string;
}

export default function DeleteSectionDialog({
  open,
  onOpenChange,
  serviceName,
  onConfirm,
  isDeleting,
  title,
  confirmText,
}: DeleteSectionDialogProps) {
  const { t } = useTranslation()

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title || t("deleteSectionDialog.titles.deleteSection")}</DialogTitle>
          <DialogDescription>
            <span
              dangerouslySetInnerHTML={{
                __html: t("deleteSectionDialog.descriptions.confirmDelete"),
              }}
            />
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            {t("deleteSectionDialog.buttons.cancel")}
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("deleteSectionDialog.buttons.deleting")}
              </>
            ) : (
              confirmText || t("deleteSectionDialog.buttons.delete")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}