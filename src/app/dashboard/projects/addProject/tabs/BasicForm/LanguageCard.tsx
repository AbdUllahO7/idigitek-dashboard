"use client"

import type React from "react"

import { memo, useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import type { UseFormReturn } from "react-hook-form"
import { CalendarIcon, ChevronDown, ChevronUp, X, FolderOpen, Upload, FileText, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover"
import { Button } from "@/src/components/ui/button"
import { Calendar } from "@/src/components/ui/calendar"
import { cn } from "@/src/lib/utils"
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/src/context/LanguageContext"

interface LanguageCardProps {
  langCode: string
  form: UseFormReturn<any>
  isFirstLanguage?: boolean
  onClose?: (langCode: string) => void
  onFileUpload?: (langCode: string, file: File) => void
  onFileRemove?: (langCode: string) => void
}

export const LanguageCard = memo(
  ({ langCode, form, isFirstLanguage = false, onClose, onFileUpload, onFileRemove }: LanguageCardProps) => {
    const [isCollapsed, setIsCollapsed] = useState(true)
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { t } = useTranslation()
    const { language } = useLanguage()
    const currentTitle = form.watch(`${langCode}.title`) || ""
    const currentDate = form.watch(`${langCode}.date`)
    const currentFileUrl = form.watch(`${langCode}.uploadedFile`) || ""
    const hasFile = uploadedFile || currentFileUrl

    // Debug logging
    useEffect(() => {
      console.log(`LanguageCard ${langCode} - currentFileUrl:`, currentFileUrl)
      console.log(`LanguageCard ${langCode} - uploadedFile:`, uploadedFile)
      console.log(`LanguageCard ${langCode} - hasFile:`, hasFile)
    }, [currentFileUrl, uploadedFile, hasFile, langCode])

    const handleClose = () => {
      if (onClose && !isFirstLanguage) {
        onClose(langCode)
      }
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        // Validate file type (you can customize this)
        const allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
        ]
        if (!allowedTypes.includes(file.type)) {
          alert(t("projectLanguageCard.invalidFileType", "Please select a valid file type (PDF, DOC, DOCX, TXT)"))
          return
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          alert(t("projectLanguageCard.fileTooLarge", "File size must be less than 5MB"))
          return
        }

        setUploadedFile(file)
        form.setValue(`${langCode}.uploadedFile`, file.name)
        
        // Call the parent component's file upload handler
        if (onFileUpload) {
          onFileUpload(langCode, file)
        }
      }
    }

    const handleFileRemove = () => {
      setUploadedFile(null)
      form.setValue(`${langCode}.uploadedFile`, "")
      
      // Call the parent component's file remove handler
      if (onFileRemove) {
        onFileRemove(langCode)
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }

    const triggerFileSelect = () => {
      fileInputRef.current?.click()
    }

    // Check if we have a file (either uploaded or existing URL)

    // Get file name to display
    const getDisplayFileName = () => {
      if (uploadedFile) {
        return uploadedFile.name
      }
      if (currentFileUrl) {
        // Extract filename from URL, handling both direct filenames and URLs
        const urlParts = currentFileUrl.split('/')
        const lastPart = urlParts[urlParts.length - 1]
        // If it looks like a filename with extension, use it
        if (lastPart.includes('.')) {
          return decodeURIComponent(lastPart)
        }
        // Otherwise, try to extract filename from Cloudinary URL pattern
        const filenamePart = currentFileUrl.match(/\/([^\/]+\.[^\/]+)(?:\?|$)/)
        return filenamePart ? decodeURIComponent(filenamePart[1]) : 'Uploaded File'
      }
      return 'Unknown File'
    }

    return (
      <Card className={""} dir={language === "ar" ? "rtl" : "ltr"}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                <span
                  className={cn(
                    "uppercase font-bold text-sm rounded-lg px-3 py-1.5 shadow-sm",
                    isFirstLanguage ? "bg-purple-600 text-white" : "bg-primary text-primary-foreground",
                  )}
                >
                  {langCode}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold">
                  {t("projectLanguageCard.projectSection", "Project Section")}
                </span>
                {isFirstLanguage && (
                  <span className="text-xs bg-purple-100 text-purple-700 rounded-md px-2 py-0.5 w-fit mt-1 font-medium">
                    {t("projectLanguageCard.primaryLanguage", "Primary Language")}
                  </span>
                )}
              </div>
            </CardTitle>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8 p-0"
                title={
                  isCollapsed
                    ? t("projectLanguageCard.expand", "Expand")
                    : t("projectLanguageCard.collapse", "Collapse")
                }
              >
                {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>

              {!isFirstLanguage && onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
                  title={t("projectLanguageCard.close", "Close")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <CardDescription className="text-sm text-gray-600 mt-2">
            {t("projectLanguageCard.manageContent", "Manage project content for {{langCode}}", {
              langCode: langCode.toUpperCase(),
            })}
            {currentTitle && <span className="block text-xs mt-1 font-medium">"{currentTitle}"</span>}
            {isFirstLanguage && currentDate && (
              <span className="block text-xs text-gray-500 mt-1">
                {t("projectLanguageCard.projectDateLabel", "Project Date: {{date}}", {
                  date: format(new Date(currentDate), "PPP"),
                })}
              </span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent
          className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden",
            isCollapsed ? "max-h-0 pb-0" : "max-h-none pb-6",
          )}
        >
          <div className="space-y-6">
            {/* Title Field */}
            <FormField
              control={form.control}
              name={`${langCode}.title`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t("projectLanguageCard.projectTitle", "Project Title")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("projectLanguageCard.titlePlaceholder", "Enter project title")}
                      className="h-11 hover:border-primary transition-colors focus:ring-2 focus:ring-primary/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name={`${langCode}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t("projectLanguageCard.projectDescription", "Project Description")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("projectLanguageCard.descriptionPlaceholder", "Enter project description")}
                      className="min-h-[120px] hover:border-primary transition-colors focus:ring-2 focus:ring-primary/20 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Field */}
            <FormField
              control={form.control}
              name={`${langCode}.category`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t("projectLanguageCard.projectCategory", "Project Category")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("projectLanguageCard.categoryPlaceholder", "Enter project category")}
                      className="min-h-[100px] hover:border-primary transition-colors focus:ring-2 focus:ring-primary/20 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gallery Text Field */}
            <FormField
              control={form.control}
              name={`${langCode}.galleryText`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t("projectLanguageCard.galleryText", "Gallery Text")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("projectLanguageCard.galleryTextPlaceholder", "Enter gallery text")}
                      className="min-h-[100px] hover:border-primary transition-colors focus:ring-2 focus:ring-primary/20 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload Field */}
            <FormField
              control={form.control}
              name={`${langCode}.uploadedFile`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t("projectLanguageCard.uploadFile", "Upload File")}
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileSelect}
                        className="hidden"
                      />

                      {!hasFile ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={triggerFileSelect}
                          className="w-full h-24 border-2 border-dashed border-gray-300 hover:border-primary transition-colors flex flex-col items-center justify-center gap-2"
                        >
                          <Upload className="h-6 w-6 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {t("projectLanguageCard.clickToUpload", "Click to upload file")}
                          </span>
                          <span className="text-xs text-gray-400">
                            {t("projectLanguageCard.supportedFormats", "PDF, DOC, DOCX, TXT (Max 5MB)")}
                          </span>
                        </Button>
                      ) : (
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium">
                                {getDisplayFileName()}
                              </p>
                              {uploadedFile ? (
                                <p className="text-xs text-gray-500">
                                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              ) : currentFileUrl ? (
                                <p className="text-xs text-green-600">
                                  {t("projectLanguageCard.fileFromServer", "File from server")}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {currentFileUrl && !uploadedFile && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(currentFileUrl, '_blank')}
                                className="h-8"
                              >
                                {t("projectLanguageCard.view", "View")}
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={triggerFileSelect}
                              className="h-8"
                            >
                              {t("projectLanguageCard.replace", "Replace")}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleFileRemove}
                              className="h-8 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Field with DatePicker - Only shown for first language */}
            {isFirstLanguage && (
              <FormField
                control={form.control}
                name={`${langCode}.date`}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">
                      {t("projectLanguageCard.projectDate", "Project Date")}
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-11 pl-3 text-left font-normal hover:border-primary transition-colors",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>{t("projectLanguageCard.datePlaceholder", "Select a date")}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Button Text Field */}
            <FormField
              control={form.control}
              name={`${langCode}.backLinkText`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t("projectLanguageCard.buttonText", "Button Text")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("projectLanguageCard.buttonTextPlaceholder", "Get Started")}
                      className="h-11 hover:border-primary transition-colors focus:ring-2 focus:ring-primary/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    )
  },
)

LanguageCard.displayName = "LanguageCard"