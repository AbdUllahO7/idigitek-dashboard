"use client"

import type { WebSiteProps } from "@/src/api/types/hooks/WebSite.types"
import { useWebSite } from "@/src/hooks/webConfiguration/use-WebSite"
import WebSiteImageUploader from "@/src/app/dashboard/services/addService/Utils/WebSiteImageUploader"
import { toast } from "@/src/hooks/use-toast"
import type React from "react"
import { useEffect, useState } from "react"
import { PlusCircle, Edit2, Trash2, Upload, X, Save, ArrowLeft } from "lucide-react"
import DeleteSectionDialog from "../../DeleteSectionDialog"
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/src/context/LanguageContext"

const WebsiteImageExampleFixed: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newWebsite, setNewWebsite] = useState<Omit<WebSiteProps, "_id">>({
    name: "",
    description: "",
    logo: "",
    sector: "",
    phoneNumber: "",
    email: "",
    address: ""
  })
  const [editingWebsite, setEditingWebsite] = useState<WebSiteProps | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState<Record<string, boolean>>({})
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [websiteToDelete, setWebsiteToDelete] = useState<WebSiteProps | null>(null)

  const { useGetMyWebsites, useCreate, useUpdate, useUploadLogo, useDelete } = useWebSite()
  const { t } = useTranslation()
  const { language } = useLanguage()
  const isRTL = language === 'ar'

  const { data: websites = [], isLoading, isError, error } = useGetMyWebsites()

  const createMutation = useCreate()
  const updateMutation = useUpdate()
  const uploadLogoMutation = useUploadLogo()
  const deleteMutation = useDelete()
    useEffect(() => {
      // Cleanup function to revoke blob URLs when component unmounts
      return () => {
        if (editingWebsite?.logo && editingWebsite.logo.startsWith("blob:")) {
          URL.revokeObjectURL(editingWebsite.logo)
        }
        if (newWebsite.logo && newWebsite.logo.startsWith("blob:")) {
          URL.revokeObjectURL(newWebsite.logo)
        }
      }
    }, [editingWebsite?.logo, newWebsite.logo])
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { logo, ...websiteData } = newWebsite

    createMutation.mutate(websiteData, {
      onSuccess: (createdWebsite) => {
        if (newLogoFile && createdWebsite?._id) {
          handleLogoUpload(createdWebsite._id, newLogoFile)
        }
        setShowCreateForm(false)
        setNewWebsite({ name: "", description: "", logo: "", sector: "", phoneNumber: "", email: "", address: "" })
        setNewLogoFile(null)
        toast({
          title: t('websiteList.toastMessages.websiteCreated'),
          description: t('websiteList.toastMessages.websiteCreatedDesc'),
        })
      },
    })
  }

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingWebsite && editingWebsite._id) {
      updateMutation.mutate(
        {
          id: editingWebsite._id,
          data: {
            name: editingWebsite.name,
            description: editingWebsite.description,
            sector: editingWebsite.sector,
            phoneNumber: editingWebsite.phoneNumber,
            email: editingWebsite.email,
            address: editingWebsite.address
          },
        },
        {
          onSuccess: () => {
            setEditingWebsite(null)
            toast({
              title: t('websiteList.toastMessages.websiteUpdated'),
              description: t('websiteList.toastMessages.websiteUpdatedDesc'),
            })
          },
        },
      )
    }
  }

  const openDeleteDialog = (website: WebSiteProps) => {
    setWebsiteToDelete(website)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (websiteToDelete && websiteToDelete._id) {
      return new Promise<void>((resolve) => {
        if(websiteToDelete._id) {
          deleteMutation.mutate(websiteToDelete._id, {
            onSuccess: () => {
              toast({
                title: t('websiteList.toastMessages.websiteDeleted'),
                description: t('websiteList.toastMessages.websiteDeletedDesc'),
              })
              resolve()
            },
            onError: () => {
              toast({
                title: t('websiteList.toastMessages.deleteFailed'),
                description: t('websiteList.toastMessages.deleteFailedDesc'),
                variant: "destructive",
              })
              resolve()
            },
          })
        }
      })
    }
    return Promise.resolve()
  }

  const handleNewLogoSelect = (file: File) => {
    setNewLogoFile(file)
    const previewUrl = URL.createObjectURL(file)
    setNewWebsite({ ...newWebsite, logo: previewUrl })
  }

  const handleNewLogoRemove = () => {
    if (newWebsite.logo && newWebsite.logo.startsWith("blob:")) {
      URL.revokeObjectURL(newWebsite.logo)
    }
    setNewLogoFile(null)
    setNewWebsite({ ...newWebsite, logo: "" })
  }

  const handleLogoUpload = (websiteId: string, file: File) => {
    setUploadingLogo((prev) => ({ ...prev, [websiteId]: true }))
    
    // Create a preview URL for immediate display
    const previewUrl = URL.createObjectURL(file)
    
    // Update the editingWebsite state immediately if we're editing this website
    if (editingWebsite && editingWebsite._id === websiteId) {
      setEditingWebsite({ ...editingWebsite, logo: previewUrl })
    }
    
    uploadLogoMutation.mutate(
      { id: websiteId, file },
      {
        onSuccess: (response) => {
          setUploadingLogo((prev) => ({ ...prev, [websiteId]: false }))
          
          // Clean up the preview URL
          URL.revokeObjectURL(previewUrl)
          
          // Update with the actual server URL if available
          if (editingWebsite && editingWebsite._id === websiteId && response?.logo) {
            setEditingWebsite({ ...editingWebsite, logo: response.logo })
          }
          
          toast({
            title: t('websiteList.toastMessages.logoUploaded'),
            description: t('websiteList.toastMessages.logoUploadedDesc'),
          })
        },
        onError: (error) => {
          setUploadingLogo((prev) => ({ ...prev, [websiteId]: false }))
          
          // Clean up the preview URL and revert the logo on error
          URL.revokeObjectURL(previewUrl)
          if (editingWebsite && editingWebsite._id === websiteId) {
            // Revert to the original logo from the websites list
            const originalWebsite = websites.find((w: { _id: string }) => w._id === websiteId)
            setEditingWebsite({ ...editingWebsite, logo: originalWebsite?.logo || "" })
          }
          
          toast({
            title: t('websiteList.toastMessages.uploadFailed'),
            description: t('websiteList.toastMessages.uploadFailedDesc'),
            variant: "destructive",
          })
        },
      },
    )
  }

  const handleLogoRemove = (websiteId: string) => {
    // Update the editingWebsite state immediately if we're editing this website
    if (editingWebsite && editingWebsite._id === websiteId) {
      setEditingWebsite({ ...editingWebsite, logo: "" })
    }
    
    updateMutation.mutate(
      {
        id: websiteId,
        data: { logo: "" },
      },
      {
        onSuccess: () => {
          toast({
            title: t('websiteList.toastMessages.logoRemoved'),
            description: t('websiteList.toastMessages.logoRemovedDesc'),
          })
        },
        onError: (error) => {
          // Revert the logo on error
          if (editingWebsite && editingWebsite._id === websiteId) {
            const originalWebsite = websites.find((w: { _id: string }) => w._id === websiteId)
            setEditingWebsite({ ...editingWebsite, logo: originalWebsite?.logo || "" })
          }
          
          toast({
            title: t('websiteList.toastMessages.removeFailed'),
            description: t('websiteList.toastMessages.removeFailedDesc'),
            variant: "destructive",
          })
        },
      },
    )
  }

  const validateImageFile = (file: File): boolean | string => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"]
    if (!validTypes.includes(file.type)) {
      return t('websiteList.validation.invalidImageType')
    }
    if (file.size > 2 * 1024 * 1024) {
      return t('websiteList.validation.imageTooLarge')
    }
    return true
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      )
    }

    if (isError) {
      return (
        <div className="text-center py-8 text-red-500">
          <div className="mb-4">
            <X className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-xl font-medium mb-2">{t('websiteList.errorLoadingTitle')}</h3>
          <p>{error?.message}</p>
        </div>
      )
    }

    if (showCreateForm) {
      return (
        <div className="space-y-6">
          <div className={`flex items-center mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={() => setShowCreateForm(false)}
              className={`${isRTL ? 'ml-3' : 'mr-3'} text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors`}
            >
              <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t('websiteList.createNewWebsite')}
            </h2>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('websiteList.form.labels.name')}
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                value={newWebsite.name}
                onChange={(e) => setNewWebsite({ ...newWebsite, name: e.target.value })}
                required
                placeholder={t('websiteList.form.placeholders.name')}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('websiteList.form.labels.description')}
              </label>
              <textarea
                className="w-full p-3 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                value={newWebsite.description || ""}
                onChange={(e) => setNewWebsite({ ...newWebsite, description: e.target.value })}
                rows={3}
                placeholder={t('websiteList.form.placeholders.description')}
              />
            </div>
            <div>
              <WebSiteImageUploader
                label={t('websiteList.form.labels.logo')}
                helperText={t('websiteList.form.helperText.logoUpload')}
                imageUrl={newWebsite.logo}
                onImageSelect={handleNewLogoSelect}
                onImageRemove={handleNewLogoRemove}
                imageHeight="h-32"
                placeholderText={t('websiteList.form.helperText.logoPlaceholder')}
                acceptedTypes="image/png,image/jpeg,image/svg+xml"
                validate={validateImageFile}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('websiteList.form.labels.sector')}
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                value={newWebsite.sector || ""}
                onChange={(e) => setNewWebsite({ ...newWebsite, sector: e.target.value })}
                placeholder={t('websiteList.form.placeholders.sector')}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('websiteList.form.labels.phoneNumber')}
              </label>
              <input
                type="tel"
                className="w-full p-3 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                value={newWebsite.phoneNumber || ""}
                onChange={(e) => setNewWebsite({ ...newWebsite, phoneNumber: e.target.value })}
                placeholder={t('websiteList.form.placeholders.phoneNumber')}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('websiteList.form.labels.email')}
              </label>
              <input
                type="email"
                className="w-full p-3 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                value={newWebsite.email || ""}
                onChange={(e) => setNewWebsite({ ...newWebsite, email: e.target.value })}
                placeholder={t('websiteList.form.placeholders.email')}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('websiteList.form.labels.address')}
              </label>
              <textarea
                className="w-full p-3 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                value={newWebsite.address || ""}
                onChange={(e) => setNewWebsite({ ...newWebsite, address: e.target.value })}
                rows={3}
                placeholder={t('websiteList.form.placeholders.address')}
              />
            </div>
            <div className={`flex justify-end space-x-3 pt-4 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <button
                type="button"
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-all duration-200"
                onClick={() => {
                  if (newWebsite.logo && newWebsite.logo.startsWith("blob:")) {
                    URL.revokeObjectURL(newWebsite.logo)
                  }
                  setShowCreateForm(false)
                  setNewWebsite({ name: "", description: "", logo: "", sector: "", phoneNumber: "", email: "", address: "" })
                  setNewLogoFile(null)
                }}
              >
                {t('websiteList.buttons.cancel')}
              </button>
              <button
                type="submit"
                className={`px-6 py-2.5 rounded-lg bg-teal-500 text-white hover:bg-teal-600 focus:ring-2 focus:ring-teal-300 disabled:opacity-50 transition-all duration-200 flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <div className={`animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white ${isRTL ? 'ml-2' : 'mr-2'}`}></div>
                    {t('websiteList.loadingStates.creating')}
                  </>
                ) : (
                  <>
                    <PlusCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('websiteList.buttons.createWebsite')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )
    }

    if (editingWebsite) {
      return (
        <div className="space-y-6">
          <div className={`flex items-center mb-2 ${isRTL ? '' : ''}`}>
            <button
              onClick={() => setEditingWebsite(null)}
              className={`${isRTL ? 'ml-3' : 'mr-3'} text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors`}
            >
              <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
            <h2 className={`text-2xl font-semibold text-gray-900 dark:text-white ${isRTL ? 'flex-row-reverse' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
              {t('websiteList.editWebsite')}
            </h2>
          </div>

          <form onSubmit={handleUpdateSubmit} className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('websiteList.form.labels.name')}
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                value={editingWebsite.name}
                onChange={(e) => setEditingWebsite({ ...editingWebsite, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('websiteList.form.labels.description')}
              </label>
              <textarea
                className="w-full p-3 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                value={editingWebsite.description || ""}
                onChange={(e) => setEditingWebsite({ ...editingWebsite, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('websiteList.form.labels.sector')}
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                value={editingWebsite.sector || ""}
                onChange={(e) => setEditingWebsite({ ...editingWebsite, sector: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('websiteList.form.labels.phoneNumber')}
              </label>
              <input
                type="tel"
                className="w-full p-3 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                value={editingWebsite.phoneNumber || ""}
                onChange={(e) => setEditingWebsite({ ...editingWebsite, phoneNumber: e.target.value })}
                placeholder={t('websiteList.form.placeholders.phoneNumber')}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('websiteList.form.labels.email')}
              </label>
              <input
                type="email"
                className="w-full p-3 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                value={editingWebsite.email || ""}
                onChange={(e) => setEditingWebsite({ ...editingWebsite, email: e.target.value })}
                placeholder={t('websiteList.form.placeholders.email')}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('websiteList.form.labels.address')}
              </label>
              <textarea
                className="w-full p-3 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                value={editingWebsite.address || ""}
                onChange={(e) => setEditingWebsite({ ...editingWebsite, address: e.target.value })}
                rows={3}
                placeholder={t('websiteList.form.placeholders.address')}
              />
            </div>

            {editingWebsite.logo && (
              <div className="mt-4">
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('websiteList.form.labels.logo')}
                </label>
                <div className={`flex items-center space-x-4 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <img
                    src={editingWebsite.logo || "/placeholder.svg"}
                    alt={`${editingWebsite.name} logo`}
                    className="h-16 w-16 object-contain rounded-lg bg-gray-100 dark:bg-gray-700 p-1"
                  />
                  <div className={`flex space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                    <button
                      type="button"
                      className={`px-3 py-1.5 text-xs rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}
                      onClick={() => document.getElementById(`logo-upload-${editingWebsite._id}`)?.click()}
                      disabled={editingWebsite._id ? uploadingLogo[editingWebsite._id] : false}
                    >
                      <Upload className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {t('websiteList.buttons.change')}
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1.5 text-xs rounded-md bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}
                      onClick={() => editingWebsite._id && handleLogoRemove(editingWebsite._id)}
                      disabled={editingWebsite._id ? uploadingLogo[editingWebsite._id] : false}
                    >
                      <X className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {t('websiteList.buttons.remove')}
                    </button>
                  </div>
                  <input
                    id={`logo-upload-${editingWebsite._id}`}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file && editingWebsite._id) {
                        const validationResult = validateImageFile(file)
                        if (validationResult === true) {
                          handleLogoUpload(editingWebsite._id, file)
                        } else {
                          toast({
                            title: t('websiteList.validation.invalidFile'),
                            description: validationResult as string,
                            variant: "destructive",
                          })
                        }
                      }
                    }}
                    disabled={editingWebsite._id ? uploadingLogo[editingWebsite._id] : false}
                  />
                </div>
              </div>
            )}

            <div className={`flex justify-end space-x-3 pt-4 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <button
                type="button"
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-all duration-200"
                onClick={() => setEditingWebsite(null)}
              >
                {t('websiteList.buttons.cancel')}
              </button>
              <button
                type="submit"
                className={`px-6 py-2.5 rounded-lg bg-teal-500 text-white hover:bg-teal-600 focus:ring-2 focus:ring-teal-300 disabled:opacity-50 transition-all duration-200 flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <div className={`animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white ${isRTL ? 'ml-2' : 'mr-2'}`}></div>
                    {t('websiteList.loadingStates.saving')}
                  </>
                ) : (
                  <>
                    <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('websiteList.buttons.saveChanges')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )
    }

    return (
      <>
        <div className={`flex w-full justify-between items-center  mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {t('websiteList.title')}
          </h2>
          <button
            className={`px-5 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 focus:ring-2 focus:ring-teal-300 disabled:opacity-50 transition-all duration-200 flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}
            onClick={() => setShowCreateForm(true)}
            disabled={websites.length > 0}
          >
            <PlusCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('websiteList.createWebsite')}
          </button>
        </div>

        {websites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-full mb-4">
              <PlusCircle className="h-12 w-12 text-teal-500 dark:text-teal-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {t('websiteList.noWebsitesTitle')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              {t('websiteList.noWebsitesDescription')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {websites.map((website: WebSiteProps) => (
              <div
                key={website._id}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-start space-x-4 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {website.logo ? (
                      <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-700 p-1 flex items-center justify-center">
                        <img
                          src={website.logo || "/placeholder.svg"}
                          alt={`${website.name} logo`}
                          className="max-h-14 max-w-14 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <button
                          className="text-gray-400 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 transition-colors"
                          onClick={() => document.getElementById(`logo-upload-${website._id}`)?.click()}
                          disabled={website._id ? uploadingLogo[website._id] : false}
                        >
                          {website._id && uploadingLogo[website._id] ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-500"></div>
                          ) : (
                            <Upload className="h-6 w-6" />
                          )}
                        </button>
                        <input
                          id={`logo-upload-${website._id}`}
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file && website._id) {
                              const validationResult = validateImageFile(file)
                              if (validationResult === true) {
                                handleLogoUpload(website._id, file)
                              } else {
                                toast({
                                  title: t('websiteList.validation.invalidFile'),
                                  description: validationResult as string,
                                  variant: "destructive",
                                })
                              }
                            }
                          }}
                          disabled={website._id ? uploadingLogo[website._id] : false}
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{website.name}</h3>
                      {website.description && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 line-clamp-2">
                          {website.description}
                        </p>
                      )}
                      {website.sector && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                            {website.sector}
                          </span>
                        </div>
                      )}
                      {(website.phoneNumber || website.email || website.address) && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          {website.phoneNumber && <p>{t('websiteList.labels.phone')}: {website.phoneNumber}</p>}
                          {website.email && <p>{t('websiteList.labels.email')}: {website.email}</p>}
                          {website.address && <p>{t('websiteList.labels.address')}: {website.address}</p>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`flex space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                    <button
                      className="p-2 rounded-md text-gray-500 hover:text-teal-600 hover:bg-teal-50 dark:text-gray-400 dark:hover:text-teal-400 dark:hover:bg-teal-900/20 transition-colors"
                      onClick={() => setEditingWebsite(website)}
                      aria-label="Edit website"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                      onClick={() => openDeleteDialog(website)}
                      aria-label="Delete website"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t('websiteList.labels.created')}: {new Date(website.createdAt || Date.now()).toLocaleDateString()}
                    </span>

                      
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    )
  }

  return (
    <div className={`mx-auto ${isRTL ? 'rtl' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 md:p-8">{renderContent()}</div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteSectionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        serviceName={websiteToDelete?.name || ""}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
        title={t('websiteList.deleteDialog.title')}
        confirmText={t('websiteList.deleteDialog.confirmButton')}
      />
    </div>
  )
}

export default WebsiteImageExampleFixed