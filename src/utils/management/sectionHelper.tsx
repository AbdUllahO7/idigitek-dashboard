import { LayoutGrid } from "lucide-react"
import type { Section } from "@/src/api/types/hooks/section.types"
import { PREDEFINED_SECTIONS } from "@/src/Const/SectionsData"
import { TFunction } from "i18next"

// 🎯 NEW: Helper function to safely get string value from multilingual or string name
const getStringFromMultilingualOrString = (value: any, language: string = 'en'): string => {
  if (!value) return '';
  
  // If it's already a string, return it
  if (typeof value === 'string') {
    return value;
  }
  
  // If it's an object (multilingual), get the appropriate language
  if (typeof value === 'object' && value !== null) {
    // Try current language first, then fallback to en, ar, tr, or any available
    return value[language] || 
           value.en || 
           value.ar || 
           value.tr || 
           Object.values(value)[0] || 
           '';
  }
  
  // Fallback for any other type
  return String(value);
}

// 🎯 UPDATED: Enhanced section name translation with multilingual support
export const getTranslatedSectionName = (
  section: Section,
  t: TFunction,
  ready: boolean,
  language: string = 'en'
) => {
  // First, check if section has a custom multilingual name
  if (section.name && typeof section.name === 'object') {
    const multilingualName = getStringFromMultilingualOrString(section.name, language);
    if (multilingualName) {
      return multilingualName;
    }
  }
  
  // Check if section has a simple string name
  if (section.name && typeof section.name === 'string') {
    return section.name;
  }
  
  // Try to find the predefined section for translation
  const predefinedSection = PREDEFINED_SECTIONS.find(ps => {
    // Handle both original and duplicated sections
    const normalizedSubName = ps.subName;
    const sectionSubName = section.subName;
    
    // For duplicated sections, check if the subName starts with the original
    if (sectionSubName && sectionSubName.includes('_Copy_') || sectionSubName && sectionSubName.includes('_Dup_')) {
      const originalSubName = sectionSubName.split('_')[0];
      return normalizedSubName === originalSubName;
    }
    
    // Regular matching
    return normalizedSubName === section.subName || 
           normalizedSubName === getStringFromMultilingualOrString(section.name, language);
  });
  
  if (predefinedSection && ready) {
    return t(predefinedSection.nameKey, predefinedSection.nameKey.split('.').pop() || '');
  }
  
  // Final fallback to subName or a default
  return getStringFromMultilingualOrString(section.subName || section.name, language) || 'Unnamed Section';
}

// 🎯 UPDATED: Enhanced visual info getter with duplicate support
export const getSectionVisualInfo = (section: Section) => {
  const predefinedSection = PREDEFINED_SECTIONS.find(ps => {
    const sectionSubName = section.subName;
    const sectionName = getStringFromMultilingualOrString(section.name);
    
    // Handle duplicated sections
    if (sectionSubName && (sectionSubName.includes('_Copy_') || sectionSubName.includes('_Dup_'))) {
      const originalSubName = sectionSubName.split('_')[0];
      return ps.subName === originalSubName;
    }
    
    // Regular matching
    return ps.subName === sectionName || ps.subName === sectionSubName;
  });
  
  return predefinedSection || {
    icon: <LayoutGrid className="h-5 w-5" />,
    color: "from-gray-500 to-slate-500",
    bgColor: "from-gray-50 to-slate-50 dark:from-gray-950/50 dark:to-slate-950/50",
    image: null,
    category: "content" as const
  };
}

// 🎯 UPDATED: Enhanced description getter with multilingual support
export const getSectionDescription = (
  section: Section | any,
  t: TFunction,
  ready: boolean,
  language: string = 'en'
) => {
  // For predefined sections, get the description from translation
  if (section.descriptionKey && ready) {
    return t(section.descriptionKey, '');
  }
  
  // Check for custom multilingual description
  if (section.description && typeof section.description === 'object') {
    return getStringFromMultilingualOrString(section.description, language);
  }
  
  // Check for simple string description
  if (section.description && typeof section.description === 'string') {
    return section.description;
  }
  
  // For current sections, find the matching predefined section
  const predefinedSection = PREDEFINED_SECTIONS.find(ps => {
    const sectionSubName = section.subName;
    const sectionName = getStringFromMultilingualOrString(section.name);
    
    // Handle duplicated sections
    if (sectionSubName && (sectionSubName.includes('_Copy_') || sectionSubName.includes('_Dup_'))) {
      const originalSubName = sectionSubName.split('_')[0];
      return ps.subName === originalSubName;
    }
    
    // Regular matching
    return ps.subName === sectionName || ps.subName === sectionSubName;
  });
  
  if (predefinedSection && ready) {
    return t(predefinedSection.descriptionKey, '');
  }
  
  // Fallback to stored description or default
  return '';
}

// 🎯 UPDATED: Enhanced predefined sections filter - only show sections NOT already added
export const filterPredefinedSections = (
  searchQuery: string,
  categoryFilter: string,
  orderedSections: Section[],
  t: TFunction,
  ready: boolean
) => {
  return PREDEFINED_SECTIONS.filter((predefinedSection) => {
    const translatedName = ready ? t(predefinedSection.nameKey, predefinedSection.nameKey.split('.').pop() || '') : predefinedSection.nameKey.split('.').pop() || '';
    const translatedDescription = ready ? t(predefinedSection.descriptionKey, '') : '';
    
    // 🎯 FIXED: Check if this section type already exists - exclude if it does
    const sectionExists = orderedSections.some((section: Section) => {
      const sectionName = getStringFromMultilingualOrString(section.name);
      const sectionSubName = section.subName;
      
      // Check for exact matches
      if (sectionName === predefinedSection.subName || sectionSubName === predefinedSection.subName) {
        return true;
      }
      
      // Check for duplicated sections (sections that start with the predefined subName)
      if (sectionSubName && (sectionSubName.includes('_Copy_') || sectionSubName.includes('_Dup_'))) {
        const originalSubName = sectionSubName.split('_')[0];
        return originalSubName === predefinedSection.subName;
      }
      
      return false;
    });
    
    // 🎯 FIXED: Only show sections that DON'T already exist
    const notAlreadyAdded = !sectionExists;
    
    const matchesSearch = translatedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      translatedDescription.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || predefinedSection.category === categoryFilter;
    
    return notAlreadyAdded && matchesSearch && matchesCategory;
  });
}

// 🎯 FIXED: Enhanced current sections filter with safe string handling
export const filterCurrentSections = (
  sections: Section[],
  searchQuery: string,
  t: TFunction,
  ready: boolean,
  language: string = 'en'
) => {
  return sections.filter((section: Section) => {
    const translatedName = getTranslatedSectionName(section, t, ready, language);
    const translatedDescription = getSectionDescription(section, t, ready, language);
    
    // 🎯 FIXED: Ensure both values are strings before calling toLowerCase
    const nameString = String(translatedName || '');
    const descriptionString = String(translatedDescription || '');
    const searchString = String(searchQuery || '').toLowerCase();
    
    return nameString.toLowerCase().includes(searchString) ||
           descriptionString.toLowerCase().includes(searchString);
  });
}

// Utility function to get section category in the user's language
export const getTranslatedCategory = (
  category: string,
  t: TFunction,
  ready: boolean
) => {
  if (!ready) return category;
  
  switch(category) {
    case 'layout':
      return t('sectionManagement.categories.layout', 'Layout')
    case 'content':
      return t('sectionManagement.categories.content', 'Content')
    default:
      return t('sectionManagement.categories.all', 'All Sections')
  }
}

// Utility function to format date based on language
export const formatSectionDate = (
  date: string | Date,
  language: string
) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  try {
    return dateObj.toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'tr' ? 'tr-TR' : 'en-US', options);
  } catch {
    return dateObj.toLocaleDateString('en-US', options);
  }
}

// Utility function to get section type display name
export const getSectionTypeDisplayName = (
  sectionType: string | undefined,
  t: TFunction,
  ready: boolean
) => {
  if (!sectionType || !ready) return sectionType || 'Custom';
  
  // Handle duplicated section types
  let normalizedType = sectionType;
  if (sectionType.includes('_Copy_') || sectionType.includes('_Dup_')) {
    normalizedType = sectionType.split('_')[0];
  }
  
  // Map section types to translation keys
  const typeMap: { [key: string]: string } = {
    'header': 'sectionManagement.sections.header.name',
    'hero': 'sectionManagement.sections.hero.name',
    'services': 'sectionManagement.sections.services.name',
    'news': 'sectionManagement.sections.news.name',
    'products': 'sectionManagement.sections.products.name',
    'industrySolutions': 'sectionManagement.sections.industrySolutions.name',
    'whyChooseUs': 'sectionManagement.sections.whyChooseUs.name',
    'projects': 'sectionManagement.sections.projects.name',
    'ourProcess': 'sectionManagement.sections.ourProcess.name',
    'team': 'sectionManagement.sections.team.name',
    'clientComments': 'sectionManagement.sections.clientComments.name',
    'partners': 'sectionManagement.sections.partners.name',
    'faq': 'sectionManagement.sections.faq.name',
    'blog': 'sectionManagement.sections.blog.name',
    'contact': 'sectionManagement.sections.contact.name',
    'footer': 'sectionManagement.sections.footer.name',
    'Header': 'Dashboard_sideBar.nav.header',
    'Hero': 'Dashboard_sideBar.nav.hero',
    'Services': 'Dashboard_sideBar.nav.services',
    'News': 'Dashboard_sideBar.nav.news',
    'Products': 'Dashboard_sideBar.nav.products',
    'IndustrySolutions': 'Dashboard_sideBar.nav.industrySolutions',
    'whyChooseUs': 'Dashboard_sideBar.nav.whyChooseUs',
    'Projects': 'Dashboard_sideBar.nav.projects',
    'OurProcess': 'Dashboard_sideBar.nav.ourProcess',
    'Team': 'Dashboard_sideBar.nav.team',
    'ClientComments': 'Dashboard_sideBar.nav.clientComments',
    'Partners': 'Dashboard_sideBar.nav.partners',
    'FAQ': 'Dashboard_sideBar.nav.faq',
    'Blog': 'Dashboard_sideBar.nav.blog',
    'Contact': 'Dashboard_sideBar.nav.contact',
    'Footer': 'Dashboard_sideBar.nav.footer',
  };
  
  const translationKey = typeMap[normalizedType] || typeMap[normalizedType.toLowerCase()];
  return translationKey ? t(translationKey, normalizedType) : normalizedType;
}

// 🎯 NEW: Helper function to check if a section is a duplicate
export const isDuplicateSection = (section: Section): boolean => {
  return !!(section.subName && (section.subName.includes('_Copy_') || section.subName.includes('_Dup_')));
}

// 🎯 NEW: Helper function to get original section type from duplicate
export const getOriginalSectionType = (section: Section): string => {
  if (!isDuplicateSection(section)) {
    return section.subName || getStringFromMultilingualOrString(section.name) || '';
  }
  
  const subName = section.subName || '';
  if (subName.includes('_Copy_') || subName.includes('_Dup_')) {
    return subName.split('_')[0];
  }
  
  return subName;
}