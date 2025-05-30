/**
 * Section related type definitions
 */


import { Resource } from "./Common.types";
import { ContentElement } from "./content.types";
import { Language } from "./language.types";
import { WebSiteProps } from "./WebSite.types";


export interface Section extends Resource {
  name: string;
  description?: string;
  order?: number;
  image?: string;
  sectionItems?: string[] | SectionItem[];
  WebSiteId: string,
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
  WebSiteId : string,
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
  WebSiteId :string, 
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