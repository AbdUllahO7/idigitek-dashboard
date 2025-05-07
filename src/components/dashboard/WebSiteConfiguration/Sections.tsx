// Section Management Component
import { useToast } from "@/src/hooks/use-toast"
import { Section } from "@/src/api/types/hooks/section.types"
import { DeleteItemData, EditItemData } from "@/src/api/types/hooks/Common.types"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Checkbox } from "@/src/components/ui/checkbox"
import { useSections } from "@/src/hooks/webConfiguration/use-section"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Check, LayoutGrid, Loader2, Plus, ToggleLeft, ToggleRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"


interface ManagementProps {
    hasWebsite: boolean
}

export function SectionManagement({ hasWebsite }: ManagementProps) {
    const { 
      useGetAll: useGetAllSections,
      useCreate: useCreateSection,
      useUpdate: useUpdateSection,
      useDelete: useDeleteSection,
      useToggleActive: useToggleSectionActive
    } = useSections();
  
    const { 
      data: sections, 
      isLoading: isLoadingSections,
      error: sectionsError,
      refetch: refetchSections
    } = useGetAllSections();
  
    const createSectionMutation = useCreateSection();
    const updateSectionMutation = useUpdateSection();
    const deleteSectionMutation = useDeleteSection();
    const toggleSectionActiveMutation = useToggleSectionActive();
  
    const [newSection, setNewSection] = useState<Section>({ 
      name: "", 
      description: "", 
      image: "",
      order: 0,
      subSections: [],
      isActive: false
    });
    
    const [editItem, setEditItem] = useState<EditItemData | null>(null);
    const [itemToDelete, setItemToDelete] = useState<DeleteItemData | null>(null);
    const { toast } = useToast();
    const [showSavedSuccess, setShowSavedSuccess] = useState(false);
  
    useEffect(() => {
      if (createSectionMutation.isSuccess || updateSectionMutation.isSuccess || 
          deleteSectionMutation.isSuccess || toggleSectionActiveMutation.isSuccess) {
        refetchSections();
      }
    }, [
      createSectionMutation.isSuccess,
      updateSectionMutation.isSuccess,
      deleteSectionMutation.isSuccess,
      toggleSectionActiveMutation.isSuccess,
      refetchSections
    ]);
  
    const handleAddSection = () => {
      if (!newSection.name) {
        toast({
          title: "Invalid input",
          description: "Please enter a name for the section.",
          variant: "destructive",
        });
        return;
      }
      if (sectionArray?.some((section: Section) => section.name === newSection.name)) {
        toast({
          title: "Duplicate name",
          description: "A section with this name already exists.",
          variant: "destructive",
        });
        return;
      }
  
      createSectionMutation.mutate(newSection, {
        onSuccess: () => {
          setNewSection({ 
            name: "", 
            description: "", 
            image: "",
            order: 0,
            subSections: [],
            isActive: false
          });
          toast({
            title: "Section added",
            description: `${newSection.name} has been added successfully.`,
          });
          showSuccessMessage();
        },
        onError: (error: Error) => {
          toast({
            title: "Error adding section",
            description: error.message || "An error occurred while adding the section.",
            variant: "destructive",
          });
        }
      });
    };
  
    const handleEdit = (section: Section) => {
      setEditItem({ 
        _id: section._id,
        section_name: section.name,
        image: section.image || "",
        description: section.description,
        isActive: section.isActive,
        type: "section"
      });
    };
  
    const handleToggleActive = (id: string, isActive: boolean) => {
      toggleSectionActiveMutation.mutate(
        { id, isActive: !isActive },
        {
          onSuccess: () => {
            toast({
              title: `Section ${!isActive ? "activated" : "deactivated"}`,
              description: `The section has been ${!isActive ? "activated" : "deactivated"} successfully.`,
            });
          },
          onError: (error: Error) => {
            toast({
              title: "Error updating section",
              description: error.message || "An error occurred while updating the section status.",
              variant: "destructive",
            });
          }
        }
      );
    };
  
    const handleSaveEdit = () => {
      if (!editItem || !editItem._id || editItem.type !== "section") {
        toast({
          title: "Invalid input",
          description: "Missing required fields for update.",
          variant: "destructive",
        });
        return;
      }
  
      if (!editItem.section_name) {
        toast({
          title: "Invalid input",
          description: "Please enter a name for the section.",
          variant: "destructive",
        });
        return;
      }
  
      const originalItem = sectionArray.find((item: Section) => item._id === editItem._id);
      if (originalItem && editItem.section_name !== originalItem.name && 
          sectionArray.some((item: Section) => item.name === editItem.section_name)) {
        toast({
          title: "Duplicate name",
          description: "A section with this name already exists.",
          variant: "destructive",
        });
        return;
      }
  
      const updateData = {
        id: editItem._id,
        data: {
          section_name: editItem.section_name,
          description: editItem.description,
          image: editItem.image,
          isActive: editItem.isActive
        }
      };
  
      updateSectionMutation.mutate(updateData, {
        onSuccess: () => {
          setEditItem(null);
          toast({
            title: "Section updated",
            description: "The section has been updated successfully.",
          });
          showSuccessMessage();
        },
        onError: (error: Error) => {
          toast({
            title: "Error updating section",
            description: error.message || "An error occurred while updating the section.",
            variant: "destructive",
          });
        }
      });
    };
  
    const confirmDelete = () => {
      if (itemToDelete && itemToDelete._id && itemToDelete.type === "section") {
        deleteSectionMutation.mutate(itemToDelete._id, {
          onSuccess: () => {
            toast({
              title: "Section deleted",
              description: `The section has been deleted successfully.`,
            });
            setItemToDelete(null);
            showSuccessMessage();
          },
          onError: (error: Error) => {
            toast({
              title: "Error deleting section",
              description: error.message || "An error occurred while deleting the section.",
              variant: "destructive",
            });
          }
        });
      }
    };
    
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
        },
      },
    };
  
    const showSuccessMessage = () => {
      setShowSavedSuccess(true);
      setTimeout(() => {
        setShowSavedSuccess(false);
      }, 3000);
    };
  
    const sectionArray = sections?.data || [];
    if (isLoadingSections) return <div className="text-center py-8">Loading sections...</div>;
    if (sectionsError) return <div className="text-center py-8 text-red-500">Error: {(sectionsError as Error).message}</div>;
    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 300, damping: 15 },
      },
    };
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
  
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Add New Section
            </CardTitle>
            <CardDescription>
              Enter the details for a new website section
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasWebsite && (
              <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg">
                Please create a website first before adding sections.
              </div>
            )}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-section-name">Section Name</Label>
                  <Input
                    id="new-section-name"
                    placeholder="e.g. Hero, Features"
                    value={newSection.name}
                    onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                    className="w-full"
                    disabled={!hasWebsite}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-section-description">Description</Label>
                  <Input
                    id="new-section-description"
                    placeholder="Brief description of this section"
                    value={newSection.description || ""}
                    onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                    className="w-full"
                    disabled={!hasWebsite}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox 
                    id="new-section-active"
                    checked={newSection.isActive || false}
                    onCheckedChange={(checked) => 
                      setNewSection({ ...newSection, isActive: checked === true })
                    }
                    disabled={!hasWebsite}
                  />
                  <Label htmlFor="new-section-active">Active</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Section Image</Label>
                {/* <ImageUpload
                  value={newSection.image} 
                  onChange={(url) => setNewSection({ ...newSection, image: url })} 
                  disabled={!hasWebsite}
                /> */}
                <p className="text-xs text-slate-500 mt-2">
                  Add an image for this section (optional)
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleAddSection} 
              className="flex items-center gap-2"
              disabled={createSectionMutation.isPending || !hasWebsite}
            >
              {createSectionMutation.isPending ? 
                <Loader2 className="h-4 w-4 animate-spin" /> : 
                <Plus className="h-4 w-4" />
              }
              Add Section
            </Button>
          </CardFooter>
        </Card>
  
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Manage Sections
            </CardTitle>
            <CardDescription>
              Edit or remove existing sections ({sectionArray.length} total)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sectionArray.length > 0 ? (
              <motion.div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3" variants={containerVariants}>
                {sectionArray.map((section: Section) => (
                  <motion.div key={section._id || `section-${section.name}`} variants={itemVariants}>
                    <Card className="border border-slate-200 dark:border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{section.name}</p>
                              {section.description && (
                                <p className="text-sm text-slate-500">{section.description}</p>
                              )}
                              <div className="mt-2">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                  section.isActive 
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                }`}>
                                  {section.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleToggleActive(section._id as string, section.isActive || false)}
                                disabled={toggleSectionActiveMutation.isPending || !hasWebsite}
                              >
                                {section.isActive ? 
                                  <ToggleRight className="h-4 w-4 text-green-600" /> : 
                                  <ToggleLeft className="h-4 w-4 text-slate-600" />
                                }
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                <p>No sections found. Add your first section above.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }