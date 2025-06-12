// src/components/ThemeManagement.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  Type,
  Plus,
  Copy,
  Trash2,
  Check,
  Settings,
  Sparkles,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Edit3,
  Save,
  X,
  Moon,
  Sun,
  Wand2,
  RefreshCw,
  Image,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Separator } from "@/src/components/ui/separator";
import { Badge } from "@/src/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { Toggle } from "@/src/components/ui/toggle";
import { useWebSiteThemes } from "@/src/hooks/webConfiguration/use-WebSiteTheme";
import {
  COLOR_PRESETS,
  CreateWebSiteThemeDto,
  FONT_PRESETS,
  WebSiteTheme,
  getColorPresetName,
  getFontPresetName,
  getColorLabel,
  getFontTypeLabel,
} from "@/src/api/types/hooks/useWebSiteTheme";
import { useTranslation } from "react-i18next";

interface ThemeManagementProps {
  hasWebsite: boolean;
  websites: any[];
}

export function ThemeManagement({ hasWebsite, websites }: ThemeManagementProps) {
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>("");
  const [isCreatingTheme, setIsCreatingTheme] = useState(false);
  const [editingThemes, setEditingThemes] = useState<Record<string, WebSiteTheme>>({});
  const {t} = useTranslation()
  const [extractingColors, setExtractingColors] = useState(false);
  const [extractedPalette, setExtractedPalette] = useState<any>(null);
  const [extractionError, setExtractionError] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
  logoExtraction: true, 
  colors: true,
  fonts: true,
});

  const [colorMode, setColorMode] = useState<"light" | "dark">("light");
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
  } = useWebSiteThemes();

  // Set default website ID
  useEffect(() => {
    if (websites.length > 0 && !selectedWebsiteId) {
      setSelectedWebsiteId(websites[0]._id);
    }
  }, [websites, selectedWebsiteId]);

  // Fetch themes and active theme
  const {
    data: themesResponse,
    isLoading: themesLoading,
    error: themesError,
  } = useGetByWebsite(selectedWebsiteId);
  const {
    data: activeThemeResponse,
    isLoading: activeThemeLoading,
    error: activeThemeError,
  } = useGetActiveTheme(selectedWebsiteId);

  // Extract themes and active theme from response
  const themes = themesResponse?.data || [];
  const activeTheme = activeThemeResponse?.data;

  const createTheme = useCreate();
  const setActiveTheme = useSetActiveTheme();
  const deleteTheme = useDelete();
  const cloneTheme = useCloneTheme();
  const updateColors = useUpdateColors();
  const updateFonts = useUpdateFonts();
  const updateTheme = useUpdate();

  const [newTheme, setNewTheme] = useState<CreateWebSiteThemeDto>({
    websiteId: selectedWebsiteId,
    themeName: "",
    colors: COLOR_PRESETS[0].colors,
    fonts: FONT_PRESETS[0].fonts,
    isActive: false,
  });

  // Update newTheme.websiteId when selectedWebsiteId changes
  useEffect(() => {
    setNewTheme((prev) => ({ ...prev, websiteId: selectedWebsiteId }));
  }, [selectedWebsiteId]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCreateTheme = async () => {
    if (!newTheme.themeName.trim() || !selectedWebsiteId) return;

    try {
      await createTheme.mutateAsync({
        ...newTheme,
        websiteId: selectedWebsiteId,
      });
      setIsCreatingTheme(false);
      setNewTheme({
        websiteId: selectedWebsiteId,
        themeName: "",
        colors: COLOR_PRESETS[0].colors,
        fonts: FONT_PRESETS[0].fonts,
        isActive: false,
      });
    } catch (error) {
      console.error("Failed to create theme:", error);
    }
  };

  const handleSetActive = async (themeId: string) => {
    if (!selectedWebsiteId) return;
    try {
      await setActiveTheme.mutateAsync({ websiteId: selectedWebsiteId, themeId });
    } catch (error) {
      console.error("Failed to set active theme:", error);
    }
  };

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
      });
    } else {
      setNewTheme((prev) => ({
        ...prev,
        colors: {
          ...prev.colors,
          [mode]: { ...prev.colors[mode], [colorKey]: value },
        },
      }));
    }
  };

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
      };
      updateFonts.mutate({
        id: themeId,
        fonts: fontUpdate,
      });
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
      }));
    }
  };

  const startEditingTheme = (theme: WebSiteTheme) => {
    setEditingThemes((prev) => ({
      ...prev,
      [theme._id]: {
        ...theme,
        originalData: { ...theme },
      },
    }));
  };

  const cancelEditingTheme = (themeId: string) => {
    setEditingThemes((prev) => {
      const newState = { ...prev };
      delete newState[themeId];
      return newState;
    });
  };

  const updateEditingTheme = (themeId: string, field: string, value: any) => {
    setEditingThemes((prev) => ({
      ...prev,
      [themeId]: {
        ...prev[themeId],
        [field]: value,
      },
    }));
  };

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
    }));
  };

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
    }));
  };
const handleExtractColorsFromLogo = async () => {
  const selectedWebsite = websites.find(w => w._id === selectedWebsiteId);
  
  if (!selectedWebsite?.logo) {
    setExtractionError(t('themeManagement.logoExtraction.errors.noLogo'));
    return;
  }

  setExtractingColors(true);
  setExtractionError("");

  try {
    const palette = await extractColorsFromImage(selectedWebsite.logo);
    setExtractedPalette(palette);
    
    // Apply the extracted colors to the new theme
    setNewTheme(prev => ({
      ...prev,
      colors: {
        light: palette.light,
        dark: palette.dark
      }
    }));
  } catch (error) {
    console.error("Color extraction failed:", error);
    setExtractionError(t('themeManagement.logoExtraction.errors.extractionFailed'));
  } finally {
    setExtractingColors(false);
  }
};

const handleApplyExtractedColors = () => {
  if (extractedPalette) {
    setNewTheme(prev => ({
      ...prev,
      colors: {
        light: extractedPalette.light,
        dark: extractedPalette.dark
      }
    }));
  }
};
  const saveEditingTheme = async (themeId: string) => {
    const editingTheme = editingThemes[themeId];
    if (!editingTheme) return;

    try {
      await updateTheme.mutateAsync({
        id: themeId,
        data: {
          themeName: editingTheme.themeName,
          colors: editingTheme.colors,
          fonts: editingTheme.fonts,
        },
      });
      cancelEditingTheme(themeId);
    } catch (error) {
      console.error("Failed to update theme:", error);
    }
  };
  const generateColorPalette = (dominantColors: string[]) => {
  if (!dominantColors.length) return null;
  
  const primary = dominantColors[0];
  const secondary = dominantColors[1] || primary;
  
  const [primaryH, primaryS, primaryL] = hexToHsl(primary);
  const [secondaryH, secondaryS, secondaryL] = hexToHsl(secondary);
  
  // Generate a complete color scheme
  const lightColors = {
    primary: primary,
    secondary: secondary,
    accent: dominantColors[2] || hslToHex(primaryH, primaryS, Math.min(primaryL + 20, 90)),
    background: "#ffffff",
    foreground: "#0f172a",
    card: "#ffffff",
    cardForeground: "#0f172a",
    popover: "#ffffff",
    popoverForeground: "#0f172a",
    muted: "#f1f5f9",
    mutedForeground: "#64748b",
    border: "#e2e8f0",
    input: "#e2e8f0",
    ring: primary,
  };
  
  const darkColors = {
    primary: hslToHex(primaryH, primaryS, Math.max(primaryL - 10, 30)),
    secondary: hslToHex(secondaryH, secondaryS, Math.max(secondaryL - 10, 30)),
    accent: hslToHex(primaryH, primaryS, Math.max(primaryL - 5, 35)),
    background: "#020817",
    foreground: "#f8fafc",
    card: "#020817",
    cardForeground: "#f8fafc",
    popover: "#020817",
    popoverForeground: "#f8fafc",
    muted: "#0f172a",
    mutedForeground: "#64748b",
    border: "#1e293b",
    input: "#1e293b",
    ring: hslToHex(primaryH, primaryS, Math.max(primaryL - 10, 30)),
  };
  
  return {
    light: lightColors,
    dark: darkColors,
    dominantColors: dominantColors.slice(0, 6)
  };
};
  const analyzeImageColors = (imageData: ImageData) => {
  const pixels = imageData.data;
  const colorMap = new Map();
  
  // Sample every 4th pixel for performance
  for (let i = 0; i < pixels.length; i += 16) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    
    // Skip transparent pixels
    if (a < 128) continue;
    
    // Group similar colors (reduce precision)
    const key = `${Math.floor(r / 8) * 8},${Math.floor(g / 8) * 8},${Math.floor(b / 8) * 8}`;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }
  
  // Sort by frequency and get dominant colors
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([color]) => {
      const [r, g, b] = color.split(',').map(Number);
      return rgbToHex(r, g, b);
    });
  
  return generateColorPalette(sortedColors);
  };
  const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
};
  const hslToHex = (h: number, s: number, l: number): string => {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, h + 1/3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1/3);
    
    return rgbToHex(
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    );
  };
  const hexToHsl = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h = h ?? 0; // Ensure 'h' is defined
      h /= 6;
    }
    
    return [h * 360, s * 100, l * 100];
  };

  const extractColorsFromImage = (imageUrl: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const colors = analyzeImageColors(imageData);
        resolve(colors);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
  };



  const commonFonts = [
    { name: t('themeManagement.fontFamilies.inter'), value: "Inter, sans-serif" },
    { name: t('themeManagement.fontFamilies.roboto'), value: "Roboto, sans-serif" },
    { name: t('themeManagement.fontFamilies.openSans'), value: "Open Sans, sans-serif" },
    { name: t('themeManagement.fontFamilies.lato'), value: "Lato, sans-serif" },
    { name: t('themeManagement.fontFamilies.montserrat'), value: "Montserrat, sans-serif" },
    { name: t('themeManagement.fontFamilies.playfair'), value: "Playfair Display, serif" },
    { name: t('themeManagement.fontFamilies.merriweather'), value: "Merriweather, serif" },
    { name: t('themeManagement.fontFamilies.sourceSerif'), value: "Source Serif Pro, serif" },
    { name: t('themeManagement.fontFamilies.robotoMono'), value: "Roboto Mono, monospace" },
    { name: t('themeManagement.fontFamilies.firaCode'), value: "Fira Code, monospace" },
  ];

  if (!hasWebsite) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Palette className="h-16 w-16 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {t('themeManagement.states.noWebsite.title')}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
            {t('themeManagement.states.noWebsite.description')}
          </p>
        </CardContent>
      </Card>
    );
  }

  

  if (themesLoading || activeThemeLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="h-16 w-16 text-slate-400 mb-4"
          >
            <Palette />
          </motion.div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {t('themeManagement.states.loading.title')}
          </h3>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Website Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('themeManagement.pageTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="website-select">{t('themeManagement.websiteSelection.title')}</Label>
                <Select value={selectedWebsiteId} onValueChange={setSelectedWebsiteId}>
                  <SelectTrigger id="website-select">
                    <SelectValue placeholder={t('themeManagement.websiteSelection.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {websites.map((website) => (
                      <SelectItem key={website._id} value={website._id}>
                        {website.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Theme Display */}
        {activeTheme && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <Card className="border-2 border-green-500/50 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Check className="h-5 w-5" />
                  {t('themeManagement.activeTheme.title')}
                  <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800">
                    {t('themeManagement.activeTheme.badge')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">{activeTheme.themeName}</h3>

                  {/* Color Preview */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">{t('themeManagement.activeTheme.colorSchemes')}</Label>
                    <div className="space-y-4">
                      {(["light", "dark"] as const).map((mode) => (
                        <div key={mode}>
                          <h4 className="font-medium capitalize mb-2">
                            {t(`themeManagement.activeTheme.${mode}Mode`)}
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
                    <Label className="text-sm font-medium mb-2 block">{t('themeManagement.activeTheme.typography')}</Label>
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
        )}

        {/* Theme Creation */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                {t('themeManagement.createTheme.title')}
              </CardTitle>
              <Button
                onClick={() => setIsCreatingTheme(!isCreatingTheme)}
                variant={isCreatingTheme ? "secondary" : "default"}
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreatingTheme ? t('themeManagement.createTheme.buttonCancel') : t('themeManagement.createTheme.buttonCreate')}
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
                    <Label htmlFor="theme-name">{t('themeManagement.createTheme.nameLabel')}</Label>
                    <Input
                      id="theme-name"
                      value={newTheme.themeName}
                      onChange={(e) =>
                        setNewTheme((prev) => ({ ...prev, themeName: e.target.value }))
                      }
                      placeholder={t('themeManagement.createTheme.namePlaceholder')}
                    />
                  </div>
                  {/* Logo Color Extraction */}
                    {(() => {
                      const selectedWebsite = websites.find(w => w._id === selectedWebsiteId);
                      return selectedWebsite?.logo ? (
                        <Card className="border-2 border-dashed border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => toggleSection("logoExtraction")}
                                className="flex items-center gap-2 p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex-1"
                              >
                                <Wand2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <span className="font-medium text-blue-800 dark:text-blue-200">
                                  {t('themeManagement.logoExtraction.title')}
                                </span>
                                {expandedSections.logoExtraction ? (
                                  <ChevronUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                )}
                              </button>
                            </div>
                          </CardHeader>

                          <AnimatePresence>
                            {expandedSections.logoExtraction && (
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
                                          src={selectedWebsite.logo}
                                          alt={t('themeManagement.logoExtraction.logoAlt')}
                                          className="w-full h-full object-contain"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                          {selectedWebsite.name}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          {t('themeManagement.logoExtraction.description')}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Extract Button */}
                                    <Button
                                      onClick={handleExtractColorsFromLogo}
                                      disabled={extractingColors}
                                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                    >
                                      {extractingColors ? (
                                        <>
                                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                          {t('themeManagement.logoExtraction.extracting')}
                                        </>
                                      ) : (
                                        <>
                                          <Palette className="h-4 w-4 mr-2" />
                                          {t('themeManagement.logoExtraction.extractButton')}
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
                                            {t('themeManagement.logoExtraction.extractedPalette')}
                                          </h4>
                                          <Button
                                            size="sm"
                                            onClick={handleApplyExtractedColors}
                                            variant="outline"
                                            className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-950/30"
                                          >
                                            <Check className="h-3 w-3 mr-1" />
                                            {t('themeManagement.logoExtraction.applyColors')}
                                          </Button>
                                        </div>

                                        {/* Dominant Colors */}
                                        <div>
                                          <Label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
                                            {t('themeManagement.logoExtraction.dominantColors')}
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
                                                  <p>{t('themeManagement.logoExtraction.colorTooltip', { color })}</p>
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
                                                  {t(`themeManagement.activeTheme.${mode}Mode`)}
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
                      ) : null;
                    })()}
                  {/* Preset Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="flex items-center gap-2 mb-3">
                        {t('themeManagement.createTheme.quickColors.title')}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-slate-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('themeManagement.createTheme.quickColors.tooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <div className="grid grid-cols-1 gap-3">
                        {COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() =>
                              setNewTheme((prev) => ({ ...prev, colors: preset.colors }))
                            }
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
                        {t('themeManagement.createTheme.fontCombinations.title')}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-slate-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('themeManagement.createTheme.fontCombinations.tooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <div className="grid grid-cols-1 gap-3">
                        {FONT_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() =>
                              setNewTheme((prev) => ({ ...prev, fonts: preset.fonts }))
                            }
                            className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                          >
                            <div className="space-y-2">
                              <div className="font-semibold">{getFontPresetName(preset, t)}</div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                <div style={{ fontFamily: preset.fonts.heading.family }}>
                                  {t('themeManagement.createTheme.fontCombinations.headlines')} {preset.fonts.heading.family.split(",")[0]}
                                </div>
                                <div style={{ fontFamily: preset.fonts.body.family }}>
                                  {t('themeManagement.createTheme.fontCombinations.bodyText')} {preset.fonts.body.family.split(",")[0]}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Color Customization */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => toggleSection("colors")}
                        className="flex items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-1"
                      >
                        <Palette className="h-5 w-5" />
                        <span className="font-medium">{t('themeManagement.createTheme.customizeColors.title')}</span>
                        {expandedSections.colors ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      <Toggle
                        pressed={colorMode === "dark"}
                        onPressedChange={() =>
                          setColorMode(colorMode === "light" ? "dark" : "light")
                        }
                        className="ml-4"
                      >
                        {colorMode === "light" ? (
                          <Sun className="h-4 w-4" />
                        ) : (
                          <Moon className="h-4 w-4" />
                        )}
                        <span className="ml-2">
                          {colorMode === "light" ? t('themeManagement.createTheme.customizeColors.lightMode') : t('themeManagement.createTheme.customizeColors.darkMode')}
                        </span>
                      </Toggle>
                    </div>

                    <AnimatePresence>
                      {expandedSections.colors && (
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
                                      handleColorChange(colorMode, key, e.target.value)
                                    }
                                    className="w-12 h-10 rounded border cursor-pointer"
                                  />
                                  <Input
                                    value={value || ""}
                                    onChange={(e) =>
                                      handleColorChange(colorMode, key, e.target.value)
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

                  {/* Font Customization */}
                  <div>
                    <button
                      onClick={() => toggleSection("fonts")}
                      className="flex items-center justify-between w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Type className="h-5 w-5" />
                        <span className="font-medium">{t('themeManagement.createTheme.customizeFonts.title')}</span>
                      </div>
                      {expandedSections.fonts ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedSections.fonts && (
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
                                    <Label className="text-sm">{t('themeManagement.createTheme.customizeFonts.fontStyle')}</Label>
                                    <Select
                                      value={newTheme.fonts[fontType]?.family || ""}
                                      onValueChange={(value) =>
                                        handleFontChange(fontType, "family", value)
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
                                    <Label className="text-sm">{t('themeManagement.createTheme.customizeFonts.fontWeight')}</Label>
                                    <Select
                                      value={newTheme.fonts[fontType]?.weight || ""}
                                      onValueChange={(value) =>
                                        handleFontChange(fontType, "weight", value)
                                      }
                                    >
                                      <SelectTrigger className="text-sm">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="300">{t('themeManagement.createTheme.fontWeights.300')}</SelectItem>
                                        <SelectItem value="400">{t('themeManagement.createTheme.fontWeights.400')}</SelectItem>
                                        <SelectItem value="500">{t('themeManagement.createTheme.fontWeights.500')}</SelectItem>
                                        <SelectItem value="600">{t('themeManagement.createTheme.fontWeights.600')}</SelectItem>
                                        <SelectItem value="700">{t('themeManagement.createTheme.fontWeights.700')}</SelectItem>
                                        <SelectItem value="800">{t('themeManagement.createTheme.fontWeights.800')}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label className="text-sm">{t('themeManagement.createTheme.customizeFonts.fontSize')}</Label>
                                    <Select
                                      value={newTheme.fonts[fontType]?.size || ""}
                                      onValueChange={(value) =>
                                        handleFontChange(fontType, "size", value)
                                      }
                                    >
                                      <SelectTrigger className="text-sm">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="0.875rem">{t('themeManagement.createTheme.fontSizes.small')}</SelectItem>
                                        <SelectItem value="1rem">{t('themeManagement.createTheme.fontSizes.normal')}</SelectItem>
                                        <SelectItem value="1.125rem">{t('themeManagement.createTheme.fontSizes.large')}</SelectItem>
                                        <SelectItem value="1.25rem">{t('themeManagement.createTheme.fontSizes.extraLarge')}</SelectItem>
                                        <SelectItem value="1.5rem">{t('themeManagement.createTheme.fontSizes.huge')}</SelectItem>
                                        <SelectItem value="2rem">{t('themeManagement.createTheme.fontSizes.massive')}</SelectItem>
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

                  {/* Create Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleCreateTheme}
                      disabled={!newTheme.themeName.trim() || createTheme.isPending}
                      className="min-w-32"
                    >
                      {createTheme.isPending ? t('themeManagement.createTheme.creating') : t('themeManagement.createTheme.createButton')}
                    </Button>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Existing Themes */}
        {themes && themes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('themeManagement.savedThemes.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {themes.map((theme: WebSiteTheme) => {
                  const isEditing = editingThemes[theme._id];
                  const currentTheme = isEditing || theme;

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
                              updateEditingTheme(theme._id, "themeName", e.target.value)
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
                              {t('themeManagement.savedThemes.active')}
                            </Badge>
                          )}

                          {isEditing ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => saveEditingTheme(theme._id)}
                                disabled={updateTheme.isPending}
                              >
                                <Save className="h-3 w-3 mr-1" />
                                {t('themeManagement.savedThemes.save')}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => cancelEditingTheme(theme._id)}
                              >
                                <X className="h-3 w-3 mr-1" />
                                {t('themeManagement.savedThemes.cancel')}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditingTheme(theme)}
                            >
                              <Edit3 className="h-3 w-3 mr-1" />
                              {t('themeManagement.savedThemes.edit')}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Colors Section */}
                      <div className="mb-4">
                        <Label className="text-sm font-medium mb-3 block">{t('themeManagement.savedThemes.colors')}</Label>
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
                                    {t(`themeManagement.activeTheme.${mode}Mode`)}
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
                                                updateEditingThemeColor(
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
                                                updateEditingThemeColor(
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
                                  {t(`themeManagement.activeTheme.${mode}Mode`)}
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
                        <Label className="text-sm font-medium mb-3 block">{t('themeManagement.savedThemes.typography')}</Label>
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
                                        updateEditingThemeFont(theme._id, fontType, "family", value)
                                      }
                                    >
                                      <SelectTrigger className="text-xs">
                                        <SelectValue placeholder={t('themeManagement.createTheme.customizeFonts.fontStyle')} />
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
                                        updateEditingThemeFont(theme._id, fontType, "weight", value)
                                      }
                                    >
                                      <SelectTrigger className="text-xs">
                                        <SelectValue placeholder={t('themeManagement.createTheme.customizeFonts.fontWeight')} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="300">{t('themeManagement.createTheme.fontWeights.300')}</SelectItem>
                                        <SelectItem value="400">{t('themeManagement.createTheme.fontWeights.400')}</SelectItem>
                                        <SelectItem value="500">{t('themeManagement.createTheme.fontWeights.500')}</SelectItem>
                                        <SelectItem value="600">{t('themeManagement.createTheme.fontWeights.600')}</SelectItem>
                                        <SelectItem value="700">{t('themeManagement.createTheme.fontWeights.700')}</SelectItem>
                                        <SelectItem value="800">{t('themeManagement.createTheme.fontWeights.800')}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Select
                                      value={currentTheme.fonts[fontType]?.size || ""}
                                      onValueChange={(value) =>
                                        updateEditingThemeFont(theme._id, fontType, "size", value)
                                      }
                                    >
                                      <SelectTrigger className="text-xs">
                                        <SelectValue placeholder={t('themeManagement.createTheme.customizeFonts.fontSize')} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="0.875rem">{t('themeManagement.createTheme.fontSizes.small')}</SelectItem>
                                        <SelectItem value="1rem">{t('themeManagement.createTheme.fontSizes.normal')}</SelectItem>
                                        <SelectItem value="1.125rem">{t('themeManagement.createTheme.fontSizes.large')}</SelectItem>
                                        <SelectItem value="1.25rem">{t('themeManagement.createTheme.fontSizes.extraLarge')}</SelectItem>
                                        <SelectItem value="1.5rem">{t('themeManagement.createTheme.fontSizes.huge')}</SelectItem>
                                        <SelectItem value="2rem">{t('themeManagement.createTheme.fontSizes.massive')}</SelectItem>
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
                        <div className="flex gap-2 pt-3 border-t">
                          {!theme.isActive && (
                            <Button
                              size="sm"
                              onClick={() => handleSetActive(theme._id)}
                              disabled={setActiveTheme.isPending}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              {t('themeManagement.savedThemes.actions.useThis')}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              cloneTheme.mutate({
                                id: theme._id,
                                themeName: `${theme.themeName} Copy`,
                              })
                            }
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            {t('themeManagement.savedThemes.actions.copy')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteTheme.mutate(theme._id)}
                            disabled={theme.isActive}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            {t('themeManagement.savedThemes.actions.delete')}
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}