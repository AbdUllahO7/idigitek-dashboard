import { motion, Reorder } from "framer-motion"
import {
  AlertTriangle,
  LayoutGrid,
  PlusCircle,
  Search,
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  Trash,
  Loader2,
  ArrowUpDown
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"
import { cn } from "@/src/lib/utils"
import { useLanguage } from "@/src/context/LanguageContext"
import type { Section } from "@/src/api/types/hooks/section.types"
import { filterCurrentSections, getSectionVisualInfo, getTranslatedSectionName } from "@/src/utils/management/sectionHelper"
import { TFunction } from "i18next"

interface CurrentSectionsTabProps {
  hasWebsite: boolean
  orderedSections: Section[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onAddNewClick: () => void
  onToggleActive: (section: Section) => void
  onDelete: (section: Section) => void
  onReorder: (sections: Section[]) => void
  isToggling: boolean
  toggleSectionId?: string
  t: TFunction
  ready: boolean
}

export const CurrentSectionsTab = ({
  hasWebsite,
  orderedSections,
  searchQuery,
  onSearchChange,
  onAddNewClick,
  onToggleActive,
  onDelete,
  onReorder,
  isToggling,
  toggleSectionId,
  t,
  ready
}: CurrentSectionsTabProps) => {
  const { language } = useLanguage()
  
  const filteredCurrentSections = filterCurrentSections(orderedSections, searchQuery, t, ready)

  return (
    <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-xl overflow-hidden">
      
      {/* Responsive Tab Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 p-3 sm:p-4 md:p-5 lg:p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col gap-3 md:gap-4">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg md:rounded-xl shadow-lg flex-shrink-0">
                <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                  {ready ? t("sectionManagement.currentSections") : "Current Website Sections"}
                </h3>
              </div>
              {orderedSections.length > 0 && (
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs sm:text-sm flex-shrink-0">
                  {orderedSections.length} {language === 'en' ? 'Sections' : language === 'tr' ? 'Bölüm' : 'قسم'} {orderedSections.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Search - Full width on mobile */}
            <div className="relative flex-1 sm:flex-initial sm:min-w-0">
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder={ready ? t("sectionManagement.searchPlaceholder", "Search sections...") : "Search sections..."}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full sm:w-48 md:w-64 pl-8 sm:pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg md:rounded-xl text-sm"
              />
            </div>

            {/* Add button */}
            <Button
              onClick={onAddNewClick}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 sm:px-4 py-2 rounded-lg md:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base touch-manipulation"
            >
              <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">{ready ? t("sectionManagement.addNew", "Add New") : "Add New"}</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Responsive Tab Content */}
      <div className="p-3 sm:p-4 md:p-5 lg:p-6">
        {!hasWebsite ? (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl md:rounded-2xl p-4 md:p-6 text-center">
            <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-amber-600 dark:text-amber-400 mx-auto mb-3 md:mb-4" />
            <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2 text-sm sm:text-base">
              Website Required
            </h3>
            <p className="text-amber-700 dark:text-amber-400 text-xs sm:text-sm">
              Please create a website first to see its sections.
            </p>
          </div>
        ) : filteredCurrentSections.length > 0 ? (
          <div className="space-y-4 md:space-y-6">
            {orderedSections.length > 1 && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg md:rounded-xl p-2.5 sm:p-3">
                <ArrowUpDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>{t('sectionManagement.dragToReorder', 'Drag sections to reorder them')}</span>
              </div>
            )}
            
            <Reorder.Group 
              axis="y" 
              values={orderedSections} 
              onReorder={onReorder}
              className="space-y-3 sm:space-y-4"
            >
              {filteredCurrentSections.map((section: Section) => {
                const visualInfo = getSectionVisualInfo(section);
                return (
                  <Reorder.Item
                    key={section._id || `section-${section.name}`}
                    value={section}
                    className="cursor-move touch-manipulation"
                  >
                    <motion.div
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      className="group bg-white dark:bg-slate-800/90 rounded-xl md:rounded-2xl border border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-slate-900/20 backdrop-blur-sm overflow-hidden"
                    >
                      <div className="p-3 sm:p-4 md:p-5 lg:p-6 flex items-center gap-2 sm:gap-3 md:gap-4">
                        
                        {/* Responsive Drag Handle */}
                        <div className="text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 p-1.5 sm:p-2 rounded-lg md:rounded-xl cursor-grab hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors touch-manipulation flex-shrink-0">
                          <GripVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                        </div>

                        {/* Responsive Section Icon */}
                        <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br ${visualInfo.color} shadow-lg flex-shrink-0`}>
                          <div className="text-white text-sm sm:text-base">
                            {visualInfo.icon}
                          </div>
                        </div>

                        {/* Section Info - Responsive */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1 sm:mb-2">
                            <h3 className="font-bold text-sm sm:text-base md:text-lg text-slate-900 dark:text-slate-100 truncate">
                              {getTranslatedSectionName(section, t, ready)}
                            </h3>
                            <Badge
                              className={cn(
                                "transition-colors self-start sm:self-auto text-xs",
                                section.isActive 
                                  ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" 
                                  : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700"
                              )}
                            >
                              <div className={cn(
                                "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1.5 sm:mr-2",
                                section.isActive 
                                  ? "bg-green-500 shadow-green-500/50 shadow-sm" 
                                  : "bg-gray-400"
                              )} />
                              {section.isActive ? 
                                (ready ? t("sectionManagement.active", "Active") : "Active") : 
                                (ready ? t("sectionManagement.hidden", "Hidden") : "Hidden")
                              }
                            </Badge>
                          </div>
                          {section.description && (
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{section.description}</p>
                          )}
                        </div>

                        {/* Responsive Actions - Always visible on mobile */}
                        <div className="flex items-center gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleActive(section);
                                  }}
                                  disabled={isToggling}
                                  className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg md:rounded-xl touch-manipulation"
                                >
                                  {isToggling && toggleSectionId === section._id ? (
                                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                                  ) : section.isActive ? (
                                    <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  ) : (
                                    <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">{section.isActive ? "Hide section" : "Show section"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(section);
                                  }}
                                  className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg md:rounded-xl touch-manipulation"
                                >
                                  <Trash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">Delete section</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </motion.div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          </div>
        ) : searchQuery ? (
          <div className="text-center py-8 sm:py-12 md:py-16">
            <Search className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 text-slate-300 dark:text-slate-600" />
            <h3 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No sections found
            </h3>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-3 md:mb-4">
              No sections found matching "{searchQuery}"
            </p>
            <Button variant="outline" onClick={() => onSearchChange("")} className="rounded-lg md:rounded-xl text-sm">
              Clear search
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 md:py-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-xl md:rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center shadow-lg">
              <LayoutGrid className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 md:mb-3">
              {ready ? t("sectionManagement.noSectionsYet", "No sections yet") : "No sections yet"}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-4 md:mb-6 px-4 sm:px-0">
              {ready ? t("sectionManagement.noSectionsDescription", "Add pre-designed sections to create your website structure. Sections can be arranged in any order.") : "Add pre-designed sections to create your website structure. Sections can be arranged in any order."}
            </p>
            <Button 
              onClick={onAddNewClick} 
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg md:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base touch-manipulation"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              {ready ? t("sectionManagement.browseSections", "Browse Available Sections") : "Browse Available Sections"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}