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
  Sparkles,
  Zap,
  Star,
  Settings,
  RefreshCw
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
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/src/context/LanguageContext"
import { cn } from "@/src/lib/utils"

interface ManagementProps {
  hasWebsite: boolean
}

export function LanguageManagement({ hasWebsite }: ManagementProps) {
  const { websiteId } = useWebsiteContext()
  const { t } = useTranslation()
  const { language } = useLanguage()
  const isRTL = language === 'ar'

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
        title: t('languageManagement.validation.invalidInput', 'Invalid Input'),
        description: t('languageManagement.validation.missingFields', 'Please fill in all required fields'),
        variant: "destructive",
      })
      return
    }

    if (!websiteId) {
      toast({
        title: t('languageManagement.validation.websiteRequired', 'Website Required'),
        description: t('languageManagement.validation.selectWebsite', 'Please select a website'),
        variant: "destructive",
      })
      return
    }

    if (languageArray?.some((lang: Language) => lang.languageID === newLanguage.languageID)) {
      toast({
        title: t('languageManagement.validation.duplicateId', 'Duplicate Language ID'),
        description: t('languageManagement.validation.duplicateIdDescription', 'This language ID already exists'),
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
          title: t('languageManagement.toastMessages.languageAdded', 'Language Added'),
          description: t('languageManagement.toastMessages.languageAddedDesc', `${newLanguage.language} has been added successfully`),
        })
        showSuccessMessage()
      },
      onError: (error: Error) => {
        toast({
          title: t('languageManagement.toastMessages.errorAdding', 'Error Adding Language'),
          description: error.message || t('languageManagement.toastMessages.errorGenericDesc', 'An error occurred'),
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
            title: !isActive 
              ? t('languageManagement.toastMessages.languageActivated', 'Language Activated')
              : t('languageManagement.toastMessages.languageDeactivated', 'Language Deactivated'),
            description: !isActive
              ? t('languageManagement.toastMessages.languageActivatedDesc', 'Language is now active')
              : t('languageManagement.toastMessages.languageDeactivatedDesc', 'Language is now inactive'),
          })
          showSuccessMessage()
        },
        onError: (error: Error) => {
          toast({
            title: t('languageManagement.toastMessages.errorTogglingStatus', 'Error Toggling Status'),
            description: error.message || t('languageManagement.toastMessages.errorGenericDesc', 'An error occurred'),
            variant: "destructive",
          })
        },
      },
    )
  }

  const handleSaveEdit = () => {
    if (!editItem || !editItem._id || editItem.type !== "language") {
      toast({
        title: t('languageManagement.validation.invalidInput', 'Invalid Input'),
        description: t('languageManagement.validation.missingFieldsUpdate', 'Missing fields for update'),
        variant: "destructive",
      })
      return
    }

    if (!editItem.languageID || !editItem.language) {
      toast({
        title: t('languageManagement.validation.invalidInput', 'Invalid Input'),
        description: t('languageManagement.validation.missingFields', 'Please fill in all required fields'),
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
        title: t('languageManagement.validation.duplicateId', 'Duplicate Language ID'),
        description: t('languageManagement.validation.duplicateIdDescription', 'This language ID already exists'),
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
        websiteId: editItem.websiteId,
      },
    }

    updateLanguageMutation.mutate(updateData, {
      onSuccess: () => {
        setEditItem(null)
        toast({
          title: t('languageManagement.toastMessages.languageUpdated', 'Language Updated'),
          description: t('languageManagement.toastMessages.languageUpdatedDesc', 'Language has been updated successfully'),
        })
        showSuccessMessage()
      },
      onError: (error: Error) => {
        toast({
          title: t('languageManagement.toastMessages.errorUpdating', 'Error Updating Language'),
          description: error.message || t('languageManagement.toastMessages.errorGenericDesc', 'An error occurred'),
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
            title: t('languageManagement.toastMessages.languageDeleted', 'Language Deleted'),
            description: t('languageManagement.toastMessages.languageDeletedDesc', 'Language has been deleted successfully'),
          })
          setItemToDelete(null)
          showSuccessMessage()
        },
        onError: (error: Error) => {
          toast({
            title: t('languageManagement.toastMessages.errorDeleting', 'Error Deleting Language'),
            description: error.message || t('languageManagement.toastMessages.errorGenericDesc', 'An error occurred'),
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

  // Get common languages from translation
  const commonLanguages = [
    { id: 'en', name: 'English' },
    { id: 'ar', name: 'العربية' },
    { id: 'es', name: 'Español' },
    { id: 'fr', name: 'Français' },
    { id: 'de', name: 'Deutsch' },
    { id: 'zh', name: '中文' },
    { id: 'ja', name: '日本語' },
    { id: 'ko', name: '한국어' }
  ]

  // Modern Loading Component
  const ModernLoader = () => (
    <div className="min-h-[400px] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 rounded-3xl" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center gap-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/50 shadow-xl"
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-xl">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 blur-xl opacity-50 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
            Loading Languages
          </h3>
          <p className="text-slate-600 dark:text-slate-400">Fetching language configuration...</p>
        </div>
      </motion.div>
    </div>
  )

  // Modern Error Component
  const ModernError = () => (
    <div className="min-h-[400px] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-slate-950 dark:via-red-950 dark:to-orange-950 rounded-3xl" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center gap-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/50 shadow-xl"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-xl">
          <X className="h-8 w-8 text-white" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-red-600 dark:text-red-400">
            Error Loading Languages
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {(languagesError as Error)?.message || 'Failed to fetch languages'}
          </p>
        </div>
        <Button onClick={() => refetchLanguages()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </motion.div>
    </div>
  )

  if (isLoadingLanguages) return <ModernLoader />
  if (languagesError) return <ModernError />

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 dark:from-slate-950 dark:via-purple-950/30 dark:to-blue-950/30">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-pink-400/10 dark:bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 p-6">
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible" 
          className={`max-w-7xl mx-auto space-y-8 ${isRTL ? 'rtl' : ''}`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Success Toast */}
          <AnimatePresence>
            {showSavedSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  "fixed top-4 z-50 bg-green-50 dark:bg-green-900/60 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-sm",
                  isRTL ? "left-4 flex-row-reverse" : "right-4"
                )}
              >
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">{t('languageManagement.changesSaved', 'Changes saved successfully!')}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 dark:from-purple-400/10 dark:to-blue-400/10 rounded-3xl blur-3xl" />
            <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-8 shadow-2xl">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl">
                    <Globe className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 blur-xl opacity-50 animate-pulse" />
                </div>
              </div>
              
              <div className="text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent mb-4">
                  {t('languageManagement.title', 'Language Management')}
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  {t('languageManagement.subtitle', 'Configure and manage multilingual support for your website')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Add New Language Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="overflow-hidden border-none shadow-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {t('languageManagement.addNew.title', 'Add New Language')}
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      {t('languageManagement.addNew.description', 'Configure a new language for your website')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8">
                {!hasWebsite || noWebsiteSelected ? (
                  <div className={cn(
                    "mb-6 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 rounded-2xl flex items-start gap-4",
                    isRTL ? "flex-row-reverse" : ""
                  )}>
                    <AlertTriangle className="h-6 w-6 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-lg mb-2">{t('languageManagement.addNew.websiteRequired.title', 'Website Required')}</p>
                      <p className="text-sm">
                        {!hasWebsite
                          ? t('languageManagement.addNew.websiteRequired.noWebsite', 'Please create a website first')
                          : t('languageManagement.addNew.websiteRequired.noSelected', 'Please select a website')}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="new-language-id" className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <span>{t('languageManagement.form.labels.languageId', 'Language ID')}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-slate-100 dark:hover:bg-slate-700">
                                <HelpCircle className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                {t('languageManagement.form.helpText.languageIdTooltip', 'Use standard language codes like en, ar, es')}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <div className="relative group">
                        <div className={cn(
                          "absolute inset-y-0 flex items-center pointer-events-none z-10",
                          isRTL ? "right-0 pr-4" : "left-0 pl-4"
                        )}>
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                            <Flag className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                        </div>
                        <Input
                          id="new-language-id"
                          placeholder={t('languageManagement.form.placeholders.languageId', 'e.g., en, ar, es')}
                          value={newLanguage.languageID}
                          onChange={(e) => setNewLanguage({ ...newLanguage, languageID: e.target.value.toLowerCase() })}
                          className={cn(
                            "h-12 transition-all duration-300 border-2 rounded-xl",
                            "focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500",
                            "dark:focus:ring-purple-400/20 dark:focus:border-purple-400",
                            "dark:bg-slate-800/50 dark:border-slate-600",
                            "group-hover:shadow-lg group-hover:shadow-purple-500/10",
                            isRTL ? "pr-16 pl-4" : "pl-16 pr-4"
                          )}
                          disabled={!hasWebsite || noWebsiteSelected}
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t('languageManagement.form.helpText.languageId', 'Use ISO 639-1 language codes')}
                      </p>

                      {/* Enhanced Quick language selection */}
                      {hasWebsite && !noWebsiteSelected && (
                        <div className="space-y-3">
                          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            {t('languageManagement.form.quickSelect', 'Quick Select')}
                          </Label>
                          <div className="grid grid-cols-4 gap-2">
                            {commonLanguages.map((lang) => (
                              <motion.button
                                key={lang.id}
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  setNewLanguage({
                                    ...newLanguage,
                                    languageID: lang.id,
                                    language: lang.name,
                                  })
                                }
                                className="text-xs px-3 py-2 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 hover:from-purple-100 hover:to-blue-100 dark:from-slate-800 dark:to-slate-700 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 transition-all duration-200 font-medium"
                              >
                                {lang.id}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="new-language-name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t('languageManagement.form.labels.languageName', 'Language Name')}
                      </Label>
                      <div className="relative group">
                        <div className={cn(
                          "absolute inset-y-0 flex items-center pointer-events-none z-10",
                          isRTL ? "right-0 pr-4" : "left-0 pl-4"
                        )}>
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                            <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <Input
                          id="new-language-name"
                          placeholder={t('languageManagement.form.placeholders.languageName', 'e.g., English, العربية')}
                          value={newLanguage.language}
                          onChange={(e) => setNewLanguage({ ...newLanguage, language: e.target.value })}
                          className={cn(
                            "h-12 transition-all duration-300 border-2 rounded-xl",
                            "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                            "dark:focus:ring-blue-400/20 dark:focus:border-blue-400",
                            "dark:bg-slate-800/50 dark:border-slate-600",
                            "group-hover:shadow-lg group-hover:shadow-blue-500/10",
                            isRTL ? "pr-16 pl-4" : "pl-16 pr-4"
                          )}
                          disabled={!hasWebsite || noWebsiteSelected}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className={cn(
                        "flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700",
                        isRTL ? "flex-row-reverse space-x-reverse" : ""
                      )}>
                        <Checkbox
                          id="new-language-active"
                          checked={newLanguage.isActive || false}
                          onCheckedChange={(checked) => setNewLanguage({ ...newLanguage, isActive: checked === true })}
                          disabled={!hasWebsite || noWebsiteSelected}
                          className="w-5 h-5"
                        />
                        <div className="flex-1">
                          <Label htmlFor="new-language-active" className="font-medium text-slate-900 dark:text-slate-100 cursor-pointer">
                            {t('languageManagement.form.labels.activeLanguage', 'Active Language')}
                          </Label>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {t('languageManagement.form.helpText.activeLanguage', 'Make this language available to users')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className={cn(
                "flex justify-between items-center border-t border-slate-200 dark:border-slate-700 p-8",
                "bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700",
                isRTL ? "flex-row-reverse" : ""
              )}>
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
                  className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  {t('languageManagement.form.buttons.resetForm', 'Reset Form')}
                </Button>
                <Button
                  onClick={handleAddLanguage}
                  className={cn(
                    "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
                    "text-white px-8 h-12 rounded-xl font-semibold shadow-lg hover:shadow-xl",
                    "transition-all duration-300 hover:scale-105 active:scale-95"
                  )}
                  disabled={createLanguageMutation.isPending || !hasWebsite || noWebsiteSelected}
                >
                  {createLanguageMutation.isPending ? (
                    <>
                      <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
                      {t('languageManagement.form.buttons.adding', 'Adding...')}
                    </>
                  ) : (
                    <>
                      <Plus className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {t('languageManagement.form.buttons.addLanguage', 'Add Language')}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Manage Languages Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="overflow-hidden border-none shadow-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm" dir={isRTL ? 'rtl' : 'ltr'}>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                      <Languages className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {t('languageManagement.manage.title', 'Manage Languages')}
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        {websiteId
                          ? t('languageManagement.manage.description', `Managing ${languageArray.length} languages`)
                          : t('languageManagement.manage.noWebsiteSelected', 'No website selected')}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "flex items-center gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700",
                      isRTL ? "flex-row-reverse" : ""
                    )}
                    onClick={() => setExpandedInfo(!expandedInfo)}
                  >
                    <Info className="h-4 w-4" />
                    <span>{t('languageManagement.manage.help.button', 'Help')}</span>
                    {expandedInfo ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
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
                      <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl text-sm text-blue-800 dark:text-blue-200">
                        <h4 className={cn(
                          "font-semibold mb-3 flex items-center gap-2",
                          isRTL ? "flex-row-reverse" : ""
                        )}>
                          <HelpCircle className="h-4 w-4" />
                          {t('languageManagement.manage.help.title', 'Language Management Tips')}
                        </h4>
                        <ul className={cn(
                          "list-disc space-y-2",
                          isRTL ? "pr-5" : "pl-5"
                        )}>
                          <li>Use standard ISO language codes (en, ar, es, fr, etc.)</li>
                          <li>Active languages will be available for content translation</li>
                          <li>You can toggle language status without deleting content</li>
                          <li>Language IDs cannot be changed after creation</li>
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardHeader>

              <CardContent className="p-8" dir={isRTL ? 'rtl' : 'ltr'}>
                {noWebsiteSelected ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center shadow-lg">
                      <AlertTriangle className="h-12 w-12 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                      {t('languageManagement.manage.emptyState.noWebsite.title', 'Website Required')}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                      {t('languageManagement.manage.emptyState.noWebsite.description', 'Please create or select a website to manage languages')}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Enhanced Search and Filter */}
                    <div className={cn(
                      "mb-8 flex flex-col lg:flex-row gap-4",
                      isRTL ? "lg:flex-row-reverse" : ""
                    )}>
                      <div className="relative flex-1">
                        <div className={cn(
                          "absolute inset-y-0 flex items-center pointer-events-none z-10",
                          isRTL ? "right-0 pr-4" : "left-0 pl-4"
                        )}>
                          <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <Input
                          placeholder={t('languageManagement.manage.search.placeholder', 'Search languages...')}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className={cn(
                            "h-12 border-2 rounded-xl transition-all duration-300",
                            "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                            "dark:focus:ring-blue-400/20 dark:focus:border-blue-400",
                            "dark:bg-slate-800/50 dark:border-slate-600",
                            isRTL ? "pr-12 pl-4" : "pl-12 pr-4"
                          )}
                        />
                      </div>

                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                          <TabsList className="grid grid-cols-3 bg-transparent gap-1">
                            <TabsTrigger 
                              value="all" 
                              className={cn(
                                "text-xs px-4 py-2 rounded-lg transition-all duration-300",
                                activeTab === 'all' ? "bg-blue-500 text-white shadow-sm" : "hover:bg-slate-100 dark:hover:bg-slate-700"
                              )}
                            >
                              {t('languageManagement.manage.tabs.all', 'All')} ({languageArray.length})
                            </TabsTrigger>
                            <TabsTrigger 
                              value="active" 
                              className={cn(
                                "text-xs px-4 py-2 rounded-lg transition-all duration-300",
                                activeTab === 'active' ? "bg-green-500 text-white shadow-sm" : "hover:bg-slate-100 dark:hover:bg-slate-700"
                              )}
                            >
                              {t('languageManagement.manage.tabs.active', 'Active')} ({languageArray.filter((l: Language) => l.isActive).length})
                            </TabsTrigger>
                            <TabsTrigger 
                              value="inactive" 
                              className={cn(
                                "text-xs px-4 py-2 rounded-lg transition-all duration-300",
                                activeTab === 'inactive' ? "bg-gray-500 text-white shadow-sm" : "hover:bg-slate-100 dark:hover:bg-slate-700"
                              )}
                            >
                              {t('languageManagement.manage.tabs.inactive', 'Inactive')} ({languageArray.filter((l: Language) => !l.isActive).length})
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </div>

                    {filteredLanguages.length > 0 ? (
                      <motion.div
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {filteredLanguages.map((language: Language, index) => (
                          <motion.div 
                            key={language._id || `lang-${language.languageID}`} 
                            variants={itemVariants}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card className="group border border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-slate-900/20 overflow-hidden bg-white dark:bg-slate-800/90 backdrop-blur-sm">
                              <CardContent className="p-0">
                                <div
                                  className={cn(
                                    "h-2 w-full transition-all duration-300",
                                    language.isActive
                                      ? "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"
                                      : "bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700"
                                  )}
                                />
                                <div className="p-6">
                                  <div className={cn(
                                    "flex justify-between items-start",
                                    isRTL ? "flex-row-reverse" : ""
                                  )}>
                                    <div className="flex-1">
                                      <div className={cn(
                                        "flex items-center gap-3 mb-3",
                                        isRTL ? "flex-row-reverse" : ""
                                      )}>
                                        <div className={cn(
                                          "w-12 h-12 rounded-xl bg-gradient-to-br shadow-lg flex items-center justify-center",
                                          language.isActive 
                                            ? "from-green-500 to-emerald-500"
                                            : "from-slate-400 to-slate-500"
                                        )}>
                                          <Globe className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1">
                                            {language.language}
                                          </h3>
                                          <Badge
                                            variant="outline"
                                            className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                          >
                                            {language.languageID}
                                          </Badge>
                                        </div>
                                      </div>
                                      
                                      <Badge
                                        className={cn(
                                          "transition-all duration-200 font-medium border-0",
                                          language.isActive
                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/40"
                                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                        )}
                                      >
                                        <div className={cn(
                                          "w-2 h-2 rounded-full mr-2",
                                          language.isActive 
                                            ? "bg-green-500 shadow-green-500/50 shadow-sm animate-pulse" 
                                            : "bg-slate-400"
                                        )} />
                                        {language.isActive 
                                          ? t('languageManagement.languageCard.status.active', 'Active')
                                          : t('languageManagement.languageCard.status.inactive', 'Inactive')
                                        }
                                      </Badge>
                                    </div>
                                    
                                    {/* Enhanced Actions */}
                                    <div className={cn(
                                      "flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300",
                                      isRTL ? "flex-row-reverse" : ""
                                    )}>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className={cn(
                                                "h-10 w-10 rounded-xl transition-all duration-200 hover:scale-110",
                                                language.isActive
                                                  ? "text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
                                                  : "text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-800"
                                              )}
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
                                            <p>
                                              {language.isActive 
                                                ? t('languageManagement.languageCard.tooltips.deactivate', 'Deactivate language')
                                                : t('languageManagement.languageCard.tooltips.activate', 'Activate language')
                                              }
                                            </p>
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
                                                  className="h-10 w-10 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 hover:scale-110"
                                                  onClick={() => handleEdit(language)}
                                                  disabled={!hasWebsite}
                                                >
                                                  <Edit className="h-4 w-4" />
                                                </Button>
                                              </DialogTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>{t('languageManagement.languageCard.tooltips.edit', 'Edit language')}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                        
                                        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl">
                                          <DialogHeader>
                                            <DialogTitle className="text-slate-900 dark:text-slate-100">
                                              {t('languageManagement.editDialog.title', 'Edit Language')}
                                            </DialogTitle>
                                            <DialogDescription className="text-slate-600 dark:text-slate-400">
                                              {t('languageManagement.editDialog.description', 'Update language information')}
                                            </DialogDescription>
                                          </DialogHeader>
                                          {editItem && editItem.type === "language" && (
                                            <div className="grid gap-6 py-4">
                                              <div className="space-y-3">
                                                <Label htmlFor="edit-language-id" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                  {t('languageManagement.editDialog.labels.languageId', 'Language ID')}
                                                </Label>
                                                <div className="relative">
                                                  <div className={cn(
                                                    "absolute inset-y-0 flex items-center pointer-events-none z-10",
                                                    isRTL ? "right-0 pr-4" : "left-0 pl-4"
                                                  )}>
                                                    <Flag className="h-4 w-4 text-slate-400" />
                                                  </div>
                                                  <Input
                                                    id="edit-language-id"
                                                    value={editItem.languageID}
                                                    onChange={(e) =>
                                                      setEditItem({ ...editItem, languageID: e.target.value.toLowerCase() })
                                                    }
                                                    className={cn(
                                                      "h-12 border-2 rounded-xl",
                                                      isRTL ? "pr-12 pl-4" : "pl-12 pr-4"
                                                    )}
                                                  />
                                                </div>
                                              </div>
                                              <div className="space-y-3">
                                                <Label htmlFor="edit-language-name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                  {t('languageManagement.editDialog.labels.languageName', 'Language Name')}
                                                </Label>
                                                <div className="relative">
                                                  <div className={cn(
                                                    "absolute inset-y-0 flex items-center pointer-events-none z-10",
                                                    isRTL ? "right-0 pr-4" : "left-0 pl-4"
                                                  )}>
                                                    <Globe className="h-4 w-4 text-slate-400" />
                                                  </div>
                                                  <Input
                                                    id="edit-language-name"
                                                    value={editItem.language}
                                                    onChange={(e) => setEditItem({ ...editItem, language: e.target.value })}
                                                    className={cn(
                                                      "h-12 border-2 rounded-xl",
                                                      isRTL ? "pr-12 pl-4" : "pl-12 pr-4"
                                                    )}
                                                  />
                                                </div>
                                              </div>
                                              <div className={cn(
                                                "flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl",
                                                isRTL ? "flex-row-reverse space-x-reverse" : ""
                                              )}>
                                                <Checkbox
                                                  id="edit-language-active"
                                                  checked={editItem.isActive || false}
                                                  onCheckedChange={(checked) =>
                                                    setEditItem({ ...editItem, isActive: checked === true })
                                                  }
                                                  className="w-5 h-5"
                                                />
                                                <Label htmlFor="edit-language-active" className="font-medium text-slate-900 dark:text-slate-100 cursor-pointer">
                                                  {t('languageManagement.editDialog.labels.active', 'Active Language')}
                                                </Label>
                                              </div>
                                            </div>
                                          )}
                                          <DialogFooter className={cn(
                                            "sm:justify-between gap-3",
                                            isRTL ? "sm:flex-row-reverse" : ""
                                          )}>
                                            <DialogClose asChild>
                                              <Button variant="outline" className="border-slate-200 dark:border-slate-700">
                                                {t('languageManagement.form.buttons.cancel', 'Cancel')}
                                              </Button>
                                            </DialogClose>
                                            <DialogClose asChild>
                                              <Button
                                                onClick={handleSaveEdit}
                                                disabled={updateLanguageMutation.isPending}
                                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                                              >
                                                {updateLanguageMutation.isPending ? (
                                                  <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
                                                ) : (
                                                  <Save className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                                                )}
                                                {t('languageManagement.form.buttons.saveChanges', 'Save Changes')}
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
                                                  className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 hover:scale-110"
                                                  onClick={() => setItemToDelete({ ...language, type: "language" })}
                                                  disabled={!hasWebsite}
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </AlertDialogTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>{t('languageManagement.languageCard.tooltips.delete', 'Delete language')}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                        
                                        <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl">
                                          <AlertDialogHeader>
                                            <div className="flex items-center gap-3 mb-4">
                                              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                                              </div>
                                              <div>
                                                <AlertDialogTitle className="text-slate-900 dark:text-slate-100">
                                                  {t('languageManagement.deleteDialog.title', 'Delete Language')}
                                                </AlertDialogTitle>
                                              </div>
                                            </div>
                                            <AlertDialogDescription className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                              <p className="mb-4">
                                                {t('languageManagement.deleteDialog.description', `Are you sure you want to delete "${language.language}"?`)}
                                              </p>
                                              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-sm">
                                                <p className={cn(
                                                  "font-semibold flex items-center gap-2 mb-2",
                                                  isRTL ? "flex-row-reverse" : ""
                                                )}>
                                                  <AlertTriangle className="h-4 w-4" />
                                                  {t('languageManagement.deleteDialog.warning.title', 'Warning')}
                                                </p>
                                                <p>
                                                  {t('languageManagement.deleteDialog.warning.description', 'This action cannot be undone. All content in this language will be lost.')}
                                                </p>
                                              </div>
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter className="gap-3 mt-6">
                                            <AlertDialogCancel className="border-slate-200 dark:border-slate-700">
                                              {t('languageManagement.deleteDialog.buttons.cancel', 'Cancel')}
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={confirmDelete}
                                              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                                              disabled={deleteLanguageMutation.isPending}
                                            >
                                              {deleteLanguageMutation.isPending ? (
                                                <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
                                              ) : null}
                                              {t('languageManagement.deleteDialog.buttons.delete', 'Delete Language')}
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
                      <div className="text-center py-16">
                        {searchQuery ? (
                          <>
                            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center shadow-lg">
                              <Search className="h-12 w-12 text-slate-400 dark:text-slate-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                              {t('languageManagement.manage.search.noResults.title', 'No languages found')}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                              {t('languageManagement.manage.search.noResults.description', `No languages found matching "${searchQuery}"`)}
                            </p>
                            <Button 
                              variant="outline" 
                              onClick={() => setSearchQuery("")}
                              className="border-slate-200 dark:border-slate-700"
                            >
                              {t('languageManagement.manage.search.noResults.clearButton', 'Clear Search')}
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-200 dark:from-purple-900/20 dark:to-blue-900/20 flex items-center justify-center shadow-lg">
                              <Languages className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                              {t('languageManagement.manage.emptyState.noLanguages.title', 'No languages configured')}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                              {t('languageManagement.manage.emptyState.noLanguages.description', 'Add your first language to enable multilingual support')}
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
        </motion.div>
      </div>
    </div>
  )
}