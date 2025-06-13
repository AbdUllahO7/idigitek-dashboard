"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/src/lib/utils"
import { useLanguage } from "@/src/context/LanguageContext"

import { ManagementProps } from "@/src/api/types/management/SectionManagement.type"
import { useLanguageManagement } from "@/src/hooks/Management/LanguageManagement/useLanguageManagement"
import { createEmptyLanguage } from "@/src/utils/management/languageHelper"
import { LanguageError, LanguageLoader } from "./LanguageLoader"
import { LanguageHeader } from "./LanguageHeader"
import { AddLanguageCard } from "./AddLanguageCard"
import { ManageLanguagesCard } from "./ManageLanguagesCard"
import { EditLanguageDialog } from "./EditLanguageDialog"
import { DeleteLanguageDialog } from "./DeleteLanguageDialog"



export function LanguageManagement({ hasWebsite }: ManagementProps) {
  const { language } = useLanguage()
  const isRTL = language === 'ar'

  const {
    // State
    newLanguage,
    editItem,
    itemToDelete,
    showSavedSuccess,
    searchQuery,
    activeTab,
    expandedInfo,

    // Data
    languageArray,
    isLoadingLanguages,
    languagesError,

    // Mutations
    createLanguageMutation,
    updateLanguageMutation,
    deleteLanguageMutation,
    toggleLanguageActiveMutation,

    // Setters
    setNewLanguage,
    setEditItem,
    setItemToDelete,
    setSearchQuery,
    setActiveTab,
    setExpandedInfo,

    // Handlers
    handleAddLanguage,
    handleEdit,
    handleToggleActive,
    handleSaveEdit,
    confirmDelete,
    refetchLanguages,

    // Utils
    t
  } = useLanguageManagement(hasWebsite)

  // Get websiteId from the hook
  const websiteId = newLanguage.websiteId

  // Handle reset form
  const handleResetForm = () => {
    setNewLanguage(createEmptyLanguage(websiteId || ""))
  }

  // Handle opening delete dialog
  const handleOpenDelete = (language: any) => {
    setItemToDelete({ ...language, type: "language" })
  }

  // Handle dialog close
  const handleDialogClose = () => {
    setEditItem(null)
    setItemToDelete(null)
  }

  // Show loading state
  if (isLoadingLanguages) {
    return <LanguageLoader />
  }

  // Show error state
  if (languagesError) {
    return <LanguageError error={languagesError} onRetry={refetchLanguages} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 dark:from-slate-950 dark:via-purple-950/30 dark:to-blue-950/30">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-pink-400/10 dark:bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 p-6">
        <div 
          className={`max-w-7xl mx-auto space-y-8 ${isRTL ? 'rtl' : ''}`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Success Toast */}
          <AnimatePresence>
            {showSavedSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  "fixed top-4 z-50 bg-green-50 dark:bg-green-900/60 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-sm",
                  isRTL ? "left-4 flex-row-reverse" : "right-4"
                )}
              >
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">
                  {t('languageManagement.changesSaved', 'Changes saved successfully!')}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <LanguageHeader />

          {/* Add New Language Card */}
          <AddLanguageCard
            hasWebsite={hasWebsite}
            websiteId={websiteId}
            newLanguage={newLanguage}
            onLanguageChange={setNewLanguage}
            onAddLanguage={handleAddLanguage}
            onResetForm={handleResetForm}
            isLoading={createLanguageMutation.isPending}
            t={t}
          />

          {/* Manage Languages Card */}
          <ManageLanguagesCard
            hasWebsite={hasWebsite}
            websiteId={websiteId}
            languages={languageArray}
            searchQuery={searchQuery}
            activeTab={activeTab}
            expandedInfo={expandedInfo}
            onSearchChange={setSearchQuery}
            onTabChange={setActiveTab}
            onExpandInfoToggle={() => setExpandedInfo(!expandedInfo)}
            onToggleActive={handleToggleActive}
            onEdit={handleEdit}
            onDelete={handleOpenDelete}
            isToggling={toggleLanguageActiveMutation.isPending}
            t={t}
          />

          {/* Edit Language Dialog */}
          <EditLanguageDialog
            open={!!editItem}
            editItem={editItem}
            onOpenChange={(open) => !open && handleDialogClose()}
            onEditItemChange={setEditItem}
            onSave={() => {
              handleSaveEdit()
              handleDialogClose()
            }}
            isLoading={updateLanguageMutation.isPending}
            t={t}
          />

          {/* Delete Language Dialog */}
          <DeleteLanguageDialog
            open={!!itemToDelete}
            itemToDelete={itemToDelete}
            onOpenChange={(open) => !open && handleDialogClose()}
            onConfirm={confirmDelete}
            isDeleting={deleteLanguageMutation.isPending}
            t={t}
          />
        </div>
      </div>
    </div>
  )
}