import { useForm } from "react-hook-form";
import { ContentElement } from "../../hooks/content.types";
import { MultilingualSectionData } from "../../hooks/MultilingualSection.types";
import { Language } from "../../hooks/language.types";


export interface BenefitsFormState {
    isLoadingData: boolean;
    dataLoaded: boolean;
    hasUnsavedChanges: boolean;
    isValidationDialogOpen: boolean;
    benefitCountMismatch: boolean;
    existingSubSectionId: string | null;
    contentElements: ContentElement[];
    isSaving: boolean;
  }
export interface StepToDelete {
  langCode: string;
  index: number;
}
  
export interface FaqFormProps {
    languageIds: string[];
    activeLanguages: any[];
    onDataChange?: (data: any) => void;
    slug?: string;
    ParentSectionId: string;
    initialData?:any
  }


export interface HeroFormProps {
    languageIds: string[];
    activeLanguages: Language[]
    onDataChange?: (data: any) => void;
    slug?: string;
    ParentSectionId?: string;
    initialData?: any;
  }
  
  export interface ProcessStepsFormProps {
    languageIds: readonly string[];
    activeLanguages: Language[];
    onDataChange?: (data: any) => void;
    slug?: string;
    ParentSectionId: string;
    initialData?: any;
  }
  
  export type FormData = {
    hero: MultilingualSectionData | Record<string, any>;
    benefits: Record<string, any>;
    features: Record<string, any>;
    processSteps: Record<string, any>;
    faq: Record<string, any>;
  }
 export type FormDataNews = {
    news: MultilingualSectionData | Record<string, any>;
  }
  export interface BenefitItem {
    icon: string;
    title: string;
    description: string;
  }
  

export interface FormValues {
  [langCode: string]: BenefitItem[];
}

  export interface HeroFormRef {
  getFormData: () => Promise<any>;
  getImageFile: () => File | null;
  form: ReturnType<typeof useForm<FormValues>>;
  hasUnsavedChanges: boolean;
  resetUnsavedChanges: () => void;
  existingSubSectionId: string | null;
  contentElements: ContentElement[];
  saveData: () => Promise<boolean>;
}