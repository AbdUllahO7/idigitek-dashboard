import { LayoutGrid } from "lucide-react"
import type { Section } from "@/src/api/types/hooks/section.types"
import { PREDEFINED_SECTIONS } from "@/src/Const/SectionsData"
import { TFunction } from "i18next"

export const getTranslatedSectionName = (
  section: Section,
  t: TFunction,
  ready: boolean
) => {
  // Find the predefined section that matches this section's name or subName
  const predefinedSection = PREDEFINED_SECTIONS.find(
    ps => ps.subName === section.name || ps.subName === section.subName
  )
  
  if (predefinedSection && ready) {
    return t(predefinedSection.nameKey, predefinedSection.nameKey.split('.').pop() || '')
  }
  
  // Fallback to the stored name
  return section.name
}

export const getSectionVisualInfo = (section: Section) => {
  const predefinedSection = PREDEFINED_SECTIONS.find(
    ps => ps.subName === section.name || ps.subName === section.subName
  )
  
  return predefinedSection || {
    icon: <LayoutGrid className="h-5 w-5" />,
    color: "from-gray-500 to-slate-500",
    bgColor: "from-gray-50 to-slate-50 dark:from-gray-950/50 dark:to-slate-950/50",
    image: null,
    category: "content"
  }
}

export const getSectionDescription = (
  section: Section | any,
  t: TFunction,
  ready: boolean
) => {
  // For predefined sections, get the description from translation
  if (section.descriptionKey && ready) {
    return t(section.descriptionKey, '')
  }
  
  // For current sections, find the matching predefined section
  const predefinedSection = PREDEFINED_SECTIONS.find(
    ps => ps.subName === section.name || ps.subName === section.subName
  )
  
  if (predefinedSection && ready) {
    return t(predefinedSection.descriptionKey, '')
  }
  
  // Fallback to stored description or default
  return section.description || ''
}

export const filterPredefinedSections = (
  searchQuery: string,
  categoryFilter: string,
  orderedSections: Section[],
  t: TFunction,
  ready: boolean
) => {
  return PREDEFINED_SECTIONS.filter((predefinedSection) => {
    const translatedName = ready ? t(predefinedSection.nameKey, predefinedSection.nameKey.split('.').pop() || '') : predefinedSection.nameKey.split('.').pop() || ''
    const translatedDescription = ready ? t(predefinedSection.descriptionKey, '') : ''
    
    // Use subName for comparison to avoid language-dependent duplicates
    const sectionExists = orderedSections.some((section: Section) => 
      section.name === predefinedSection.subName || 
      section.subName === predefinedSection.subName
    )
    
    return !sectionExists &&
      (translatedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        translatedDescription.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (categoryFilter === "all" || predefinedSection.category === categoryFilter)
  })
}

export const filterCurrentSections = (
  sections: Section[],
  searchQuery: string,
  t: TFunction,
  ready: boolean
) => {
  return sections.filter((section: Section) => {
    const translatedName = getTranslatedSectionName(section, t, ready)
    const translatedDescription = getSectionDescription(section, t, ready)
    
    return translatedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      translatedDescription.toLowerCase().includes(searchQuery.toLowerCase())
  })
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
  
  // Map section types to translation keys
  const typeMap: { [key: string]: string } = {
    'header': 'sectionManagement.sections.header.name',
    'hero': 'sectionManagement.sections.hero.name',
    'services': 'sectionManagement.sections.services.name',
    'news': 'sectionManagement.sections.news.name',
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
  };
  
  const translationKey = typeMap[sectionType];
  return translationKey ? t(translationKey, sectionType) : sectionType;
}