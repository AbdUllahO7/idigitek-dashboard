import { TFunction } from "i18next"
import { CommonFont } from "../api/types/management/ThemeManagement.type"

export const getCommonFonts = (t: TFunction ): CommonFont[] => [
  { name: t('themeManagement.fontFamilies.inter', 'Inter'), value: "Inter, sans-serif" },
  { name: t('themeManagement.fontFamilies.roboto', 'Roboto'), value: "Roboto, sans-serif" },
  { name: t('themeManagement.fontFamilies.openSans', 'Open Sans'), value: "Open Sans, sans-serif" },
  { name: t('themeManagement.fontFamilies.lato', 'Lato'), value: "Lato, sans-serif" },
  { name: t('themeManagement.fontFamilies.montserrat', 'Montserrat'), value: "Montserrat, sans-serif" },
  { name: t('themeManagement.fontFamilies.playfair', 'Playfair Display'), value: "Playfair Display, serif" },
  { name: t('themeManagement.fontFamilies.merriweather', 'Merriweather'), value: "Merriweather, serif" },
  { name: t('themeManagement.fontFamilies.sourceSerif', 'Source Serif Pro'), value: "Source Serif Pro, serif" },
  { name: t('themeManagement.fontFamilies.robotoMono', 'Roboto Mono'), value: "Roboto Mono, monospace" },
  { name: t('themeManagement.fontFamilies.firaCode', 'Fira Code'), value: "Fira Code, monospace" },
]

export const FONT_WEIGHTS = [
  { value: "300", key: "themeManagement.createTheme.fontWeights.300" },
  { value: "400", key: "themeManagement.createTheme.fontWeights.400" },
  { value: "500", key: "themeManagement.createTheme.fontWeights.500" },
  { value: "600", key: "themeManagement.createTheme.fontWeights.600" },
  { value: "700", key: "themeManagement.createTheme.fontWeights.700" },
  { value: "800", key: "themeManagement.createTheme.fontWeights.800" },
]

export const FONT_SIZES = [
  { value: "0.875rem", key: "themeManagement.createTheme.fontSizes.small" },
  { value: "1rem", key: "themeManagement.createTheme.fontSizes.normal" },
  { value: "1.125rem", key: "themeManagement.createTheme.fontSizes.large" },
  { value: "1.25rem", key: "themeManagement.createTheme.fontSizes.extraLarge" },
  { value: "1.5rem", key: "themeManagement.createTheme.fontSizes.huge" },
  { value: "2rem", key: "themeManagement.createTheme.fontSizes.massive" },
]

export const DEFAULT_EXPANDED_SECTIONS = {
  logoExtraction: true, 
  colors: true,
  fonts: true,
}