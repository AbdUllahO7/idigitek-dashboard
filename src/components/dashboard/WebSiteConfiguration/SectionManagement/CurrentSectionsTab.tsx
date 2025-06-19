import { motion, Reorder, AnimatePresence } from "framer-motion"
import {
  AlertTriangle,
  LayoutGrid,
  PlusCircle,
  Search,
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  Trash,
  Loader2,
  ArrowUpDown,
  ChevronDown,
  Info,
  Calendar,
  Settings,
  Image as ImageIcon,
  ZoomIn,
  X
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"
import { cn } from "@/src/lib/utils"
import { useLanguage } from "@/src/context/LanguageContext"
import type { Section } from "@/src/api/types/hooks/section.types"
import { filterCurrentSections, getSectionVisualInfo, getTranslatedSectionName } from "@/src/utils/management/sectionHelper"
import { TFunction } from "i18next"
import { useState } from "react"
import { PREDEFINED_SECTIONS } from "@/src/Const/SectionsData"

interface CurrentSectionsTabProps {
  hasWebsite: boolean
  orderedSections: Section[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onAddNewClick: () => void
  onToggleActive: (section: Section) => void
  onDelete: (section: Section) => void
  onReorder: (sections: Section[]) => void
  isToggling: boolean
  toggleSectionId?: string
  t: TFunction
  ready: boolean
}

// Image Modal Component
const ImageModal = ({ 
  isOpen, 
  onClose, 
  imageSrc, 
  imageAlt,
  t
}: { 
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  imageAlt: string
  t: TFunction
}) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>

          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-full object-contain max-h-[80vh]"
          />

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h3 className="text-white font-semibold text-lg">{imageAlt}</h3>
            <p className="text-white/80 text-sm">{t('sectionManagement.modal.clickOutsideToClose')}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const expandVariants = {
  collapsed: { 
    height: 0,
    opacity: 0,
    transition: { duration: 0.3, ease: "easeInOut" }
  },
  expanded: { 
    height: "auto",
    opacity: 1,
    transition: { duration: 0.3, ease: "easeInOut" }
  }
}

export const CurrentSectionsTab = ({
  hasWebsite,
  orderedSections,
  searchQuery,
  onSearchChange,
  onAddNewClick,
  onToggleActive,
  onDelete,
  onReorder,
  isToggling,
  toggleSectionId,
  t,
  ready
}: CurrentSectionsTabProps) => {
  const { language } = useLanguage()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{src: string, alt: string}>({src: '', alt: ''})
  
  const filteredCurrentSections = filterCurrentSections(orderedSections, searchQuery, t, ready)

  const toggleExpanded = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const openImageModal = (imageSrc: string, imageAlt: string) => {
    setSelectedImage({src: imageSrc, alt: imageAlt})
    setImageModalOpen(true)
  }

  const getSectionImage = (section: Section) => {
    // Try to find the section in predefined sections to get the image
    const predefinedSection = PREDEFINED_SECTIONS.find(
      ps => ps.subName.toLowerCase() === section.name.toLowerCase() ||
            ps.nameKey.includes(section.name.toLowerCase()) ||
            ps.subName === section.sectionType
    )
    return predefinedSection?.image
  }

  return (
    <>
      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-xl overflow-hidden">
        
        {/* Responsive Tab Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 p-3 sm:p-4 md:p-5 lg:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col gap-3 md:gap-4">
            
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg md:rounded-xl shadow-lg flex-shrink-0">
                  <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                    {t("sectionManagement.currentSections")}
                  </h3>
                </div>
                {orderedSections.length > 0 && (
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs sm:text-sm flex-shrink-0">
                    {orderedSections.length} {t('sectionManagement.reorder.sectionCount')}
                  </Badge>
                )}
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {/* Search - Full width on mobile */}
              <div className="relative flex-1 sm:flex-initial sm:min-w-0">
                <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  type="search"
                  placeholder={t("sectionManagement.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full sm:w-48 md:w-64 pl-8 sm:pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg md:rounded-xl text-sm"
                />
              </div>

              {/* Add button */}
              <Button
                onClick={onAddNewClick}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 sm:px-4 py-2 rounded-lg md:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base touch-manipulation"
              >
                <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">{t("sectionManagement.addNew")}</span>
                <span className="sm:hidden">{t("sectionManagement.addNewMobile")}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Responsive Tab Content */}
        <div className="p-3 sm:p-4 md:p-5 lg:p-6">
          {!hasWebsite ? (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl md:rounded-2xl p-4 md:p-6 text-center">
              <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-amber-600 dark:text-amber-400 mx-auto mb-3 md:mb-4" />
              <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2 text-sm sm:text-base">
                {t("sectionManagement.requirements.websiteRequired")}
              </h3>
              <p className="text-amber-700 dark:text-amber-400 text-xs sm:text-sm">
                {t("sectionManagement.requirements.createWebsiteFirst")}
              </p>
            </div>
          ) : filteredCurrentSections.length > 0 ? (
            <div className="space-y-4 md:space-y-6">
              {orderedSections.length > 1 && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg md:rounded-xl p-2.5 sm:p-3">
                  <ArrowUpDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>{t('sectionManagement.reorder.dragToReorder')}</span>
                </div>
              )}
              
              <Reorder.Group 
                axis="y" 
                values={orderedSections} 
                onReorder={onReorder}
                className="space-y-3 sm:space-y-4"
              >
                {filteredCurrentSections.map((section: Section) => {
                  const visualInfo = getSectionVisualInfo(section);
                  const sectionId = section._id || `section-${section.name}`;
                  const isExpanded = expandedSections.has(sectionId);
                  const sectionImage = getSectionImage(section);
                  
                  return (
                    <Reorder.Item
                      key={sectionId}
                      value={section}
                      className="touch-manipulation"
                    >
                      <motion.div
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        className="group bg-white dark:bg-slate-800/90 rounded-xl md:rounded-2xl border border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-slate-900/20 backdrop-blur-sm overflow-hidden"
                      >
                        {/* Main Section Header - Clickable */}
                        <div 
                          className="p-3 sm:p-4 md:p-5 lg:p-6 flex items-center gap-2 sm:gap-3 md:gap-4 cursor-pointer"
                          onClick={() => toggleExpanded(sectionId)}
                        >
                          
                          {/* Responsive Drag Handle */}
                          <div 
                            className="text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 p-1.5 sm:p-2 rounded-lg md:rounded-xl cursor-grab hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors touch-manipulation flex-shrink-0"
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                          >
                            <GripVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                          </div>

                          {/* Responsive Section Icon */}
                          <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br ${visualInfo.color} shadow-lg flex-shrink-0`}>
                            <div className="text-white text-sm sm:text-base">
                              {visualInfo.icon}
                            </div>
                          </div>

                          {/* Section Info - Responsive */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1 sm:mb-2">
                              <h3 className="font-bold text-sm sm:text-base md:text-lg text-slate-900 dark:text-slate-100 truncate">
                                {getTranslatedSectionName(section, t, ready)}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={cn(
                                    "transition-colors self-start sm:self-auto text-xs",
                                    section.isActive 
                                      ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" 
                                      : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700"
                                  )}
                                >
                                  <div className={cn(
                                    "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1.5 sm:mr-2",
                                    section.isActive 
                                      ? "bg-green-500 shadow-green-500/50 shadow-sm" 
                                      : "bg-gray-400"
                                  )} />
                                  {section.isActive ? 
                                    t("sectionManagement.status.active") : 
                                    t("sectionManagement.status.hidden")
                                  }
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Expand Indicator */}
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex-shrink-0"
                          >
                            <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 dark:text-slate-500" />
                          </motion.div>

                          {/* Responsive Actions - Always visible on mobile */}
                          <div 
                            className="flex items-center gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onToggleActive(section);
                                    }}
                                    disabled={isToggling}
                                    className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg md:rounded-xl touch-manipulation"
                                  >
                                    {isToggling && toggleSectionId === section._id ? (
                                      <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                                    ) : section.isActive ? (
                                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    ) : (
                                      <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-sm">
                                    {section.isActive ? 
                                      t("sectionManagement.actions.hideSection") : 
                                      t("sectionManagement.actions.showSection")
                                    }
                                  </p>
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
                                      onDelete(section);
                                    }}
                                    className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg md:rounded-xl touch-manipulation"
                                  >
                                    <Trash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-sm">{t("sectionManagement.actions.deleteSectionTooltip")}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>

                        {/* Expandable Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              variants={expandVariants}
                              initial="collapsed"
                              animate="expanded"
                              exit="collapsed"
                              className="overflow-hidden"
                            >
                              <div className="px-3 sm:px-4 md:px-5 lg:px-6 pb-4 md:pb-6 border-t border-slate-200/50 dark:border-slate-700/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6 mt-4 text-center items-center">
                                  
                            
                                  {/* Section Preview/Image */}
                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
                                      <ImageIcon className="h-4 w-4 text-green-500" />
                                      {t("sectionManagement.details.preview")}
                                    </h4>
                                    <div className="relative bg-slate-100 dark:bg-slate-700 rounded-xl h-24 sm:h-32 flex items-center justify-center overflow-hidden group/image cursor-pointer">
                                      {sectionImage ? (
                                        <>
                                          <img
                                            src={sectionImage}
                                            alt={getTranslatedSectionName(section, t, ready)}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
                                            onClick={() => openImageModal(sectionImage, getTranslatedSectionName(section, t, ready))}
                                          />
                                          {/* Zoom Icon Overlay */}
                                          <div 
                                            className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover/image:opacity-100"
                                            onClick={() => openImageModal(sectionImage, getTranslatedSectionName(section, t, ready))}
                                          >
                                            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-2 transform scale-0 group-hover/image:scale-100 transition-transform duration-300">
                                              <ZoomIn className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                                            </div>
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          {/* Fallback gradient background */}
                                          <div className={cn(
                                            "w-full h-full flex items-center justify-center bg-gradient-to-br opacity-20",
                                            visualInfo.bgColor || visualInfo.color
                                          )}>
                                            <div className="text-4xl sm:text-6xl text-slate-300 dark:text-slate-600">
                                              {visualInfo.icon}
                                            </div>
                                          </div>
                                          
                                          {/* Section Icon Overlay */}
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <div className={cn(
                                              "p-2 sm:p-3 rounded-lg bg-gradient-to-br shadow-lg opacity-90",
                                              visualInfo.color
                                            )}>
                                              <div className="text-white text-sm sm:text-base">
                                                {visualInfo.icon}
                                              </div>
                                            </div>
                                          </div>
                                        </>
                                      )}
                                      
                                      {/* Section Name Overlay */}
                                      <div className="absolute bottom-1 left-1 right-1">
                                        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded p-1">
                                          <p className="text-xs text-slate-600 dark:text-slate-400 text-center truncate">
                                            {getTranslatedSectionName(section, t, ready)}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Additional Information */}
                                {section.createdAt && (
                                  <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                      <Calendar className="h-3 w-3" />
                                      <span>
                                        {t("sectionManagement.details.addedOn")}: {new Date(section.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
            </div>
          ) : searchQuery ? (
            <div className="text-center py-8 sm:py-12 md:py-16">
              <Search className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {t("sectionManagement.states.noSectionsFound")}
              </h3>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-3 md:mb-4">
                {t("sectionManagement.states.noSectionsFoundMatching")} "{searchQuery}"
              </p>
              <Button variant="outline" onClick={() => onSearchChange("")} className="rounded-lg md:rounded-xl text-sm">
                {t("sectionManagement.search.clearSearch")}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 md:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-xl md:rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center shadow-lg">
                <LayoutGrid className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 md:mb-3">
                {t("sectionManagement.states.noSectionsYet")}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-4 md:mb-6 px-4 sm:px-0">
                {t("sectionManagement.states.noSectionsDescription")}
              </p>
              <Button 
                onClick={onAddNewClick} 
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg md:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base touch-manipulation"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                {t("sectionManagement.browseSections")}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageSrc={selectedImage.src}
        imageAlt={selectedImage.alt}
        t={t}
      />
    </>
  )
}