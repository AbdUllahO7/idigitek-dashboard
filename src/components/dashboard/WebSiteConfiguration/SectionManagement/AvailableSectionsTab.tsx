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
    <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-xl overflow-hidden">
      
      {/* Tab Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {ready ? t("sectionManagement.addNewSections", "Add Pre-designed Sections") : "Add Pre-designed Sections"}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Choose from our collection of beautiful sections
              </p>
            </div>
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

            {/* Category filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 min-w-32 justify-between bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl">
                  <span>
                    {ready ? 
                      t(SECTION_CATEGORIES.find((cat) => cat.value === categoryFilter)?.labelKey || "sectionManagement.categories.all", "All Sections") : 
                      "All Sections"
                    }
                  </span>
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {SECTION_CATEGORIES.map((category) => (
                  <DropdownMenuItem
                    key={category.value}
                    onClick={() => onCategoryChange(category.value)}
                    className={cn(
                      "cursor-pointer",
                      categoryFilter === category.value 
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium" 
                        : "hover:bg-slate-50 dark:hover:bg-slate-700"
                    )}
                  >
                    {categoryFilter === category.value && <Check className="h-4 w-4 mr-2" />}
                    {ready ? t(category.labelKey, category.labelKey.split('.').pop() || '') : category.labelKey.split('.').pop() || ''}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {!hasWebsite && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-center mb-6">
            <AlertTriangle className="h-12 w-12 text-amber-600 dark:text-amber-400 mx-auto mb-4" />
            <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
              Website Required
            </h3>
            <p className="text-amber-700 dark:text-amber-400">
              Please create a website first before adding sections.
            </p>
          </div>
        )}

        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
          className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
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

        {filteredPredefinedSections.length === 0 && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No sections found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              No sections found matching "{searchQuery}"
            </p>
            <Button 
              variant="outline" 
              onClick={() => onSearchChange("")}
              className="rounded-xl"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}