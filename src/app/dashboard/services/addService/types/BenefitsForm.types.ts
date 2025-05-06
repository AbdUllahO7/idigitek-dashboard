import { useForm } from "react-hook-form";

export interface Language {
  _id: string;
  languageID: string;
}

export interface ContentElement {
  _id: string,
  name: string;
  type: string;
  defaultContent?: string;
  imageUrl?: string;
  order:any,
  translations?: Array<{
    language: any; 
    content: string;
  }>;
}

export interface Translation {
  _id?: string;
  content: string;
  language: string | { _id: string };
  contentElement: string;
  isActive: boolean;
}

export interface SubsectionData {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  order: number;
  sectionItem: string;
  languages: string[];
  elements?: ContentElement[];
  contentElements?: ContentElement[];
}

// Define benefit item structure
export interface BenefitItem {
  icon: string;
  title: string;
  description: string;
}

// Define form values structure
export interface FormValues {
  [langCode: string]: BenefitItem[];
}

// Component props interface
export interface BenefitsFormProps {
  languageIds: string[];
  activeLanguages: Language[];
  onDataChange?: (data: FormValues) => void;
  slug?: string;
  ParentSectionId?: string;
}

// Ref interface for imperative handle
export interface BenefitsFormRef {
  getFormData: () => Promise<FormValues>;
  form: ReturnType<typeof useForm<FormValues>>;
  hasUnsavedChanges: boolean;
  resetUnsavedChanges: () => void;
  existingSubSectionId: string | null;
  contentElements: ContentElement[];
}

// Type for benefit counts
export interface BenefitCount {
  language: string;
  count: number;
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