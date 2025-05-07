import { Language } from "./language.types"

export interface FormRef {
  getFormData: () => Promise<any>
  hasUnsavedChanges: boolean
  resetUnsavedChanges?: () => void
  saveData?: () => Promise<boolean>
}
export interface FormContextType {
  formData: FormData
  updateFormData: (section: string, data: any) => void
  hasUnsavedChanges: boolean
  checkUnsavedChanges: () => void
  saveAllData: () => Promise<void>
  activeLanguages: Language[]
  languageCodes: string[]
  languageIds: string[] 
  isSubmitting: boolean
  progress: number
  serviceData: any
  formRefs: {
    [key: string]: React.MutableRefObject<FormRef | null>
  }
  showLeaveConfirmation: boolean
  setShowLeaveConfirmation: (show: boolean) => void
  navigateBack: () => void
}
export interface FormData {
  [key: string]: any
}