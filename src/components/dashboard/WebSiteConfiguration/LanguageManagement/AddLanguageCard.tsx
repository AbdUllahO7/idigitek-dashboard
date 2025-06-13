import { motion } from "framer-motion"
import { AlertTriangle, Plus, Globe, Flag, HelpCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Button } from "@/src/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"
import { cn } from "@/src/lib/utils"
import { useLanguage } from "@/src/context/LanguageContext"
import type { Language } from "@/src/api/types/hooks/language.types"
import { CommonLanguage } from "@/src/api/types/management/LanguageManagement.type"
import { COMMON_LANGUAGES } from "@/src/Const/LanguageData"
import { TFunction } from "i18next"

interface AddLanguageCardProps {
  hasWebsite: boolean
  websiteId?: string
  newLanguage: Language
  onLanguageChange: (language: Language) => void
  onAddLanguage: () => void
  onResetForm: () => void
  isLoading: boolean
  t: TFunction
}

export const AddLanguageCard = ({
  hasWebsite,
  websiteId,
  newLanguage,
  onLanguageChange,
  onAddLanguage,
  onResetForm,
  isLoading,
  t
}: AddLanguageCardProps) => {
  const { language } = useLanguage()
  const isRTL = language === 'ar'
  const noWebsiteSelected = !websiteId || websiteId === ""

  const handleQuickSelect = (lang: CommonLanguage) => {
    onLanguageChange({
      ...newLanguage,
      languageID: lang.id,
      language: lang.name,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="overflow-hidden border-none shadow-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {t('languageManagement.addNew.title', 'Add New Language')}
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                {t('languageManagement.addNew.description', 'Configure a new language for your website')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          {!hasWebsite || noWebsiteSelected ? (
            <div className={cn(
              "mb-6 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 rounded-2xl flex items-start gap-4",
              isRTL ? "flex-row-reverse" : ""
            )}>
              <AlertTriangle className="h-6 w-6 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-lg mb-2">
                  {t('languageManagement.addNew.websiteRequired.title', 'Website Required')}
                </p>
                <p className="text-sm">
                  {!hasWebsite
                    ? t('languageManagement.addNew.websiteRequired.noWebsite', 'Please create a website first')
                    : t('languageManagement.addNew.websiteRequired.noSelected', 'Please select a website')}
                </p>
              </div>
            </div>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="new-language-id" className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <span>{t('languageManagement.form.labels.languageId', 'Language ID')}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-slate-100 dark:hover:bg-slate-700">
                          <HelpCircle className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          {t('languageManagement.form.helpText.languageIdTooltip', 'Use standard language codes like en, ar, es')}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="relative group">
                  <div className={cn(
                    "absolute inset-y-0 flex items-center pointer-events-none z-10",
                    isRTL ? "right-0 pr-4" : "left-0 pl-4"
                  )}>
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                      <Flag className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <Input
                    id="new-language-id"
                    placeholder={t('languageManagement.form.placeholders.languageId', 'e.g., en, ar, es')}
                    value={newLanguage.languageID}
                    onChange={(e) => onLanguageChange({ ...newLanguage, languageID: e.target.value.toLowerCase() })}
                    className={cn(
                      "h-12 transition-all duration-300 border-2 rounded-xl",
                      "focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500",
                      "dark:focus:ring-purple-400/20 dark:focus:border-purple-400",
                      "dark:bg-slate-800/50 dark:border-slate-600",
                      "group-hover:shadow-lg group-hover:shadow-purple-500/10",
                      isRTL ? "pr-16 pl-4" : "pl-16 pr-4"
                    )}
                    disabled={!hasWebsite || noWebsiteSelected}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('languageManagement.form.helpText.languageId', 'Use ISO 639-1 language codes')}
                </p>

                {/* Quick language selection */}
                {hasWebsite && !noWebsiteSelected && (
                  <div className="space-y-3">
                    <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {t('languageManagement.form.quickSelect', 'Quick Select')}
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {COMMON_LANGUAGES.map((lang) => (
                        <motion.button
                          key={lang.id}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleQuickSelect(lang)}
                          className="text-xs px-3 py-2 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 hover:from-purple-100 hover:to-blue-100 dark:from-slate-800 dark:to-slate-700 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 transition-all duration-200 font-medium"
                        >
                          {lang.id}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="new-language-name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('languageManagement.form.labels.languageName', 'Language Name')}
                </Label>
                <div className="relative group">
                  <div className={cn(
                    "absolute inset-y-0 flex items-center pointer-events-none z-10",
                    isRTL ? "right-0 pr-4" : "left-0 pl-4"
                  )}>
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <Input
                    id="new-language-name"
                    placeholder={t('languageManagement.form.placeholders.languageName', 'e.g., English, العربية')}
                    value={newLanguage.language}
                    onChange={(e) => onLanguageChange({ ...newLanguage, language: e.target.value })}
                    className={cn(
                      "h-12 transition-all duration-300 border-2 rounded-xl",
                      "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                      "dark:focus:ring-blue-400/20 dark:focus:border-blue-400",
                      "dark:bg-slate-800/50 dark:border-slate-600",
                      "group-hover:shadow-lg group-hover:shadow-blue-500/10",
                      isRTL ? "pr-16 pl-4" : "pl-16 pr-4"
                    )}
                    disabled={!hasWebsite || noWebsiteSelected}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className={cn(
                  "flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700",
                  isRTL ? "flex-row-reverse space-x-reverse" : ""
                )}>
                  <Checkbox
                    id="new-language-active"
                    checked={newLanguage.isActive || false}
                    onCheckedChange={(checked) => onLanguageChange({ ...newLanguage, isActive: checked === true })}
                    disabled={!hasWebsite || noWebsiteSelected}
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <Label htmlFor="new-language-active" className="font-medium text-slate-900 dark:text-slate-100 cursor-pointer">
                      {t('languageManagement.form.labels.activeLanguage', 'Active Language')}
                    </Label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t('languageManagement.form.helpText.activeLanguage', 'Make this language available to users')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className={cn(
          "flex justify-between items-center border-t border-slate-200 dark:border-slate-700 p-8",
          "bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700",
          isRTL ? "flex-row-reverse" : ""
        )}>
          <Button
            variant="outline"
            onClick={onResetForm}
            disabled={!hasWebsite || noWebsiteSelected}
            className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            {t('languageManagement.form.buttons.resetForm', 'Reset Form')}
          </Button>
          <Button
            onClick={onAddLanguage}
            className={cn(
              "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
              "text-white px-8 h-12 rounded-xl font-semibold shadow-lg hover:shadow-xl",
              "transition-all duration-300 hover:scale-105 active:scale-95"
            )}
            disabled={isLoading || !hasWebsite || noWebsiteSelected}
          >
            {isLoading ? (
              <>
                <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
                {t('languageManagement.form.buttons.adding', 'Adding...')}
              </>
            ) : (
              <>
                <Plus className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {t('languageManagement.form.buttons.addLanguage', 'Add Language')}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}