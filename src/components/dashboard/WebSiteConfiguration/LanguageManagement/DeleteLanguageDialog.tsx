import { AlertTriangle, Trash2, Loader2 } from "lucide-react"
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
import { cn } from "@/src/lib/utils"
import { useLanguage } from "@/src/context/LanguageContext"
import type { DeleteItemData } from "@/src/api/types/hooks/Common.types"
import { TFunction } from "i18next"

interface DeleteLanguageDialogProps {
  open: boolean
  itemToDelete: DeleteItemData | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isDeleting: boolean
  t: TFunction
}

export const DeleteLanguageDialog = ({
  open,
  itemToDelete,
  onOpenChange,
  onConfirm,
  isDeleting,
  t
}: DeleteLanguageDialogProps) => {
  const { language } = useLanguage()
  const isRTL = language === 'ar'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <AlertDialogTitle className="text-slate-900 dark:text-slate-100">
                {t('languageManagement.deleteDialog.title', 'Delete Language')}
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-slate-600 dark:text-slate-400 leading-relaxed">
            <p className="mb-4">
              {t('languageManagement.deleteDialog.description', `Are you sure you want to delete "${itemToDelete?.name}"?`)}
            </p>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-sm">
              <p className={cn(
                "font-semibold flex items-center gap-2 mb-2",
                isRTL ? "flex-row-reverse" : ""
              )}>
                <AlertTriangle className="h-4 w-4" />
                {t('languageManagement.deleteDialog.warning.title', 'Warning')}
              </p>
              <p>
                {t('languageManagement.deleteDialog.warning.description', 'This action cannot be undone. All content in this language will be lost.')}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3 mt-6">
          <AlertDialogCancel className="border-slate-200 dark:border-slate-700">
            {t('languageManagement.deleteDialog.buttons.cancel', 'Cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
            ) : null}
            {t('languageManagement.deleteDialog.buttons.delete', 'Delete Language')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}