/**
 * Language related type definitions
 */

import { Resource } from "./Common.types";
import { SubSection } from "./section.types";



export interface Language extends Resource {
  language: string;
  languageID: string;
  isActive: boolean;
  subSections: string[] | SubSection[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLanguageDto {
  language: string;
  languageID: string;
  subSections?: string[];
}

export interface UpdateLanguageDto {
  language?: string;
  languageID?: string;
  subSections?: string[];
}

export interface LanguageConfig {
  id: string;
  label: string;
}