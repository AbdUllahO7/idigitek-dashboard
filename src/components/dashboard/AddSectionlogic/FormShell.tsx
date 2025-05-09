// FormShell.tsx
"use client"

import { JSX, ReactNode } from "react"
import { TabLayout } from "./TabLayout"
import { FormContextProvider, useFormContext } from "./FormContextProvider"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Globe, Layout, Sparkles, ListChecks, ArrowRight, HelpCircle, Save, Loader2 } from "lucide-react"
import { Language } from "@/src/api/types/hooks/language.types"

// Define the tab configuration
interface TabConfig {
  id: string
  label: string
  icon: JSX.Element
  component: ReactNode
}

interface FormShellProps {
  title: string
  subtitle: string
  backUrl: string
  activeLanguages: Language[]
  serviceData?: any
  sectionId: string | null
  sectionItemId: string | null
  mode: string
  onSave?: (data: any) => Promise<any>
  tabs: TabConfig[]
  formSections: string[]
  isLoading?: boolean
}

// Default tab icons
const defaultTabIcons: Record<string, JSX.Element> = {
  hero: <Layout className="h-4 w-4" />,
  benefits: <Sparkles className="h-4 w-4" />,
  features: <ListChecks className="h-4 w-4" />,
  process: <ArrowRight className="h-4 w-4" />,
  faq: <HelpCircle className="h-4 w-4" />,
}

// Inner component that uses the form context
function FormShellInner({ tabs, title, subtitle, isLoading = false }: Pick<FormShellProps, "tabs" | "title" | "subtitle" | "backUrl" | "isLoading">) {
  const {
    saveAllData,
    showLeaveConfirmation,
    setShowLeaveConfirmation,
    navigateBack,
    isSubmitting,
    activeLanguages,
    progress,
  } = useFormContext()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  // If no languages available, show message
  if (activeLanguages.length === 0) {
    return (
      <div className="container py-10">
        <Card className="shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
          <CardContent className="p-6">
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No active languages found. Please activate at least one language in settings.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Format tabs for TabLayout
  const formattedTabs = tabs.map(tab => ({
    id: tab.id,
    label: tab.label,
    icon: tab.icon || defaultTabIcons[tab.id] || <Globe className="h-4 w-4" />,
    content: tab.component
  }))

  return (
    <>
      {/* Language status card */}
      <div className="container py-6">
        <Card className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  <h2 className="text-lg font-medium">Languages</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Completion:</span>
                  <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{Math.round(progress)}%</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeLanguages.map((lang: Language) => (
                  <div
                    key={lang.languageID}
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    {lang.language}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <TabLayout
        tabs={formattedTabs}
        title={title}
        subtitle={subtitle}
        onSave={saveAllData}
        onBack={navigateBack}
        isSubmitting={isSubmitting}
        saveButtonLabel={isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-5 w-5" />
            {title.toLowerCase().includes("create") ? "Create" : "Update"}
          </>
        )}
      />

    

      {/* Leave confirmation dialog */}
      <Dialog open={showLeaveConfirmation} onOpenChange={setShowLeaveConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to leave this page? All unsaved changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setShowLeaveConfirmation(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                setShowLeaveConfirmation(false)
                navigateBack()
              }}
            >
              Leave Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Main FormShell component with context provider
export function FormShell(props: FormShellProps) {
  const { tabs, formSections, activeLanguages, serviceData, sectionId, sectionItemId, mode, onSave, backUrl } = props

  return (
    <FormContextProvider
      initialFormSections={formSections}
      activeLanguages={activeLanguages}
      serviceData={serviceData}
      sectionId={sectionId}
      sectionItemId={sectionItemId}
      mode={mode}
      backUrl={backUrl}
      onSave={onSave}
    >
      <FormShellInner {...props} />
    </FormContextProvider>
  )
}