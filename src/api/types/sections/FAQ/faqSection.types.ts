import { useForm } from "react-hook-form";
import { Language } from "../../hooks/language.types";
import { FormValues } from "../service/serviceSections.types";
import { ContentElement } from "../../hooks/content.types";

export interface faqHaveQuestionFormProps {
    languageIds: string[];
    activeLanguages: Language[]
    onDataChange?: (data: any) => void;
    slug?: string;
    ParentSectionId?: string;
    initialData?: any;
  }

    export interface faqHaveQuestionFormRef {
    getFormData: () => Promise<any>;
    getImageFile: () => File | null;
    form: ReturnType<typeof useForm<FormValues>>;
    hasUnsavedChanges: boolean;
    resetUnsavedChanges: () => void;
    existingSubSectionId: string | null;
    contentElements: ContentElement[];
    saveData: () => Promise<boolean>;
  }

  export interface FaqHaveQuestionsFormState {
    isLoadingData: boolean;
    dataLoaded: boolean;
    hasUnsavedChanges: boolean;
    isValidationDialogOpen: boolean;
    benefitCountMismatch: boolean;
    existingSubSectionId: string | null;
    contentElements: ContentElement[];
    isSaving: boolean;
  }
