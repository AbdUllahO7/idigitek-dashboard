import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Badge } from "@/src/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/components/ui/tooltip"
import { getColorLabel, getFontTypeLabel } from "@/src/api/types/hooks/useWebSiteTheme"
import type { WebSiteTheme } from "@/src/api/types/hooks/useWebSiteTheme"
import { TFunction } from "i18next"

interface ActiveThemeDisplayProps {
  activeTheme: WebSiteTheme
  t: TFunction
}

export const ActiveThemeDisplay = ({ activeTheme, t }: ActiveThemeDisplayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card className="border-2 border-green-500/50 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <Check className="h-5 w-5" />
            {t('themeManagement.activeTheme.title', 'Active Theme')}
            <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800">
              {t('themeManagement.activeTheme.badge', 'Active')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">{activeTheme.themeName}</h3>

            {/* Color Preview */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                {t('themeManagement.activeTheme.colorSchemes', 'Color Schemes')}
              </Label>
              <div className="space-y-4">
                {(["light", "dark"] as const).map((mode) => (
                  <div key={mode}>
                    <h4 className="font-medium capitalize mb-2">
                      {t(`themeManagement.activeTheme.${mode}Mode`, `${mode} Mode`)}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {activeTheme.colors[mode] &&
                        Object.entries(activeTheme.colors[mode]).map(([key, color]) => {
                          const colorInfo = getColorLabel(key, t);
                          if (!colorInfo.label) return null;

                          return (
                            <Tooltip key={key}>
                              <TooltipTrigger asChild>
                                <div className="flex flex-col items-center cursor-help">
                                  <div
                                    className="w-12 h-12 rounded-lg border-2 border-white shadow-lg"
                                    style={{ backgroundColor: color as string }}
                                  />
                                  <span className="text-xs text-slate-600 dark:text-slate-400 mt-1 text-center">
                                    {colorInfo.icon} {colorInfo.label}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{colorInfo.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Font Preview */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                {t('themeManagement.activeTheme.typography', 'Typography')}
              </Label>
              <div className="space-y-3">
                {Object.entries(activeTheme.fonts).map(([fontType, fontConfig]) => {
                  const fontInfo = getFontTypeLabel(fontType, t);
                  if (!fontInfo.label) return null;

                  return (
                    <div key={fontType} className="flex items-center gap-3">
                      <span className="text-lg">{fontInfo.icon}</span>
                      <div style={{ fontFamily: (fontConfig as { family: string }).family }}>
                        <span className="font-semibold">{fontInfo.label}:</span>
                        <span className="ml-2">{(fontConfig as { family: string }).family.split(",")[0]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}