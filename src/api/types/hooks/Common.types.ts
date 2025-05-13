/**
 * Common type definitions
 */

export interface Resource {
    _id?: string;
    isActive?: boolean;
    subSections?: string[] | any[];
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
    requestId?: string;
  }
  
  export interface EditItemData {
    _id?: string;
    id?: string;
    name?: string;
    languageID?: string;
    language?: string;
    section_name?: string;
    image?: string;
    imageUrl?: string;
    description?: string;
    type: "language" | "section";
    originalId?: string;
    subSections?: string[] | any[];
    isActive?: boolean;
    webSiteId : string,
  }
  
  export interface DeleteItemData {
    _id?: string;
    id?: string;
    name?: string;
    language?: string;
    languageID?: string;
    section_name?: string;
    image?: string;
    type: "language" | "section";
    subSections?: string[] | any[];
  }