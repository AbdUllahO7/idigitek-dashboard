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
// Language Management Component
import { useLanguages } from "@/src/hooks/webConfiguration/use-language"
import { Language } from "@/src/api/types/hooks/language.types"
import { useEffect, useState } from "react"
import { DeleteItemData, EditItemData } from "@/src/api/types/hooks/Common.types"
import { useToast } from "@/src/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Check, Edit, Globe, Loader2, Plus, Save, ToggleLeft, ToggleRight, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card"
import { Label } from "../../ui/label"
import { Input } from "../../ui/input"
import { Checkbox } from "../../ui/checkbox"
import { Button } from "../../ui/button"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"

interface ManagementProps {
  hasWebsite: boolean
}

export function LanguageManagement({ hasWebsite }: ManagementProps) {
  const { websiteId } = useWebsiteContext();
  
  const { 
    useGetByWebsite,
    useCreate: useCreateLanguage,
    useUpdate: useUpdateLanguage,
    useDelete: useDeleteLanguage,
    useToggleActive: useToggleLanguageActive
  } = useLanguages();

  const { 
    data: languages, 
    isLoading: isLoadingLanguages,
    error: languagesError,
    refetch: refetchLanguages
  } = useGetByWebsite(websiteId);

  const createLanguageMutation = useCreateLanguage();
  const updateLanguageMutation = useUpdateLanguage();
  const deleteLanguageMutation = useDeleteLanguage();
  const toggleLanguageActiveMutation = useToggleLanguageActive();

  const [newLanguage, setNewLanguage] = useState<Language>({
    _id: "", 
    languageID: "", 
    language: "", 
    subSections: [],
    isActive: false,
    websiteId: ""
  });
  
  // Update newLanguage when websiteId changes
  useEffect(() => {
    if (websiteId) {
      setNewLanguage(prev => ({
        ...prev,
        websiteId
      }));
    }
  }, [websiteId]);

  const [editItem, setEditItem] = useState<EditItemData | null>(null);
  const [itemToDelete, setItemToDelete] = useState<DeleteItemData | null>(null);
  const { toast } = useToast();
  const [showSavedSuccess, setShowSavedSuccess] = useState(false);

  useEffect(() => {
    if (createLanguageMutation.isSuccess || updateLanguageMutation.isSuccess || 
        deleteLanguageMutation.isSuccess || toggleLanguageActiveMutation.isSuccess) {
      refetchLanguages();
    }
  }, [
    createLanguageMutation.isSuccess, 
    updateLanguageMutation.isSuccess, 
    deleteLanguageMutation.isSuccess,
    toggleLanguageActiveMutation.isSuccess,
    refetchLanguages
  ]);

  const handleAddLanguage = () => {
    if (!newLanguage.languageID || !newLanguage.language) {
      toast({
        title: "Invalid input",
        description: "Please enter both ID and name for the language.",
        variant: "destructive",
      });
      return;
    }

    if (!websiteId) {
      toast({
        title: "Website required",
        description: "Please select a website first.",
        variant: "destructive",
      });
      return;
    }

    if (languageArray?.some((lang: Language) => lang.languageID === newLanguage.languageID)) {
      toast({
        title: "Duplicate ID",
        description: "A language with this ID already exists for this website.",
        variant: "destructive",
      });
      return;
    }

    // Create language with websiteId
    const languageToCreate = {
      ...newLanguage,
      websiteId
    };

    createLanguageMutation.mutate(languageToCreate, {
      onSuccess: () => {
        setNewLanguage({
          _id: "", 
          languageID: "", 
          language: "", 
          subSections: [], 
          isActive: false,
          websiteId
        });
        toast({
          title: "Language added",
          description: `${newLanguage.language} has been added successfully.`,
        });
        showSuccessMessage();
      },
      onError: (error: Error) => {
        toast({
          title: "Error adding language",
          description: error.message || "An error occurred while adding the language.",
          variant: "destructive",
        });
      }
    });
  };

  const handleEdit = (language: Language) => {
    setEditItem({ 
      _id: language._id,
      languageID: language.languageID,
      language: language.language,
      isActive: language.isActive,
      type: "language",
      websiteId: language.websiteId
    });
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    toggleLanguageActiveMutation.mutate(
      { id, isActive: !isActive },
      {
        onSuccess: () => {
          toast({
            title: `Language ${!isActive ? "activated" : "deactivated"}`,
            description: `The language has been ${!isActive ? "activated" : "deactivated"} successfully.`,
          });
        },
        onError: (error: Error) => {
          toast({
            title: "Error updating language",
            description: error.message || "An error occurred while updating the language status.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const handleSaveEdit = () => {
    if (!editItem || !editItem._id || editItem.type !== "language") {
      toast({
        title: "Invalid input",
        description: "Missing required fields for update.",
        variant: "destructive",
      });
      return;
    }

    if (!editItem.languageID || !editItem.language) {
      toast({
        title: "Invalid input",
        description: "Please enter both ID and name for the language.",
        variant: "destructive",
      });
      return;
    }

    const originalItem = languageArray.find((item: Language) => item._id === editItem._id);
    if (originalItem && editItem.languageID !== originalItem.languageID && 
        languageArray.some((item: Language) => item.languageID === editItem.languageID)) {
      toast({
        title: "Duplicate ID",
        description: "A language with this ID already exists for this website.",
        variant: "destructive",
      });
      return;
    }

    const updateData = {
      id: editItem._id,
      data: {
        languageID: editItem.languageID,
        language: editItem.language,
        isActive: editItem.isActive,
        // Keep the same websiteId
        websiteId: editItem.websiteId
      }
    };

    updateLanguageMutation.mutate(updateData, {
      onSuccess: () => {
        setEditItem(null);
        toast({
          title: "Language updated",
          description: "The language has been updated successfully.",
        });
        showSuccessMessage();
      },
      onError: (error: Error) => {
        toast({
          title: "Error updating language",
          description: error.message || "An error occurred while updating the language.",
          variant: "destructive",
        });
      }
    });
  };

  const confirmDelete = () => {
    if (itemToDelete && itemToDelete._id && itemToDelete.type === "language") {
      deleteLanguageMutation.mutate(itemToDelete._id, {
        onSuccess: () => {
          toast({
            title: "Language deleted",
            description: `The language has been deleted successfully.`,
          });
          setItemToDelete(null);
          showSuccessMessage();
        },
        onError: (error: Error) => {
          toast({
            title: "Error deleting language",
            description: error.message || "An error occurred while deleting the language.",
            variant: "destructive",
          });
        }
      });
    }
  };

  const showSuccessMessage = () => {
    setShowSavedSuccess(true);
    setTimeout(() => {
      setShowSavedSuccess(false);
    }, 3000);
  };

  const languageArray = languages?.data || [];
  
  // Display a message if no website is selected
  const noWebsiteSelected = !websiteId || websiteId === "";
  
  if (isLoadingLanguages) return <div className="text-center py-8">Loading languages...</div>;
  if (languagesError) return <div className="text-center py-8 text-red-500">Error: {(languagesError as Error).message}</div>;
  
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
            <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Add New Language
          </CardTitle>
          <CardDescription>
            Enter the details for a new language to support on your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasWebsite || noWebsiteSelected ? (
            <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg">
              {!hasWebsite ? "Please create a website first before adding languages." : "Please select a website before adding languages."}
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-language-id">Language ID (code)</Label>
              <Input
                id="new-language-id"
                placeholder="e.g. en, fr, es"
                value={newLanguage.languageID}
                onChange={(e) => setNewLanguage({ ...newLanguage, languageID: e.target.value.toLowerCase() })}
                className="w-full"
                disabled={!hasWebsite || noWebsiteSelected}
              />
              <p className="text-xs text-slate-500">
                Use a standard language code (e.g., "en" for English)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-language-name">Language Name</Label>
              <Input
                id="new-language-name"
                placeholder="e.g. English, French"
                value={newLanguage.language}
                onChange={(e) => setNewLanguage({ ...newLanguage, language: e.target.value })}
                className="w-full"
                disabled={!hasWebsite || noWebsiteSelected}
              />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="new-language-active"
                checked={newLanguage.isActive || false}
                onCheckedChange={(checked) => 
                  setNewLanguage({ ...newLanguage, isActive: checked === true })
                }
                disabled={!hasWebsite || noWebsiteSelected}
              />
              <Label htmlFor="new-language-active">Active</Label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleAddLanguage} 
            className="flex items-center gap-2"
            disabled={createLanguageMutation.isPending || !hasWebsite || noWebsiteSelected}
          >
            {createLanguageMutation.isPending ? 
              <Loader2 className="h-4 w-4 animate-spin" /> : 
              <Plus className="h-4 w-4" />
            }
            Add Language
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Manage Languages
          </CardTitle>
          <CardDescription>
            {websiteId ? 
              `Edit or remove existing languages (${languageArray.length} total)` : 
              "Select a website to manage its languages"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {noWebsiteSelected ? (
            <div className="text-center py-8 text-slate-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
              <p>No website selected. Please select a website to view its languages.</p>
            </div>
          ) : languageArray.length > 0 ? (
            <motion.div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3" variants={containerVariants}>
              {languageArray.map((language: Language) => (
                <motion.div key={language._id || `lang-${language.languageID}`} variants={itemVariants}>
                  <Card className="border border-slate-200 dark:border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{language.language}</p>
                          <p className="text-sm text-slate-500">ID: {language.languageID}</p>
                          <div className="mt-2">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              language.isActive 
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                            }`}>
                              {language.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleToggleActive(language._id as string, language.isActive || false)}
                            disabled={toggleLanguageActiveMutation.isPending || !hasWebsite}
                          >
                            {language.isActive ? 
                              <ToggleRight className="h-4 w-4 text-green-600" /> : 
                              <ToggleLeft className="h-4 w-4 text-slate-600" />
                            }
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8" 
                                onClick={() => handleEdit(language)}
                                disabled={!hasWebsite}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Language</DialogTitle>
                                <DialogDescription>
                                  Make changes to the language details below.
                                </DialogDescription>
                              </DialogHeader>
                              {editItem && editItem.type === "language" && (
                                <div className="grid gap-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-language-id">Language ID</Label>
                                    <Input
                                      id="edit-language-id"
                                      value={editItem.languageID}
                                      onChange={(e) => 
                                        setEditItem({ ...editItem, languageID: e.target.value.toLowerCase() })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-language-name">Language Name</Label>
                                    <Input
                                      id="edit-language-name"
                                      value={editItem.language}
                                      onChange={(e) => setEditItem({ ...editItem, language: e.target.value })}
                                    />
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
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                  <Button 
                                    onClick={handleSaveEdit} 
                                    disabled={updateLanguageMutation.isPending}
                                  >
                                    {updateLanguageMutation.isPending ? 
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 
                                      <Save className="h-4 w-4 mr-2" />
                                    }
                                    Save Changes
                                  </Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => setItemToDelete({ ...language, type: "language" })}
                                disabled={!hasWebsite}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Language</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{language.language}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={confirmDelete}
                                  className="bg-red-500 hover:bg-red-600"
                                  disabled={deleteLanguageMutation.isPending}
                                >
                                  {deleteLanguageMutation.isPending ? 
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 
                                    null
                                  }
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
              <p>No languages found for this website. Add your first language above.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}