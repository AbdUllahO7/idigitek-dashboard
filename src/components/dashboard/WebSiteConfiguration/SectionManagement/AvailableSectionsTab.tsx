import { motion } from "framer-motion"
import { AlertTriangle, Plus, Search, Filter, Check } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/src/components/ui/dropdown-menu"
import { cn } from "@/src/lib/utils"
import { SectionCard } from "./SectionCard"
import type { Section } from "@/src/api/types/hooks/section.types"
import { SECTION_CATEGORIES } from "@/src/Const/SectionsData"
import { filterPredefinedSections } from "@/src/utils/management/sectionHelper"
import { PredefinedSection } from "@/src/api/types/management/SectionManagement.type"
import { TFunction } from "i18next"

interface AvailableSectionsTabProps {
  hasWebsite: boolean
  orderedSections: Section[]
  searchQuery: string
  categoryFilter: string
  onSearchChange: (query: string) => void
  onCategoryChange: (category: string) => void
  onAddSection: (section: PredefinedSection) => void
  isLoading: boolean
  t: TFunction
  ready: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const gridItemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 15 },
  },
}

export const AvailableSectionsTab = ({
  hasWebsite,
  orderedSections,
  searchQuery,
  categoryFilter,
  onSearchChange,
  onCategoryChange,
  onAddSection,
  isLoading,
  t,
  ready
}: AvailableSectionsTabProps) => {
  
  const filteredPredefinedSections = filterPredefinedSections(
    searchQuery,
    categoryFilter,
    orderedSections,
    t,
    ready
  )

  return (
    <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-xl overflow-hidden">
      
      {/* Responsive Tab Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 p-3 sm:p-4 md:p-5 lg:p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col gap-3 md:gap-4">
          
          {/* Header Row */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg md:rounded-xl shadow-lg flex-shrink-0">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                {t("sectionManagement.addNewSections")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hidden sm:block">
                {t("sectionManagement.descriptions.collectionDescription")}
              </p>
            </div>
          </div>

          {/* Controls Row - Responsive Layout */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Search - Full width on mobile */}
            <div className="relative flex-1 sm:flex-initial sm:min-w-0">
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder={t("sectionManagement.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full sm:w-48 md:w-64 pl-8 sm:pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg md:rounded-xl text-sm"
              />
            </div>

            {/* Category filter - Responsive */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 justify-between bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg md:rounded-xl text-sm w-full sm:w-auto sm:min-w-32 touch-manipulation"
                >
                  <span className="truncate">
                    {t(SECTION_CATEGORIES.find((cat) => cat.value === categoryFilter)?.labelKey || "sectionManagement.categories.all")}
                  </span>
                  <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-sm">{t("sectionManagement.filter.filterByCategory")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {SECTION_CATEGORIES.map((category) => (
                  <DropdownMenuItem
                    key={category.value}
                    onClick={() => onCategoryChange(category.value)}
                    className={cn(
                      "cursor-pointer text-sm touch-manipulation",
                      categoryFilter === category.value 
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium" 
                        : "hover:bg-slate-50 dark:hover:bg-slate-700"
                    )}
                  >
                    {categoryFilter === category.value && <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />}
                    {t(category.labelKey)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Responsive Tab Content */}
      <div className="p-3 sm:p-4 md:p-5 lg:p-6">
        {!hasWebsite && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl md:rounded-2xl p-4 md:p-6 text-center mb-4 md:mb-6">
            <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-amber-600 dark:text-amber-400 mx-auto mb-3 md:mb-4" />
            <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2 text-sm sm:text-base">
              {t("sectionManagement.requirements.websiteRequired")}
            </h3>
            <p className="text-amber-700 dark:text-amber-400 text-xs sm:text-sm">
              {t("sectionManagement.requirements.createWebsiteBeforeAdding")}
            </p>
          </div>
        )}

        {/* Helper Text for Image Previews */}
        {filteredPredefinedSections.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800/50 rounded-xl p-3 sm:p-4 mb-4 md:mb-6">
            <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="font-medium">
                {t("sectionManagement.descriptions.imagePreviewTip")}
              </span>
            </div>
          </div>
        )}

        {/* Responsive Grid with Section Cards */}
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
          className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filteredPredefinedSections.map((section, index) => {
            const translatedName = t(section.nameKey, section.nameKey.split('.').pop() || '')
            const translatedDescription = t(section.descriptionKey, '')
            
            return (
              <motion.div
                key={section.nameKey}
                variants={gridItemVariants}
                custom={index}
              >
                <SectionCard
                  section={section}
                  translatedName={translatedName}
                  translatedDescription={translatedDescription}
                  onAdd={onAddSection}
                  isLoading={isLoading}
                  hasWebsite={hasWebsite}
                  t={t}
                />
              </motion.div>
            )
          })}
        </motion.div>

        {/* No Results State - Responsive */}
        {filteredPredefinedSections.length === 0 && (
          <div className="text-center py-8 sm:py-12 md:py-16">
            <Search className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 text-slate-300 dark:text-slate-600" />
            <h3 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t("sectionManagement.states.noSectionsFound")}
            </h3>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-3 md:mb-4 px-4 sm:px-0">
              {t("sectionManagement.states.noSectionsFoundMatching")} "{searchQuery}"
              {categoryFilter !== 'all' && ` ${t("sectionManagement.states.inCategory", { category: categoryFilter })}`}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button 
                variant="outline" 
                onClick={() => onSearchChange("")}
                className="rounded-lg md:rounded-xl text-sm touch-manipulation"
              >
                {t("sectionManagement.search.clearSearch")}
              </Button>
              {categoryFilter !== 'all' && (
                <Button 
                  variant="outline" 
                  onClick={() => onCategoryChange('all')}
                  className="rounded-lg md:rounded-xl text-sm touch-manipulation"
                >
                  {t("sectionManagement.search.showAllCategories")}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Tips Section with Image Information */}
        {filteredPredefinedSections.length > 0 && (
          <div className="mt-6 md:mt-8 p-4 md:p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl md:rounded-2xl">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              {t("sectionManagement.tips.tips")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>{t("sectionManagement.tips.tip1")}</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>{t("sectionManagement.tips.tip2")}</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>{t("sectionManagement.tips.tip3")}</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>{t("sectionManagement.tips.tip4")}</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>{t("sectionManagement.tips.tip5")}</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>{t("sectionManagement.tips.tip6")}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}