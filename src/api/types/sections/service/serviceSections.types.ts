import { useForm } from "react-hook-form";
import { ContentElement } from "../../hooks/content.types";
import { MultilingualSectionData } from "../../hooks/MultilingualSection.types";
import { Language } from "../../utils/MainSectionComponents.types";


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
  }


export interface HeroFormProps {
    languageIds: string[];
    activeLanguages: {
      reduce(arg0: (acc: { [x: string]: any; }, lang: { languageID: string | number; _id: any; }) => { [x: string]: any; }, arg1: Record<string, string>): unknown; _id: string; languageID: string; 
};
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