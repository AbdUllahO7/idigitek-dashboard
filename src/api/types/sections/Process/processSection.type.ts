import { Language } from "../../hooks/language.types";
import { MultilingualSectionData } from "../../hooks/MultilingualSection.types";

export interface processFormProps {
    languageIds: string[];
    activeLanguages: Language[]
    onDataChange?: (data: any) => void;
    slug?: string;
    ParentSectionId?: string;
    initialData?: any;
  }

export type FormDataProcess = {
  process: MultilingualSectionData | Record<string, any>;
}