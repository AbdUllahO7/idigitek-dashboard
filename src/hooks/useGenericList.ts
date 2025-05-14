"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/src/hooks/use-toast"
import { UseGenericListOptions } from "../api/types/hooks/UseGenericList.types"
import { useWebsiteContext } from "../providers/WebsiteContext"


export function useGenericList({
  sectionId,
  apiHooks,
  editPath,
  onSuccessDelete,
  onErrorDelete
}: UseGenericListOptions) {
  const router = useRouter()
  const { toast } = useToast()
  const [section, setSection] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState<boolean>(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false)
  const [mainItemId, setMainItemId] = useState<string | null>(null)
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [itemToDelete, setItemToDelete] = useState<{id: string; name: string} | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
    const { websiteId } = useWebsiteContext();
  
  // API hooks for fetching and deleting items
  const { useGetByWebSiteId, useDelete , useGetBySectionId } = apiHooks
  
  // Query for items with the parent section ID
  const {
    data: itemsData,
    isLoading: isLoadingData,
    refetch: refetchItems,
  } = useGetBySectionId(
    sectionId || "", 
    Boolean(sectionId), // Conditionally execute query only if sectionId exists
    100, // limit
    0, // skip
    true, // includeSubSectionCount
  )



  // Delete mutation
  const deleteItem = useDelete()

  // Find and set the main item when items data changes
  useEffect(() => {
    if (itemsData?.data && Array.isArray(itemsData.data)) {
      // Find the item with isMain: true
      const mainItem = itemsData.data.find((item: any) => item.isMain === true)
      
      if (mainItem) {
        setMainItemId(mainItem._id)
      } else {
        setMainItemId(null)
      }
      
      // Set all items
      setItems(itemsData.data)
      setIsLoadingItems(false)
    } else if (!isLoadingData) {
      setIsLoadingItems(false)
    }
  }, [itemsData, isLoadingData])

  // Handle section change from SectionIntegration
  const handleSectionChange = (sectionData: any) => {
    setSection(sectionData)

    // Refetch items list when section changes
    if (sectionId) {
      refetchItems()
    }
  }

  // Show delete dialog
  const showDeleteDialog = (id: string, name: string) => {
    setItemToDelete({ id, name })
    setIsDeleteDialogOpen(true)
  }

  // Handle item deletion
  const handleDelete = async () => {
    if (!itemToDelete) return
    
    setIsDeleting(true)
    try {
      await deleteItem.mutateAsync(itemToDelete.id)
      
      // Refetch the list after deletion
      refetchItems()
      
      // If we deleted the main item, clear the main item state
      if (itemToDelete.id === mainItemId) {
        setMainItemId(null)
      }
      
      toast({
        title: "Item deleted",
        description: "The item has been successfully deleted.",
      })
      
      if (onSuccessDelete) {
        onSuccessDelete()
      }
    } catch (error) {
      console.error("Failed to delete item:", error)
      
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      })
      
      if (onErrorDelete) {
        onErrorDelete(error)
      }
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  // Handle editing an item
  const handleEdit = (itemId: string) => {
    if (sectionId && itemId) {
      router.push(`${editPath}?sectionId=${sectionId}&sectionItemId=${itemId}&mode=edit`)
    } else {
      toast({
        title: "Error",
        description: "Section ID or section item id  is missing. Cannot edit item.",
        variant: "destructive",
      })
    }
  }

  // Handle adding a new item
  const handleAddNew = () => {
    if (!sectionId) {
      toast({
        title: "Error",
        description: "Section ID is missing. Cannot add item.",
        variant: "destructive",
      })
      return
    }
    
    if (!section) {
      toast({
        title: "Error",
        description: "Please create a section first before adding items.",
        variant: "destructive",
      })
      return
    }
    
    // Open the create dialog
    setIsCreateDialogOpen(true)
  }

  // Handle item creation from the dialog
  const handleItemCreated = (itemId: string) => {
    // Close the dialog
    setIsCreateDialogOpen(false)
    
    // // Navigate to the edit page with the new item ID
    // if (itemId) {
    //   router.push(`${editPath}?sectionId=${sectionId}&sectionItemId=${itemId}&mode=edit`)
    // }
    
    // Refresh the items list
    refetchItems()
  }

  // Determine if "Add" button should be disabled
  const isAddButtonDisabled = !sectionId || !section
  
 
  return {
    // State
    section,
    items,
    isLoadingItems,
    isCreateDialogOpen,
    isDeleteDialogOpen,
    itemToDelete,
    isDeleting,
    isAddButtonDisabled,
    mainItemId,
    
    // Actions
    setSection,
    handleSectionChange,
    handleEdit,
    handleDelete,
    handleAddNew,
    handleItemCreated,
    showDeleteDialog,
    setIsCreateDialogOpen,
    setIsDeleteDialogOpen,
    refetchItems,
  }
}