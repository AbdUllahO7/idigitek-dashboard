import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useToast } from "@/src/hooks/use-toast"
import { useAuth } from "@/src/context/AuthContext"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import { useSections } from "@/src/hooks/webConfiguration/use-section"
import { useUserSections } from "@/src/hooks/webConfiguration/useUserSections"
import useUpdateOrder from "@/src/hooks/webConfiguration/useUpdateOrder"
import type { Section } from "@/src/api/types/hooks/section.types"
import type { DeleteItemData } from "@/src/api/types/hooks/Common.types"
import { PredefinedSection } from "@/src/api/types/management/SectionManagement.type"

export const useSectionManagement = (hasWebsite: boolean) => {
  const { websiteId } = useWebsiteContext()
  const { user } = useAuth()
  const userId = user?.id || user?.id
  const { t, ready } = useTranslation()
  const { toast } = useToast()

  // State
  const [itemToDelete, setItemToDelete] = useState<DeleteItemData | null>(null)
  const [showSavedSuccess, setShowSavedSuccess] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("current")
  const [orderedSections, setOrderedSections] = useState<Section[]>([])
  const [isDragging, setIsDragging] = useState(false)

  // Hooks
  const {
    useGetByWebsiteId,
    useCreate: useCreateSection,
    useDelete: useDeleteSection,
    useToggleActive: useToggleSectionActive,
  } = useSections()

  const { useActivateSection, useCreateUserSection } = useUserSections()
  const activateSectionMutation = useActivateSection()
  const createUserSectionMutationResult = useCreateUserSection()
  const createUserSectionMutation = createUserSectionMutationResult ? createUserSectionMutationResult : null

  const {
    data: websiteSections,
    isLoading: isLoadingSections,
    error: sectionsError,
    refetch: refetchSections,
    isError,
  } = useGetByWebsiteId(websiteId, true, hasWebsite)

  const createSectionMutation = useCreateSection()
  const deleteSectionMutation = useDeleteSection()
  const toggleSectionActiveMutation = useToggleSectionActive()
  const updateSectionOrderMutation = useUpdateOrder()

  // Effects
  useEffect(() => {
    if (
      createSectionMutation.isSuccess || 
      deleteSectionMutation.isSuccess || 
      toggleSectionActiveMutation.isSuccess ||
      updateSectionOrderMutation.isSuccess
    ) {
      refetchSections()
    }
  }, [
    createSectionMutation.isSuccess,
    deleteSectionMutation.isSuccess,
    toggleSectionActiveMutation.isSuccess,
    updateSectionOrderMutation.isSuccess,
    refetchSections,
  ])

  useEffect(() => {
    if (websiteSections?.data) {
      setOrderedSections([...websiteSections.data].sort((a, b) => a.order - b.order))
    }
  }, [websiteSections])

  // Helper functions
  const showSuccessMessage = () => {
    setShowSavedSuccess(true)
    setTimeout(() => setShowSavedSuccess(false), 3000)
  }

  const createUserSectionRelation = (sectionId: string) => {
    if (!userId) {
      console.warn("Cannot create user-section relationship: User ID not available")
      return
    }

    activateSectionMutation.mutate(
      { userId, sectionId },
      {
        onError: (error: any) => {
          console.error("Error creating user-section relationship:", error)
        },
      },
    )
  }

  // Handlers
  const handleAddPredefinedSection = (predefinedSection: PredefinedSection) => {
    const englishName = predefinedSection.subName
    const translatedName = ready ? t(predefinedSection.nameKey, predefinedSection.nameKey.split('.').pop() || '') : predefinedSection.nameKey.split('.').pop() || ''
    const translatedDescription = ready ? t(predefinedSection.descriptionKey, '') : ''
    
    const newSectionData = {
      name: englishName,
      description: translatedDescription,
      subName: predefinedSection.subName,
      image: predefinedSection.image,
      order: orderedSections.length,
      subSections: [],
      isActive: true,
      WebSiteId: websiteId,
    }

    if (orderedSections?.some((section: Section) => section.name === englishName || section.subName === predefinedSection.subName)) {
      toast({
        title: "Duplicate section",
        description: `A section named "${translatedName}" already exists.`,
        variant: "destructive",
      })
      return
    }

    if (createUserSectionMutation) {
      createUserSectionMutation.mutate(newSectionData, {
        onSuccess: () => {
          toast({
            title: "Section added",
            description: `${translatedName} section has been added successfully.`,
          })
          showSuccessMessage()
          setActiveTab("current")
        },
        onError: (error: any) => {
          toast({
            title: "Error adding section",
            description: error.message || "An error occurred while adding the section.",
            variant: "destructive",
          })
        },
      })
    } else {
      createSectionMutation.mutate(newSectionData, {
        onSuccess: (createdSection) => {
          toast({
            title: "Section added",
            description: `${translatedName} section has been added successfully.`,
          })
          showSuccessMessage()
          setActiveTab("current")

          if (createdSection._id) {
            createUserSectionRelation(createdSection._id)
          }
        },
        onError: (error: any) => {
          toast({
            title: "Error adding section",
            description: error.message || "An error occurred while adding the section.",
            variant: "destructive",
          })
        },
      })
    }
  }

  const handleToggleActive = (section: Section) => {
    if (!section._id) {
      toast({
        title: "Error",
        description: "Section ID is missing.",
        variant: "destructive",
      })
      return
    }

    const newActiveStatus = !section.isActive
    
    toggleSectionActiveMutation.mutate(
      { id: section._id, isActive: newActiveStatus },
      {
        onSuccess: () => {
          toast({
            title: `Section ${newActiveStatus ? 'activated' : 'deactivated'}`,
            description: `Section is now ${newActiveStatus ? 'visible' : 'hidden'} on your website.`,
          })
          showSuccessMessage()

          setOrderedSections(prevSections => 
            prevSections.map(s => 
              s._id === section._id 
                ? { ...s, isActive: newActiveStatus }
                : s
            )
          )
        },
        onError: (error: any) => {
          toast({
            title: "Error updating section",
            description: error.message || "An error occurred while updating the section status.",
            variant: "destructive",
          })
        },
      }
    )
  }

  const handleReorder = (reorderedSections: Section[]) => {
    setOrderedSections(reorderedSections)

    const orderData = reorderedSections
      .filter((section): section is Section & { _id: string; order: number } => 
        section._id !== undefined && typeof section.order === 'number' && Boolean(section.WebSiteId)
      )
      .map((section, index) => ({
        id: section._id,
        order: index,
        websiteId: section.WebSiteId.toString(),
      }))

    if (orderData.length === 0) {
      toast({
        title: "Error",
        description: "No valid sections to reorder.",
        variant: "destructive",
      })
      return
    }

    updateSectionOrderMutation.mutate(orderData, {
      onSuccess: () => {
        toast({
          title: "Order updated",
          description: "Section order has been updated successfully.",
        })
        showSuccessMessage()
        refetchSections()
      },
      onError: (error: any) => {
        toast({
          title: "Error updating order",
          description: error.message || "An error occurred while updating section order.",
          variant: "destructive",
        })
        if (websiteSections?.data) {
          setOrderedSections([...websiteSections.data].sort((a, b) => a.order - b.order))
        }
      },
    })
  }

  const confirmDelete = () => {
    if (itemToDelete && itemToDelete._id && itemToDelete.type === "section") {
      deleteSectionMutation.mutate(itemToDelete._id, {
        onSuccess: () => {
          toast({
            title: "Section deleted",
            description: `The section has been deleted successfully.`,
          })
          setItemToDelete(null)
          showSuccessMessage()
        },
        onError: (error: any) => {
          toast({
            title: "Error deleting section",
            description: error.message || "An error occurred while deleting the section.",
            variant: "destructive",
          })
        },
      })
    }
  }

  return {
    // State
    itemToDelete,
    showSavedSuccess,
    searchQuery,
    categoryFilter,
    activeTab,
    orderedSections,
    isDragging,
    
    // Data
    websiteSections,
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
    setShowSavedSuccess,
    setSearchQuery,
    setCategoryFilter,
    setActiveTab,
    setOrderedSections,
    setIsDragging,
    
    // Handlers
    handleAddPredefinedSection,
    handleToggleActive,
    handleReorder,
    confirmDelete,
    showSuccessMessage,
    refetchSections,
    
    // Utils
    t,
    ready
  }
}