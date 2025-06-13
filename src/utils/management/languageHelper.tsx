import type { Language } from "@/src/api/types/hooks/language.types"
import { LANGUAGE_TABS } from "@/src/Const/LanguageData"

export const filterLanguages = (
    languages: Language[],
    searchQuery: string,
    activeTab: string
): Language[] => {
    return languages.filter((language: Language) => {
        const matchesSearch =
        language.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
        language.languageID.toLowerCase().includes(searchQuery.toLowerCase())

        if (activeTab === LANGUAGE_TABS.ALL) return matchesSearch
        if (activeTab === LANGUAGE_TABS.ACTIVE) return matchesSearch && language.isActive
        if (activeTab === LANGUAGE_TABS.INACTIVE) return matchesSearch && !language.isActive

        return matchesSearch
    })
}

export const getLanguageStats = (languages: Language[]) => {
    const total = languages.length
    const active = languages.filter(l => l.isActive).length
    const inactive = languages.filter(l => !l.isActive).length

    return { total, active, inactive }
}

export const createEmptyLanguage = (websiteId: string): Language => ({
    _id: "",
    languageID: "",
    language: "",
    subSections: [],
    isActive: true,
    websiteId,
})

export const validateLanguage = (language: Language): { isValid: boolean; error?: string } => {
    if (!language.languageID || !language.language) {
        return { isValid: false, error: 'Please fill in all required fields' }
    }
    
    if (!language.websiteId) {
        return { isValid: false, error: 'Please select a website' }
    }

    return { isValid: true }
}

export const checkDuplicateLanguageId = (
    languageId: string,
    languages: Language[],
    excludeId?: string
    ): boolean => {
    return languages.some((lang: Language) => 
        lang.languageID === languageId && lang._id !== excludeId
    )
}