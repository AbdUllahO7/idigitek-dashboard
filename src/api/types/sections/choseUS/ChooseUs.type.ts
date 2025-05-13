import { useForm } from "react-hook-form";
import { ContentElement } from "../../hooks/content.types";
import { Language } from "../../hooks/language.types";
import { FormValues } from "../service/serviceSections.types";

export interface ChoseUsFormState {
    isLoadingData: boolean;
    dataLoaded: boolean;
    hasUnsavedChanges: boolean;
    isValidationDialogOpen: boolean;
    benefitCountMismatch: boolean;
    existingSubSectionId: string | null;
    contentElements: ContentElement[];
    isSaving: boolean;
  }

export interface ChooseUsFormProps {
    languageIds: string[];
    activeLanguages: Language[]
    onDataChange?: (data: any) => void;
    slug?: string;
    ParentSectionId?: string;
    initialData?: any;
  }

export interface ChooseUsFormRef {
    getFormData: () => Promise<any>;
    getImageFile: () => File | null;
    form: ReturnType<typeof useForm<FormValues>>;
    hasUnsavedChanges: boolean;
    resetUnsavedChanges: () => void;
    existingSubSectionId: string | null;
    contentElements: ContentElement[];
    saveData: () => Promise<boolean>;
}