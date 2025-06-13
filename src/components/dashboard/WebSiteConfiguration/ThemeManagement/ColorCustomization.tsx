import { motion, AnimatePresence } from "framer-motion"
import { Palette, ChevronUp, ChevronDown, Sun, Moon, HelpCircle } from "lucide-react"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Toggle } from "@/src/components/ui/toggle"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/components/ui/tooltip"
import { getColorLabel } from "@/src/api/types/hooks/useWebSiteTheme"
import type { CreateWebSiteThemeDto } from "@/src/api/types/hooks/useWebSiteTheme"
import { TFunction } from "i18next"

interface ColorCustomizationProps {
  newTheme: CreateWebSiteThemeDto
  colorMode: "light" | "dark"
  isExpanded: boolean
  onToggle: () => void
  onColorModeChange: (mode: "light" | "dark") => void
  onColorChange: (mode: "light" | "dark", colorKey: string, value: string) => void
  t: TFunction
}

export const ColorCustomization = ({
  newTheme,
  colorMode,
  isExpanded,
  onToggle,
  onColorModeChange,
  onColorChange,
  t
}: ColorCustomizationProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-1"
        >
          <Palette className="h-5 w-5" />
          <span className="font-medium">
            {t('themeManagement.createTheme.customizeColors.title', 'Customize Colors')}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        <Toggle
          pressed={colorMode === "dark"}
          onPressedChange={() =>
            onColorModeChange(colorMode === "light" ? "dark" : "light")
          }
          className="ml-4"
        >
          {colorMode === "light" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span className="ml-2">
            {colorMode === "light" 
              ? t('themeManagement.createTheme.customizeColors.lightMode', 'Light Mode') 
              : t('themeManagement.createTheme.customizeColors.darkMode', 'Dark Mode')
            }
          </span>
        </Toggle>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {Object.entries(newTheme.colors[colorMode]).map(([key, value]) => {
              const colorInfo = getColorLabel(key, t);
              if (!colorInfo.label) return null;

              return (
                <div key={key} className="space-y-3 p-3 border rounded-lg">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="text-sm font-medium flex items-center gap-2 cursor-help">
                        <span>{colorInfo.icon}</span>
                        {colorInfo.label}
                        <HelpCircle className="h-3 w-3 text-slate-400" />
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{colorInfo.description}</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={value || "#000000"}
                      onChange={(e) =>
                        onColorChange(colorMode, key, e.target.value)
                      }
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={value || ""}
                      onChange={(e) =>
                        onColorChange(colorMode, key, e.target.value)
                      }
                      placeholder="#000000"
                      className="flex-1 text-sm"
                    />
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