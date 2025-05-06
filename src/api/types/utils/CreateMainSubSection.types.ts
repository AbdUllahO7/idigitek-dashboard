export interface FieldConfig {
    id: string
    label: string
    type: string
    required: boolean
    description?: string
    placeholder?: string
  }
  
export interface CreateMainSubSectionProps {
    sectionId: string
    sectionConfig: {
      type: string,
      name: string
      slug: string
      subSectionName: string
      description: string
      isMain: boolean
      fields: FieldConfig[]
      elementsMapping: Record<string, string>
    }
    onSubSectionCreated?: (subsection: any) => void
    onFormValidityChange?: (isValid: boolean, message?: string) => void
  }
  