"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Copy, Loader2, Check, AlertCircle, Languages, Database, FileText, Sparkles } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Badge } from "@/src/components/ui/badge"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog"
import { cn } from "@/src/lib/utils"
import type { Section } from "@/src/api/types/hooks/section.types"
import type { TFunction } from "i18next"

interface MultilingualName {
  en: string
  ar: string
  tr: string
}

interface MultilingualErrors {
  en?: string
  ar?: string
  tr?: string
}

interface DuplicateSectionDialogProps {
  isOpen: boolean
  onClose: () => void
  section: Section | null
  onConfirm: (customNames: MultilingualName, duplicateContent: boolean) => void
  isLoading: boolean
  t: TFunction
}

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
}

const contentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1,
      duration: 0.3,
    },
  },
}

export const DuplicateSectionDialog = ({ 
  isOpen, 
  onClose, 
  section, 
  onConfirm, 
  isLoading, 
  t 
}: DuplicateSectionDialogProps) => {
  const [customNames, setCustomNames] = useState<MultilingualName>({
    en: "",
    ar: "",
    tr: "",
  })
  const [nameErrors, setNameErrors] = useState<MultilingualErrors>({})
  const [duplicateContent, setDuplicateContent] = useState(false)

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  ] as const

  // Reset form when dialog opens/closes or section changes
  useEffect(() => {
    if (isOpen && section) {
      const getOriginalName = (name: any): string => {
        if (typeof name === 'string') return name;
        return name?.en || name?.ar || name?.tr || section.subName || 'Section';
      };

      const originalName = getOriginalName(section.name);
      const baseName = originalName.replace(/\s*\(Copy \d*\)$/, '').replace(/\s*\(نسخة \d*\)$/, '').replace(/\s*\(Kopya \d*\)$/, ''); // Remove existing copy suffix

      setCustomNames({
        en: `${baseName} (Copy)`,
        ar: `${baseName} (نسخة)`,
        tr: `${baseName} (Kopya)`,
      })
      setNameErrors({})
      setDuplicateContent(false)
    } else if (!isOpen) {
      setCustomNames({ en: "", ar: "", tr: "" })
      setNameErrors({})
      setDuplicateContent(false)
    }
  }, [isOpen, section])

  const validateName = (name: string) => {
    if (!name.trim()) {
      return t("sectionManagement.duplicateDialog.validation.nameRequired")
    }
    if (name.trim().length < 2) {
      return t("sectionManagement.duplicateDialog.validation.nameMinLength")
    }
    if (name.trim().length > 100) {
      return t("sectionManagement.duplicateDialog.validation.nameMaxLength")
    }
    return ""
  }

  const validateAllNames = () => {
    const errors: MultilingualErrors = {}
    let hasErrors = false

    languages.forEach(({ code }) => {
      const error = validateName(customNames[code])
      if (error) {
        errors[code] = error
        hasErrors = true
      }
    })

    setNameErrors(errors)
    return !hasErrors
  }

  const handleNameChange = (language: "en" | "ar" | "tr", value: string) => {
    setCustomNames((prev) => ({
      ...prev,
      [language]: value,
    }))

    if (nameErrors[language]) {
      setNameErrors((prev) => ({
        ...prev,
        [language]: undefined,
      }))
    }
  }

  const handleConfirm = () => {
    if (!section) return

    if (!validateAllNames()) {
      return
    }

    const trimmedNames: MultilingualName = {
      en: customNames.en.trim(),
      ar: customNames.ar.trim(),
      tr: customNames.tr.trim(),
    }

    onConfirm(trimmedNames, duplicateContent)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && Object.keys(nameErrors).length === 0) {
      handleConfirm()
    }
  }

  if (!section) return null

  const getDisplayName = (name: any): string => {
    if (typeof name === 'string') return name;
    return name?.en || name?.ar || name?.tr || section.subName || 'Section';
  };

  const originalName = getDisplayName(section.name);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit">
          
          {/* Header */}
          <DialogHeader className="p-4 pb-3 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg flex-shrink-0">
                <Copy className="text-white text-lg h-6 w-6" />
              </div>

              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {t("sectionManagement.duplicateDialog.title")}
                </DialogTitle>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                   
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t("sectionManagement.duplicateDialog.description")}
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <motion.div variants={contentVariants} initial="hidden" animate="visible" className="p-4">
            <div className="space-y-6">
              
              {/* Multilingual Name Input */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Languages className="h-4 w-4 text-blue-500" />
                  {t("sectionManagement.duplicateDialog.sectionNames")}
                </Label>

                <div className="space-y-3">
                  {languages.map(({ code, name, flag }) => (
                    <div key={code} className="space-y-1.5">
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-lg">{flag}</span>
                        <div className="flex-1 flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {t(`sectionManagement.duplicateDialog.nameIn${code.toUpperCase()}`)}
                          </span>
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                            {code.toUpperCase()}
                          </Badge>
                        </div>
                        {nameErrors[code] && <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />}
                      </div>

                      <div className="pl-2">
                        <Input
                          type="text"
                          value={customNames[code]}
                          onChange={(e) => handleNameChange(code as "en" | "ar" | "tr", e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder={t(`sectionManagement.duplicateDialog.namePlaceholder${code.toUpperCase()}`)}
                          className={cn(
                            "w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 transition-colors shadow-sm h-9",
                            code === "ar" && "text-right",
                            nameErrors[code] &&
                              "border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-500",
                          )}
                          disabled={isLoading}
                          dir={code === "ar" ? "rtl" : "ltr"}
                        />
                        {nameErrors[code] && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mt-1"
                          >
                            <AlertCircle className="h-3 w-3 flex-shrink-0" />
                            <span>{nameErrors[code]}</span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

        
            
              {/* Validation Summary */}
              {Object.keys(nameErrors).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">
                      {t("sectionManagement.duplicateDialog.validation.completeAllLanguages")}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Footer */}
          <DialogFooter className="p-4 pt-0 gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              {t("sectionManagement.duplicateDialog.cancel")}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={
                isLoading ||
                Object.keys(nameErrors).length > 0 ||
                !customNames.en.trim() ||
                !customNames.ar.trim() ||
                !customNames.tr.trim()
              }
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("sectionManagement.duplicateDialog.duplicating")}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  {t("sectionManagement.duplicateDialog.duplicate")}
                </>
              )}
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}