"use client"

import { useToast } from "@/src/hooks/use-toast"
import type { Section } from "@/src/api/types/hooks/section.types"
import type { DeleteItemData } from "@/src/api/types/hooks/Common.types"
import { useAuth } from "@/src/context/AuthContext"
import { useEffect, useState } from "react"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import {
  AlertTriangle,
  Check,
  LayoutGrid,
  Loader2,
  PlusCircle,
  Trash,
  Search,
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  Filter,
  Settings,
  Zap,
  LayoutTemplate,
  MessageSquare,
  Users,
  Bookmark,
  RefreshCw,
  Menu,
  ArrowUpDown,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { useUserSections } from "@/src/hooks/webConfiguration/useUserSections"
import { useSections } from "@/src/hooks/webConfiguration/use-section"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/src/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"
import { sub } from "date-fns"
import useUpdateOrder from "@/src/hooks/webConfiguration/useUpdateOrder"
import { useTranslation } from "react-i18next"

interface ManagementProps {
  hasWebsite: boolean
}

// Improved predefined sections data with translation keys
const PREDEFINED_SECTIONS = [
  {
    nameKey: "Dashboard_sideBar.nav.header", 
    subName: "Header",
    descriptionKey: "sectionManagement.description1",
    image: "/sections/header.jpg",
    icon: <LayoutTemplate className="h-10 w-10" />,
    category: "layout",
  },
  {
    nameKey: "Dashboard_sideBar.nav.hero",
    subName: "Hero", 
    descriptionKey: "sectionManagement.sections.hero.description",
    image: "/sections/hero.jpg",
    icon: <Zap className="h-10 w-10" />,
    category: "layout",
  },
  {
    nameKey: "Dashboard_sideBar.nav.services",
    subName: "Services",
    descriptionKey: "sectionManagement.sections.services.description",
    image: "/sections/services.jpg",
    icon: <Settings className="h-10 w-10" />,
    category: "content",
  },
  {
    nameKey: "Dashboard_sideBar.nav.news",
    subName: "News",
    descriptionKey: "sectionManagement.sections.news.description",
    image: "/sections/news.jpg",
    icon: <MessageSquare className="h-10 w-10" />,
    category: "content",
  },
  {
    nameKey: "Dashboard_sideBar.nav.industrySolutions",
    subName: "IndustrySolutions",
    descriptionKey: "sectionManagement.sections.industrySolutions.description",
    image: "/sections/solutions.jpg",
    icon: <Bookmark className="h-10 w-10" />,
    category: "content",
  },
  {
    nameKey: "Dashboard_sideBar.nav.whyChooseUs",
    subName: "whyChooseUs",
    descriptionKey: "sectionManagement.sections.whyChooseUs.description",
    image: "/sections/choose-us.jpg",
    icon: <Zap className="h-10 w-10" />,
    category: "content",
  },
  {
    nameKey: "Dashboard_sideBar.nav.projects",
    subName: "Projects",
    descriptionKey: "sectionManagement.sections.projects.description",
    image: "/sections/projects.jpg",
    icon: <LayoutGrid className="h-10 w-10" />,
    category: "content",
  },
  {
    nameKey: "Dashboard_sideBar.nav.ourProcess",
    subName: "OurProcess",
    descriptionKey: "sectionManagement.sections.ourProcess.description",
    image: "/sections/process.jpg",
    icon: <RefreshCw className="h-10 w-10" />,
    category: "content",
  },
  {
    nameKey: "Dashboard_sideBar.nav.team",
    subName: "Team",
    descriptionKey: "sectionManagement.sections.team.description",
    image: "/sections/team.jpg",
    icon: <Users className="h-10 w-10" />,
    category: "content",
  },
  {
    nameKey: "Dashboard_sideBar.nav.clientComments",
    subName: "ClientComments",
    descriptionKey: "sectionManagement.sections.clientComments.description",
    image: "/sections/testimonials.jpg",
    icon: <MessageSquare className="h-10 w-10" />,
    category: "content",
  },
  {
    nameKey: "Dashboard_sideBar.nav.partners",
    subName: "Partners",
    descriptionKey: "sectionManagement.sections.partners.description",
    image: "/sections/partners.jpg",
    icon: <Users className="h-10 w-10" />,
    category: "content",
  },
  {
    nameKey: "Dashboard_sideBar.nav.faq",
    subName: "FAQ",
    descriptionKey: "sectionManagement.sections.faq.description",
    image: "/sections/faq.jpg", 
    icon: <MessageSquare className="h-10 w-10" />,
    category: "content",
  },
  {
    nameKey: "Dashboard_sideBar.nav.blog",
    subName: "Blog",
    descriptionKey: "sectionManagement.sections.blog.description",
    image: "/sections/blog.jpg",
    icon: <MessageSquare className="h-10 w-10" />,
    category: "content",
  },
  {
    nameKey: "Dashboard_sideBar.nav.contact",
    subName: "Contact",
    descriptionKey: "sectionManagement.sections.contact.description",
    image: "/sections/contact.jpg",
    icon: <MessageSquare className="h-10 w-10" />,
    category: "content",
  },
  {
    nameKey: "Dashboard_sideBar.nav.footer",
    subName: "Footer",
    descriptionKey: "sectionManagement.sections.footer.description",
    image: "/sections/footer.jpg",
    icon: <LayoutTemplate className="h-10 w-10" />,
    category: "layout",
  },
]

export function SectionManagement({ hasWebsite }: ManagementProps) {
  const { websiteId } = useWebsiteContext()
  const { user } = useAuth()
  const userId = user?.id || user?.id
  const { t, ready } = useTranslation() 

  // Get section hooks
  const {
    useGetByWebsiteId,
    useCreate: useCreateSection,
    useDelete: useDeleteSection,
    useToggleActive: useToggleSectionActive,
  } = useSections()

  // Get user-section hooks
  const { useActivateSection, useCreateUserSection } = useUserSections()

  // Get the correct mutation function depending on what's available
  const activateSectionMutation = useActivateSection()
  const createUserSectionMutationResult = useCreateUserSection()
  const createUserSectionMutation = createUserSectionMutationResult ? createUserSectionMutationResult : null

  // Use the website-specific query
  const {
    data: websiteSections,
    isLoading: isLoadingSections,
    error: sectionsError,
    refetch: refetchSections,
    isError,
  } = useGetByWebsiteId(websiteId, true, hasWebsite)

  const createSectionMutation = useCreateSection()
  const deleteSectionMutation = useDeleteSection()
  const toggleSectionActiveMutation = useToggleSectionActive()
  const updateSectionOrderMutation = useUpdateOrder()
  const [itemToDelete, setItemToDelete] = useState<DeleteItemData | null>(null)
  const { toast } = useToast()
  const [showSavedSuccess, setShowSavedSuccess] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("current")
  const [orderedSections, setOrderedSections] = useState<Section[]>([])
  const [isDragging, setIsDragging] = useState(false)
  

  // Categories for filtering with translation
  const SECTION_CATEGORIES = [
    { value: "all", labelKey: "sectionManagement.categories.all" },
    { value: "layout", labelKey: "sectionManagement.categories.layout" },
    { value: "content", labelKey: "sectionManagement.categories.content" },
  ]

  useEffect(() => {
    if (
      createSectionMutation.isSuccess || 
      deleteSectionMutation.isSuccess || 
      toggleSectionActiveMutation.isSuccess ||
      updateSectionOrderMutation.isSuccess
    ) {
      refetchSections()
    }
  }, [
    createSectionMutation.isSuccess,
    deleteSectionMutation.isSuccess,
    toggleSectionActiveMutation.isSuccess,
    updateSectionOrderMutation.isSuccess,
    refetchSections,
  ])

  // Update ordered sections when websiteSections changes
  useEffect(() => {
    if (websiteSections?.data) {
      setOrderedSections([...websiteSections.data].sort((a, b) => a.order - b.order))
    }
  }, [websiteSections])

  // Function to create user-section relationship after section creation
  const createUserSectionRelation = (sectionId: string) => {
    if (!userId) {
      console.warn("Cannot create user-section relationship: User ID not available")
      return
    }

    activateSectionMutation.mutate(
      { userId, sectionId },
      {
        onError: (error: any) => {
          console.error("Error creating user-section relationship:", error)
        },
      },
    )
  }

  const handleAddPredefinedSection = (predefinedSection: (typeof PREDEFINED_SECTIONS)[0]) => {
    // Always use English subName for storage and comparison consistency
    const englishName = predefinedSection.subName
    const translatedName = ready ? t(predefinedSection.nameKey, predefinedSection.nameKey.split('.').pop() || '') : predefinedSection.nameKey.split('.').pop() || ''
    const translatedDescription = ready ? t(predefinedSection.descriptionKey, '') : ''
    
    const newSectionData = {
      name: englishName, // Use English subName for consistency
      description: translatedDescription, // Use translated description
      subName: predefinedSection.subName,
      image: predefinedSection.image,
      order: orderedSections.length,
      subSections: [],
      isActive: true,
      WebSiteId: websiteId,
    }
    
    console.log(newSectionData)

    // Check if section with this subName already exists (use subName for consistency)
    if (orderedSections?.some((section: Section) => section.name === englishName || section.subName === predefinedSection.subName)) {
      toast({
        title: "Duplicate section",
        description: `A section named "${translatedName}" already exists.`,
        variant: "destructive",
      })
      return
    }

    // If we have the enhanced createUserSectionMutation that automatically creates the relationship
    if (createUserSectionMutation) {
      createUserSectionMutation.mutate(newSectionData, {
        onSuccess: () => {
          toast({
            title: "Section added",
            description: `${translatedName} section has been added successfully.`,
          })
          showSuccessMessage()
          setActiveTab("current")
        },
        onError: (error: any) => {
          toast({
            title: "Error adding section",
            description: error.message || "An error occurred while adding the section.",
            variant: "destructive",
          })
        },
      })
    } else {
      // Use the regular create section and manually create the relationship
      createSectionMutation.mutate(newSectionData, {
        onSuccess: (createdSection) => {
          toast({
            title: "Section added",
            description: `${translatedName} section has been added successfully.`,
          })
          showSuccessMessage()
          setActiveTab("current")

          // Create user-section relationship
          if (createdSection._id) {
            createUserSectionRelation(createdSection._id)
          }
        },
        onError: (error: any) => {
          toast({
            title: "Error adding section",
            description: error.message || "An error occurred while adding the section.",
            variant: "destructive",
          })
        },
      })
    }
  }

  const handleOpenDelete = (section: Section) => {
    const translatedName = getTranslatedSectionName(section)
    setItemToDelete({
      _id: section._id,
      name: translatedName, // Use translated name for display
      type: "section",
    })
  }

  const handleCancelDelete = () => {
    setItemToDelete(null)
  }

  const confirmDelete = () => {
    if (itemToDelete && itemToDelete._id && itemToDelete.type === "section") {
      deleteSectionMutation.mutate(itemToDelete._id, {
        onSuccess: () => {
          toast({
            title: "Section deleted",
            description: `The section has been deleted successfully.`,
          })
          setItemToDelete(null)
          showSuccessMessage()
        },
        onError: (error: any) => {
          toast({
            title: "Error deleting section",
            description: error.message || "An error occurred while deleting the section.",
            variant: "destructive",
          })
        },
      })
    }
  }

  const handleToggleActive = (section: Section) => {
    if (!section._id) {
      toast({
        title: "Error",
        description: "Section ID is missing.",
        variant: "destructive",
      })
      return
    }

    const newActiveStatus = !section.isActive
    const translatedName = getTranslatedSectionName(section)

    toggleSectionActiveMutation.mutate(
      { id: section._id, isActive: newActiveStatus },
      {
        onSuccess: () => {
          toast({
            title: `Section ${newActiveStatus ? 'activated' : 'deactivated'}`,
            description: `${translatedName} is now ${newActiveStatus ? 'visible' : 'hidden'} on your website.`,
          })
          showSuccessMessage()

          // Optimistically update the local state
          setOrderedSections(prevSections => 
            prevSections.map(s => 
              s._id === section._id 
                ? { ...s, isActive: newActiveStatus }
                : s
            )
          )
        },
        onError: (error: any) => {
          toast({
            title: "Error updating section",
            description: error.message || "An error occurred while updating the section status.",
            variant: "destructive",
          })
        },
      }
    )
  }

  // Handle reordering sections
  const handleReorder = (reorderedSections: Section[]) => {
    // Update local state with the new order
    setOrderedSections(reorderedSections);

    // Prepare data for the API call
    const orderData = reorderedSections
      .filter((section): section is Section & { _id: string; order: number } => 
        section._id !== undefined && typeof section.order === 'number' && Boolean(section.WebSiteId)
      )
      .map((section, index) => ({
        id: section._id,
        order: index, // Use the index from the reordered array
        websiteId: section.WebSiteId.toString(),
      }));

    // Validate that we have sections to update
    if (orderData.length === 0) {
      toast({
        title: "Error",
        description: "No valid sections to reorder.",
        variant: "destructive",
      });
      return;
    }

    // Perform the backend update
    updateSectionOrderMutation.mutate(orderData, {
      onSuccess: () => {
        toast({
          title: "Order updated",
          description: "Section order has been updated successfully.",
        });
        showSuccessMessage();
        // Refetch sections to ensure consistency with backend
        refetchSections();
      },
      onError: (error: any) => {
        toast({
          title: "Error updating order",
          description: error.message || "An error occurred while updating section order.",
          variant: "destructive",
        });
        // Revert to original order on error
        if (websiteSections?.data) {
          setOrderedSections([...websiteSections.data].sort((a, b) => a.order - b.order));
        }
      },
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const showSuccessMessage = () => {
    setShowSavedSuccess(true)
    setTimeout(() => {
      setShowSavedSuccess(false)
    }, 3000)
  }

  // Helper function to get translated name for existing sections
  const getTranslatedSectionName = (section: Section) => {
    // Find the predefined section that matches this section's name or subName
    const predefinedSection = PREDEFINED_SECTIONS.find(
      ps => ps.subName === section.name || ps.subName === section.subName
    )
    
    if (predefinedSection && ready) {
      return t(predefinedSection.nameKey, predefinedSection.nameKey.split('.').pop() || '')
    }
    
    // Fallback to the stored name
    return section.name
  }

  // Filter sections based on search query and category
  const filteredPredefinedSections = PREDEFINED_SECTIONS.filter((predefinedSection) => {
    const translatedName = ready ? t(predefinedSection.nameKey, predefinedSection.nameKey.split('.').pop() || '') : predefinedSection.nameKey.split('.').pop() || ''
    const translatedDescription = ready ? t(predefinedSection.descriptionKey, '') : ''
    
    // Use subName for comparison to avoid language-dependent duplicates
    const sectionExists = orderedSections.some((section: Section) => 
      section.name === predefinedSection.subName || 
      section.subName === predefinedSection.subName
    )
    
    return !sectionExists &&
      (translatedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        translatedDescription.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (categoryFilter === "all" || predefinedSection.category === categoryFilter)
  })

  const filteredCurrentSections = orderedSections.filter(
    (section: Section) => {
      const translatedName = getTranslatedSectionName(section)
      return translatedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (section.description && section.description.toLowerCase().includes(searchQuery.toLowerCase()))
    }
  )

  // Show loading state when fetching sections for this website
  if (isLoadingSections && hasWebsite)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading sections...</p>
        </div>
      </div>
    )

  // Show error state if there's an error fetching website sections
  if (isError && hasWebsite)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4 text-destructive">
          <AlertTriangle className="h-12 w-12" />
          <p className="text-lg font-medium">Error loading sections</p>
          <p className="text-sm text-muted-foreground">
            {(sectionsError as Error)?.message || "Failed to fetch sections"}
          </p>
          <Button onClick={() => refetchSections()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 15 },
    },
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <AnimatePresence>
        {showSavedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-green-100 dark:bg-green-900/60 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2"
          >
            <Check className="h-5 w-5" />
            <span>Changes saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {ready ? t("sectionManagement.title", "Website Sections") : "Website Sections"}
              </h2>
              <TabsList className="grid w-64 grid-cols-2">
                <TabsTrigger value="current" className="text-base py-3 flex items-center gap-1.5">
                  <Menu className="h-4 w-4" />
                    {t('sectionManagement.current')}
                </TabsTrigger>
                <TabsTrigger value="available" className="text-base py-3 flex items-center gap-1.5">
                  <Plus className="h-4 w-4" />
                  {ready ? t("sectionManagement.addNew") : "Add New"}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="current" className="space-y-6">
              <div className="bg-white dark:bg-slate-950 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <LayoutGrid className="h-5 w-5 text-primary" />
                    {ready ? t("sectionManagement.currentSections") : "Current Website Sections"}
                    {orderedSections.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {orderedSections.length}
                      </Badge>
                    )}
                  </h3>

                  <div className="flex items-center gap-2">
                    {/* Search bar */}
                    <div className="relative w-64">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        type="search"
                        placeholder={ready ? t("sectionManagement.searchPlaceholder", "Search sections...") : "Search sections..."}
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Add button for quick access */}
                    <Button
                      onClick={() => setActiveTab("available")}
                      variant="outline"
                      className="border-primary/30 text-primary hover:text-primary/90 hover:bg-primary/5"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      {ready ? t("sectionManagement.addNew", "Add New") : "Add New"}
                    </Button>
                  </div>
                </div>

                {!hasWebsite ? (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-lg flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <p>Please create a website first to see its sections.</p>
                  </div>
                ) : filteredCurrentSections.length > 0 ? (
                  <div className="relative">
                    {orderedSections.length > 1 && (
                      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <ArrowUpDown className="h-4 w-4" />
                        <span>{t('sectionManagement.dragToReorder')}</span>
                      </div>
                    )}
                    
                    <Reorder.Group 
                      axis="y" 
                      values={orderedSections} 
                      onReorder={handleReorder}
                      className="space-y-3"
                    >
                      {filteredCurrentSections.map((section: Section) => (
                        <Reorder.Item
                          key={section._id || `section-${section.name}`}
                          value={section}
                          className="cursor-move"
                        >
                          <Card className="border shadow-xl border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300 overflow-hidden bg-white dark:bg-slate-900">
                            <div className="p-4 flex items-center gap-4">
                              <div className="text-muted-foreground border border-dashed border-slate-200 dark:border-slate-700 p-1.5 rounded-md cursor-grab">
                                <GripVertical className="h-5 w-5" />
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-base">{getTranslatedSectionName(section)}</h3>
                                  <Badge
                                    variant={section.isActive ? "default" : "secondary"}
                                    className={section.isActive ? 
                                      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800" : 
                                      "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400"
                                    }
                                  >
                                    {section.isActive ? 
                                      (ready ? t("sectionManagement.active", "Active") : "Active") : 
                                      (ready ? t("sectionManagement.hidden", "Hidden") : "Hidden")
                                    }
                                  </Badge>
                                </div>
                                {section.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleActive(section);
                                        }}
                                        disabled={toggleSectionActiveMutation.isPending}
                                        className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                                      >
                                        {toggleSectionActiveMutation.isPending && toggleSectionActiveMutation.variables?.id === section._id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : section.isActive ? (
                                          <Eye className="h-4 w-4" />
                                        ) : (
                                          <EyeOff className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{section.isActive ? "Hide section" : "Show section"}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenDelete(section);
                                        }}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete section</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </Card>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No sections found matching "{searchQuery}"</p>
                    <Button variant="link" onClick={() => setSearchQuery("")}>
                      Clear search
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="bg-slate-50 dark:bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                      <LayoutGrid className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      {ready ? t("sectionManagement.noSectionsYet", "No sections yet") : "No sections yet"}
                    </h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                      {ready ? t("sectionManagement.noSectionsDescription", "Add pre-designed sections to create your website structure. Sections can be arranged in any order.") : "Add pre-designed sections to create your website structure. Sections can be arranged in any order."}
                    </p>
                    <Button onClick={() => setActiveTab("available")} className="gap-2">
                      <Plus className="h-4 w-4" />
                      {ready ? t("sectionManagement.browseSections", "Browse Available Sections") : "Browse Available Sections"}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="available" className="space-y-6">
              <div className="bg-white dark:bg-slate-950 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    {ready ? t("sectionManagement.addNewSections", "Add Pre-designed Sections") : "Add Pre-designed Sections"}
                  </h3>

                  <div className="flex items-center gap-2">
                    {/* Search bar */}
                    <div className="relative w-64">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        type="search"
                        placeholder={ready ? t("sectionManagement.searchPlaceholder", "Search sections...") : "Search sections..."}
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Category filter */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2 min-w-32 justify-between">
                          <span>
                            {ready ? 
                              t(SECTION_CATEGORIES.find((cat) => cat.value === categoryFilter)?.labelKey || "sectionManagement.categories.all", "All Sections") : 
                              "All Sections"
                            }
                          </span>
                          <Filter className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {SECTION_CATEGORIES.map((category) => (
                          <DropdownMenuItem
                            key={category.value}
                            onClick={() => setCategoryFilter(category.value)}
                            className={categoryFilter === category.value ? "bg-primary/10 text-primary font-medium" : ""}
                          >
                            {categoryFilter === category.value && <Check className="h-4 w-4 mr-2" />}
                            {ready ? t(category.labelKey, category.labelKey.split('.').pop() || '') : category.labelKey.split('.').pop() || ''}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {!hasWebsite && (
                  <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-lg flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <p>Please create a website first before adding sections.</p>
                  </div>
                )}

                <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPredefinedSections.map((section) => {
                    const translatedName = ready ? t(section.nameKey, section.nameKey.split('.').pop() || '') : section.nameKey.split('.').pop() || ''
                    const translatedDescription = ready ? t(section.descriptionKey, '') : ''
                    
                    return (
                      <motion.div key={section.nameKey} variants={itemVariants} className="group">
                        <Card className="h-full shadow-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800 group-hover:border-primary/50">
                          <div className="relative h-32 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
                            <div className="text-primary group-hover:scale-110 transition-transform duration-300">
                              {section.icon}
                            </div>
                            <Badge 
                              className={`absolute top-2 right-2 ${
                                section.category === "layout" 
                                  ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50" 
                                  : "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/50"
                              }`}
                            >
                              {section.category === "layout" ? 
                                (ready ? t("sectionManagement.categories.layout", "Layout") : "Layout") : 
                                (ready ? t("sectionManagement.categories.content", "Content") : "Content")
                              }
                            </Badge>
                          </div>
                          <CardContent className="p-5">
                            <h3 className="font-semibold text-lg">{translatedName}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{translatedDescription}</p>
                          </CardContent>
                          <CardFooter className="p-5 pt-0 flex justify-end">
                            <Button
                              onClick={() => handleAddPredefinedSection(section)}
                              disabled={
                                createSectionMutation.isPending ||
                                (createUserSectionMutation && createUserSectionMutation.isPending) ||
                                !hasWebsite
                              }
                              className="w-full transition-all duration-300 flex items-center justify-center gap-2 group-hover:bg-primary"
                            >
                              {(createSectionMutation.isPending || (createUserSectionMutation && createUserSectionMutation.isPending)) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <PlusCircle className="h-4 w-4" />
                              )}
                              {ready ? t("sectionManagement.addToWebsite", "Add to Website") : "Add to Website"}
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>

                {filteredPredefinedSections.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                    <Search className="h-12 w-12 mb-4 opacity-20" />
                    <h3 className="text-lg font-medium mb-2">No sections found</h3>
                    <p className="text-muted-foreground mb-6">
                      No sections found matching "{searchQuery}"
                    </p>
                    <Button variant="outline" onClick={() => setSearchQuery("")}>
                      Clear Search
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && handleCancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              {ready ? t("sectionManagement.deleteSection", "Delete Section") : "Delete Section"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {ready ? 
                t("sectionManagement.deleteConfirmation", "This will permanently delete the section. This action cannot be undone, and any content in this section will be lost.") :
                "This will permanently delete the section. This action cannot be undone, and any content in this section will be lost."
              }
              {itemToDelete && (
                <span className="font-medium text-foreground"> "{itemToDelete.name}"</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-2">
            <AlertDialogCancel onClick={handleCancelDelete} className="mt-0">
              {ready ? t("sectionManagement.cancel", "Cancel") : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white hover:text-white flex items-center gap-2"
            >
              {deleteSectionMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {ready ? t("sectionManagement.delete", "Delete Section") : "Delete Section"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}