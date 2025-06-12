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
  Sparkles,
  Grid3X3,
  Crown,
  Star,
  Layers,
  Palette
} from "lucide-react"
import { Card, CardContent,  CardFooter } from "@/src/components/ui/card"
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
import useUpdateOrder from "@/src/hooks/webConfiguration/useUpdateOrder"
import { useTranslation } from "react-i18next"
import { cn } from "@/src/lib/utils"

interface ManagementProps {
  hasWebsite: boolean
}

// Enhanced predefined sections with better visual design
const PREDEFINED_SECTIONS = [
  {
    nameKey: "Dashboard_sideBar.nav.header", 
    subName: "Header",
    descriptionKey: "sectionManagement.description1",
    image: "/sections/header.jpg",
    icon: <LayoutTemplate className="h-8 w-8" />,
    category: "layout",
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.hero",
    subName: "Hero", 
    descriptionKey: "sectionManagement.sections.hero.description",
    image: "/sections/hero.jpg",
    icon: <Zap className="h-8 w-8" />,
    category: "layout",
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.services",
    subName: "Services",
    descriptionKey: "sectionManagement.sections.services.description",
    image: "/sections/services.jpg",
    icon: <Settings className="h-8 w-8" />,
    category: "content",
    color: "from-emerald-500 to-teal-500",
    bgColor: "from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.news",
    subName: "News",
    descriptionKey: "sectionManagement.sections.news.description",
    image: "/sections/news.jpg",
    icon: <MessageSquare className="h-8 w-8" />,
    category: "content",
    color: "from-orange-500 to-red-500",
    bgColor: "from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.industrySolutions",
    subName: "IndustrySolutions",
    descriptionKey: "sectionManagement.sections.industrySolutions.description",
    image: "/sections/solutions.jpg",
    icon: <Bookmark className="h-8 w-8" />,
    category: "content",
    color: "from-indigo-500 to-purple-500",
    bgColor: "from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.whyChooseUs",
    subName: "whyChooseUs",
    descriptionKey: "sectionManagement.sections.whyChooseUs.description",
    image: "/sections/choose-us.jpg",
    icon: <Star className="h-8 w-8" />,
    category: "content",
    color: "from-yellow-500 to-orange-500",
    bgColor: "from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.projects",
    subName: "Projects",
    descriptionKey: "sectionManagement.sections.projects.description",
    image: "/sections/projects.jpg",
    icon: <Grid3X3 className="h-8 w-8" />,
    category: "content",
    color: "from-rose-500 to-pink-500",
    bgColor: "from-rose-50 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.ourProcess",
    subName: "OurProcess",
    descriptionKey: "sectionManagement.sections.ourProcess.description",
    image: "/sections/process.jpg",
    icon: <RefreshCw className="h-8 w-8" />,
    category: "content",
    color: "from-cyan-500 to-blue-500",
    bgColor: "from-cyan-50 to-blue-50 dark:from-cyan-950/50 dark:to-blue-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.team",
    subName: "Team",
    descriptionKey: "sectionManagement.sections.team.description",
    image: "/sections/team.jpg",
    icon: <Users className="h-8 w-8" />,
    category: "content",
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.clientComments",
    subName: "ClientComments",
    descriptionKey: "sectionManagement.sections.clientComments.description",
    image: "/sections/testimonials.jpg",
    icon: <MessageSquare className="h-8 w-8" />,
    category: "content",
    color: "from-violet-500 to-purple-500",
    bgColor: "from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.partners",
    subName: "Partners",
    descriptionKey: "sectionManagement.sections.partners.description",
    image: "/sections/partners.jpg",
    icon: <Users className="h-8 w-8" />,
    category: "content",
    color: "from-teal-500 to-cyan-500",
    bgColor: "from-teal-50 to-cyan-50 dark:from-teal-950/50 dark:to-cyan-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.faq",
    subName: "FAQ",
    descriptionKey: "sectionManagement.sections.faq.description",
    image: "/sections/faq.jpg", 
    icon: <MessageSquare className="h-8 w-8" />,
    category: "content",
    color: "from-amber-500 to-yellow-500",
    bgColor: "from-amber-50 to-yellow-50 dark:from-amber-950/50 dark:to-yellow-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.blog",
    subName: "Blog",
    descriptionKey: "sectionManagement.sections.blog.description",
    image: "/sections/blog.jpg",
    icon: <MessageSquare className="h-8 w-8" />,
    category: "content",
    color: "from-pink-500 to-rose-500",
    bgColor: "from-pink-50 to-rose-50 dark:from-pink-950/50 dark:to-rose-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.contact",
    subName: "Contact",
    descriptionKey: "sectionManagement.sections.contact.description",
    image: "/sections/contact.jpg",
    icon: <MessageSquare className="h-8 w-8" />,
    category: "content",
    color: "from-red-500 to-pink-500",
    bgColor: "from-red-50 to-pink-50 dark:from-red-950/50 dark:to-pink-950/50"
  },
  {
    nameKey: "Dashboard_sideBar.nav.footer",
    subName: "Footer",
    descriptionKey: "sectionManagement.sections.footer.description",
    image: "/sections/footer.jpg",
    icon: <LayoutTemplate className="h-8 w-8" />,
    category: "layout",
    color: "from-slate-500 to-gray-500",
    bgColor: "from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/50"
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

  // Get section visual info
  const getSectionVisualInfo = (section: Section) => {
    const predefinedSection = PREDEFINED_SECTIONS.find(
      ps => ps.subName === section.name || ps.subName === section.subName
    )
    
    return predefinedSection || {
      icon: <LayoutGrid className="h-5 w-5" />,
      color: "from-gray-500 to-slate-500",
      bgColor: "from-gray-50 to-slate-50 dark:from-gray-950/50 dark:to-slate-950/50"
    }
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

  // Modern Loading Component
  const ModernLoader = () => (
    <div className="min-h-[400px] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 rounded-3xl" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center gap-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/50 shadow-xl"
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 blur-xl opacity-50 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Loading Sections
          </h3>
          <p className="text-slate-600 dark:text-slate-400">Fetching your website structure...</p>
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
          <AlertTriangle className="h-8 w-8 text-white" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-red-600 dark:text-red-400">
            Error Loading Sections
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {(sectionsError as Error)?.message || "Failed to fetch sections"}
          </p>
        </div>
        <Button onClick={() => refetchSections()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </motion.div>
    </div>
  )

  // Show loading state when fetching sections for this website
  if (isLoadingSections && hasWebsite) return <ModernLoader />

  // Show error state if there's an error fetching website sections
  if (isError && hasWebsite) return <ModernError />

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 15 },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/30">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-pink-400/10 dark:bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 p-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto space-y-8">
          
          {/* Success Toast */}
          <AnimatePresence>
            {showSavedSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-4 right-4 z-50 bg-green-50 dark:bg-green-900/60 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-sm"
              >
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">Changes saved successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-400/10 dark:to-purple-400/10 rounded-3xl blur-3xl" />
            <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-8 shadow-2xl">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                    <Layers className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 blur-xl opacity-50 animate-pulse" />
                </div>
              </div>
              
              <div className="text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-4">
                  {ready ? t("sectionManagement.title", "Website Sections") : "Website Sections"}
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  {ready ? t("sectionManagement.subtitle", "Build your website structure with beautiful, pre-designed sections") : "Build your website structure with beautiful, pre-designed sections"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              
              {/* Modern Tab Navigation */}
              <div className="flex justify-center mb-8">
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-2 border border-white/20 dark:border-slate-700/50 shadow-xl">
                  <TabsList className="grid grid-cols-2 bg-transparent gap-2 w-80">
                    <TabsTrigger 
                      value="current"
                      className={cn(
                        "relative px-6 py-3 rounded-xl font-semibold transition-all duration-300",
                        "data-[state=active]:text-white data-[state=active]:shadow-lg",
                        "hover:scale-105 active:scale-95",
                        activeTab === 'current' 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      )}
                    >
                      <Menu className="h-5 w-5 mr-2" />
                      {t('sectionManagement.current', 'Current Sections')}
                      {activeTab === 'current' && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl"
                          transition={{ type: "spring", duration: 0.5 }}
                        />
                      )}
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="available"
                      className={cn(
                        "relative px-6 py-3 rounded-xl font-semibold transition-all duration-300",
                        "data-[state=active]:text-white data-[state=active]:shadow-lg",
                        "hover:scale-105 active:scale-95",
                        activeTab === 'available' 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      )}
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      {ready ? t("sectionManagement.addNew", "Add New") : "Add New"}
                      {activeTab === 'available' && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl"
                          transition={{ type: "spring", duration: 0.5 }}
                        />
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              {/* Current Sections Tab */}
              <TabsContent value="current" className="space-y-6">
                <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-xl overflow-hidden">
                  
                  {/* Tab Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                          <LayoutGrid className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            {ready ? t("sectionManagement.currentSections") : "Current Website Sections"}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400">
                            Manage and reorder your website sections
                          </p>
                        </div>
                        {orderedSections.length > 0 && (
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                            {orderedSections.length} Section{orderedSections.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                          <Input
                            type="search"
                            placeholder={ready ? t("sectionManagement.searchPlaceholder", "Search sections...") : "Search sections..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
                          />
                        </div>

                        {/* Add button */}
                        <Button
                          onClick={() => setActiveTab("available")}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          {ready ? t("sectionManagement.addNew", "Add New") : "Add New"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {!hasWebsite ? (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-center">
                        <AlertTriangle className="h-12 w-12 text-amber-600 dark:text-amber-400 mx-auto mb-4" />
                        <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                          Website Required
                        </h3>
                        <p className="text-amber-700 dark:text-amber-400">
                          Please create a website first to see its sections.
                        </p>
                      </div>
                    ) : filteredCurrentSections.length > 0 ? (
                      <div className="space-y-6">
                        {orderedSections.length > 1 && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                            <ArrowUpDown className="h-4 w-4" />
                            <span>{t('sectionManagement.dragToReorder', 'Drag sections to reorder them')}</span>
                          </div>
                        )}
                        
                        <Reorder.Group 
                          axis="y" 
                          values={orderedSections} 
                          onReorder={handleReorder}
                          className="space-y-4"
                        >
                          {filteredCurrentSections.map((section: Section) => {
                            const visualInfo = getSectionVisualInfo(section);
                            return (
                              <Reorder.Item
                                key={section._id || `section-${section.name}`}
                                value={section}
                                className="cursor-move"
                              >
                                <motion.div
                                  whileHover={{ y: -2 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="group bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-slate-900/20 backdrop-blur-sm overflow-hidden"
                                >
                                  <div className="p-6 flex items-center gap-4">
                                    {/* Drag Handle */}
                                    <div className="text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 p-2 rounded-xl cursor-grab hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                      <GripVertical className="h-5 w-5" />
                                    </div>

                                    {/* Section Icon */}
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${visualInfo.color} shadow-lg`}>
                                      <div className="text-white">
                                        {visualInfo.icon}
                                      </div>
                                    </div>

                                    {/* Section Info */}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                                          {getTranslatedSectionName(section)}
                                        </h3>
                                        <Badge
                                          className={cn(
                                            "transition-colors",
                                            section.isActive 
                                              ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" 
                                              : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700"
                                          )}
                                        >
                                          <div className={cn(
                                            "w-2 h-2 rounded-full mr-2",
                                            section.isActive 
                                              ? "bg-green-500 shadow-green-500/50 shadow-sm" 
                                              : "bg-gray-400"
                                          )} />
                                          {section.isActive ? 
                                            (ready ? t("sectionManagement.active", "Active") : "Active") : 
                                            (ready ? t("sectionManagement.hidden", "Hidden") : "Hidden")
                                          }
                                        </Badge>
                                      </div>
                                      {section.description && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{section.description}</p>
                                      )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                              className="h-10 w-10 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl"
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
                                              className="h-10 w-10 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl"
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
                                </motion.div>
                              </Reorder.Item>
                            );
                          })}
                        </Reorder.Group>
                      </div>
                    ) : searchQuery ? (
                      <div className="text-center py-16">
                        <Search className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          No sections found
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">
                          No sections found matching "{searchQuery}"
                        </p>
                        <Button variant="outline" onClick={() => setSearchQuery("")} className="rounded-xl">
                          Clear search
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center shadow-lg">
                          <LayoutGrid className="h-12 w-12 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                          {ready ? t("sectionManagement.noSectionsYet", "No sections yet") : "No sections yet"}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                          {ready ? t("sectionManagement.noSectionsDescription", "Add pre-designed sections to create your website structure. Sections can be arranged in any order.") : "Add pre-designed sections to create your website structure. Sections can be arranged in any order."}
                        </p>
                        <Button 
                          onClick={() => setActiveTab("available")} 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {ready ? t("sectionManagement.browseSections", "Browse Available Sections") : "Browse Available Sections"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Available Sections Tab */}
              <TabsContent value="available" className="space-y-6">
                <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-xl overflow-hidden">
                  
                  {/* Tab Header */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                          <Plus className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            {ready ? t("sectionManagement.addNewSections", "Add Pre-designed Sections") : "Add Pre-designed Sections"}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400">
                            Choose from our collection of beautiful sections
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                          <Input
                            type="search"
                            placeholder={ready ? t("sectionManagement.searchPlaceholder", "Search sections...") : "Search sections..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
                          />
                        </div>

                        {/* Category filter */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2 min-w-32 justify-between bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl">
                              <span>
                                {ready ? 
                                  t(SECTION_CATEGORIES.find((cat) => cat.value === categoryFilter)?.labelKey || "sectionManagement.categories.all", "All Sections") : 
                                  "All Sections"
                                }
                              </span>
                              <Filter className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {SECTION_CATEGORIES.map((category) => (
                              <DropdownMenuItem
                                key={category.value}
                                onClick={() => setCategoryFilter(category.value)}
                                className={cn(
                                  "cursor-pointer",
                                  categoryFilter === category.value 
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium" 
                                    : "hover:bg-slate-50 dark:hover:bg-slate-700"
                                )}
                              >
                                {categoryFilter === category.value && <Check className="h-4 w-4 mr-2" />}
                                {ready ? t(category.labelKey, category.labelKey.split('.').pop() || '') : category.labelKey.split('.').pop() || ''}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {!hasWebsite && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-center mb-6">
                        <AlertTriangle className="h-12 w-12 text-amber-600 dark:text-amber-400 mx-auto mb-4" />
                        <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                          Website Required
                        </h3>
                        <p className="text-amber-700 dark:text-amber-400">
                          Please create a website first before adding sections.
                        </p>
                      </div>
                    )}

                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {filteredPredefinedSections.map((section) => {
                        const translatedName = ready ? t(section.nameKey, section.nameKey.split('.').pop() || '') : section.nameKey.split('.').pop() || ''
                        const translatedDescription = ready ? t(section.descriptionKey, '') : ''
                        
                        return (
                          <motion.div 
                            key={section.nameKey} 
                            variants={itemVariants} 
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group"
                          >
                            <Card className="h-full shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-slate-200/80 dark:border-slate-700/60 group-hover:border-slate-300 dark:group-hover:border-slate-600 bg-white dark:bg-slate-800/90 backdrop-blur-sm">
                              
                              {/* Section Preview */}
                              <div className={cn(
                                "relative h-40 flex items-center justify-center overflow-hidden",
                                `bg-gradient-to-br ${section.bgColor}`
                              )}>
                                <div className={cn(
                                  "p-4 rounded-2xl bg-gradient-to-br shadow-2xl transition-transform duration-300 group-hover:scale-110",
                                  section.color
                                )}>
                                  <div className="text-white">
                                    {section.icon}
                                  </div>
                                </div>
                                
                                {/* Category Badge */}
                                <Badge 
                                  className={cn(
                                    "absolute top-3 right-3 font-semibold",
                                    section.category === "layout" 
                                      ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50" 
                                      : "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/50"
                                  )}
                                >
                                  {section.category === "layout" ? 
                                    (ready ? t("sectionManagement.categories.layout", "Layout") : "Layout") : 
                                    (ready ? t("sectionManagement.categories.content", "Content") : "Content")
                                  }
                                </Badge>

                                {/* Sparkle effect */}
                                <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Sparkles className="h-5 w-5 text-white animate-pulse" />
                                </div>
                              </div>
                              
                              <CardContent className="p-6">
                                <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 mb-2">
                                  {translatedName}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                  {translatedDescription}
                                </p>
                              </CardContent>
                              
                              <CardFooter className="p-6 pt-0">
                                <Button
                                  onClick={() => handleAddPredefinedSection(section)}
                                  disabled={
                                    createSectionMutation.isPending ||
                                    (createUserSectionMutation && createUserSectionMutation.isPending) ||
                                    !hasWebsite
                                  }
                                  className={cn(
                                    "w-full transition-all duration-300 flex items-center justify-center gap-2 rounded-xl font-semibold py-3",
                                    `bg-gradient-to-r ${section.color}`,
                                    "hover:shadow-lg hover:shadow-current/25 hover:scale-105 active:scale-95",
                                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                  )}
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
                      <div className="text-center py-16">
                        <Search className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          No sections found
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">
                          No sections found matching "{searchQuery}"
                        </p>
                        <Button 
                          variant="outline" 
                          onClick={() => setSearchQuery("")}
                          className="rounded-xl"
                        >
                          Clear Search
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Enhanced Delete Dialog */}
          <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && handleCancelDelete()}>
            <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl">
              <AlertDialogHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Trash className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <AlertDialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {ready ? t("sectionManagement.deleteSection", "Delete Section") : "Delete Section"}
                    </AlertDialogTitle>
                  </div>
                </div>
                <AlertDialogDescription className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {ready ? 
                    t("sectionManagement.deleteConfirmation", "This will permanently delete the section. This action cannot be undone, and any content in this section will be lost.") :
                    "This will permanently delete the section. This action cannot be undone, and any content in this section will be lost."
                  }
                  {itemToDelete && (
                    <span className="font-semibold text-slate-900 dark:text-slate-100"> "{itemToDelete.name}"</span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3 mt-6">
                <AlertDialogCancel 
                  onClick={handleCancelDelete} 
                  className="rounded-xl border-slate-200 dark:border-slate-700"
                >
                  {ready ? t("sectionManagement.cancel", "Cancel") : "Cancel"}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white hover:text-white flex items-center gap-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {deleteSectionMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {ready ? t("sectionManagement.delete", "Delete Section") : "Delete Section"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      </div>
    </div>
  )
}