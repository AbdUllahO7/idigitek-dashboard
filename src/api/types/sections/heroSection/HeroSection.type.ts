import { ContentElement } from "../../hooks/content.types";
import { Language } from "../../hooks/language.types";
import { MultilingualSectionData } from "../../hooks/MultilingualSection.types";



 export type FormDataHero = {
    hero: MultilingualSectionData | Record<string, any>;
  }

  export interface HeroFormProps {
    languageIds: string[];
    activeLanguages: any[];
    onDataChange?: (data: any) => void;
    slug?: string;
    ParentSectionId: string;
    initialData?:any
  }

  export interface HeroesFormState {
      isLoadingData: boolean;
      dataLoaded: boolean;
      hasUnsavedChanges: boolean;
      isValidationDialogOpen: boolean;
      heroCountMismatch: boolean;
      existingSubSectionId: string | null;
      contentElements: ContentElement[];
      isSaving: boolean;
    }