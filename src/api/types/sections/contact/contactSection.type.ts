import { Language } from "../../hooks/language.types";
import { MultilingualSectionData } from "../../hooks/MultilingualSection.types";

 export type FormDataContact = {
    contact: MultilingualSectionData | Record<string, any>;
  }

  
  export interface ContactFormProps {
      languageIds: string[];
      activeLanguages: Language[]
      onDataChange?: (data: any) => void;
      slug?: string;
      ParentSectionId?: string;
      initialData?: any;
    }