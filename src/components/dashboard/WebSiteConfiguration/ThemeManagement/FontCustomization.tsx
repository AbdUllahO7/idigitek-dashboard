import { motion, AnimatePresence } from "framer-motion"
import { Type, ChevronUp, ChevronDown, HelpCircle } from "lucide-react"
import { Label } from "@/src/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/components/ui/tooltip"
import { getFontTypeLabel } from "@/src/api/types/hooks/useWebSiteTheme"
import type { CreateWebSiteThemeDto } from "@/src/api/types/hooks/useWebSiteTheme"
import { FONT_SIZES, FONT_WEIGHTS, getCommonFonts } from "@/src/Const/ThemeData"
import { TFunction } from "i18next"

interface FontCustomizationProps {
  newTheme: CreateWebSiteThemeDto
  isExpanded: boolean
  onToggle: () => void
  onFontChange: (fontType: "heading" | "body" | "accent", property: string, value: string) => void
  t: TFunction
}

export const FontCustomization = ({
  newTheme,
  isExpanded,
  onToggle,
  onFontChange,
  t
}: FontCustomizationProps) => {
  const commonFonts = getCommonFonts(t)

  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          <span className="font-medium">
            {t('themeManagement.createTheme.customizeFonts.title', 'Customize Fonts')}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4"
          >
            {(["heading", "body", "accent"] as const).map((fontType) => {
              const fontInfo = getFontTypeLabel(fontType, t);

              return (
                <div key={fontType} className="border rounded-lg p-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="text-lg font-medium mb-3 flex items-center gap-2 cursor-help">
                        <span>{fontInfo.icon}</span>
                        {fontInfo.label}
                        <HelpCircle className="h-4 w-4 text-slate-400" />
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{fontInfo.description}</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-sm">
                        {t('themeManagement.createTheme.customizeFonts.fontStyle', 'Font Style')}
                      </Label>
                      <Select
                        value={newTheme.fonts[fontType]?.family || ""}
                        onValueChange={(value) =>
                          onFontChange(fontType, "family", value)
                        }
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {commonFonts.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              <span style={{ fontFamily: font.value }}>
                                {font.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">
                        {t('themeManagement.createTheme.customizeFonts.fontWeight', 'Font Weight')}
                      </Label>
                      <Select
                        value={newTheme.fonts[fontType]?.weight || ""}
                        onValueChange={(value) =>
                          onFontChange(fontType, "weight", value)
                        }
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_WEIGHTS.map((weight) => (
                            <SelectItem key={weight.value} value={weight.value}>
                              {t(weight.key, weight.value)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">
                        {t('themeManagement.createTheme.customizeFonts.fontSize', 'Font Size')}
                      </Label>
                      <Select
                        value={newTheme.fonts[fontType]?.size || ""}
                        onValueChange={(value) =>
                          onFontChange(fontType, "size", value)
                        }
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_SIZES.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {t(size.key, size.value)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}