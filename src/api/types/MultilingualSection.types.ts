/**
 * Multilingual section type definitions
 */

import { LanguageConfig } from "./language.types";


export type FieldType = 
  | "text" 
  | "textarea" 
  | "badge" 
  | "image" 
  | "video" 
  | "audio" 
  | "link" 
  | "select" 
  | "checkbox" 
  | "radio" 
  | "date" 
  | "number" 
  | "email" 
  | "password";

export interface FieldConfig {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  description?: string;
  options?: string[];
}

export interface MultilingualSectionData {
  id: string;
  [fieldId: string]: any;
}

export interface MultilingualSectionProps {

}

export interface FeatureContent {
  heading: string;
  description: string;
  features: string[];
  image: string;
  imagePosition: "left" | "right";
}

export interface Feature {
  id: string;
  title: string;
  content: FeatureContent;
}