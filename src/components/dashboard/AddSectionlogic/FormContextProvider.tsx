// FormContextProvider.tsx
"use client"

import { createContext, useContext, useState, useRef, ReactNode, useEffect } from "react"
import { useToast } from "@/src/hooks/use-toast"
import { useRouter } from "next/navigation"
import { FormContextType, FormRef } from "@/src/api/types/hooks/form.types"
import { Language } from "@/src/api/types/hooks/language.types"
import { useTranslation } from "react-i18next"

// Define form data type (adjust as needed)
export interface FormData {
  [key: string]: any
}

// Create context
const FormContext = createContext<FormContextType | undefined>(undefined)

// Provider props
interface FormContextProviderProps {
  children: ReactNode
  initialFormSections: string[]
  activeLanguages: Language[]
  serviceData?: any
  sectionId: string | null
  sectionItemId: string | null
  mode: string
  backUrl: string
  onSave?: (data: FormData) => Promise<any>
}

export function FormContextProvider({
  children,
  initialFormSections,
  activeLanguages,
  serviceData,
  sectionId,
  mode,
  backUrl,
  onSave
}: FormContextProviderProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState<boolean>(false)
  
  // Initialize form data with empty objects for each section
  const initialFormData: FormData = {}
  initialFormSections.forEach(section => {
    initialFormData[section] = {}
  })
  
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false)
  
  // Create refs for each form section
  const formRefs: { [key: string]: React.MutableRefObject<FormRef | null> } = {}
  initialFormSections.forEach(section => {
    formRefs[section] = useRef<FormRef | null>(null)
  })
  
  // Convert activeLanguages to arrays of codes and IDs
  const languageCodes = activeLanguages.map(lang => lang.languageID)
  const languageIds = activeLanguages.map(lang => lang._id)
  
  // Function to check for unsaved changes
  const checkUnsavedChanges = () => {
    const hasChanges = Object.keys(formRefs).some(key => 
      formRefs[key].current?.hasUnsavedChanges || false
    )
    setHasUnsavedChanges(hasChanges)
  }
  
  // Function to update form data
  const updateFormData = (section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: data,
    }))    
  }
  
  // Add useEffect to check for unsaved changes when formData changes
  useEffect(() => {
    const checkFormUnsavedChanges = () => {
      const hasChanges = Object.keys(formRefs).some(key => 
        formRefs[key].current?.hasUnsavedChanges || false
      )
      setHasUnsavedChanges(hasChanges)
    }
    
    // Only run this check if formData has actually changed
    if (Object.keys(formData).length > 0) {
      checkFormUnsavedChanges()
    }
  }, [formData, formRefs])
  
  // Calculate progress
  useEffect(() => {
    const calculateProgress = () => {
      const totalSections = initialFormSections.length
      let completedSections = 0
      
      // Check if each section has data
      initialFormSections.forEach(section => {
        if (Object.keys(formData[section] || {}).length > 0) completedSections++
      })
      
      return (completedSections / totalSections) * 100
    }
    
    setProgress(calculateProgress())
  }, [formData, initialFormSections])
  
  // Function to navigate back
  const navigateBack = () => {
    if (hasUnsavedChanges) {
      setShowLeaveConfirmation(true)
    } else {
      router.push(backUrl)
    }
  }
  
  // Function to save all data
  const saveAllData = async () => {
    if (!sectionId) {
      toast({
        title: t("formContext.errors.general"),
        description: t("formContext.errors.missingSectionId"),
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    try {
      // Get form data from all forms
      let allData: FormData = { ...initialFormData }
      
      try {
        // Collect all form data
        for (const section of initialFormSections) {
          if (formRefs[section].current) {
            allData[section] = await formRefs[section].current.getFormData()
          }
        }
        
        // Use the provided onSave callback or handle saving internally
        if (onSave) {
          await onSave(allData)
        } else {
          // Default save implementation
          // ... your implementation here
        }
        
        // Save each form's content using saveData methods if available
        const savePromises: Promise<boolean>[] = []
        
        for (const section of initialFormSections) {
          if (formRefs[section].current?.saveData) {
            savePromises.push(formRefs[section].current.saveData())
          }
        }
        
        // Wait for all saves to complete
        await Promise.all(savePromises)
        
        toast({
          title: mode === 'create' ? t("formContext.success.created") : t("formContext.success.updated"),
          description: t("formContext.success.saveDescription"),
        })
        
        // Navigate back after successful save
        router.push(backUrl)
      } catch (error) {
        console.error("Form validation or save error:", error)
        toast({
          title: t("formContext.errors.validationError"),
          description: t("formContext.errors.validationDescription"),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving data:", error)
      toast({
        title: t("formContext.errors.savingError"),
        description: t("formContext.errors.savingDescription"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const contextValue: FormContextType = {
    formData,
    updateFormData,
    hasUnsavedChanges,
    checkUnsavedChanges,
    saveAllData,
    activeLanguages,
    languageCodes,
    languageIds,
    isSubmitting,
    progress,
    serviceData,
    formRefs,
    showLeaveConfirmation,
    setShowLeaveConfirmation,
    navigateBack
  }
  
  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  )
}

// Custom hook to use the form context
export function useFormContext() {
  const context = useContext(FormContext)
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormContextProvider")
  }
  return context
}