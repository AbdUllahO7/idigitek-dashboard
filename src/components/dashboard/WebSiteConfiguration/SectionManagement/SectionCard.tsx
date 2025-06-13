import { motion } from "framer-motion"
import { Sparkles, PlusCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { cn } from "@/src/lib/utils"
import { PredefinedSection } from "@/src/api/types/management/SectionManagement.type"
import { TFunction } from "i18next"

interface SectionCardProps {
  section: PredefinedSection
  translatedName: string
  translatedDescription: string
  onAdd: (section: PredefinedSection) => void
  isLoading: boolean
  hasWebsite: boolean
  t:TFunction
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 15 },
  },
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
  return (
    <motion.div 
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
              t("sectionManagement.categories.layout", "Layout") : 
              t("sectionManagement.categories.content", "Content")
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
            onClick={() => onAdd(section)}
            disabled={isLoading || !hasWebsite}
            className={cn(
              "w-full transition-all duration-300 flex items-center justify-center gap-2 rounded-xl font-semibold py-3",
              `bg-gradient-to-r ${section.color}`,
              "hover:shadow-lg hover:shadow-current/25 hover:scale-105 active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="h-4 w-4" />
            )}
            {t("sectionManagement.addToWebsite", "Add to Website")}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}