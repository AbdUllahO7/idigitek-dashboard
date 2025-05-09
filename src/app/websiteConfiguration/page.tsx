"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Globe, LayoutGrid, Save, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Label } from "@/src/components/ui/label"
import { useLanguages } from "@/src/hooks/webConfiguration/use-language"
import { useSections } from "@/src/hooks/webConfiguration/use-section"
import { useToast } from "@/src/hooks/use-toast"
import { Language } from "@/src/api/types/hooks/language.types"
import { Section } from "@/src/api/types/hooks/section.types"

export default function ConfigurationPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [showSavedMessage, setShowSavedMessage] = useState(false)
  const [languagesList, setLanguagesList] = useState<Language[]>([])
  const [sectionsList, setSectionsList] = useState<Section[]>([])
  const router = useRouter()
  const { toast } = useToast()

  // Use custom hooks to fetch languages and sections
  const { 
    useGetAll: useGetAllLanguages, 
    useToggleActive: useToggleLanguageActive 
  } = useLanguages()
  
  const { 
    useGetAll: useGetAllSections, 
    useToggleActive: useToggleSectionActive 
  } = useSections()

  // Query data
  const languagesQuery = useGetAllLanguages()
  const sectionsQuery = useGetAllSections()

  // Mutations for toggling active state
  const toggleLanguageActiveMutation = useToggleLanguageActive()
  const toggleSectionActiveMutation = useToggleSectionActive()

  // Process API responses and update state
  useEffect(() => {
    if (languagesQuery.data) {
      console.log('Languages data:', languagesQuery.data);
      
      // Try to extract the languages data
      let languages: Language[] = [];
      
      if (Array.isArray(languagesQuery.data)) {
        languages = languagesQuery.data;
      } else if (languagesQuery.data && typeof languagesQuery.data === 'object') {
        // Check if there's a data property that's an array
        if (languagesQuery.data.data && Array.isArray(languagesQuery.data.data)) {
          languages = languagesQuery.data.data;
        }
      }
      
      setLanguagesList(languages);
    }
  }, [languagesQuery.data]);

  useEffect(() => {
    if (sectionsQuery.data) {
      console.log('Sections data:', sectionsQuery.data.data.data);
      
      // Try to extract the sections data
      let sections: Section[] = [];
      
      if (Array.isArray(sectionsQuery.data.data.data)) {
        sections = sectionsQuery.data.data.data;
      } else if (sectionsQuery.data.data .data&& typeof sectionsQuery.data.data.data === 'object') {
        // Check if there's a data property that's an array
        if (sectionsQuery.data.data && Array.isArray(sectionsQuery.data.data.data)) {
          sections = sectionsQuery.data.data.data;
        }
      }
      
      setSectionsList(sections);
    }
  }, [sectionsQuery.data]);

  // Handlers for toggling language and section active states
  const toggleLanguageActive = async (id: string, currentActive: boolean) => {
    try {
      await toggleLanguageActiveMutation.mutateAsync({
        id,
        isActive: !currentActive
      });
      
      // Update local state for immediate UI response
      setLanguagesList(prev => 
        prev.map(lang => 
          lang._id === id ? {...lang, isActive: !currentActive} : lang
        )
      );
      
      toast({
        title: "Language updated",
        description: `The language has been ${!currentActive ? "activated" : "deactivated"}.`,
      });
    } catch (error) {
      toast({
        title: "Error updating language",
        description: "There was a problem updating the language status.",
        variant: "destructive",
      });
      console.error("Error updating language:", error);
    }
  };

  const toggleSectionActive = async (id: string, currentActive: boolean) => {
    try {
      await toggleSectionActiveMutation.mutateAsync({
        id,
        isActive: !currentActive
      });
      
      // Update local state for immediate UI response
      setSectionsList(prev => 
        prev.map(section => 
          section._id === id ? {...section, isActive: !currentActive} : section
        )
      );
      
      toast({
        title: "Section updated",
        description: `The section has been ${!currentActive ? "activated" : "deactivated"}.`,
      });
    } catch (error) {
      toast({
        title: "Error updating section",
        description: "There was a problem updating the section status.",
        variant: "destructive",
      });
      console.error("Error updating section:", error);
    }
  };

  // Save configuration and proceed to dashboard
  const saveConfigurationAndProceed = () => {
    setIsSaving(true);
    
    try {
      // Check if any languages and sections are active
      const activeLanguages = languagesList.filter(lang => lang.isActive);
      const activeSections = sectionsList.filter(section => section.isActive);
      
      if (!activeLanguages?.length || !activeSections?.length) {
        toast({
          title: "Configuration required",
          description: "Please activate at least one language and one section.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
      
      // Show success message
      setShowSavedMessage(true);
      
      toast({
        title: "Configuration saved",
        description: "Your language and section preferences have been saved.",
      });
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      toast({
        title: "Error saving configuration",
        description: "There was a problem saving your preferences.",
        variant: "destructive",
      });
      console.error("Error saving configuration:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Just save the configuration without proceeding
  const saveConfiguration = () => {
    setIsSaving(true);
    
    try {
      // Check if configurations are properly set
      const activeLanguages = languagesList.filter(lang => lang.isActive);
      const activeSections = sectionsList.filter(section => section.isActive);
      
      if (!activeLanguages?.length || !activeSections?.length) {
        toast({
          title: "Configuration required",
          description: "Please activate at least one language and one section.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
      
      // Show success message
      setShowSavedMessage(true);
      setTimeout(() => setShowSavedMessage(false), 3000);
      
      toast({
        title: "Configuration saved",
        description: "Your language and section preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error saving configuration",
        description: "There was a problem saving your preferences.",
        variant: "destructive",
      });
      console.error("Error saving configuration:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading states
  const isLoading = languagesQuery.isLoading || sectionsQuery.isLoading;

  // Error handling
  if (languagesQuery.isError || sectionsQuery.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Error loading configuration</h2>
          <p className="mb-4 text-red-500">There was a problem loading the languages and sections.</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300 },
    },
  };

  // Check if user has made valid selections
  const activeLanguages = languagesList.filter(lang => lang.isActive);
  const activeSections = sectionsList.filter(section => section.isActive);
  const hasValidConfiguration = activeLanguages.length > 0 && activeSections.length > 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl md:text-5xl">
            Website Configuration
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Activate the languages and sections you want to include in your website.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-10 w-10 animate-spin text-slate-500" />
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-slate-50">
                  <Globe className="h-5 w-5 text-slate-700" />
                  Languages
                </CardTitle>
                <CardDescription className="dark:text-slate-400">
                  Select the languages your website will support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div
                  className="grid grid-cols-2 gap-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {languagesList.length > 0 ? (
                    languagesList.map((language) => (
                      <motion.div key={language._id} variants={itemVariants}>
                        <div
                          className={`
                            flex items-center space-x-2 rounded-lg border p-3 transition-all cursor-pointer
                            ${
                              language.isActive
                                ? "border-slate-800 bg-slate-50 dark:border-slate-200 dark:bg-slate-700 shadow-sm"
                                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                            }
                          `}
                          onClick={() => toggleLanguageActive(language._id!, language.isActive || false)}
                        >
                          <Checkbox
                            id={`language-${language._id}`}
                            checked={language.isActive || false}
                            onCheckedChange={() => toggleLanguageActive(language._id!, language.isActive || false)}
                            disabled={toggleLanguageActiveMutation.isPending}
                          />
                          <Label
                            htmlFor={`language-${language._id}`}
                            className="flex-1 cursor-pointer"
                          >
                            {language.language}
                          </Label>
                          {language.isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 15 }}
                            >
                              <Check className="h-4 w-4 text-slate-700 dark:text-slate-200" />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-2 p-4 text-center text-slate-500">
                      No languages available.
                    </div>
                  )}
                </motion.div>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-slate-500">
                  {activeLanguages.length === 0 ? (
                    <span className="text-rose-500">Please activate at least one language</span>
                  ) : (
                    `${activeLanguages.length} languages activated`
                  )}
                </div>
              </CardFooter>
            </Card>

            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-slate-50">
                  <LayoutGrid className="h-5 w-5 text-slate-700" />
                  Sections
                </CardTitle>
                <CardDescription className="dark:text-slate-400">
                  Choose which sections to include in your website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div
                  className="grid grid-cols-2 gap-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {sectionsList.length > 0 ? (
                    sectionsList.map((section) => (
                      <motion.div key={section._id} variants={itemVariants}>
                        <div
                          className={`
                            flex items-center space-x-2 rounded-lg border p-3 cursor-pointer transition-all
                            ${
                              section.isActive
                                ? "border-slate-800 bg-slate-50 dark:border-slate-200 dark:bg-slate-700 shadow-sm"
                                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                            }
                          `}
                          onClick={() => toggleSectionActive(section._id!, section.isActive || false)}
                        >
                          <Checkbox
                            id={`section-${section._id}`}
                            checked={section.isActive || false}
                            onCheckedChange={() => toggleSectionActive(section._id!, section.isActive || false)}
                            disabled={toggleSectionActiveMutation.isPending}
                          />
                          <Label htmlFor={`section-${section._id}`} className="flex-1 cursor-pointer">
                            {section.name}
                          </Label>
                          {section.isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 15 }}
                            >
                              <Check className="h-4 w-4 text-slate-700" />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-2 p-4 text-center text-slate-500">
                      No sections available.
                    </div>
                  )}
                </motion.div>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-slate-500">
                  {activeSections.length === 0 ? (
                    <span className="text-rose-500">Please activate at least one section</span>
                  ) : (
                    `${activeSections.length} sections activated`
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700"
        >
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">Active Configuration</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Active Languages:</h3>
              {activeLanguages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {activeLanguages.map((language) => (
                    <motion.span
                      key={language._id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-sm font-medium text-slate-800 dark:text-slate-200"
                    >
                      {language.language}
                    </motion.span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No languages activated</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Active Sections:</h3>
              {activeSections.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {activeSections.map((section) => (
                    <motion.span
                      key={section._id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-sm font-medium text-slate-800 dark:text-slate-200"
                    >
                      {section.name}
                    </motion.span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No sections activated</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-end items-center gap-4">
            <AnimatePresence>
              {showSavedMessage && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="text-sm text-emerald-600 font-medium"
                >
                  Configuration saved!
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              <Button
                onClick={saveConfiguration}
                disabled={isSaving || !hasValidConfiguration}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <div className="h-4 w-4 border-2 border-t-transparent border-slate-800 rounded-full animate-spin"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </Button>

              <Button
                onClick={saveConfigurationAndProceed}
                disabled={isSaving || !hasValidConfiguration}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Continue to Dashboard
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          <p>This configuration will be used to generate your website with your preferred languages and sections.</p>
          <p className="mt-1">Your selections are stored in the database and will persist across devices.</p>
        </div>
      </div>
    </main>
  )
}