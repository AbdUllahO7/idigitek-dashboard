import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useWebSiteThemes } from "@/src/hooks/webConfiguration/use-WebSiteTheme"
import { COLOR_PRESETS, CreateWebSiteThemeDto, FONT_PRESETS, WebSiteTheme } from "@/src/api/types/hooks/useWebSiteTheme"
import { ColorExtractionResult } from "@/src/api/types/management/ThemeManagement.type"
import { DEFAULT_EXPANDED_SECTIONS } from "@/src/Const/ThemeData"
import { extractColorsFromImage } from "@/src/utils/management/ColorUtils"

export const useThemeManagement = (websites: any[]) => {
    const { t } = useTranslation()

    // State
    const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>("")
    const [isCreatingTheme, setIsCreatingTheme] = useState(false)
    const [editingThemes, setEditingThemes] = useState<Record<string, WebSiteTheme>>({})
    const [extractingColors, setExtractingColors] = useState(false)
    const [extractedPalette, setExtractedPalette] = useState<ColorExtractionResult | null>(null)
    const [extractionError, setExtractionError] = useState("")
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(DEFAULT_EXPANDED_SECTIONS)
    const [colorMode, setColorMode] = useState<"light" | "dark">("light")
    const [newTheme, setNewTheme] = useState<CreateWebSiteThemeDto>({
        websiteId: "",
        themeName: "",
        colors: COLOR_PRESETS[0].colors,
        fonts: FONT_PRESETS[0].fonts,
        isActive: false,
    })

  // Hooks
    const {
        useGetByWebsite,
        useGetActiveTheme,
        useCreate,
        useSetActiveTheme,
        useDelete,
        useCloneTheme,
        useUpdateColors,
        useUpdateFonts,
        useUpdate,
    } = useWebSiteThemes()

  // Set default website ID
  useEffect(() => {
    if (websites.length > 0 && !selectedWebsiteId) {
      setSelectedWebsiteId(websites[0]._id)
    }
  }, [websites, selectedWebsiteId])

  // Update newTheme.websiteId when selectedWebsiteId changes
  useEffect(() => {
    setNewTheme((prev) => ({ ...prev, websiteId: selectedWebsiteId }))
  }, [selectedWebsiteId])

  // Fetch themes and active theme
  const {
    data: themesResponse,
    isLoading: themesLoading,
    error: themesError,
  } = useGetByWebsite(selectedWebsiteId)
  
  const {
    data: activeThemeResponse,
    isLoading: activeThemeLoading,
    error: activeThemeError,
  } = useGetActiveTheme(selectedWebsiteId)

  // Extract themes and active theme from response
  const themes = themesResponse?.data || []
  const activeTheme = activeThemeResponse?.data

  // Mutations
  const createTheme = useCreate()
  const setActiveTheme = useSetActiveTheme()
  const deleteTheme = useDelete()
  const cloneTheme = useCloneTheme()
  const updateColors = useUpdateColors()
  const updateFonts = useUpdateFonts()
  const updateTheme = useUpdate()

  // Handlers
  const handleCreateTheme = async () => {
    if (!newTheme.themeName.trim() || !selectedWebsiteId) return

    try {
      await createTheme.mutateAsync({
        ...newTheme,
        websiteId: selectedWebsiteId,
      })
      setIsCreatingTheme(false)
      setNewTheme({
        websiteId: selectedWebsiteId,
        themeName: "",
        colors: COLOR_PRESETS[0].colors,
        fonts: FONT_PRESETS[0].fonts,
        isActive: false,
      })
    } catch (error) {
      console.error("Failed to create theme:", error)
    }
  }

  const handleSetActive = async (themeId: string) => {
    if (!selectedWebsiteId) return
    try {
      await setActiveTheme.mutateAsync({ websiteId: selectedWebsiteId, themeId })
    } catch (error) {
      console.error("Failed to set active theme:", error)
    }
  }

  const handleColorChange = (
    mode: "light" | "dark",
    colorKey: string,
    value: string,
    themeId?: string
  ) => {
    if (themeId) {
      updateColors.mutate({
        id: themeId,
        colors: { [mode]: { [colorKey]: value } },
      })
    } else {
      setNewTheme((prev) => ({
        ...prev,
        colors: {
          ...prev.colors,
          [mode]: { ...prev.colors[mode], [colorKey]: value },
        },
      }))
    }
  }

  const handleFontChange = (
    fontType: "heading" | "body" | "accent",
    property: string,
    value: string,
    themeId?: string
  ) => {
    if (themeId) {
      const fontUpdate = {
        [fontType]: {
          [property]: value,
        },
      }
      updateFonts.mutate({
        id: themeId,
        fonts: fontUpdate,
      })
    } else {
      setNewTheme((prev) => ({
        ...prev,
        fonts: {
          ...prev.fonts,
          [fontType]: {
            ...prev.fonts[fontType],
            [property]: value,
          },
        },
      }))
    }
  }

    const handleExtractColorsFromLogo = async () => {
        const selectedWebsite = websites.find(w => w._id === selectedWebsiteId)
        
        if (!selectedWebsite?.logo) {
        setExtractionError(t('themeManagement.logoExtraction.errors.noLogo', 'No logo found'))
        return
        }

        setExtractingColors(true)
        setExtractionError("")

        try {
        const palette = await extractColorsFromImage(selectedWebsite.logo)
        setExtractedPalette(palette)
        
        // Apply the extracted colors to the new theme
        setNewTheme(prev => ({
            ...prev,
            colors: {
            light: {
                primary: palette.light.primary || prev.colors.light.primary,
                background: palette.light.background || prev.colors.light.background,
                text: palette.light.text || prev.colors.light.text,
            },
            dark: {
                primary: palette.dark.primary || prev.colors.dark.primary,
                background: palette.dark.background || prev.colors.dark.background,
                text: palette.dark.text || prev.colors.dark.text,
            }
            }
        }))
        } catch (error) {
        console.error("Color extraction failed:", error)
        setExtractionError(t('themeManagement.logoExtraction.errors.extractionFailed', 'Color extraction failed'))
        } finally {
        setExtractingColors(false)
        }
    }

    const handleApplyExtractedColors = () => {
        if (extractedPalette) {
        setNewTheme(prev => ({
            ...prev,
            colors: {
            light: {
                primary: extractedPalette.light.primary || prev.colors.light.primary,
                background: extractedPalette.light.background || prev.colors.light.background,
                text: extractedPalette.light.text || prev.colors.light.text,
            },
            dark: {
                primary: extractedPalette.dark.primary || prev.colors.dark.primary,
                background: extractedPalette.dark.background || prev.colors.dark.background,
                text: extractedPalette.dark.text || prev.colors.dark.text,
            }
            }
        }))
        }
    }

    const toggleSection = (section: string) => {
        setExpandedSections((prev) => ({
        ...prev,
        [section]: !prev[section],
        }))
    }

    const startEditingTheme = (theme: WebSiteTheme) => {
        setEditingThemes((prev) => ({
        ...prev,
        [theme._id]: {
            ...theme,
            originalData: { ...theme },
        },
        }))
    }

    const cancelEditingTheme = (themeId: string) => {
        setEditingThemes((prev) => {
        const newState = { ...prev }
        delete newState[themeId]
        return newState
        })
    }

    const updateEditingTheme = (themeId: string, field: string, value: any) => {
        setEditingThemes((prev) => ({
        ...prev,
        [themeId]: {
            ...prev[themeId],
            [field]: value,
        },
        }))
    }

    const updateEditingThemeColor = (
        themeId: string,
        mode: "light" | "dark",
        colorKey: string,
        value: string
    ) => {
        setEditingThemes((prev) => ({
        ...prev,
        [themeId]: {
            ...prev[themeId],
            colors: {
            ...prev[themeId].colors,
            [mode]: {
                ...prev[themeId].colors[mode],
                [colorKey]: value,
            },
            },
        },
        }))
    }

    const updateEditingThemeFont = (
        themeId: string,
        fontType: "heading" | "body" | "accent",
        property: string,
        value: string
    ) => {
        setEditingThemes((prev) => ({
        ...prev,
        [themeId]: {
            ...prev[themeId],
            fonts: {
            ...prev[themeId].fonts,
            [fontType]: {
                ...prev[themeId].fonts[fontType],
                [property]: value,
            },
            },
        },
        }))
    }

    const saveEditingTheme = async (themeId: string) => {
        const editingTheme = editingThemes[themeId]
        if (!editingTheme) return

        try {
        await updateTheme.mutateAsync({
            id: themeId,
            data: {
            themeName: editingTheme.themeName,
            colors: editingTheme.colors,
            fonts: editingTheme.fonts,
            },
        })
        cancelEditingTheme(themeId)
        } catch (error) {
        console.error("Failed to update theme:", error)
        }
    }

    return {
        // State
        selectedWebsiteId,
        isCreatingTheme,
        editingThemes,
        extractingColors,
        extractedPalette,
        extractionError,
        expandedSections,
        colorMode,
        newTheme,

        // Data
        themes,
        activeTheme,
        themesLoading,
        activeThemeLoading,
        themesError,
        activeThemeError,

        // Mutations
        createTheme,
        setActiveTheme,
        deleteTheme,
        cloneTheme,
        updateColors,
        updateFonts,
        updateTheme,

        // Setters
        setSelectedWebsiteId,
        setIsCreatingTheme,
        setExtractedPalette,
        setColorMode,
        setNewTheme,

        // Handlers
        handleCreateTheme,
        handleSetActive,
        handleColorChange,
        handleFontChange,
        handleExtractColorsFromLogo,
        handleApplyExtractedColors,
        toggleSection,
        startEditingTheme,
        cancelEditingTheme,
        updateEditingTheme,
        updateEditingThemeColor,
        updateEditingThemeFont,
        saveEditingTheme,

        // Utils
        t
    }
}