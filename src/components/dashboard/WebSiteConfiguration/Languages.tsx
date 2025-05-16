"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/src/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog"
import { useLanguages } from "@/src/hooks/webConfiguration/use-language"
import type { Language } from "@/src/api/types/hooks/language.types"
import { useEffect, useState } from "react"
import type { DeleteItemData, EditItemData } from "@/src/api/types/hooks/Common.types"
import { useToast } from "@/src/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertTriangle,
  Check,
  Edit,
  Globe,
  Loader2,
  Plus,
  Save,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Search,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  Flag,
  Languages,
  HelpCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card"
import { Label } from "../../ui/label"
import { Input } from "../../ui/input"
import { Checkbox } from "../../ui/checkbox"
import { Button } from "../../ui/button"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import { Badge } from "../../ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip"
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs"

interface ManagementProps {
  hasWebsite: boolean
}

export function LanguageManagement({ hasWebsite }: ManagementProps) {
  const { websiteId } = useWebsiteContext()

  const {
    useGetByWebsite,
    useCreate: useCreateLanguage,
    useUpdate: useUpdateLanguage,
    useDelete: useDeleteLanguage,
    useToggleActive: useToggleLanguageActive,
  } = useLanguages()

  const {
    data: languages,
    isLoading: isLoadingLanguages,
    error: languagesError,
    refetch: refetchLanguages,
  } = useGetByWebsite(websiteId)

  const createLanguageMutation = useCreateLanguage()
  const updateLanguageMutation = useUpdateLanguage()
  const deleteLanguageMutation = useDeleteLanguage()
  const toggleLanguageActiveMutation = useToggleLanguageActive()

  const [newLanguage, setNewLanguage] = useState<Language>({
    _id: "",
    languageID: "",
    language: "",
    subSections: [],
    isActive: true,
    websiteId: "",
  })

  // Update newLanguage when websiteId changes
  useEffect(() => {
    if (websiteId) {
      setNewLanguage((prev) => ({
        ...prev,
        websiteId,
      }))
    }
  }, [websiteId])

  const [editItem, setEditItem] = useState<EditItemData | null>(null)
  const [itemToDelete, setItemToDelete] = useState<DeleteItemData | null>(null)
  const { toast } = useToast()
  const [showSavedSuccess, setShowSavedSuccess] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [expandedInfo, setExpandedInfo] = useState(false)

  useEffect(() => {
    if (
      createLanguageMutation.isSuccess ||
      updateLanguageMutation.isSuccess ||
      deleteLanguageMutation.isSuccess ||
      toggleLanguageActiveMutation.isSuccess
    ) {
      refetchLanguages()
    }
  }, [
    createLanguageMutation.isSuccess,
    updateLanguageMutation.isSuccess,
    deleteLanguageMutation.isSuccess,
    toggleLanguageActiveMutation.isSuccess,
    refetchLanguages,
  ])

  const handleAddLanguage = () => {
    if (!newLanguage.languageID || !newLanguage.language) {
      toast({
        title: "Invalid input",
        description: "Please enter both ID and name for the language.",
        variant: "destructive",
      })
      return
    }

    if (!websiteId) {
      toast({
        title: "Website required",
        description: "Please select a website first.",
        variant: "destructive",
      })
      return
    }

    if (languageArray?.some((lang: Language) => lang.languageID === newLanguage.languageID)) {
      toast({
        title: "Duplicate ID",
        description: "A language with this ID already exists for this website.",
        variant: "destructive",
      })
      return
    }

    // Create language with websiteId
    const languageToCreate = {
      ...newLanguage,
      websiteId,
    }

    createLanguageMutation.mutate(languageToCreate, {
      onSuccess: () => {
        setNewLanguage({
          _id: "",
          languageID: "",
          language: "",
          subSections: [],
          isActive: true,
          websiteId,
        })
        toast({
          title: "Language added",
          description: `${newLanguage.language} has been added successfully.`,
        })
        showSuccessMessage()
      },
      onError: (error: Error) => {
        toast({
          title: "Error adding language",
          description: error.message || "An error occurred while adding the language.",
          variant: "destructive",
        })
      },
    })
  }

  const handleEdit = (language: Language) => {
    setEditItem({
      _id: language._id,
      languageID: language.languageID,
      language: language.language,
      isActive: language.isActive,
      type: "language",
      websiteId: language.websiteId,
    })
  }

  const handleToggleActive = (id: string, isActive: boolean) => {
    toggleLanguageActiveMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({
            title: `Language ${!isActive ? "activated" : "deactivated"}`,
            description: `The language has been ${!isActive ? "activated" : "deactivated"} successfully.`,
          })
        },
        onError: (error: Error) => {
          toast({
            title: "Error updating language",
            description: error.message || "An error occurred while updating the language status.",
            variant: "destructive",
          })
        },
      },
    )
  }

  const handleSaveEdit = () => {
    if (!editItem || !editItem._id || editItem.type !== "language") {
      toast({
        title: "Invalid input",
        description: "Missing required fields for update.",
        variant: "destructive",
      })
      return
    }

    if (!editItem.languageID || !editItem.language) {
      toast({
        title: "Invalid input",
        description: "Please enter both ID and name for the language.",
        variant: "destructive",
      })
      return
    }

    const originalItem = languageArray.find((item: Language) => item._id === editItem._id)
    if (
      originalItem &&
      editItem.languageID !== originalItem.languageID &&
      languageArray.some((item: Language) => item.languageID === editItem.languageID)
    ) {
      toast({
        title: "Duplicate ID",
        description: "A language with this ID already exists for this website.",
        variant: "destructive",
      })
      return
    }

    const updateData = {
      id: editItem._id,
      data: {
        languageID: editItem.languageID,
        language: editItem.language,
        isActive: editItem.isActive,
        // Keep the same websiteId
        websiteId: editItem.websiteId,
      },
    }

    updateLanguageMutation.mutate(updateData, {
      onSuccess: () => {
        setEditItem(null)
        toast({
          title: "Language updated",
          description: "The language has been updated successfully.",
        })
        showSuccessMessage()
      },
      onError: (error: Error) => {
        toast({
          title: "Error updating language",
          description: error.message || "An error occurred while updating the language.",
          variant: "destructive",
        })
      },
    })
  }

  const confirmDelete = () => {
    if (itemToDelete && itemToDelete._id && itemToDelete.type === "language") {
      deleteLanguageMutation.mutate(itemToDelete._id, {
        onSuccess: () => {
          toast({
            title: "Language deleted",
            description: `The language has been deleted successfully.`,
          })
          setItemToDelete(null)
          showSuccessMessage()
        },
        onError: (error: Error) => {
          toast({
            title: "Error deleting language",
            description: error.message || "An error occurred while deleting the language.",
            variant: "destructive",
          })
        },
      })
    }
  }

  const showSuccessMessage = () => {
    setShowSavedSuccess(true)
    setTimeout(() => {
      setShowSavedSuccess(false)
    }, 3000)
  }

  const languageArray = languages?.data || []

  // Filter languages based on search query and active tab
  const filteredLanguages = languageArray.filter((language: Language) => {
    const matchesSearch =
      language.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      language.languageID.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "active") return matchesSearch && language.isActive
    if (activeTab === "inactive") return matchesSearch && !language.isActive

    return matchesSearch
  })

  // Display a message if no website is selected
  const noWebsiteSelected = !websiteId || websiteId === ""

  // Common language codes for quick selection
  const commonLanguages = [
    { id: "en", name: "English" },
    { id: "es", name: "Spanish" },
    { id: "fr", name: "French" },
    { id: "de", name: "German" },
    { id: "it", name: "Italian" },
    { id: "pt", name: "Portuguese" },
    { id: "zh", name: "Chinese" },
    { id: "ja", name: "Japanese" },
    { id: "ar", name: "Arabic" },
    { id: "ru", name: "Russian" },
  ]

  if (isLoadingLanguages)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <div className="absolute inset-0 rounded-full animate-ping opacity-30 bg-purple-400 blur-sm"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading languages...</p>
        </div>
      </div>
    )

  if (languagesError)
    return (
      <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-full inline-flex">
          <X className="h-8 w-8 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">Error Loading Languages</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {(languagesError as Error).message || "An unexpected error occurred"}
        </p>
        <button
          onClick={() => refetchLanguages()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 15 },
    },
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <AnimatePresence>
        {showSavedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg shadow-md flex items-center gap-2"
          >
            <Check className="h-5 w-5" />
            <span>Changes saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="overflow-hidden border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
          <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/30">
              <Languages className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            Add New Language
          </CardTitle>
          <CardDescription>Enter the details for a new language to support on your website</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {!hasWebsite || noWebsiteSelected ? (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 text-amber-800 dark:text-amber-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Website Required</p>
                <p className="text-sm mt-1">
                  {!hasWebsite
                    ? "Please create a website first before adding languages."
                    : "Please select a website before adding languages."}
                </p>
              </div>
            </div>
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-language-id" className="flex items-center justify-between">
                <span>Language ID (code)</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <HelpCircle className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Use a standard ISO language code (e.g., "en" for English, "fr" for French)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Flag className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="new-language-id"
                  placeholder="e.g. en, fr, es"
                  value={newLanguage.languageID}
                  onChange={(e) => setNewLanguage({ ...newLanguage, languageID: e.target.value.toLowerCase() })}
                  className="w-full pl-10"
                  disabled={!hasWebsite || noWebsiteSelected}
                />
              </div>
              <p className="text-xs text-slate-500">Use a standard language code (e.g., "en" for English)</p>

              {/* Quick language selection */}
              {hasWebsite && !noWebsiteSelected && (
                <div className="mt-2">
                  <Label className="text-xs mb-1 block">Quick Select</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {commonLanguages.map((lang) => (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() =>
                          setNewLanguage({
                            ...newLanguage,
                            languageID: lang.id,
                            language: lang.name,
                          })
                        }
                        className="text-xs px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                      >
                        {lang.id}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-language-name">Language Name</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Globe className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="new-language-name"
                  placeholder="e.g. English, French"
                  value={newLanguage.language}
                  onChange={(e) => setNewLanguage({ ...newLanguage, language: e.target.value })}
                  className="w-full pl-10"
                  disabled={!hasWebsite || noWebsiteSelected}
                />
              </div>
              <div className="mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-language-active"
                    checked={newLanguage.isActive || false}
                    onCheckedChange={(checked) => setNewLanguage({ ...newLanguage, isActive: checked === true })}
                    disabled={!hasWebsite || noWebsiteSelected}
                  />
                  <Label htmlFor="new-language-active">Set as active language</Label>
                </div>
                <p className="text-xs text-slate-500 mt-1 ml-6">
                  Active languages will be available for content creation
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
          <Button
            variant="outline"
            onClick={() =>
              setNewLanguage({
                _id: "",
                languageID: "",
                language: "",
                subSections: [],
                isActive: true,
                websiteId: websiteId || "",
              })
            }
            disabled={!hasWebsite || noWebsiteSelected}
            className="text-slate-600 dark:text-slate-300"
          >
            Reset Form
          </Button>
          <Button
            onClick={handleAddLanguage}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            disabled={createLanguageMutation.isPending || !hasWebsite || noWebsiteSelected}
          >
            {createLanguageMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Language
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className="overflow-hidden border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <div className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30">
                  <Globe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                Manage Languages
              </CardTitle>
              <CardDescription>
                {websiteId
                  ? `Edit or remove existing languages (${languageArray.length} total)`
                  : "Select a website to manage its languages"}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
              onClick={() => setExpandedInfo(!expandedInfo)}
            >
              <Info className="h-4 w-4" />
              <span>Help</span>
              {expandedInfo ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </Button>
          </div>

          <AnimatePresence>
            {expandedInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Language Management Tips
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Use standard ISO language codes (e.g., "en" for English)</li>
                    <li>Active languages will be available for content creation</li>
                    <li>You can toggle language status without editing the language</li>
                    <li>Deleting a language will remove all content in that language</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>

        <CardContent className="pt-6">
          {noWebsiteSelected ? (
            <div className="text-center py-8 text-slate-500">
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-full inline-flex mb-4">
                <AlertTriangle className="h-8 w-8 text-amber-500 dark:text-amber-400" />
              </div>
              <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No Website Selected</p>
              <p className="max-w-md mx-auto">Please select a website to view and manage its languages.</p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    placeholder="Search languages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                  <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                    <TabsTrigger value="all" className="text-xs px-3">
                      All ({languageArray.length})
                    </TabsTrigger>
                    <TabsTrigger value="active" className="text-xs px-3">
                      Active ({languageArray.filter((l: Language) => l.isActive).length})
                    </TabsTrigger>
                    <TabsTrigger value="inactive" className="text-xs px-3">
                      Inactive ({languageArray.filter((l: Language) => !l.isActive).length})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {filteredLanguages.length > 0 ? (
                <motion.div
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredLanguages.map((language: Language) => (
                    <motion.div key={language._id || `lang-${language.languageID}`} variants={itemVariants}>
                      <Card className="border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow overflow-hidden">
                        <CardContent className="p-0">
                          <div
                            className={`h-1.5 w-full ${
                              language.isActive
                                ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                : "bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-600"
                            }`}
                          ></div>
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-slate-800 dark:text-slate-200">{language.language}</p>
                                  <Badge
                                    variant="outline"
                                    className="text-xs font-normal bg-slate-50 dark:bg-slate-800"
                                  >
                                    {language.languageID}
                                  </Badge>
                                </div>
                                <div className="mt-2">
                                  <Badge
                                    className={`${
                                      language.isActive
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/40"
                                        : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    } border-0`}
                                  >
                                    {language.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-8 w-8 ${
                                          language.isActive
                                            ? "text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
                                            : "text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-800"
                                        }`}
                                        onClick={() =>
                                          handleToggleActive(language._id as string, language.isActive || false)
                                        }
                                        disabled={toggleLanguageActiveMutation.isPending || !hasWebsite}
                                      >
                                        {language.isActive ? (
                                          <ToggleRight className="h-5 w-5" />
                                        ) : (
                                          <ToggleLeft className="h-5 w-5" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{language.isActive ? "Deactivate" : "Activate"} language</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <Dialog>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-900/20"
                                            onClick={() => handleEdit(language)}
                                            disabled={!hasWebsite}
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                        </DialogTrigger>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Edit language</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>Edit Language</DialogTitle>
                                      <DialogDescription>Make changes to the language details below.</DialogDescription>
                                    </DialogHeader>
                                    {editItem && editItem.type === "language" && (
                                      <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="edit-language-id">Language ID</Label>
                                          <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                              <Flag className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <Input
                                              id="edit-language-id"
                                              value={editItem.languageID}
                                              onChange={(e) =>
                                                setEditItem({ ...editItem, languageID: e.target.value.toLowerCase() })
                                              }
                                              className="pl-10"
                                            />
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="edit-language-name">Language Name</Label>
                                          <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                              <Globe className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <Input
                                              id="edit-language-name"
                                              value={editItem.language}
                                              onChange={(e) => setEditItem({ ...editItem, language: e.target.value })}
                                              className="pl-10"
                                            />
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Checkbox
                                            id="edit-language-active"
                                            checked={editItem.isActive || false}
                                            onCheckedChange={(checked) =>
                                              setEditItem({ ...editItem, isActive: checked === true })
                                            }
                                          />
                                          <Label htmlFor="edit-language-active">Active</Label>
                                        </div>
                                      </div>
                                    )}
                                    <DialogFooter className="sm:justify-between">
                                      <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                      </DialogClose>
                                      <DialogClose asChild>
                                        <Button
                                          onClick={handleSaveEdit}
                                          disabled={updateLanguageMutation.isPending}
                                          className="bg-indigo-600 hover:bg-indigo-700"
                                        >
                                          {updateLanguageMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          ) : (
                                            <Save className="h-4 w-4 mr-2" />
                                          )}
                                          Save Changes
                                        </Button>
                                      </DialogClose>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>

                                <AlertDialog>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                            onClick={() => setItemToDelete({ ...language, type: "language" })}
                                            disabled={!hasWebsite}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </AlertDialogTrigger>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Delete language</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Language</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        <p className="mb-2">
                                          Are you sure you want to delete "{language.language}"? This action cannot be
                                          undone.
                                        </p>
                                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-md text-amber-800 dark:text-amber-200 text-sm mt-2">
                                          <p className="font-medium flex items-center gap-1.5">
                                            <AlertTriangle className="h-4 w-4" />
                                            Warning
                                          </p>
                                          <p className="mt-1">
                                            Deleting this language will remove all content associated with it.
                                          </p>
                                        </div>
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={confirmDelete}
                                        className="bg-red-500 hover:bg-red-600"
                                        disabled={deleteLanguageMutation.isPending}
                                      >
                                        {deleteLanguageMutation.isPending ? (
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : null}
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  {searchQuery ? (
                    <>
                      <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full inline-flex mb-4">
                        <Search className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                      </div>
                      <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No Results Found</p>
                      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        No languages match your search "{searchQuery}". Try a different search term.
                      </p>
                      <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                        Clear Search
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-full inline-flex mb-4">
                        <Languages className="h-6 w-6 text-purple-500 dark:text-purple-400" />
                      </div>
                      <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No Languages Found</p>
                      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        This website doesn't have any languages yet. Add your first language using the form above.
                      </p>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
