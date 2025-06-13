import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Plus, HelpCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/components/ui/tooltip"
import { COLOR_PRESETS, CreateWebSiteThemeDto, FONT_PRESETS, getColorPresetName, getFontPresetName } from "@/src/api/types/hooks/useWebSiteTheme"
import { LogoColorExtraction } from "./LogoColorExtraction"
import { ColorCustomization } from "./ColorCustomization"
import { FontCustomization } from "./FontCustomization"
import { ColorExtractionResult } from "@/src/api/types/management/ThemeManagement.type"
import { TFunction } from "i18next"

interface ThemeCreationCardProps {
  websites: any[]
  selectedWebsiteId: string
  isCreatingTheme: boolean
  newTheme: CreateWebSiteThemeDto
  colorMode: "light" | "dark"
  expandedSections: Record<string, boolean>
  extractingColors: boolean
  extractedPalette: ColorExtractionResult | null
  extractionError: string
  isLoading: boolean
  onToggleCreating: () => void
  onThemeNameChange: (name: string) => void
  onPresetColorSelect: (colors: any) => void
  onPresetFontSelect: (fonts: any) => void
  onToggleSection: (section: string) => void
  onColorModeChange: (mode: "light" | "dark") => void
  onColorChange: (mode: "light" | "dark", colorKey: string, value: string) => void
  onFontChange: (fontType: "heading" | "body" | "accent", property: string, value: string) => void
  onExtractColors: () => void
  onApplyExtractedColors: () => void
  onCreateTheme: () => void
  t: TFunction
}

export const ThemeCreationCard = ({
  websites,
  selectedWebsiteId,
  isCreatingTheme,
  newTheme,
  colorMode,
  expandedSections,
  extractingColors,
  extractedPalette,
  extractionError,
  isLoading,
  onToggleCreating,
  onThemeNameChange,
  onPresetColorSelect,
  onPresetFontSelect,
  onToggleSection,
  onColorModeChange,
  onColorChange,
  onFontChange,
  onExtractColors,
  onApplyExtractedColors,
  onCreateTheme,
  t
}: ThemeCreationCardProps) => {
  const selectedWebsite = websites.find(w => w._id === selectedWebsiteId)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {t('themeManagement.createTheme.title', 'Create New Theme')}
          </CardTitle>
          <Button
            onClick={onToggleCreating}
            variant={isCreatingTheme ? "secondary" : "default"}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isCreatingTheme 
              ? t('themeManagement.createTheme.buttonCancel', 'Cancel') 
              : t('themeManagement.createTheme.buttonCreate', 'Create Theme')
            }
          </Button>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isCreatingTheme && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="space-y-6">
              {/* Theme Name */}
              <div>
                <Label htmlFor="theme-name">
                  {t('themeManagement.createTheme.nameLabel', 'Theme Name')}
                </Label>
                <Input
                  id="theme-name"
                  value={newTheme.themeName}
                  onChange={(e) => onThemeNameChange(e.target.value)}
                  placeholder={t('themeManagement.createTheme.namePlaceholder', 'Enter theme name')}
                />
              </div>

              {/* Logo Color Extraction */}
              {selectedWebsite && (
                <LogoColorExtraction
                  website={selectedWebsite}
                  isExpanded={expandedSections.logoExtraction}
                  onToggle={() => onToggleSection("logoExtraction")}
                  extractingColors={extractingColors}
                  extractedPalette={extractedPalette}
                  extractionError={extractionError}
                  onExtractColors={onExtractColors}
                  onApplyColors={onApplyExtractedColors}
                  t={t}
                />
              )}

              {/* Preset Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    {t('themeManagement.createTheme.quickColors.title', 'Quick Color Themes')}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('themeManagement.createTheme.quickColors.tooltip', 'Choose a pre-made color scheme')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className="grid grid-cols-1 gap-3">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => onPresetColorSelect(preset.colors)}
                        className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex gap-1">
                            {Object.values(preset.colors.light)
                              .slice(0, 4)
                              .map((color, idx) => (
                                <div
                                  key={idx}
                                  className="w-5 h-5 rounded"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                          </div>
                          <span className="font-medium">{getColorPresetName(preset, t)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    {t('themeManagement.createTheme.fontCombinations.title', 'Font Combinations')}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('themeManagement.createTheme.fontCombinations.tooltip', 'Choose a font pairing')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className="grid grid-cols-1 gap-3">
                    {FONT_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => onPresetFontSelect(preset.fonts)}
                        className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                      >
                        <div className="space-y-2">
                          <div className="font-semibold">{getFontPresetName(preset, t)}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            <div style={{ fontFamily: preset.fonts.heading.family }}>
                              {t('themeManagement.createTheme.fontCombinations.headlines', 'Headlines:')} {preset.fonts.heading.family.split(",")[0]}
                            </div>
                            <div style={{ fontFamily: preset.fonts.body.family }}>
                              {t('themeManagement.createTheme.fontCombinations.bodyText', 'Body:')} {preset.fonts.body.family.split(",")[0]}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Color Customization */}
              <ColorCustomization
                newTheme={newTheme}
                colorMode={colorMode}
                isExpanded={expandedSections.colors}
                onToggle={() => onToggleSection("colors")}
                onColorModeChange={onColorModeChange}
                onColorChange={onColorChange}
                t={t}
              />

              {/* Font Customization */}
              <FontCustomization
                newTheme={newTheme}
                isExpanded={expandedSections.fonts}
                onToggle={() => onToggleSection("fonts")}
                onFontChange={onFontChange}
                t={t}
              />

              {/* Create Button */}
              <div className="flex justify-end">
                <Button
                  onClick={onCreateTheme}
                  disabled={!newTheme.themeName.trim() || isLoading}
                  className="min-w-32"
                >
                  {isLoading 
                    ? t('themeManagement.createTheme.creating', 'Creating...') 
                    : t('themeManagement.createTheme.createButton', 'Create Theme')
                  }
                </Button>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}