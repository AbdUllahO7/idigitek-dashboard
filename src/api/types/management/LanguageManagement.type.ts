import type { Language } from "@/src/api/types/hooks/language.types"
import type { DeleteItemData, EditItemData } from "@/src/api/types/hooks/Common.types"

export interface ManagementProps {
    hasWebsite: boolean
}

export interface CommonLanguage {
    id: string
    name: string
}

export interface LanguageManagementState {
    newLanguage: Language
    editItem: EditItemData | null
    itemToDelete: DeleteItemData | null
    showSavedSuccess: boolean
    searchQuery: string
    activeTab: string
    expandedInfo: boolean
}

export interface LanguageActions {
    setNewLanguage: (language: Language) => void
    setEditItem: (item: EditItemData | null) => void
    setItemToDelete: (item: DeleteItemData | null) => void
    setShowSavedSuccess: (show: boolean) => void
    setSearchQuery: (query: string) => void
    setActiveTab: (tab: string) => void
    setExpandedInfo: (expanded: boolean) => void
}

export interface LanguageHandlers {
    handleAddLanguage: () => void
    handleEdit: (language: Language) => void
    handleToggleActive: (id: string, isActive: boolean) => void
    handleSaveEdit: () => void
    confirmDelete: () => void
    showSuccessMessage: () => void
}