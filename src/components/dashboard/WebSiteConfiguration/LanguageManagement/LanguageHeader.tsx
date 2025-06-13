import { motion } from "framer-motion"
import { Globe } from "lucide-react"
import { useTranslation } from "react-i18next"

export const LanguageHeader = () => {
    const { t } = useTranslation()

    return (
        <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
        >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 dark:from-purple-400/10 dark:to-blue-400/10 rounded-3xl blur-3xl" />
        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-8 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
            <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl">
                <Globe className="h-10 w-10 text-white" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 blur-xl opacity-50 animate-pulse" />
            </div>
            </div>
            
            <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent mb-4">
                {t('languageManagement.title', 'Language Management')}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                {t('languageManagement.subtitle', 'Configure and manage multilingual support for your website')}
            </p>
            </div>
        </div>
        </motion.div>
    )
}