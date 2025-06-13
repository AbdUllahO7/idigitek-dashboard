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
                {ready ? t("sectionManagement.addNewSections", "Add Pre-designed Sections") : "Add Pre-designed Sections"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hidden sm:block">
                Choose from our collection of beautiful sections
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
                placeholder={ready ? t("sectionManagement.searchPlaceholder", "Search sections...") : "Search sections..."}
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
                    {ready ? 
                      t(SECTION_CATEGORIES.find((cat) => cat.value === categoryFilter)?.labelKey || "sectionManagement.categories.all", "All Sections") : 
                      "All Sections"
                    }
                  </span>
                  <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-sm">Filter by Category</DropdownMenuLabel>
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
                    {ready ? t(category.labelKey, category.labelKey.split('.').pop() || '') : category.labelKey.split('.').pop() || ''}
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
              Website Required
            </h3>
            <p className="text-amber-700 dark:text-amber-400 text-xs sm:text-sm">
              Please create a website first before adding sections.
            </p>
          </div>
        )}

        {/* Responsive Grid */}
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
          className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filteredPredefinedSections.map((section) => {
            const translatedName = ready ? t(section.nameKey, section.nameKey.split('.').pop() || '') : section.nameKey.split('.').pop() || ''
            const translatedDescription = ready ? t(section.descriptionKey, '') : ''
            
            return (
              <SectionCard
                key={section.nameKey}
                section={section}
                translatedName={translatedName}
                translatedDescription={translatedDescription}
                onAdd={onAddSection}
                isLoading={isLoading}
                hasWebsite={hasWebsite}
                t={t}
              />
            )
          })}
        </motion.div>

        {/* No Results State - Responsive */}
        {filteredPredefinedSections.length === 0 && (
          <div className="text-center py-8 sm:py-12 md:py-16">
            <Search className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 text-slate-300 dark:text-slate-600" />
            <h3 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No sections found
            </h3>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-3 md:mb-4 px-4 sm:px-0">
              No sections found matching "{searchQuery}"
            </p>
            <Button 
              variant="outline" 
              onClick={() => onSearchChange("")}
              className="rounded-lg md:rounded-xl text-sm touch-manipulation"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}