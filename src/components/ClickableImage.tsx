import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { X, Eye, ZoomIn } from 'lucide-react'
import Image from 'next/image'
import { TFunction } from 'i18next'

// Animation variants for the modal
const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
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
}

const backdropVariants = {
  hidden: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: {
      duration: 0.2,
    },
  },
  visible: {
    opacity: 1,
    backdropFilter: "blur(8px)",
    transition: {
      duration: 0.3,
    },
  },
}

// Size configurations for both preview image and modal
const sizeConfig = {
  small: {
    preview: {
      width: "120px",
      height: "80px",
      borderRadius: "8px"
    },
    modal: {
      maxWidth: "60vw",
      maxHeight: "60vh",
      containerPadding: "10px"
    }
  },
  medium: {
    preview: {
      width: "200px", 
      height: "140px",
      borderRadius: "12px"
    },
    modal: {
      maxWidth: "80vw",
      maxHeight: "80vh",
      containerPadding: "15px"
    }
  },
  large: {
    preview: {
      width: "600px",
      height: "200px", 
      borderRadius: "16px"
    },
    modal: {
      maxWidth: "95vw",
      maxHeight: "95vh",
      containerPadding: "20px"
    }
  },
  full: {
    preview: {
      width: "100%",
      height: "auto",
      borderRadius: "16px"
    },
    modal: {
      maxWidth: "95vw",
      maxHeight: "95vh",
      containerPadding: "20px"
    }
  }
}

type ImageSize = 'small' | 'medium' | 'large' | 'full'

interface ClickableImageProps {
  imageSrc: string
  imageAlt: string
  size?: ImageSize
  showHoverEffect?: boolean
  showZoomIcon?: boolean
  t?: TFunction
  title?: string
  subtitle?: string
  className?: string
  previewClassName?: string
  priority?: boolean
}

export const ClickableImage = ({
  imageSrc,
  imageAlt,
  size = 'medium',
  showHoverEffect = true,
  showZoomIcon = true,
  t,
  title,
  subtitle,
  className = '',
  previewClassName = '',
  priority = false
}: ClickableImageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Get size configuration
  const currentSizeConfig = sizeConfig[size]

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isModalOpen])

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false)
      }
    }

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isModalOpen])

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      {/* Clickable Preview Image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative group cursor-pointer justify-center items-center flex m-auto ${className}`}
        onClick={openModal}
        style={{
          width: currentSizeConfig.preview.width,
          height: size === 'full' ? 'auto' : currentSizeConfig.preview.height,
          minHeight: size === 'full' ? '200px' : currentSizeConfig.preview.height
        }}
      >
        <div 
          className={`relative w-full overflow-hidden shadow-lg justify-center items-center flex ${previewClassName}`}
          style={{
            borderRadius: currentSizeConfig.preview.borderRadius,
            height: size === 'full' ? '100%' : '100%'
          }}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className={`object-cover transition-transform duration-500 w-full m-auto ${
              showHoverEffect ? 'group-hover:scale-105' : ''
            }`}
            priority={priority}
            sizes={size === 'full' ? '100vw' : size === 'large' ? '300px' : size === 'medium' ? '200px' : '120px'}
          />
          
          {/* Hover Overlay */}
          {showHoverEffect && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
          
          {/* Zoom Icon */}
          {showZoomIcon && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30">
                <ZoomIn className={`text-white ${
                  size === 'small' ? 'h-4 w-4' : size === 'medium' ? 'h-6 w-6' : 'h-8 w-8'
                }`} />
              </div>
            </motion.div>
          )}
          
          {/* Size Badge */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className={`bg-black/60 backdrop-blur-sm rounded px-2 py-1 ${
              size === 'small' ? 'text-xs' : 'text-sm'
            } text-white font-medium`}>
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      {isModalOpen && (
        <AnimatePresence mode="wait">
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={closeModal}
            className="fixed inset-0"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 99999,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              margin: 0,
              padding: currentSizeConfig.modal.containerPadding
            }}
          >
            {/* Container for centering */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                maxWidth: currentSizeConfig.modal.maxWidth,
                maxHeight: currentSizeConfig.modal.maxHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {/* Main Image */}
              <motion.img
                src={imageSrc}
                alt={imageAlt}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: currentSizeConfig.modal.maxWidth,
                  maxHeight: currentSizeConfig.modal.maxHeight,
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: size === 'small' ? "8px" : size === 'medium' ? "12px" : "16px",
                  boxShadow: size === 'small' 
                    ? "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
                    : size === 'medium' 
                    ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                    : "0 35px 70px -15px rgba(0, 0, 0, 0.7)",
                  backgroundColor: "white"
                }}
              />
            </div>

            {/* Close Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 25 }}
              style={{
                position: "absolute",
                top: size === 'small' ? "15px" : "20px",
                right: size === 'small' ? "15px" : "20px",
                zIndex: 100001
              }}
            >
              <Button
                variant="ghost"
                size={size === 'small' ? "sm" : "icon"}
                onClick={closeModal}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full transition-all duration-200 hover:scale-110"
                aria-label="Close modal"
              >
                <X className={size === 'small' ? "h-4 w-4" : "h-5 w-5"} />
              </Button>
            </motion.div>

            {/* Image Caption */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              style={{
                position: "absolute",
                bottom: size === 'small' ? "20px" : "30px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(8px)",
                borderRadius: size === 'small' ? "6px" : "8px",
                padding: size === 'small' ? "8px 16px" : size === 'medium' ? "12px 20px" : "16px 24px",
                textAlign: "center",
                zIndex: 100000,
                maxWidth: currentSizeConfig.modal.maxWidth
              }}
            >
              <h3 className={`text-white font-semibold mb-1 ${
                size === 'small' ? 'text-sm' : size === 'medium' ? 'text-base' : 'text-lg'
              }`}>
                {title || imageAlt}
              </h3>
              <p className={`text-white/80 ${
                size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base'
              }`}>
                {subtitle || (t ? t("sectionManagement.clickOutsideToClose", "Click outside to close") : "Click outside to close")}
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  )
}