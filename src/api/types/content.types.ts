/**
 * Content related type definitions
 */

import { Language } from "./language.types";


export interface ContentElement {
  _id: string;
  name: string;
  type: string;
  defaultContent?: string;
  isActive: boolean;
  metadata?: any;
  order: number;
  parent: string;
  createdAt?: string;
  updatedAt?: string;
  translations?: ContentTranslation[];
}

export type ContentElementType = 'text' | 'heading' | 'paragraph' | 'list' | 'image' | 'video' | 'link' | 'custom';

export interface ContentTranslation {
  _id: string;
  content: string;
  language: string | Language;
  contentElement: string | ContentElement;
  isActive: boolean;
  metadata?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface ElementDefinition {
  type: 'image' | 'text' | 'file' | 'link' | 'array';
  key: string;
  name: string;
  description?: string;
  isArray?: boolean;
}