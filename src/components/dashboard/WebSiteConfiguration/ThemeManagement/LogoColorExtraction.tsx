import { motion, AnimatePresence } from "framer-motion"
import { 
  Wand2, 
  Palette, 
  RefreshCw, 
  Check, 
  Sun, 
  Moon, 
  ChevronUp, 
  ChevronDown,
  AlertCircle 
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Label } from "@/src/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/components/ui/tooltip"
import { getColorLabel } from "@/src/api/types/hooks/useWebSiteTheme"
import { ColorExtractionResult } from "@/src/api/types/management/ThemeManagement.type"
import { TFunction } from "i18next"

interface LogoColorExtractionProps {
  website: any
  isExpanded: boolean
  onToggle: () => void
  extractingColors: boolean
  extractedPalette: ColorExtractionResult | null
  extractionError: string
  onExtractColors: () => void
  onApplyColors: () => void
  t: TFunction
}

export const LogoColorExtraction = ({
  website,
  isExpanded,
  onToggle,
  extractingColors,
  extractedPalette,
  extractionError,
  onExtractColors,
  onApplyColors,
  t
}: LogoColorExtractionProps) => {
  if (!website?.logo) return null

  return (
    <Card className="border-2 border-dashed border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <button
            onClick={onToggle}
            className="flex items-center gap-2 p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex-1"
          >
            <Wand2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-800 dark:text-blue-200">
              {t('themeManagement.logoExtraction.title', 'Extract Colors from Logo')}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            )}
          </button>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CardContent>
              <div className="space-y-4">
                {/* Logo Preview */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border-2 border-blue-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <img
                      src={website.logo}
                      alt={t('themeManagement.logoExtraction.logoAlt', 'Website logo')}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {website.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('themeManagement.logoExtraction.description', 'Generate color palette from your logo')}
                    </p>
                  </div>
                </div>

                {/* Extract Button */}
                <Button
                  onClick={onExtractColors}
                  disabled={extractingColors}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {extractingColors ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {t('themeManagement.logoExtraction.extracting', 'Extracting colors...')}
                    </>
                  ) : (
                    <>
                      <Palette className="h-4 w-4 mr-2" />
                      {t('themeManagement.logoExtraction.extractButton', 'Extract Colors')}
                    </>
                  )}
                </Button>

                {/* Error Message */}
                {extractionError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700 dark:text-red-300">{extractionError}</span>
                  </motion.div>
                )}

                {/* Extracted Colors Preview */}
                {extractedPalette && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {t('themeManagement.logoExtraction.extractedPalette', 'Extracted Palette')}
                      </h4>
                      <Button
                        size="sm"
                        onClick={onApplyColors}
                        variant="outline"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-950/30"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        {t('themeManagement.logoExtraction.applyColors', 'Apply Colors')}
                      </Button>
                    </div>

                    {/* Dominant Colors */}
                    <div>
                      <Label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
                        {t('themeManagement.logoExtraction.dominantColors', 'Dominant Colors')}
                      </Label>
                      <div className="flex gap-2 flex-wrap">
                        {extractedPalette.dominantColors?.map((color: string, idx: number) => (
                          <Tooltip key={idx}>
                            <TooltipTrigger asChild>
                              <div className="flex flex-col items-center cursor-help">
                                <div
                                  className="w-10 h-10 rounded-lg border-2 border-white shadow-md hover:scale-110 transition-transform"
                                  style={{ backgroundColor: color }}
                                />
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                                  {color}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('themeManagement.logoExtraction.colorTooltip', 'Color: {{color}}', { color })}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </div>

                    {/* Theme Colors Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(["light", "dark"] as const).map((mode) => (
                        <div key={mode}>
                          <div className="flex items-center gap-2 mb-2">
                            {mode === "light" ? (
                              <Sun className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <Moon className="h-4 w-4 text-blue-400" />
                            )}
                            <Label className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                              {t(`themeManagement.activeTheme.${mode}Mode`, `${mode} Mode`)}
                            </Label>
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            {Object.entries(extractedPalette[mode])
                              .slice(0, 8)
                              .map(([key, color]: [string, any]) => {
                                const colorInfo = getColorLabel(key, t);
                                return (
                                  <Tooltip key={key}>
                                    <TooltipTrigger asChild>
                                      <div
                                        className="w-8 h-8 rounded border-2 border-white shadow-sm cursor-help hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color }}
                                        title={colorInfo.label}
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{colorInfo.label}: {color}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}