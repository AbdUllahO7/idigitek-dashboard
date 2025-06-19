// src/app/dashboard/navigationSection/utils/navigation-form-utils.ts

import { useRef, useImperativeHandle } from "react";

// Create form ref utility
export const createFormRef = (
  ref: any,
  {
    form,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    existingSubSectionId,
    contentElements,
    componentName,
    extraMethods = {},
  }: {
    form: any;
    hasUnsavedChanges: boolean;
    setHasUnsavedChanges: (value: boolean) => void;
    existingSubSectionId: string | null;
    contentElements: any[];
    componentName: string;
    extraMethods?: Record<string, any>;
  }
) => {
  useImperativeHandle(ref, () => ({
    form,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    existingSubSectionId,
    contentElements,
    componentName,
    ...extraMethods,
  }));
};

// Get subsection counts by language
export const getSubSectionCountsByLanguage = (formValues: Record<string, any[]>) => {
  return Object.entries(formValues).map(([language, items]) => ({
    language: language.toUpperCase(),
    count: Array.isArray(items) ? items.length : 0,
  }));
};

// Validate that all languages have the same number of items
export const validateSubSectionCounts = (formValues: Record<string, any[]>) => {
  const counts = Object.values(formValues).map((items) => 
    Array.isArray(items) ? items.length : 0
  );
  
  if (counts.length === 0) return false;
  
  const firstCount = counts[0];
  return counts.every(count => count === firstCount);
};

// Force update utility
export const useForceUpdate = () => {
  const updateState = useRef({});
  const forceUpdate = () => {
    updateState.current = {};
  };
  return forceUpdate;
};