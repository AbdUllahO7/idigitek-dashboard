"use client"

import { useToast } from "@/src/hooks/use-toast"
import type { Section } from "@/src/api/types/hooks/section.types"
import type { DeleteItemData } from "@/src/api/types/hooks/Common.types"
import { useAuth } from "@/src/context/AuthContext"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Check, Component, LayoutGrid, Loader2, PlusCircle, Trash, Search, Plus } from "lucide-react"
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

interface ManagementProps {
  hasWebsite: boolean
}

// Predefined sections that can be added to the website
const PREDEFINED_SECTIONS = [
  {
    name: "Header",
    description: "Main banner section with heading, subtext, and call to action",
    image: "/sections/hero.jpg",
    icon: <LayoutGrid className="h-10 w-10" />,
  },
  {
    name: "Services",
    description: "Service listings and descriptions",
    image: "/sections/services.jpg",
    icon: <LayoutGrid className="h-10 w-10" />,
  },
  {
    name: "News",
    description: "Latest news and updates",
    image: "/sections/news.jpg",
    icon: <LayoutGrid className="h-10 w-10" />,
  },
  {
    name: "Industry Solutions",
    description: "Latest industry solutions and updates",
    image: "/sections/news.jpg",
    icon: <LayoutGrid className="h-10 w-10" />,
  },
  {
    name: "Choose Us",
    description: "Reasons to choose your company",
    image: "/sections/news.jpg",
    icon: <LayoutGrid className="h-10 w-10" />,
  },
  {
    name: "Projects",
    description: "Showcase your latest projects",
    image: "/sections/news.jpg",
    icon: <LayoutGrid className="h-10 w-10" />,
  },
  {
    name: "Our Process",
    description: "Explain your workflow process",
    image: "/sections/news.jpg",
    icon: <LayoutGrid className="h-10 w-10" />,
  },
  {
    name: "Team",
    description: "Showcase your team members",
    image: "/sections/news.jpg",
    icon: <Component className="h-10 w-10" />,
  },
  {
    name: "Client Comments",
    description: "Testimonials from your clients",
    image: "/sections/news.jpg",
    icon: <Component className="h-10 w-10" />,
  },
  {
    name: "Partners",
    description: "Partners from your clients",
    image: "/sections/news.jpg",
    icon: <Component className="h-10 w-10" />,
  },
]

export function SectionManagement({ hasWebsite }: ManagementProps) {
  const { websiteId } = useWebsiteContext()
  const { user } = useAuth() // Get the current user
  const userId = user?.id || user?.id // Get the user ID

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
  } = useGetByWebsiteId(websiteId, false, hasWebsite)

  const createSectionMutation = useCreateSection()
  const deleteSectionMutation = useDeleteSection()
  const toggleSectionActiveMutation = useToggleSectionActive()

  const [itemToDelete, setItemToDelete] = useState<DeleteItemData | null>(null)
  const { toast } = useToast()
  const [showSavedSuccess, setShowSavedSuccess] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (createSectionMutation.isSuccess || deleteSectionMutation.isSuccess || toggleSectionActiveMutation.isSuccess) {
      refetchSections()
    }
  }, [
    createSectionMutation.isSuccess,
    deleteSectionMutation.isSuccess,
    toggleSectionActiveMutation.isSuccess,
    refetchSections,
  ])

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
    const newSectionData = {
      name: predefinedSection.name,
      description: predefinedSection.description,
      image: predefinedSection.image,
      order: sectionArray.length, // Add to end of current sections
      subSections: [],
      isActive: true, // Default to active
      WebSiteId: websiteId,
    }

    // Check if section with this name already exists
    if (sectionArray?.some((section: Section) => section.name === predefinedSection.name)) {
      toast({
        title: "Duplicate section",
        description: `A section named "${predefinedSection.name}" already exists.`,
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
            description: `${predefinedSection.name} section has been added successfully.`,
          })
          showSuccessMessage()
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
            description: `${predefinedSection.name} section has been added successfully.`,
          })
          showSuccessMessage()

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
    setItemToDelete({
      _id: section._id,
      name: section.name,
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

  // Modified to get sections from the website-specific query result
  const sectionArray = websiteSections?.data || []

  // Filter sections based on search query
  const filteredPredefinedSections = PREDEFINED_SECTIONS.filter(
    (section) =>
      section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredCurrentSections = sectionArray.filter(
    (section: Section) =>
      section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (section.description && section.description.toLowerCase().includes(searchQuery.toLowerCase())),
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
            className="fixed top-4 right-4 z-50 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg shadow-md flex items-center gap-2"
          >
            <Check className="h-5 w-5" />
            <span>Changes saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="search"
          placeholder="Search sections..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Plus className="h-6 w-6 text-primary" />
            Available Sections
          </CardTitle>
          <CardDescription className="text-base">Add pre-designed sections to your website</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {!hasWebsite && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-lg flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p>Please create a website first before adding sections.</p>
            </div>
          )}

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPredefinedSections.map((section) => (
              <motion.div key={section.name} variants={itemVariants} className="relative">
                <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 group border border-slate-200 dark:border-slate-800">
                  <div className="relative h-40 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
                    <div className="text-primary group-hover:scale-110 transition-transform duration-300">
                      {section.icon}
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-lg">{section.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                  </CardContent>
                  <CardFooter className="p-5 pt-0 flex justify-end">
                    <Button
                      onClick={() => handleAddPredefinedSection(section)}
                      disabled={
                        createSectionMutation.isPending ||
                        (createUserSectionMutation && createUserSectionMutation.isPending) ||
                        !hasWebsite
                      }
                      className="transition-all duration-300 group-hover:bg-primary/90"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Section
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredPredefinedSections.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No sections found matching "{searchQuery}"</p>
              <Button variant="link" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <LayoutGrid className="h-6 w-6 text-primary" />
            Current Website Sections
          </CardTitle>
          <CardDescription className="text-base">
            {sectionArray.length > 0
              ? `Manage your website's ${sectionArray.length} section${sectionArray.length === 1 ? "" : "s"}`
              : "Add your first section from above"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {!hasWebsite ? (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-lg flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p>Please create a website first to see its sections.</p>
            </div>
          ) : filteredCurrentSections.length > 0 ? (
            <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" variants={containerVariants}>
              {filteredCurrentSections.map((section: Section) => (
                <motion.div key={section._id || `section-${section.name}`} variants={itemVariants}>
                  <Card className="border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300 overflow-hidden">
                    <div className="p-5 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{section.name}</h3>
                          {section.description && (
                            <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                          )}
                        </div>
                        <Badge className="ml-2">
                          {section.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="mt-auto pt-4 flex justify-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleOpenDelete(section)}
                          disabled={!hasWebsite}
                          className="flex items-center gap-1.5"
                        >
                          <Trash className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : searchQuery ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No sections found matching "{searchQuery}"</p>
              <Button variant="link" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium mb-2">No sections found</p>
              <p>Add your first section from the available options above.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && handleCancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the section "{itemToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 flex items-center gap-2"
            >
              {deleteSectionMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
