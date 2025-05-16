import { Language } from "../../hooks/language.types";
import { MultilingualSectionData } from "../../hooks/MultilingualSection.types";

 export type FormDataPartners = {
    partners: MultilingualSectionData | Record<string, any>;
  }

  
  export interface PartnersFormProps {
      languageIds: string[];
      activeLanguages: Language[]
      onDataChange?: (data: any) => void;
      slug?: string;
      ParentSectionId?: string;
      initialData?: any;
    }