import { Loader2, Trash } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog"
import type { DeleteItemData } from "@/src/api/types/hooks/Common.types"
import { TFunction } from "i18next"

interface DeleteDialogProps {
  itemToDelete: DeleteItemData | null
  onCancel: () => void
  onConfirm: () => void
  isDeleting: boolean
  t: TFunction
  ready: boolean
}

export const DeleteDialog = ({
  itemToDelete,
  onCancel,
  onConfirm,
  isDeleting,
  t,
  ready
}: DeleteDialogProps) => {
  return (
    <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Trash className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <AlertDialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {ready ? t("sectionManagement.modal.delete", "Delete Section") : "Delete Section"}
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {ready ? 
              t("sectionManagement.modal.deleteConfirmation", "This will permanently delete the section. This action cannot be undone, and any content in this section will be lost.") :
              "This will permanently delete the section. This action cannot be undone, and any content in this section will be lost."
            }
            {itemToDelete && (
              <span className="font-semibold text-slate-900 dark:text-slate-100"> "{itemToDelete.name}"</span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3 mt-6">
          <AlertDialogCancel 
            onClick={onCancel} 
            className="rounded-xl border-slate-200 dark:border-slate-700"
          >
            {ready ? t("sectionManagement.modal.cancel", "Cancel") : "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white hover:text-white flex items-center gap-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            {ready ? t("sectionManagement.modal.delete", "Delete Section") : "Delete Section"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}