import { Language } from "../../hooks/language.types";
import { MultilingualSectionData } from "../../hooks/MultilingualSection.types";

 export type FormDataProject = {
    project: MultilingualSectionData | Record<string, any>;
  }

  
  export interface ProjectFormProps {
      languageIds: string[];
      activeLanguages: Language[]
      onDataChange?: (data: any) => void;
      slug?: string;
      ParentSectionId?: string;
      initialData?: any;
    }