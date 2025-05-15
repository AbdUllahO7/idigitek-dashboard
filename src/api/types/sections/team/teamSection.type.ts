import { Language } from "../../hooks/language.types";
import { MultilingualSectionData } from "../../hooks/MultilingualSection.types";

export interface teamFormProps {
    languageIds: string[];
    activeLanguages: Language[]
    onDataChange?: (data: any) => void;
    slug?: string;
    ParentSectionId?: string;
    initialData?: any;
}
export type FormDataTeam = {
  team: MultilingualSectionData | Record<string, any>;
}