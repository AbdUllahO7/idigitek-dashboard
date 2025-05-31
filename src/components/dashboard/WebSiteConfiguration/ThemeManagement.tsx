"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Palette, 
  Type, 
  Plus, 
  Copy, 
  Trash2, 
  Check, 
  Eye,
  Settings,
  Sparkles,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Edit3,
  Save,
  X
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Separator } from "@/src/components/ui/separator"
import { Badge } from "@/src/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"
import { useWebSiteThemes } from "@/src/hooks/webConfiguration/use-WebSiteTheme"
import {  COLOR_LABELS, COLOR_PRESETS, CreateWebSiteThemeDto, FONT_PRESETS, FONT_TYPE_LABELS } from "@/src/api/types/hooks/useWebSiteTheme"

interface ThemeManagementProps {
  hasWebsite: boolean;
  websites: any[];
}



export function ThemeManagement({ hasWebsite, websites }: ThemeManagementProps) {
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>("");
  const [isCreatingTheme, setIsCreatingTheme] = useState(false);
  const [editingThemes, setEditingThemes] = useState<Record<string, any>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    colors: true,
    fonts: true
  });

  const {
    useGetByWebsite,
    useGetActiveTheme,
    useCreate,
    useSetActiveTheme,
    useDelete,
    useCloneTheme,
    useUpdateColors,
    useUpdateFonts,
    useUpdate
  } = useWebSiteThemes();

  // Set first website as default
  useEffect(() => {
    if (websites.length > 0 && !selectedWebsiteId) {
      setSelectedWebsiteId(websites[0]._id);
    }
  }, [websites, selectedWebsiteId]);

  const { data: themes, isLoading } = useGetByWebsite(selectedWebsiteId);
  const { data: activeTheme } = useGetActiveTheme(selectedWebsiteId);
  
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
    isActive: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCreateTheme = async () => {
    if (!newTheme.themeName.trim() || !selectedWebsiteId) return;

    try {
      await createTheme.mutateAsync({
        ...newTheme,
        websiteId: selectedWebsiteId
      });
      setIsCreatingTheme(false);
      setNewTheme({
        websiteId: selectedWebsiteId,
        themeName: "",
        colors: COLOR_PRESETS[0].colors,
        fonts: FONT_PRESETS[0].fonts,
        isActive: false
      });
    } catch (error) {
      console.error('Failed to create theme:', error);
    }
  };

  const handleSetActive = async (themeId: string) => {
    if (!selectedWebsiteId) return;
    try {
      await setActiveTheme.mutateAsync({ websiteId: selectedWebsiteId, themeId });
    } catch (error) {
      console.error('Failed to set active theme:', error);
    }
  };

  const handleColorChange = (colorKey: string, value: string, themeId?: string) => {
    if (themeId) {
      updateColors.mutate({
        id: themeId,
        colors: { [colorKey]: value }
      });
    } else {
      setNewTheme(prev => ({
        ...prev,
        colors: { ...prev.colors, [colorKey]: value }
      }));
    }
  };

  const handleFontChange = (fontType: 'heading' | 'body' | 'accent', property: string, value: string, themeId?: string) => {
    if (themeId) {
      const fontUpdate = {
        [fontType]: {
          [property]: value
        }
      };
      updateFonts.mutate({
        id: themeId,
        fonts: fontUpdate
      });
    } else {
      setNewTheme(prev => ({
        ...prev,
        fonts: {
          ...prev.fonts,
          [fontType]: {
            ...prev.fonts[fontType],
            [property]: value
          }
        }
      }));
    }
  };

  // Edit theme functions
  const startEditingTheme = (theme: any) => {
    setEditingThemes(prev => ({
      ...prev,
      [theme._id]: {
        ...theme,
        originalData: { ...theme } // Store original data for cancel functionality
      }
    }));
  };

  const cancelEditingTheme = (themeId: string) => {
    setEditingThemes(prev => {
      const newState = { ...prev };
      delete newState[themeId];
      return newState;
    });
  };

  const updateEditingTheme = (themeId: string, field: string, value: any) => {
    setEditingThemes(prev => ({
      ...prev,
      [themeId]: {
        ...prev[themeId],
        [field]: value
      }
    }));
  };

  const updateEditingThemeColor = (themeId: string, colorKey: string, value: string) => {
    setEditingThemes(prev => ({
      ...prev,
      [themeId]: {
        ...prev[themeId],
        colors: {
          ...prev[themeId].colors,
          [colorKey]: value
        }
      }
    }));
  };

  const updateEditingThemeFont = (themeId: string, fontType: 'heading' | 'body' | 'accent', property: string, value: string) => {
    setEditingThemes(prev => ({
      ...prev,
      [themeId]: {
        ...prev[themeId],
        fonts: {
          ...prev[themeId].fonts,
          [fontType]: {
            ...prev[themeId].fonts[fontType],
            [property]: value
          }
        }
      }
    }));
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
          fonts: editingTheme.fonts
        }
      });
      
      // Remove from editing state
      cancelEditingTheme(themeId);
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  const commonFonts = [
    { name: 'Inter (Modern & Clean)', value: 'Inter, sans-serif' },
    { name: 'Roboto (Google\'s Choice)', value: 'Roboto, sans-serif' },
    { name: 'Open Sans (Friendly & Open)', value: 'Open Sans, sans-serif' },
    { name: 'Lato (Elegant)', value: 'Lato, sans-serif' },
    { name: 'Montserrat (Geometric)', value: 'Montserrat, sans-serif' },
    { name: 'Playfair Display (Elegant Headlines)', value: 'Playfair Display, serif' },
    { name: 'Merriweather (Reading-friendly)', value: 'Merriweather, serif' },
    { name: 'Source Serif Pro (Professional)', value: 'Source Serif Pro, serif' },
    { name: 'Roboto Mono (Code Style)', value: 'Roboto Mono, monospace' },
    { name: 'Fira Code (Developer Style)', value: 'Fira Code, monospace' }
  ];

  if (!hasWebsite) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Palette className="h-16 w-16 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            No Website Available
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
            Create a website first to start customizing your visual appearance with colors and fonts.
          </p>
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
              Website Appearance Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="website-select">Choose Website to Customize</Label>
                <Select value={selectedWebsiteId} onValueChange={setSelectedWebsiteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your website" />
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
                  Currently Active Look
                  <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800">
                    Live on Website
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">{activeTheme.data.themeName}</h3>
                  
                  {/* Color Preview with User-Friendly Names */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">🎨 Color Scheme</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {Object.entries(activeTheme.data.colors).map(([key, color]) => {
                        const colorInfo = COLOR_LABELS[key as keyof typeof COLOR_LABELS];
                        if (!colorInfo) return null;
                        
                        return (
                          <Tooltip key={key}>
                            <TooltipTrigger asChild>
                              <div className="flex flex-col items-center cursor-help">
                                <div
                                  className="w-12 h-12 rounded-lg border-2 border-white shadow-lg"
                                  style={{ backgroundColor: color }}
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

                  {/* Font Preview with User-Friendly Names */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">📝 Typography Style</Label>
                    <div className="space-y-3">
                      {Object.entries(activeTheme.data.fonts).map(([fontType, fontConfig]) => {
                        const fontInfo = FONT_TYPE_LABELS[fontType as keyof typeof FONT_TYPE_LABELS];
                        if (!fontInfo) return null;
                        
                        return (
                          <div key={fontType} className="flex items-center gap-3">
                            <span className="text-lg">{fontInfo.icon}</span>
                            <div style={{ fontFamily: fontConfig.family }}>
                              <span className="font-semibold">{fontInfo.label}:</span>
                              <span className="ml-2">{fontConfig.family.split(',')[0]}</span>
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
                Create New Look & Feel
              </CardTitle>
              <Button
                onClick={() => setIsCreatingTheme(!isCreatingTheme)}
                variant={isCreatingTheme ? "secondary" : "default"}
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreatingTheme ? "Cancel" : "Design New Look"}
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
                    <Label htmlFor="theme-name">Give Your Design a Name</Label>
                    <Input
                      id="theme-name"
                      value={newTheme.themeName}
                      onChange={(e) => setNewTheme(prev => ({ ...prev, themeName: e.target.value }))}
                      placeholder="e.g., Summer Vibes, Professional Blue, etc."
                    />
                  </div>

                  {/* Preset Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="flex items-center gap-2 mb-3">
                        🎨 Quick Color Themes
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-slate-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Choose a pre-made color scheme as your starting point</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <div className="grid grid-cols-1 gap-3">
                        {COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => setNewTheme(prev => ({ ...prev, colors: preset.colors }))}
                            className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex gap-1">
                                {Object.values(preset.colors).slice(0, 4).map((color, idx) => (
                                  <div
                                    key={idx}
                                    className="w-5 h-5 rounded"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                              <span className="font-medium">{preset.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-3">
                        📝 Font Combinations
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-slate-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Choose fonts that work well together</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <div className="grid grid-cols-1 gap-3">
                        {FONT_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => setNewTheme(prev => ({ ...prev, fonts: preset.fonts }))}
                            className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                          >
                            <div className="space-y-2">
                              <div className="font-semibold">{preset.name}</div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                <div style={{ fontFamily: preset.fonts.heading.family }}>
                                  Headlines: {preset.fonts.heading.family.split(',')[0]}
                                </div>
                                <div style={{ fontFamily: preset.fonts.body.family }}>
                                  Body text: {preset.fonts.body.family.split(',')[0]}
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
                    <button
                      onClick={() => toggleSection('colors')}
                      className="flex items-center justify-between w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        <span className="font-medium">🎨 Customize Colors</span>
                      </div>
                      {expandedSections.colors ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    
                    <AnimatePresence>
                      {expandedSections.colors && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                          {Object.entries(newTheme.colors).map(([key, value]) => {
                            const colorInfo = COLOR_LABELS[key as keyof typeof COLOR_LABELS];
                            if (!colorInfo) return null;
                            
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
                                    onChange={(e) => handleColorChange(key, e.target.value)}
                                    className="w-12 h-10 rounded border cursor-pointer"
                                  />
                                  <Input
                                    value={value || ""}
                                    onChange={(e) => handleColorChange(key, e.target.value)}
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
                      onClick={() => toggleSection('fonts')}
                      className="flex items-center justify-between w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Type className="h-5 w-5" />
                        <span className="font-medium">📝 Customize Fonts</span>
                      </div>
                      {expandedSections.fonts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    
                    <AnimatePresence>
                      {expandedSections.fonts && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 space-y-4"
                        >
                          {(['heading', 'body', 'accent'] as const).map((fontType) => {
                            const fontInfo = FONT_TYPE_LABELS[fontType];
                            
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
                                    <Label className="text-sm">Font Style</Label>
                                    <Select
                                      value={newTheme.fonts[fontType]?.family || ""}
                                      onValueChange={(value) => handleFontChange(fontType, 'family', value)}
                                    >
                                      <SelectTrigger className="text-sm">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {commonFonts.map((font) => (
                                          <SelectItem key={font.value} value={font.value}>
                                            <span style={{ fontFamily: font.value }}>{font.name}</span>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label className="text-sm">Font Thickness</Label>
                                    <Select
                                      value={newTheme.fonts[fontType]?.weight || ""}
                                      onValueChange={(value) => handleFontChange(fontType, 'weight', value)}
                                    >
                                      <SelectTrigger className="text-sm">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="300">Light & Thin</SelectItem>
                                        <SelectItem value="400">Normal</SelectItem>
                                        <SelectItem value="500">Medium</SelectItem>
                                        <SelectItem value="600">Semibold</SelectItem>
                                        <SelectItem value="700">Bold</SelectItem>
                                        <SelectItem value="800">Extra Bold</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label className="text-sm">Font Size</Label>
                                    <Select
                                      value={newTheme.fonts[fontType]?.size || ""}
                                      onValueChange={(value) => handleFontChange(fontType, 'size', value)}
                                    >
                                      <SelectTrigger className="text-sm">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="0.875rem">Small (14px)</SelectItem>
                                        <SelectItem value="1rem">Normal (16px)</SelectItem>
                                        <SelectItem value="1.125rem">Large (18px)</SelectItem>
                                        <SelectItem value="1.25rem">Extra Large (20px)</SelectItem>
                                        <SelectItem value="1.5rem">Huge (24px)</SelectItem>
                                        <SelectItem value="2rem">Massive (32px)</SelectItem>
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
                      {createTheme.isPending ? "Creating..." : "🎨 Create My Design"}
                    </Button>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Existing Themes */}
        {themes && themes.data && themes.data.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Saved Designs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {themes.data.map((theme: any) => {
                  const isEditing = editingThemes[theme._id];
                  const currentTheme = isEditing || theme;
                  
                  return (
                    <motion.div
                      key={theme._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`border rounded-lg p-6 ${theme.isActive ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-slate-200 dark:border-slate-700'} ${isEditing ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      {/* Theme Header */}
                      <div className="flex justify-between items-start mb-4">
                        {isEditing ? (
                          <Input
                            value={currentTheme.themeName}
                            onChange={(e) => updateEditingTheme(theme._id, 'themeName', e.target.value)}
                            className="text-xl font-semibold bg-transparent border-dashed"
                          />
                        ) : (
                          <h3 className="text-xl font-semibold">{theme.themeName}</h3>
                        )}
                        
                        <div className="flex items-center gap-2">
                          {theme.isActive && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Active
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
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => cancelEditingTheme(theme._id)}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditingTheme(theme)}
                            >
                              <Edit3 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Colors Section */}
                      <div className="mb-4">
                        <Label className="text-sm font-medium mb-3 block">🎨 Colors</Label>
                        {isEditing ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {Object.entries(currentTheme.colors).map(([key, value]) => {
                              const colorInfo = COLOR_LABELS[key as keyof typeof COLOR_LABELS];
                              if (!colorInfo) return null;
                              
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
                                      onChange={(e) => updateEditingThemeColor(theme._id, key, e.target.value)}
                                      className="w-8 h-8 rounded border cursor-pointer"
                                    />
                                    <Input
                                      value={value || ""}
                                      onChange={(e) => updateEditingThemeColor(theme._id, key, e.target.value)}
                                      className="flex-1 text-xs h-8"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-10 gap-2">
                            {Object.entries(theme.colors).map(([key, color]: [string, any], idx: number) => (
                              <Tooltip key={idx}>
                                <TooltipTrigger asChild>
                                  <div
                                    className="w-full h-8 rounded border cursor-help"
                                    style={{ backgroundColor: color }}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{COLOR_LABELS[key as keyof typeof COLOR_LABELS]?.label || key}</p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Fonts Section */}
                      <div className="mb-4">
                        <Label className="text-sm font-medium mb-3 block">📝 Typography</Label>
                        {isEditing ? (
                          <div className="space-y-3">
                            {(['heading', 'body', 'accent'] as const).map((fontType) => {
                              const fontInfo = FONT_TYPE_LABELS[fontType];
                              
                              return (
                                <div key={fontType} className="border rounded-lg p-3">
                                  <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <span>{fontInfo.icon}</span>
                                    {fontInfo.label}
                                  </Label>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <Select
                                      value={currentTheme.fonts[fontType]?.family || ""}
                                      onValueChange={(value) => updateEditingThemeFont(theme._id, fontType, 'family', value)}
                                    >
                                      <SelectTrigger className="text-xs">
                                        <SelectValue placeholder="Font" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {commonFonts.map((font) => (
                                          <SelectItem key={font.value} value={font.value}>
                                            <span style={{ fontFamily: font.value }}>{font.name}</span>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Select
                                      value={currentTheme.fonts[fontType]?.weight || ""}
                                      onValueChange={(value) => updateEditingThemeFont(theme._id, fontType, 'weight', value)}
                                    >
                                      <SelectTrigger className="text-xs">
                                        <SelectValue placeholder="Weight" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="300">Light</SelectItem>
                                        <SelectItem value="400">Normal</SelectItem>
                                        <SelectItem value="500">Medium</SelectItem>
                                        <SelectItem value="600">Semibold</SelectItem>
                                        <SelectItem value="700">Bold</SelectItem>
                                        <SelectItem value="800">Extra Bold</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Select
                                      value={currentTheme.fonts[fontType]?.size || ""}
                                      onValueChange={(value) => updateEditingThemeFont(theme._id, fontType, 'size', value)}
                                    >
                                      <SelectTrigger className="text-xs">
                                        <SelectValue placeholder="Size" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="0.875rem">Small</SelectItem>
                                        <SelectItem value="1rem">Normal</SelectItem>
                                        <SelectItem value="1.125rem">Large</SelectItem>
                                        <SelectItem value="1.25rem">X-Large</SelectItem>
                                        <SelectItem value="1.5rem">Huge</SelectItem>
                                        <SelectItem value="2rem">Massive</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                            <p>📰 {theme.fonts.heading.family.split(',')[0]}</p>
                            <p>📖 {theme.fonts.body.family.split(',')[0]}</p>
                            {theme.fonts.accent && (
                              <p>💬 {theme.fonts.accent.family.split(',')[0]}</p>
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
                              Use This
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cloneTheme.mutate({ id: theme._id, themeName: `${theme.themeName} Copy` })}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteTheme.mutate(theme._id)}
                            disabled={theme.isActive}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
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