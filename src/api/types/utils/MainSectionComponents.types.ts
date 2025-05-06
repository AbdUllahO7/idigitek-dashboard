import { ReactNode } from "react"

export interface ErrorCardProps {
  errorMessage?: string
  onRetry?: () => void
}

export interface WarningCardProps {
  title: string
  message: string
}


export interface SuccessCardProps {
  title: string
  description: string

  onEdit: () => void
}


export interface WarningAlertProps {
    title: string
    message: string
}

export interface Language {
_id: string
name?: string
language?: string
languageID: string
isDefault?: boolean
}


export interface LanguageSelectorProps {
  languages: Language[]
}


export interface ActionButtonProps {
  isLoading: boolean
  isCreating: boolean 
  isCreatingElements: boolean
  isUpdating: boolean
  exists: boolean
  onClick: () => void
  disabled?: boolean
  className?: string
}

export interface CancelButtonProps {
  onClick: () => void
  className?: string
}
export interface MainFormCardProps {
  title: ReactNode
  description: string
  children: ReactNode
}


export interface LoadingDialogProps {
  isOpen: boolean
  title: string
  description: string
}


export interface InfoAlertProps {
  title: string
  message: ReactNode
}

export interface LanguageTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  languages: Language[]
  children: ReactNode
}