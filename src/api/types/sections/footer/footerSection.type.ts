import { ContentElement } from "../../hooks/content.types";
import { Language } from "../../hooks/language.types";
import { MultilingualSectionData } from "../../hooks/MultilingualSection.types";



 export type FormDataFooter = {
    footer: MultilingualSectionData | Record<string, any>;
  }

  export interface FooterFormProps {
    languageIds: string[];
    activeLanguages: any[];
    onDataChange?: (data: any) => void;
    slug?: string;
    ParentSectionId: string;
    initialData?:any
  }

  export interface FooteresFormState {
      isLoadingData: boolean;
      dataLoaded: boolean;
      hasUnsavedChanges: boolean;
      isValidationDialogOpen: boolean;
      footerCountMismatch: boolean;
      existingSubSectionId: string | null;
      contentElements: ContentElement[];
      isSaving: boolean;
    }


    export interface SpecialLinkFormProps {
  languageIds: string[];
  activeLanguages: Array<{ languageID: string; _id: string }>;
  onDataChange?: (data: FormData) => void;
  slug?: string;
  ParentSectionId?: string;
}

export interface SpecialLinkesFormState {
  isLoadingData: boolean;
  dataLoaded: boolean;
  hasUnsavedChanges: boolean;
  isValidationDialogOpen: boolean;
  linkCountMismatch: boolean;
  existingSubSectionId: string | null;
  contentElements: any[];
  isSaving: boolean;
}

export interface FormData {
  backgroundImage: string;
  [key: string]: Array<{
    image: string;
    url: string;
    id?: string;
  }> | string;
}

export interface StepToDelete {
  langCode: string;
  index: number;
}