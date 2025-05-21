import { Language } from "../../hooks/language.types";
import { MultilingualSectionData } from "../../hooks/MultilingualSection.types";

export interface BlogsFormProps {
    languageIds: string[];
    activeLanguages: Language[]
    onDataChange?: (data: any) => void;
    slug?: string;
    ParentSectionId?: string;
    initialData?: any;
    subSectionId?:string | null | undefined,
  }

 export type FormDataBlog = {
    blog: MultilingualSectionData | Record<string, any>;
  }