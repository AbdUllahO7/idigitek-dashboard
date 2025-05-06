/**
 * Section related type definitions
 */


import { Resource } from "./Common.types";
import { ContentElement } from "./content.types";
import { Language } from "./language.types";


export interface Section extends Resource {
  name: string;
  description?: string;
  order?: number;
  image?: string;
  sectionItems?: string[] | SectionItem[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SectionItem {
  _id: string;
  name: string;
  description?: string;
  image?: string | null;
  isActive: boolean;
  order: number;
  isMain: boolean;
  section: string | Section;
  subsections?: string[] | SubSection[];
  subsectionCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubSection {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  order: number;
  sectionItem?: string | SectionItem;
  languages: string[] | Language[];
  metadata?: any;
  defaultContent : string
  contentElements?: ContentElement[];
  contentCount?: number;
  createdAt?: string;
  updatedAt?: string;
  isMain?: boolean;
  parentSections?: string[];
  section?:SubSection | string,
  elements?: ContentElement[];
}

export interface Service extends SectionItem {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  isMain: boolean;
  order: number;
  subsections?: any[];
}