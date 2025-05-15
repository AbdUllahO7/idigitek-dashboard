import { IconNames } from "@/src/utils/MainSectionComponents";
import { Language } from "../../hooks/language.types";
import { useForm } from "react-hook-form";
import { FormValues } from "../service/serviceSections.types";
import { ContentElement } from "../../hooks/content.types";


export interface ClientCommentsCardCardProps {
    langCode: string;
    index: number;
    form: any;
    isFirstLanguage: boolean;
    syncIcons: (index: number, value: IconNames) => void;
    availableIcons: readonly IconNames[];
    onDelete: (langCode: string, index: number) => void;
}


export interface clientCommentsFormProps {
    languageIds: string[];
    activeLanguages: Language[]
    onDataChange?: (data: any) => void;
    slug?: string;
    ParentSectionId?: string;
    initialData?: any;
}

export interface clientCommentFormRef {
    getFormData: () => Promise<any>;
    getImageFile: () => File | null;
    form: ReturnType<typeof useForm<FormValues>>;
    hasUnsavedChanges: boolean;
    resetUnsavedChanges: () => void;
    existingSubSectionId: string | null;
    contentElements: ContentElement[];
    saveData: () => Promise<boolean>;
}


export interface ClientCommentsFormState {
    isLoadingData: boolean;
    dataLoaded: boolean;
    hasUnsavedChanges: boolean;
    isValidationDialogOpen: boolean;
    benefitCountMismatch: boolean;
    existingSubSectionId: string | null;
    contentElements: ContentElement[];
    isSaving: boolean;
}