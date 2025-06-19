import { motion } from "framer-motion"
import { Layers } from "lucide-react"
import { TFunction } from "i18next"

interface SectionHeaderProps {
  t: TFunction
  ready: boolean
}

export const SectionHeader = ({ t, ready }: SectionHeaderProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-400/10 dark:to-purple-400/10 rounded-3xl blur-3xl" />
      <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-8 shadow-2xl">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
              <Layers className="h-10 w-10 text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 blur-xl opacity-50 animate-pulse" />
          </div>
        </div>
        
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-4">
            {ready ? t("sectionManagement.title", "Website Sections") : "Website Sections"}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {ready ? t("sectionManagement.subtitle", "Build your website structure with beautiful, pre-designed sections") : "Build your website structure with beautiful, pre-designed sections"}
          </p>
        </div>
      </div>
    </motion.div>
  )
}