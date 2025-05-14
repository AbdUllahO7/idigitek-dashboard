import { ContentElement } from "@/src/api/types/hooks/content.types"
import { Language } from "@/src/api/types/hooks/language.types"
import { SubSection } from "@/src/api/types/hooks/section.types"
import { z } from "zod"

export const processAndLoadNavData = (
  subsectionData: SubSection | null,
  form: any,
  languageIds: string[],
  activeLanguages: Language[],
  callbacks: {
    setIsLoadingData: (value: boolean) => void
    setDataLoaded: (value: boolean) => void
    setHasUnsavedChanges: (value: boolean) => void
    setExistingSubSectionId: (value: string | null) => void
    setContentElements: (value: ContentElement[]) => void
  }
) => {
  if (!subsectionData) {
    callbacks.setIsLoadingData(false)
    callbacks.setDataLoaded(true)
    return
  }

  if (subsectionData._id) {
    callbacks.setExistingSubSectionId(subsectionData._id)
  }

  const elements = subsectionData.elements || []
  if (elements.length > 0) {
    callbacks.setContentElements(elements)
  }

  const langCodeMap: Record<string, string> = {}
  activeLanguages.forEach(lang => {
    langCodeMap[lang._id] = lang.languageID
  })

  const logoElement = elements.find((el: { name: string; type: string }) => el.name === "Logo" && el.type === "image")
  const navItemElements = elements
    .filter((el: { type: string; name: string }) => el.type === "text" && el.name.startsWith("Nav Item"))
    .sort((a: { order: number }, b: { order: number }) => a.order - b.order)

  if (logoElement?.imageUrl) {
    form.setValue("logo", logoElement.imageUrl, { shouldDirty: false })
  }

  languageIds.forEach(langId => {
    const langCode = langCodeMap[langId] || langId

    const navItems = navItemElements.map(element => {
      const translation = element.translations?.find(
        t => (typeof t.language === 'string' ? t.language === langId : t.language?._id === langId) && t.isActive
      )

      return translation
        ? { navItemName: translation.content || element.defaultContent || "" }
        : { navItemName: element.defaultContent || "" }
    })

    if (navItems.length === 0) {
      navItems.push({ navItemName: "" })
    }

    form.setValue(langCode, navItems, { shouldDirty: false })
  })

  callbacks.setDataLoaded(true)
  callbacks.setHasUnsavedChanges(false)
  callbacks.setIsLoadingData(false)
}

export const createSectionsSchema = (languageIds: string[], activeLanguages: Language[]) => {
  const schema: Record<string, z.ZodTypeAny> = {
    logo: z.string().optional(),
  }

  languageIds.forEach(langId => {
    const langCode = activeLanguages.find(lang => lang._id === langId)?.languageID || langId
    schema[langCode] = z.array(
      z.object({
        navItemName: z.string().min(1, "Navigation item name is required"),
      })
    ).min(1, "At least one navigation item is required")
  })

  return z.object(schema)
}


export type sectionsFormData = z.infer<ReturnType<typeof createSectionsSchema>>


export const createSectionsDefaultValues = (languageIds: string[], activeLanguages: Language[]): sectionsFormData => {
  const defaultValues: sectionsFormData = {
    logo: "",
  }

  languageIds.forEach(langId => {
    const langCode = activeLanguages.find(lang => lang._id === langId)?.languageID || langId
    defaultValues[langCode] = [{ navItemName: "" }]
  })

  return defaultValues
}