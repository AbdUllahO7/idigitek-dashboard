"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, Menu, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { cn } from "@/src/lib/utils"
import { ManagementProps } from "@/src/api/types/management/SectionManagement.type"
import { useSectionManagement } from "@/src/hooks/Management/SectionManagement/useSectionManagement"
import { getTranslatedSectionName } from "@/src/utils/management/sectionHelper"
import { ModernError, ModernLoader } from "@/src/components/ModernLoader"
import { SectionHeader } from "./SectionHeader"
import { CurrentSectionsTab } from "./CurrentSectionsTab"
import { AvailableSectionsTab } from "./AvailableSectionsTab"
import { DeleteDialog } from "./DeleteDialog"

export function SectionManagement({ hasWebsite }: ManagementProps) {
  const {
    // State
    itemToDelete,
    showSavedSuccess,
    searchQuery,
    categoryFilter,
    activeTab,
    orderedSections,
    
    // Data
    isLoadingSections,
    sectionsError,
    isError,
    
    // Mutations
    createSectionMutation,
    deleteSectionMutation,
    toggleSectionActiveMutation,
    createUserSectionMutation,
    
    // Setters
    setItemToDelete,
    setSearchQuery,
    setCategoryFilter,
    setActiveTab,
    
    // Handlers
    handleAddPredefinedSection,
    handleToggleActive,
    handleReorder,
    confirmDelete,
    refetchSections,
    
    // Utils
    t,
    ready
  } = useSectionManagement(hasWebsite)

  // Handle opening delete dialog
  const handleOpenDelete = (section: any) => {
    const translatedName = getTranslatedSectionName(section, t, ready)
    setItemToDelete({
      _id: section._id,
      name: translatedName,
      type: "section",
    })
  }

  // Handle cancelling delete
  const handleCancelDelete = () => {
    setItemToDelete(null)
  }

  // Show loading state when fetching sections for this website
  if (isLoadingSections && hasWebsite) {
    return <ModernLoader />
  }

  // Show error state if there's an error fetching website sections
  if (isError && hasWebsite) {
    return <ModernError error={sectionsError} onRetry={refetchSections} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/30 relative">
      
      {/* Responsive Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-2xl sm:blur-3xl animate-pulse" />
        <div className="absolute top-1/4 sm:top-1/3 right-0 w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-2xl sm:blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/4 sm:left-1/3 w-36 h-36 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 bg-pink-400/10 dark:bg-pink-600/10 rounded-full blur-2xl sm:blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
          
          {/* Responsive Success Toast */}
          <AnimatePresence>
            {showSavedSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-3 sm:top-4 left-3 right-3 sm:left-4 sm:right-4 md:left-auto md:right-4 z-50 bg-green-50 dark:bg-green-900/60 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl shadow-2xl flex items-center gap-2 sm:gap-3 backdrop-blur-sm max-w-sm md:max-w-md mx-auto md:mx-0"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="font-medium text-sm sm:text-base">
                  {t('sectionManagement.changesSaved', 'Changes saved successfully!')}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header - Responsive */}
          <div className="w-full">
            <SectionHeader />
          </div>

          {/* Enhanced Responsive Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              
              {/* Mobile-First Tab Navigation */}
              <div className="flex justify-center mb-6 md:mb-8">
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl md:rounded-2xl p-1 md:p-2 border border-white/20 dark:border-slate-700/50 shadow-xl w-full max-w-full sm:max-w-md md:max-w-lg lg:w-auto overflow-hidden">
                  <TabsList className="grid grid-cols-2 bg-transparent gap-1 md:gap-2 w-full">
                    <TabsTrigger 
                      value="current"
                      className={cn(
                        "relative px-3 sm:px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm md:text-base",
                        "data-[state=active]:text-white data-[state=active]:shadow-lg",
                        "hover:scale-105 active:scale-95 touch-manipulation",
                        "flex items-center justify-center gap-1 sm:gap-2",
                        activeTab === 'current' 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      )}
                    >
                      <Menu className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                      <span className="hidden sm:inline md:hidden lg:inline">
                        {t('sectionManagement.current', 'Current Sections')}
                      </span>
                      <span className="sm:hidden md:inline lg:hidden">
                        {t('sectionManagement.currentShort', 'Current')}
                      </span>
                      {activeTab === 'current' && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-lg md:rounded-xl"
                          transition={{ type: "spring", duration: 0.5 }}
                        />
                      )}
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="available"
                      className={cn(
                        "relative px-3 sm:px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm md:text-base",
                        "data-[state=active]:text-white data-[state=active]:shadow-lg",
                        "hover:scale-105 active:scale-95 touch-manipulation",
                        "flex items-center justify-center gap-1 sm:gap-2",
                        activeTab === 'available' 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      )}
                    >
                      <Plus className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                      <span className="hidden sm:inline md:hidden lg:inline">
                        {ready ? t("sectionManagement.addNew", "Add New") : "Add New"}
                      </span>
                      <span className="sm:hidden md:inline lg:hidden">
                        {ready ? t("sectionManagement.addNewShort", "Add") : "Add"}
                      </span>
                      {activeTab === 'available' && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-lg md:rounded-xl"
                          transition={{ type: "spring", duration: 0.5 }}
                        />
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              {/* Current Sections Tab - Responsive Content */}
              <TabsContent value="current" className="space-y-4 md:space-y-6 mt-0">
                <div className="w-full">
                  <CurrentSectionsTab
                    hasWebsite={hasWebsite}
                    orderedSections={orderedSections}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onAddNewClick={() => setActiveTab("available")}
                    onToggleActive={handleToggleActive}
                    onDelete={handleOpenDelete}
                    onReorder={handleReorder}
                    isToggling={toggleSectionActiveMutation.isPending}
                    toggleSectionId={toggleSectionActiveMutation.variables?.id}
                    t={t}
                    ready={ready}
                  />
                </div>
              </TabsContent>

              {/* Available Sections Tab - Responsive Content */}
              <TabsContent value="available" className="space-y-4 md:space-y-6 mt-0">
                <div className="w-full">
                  <AvailableSectionsTab
                    hasWebsite={hasWebsite}
                    orderedSections={orderedSections}
                    searchQuery={searchQuery}
                    categoryFilter={categoryFilter}
                    onSearchChange={setSearchQuery}
                    onCategoryChange={setCategoryFilter}
                    onAddSection={handleAddPredefinedSection}
                    isLoading={
                      createSectionMutation.isPending ||
                      (createUserSectionMutation?.isPending ?? false)
                    }
                    t={t}
                    ready={ready}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Delete Dialog - Mobile Optimized */}
          <DeleteDialog
            itemToDelete={itemToDelete}
            onCancel={handleCancelDelete}
            onConfirm={confirmDelete}
            isDeleting={deleteSectionMutation.isPending}
            t={t}
            ready={ready}
          />
        </div>
      </div>
    </div>
  )
}