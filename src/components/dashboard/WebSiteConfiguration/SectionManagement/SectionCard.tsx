import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Loader2, 
  ChevronDown, 
  Eye, 
  Zap, 
  Settings, 
  Star,
  X,
  ZoomIn
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { cn } from "@/src/lib/utils"
import type { PredefinedSection } from "@/src/api/types/management/SectionManagement.type"
import { TFunction } from "i18next"

interface SectionCardProps {
  section: PredefinedSection
  translatedName: string
  translatedDescription: string
  onAdd: (section: PredefinedSection) => void
  isLoading: boolean
  hasWebsite: boolean
  t: TFunction
}

// Consistent animation variants
const cardVariants = {
  initial: { 
    y: 0,
    scale: 1,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
  },
  hover: { 
    y: -4,
    scale: 1.01,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
      mass: 0.8
    }
  }
}

const imageVariants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
}

const overlayVariants = {
  initial: { 
    opacity: 0,
    scale: 0.8,
    backgroundColor: "rgba(0, 0, 0, 0)"
  },
  hover: { 
    opacity: 1,
    scale: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
}

const zoomIconVariants = {
  initial: { 
    scale: 0,
    rotate: -180,
    opacity: 0
  },
  hover: { 
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25,
      delay: 0.1
    }
  }
}

const expandableVariants = {
  collapsed: { 
    height: 0,
    opacity: 0,
    scale: 0.95,
    transition: { 
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
      opacity: { duration: 0.2 }
    }
  },
  expanded: { 
    height: "auto",
    opacity: 1,
    scale: 1,
    transition: { 
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
      opacity: { duration: 0.3, delay: 0.1 }
    }
  }
}

const modalVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  visible: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8
    }
  }
}

const backdropVariants = {
  hidden: { 
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: {
      duration: 0.2
    }
  },
  visible: { 
    opacity: 1,
    backdropFilter: "blur(8px)",
    transition: {
      duration: 0.3
    }
  }
}

// Image Modal Component with improved transitions
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
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 25 }}
              className="absolute top-4 right-4 z-10"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full transition-all duration-200 hover:scale-110"
              >
                <X className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Image */}
            <motion.img
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-full object-contain max-h-[80vh]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            />

            {/* Image Caption */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6"
            >
              <h3 className="text-white font-semibold text-lg">{imageAlt}</h3>
              <p className="text-white/80 text-sm">{t('sectionManagement.clickOutsideToClose', 'Click outside to close')}</p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const SectionCard = ({
  section,
  translatedName,
  translatedDescription,
  onAdd,
  isLoading,
  hasWebsite,
  t
}: SectionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const openImageModal = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!imageError && section.image) {
      setImageModalOpen(true)
    }
  }

  const getSectionFeatures = (sectionName: string) => {
    const features: Record<string, string[]> = {
      Header: [
        t('sectionManagement.features.navigationMenu', 'Navigation Menu'),
        t('sectionManagement.features.logoDisplay', 'Logo Display'),
        t('sectionManagement.features.mobileResponsive', 'Mobile Responsive'),
        t('sectionManagement.features.searchIntegration', 'Search Integration')
      ],
      Hero: [
        t('sectionManagement.features.callToAction', 'Call-to-Action'),
        t('sectionManagement.features.backgroundVideoImage', 'Background Video/Image'),
        t('sectionManagement.features.animatedText', 'Animated Text'),
        t('sectionManagement.features.scrollIndicators', 'Scroll Indicators')
      ],
      Services: [
        t('sectionManagement.features.serviceCards', 'Service Cards'),
        t('sectionManagement.features.iconIntegration', 'Icon Integration'),
        t('sectionManagement.features.hoverEffects', 'Hover Effects'),
        t('sectionManagement.features.gridLayout', 'Grid Layout')
      ],
      News: [
        t('sectionManagement.features.articleGrid', 'Article Grid'),
        t('sectionManagement.features.categoryFilters', 'Category Filters'),
        t('sectionManagement.features.readMore', 'Read More'),
        t('sectionManagement.features.dateDisplay', 'Date Display')
      ],
      IndustrySolutions: [
        t('sectionManagement.features.solutionCards', 'Solution Cards'),
        t('sectionManagement.features.industryIcons', 'Industry Icons'),
        t('sectionManagement.features.customColors', 'Custom Colors'),
        t('sectionManagement.features.expandableContent', 'Expandable Content')
      ],
      whyChooseUs: [
        t('sectionManagement.features.featureHighlights', 'Feature Highlights'),
        t('sectionManagement.features.statistics', 'Statistics'),
        t('sectionManagement.features.iconAnimations', 'Icon Animations'),
        t('sectionManagement.features.testimonialIntegration', 'Testimonial Integration')
      ],
      Projects: [
        t('sectionManagement.features.portfolioGallery', 'Portfolio Gallery'),
        t('sectionManagement.features.imageLightbox', 'Image Lightbox'),
        t('sectionManagement.features.categoryFiltering', 'Category Filtering'),
        t('sectionManagement.features.projectDetails', 'Project Details')
      ],
      OurProcess: [
        t('sectionManagement.features.stepByStep', 'Step-by-Step'),
        t('sectionManagement.features.progressIndicators', 'Progress Indicators'),
        t('sectionManagement.features.timelineView', 'Timeline View'),
        t('sectionManagement.features.interactiveElements', 'Interactive Elements')
      ],
      Team: [
        t('sectionManagement.features.memberProfiles', 'Member Profiles'),
        t('sectionManagement.features.socialLinks', 'Social Links'),
        t('sectionManagement.features.hoverAnimations', 'Hover Animations'),
        t('sectionManagement.features.roleDescriptions', 'Role Descriptions')
      ],
      ClientComments: [
        t('sectionManagement.features.reviewCards', 'Review Cards'),
        t('sectionManagement.features.starRatings', 'Star Ratings'),
        t('sectionManagement.features.clientPhotos', 'Client Photos'),
        t('sectionManagement.features.carouselView', 'Carousel View')
      ],
      Partners: [
        t('sectionManagement.features.logoSlider', 'Logo Slider'),
        t('sectionManagement.features.hoverEffects', 'Hover Effects'),
        t('sectionManagement.features.linkIntegration', 'Link Integration'),
        t('sectionManagement.features.responsiveDesign', 'Responsive Design')
      ],
      FAQ: [
        t('sectionManagement.features.accordionLayout', 'Accordion Layout'),
        t('sectionManagement.features.searchFunction', 'Search Function'),
        t('sectionManagement.features.categoryTabs', 'Category Tabs'),
        t('sectionManagement.features.smoothAnimations', 'Smooth Animations')
      ],
      Blog: [
        t('sectionManagement.features.articleCards', 'Article Cards'),
        t('sectionManagement.features.tagSystem', 'Tag System'),
        t('sectionManagement.features.authorInfo', 'Author Info'),
        t('sectionManagement.features.readingTime', 'Reading Time')
      ],
      Contact: [
        t('sectionManagement.features.contactForm', 'Contact Form'),
        t('sectionManagement.features.mapIntegration', 'Map Integration'),
        t('sectionManagement.features.socialLinks', 'Social Links'),
        t('sectionManagement.features.validation', 'Validation')
      ],
      Footer: [
        t('sectionManagement.features.multiColumn', 'Multi-Column'),
        t('sectionManagement.features.socialIcons', 'Social Icons'),
        t('sectionManagement.features.newsletter', 'Newsletter'),
        t('sectionManagement.features.copyrightInfo', 'Copyright Info')
      ]
    }
    return features[sectionName] || [
      t('sectionManagement.features.fullyCustomizable', 'Fully Customizable'),
      t('sectionManagement.features.mobileResponsive', 'Mobile Responsive'),
      t('sectionManagement.features.modernDesign', 'Modern Design'),
      t('sectionManagement.features.easyToUse', 'Easy to Use')
    ]
  }

  return (
    <>
      <motion.div
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
        className={cn(
          "group bg-white dark:bg-slate-800/90 rounded-xl md:rounded-2xl border border-slate-200/80 dark:border-slate-700/60 overflow-hidden backdrop-blur-sm will-change-transform",
          !hasWebsite && "opacity-60 cursor-not-allowed"
        )}
      >
        {/* Card Header - Always Visible */}
        <div className="relative">
          {/* Section Image */}
          <div className="relative h-40 sm:h-48 md:h-52 overflow-hidden bg-gradient-to-br">
            {!imageError && section.image ? (
              <>
                <motion.img
                  src={section.image}
                  alt={translatedName}
                  className="w-full h-full object-cover will-change-transform"
                  onError={handleImageError}
                  variants={imageVariants}
                  initial="initial"
                  whileHover="hover"
                />
                {/* Zoom Icon Overlay */}
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center cursor-pointer"
                  onClick={openImageModal}
                  variants={overlayVariants}
                  initial="initial"
                  whileHover="hover"
                >
                  <motion.div 
                    className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-3"
                    variants={zoomIconVariants}
                  >
                    <ZoomIn className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  </motion.div>
                </motion.div>
              </>
            ) : (
              // Fallback gradient background
              <div className={cn(
                "w-full h-full flex items-center justify-center bg-gradient-to-br",
                section.bgColor
              )}>
                <motion.div 
                  className="text-6xl opacity-30"
                  initial={{ scale: 0.8, opacity: 0.2 }}
                  animate={{ scale: 1, opacity: 0.3 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {section.icon}
                </motion.div>
              </div>
            )}

            {/* Category Badge */}
            <motion.div 
              className="absolute top-3 left-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Badge className={cn(
                "bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 text-xs font-medium transition-all duration-200 hover:scale-105",
                section.category === 'layout' 
                  ? "text-blue-700 dark:text-blue-300" 
                  : "text-purple-700 dark:text-purple-300"
              )}>
                {t(`sectionManagement.categories.${section.category}`, section.category)}
              </Badge>
            </motion.div>

            {/* Section Icon */}
            <motion.div 
              className="absolute top-3 right-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <div className={cn(
                "p-2 rounded-lg bg-gradient-to-br shadow-lg transition-all duration-200 hover:scale-110",
                section.color
              )}>
                <div className="text-white text-sm">
                  {section.icon}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Card Content */}
          <motion.div 
            className="p-4 md:p-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {/* Title and Description */}
            <div className="mb-4">
              <h3 className="font-bold text-base md:text-lg text-slate-900 dark:text-slate-100 mb-2 line-clamp-1">
                {translatedName}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                {translatedDescription || t('sectionManagement.defaultSectionDescription', 'Add a beautiful {{sectionName}} section to your website with modern design and functionality.', { sectionName: translatedName.toLowerCase() })}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onAdd(section)}
                disabled={!hasWebsite || isLoading}
                className={cn(
                  "flex-1 bg-gradient-to-r text-white font-semibold rounded-lg md:rounded-xl text-sm h-9 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
                  section.color,
                  "hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {t('sectionManagement.addToWebsite', 'Add to Website')}
              </Button>

              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(!isExpanded)
                }}
                className="px-3 h-9 rounded-lg md:rounded-xl border-slate-200 dark:border-slate-700 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                  }}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Expandable Content */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              variants={expandableVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="overflow-hidden border-t border-slate-200/50 dark:border-slate-700/50"
            >
              <div className="p-4 md:p-5 bg-slate-50/50 dark:bg-slate-900/20">
                {/* Features Section */}
                <motion.div 
                  className="mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {t('sectionManagement.keyFeatures', 'Key Features')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {getSectionFeatures(section.subName).map((feature, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800/50 rounded-lg p-2 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Additional Info */}
                <motion.div 
                  className="pt-3 border-t border-slate-200/50 dark:border-slate-700/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Settings className="h-3 w-3" />
                      <span>{t('sectionManagement.features.fullyCustomizable', 'Fully Customizable')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-3 w-3" />
                      <span>{t('sectionManagement.features.mobileResponsive', 'Mobile Responsive')}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageSrc={section.image || ''}
        imageAlt={translatedName}
        t={t}
      />
    </>
  )
}