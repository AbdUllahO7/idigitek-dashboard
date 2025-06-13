"use client"

import { ThemeManagementProps } from "@/src/api/types/management/ThemeManagement.type"
import { TooltipProvider } from "@/src/components/ui/tooltip"
import { useThemeManagement } from "@/src/hooks/Management/ThemeManagement/useThemeManagement"
import { NoWebsite, ThemeLoading } from "./ThemeLoading"
import { WebsiteSelection } from "./WebsiteSelection"
import { ActiveThemeDisplay } from "./ActiveThemeDisplay"
import { ThemeCreationCard } from "./ThemeCreationCard"
import { ExistingThemes } from "./ExistingThemes"

// Import all the extracted components


export function ThemeManagement({ hasWebsite, websites }: ThemeManagementProps) {
  const {
    // State
    selectedWebsiteId,
    isCreatingTheme,
    editingThemes,
    extractingColors,
    extractedPalette,
    extractionError,
    expandedSections,
    colorMode,
    newTheme,

    // Data
    themes,
    activeTheme,
    themesLoading,
    activeThemeLoading,

    // Mutations
    createTheme,
    setActiveTheme,
    deleteTheme,
    cloneTheme,
    updateTheme,

    // Setters
    setSelectedWebsiteId,
    setIsCreatingTheme,
    setColorMode,
    setNewTheme,

    // Handlers
    handleCreateTheme,
    handleSetActive,
    handleColorChange,
    handleFontChange,
    handleExtractColorsFromLogo,
    handleApplyExtractedColors,
    toggleSection,
    startEditingTheme,
    cancelEditingTheme,
    updateEditingTheme,
    updateEditingThemeColor,
    updateEditingThemeFont,
    saveEditingTheme,

    // Utils
    t
  } = useThemeManagement(websites)

  // Show no website state
  if (!hasWebsite) {
    return <NoWebsite t={t} />
  }

  // Show loading state
  if (themesLoading || activeThemeLoading) {
    return <ThemeLoading t={t} />
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Website Selection */}
        <WebsiteSelection
          websites={websites}
          selectedWebsiteId={selectedWebsiteId}
          onWebsiteChange={setSelectedWebsiteId}
          t={t}
        />

        {/* Active Theme Display */}
        {activeTheme && (
          <ActiveThemeDisplay
            activeTheme={activeTheme}
            t={t}
          />
        )}

        {/* Theme Creation */}
        <ThemeCreationCard
          websites={websites}
          selectedWebsiteId={selectedWebsiteId}
          isCreatingTheme={isCreatingTheme}
          newTheme={newTheme}
          colorMode={colorMode}
          expandedSections={expandedSections}
          extractingColors={extractingColors}
          extractedPalette={extractedPalette}
          extractionError={extractionError}
          isLoading={createTheme.isPending}
          onToggleCreating={() => setIsCreatingTheme(!isCreatingTheme)}
          onThemeNameChange={(name) => setNewTheme(prev => ({ ...prev, themeName: name }))}
          onPresetColorSelect={(colors) => setNewTheme(prev => ({ ...prev, colors }))}
          onPresetFontSelect={(fonts) => setNewTheme(prev => ({ ...prev, fonts }))}
          onToggleSection={toggleSection}
          onColorModeChange={setColorMode}
          onColorChange={handleColorChange}
          onFontChange={handleFontChange}
          onExtractColors={handleExtractColorsFromLogo}
          onApplyExtractedColors={handleApplyExtractedColors}
          onCreateTheme={handleCreateTheme}
          t={t}
        />

        {/* Existing Themes */}
        <ExistingThemes
          themes={themes}
          editingThemes={editingThemes}
          onSetActive={handleSetActive}
          onStartEditing={startEditingTheme}
          onCancelEditing={cancelEditingTheme}
          onSaveEditing={saveEditingTheme}
          onUpdateEditingTheme={updateEditingTheme}
          onUpdateEditingThemeColor={updateEditingThemeColor}
          onUpdateEditingThemeFont={updateEditingThemeFont}
          onClone={(themeId, themeName) => cloneTheme.mutate({ id: themeId, themeName })}
          onDelete={(themeId) => deleteTheme.mutate(themeId)}
          isSetActiveLoading={setActiveTheme.isPending}
          isUpdateLoading={updateTheme.isPending}
          t={t}
        />
      </div>
    </TooltipProvider>
  )
}