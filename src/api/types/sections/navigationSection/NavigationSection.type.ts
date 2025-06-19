// src/api/types/sections/heroSection/NavigationSection.type.ts

import { ContentElement } from "@/src/api/types/hooks/content.types";

// Navigation form state interface
export interface NavigationFormState {
  isLoadingData: boolean;
  dataLoaded: boolean;
  hasUnsavedChanges: boolean;
  navigationCountMismatch: boolean;
  existingSubSectionId: string | null;
  contentElements: ContentElement[];
  isSaving: boolean;
}

// Navigation form props interface
export interface NavigationFormProps {
  languageIds: string[];
  activeLanguages: any[];
  onDataChange?: (data: FormData) => void;
  slug?: string;
  ParentSectionId: string;
  type?: 'navigation' | 'subNavigation';
  initialData?: any;
}

// Navigation form ref interface
export interface NavigationFormRef {
  form: any;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  existingSubSectionId: string | null;
  contentElements: ContentElement[];
  componentName: string;
}

// Step to delete interface
export interface StepToDelete {
  langCode: string;
  index: number;
}

// Form data interface for navigation
export interface NavigationFormData {
  [key: string]: Array<{
    title?: string;
    displayText?: string;
    name?: string;
    url: string;
    order: number;
    isActive?: boolean;
    id?: string;
  }>;
}

// Primary navigation item interface
export interface PrimaryNavigationItem {
  id: string;
  title: string;
  displayText: string;
  url: string;
  order: number;
}

// Sub-navigation item interface
export interface SubNavigationItem {
  id: string;
  name: string;
  url: string;
  order: number;
  isActive: boolean;
}

// Navigation cards props interface
export interface NavigationCardsProps {
  sectionId: string; // Hero section ID
}