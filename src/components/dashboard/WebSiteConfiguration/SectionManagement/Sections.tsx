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


// Import all the extracted components


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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/30">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-pink-400/10 dark:bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Success Toast */}
          <AnimatePresence>
            {showSavedSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-4 right-4 z-50 bg-green-50 dark:bg-green-900/60 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-sm"
              >
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">Changes saved successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <SectionHeader />

          {/* Enhanced Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              
              {/* Modern Tab Navigation */}
              <div className="flex justify-center mb-8">
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-2 border border-white/20 dark:border-slate-700/50 shadow-xl">
                  <TabsList className="grid grid-cols-2 bg-transparent gap-2 w-80">
                    <TabsTrigger 
                      value="current"
                      className={cn(
                        "relative px-6 py-3 rounded-xl font-semibold transition-all duration-300",
                        "data-[state=active]:text-white data-[state=active]:shadow-lg",
                        "hover:scale-105 active:scale-95",
                        activeTab === 'current' 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      )}
                    >
                      <Menu className="h-5 w-5 mr-2" />
                      {t('sectionManagement.current', 'Current Sections')}
                      {activeTab === 'current' && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl"
                          transition={{ type: "spring", duration: 0.5 }}
                        />
                      )}
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="available"
                      className={cn(
                        "relative px-6 py-3 rounded-xl font-semibold transition-all duration-300",
                        "data-[state=active]:text-white data-[state=active]:shadow-lg",
                        "hover:scale-105 active:scale-95",
                        activeTab === 'available' 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      )}
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      {ready ? t("sectionManagement.addNew", "Add New") : "Add New"}
                      {activeTab === 'available' && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl"
                          transition={{ type: "spring", duration: 0.5 }}
                        />
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              {/* Current Sections Tab */}
              <TabsContent value="current" className="space-y-6">
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
              </TabsContent>

              {/* Available Sections Tab */}
              <TabsContent value="available" className="space-y-6">
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
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Delete Dialog */}
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