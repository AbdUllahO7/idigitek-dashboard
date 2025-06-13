import type { Section } from "@/src/api/types/hooks/section.types"
import type { DeleteItemData } from "@/src/api/types/hooks/Common.types"

export interface ManagementProps {
  hasWebsite: boolean
}

export interface PredefinedSection {
  nameKey: string
  subName: string
  descriptionKey: string
  image: string
  icon: React.ReactNode
  category: 'layout' | 'content'
  color: string
  bgColor: string
}

export interface SectionCategory {
  value: string
  labelKey: string
}

export interface SectionManagementState {
  itemToDelete: DeleteItemData | null
  showSavedSuccess: boolean
  searchQuery: string
  categoryFilter: string
  activeTab: string
  orderedSections: Section[]
  isDragging: boolean
}

export interface SectionActions {
  setItemToDelete: (item: DeleteItemData | null) => void
  setShowSavedSuccess: (show: boolean) => void
  setSearchQuery: (query: string) => void
  setCategoryFilter: (filter: string) => void
  setActiveTab: (tab: string) => void
  setOrderedSections: (sections: Section[]) => void
  setIsDragging: (dragging: boolean) => void
}

export interface SectionHandlers {
  handleAddPredefinedSection: (section: PredefinedSection) => void
  handleOpenDelete: (section: Section) => void
  handleCancelDelete: () => void
  handleToggleActive: (section: Section) => void
  handleReorder: (sections: Section[]) => void
  confirmDelete: () => void
  showSuccessMessage: () => void
}