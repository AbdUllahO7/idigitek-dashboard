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
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      <Card className="group border border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-slate-900/20 overflow-hidden bg-white dark:bg-slate-800/90 backdrop-blur-sm">
        <CardContent className="p-0">
          {/* Status Bar - Responsive Height */}
          <div
            className={cn(
              "h-1.5 sm:h-2 w-full transition-all duration-300",
              language.isActive
                ? "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"
                : "bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700"
            )}
          />
          
          {/* Card Content - Responsive Padding */}
          <div className="p-3 sm:p-4 md:p-5 lg:p-6">
            <div className={cn(
              "flex justify-between items-start gap-3 sm:gap-4",
              isRTL ? "flex-row-reverse" : ""
            )}>
              
              {/* Left Content - Language Info */}
              <div className="flex-1 min-w-0"> {/* min-w-0 prevents flex overflow */}
                <div className={cn(
                  "flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3",
                  isRTL ? "flex-row-reverse" : ""
                )}>
                  {/* Icon - Responsive Size */}
                  <div className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br shadow-lg flex items-center justify-center flex-shrink-0",
                    language.isActive 
                      ? "from-green-500 to-emerald-500"
                      : "from-slate-400 to-slate-500"
                  )}>
                    <Globe className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  
                  {/* Language Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base md:text-lg text-slate-900 dark:text-slate-100 mb-1 truncate">
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
                
                {/* Status Badge - Responsive */}
                <Badge
                  className={cn(
                    "transition-all duration-200 font-medium border-0 text-xs sm:text-sm",
                    language.isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/40"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  <div className={cn(
                    "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1.5 sm:mr-2",
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
              
              {/* Right Actions - Always Visible on Mobile, Hover on Desktop */}
              <div className={cn(
                "flex gap-1 sm:gap-2 flex-shrink-0",
                // Always visible on mobile, hover on desktop
                "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300",
                isRTL ? "flex-row-reverse" : ""
              )}>
                
                {/* Toggle Active Button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110 touch-manipulation",
                          language.isActive
                            ? "text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
                            : "text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-800"
                        )}
                        onClick={() => onToggleActive(language._id as string, language.isActive || false)}
                        disabled={isToggling || !hasWebsite}
                      >
                        {language.isActive ? (
                          <ToggleRight className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">
                        {language.isActive 
                          ? t('languageManagement.languageCard.tooltips.deactivate', 'Deactivate language')
                          : t('languageManagement.languageCard.tooltips.activate', 'Activate language')
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Edit Button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110 touch-manipulation"
                        onClick={() => onEdit(language)}
                        disabled={!hasWebsite}
                      >
                        <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">{t('languageManagement.languageCard.tooltips.edit', 'Edit language')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Delete Button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110 touch-manipulation"
                        onClick={() => onDelete(language)}
                        disabled={!hasWebsite}
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">{t('languageManagement.languageCard.tooltips.delete', 'Delete language')}</p>
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