import { motion } from "framer-motion"
import { Check, Copy, Trash2, Edit3, Save, X, Sun, Moon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/components/ui/tooltip"
import { getColorLabel, getFontTypeLabel } from "@/src/api/types/hooks/useWebSiteTheme"
import type { WebSiteTheme } from "@/src/api/types/hooks/useWebSiteTheme"
import { FONT_SIZES, FONT_WEIGHTS, getCommonFonts } from "@/src/Const/ThemeData"
import { TFunction } from "i18next"

interface ExistingThemesProps {
  themes: WebSiteTheme[]
  editingThemes: Record<string, WebSiteTheme>
  onSetActive: (themeId: string) => void
  onStartEditing: (theme: WebSiteTheme) => void
  onCancelEditing: (themeId: string) => void
  onSaveEditing: (themeId: string) => void
  onUpdateEditingTheme: (themeId: string, field: string, value: any) => void
  onUpdateEditingThemeColor: (themeId: string, mode: "light" | "dark", colorKey: string, value: string) => void
  onUpdateEditingThemeFont: (themeId: string, fontType: "heading" | "body" | "accent", property: string, value: string) => void
  onClone: (themeId: string, themeName: string) => void
  onDelete: (themeId: string) => void
  isSetActiveLoading: boolean
  isUpdateLoading: boolean
  t: TFunction
}

export const ExistingThemes = ({
  themes,
  editingThemes,
  onSetActive,
  onStartEditing,
  onCancelEditing,
  onSaveEditing,
  onUpdateEditingTheme,
  onUpdateEditingThemeColor,
  onUpdateEditingThemeFont,
  onClone,
  onDelete,
  isSetActiveLoading,
  isUpdateLoading,
  t
}: ExistingThemesProps) => {
  const commonFonts = getCommonFonts(t)

  if (!themes || themes.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('themeManagement.savedThemes.title', 'Saved Themes')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {themes.map((theme: WebSiteTheme) => {
            const isEditing = editingThemes[theme._id]
            const currentTheme = isEditing || theme

            return (
              <motion.div
                key={theme._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`border rounded-lg p-6 ${
                  theme.isActive
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : "border-slate-200 dark:border-slate-700"
                } ${isEditing ? "ring-2 ring-blue-500" : ""}`}
              >
                {/* Theme Header */}
                <div className="flex justify-between items-start mb-4">
                  {isEditing ? (
                    <Input
                      value={currentTheme.themeName}
                      onChange={(e) =>
                        onUpdateEditingTheme(theme._id, "themeName", e.target.value)
                      }
                      className="text-xl font-semibold bg-transparent border-dashed"
                    />
                  ) : (
                    <h3 className="text-xl font-semibold">{theme.themeName}</h3>
                  )}

                  <div className="flex items-center gap-2">
                    {theme.isActive && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        {t('themeManagement.savedThemes.active', 'Active')}
                      </Badge>
                    )}

                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => onSaveEditing(theme._id)}
                          disabled={isUpdateLoading}
                        >
                          <Save className="h-3 w-3 mr-1" />
                          {t('themeManagement.savedThemes.save', 'Save')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onCancelEditing(theme._id)}
                        >
                          <X className="h-3 w-3 mr-1" />
                          {t('themeManagement.savedThemes.cancel', 'Cancel')}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onStartEditing(theme)}
                      >
                        <Edit3 className="h-3 w-3 mr-1" />
                        {t('themeManagement.savedThemes.edit', 'Edit')}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Colors Section */}
                <div className="mb-4">
                  <Label className="text-sm font-medium mb-3 block">
                    {t('themeManagement.savedThemes.colors', 'Colors')}
                  </Label>
                  {isEditing ? (
                    <div className="space-y-4">
                      {(["light", "dark"] as const).map((mode) => (
                        <div key={mode}>
                          <div className="flex items-center gap-2 mb-2">
                            {mode === "light" ? (
                              <Sun className="h-4 w-4" />
                            ) : (
                              <Moon className="h-4 w-4" />
                            )}
                            <h4 className="font-medium capitalize">
                              {t(`themeManagement.activeTheme.${mode}Mode`, `${mode} Mode`)}
                            </h4>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {Object.entries(currentTheme.colors[mode]).map(
                              ([key, value]) => {
                                const colorInfo = getColorLabel(key, t);
                                if (!colorInfo.label) return null;

                                return (
                                  <div key={key} className="space-y-2">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Label className="text-xs flex items-center gap-1 cursor-help">
                                          <span>{colorInfo.icon}</span>
                                          {colorInfo.label}
                                        </Label>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{colorInfo.description}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="color"
                                        value={value || "#000000"}
                                        onChange={(e) =>
                                          onUpdateEditingThemeColor(
                                            theme._id,
                                            mode,
                                            key,
                                            e.target.value
                                          )
                                        }
                                        className="w-8 h-8 rounded border cursor-pointer"
                                      />
                                      <Input
                                        value={value || ""}
                                        onChange={(e) =>
                                          onUpdateEditingThemeColor(
                                            theme._id,
                                            mode,
                                            key,
                                            e.target.value
                                          )
                                        }
                                        className="flex-1 text-xs h-8"
                                      />
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(["light", "dark"] as const).map((mode) => (
                        <div key={mode}>
                          <h4 className="font-medium capitalize mb-2">
                            {t(`themeManagement.activeTheme.${mode}Mode`, `${mode} Mode`)}
                          </h4>
                          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-10 gap-2">
                            {theme.colors[mode] &&
                              Object.entries(theme.colors[mode]).map(([key, color], idx) => (
                                <Tooltip key={idx}>
                                  <TooltipTrigger asChild>
                                    <div
                                      className="w-full h-8 rounded border cursor-help"
                                      style={{ backgroundColor: color }}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {getColorLabel(key, t).label || key}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fonts Section */}
                <div className="mb-4">
                  <Label className="text-sm font-medium mb-3 block">
                    {t('themeManagement.savedThemes.typography', 'Typography')}
                  </Label>
                  {isEditing ? (
                    <div className="space-y-3">
                      {(["heading", "body", "accent"] as const).map((fontType) => {
                        const fontInfo = getFontTypeLabel(fontType, t);

                        return (
                          <div key={fontType} className="border rounded-lg p-3">
                            <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                              <span>{fontInfo.icon}</span>
                              {fontInfo.label}
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <Select
                                value={currentTheme.fonts[fontType]?.family || ""}
                                onValueChange={(value) =>
                                  onUpdateEditingThemeFont(theme._id, fontType, "family", value)
                                }
                              >
                                <SelectTrigger className="text-xs">
                                  <SelectValue placeholder={t('themeManagement.createTheme.customizeFonts.fontStyle', 'Font Style')} />
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
                              <Select
                                value={currentTheme.fonts[fontType]?.weight || ""}
                                onValueChange={(value) =>
                                  onUpdateEditingThemeFont(theme._id, fontType, "weight", value)
                                }
                              >
                                <SelectTrigger className="text-xs">
                                  <SelectValue placeholder={t('themeManagement.createTheme.customizeFonts.fontWeight', 'Font Weight')} />
                                </SelectTrigger>
                                <SelectContent>
                                  {FONT_WEIGHTS.map((weight) => (
                                    <SelectItem key={weight.value} value={weight.value}>
                                      {t(weight.key, weight.value)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={currentTheme.fonts[fontType]?.size || ""}
                                onValueChange={(value) =>
                                  onUpdateEditingThemeFont(theme._id, fontType, "size", value)
                                }
                              >
                                <SelectTrigger className="text-xs">
                                  <SelectValue placeholder={t('themeManagement.createTheme.customizeFonts.fontSize', 'Font Size')} />
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
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <p>📰 {theme.fonts.heading.family.split(",")[0]}</p>
                      <p>📖 {theme.fonts.body.family.split(",")[0]}</p>
                      {theme.fonts.accent && (
                        <p>💬 {theme.fonts.accent.family.split(",")[0]}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!isEditing && (
                  <div className="flex gap-2 pt-3 border-t flex-wrap max-w-[300px]">
                    {!theme.isActive && (
                      <Button
                        size="sm"
                        onClick={() => onSetActive(theme._id)}
                        disabled={isSetActiveLoading}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        {t('themeManagement.savedThemes.actions.useThis', 'Use This')}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onClone(theme._id, `${theme.themeName} Copy`)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {t('themeManagement.savedThemes.actions.copy', 'Copy')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(theme._id)}
                      disabled={theme.isActive}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      {t('themeManagement.savedThemes.actions.delete', 'Delete')}
                    </Button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  )
}