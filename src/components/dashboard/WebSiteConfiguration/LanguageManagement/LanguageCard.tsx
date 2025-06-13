import { motion } from "framer-motion"
import { Globe, ToggleLeft, ToggleRight, Edit, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"
import { cn } from "@/src/lib/utils"
import { useLanguage } from "@/src/context/LanguageContext"
import type { Language } from "@/src/api/types/hooks/language.types"
import { TFunction } from "i18next"

interface LanguageCardProps {
    language: Language
    onToggleActive: (id: string, isActive: boolean) => void
    onEdit: (language: Language) => void
    onDelete: (language: Language) => void
    hasWebsite: boolean
    isToggling: boolean
    t: TFunction
}

export const LanguageCard = ({
  language,
  onToggleActive,
  onEdit,
  onDelete,
  hasWebsite,
  isToggling,
  t
}: LanguageCardProps) => {
  const { language: currentLang } = useLanguage()
  const isRTL = currentLang === 'ar'

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="group border border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-slate-900/20 overflow-hidden bg-white dark:bg-slate-800/90 backdrop-blur-sm">
        <CardContent className="p-0">
          <div
            className={cn(
              "h-2 w-full transition-all duration-300",
              language.isActive
                ? "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"
                : "bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700"
            )}
          />
          <div className="p-6">
            <div className={cn(
              "flex justify-between items-start",
              isRTL ? "flex-row-reverse" : ""
            )}>
              <div className="flex-1">
                <div className={cn(
                  "flex items-center gap-3 mb-3",
                  isRTL ? "flex-row-reverse" : ""
                )}>
                  <div className={cn(
                    "w-12 h-12 rounded-xl bg-gradient-to-br shadow-lg flex items-center justify-center",
                    language.isActive 
                      ? "from-green-500 to-emerald-500"
                      : "from-slate-400 to-slate-500"
                  )}>
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1">
                      {language.language}
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    >
                      {language.languageID}
                    </Badge>
                  </div>
                </div>
                
                <Badge
                  className={cn(
                    "transition-all duration-200 font-medium border-0",
                    language.isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/40"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full mr-2",
                    language.isActive 
                      ? "bg-green-500 shadow-green-500/50 shadow-sm animate-pulse" 
                      : "bg-slate-400"
                  )} />
                  {language.isActive 
                    ? t('languageManagement.languageCard.status.active', 'Active')
                    : t('languageManagement.languageCard.status.inactive', 'Inactive')
                  }
                </Badge>
              </div>
              
              {/* Actions */}
              <div className={cn(
                "flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300",
                isRTL ? "flex-row-reverse" : ""
              )}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-10 w-10 rounded-xl transition-all duration-200 hover:scale-110",
                          language.isActive
                            ? "text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
                            : "text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-800"
                        )}
                        onClick={() => onToggleActive(language._id as string, language.isActive || false)}
                        disabled={isToggling || !hasWebsite}
                      >
                        {language.isActive ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {language.isActive 
                          ? t('languageManagement.languageCard.tooltips.deactivate', 'Deactivate language')
                          : t('languageManagement.languageCard.tooltips.activate', 'Activate language')
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 hover:scale-110"
                        onClick={() => onEdit(language)}
                        disabled={!hasWebsite}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('languageManagement.languageCard.tooltips.edit', 'Edit language')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 hover:scale-110"
                        onClick={() => onDelete(language)}
                        disabled={!hasWebsite}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('languageManagement.languageCard.tooltips.delete', 'Delete language')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}