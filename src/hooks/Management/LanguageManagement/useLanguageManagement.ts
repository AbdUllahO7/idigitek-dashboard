import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useToast } from "@/src/hooks/use-toast"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import { useLanguages } from "@/src/hooks/webConfiguration/use-language"
import type { Language } from "@/src/api/types/hooks/language.types"
import type { DeleteItemData, EditItemData } from "@/src/api/types/hooks/Common.types"
import { checkDuplicateLanguageId, createEmptyLanguage, validateLanguage } from "@/src/utils/management/languageHelper"

export const useLanguageManagement = (hasWebsite: boolean) => {
  const { websiteId } = useWebsiteContext()
  const { t } = useTranslation()
  const { toast } = useToast()

  // Hooks
  const {
    useGetByWebsite,
    useCreate: useCreateLanguage,
    useUpdate: useUpdateLanguage,
    useDelete: useDeleteLanguage,
    useToggleActive: useToggleLanguageActive,
  } = useLanguages()

  const {
    data: languages,
    isLoading: isLoadingLanguages,
    error: languagesError,
    refetch: refetchLanguages,
  } = useGetByWebsite(websiteId)

  const createLanguageMutation = useCreateLanguage()
  const updateLanguageMutation = useUpdateLanguage()
  const deleteLanguageMutation = useDeleteLanguage()
  const toggleLanguageActiveMutation = useToggleLanguageActive()

  // State
  const [newLanguage, setNewLanguage] = useState<Language>(createEmptyLanguage(websiteId || ""))
  const [editItem, setEditItem] = useState<EditItemData | null>(null)
  const [itemToDelete, setItemToDelete] = useState<DeleteItemData | null>(null)
  const [showSavedSuccess, setShowSavedSuccess] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [expandedInfo, setExpandedInfo] = useState(false)

  // Update newLanguage when websiteId changes
  useEffect(() => {
    if (websiteId) {
      setNewLanguage((prev) => ({
        ...prev,
        websiteId,
      }))
    }
  }, [websiteId])

  // Refetch languages after mutations
  useEffect(() => {
    if (
      createLanguageMutation.isSuccess ||
      updateLanguageMutation.isSuccess ||
      deleteLanguageMutation.isSuccess ||
      toggleLanguageActiveMutation.isSuccess
    ) {
      refetchLanguages()
    }
  }, [
    createLanguageMutation.isSuccess,
    updateLanguageMutation.isSuccess,
    deleteLanguageMutation.isSuccess,
    toggleLanguageActiveMutation.isSuccess,
    refetchLanguages,
  ])

  // Helper functions
  const showSuccessMessage = () => {
    setShowSavedSuccess(true)
    setTimeout(() => setShowSavedSuccess(false), 3000)
  }

  const languageArray = languages?.data || []

  // Handlers
  const handleAddLanguage = () => {
    const validation = validateLanguage(newLanguage)
    if (!validation.isValid) {
      toast({
        title: t('languageManagement.validation.invalidInput', 'Invalid Input'),
        description: t('languageManagement.validation.missingFields', validation.error || 'Please fill in all required fields'),
        variant: "destructive",
      })
      return
    }

    if (checkDuplicateLanguageId(newLanguage.languageID, languageArray)) {
      toast({
        title: t('languageManagement.validation.duplicateId', 'Duplicate Language ID'),
        description: t('languageManagement.validation.duplicateIdDescription', 'This language ID already exists'),
        variant: "destructive",
      })
      return
    }

    const languageToCreate = {
      ...newLanguage,
      websiteId: websiteId || "",
    }

    createLanguageMutation.mutate(languageToCreate, {
      onSuccess: () => {
        setNewLanguage(createEmptyLanguage(websiteId || ""))
        toast({
          title: t('languageManagement.toastMessages.languageAdded', 'Language Added'),
          description: t('languageManagement.toastMessages.languageAddedDesc', `${newLanguage.language} has been added successfully`),
        })
        showSuccessMessage()
      },
      onError: (error: Error) => {
        toast({
          title: t('languageManagement.toastMessages.errorAdding', 'Error Adding Language'),
          description: error.message || t('languageManagement.toastMessages.errorGenericDesc', 'An error occurred'),
          variant: "destructive",
        })
      },
    })
  }

  const handleEdit = (language: Language) => {
    setEditItem({
      _id: language._id,
      languageID: language.languageID,
      language: language.language,
      isActive: language.isActive,
      type: "language",
      websiteId: language.websiteId,
    })
  }

  const handleToggleActive = (id: string, isActive: boolean) => {
    toggleLanguageActiveMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({
            title: !isActive 
              ? t('languageManagement.toastMessages.languageActivated', 'Language Activated')
              : t('languageManagement.toastMessages.languageDeactivated', 'Language Deactivated'),
            description: !isActive
              ? t('languageManagement.toastMessages.languageActivatedDesc', 'Language is now active')
              : t('languageManagement.toastMessages.languageDeactivatedDesc', 'Language is now inactive'),
          })
          showSuccessMessage()
        },
        onError: (error: Error) => {
          toast({
            title: t('languageManagement.toastMessages.errorTogglingStatus', 'Error Toggling Status'),
            description: error.message || t('languageManagement.toastMessages.errorGenericDesc', 'An error occurred'),
            variant: "destructive",
          })
        },
      },
    )
  }

  const handleSaveEdit = () => {
    if (!editItem || !editItem._id || editItem.type !== "language") {
      toast({
        title: t('languageManagement.validation.invalidInput', 'Invalid Input'),
        description: t('languageManagement.validation.missingFieldsUpdate', 'Missing fields for update'),
        variant: "destructive",
      })
      return
    }

    if (!editItem.languageID || !editItem.language) {
      toast({
        title: t('languageManagement.validation.invalidInput', 'Invalid Input'),
        description: t('languageManagement.validation.missingFields', 'Please fill in all required fields'),
        variant: "destructive",
      })
      return
    }

    const originalItem = languageArray.find((item: Language) => item._id === editItem._id)
    if (
      originalItem &&
      editItem.languageID !== originalItem.languageID &&
      checkDuplicateLanguageId(editItem.languageID, languageArray, editItem._id)
    ) {
      toast({
        title: t('languageManagement.validation.duplicateId', 'Duplicate Language ID'),
        description: t('languageManagement.validation.duplicateIdDescription', 'This language ID already exists'),
        variant: "destructive",
      })
      return
    }

    const updateData = {
      id: editItem._id,
      data: {
        languageID: editItem.languageID,
        language: editItem.language,
        isActive: editItem.isActive,
        websiteId: editItem.websiteId,
      },
    }

    updateLanguageMutation.mutate(updateData, {
      onSuccess: () => {
        setEditItem(null)
        toast({
          title: t('languageManagement.toastMessages.languageUpdated', 'Language Updated'),
          description: t('languageManagement.toastMessages.languageUpdatedDesc', 'Language has been updated successfully'),
        })
        showSuccessMessage()
      },
      onError: (error: Error) => {
        toast({
          title: t('languageManagement.toastMessages.errorUpdating', 'Error Updating Language'),
          description: error.message || t('languageManagement.toastMessages.errorGenericDesc', 'An error occurred'),
          variant: "destructive",
        })
      },
    })
  }

  const confirmDelete = () => {
    if (itemToDelete && itemToDelete._id && itemToDelete.type === "language") {
      deleteLanguageMutation.mutate(itemToDelete._id, {
        onSuccess: () => {
          toast({
            title: t('languageManagement.toastMessages.languageDeleted', 'Language Deleted'),
            description: t('languageManagement.toastMessages.languageDeletedDesc', 'Language has been deleted successfully'),
          })
          setItemToDelete(null)
          showSuccessMessage()
        },
        onError: (error: Error) => {
          toast({
            title: t('languageManagement.toastMessages.errorDeleting', 'Error Deleting Language'),
            description: error.message || t('languageManagement.toastMessages.errorGenericDesc', 'An error occurred'),
            variant: "destructive",
          })
        },
      })
    }
  }

  return {
    // State
    newLanguage,
    editItem,
    itemToDelete,
    showSavedSuccess,
    searchQuery,
    activeTab,
    expandedInfo,

    // Data
    languages,
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
    setShowSavedSuccess,
    setSearchQuery,
    setActiveTab,
    setExpandedInfo,

    // Handlers
    handleAddLanguage,
    handleEdit,
    handleToggleActive,
    handleSaveEdit,
    confirmDelete,
    showSuccessMessage,
    refetchLanguages,

    // Utils
    t
  }
}