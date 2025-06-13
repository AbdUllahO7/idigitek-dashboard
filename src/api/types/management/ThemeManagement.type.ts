import type { CreateWebSiteThemeDto, WebSiteTheme } from "@/src/api/types/hooks/useWebSiteTheme"

export interface ThemeManagementProps {
  hasWebsite: boolean
  websites: any[]
}

export interface CommonFont {
  name: string
  value: string
}

export interface ColorExtractionResult {
  light: Record<string, string>
  dark: Record<string, string>
  dominantColors: string[]
}

export interface ThemeManagementState {
  selectedWebsiteId: string
  isCreatingTheme: boolean
  editingThemes: Record<string, WebSiteTheme>
  extractingColors: boolean
  extractedPalette: ColorExtractionResult | null
  extractionError: string
  expandedSections: Record<string, boolean>
  colorMode: "light" | "dark"
  newTheme: CreateWebSiteThemeDto
}

export interface ThemeActions {
  setSelectedWebsiteId: (id: string) => void
  setIsCreatingTheme: (creating: boolean) => void
  setEditingThemes: (themes: Record<string, WebSiteTheme>) => void
  setExtractingColors: (extracting: boolean) => void
  setExtractedPalette: (palette: ColorExtractionResult | null) => void
  setExtractionError: (error: string) => void
  setExpandedSections: (sections: Record<string, boolean>) => void
  setColorMode: (mode: "light" | "dark") => void
  setNewTheme: (theme: CreateWebSiteThemeDto) => void
}

export interface ThemeHandlers {
  handleCreateTheme: () => Promise<void>
  handleSetActive: (themeId: string) => Promise<void>
  handleColorChange: (mode: "light" | "dark", colorKey: string, value: string, themeId?: string) => void
  handleFontChange: (fontType: "heading" | "body" | "accent", property: string, value: string, themeId?: string) => void
  handleExtractColorsFromLogo: () => Promise<void>
  handleApplyExtractedColors: () => void
  toggleSection: (section: string) => void
  startEditingTheme: (theme: WebSiteTheme) => void
  cancelEditingTheme: (themeId: string) => void
  saveEditingTheme: (themeId: string) => Promise<void>
}