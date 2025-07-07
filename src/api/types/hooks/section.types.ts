/**
 * Section related type definitions with multilingual support
 */

import { Resource } from "./Common.types";
import { ContentElement } from "./content.types";
import { Language } from "./language.types";
import { WebSiteProps } from "./WebSite.types";

// 🎯 NEW: Multilingual interfaces
export interface MultilingualName {
  en: string;
  ar: string;
  tr: string;
}

export interface MultilingualDescription {
  en?: string;
  ar?: string;
  tr?: string;
}

// 🎯 UPDATED: Section interface with multilingual support
export interface Section extends Resource {
  // 🎯 UPDATED: Support both legacy string and new multilingual object
  name: string | MultilingualName;
  // 🎯 UPDATED: Support both legacy string and new multilingual object
  description?: string | MultilingualDescription;
  order?: number;
  image?: string;
  sectionItems?: string[] | SectionItem[];
  WebSiteId: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  subName?: string;
  sectionType?: string;
  type?: string;
  slug?: string;

  originalSectionId?: string; // Reference to original section
  duplicateIndex?: number; // 1, 2, 3, etc.
  isDuplicate?: boolean;
  duplicateOf?: string; // Original section name for display
  uniqueIdentifier?: string; // Unique identifier for content separation
  
  // 🎯 NEW: Server-provided localized fields (optional)
  displayName?: string; // Localized name based on request language
  displayDescription?: string; // Localized description based on request language
  
  // 🎯 NEW: Multilingual metadata
  isMultilingual?: boolean; // Indicates if section has multilingual names
}

// 🎯 UPDATED: SectionItem interface with multilingual support
export interface SectionItem {
  _id: string;
  // 🎯 UPDATED: Support both legacy string and new multilingual object
  name: string | MultilingualName;
  // 🎯 UPDATED: Support both legacy string and new multilingual object
  description?: string | MultilingualDescription;
  image?: string | null;
  isActive: boolean;
  order: number;
  isMain: boolean;
  section: string | Section;
  WebSiteId: string;
  subsections?: string[] | SubSection[];
  subsectionCount?: number;
  createdAt?: string;
  updatedAt?: string;
  
  // 🎯 NEW: Server-provided localized fields (optional)
  displayName?: string; // Localized name based on request language
  displayDescription?: string; // Localized description based on request language
  
  // 🎯 NEW: Multilingual metadata
  isMultilingual?: boolean; // Indicates if section item has multilingual names
}

// 🎯 UPDATED: SubSection interface with multilingual support
export interface SubSection {
  _id: string;
  // 🎯 UPDATED: Support both legacy string and new multilingual object
  name: string | MultilingualName;
  // 🎯 UPDATED: Support both legacy string and new multilingual object
  description?: string | MultilingualDescription;
  slug: string;
  isActive: boolean;
  order: number;
  sectionItem?: string | SectionItem;
  languages: string[] | Language[];
  metadata?: any;
  defaultContent: string;
  contentElements?: ContentElement[];
  contentCount?: number;
  createdAt?: string;
  updatedAt?: string;
  isMain?: boolean;
  parentSections?: string[];
  section?: SubSection | string;
  elements?: ContentElement[];
  WebSiteId: string;
  
  // 🎯 NEW: Server-provided localized fields (optional)
  displayName?: string; // Localized name based on request language
  displayDescription?: string; // Localized description based on request language
  
  // 🎯 NEW: Multilingual metadata
  isMultilingual?: boolean; // Indicates if subsection has multilingual names
}

// 🎯 UPDATED: Service interface with multilingual support
export interface Service extends SectionItem {
  _id: string;
  // 🎯 UPDATED: Support both legacy string and new multilingual object
  name: string | MultilingualName;
  // 🎯 UPDATED: Support both legacy string and new multilingual object
  description: string | MultilingualDescription;
  isActive: boolean;
  isMain: boolean;
  order: number;
  subsections?: any[];
  
  // 🎯 NEW: Server-provided localized fields (optional)
  displayName?: string; // Localized name based on request language
  displayDescription?: string; // Localized description based on request language
  
  // 🎯 NEW: Multilingual metadata
  isMultilingual?: boolean; // Indicates if service has multilingual names
}

// 🎯 NEW: API request interfaces for creating/updating multilingual sections
export interface CreateSectionRequest {
  name: MultilingualName;
  subName: string;
  description?: MultilingualDescription;
  image?: string;
  isActive?: boolean;
  order?: number;
  WebSiteId: string;
  sectionType?: string;
  type?: string;
}

export interface UpdateSectionRequest {
  name?: MultilingualName;
  subName?: string;
  description?: MultilingualDescription;
  image?: string;
  isActive?: boolean;
  order?: number;
  sectionType?: string;
  type?: string;
}

export interface CreateSectionItemRequest {
  name: MultilingualName;
  description?: MultilingualDescription;
  image?: string | null;
  isActive?: boolean;
  order?: number;
  isMain?: boolean;
  section: string;
  WebSiteId: string;
}

export interface UpdateSectionItemRequest {
  name?: MultilingualName;
  description?: MultilingualDescription;
  image?: string | null;
  isActive?: boolean;
  order?: number;
  isMain?: boolean;
}

export interface CreateSubSectionRequest {
  name: MultilingualName;
  description?: MultilingualDescription;
  slug: string;
  isActive?: boolean;
  order?: number;
  sectionItem?: string;
  languages?: string[];
  metadata?: any;
  defaultContent?: string;
  isMain?: boolean;
  parentSections?: string[];
  section?: string;
  WebSiteId: string;
}

export interface UpdateSubSectionRequest {
  name?: MultilingualName;
  description?: MultilingualDescription;
  slug?: string;
  isActive?: boolean;
  order?: number;
  languages?: string[];
  metadata?: any;
  defaultContent?: string;
  isMain?: boolean;
  parentSections?: string[];
}

// 🎯 NEW: Type guards for checking multilingual vs legacy formats
export function isMultilingualName(name: string | MultilingualName): name is MultilingualName {
  return typeof name === 'object' && name !== null && 'en' in name && 'ar' in name && 'tr' in name;
}

export function isMultilingualDescription(description: string | MultilingualDescription): description is MultilingualDescription {
  return typeof description === 'object' && description !== null && 
         ('en' in description || 'ar' in description || 'tr' in description);
}

// 🎯 NEW: Utility types for language operations
export type SupportedLanguage = 'en' | 'ar' | 'tr';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}

// 🎯 NEW: Language configuration
export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageInfo> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr'
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl'
  },
  tr: {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    direction: 'ltr'
  }
};

// 🎯 NEW: Helper functions for working with multilingual data
export interface MultilingualHelpers {
  /**
   * Get name in specific language with fallback
   */
  getName(item: { name: string | MultilingualName }, language: SupportedLanguage): string;
  
  /**
   * Get description in specific language with fallback
   */
  getDescription(item: { description?: string | MultilingualDescription }, language: SupportedLanguage): string;
  
  /**
   * Check if item has multilingual names
   */
  hasMultilingualName(item: { name: string | MultilingualName }): boolean;
  
  /**
   * Check if item has multilingual descriptions
   */
  hasMultilingualDescription(item: { description?: string | MultilingualDescription }): boolean;
  
  /**
   * Get all available languages for an item
   */
  getAvailableLanguages(item: { 
    name: string | MultilingualName; 
    description?: string | MultilingualDescription 
  }): SupportedLanguage[];
}

// 🎯 NEW: API response interfaces
export interface SectionResponse {
  success: boolean;
  data: Section | Section[];
  count?: number;
  message?: string;
}

export interface SectionItemResponse {
  success: boolean;
  data: SectionItem | SectionItem[];
  count?: number;
  message?: string;
}

export interface SubSectionResponse {
  success: boolean;
  data: SubSection | SubSection[];
  count?: number;
  message?: string;
}

// 🎯 NEW: Query parameters for API requests
export interface SectionQueryParams {
  language?: SupportedLanguage;
  includeInactive?: boolean;
  includeItems?: boolean;
  includeSubsections?: boolean;
  includeContent?: boolean;
  websiteId?: string;
  isActive?: boolean;
}

export interface SectionOrderUpdateRequest {
  sections: Array<{
    id: string;
    order: number;
    websiteId: string;
  }>;
}

// 🎯 NEW: Validation interfaces
export interface MultilingualValidationError {
  language: SupportedLanguage;
  field: 'name' | 'description';
  message: string;
}

export interface SectionValidationResult {
  isValid: boolean;
  errors: MultilingualValidationError[];
}

export interface BasicSectionInfo {
  id: string;
  name: {
    en: string;
    ar: string;
    tr: string;
  };
  subName: string;
}

// 🎯 NEW: Basic section info response
export interface BasicSectionInfoResponse {
  success: boolean;
  count: number;
  data: BasicSectionInfo[];
}

export interface DuplicateSectionRequest {
  originalSectionId: string;
  customName?: MultilingualName;
  duplicateData?: boolean; // Whether to copy existing content
}

// NEW: Duplication response interface
export interface DuplicateSectionResponse {
  success: boolean;
  message: string;
  data: {
    duplicatedSection: Section;
    originalSection: Section;
    duplicateIndex: number;
  };
}