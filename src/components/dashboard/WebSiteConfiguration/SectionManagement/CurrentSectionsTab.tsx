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
    <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-xl overflow-hidden">
      {/* Tab Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <LayoutGrid className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {ready ? t("sectionManagement.currentSections") : "Current Website Sections"}
              </h3>
            </div>
            {orderedSections.length > 0 && (
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                {orderedSections.length} {language === 'en' ? 'Sections' : language === 'tr' ? 'Bölüm' : 'قسم'} {orderedSections.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder={ready ? t("sectionManagement.searchPlaceholder", "Search sections...") : "Search sections..."}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-64 pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            {/* Add button */}
            <Button
              onClick={onAddNewClick}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              {ready ? t("sectionManagement.addNew", "Add New") : "Add New"}
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {!hasWebsite ? (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-600 dark:text-amber-400 mx-auto mb-4" />
            <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
              Website Required
            </h3>
            <p className="text-amber-700 dark:text-amber-400">
              Please create a website first to see its sections.
            </p>
          </div>
        ) : filteredCurrentSections.length > 0 ? (
          <div className="space-y-6">
            {orderedSections.length > 1 && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                <ArrowUpDown className="h-4 w-4" />
                <span>{t('sectionManagement.dragToReorder', 'Drag sections to reorder them')}</span>
              </div>
            )}
            
            <Reorder.Group 
              axis="y" 
              values={orderedSections} 
              onReorder={onReorder}
              className="space-y-4"
            >
              {filteredCurrentSections.map((section: Section) => {
                const visualInfo = getSectionVisualInfo(section);
                return (
                  <Reorder.Item
                    key={section._id || `section-${section.name}`}
                    value={section}
                    className="cursor-move"
                  >
                    <motion.div
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="group bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-slate-900/20 backdrop-blur-sm overflow-hidden"
                    >
                      <div className="p-6 flex items-center gap-4">
                        {/* Drag Handle */}
                        <div className="text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 p-2 rounded-xl cursor-grab hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <GripVertical className="h-5 w-5" />
                        </div>

                        {/* Section Icon */}
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${visualInfo.color} shadow-lg`}>
                          <div className="text-white">
                            {visualInfo.icon}
                          </div>
                        </div>

                        {/* Section Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                              {getTranslatedSectionName(section, t, ready)}
                            </h3>
                            <Badge
                              className={cn(
                                "transition-colors",
                                section.isActive 
                                  ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" 
                                  : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700"
                              )}
                            >
                              <div className={cn(
                                "w-2 h-2 rounded-full mr-2",
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
                            <p className="text-sm text-slate-600 dark:text-slate-400">{section.description}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                  className="h-10 w-10 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl"
                                >
                                  {isToggling && toggleSectionId === section._id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : section.isActive ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeOff className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{section.isActive ? "Hide section" : "Show section"}</p>
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
                                  className="h-10 w-10 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete section</p>
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
          <div className="text-center py-16">
            <Search className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No sections found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              No sections found matching "{searchQuery}"
            </p>
            <Button variant="outline" onClick={() => onSearchChange("")} className="rounded-xl">
              Clear search
            </Button>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center shadow-lg">
              <LayoutGrid className="h-12 w-12 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {ready ? t("sectionManagement.noSectionsYet", "No sections yet") : "No sections yet"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
              {ready ? t("sectionManagement.noSectionsDescription", "Add pre-designed sections to create your website structure. Sections can be arranged in any order.") : "Add pre-designed sections to create your website structure. Sections can be arranged in any order."}
            </p>
            <Button 
              onClick={onAddNewClick} 
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              {ready ? t("sectionManagement.browseSections", "Browse Available Sections") : "Browse Available Sections"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}