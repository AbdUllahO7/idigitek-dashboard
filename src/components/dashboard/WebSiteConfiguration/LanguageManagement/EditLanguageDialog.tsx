import { Flag, Globe, Save, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/src/components/ui/dialog"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Button } from "@/src/components/ui/button"
import { cn } from "@/src/lib/utils"
import { useLanguage } from "@/src/context/LanguageContext"
import type { EditItemData } from "@/src/api/types/hooks/Common.types"
import { TFunction } from "i18next"

interface EditLanguageDialogProps {
  open: boolean
  editItem: EditItemData | null
  onOpenChange: (open: boolean) => void
  onEditItemChange: (item: EditItemData) => void
  onSave: () => void
  isLoading: boolean
  t: TFunction
}

export const EditLanguageDialog = ({
  open,
  editItem,
  onOpenChange,
  onEditItemChange,
  onSave,
  isLoading,
  t
}: EditLanguageDialogProps) => {
  const { language } = useLanguage()
  const isRTL = language === 'ar'

  if (!editItem || editItem.type !== "language") {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            {t('languageManagement.editDialog.title', 'Edit Language')}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            {t('languageManagement.editDialog.description', 'Update language information')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="edit-language-id" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('languageManagement.editDialog.labels.languageId', 'Language ID')}
            </Label>
            <div className="relative">
              <div className={cn(
                "absolute inset-y-0 flex items-center pointer-events-none z-10",
                isRTL ? "right-0 pr-4" : "left-0 pl-4"
              )}>
                <Flag className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                id="edit-language-id"
                value={editItem.languageID || ""}
                onChange={(e) =>
                  onEditItemChange({ ...editItem, languageID: e.target.value.toLowerCase() })
                }
                className={cn(
                  "h-12 border-2 rounded-xl",
                  isRTL ? "pr-12 pl-4" : "pl-12 pr-4"
                )}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="edit-language-name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('languageManagement.editDialog.labels.languageName', 'Language Name')}
            </Label>
            <div className="relative">
              <div className={cn(
                "absolute inset-y-0 flex items-center pointer-events-none z-10",
                isRTL ? "right-0 pr-4" : "left-0 pl-4"
              )}>
                <Globe className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                id="edit-language-name"
                value={editItem.language || ""}
                onChange={(e) => onEditItemChange({ ...editItem, language: e.target.value })}
                className={cn(
                  "h-12 border-2 rounded-xl",
                  isRTL ? "pr-12 pl-4" : "pl-12 pr-4"
                )}
              />
            </div>
          </div>
          
          <div className={cn(
            "flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl",
            isRTL ? "flex-row-reverse space-x-reverse" : ""
          )}>
            <Checkbox
              id="edit-language-active"
              checked={editItem.isActive || false}
              onCheckedChange={(checked) =>
                onEditItemChange({ ...editItem, isActive: checked === true })
              }
              className="w-5 h-5"
            />
            <Label htmlFor="edit-language-active" className="font-medium text-slate-900 dark:text-slate-100 cursor-pointer">
              {t('languageManagement.editDialog.labels.active', 'Active Language')}
            </Label>
          </div>
        </div>
        
        <DialogFooter className={cn(
          "sm:justify-between gap-3",
          isRTL ? "sm:flex-row-reverse" : ""
        )}>
          <DialogClose asChild>
            <Button variant="outline" className="border-slate-200 dark:border-slate-700">
              {t('languageManagement.form.buttons.cancel', 'Cancel')}
            </Button>
          </DialogClose>
          <Button
            onClick={onSave}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
          >
            {isLoading ? (
              <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
            ) : (
              <Save className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            )}
            {t('languageManagement.form.buttons.saveChanges', 'Save Changes')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}