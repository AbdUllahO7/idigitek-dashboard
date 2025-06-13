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
    bgColor: "from-gray-50 to-slate-50 dark:from-gray-950/50 dark:to-slate-950/50"
  }
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
    return translatedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (section.description && section.description.toLowerCase().includes(searchQuery.toLowerCase()))
  })
}