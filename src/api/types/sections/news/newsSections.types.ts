
export interface NewsFormProps {
    languageIds: string[];
    activeLanguages: {
      reduce(arg0: (acc: { [x: string]: any; }, lang: { languageID: string | number; _id: any; }) => { [x: string]: any; }, arg1: Record<string, string>): unknown; _id: string; languageID: string; 
};
    onDataChange?: (data: any) => void;
    slug?: string;
    ParentSectionId?: string;
    initialData?: any;
  }