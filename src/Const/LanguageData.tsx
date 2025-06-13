import { CommonLanguage } from "../api/types/management/LanguageManagement.type"

export const COMMON_LANGUAGES: CommonLanguage[] = [
    { id: 'en', name: 'English' },
    { id: 'ar', name: 'العربية' },
    { id: 'es', name: 'Español' },
    { id: 'fr', name: 'Français' },
    { id: 'de', name: 'Deutsch' },
    { id: 'zh', name: '中文' },
    { id: 'ja', name: '日本語' },
    { id: 'ko', name: '한국어' }
]

export const LANGUAGE_TABS = {
    ALL: 'all',
    ACTIVE: 'active',
    INACTIVE: 'inactive'
} as const