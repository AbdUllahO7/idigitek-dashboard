import { motion, AnimatePresence } from "framer-motion"
import { 
  Languages, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Search, 
  AlertTriangle 
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { cn } from "@/src/lib/utils"
import { useLanguage } from "@/src/context/LanguageContext"
import { LanguageCard } from "./LanguageCard"
import type { Language } from "@/src/api/types/hooks/language.types"
import { filterLanguages, getLanguageStats } from "@/src/utils/management/languageHelper"
import { TFunction } from "i18next"

interface ManageLanguagesCardProps {
  hasWebsite: boolean
  websiteId?: string
  languages: Language[]
  searchQuery: string
  activeTab: string
  expandedInfo: boolean
  onSearchChange: (query: string) => void
  onTabChange: (tab: string) => void
  onExpandInfoToggle: () => void
  onToggleActive: (id: string, isActive: boolean) => void
  onEdit: (language: Language) => void
  onDelete: (language: Language) => void
  isToggling: boolean
  t: TFunction
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 15 },
  },
}

export const ManageLanguagesCard = ({
  hasWebsite,
  websiteId,
  languages,
  searchQuery,
  activeTab,
  expandedInfo,
  onSearchChange,
  onTabChange,
  onExpandInfoToggle,
  onToggleActive,
  onEdit,
  onDelete,
  isToggling,
  t
}: ManageLanguagesCardProps) => {
  const { language } = useLanguage()
  const isRTL = language === 'ar'
  const noWebsiteSelected = !websiteId || websiteId === ""
  
  const stats = getLanguageStats(languages)
  const filteredLanguages = filterLanguages(languages, searchQuery, activeTab)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="overflow-hidden border-none shadow-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm" dir={isRTL ? 'rtl' : 'ltr'}>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <Languages className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {t('languageManagement.manage.title', 'Manage Languages')}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  {websiteId
                    ? t('languageManagement.manage.description', `Managing ${stats.total} languages`)
                    : t('languageManagement.manage.noWebsiteSelected', 'No website selected')}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "flex items-center gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700",
                isRTL ? "flex-row-reverse" : ""
              )}
              onClick={onExpandInfoToggle}
            >
              <Info className="h-4 w-4" />
              <span>{t('languageManagement.manage.help.button', 'Help')}</span>
              {expandedInfo ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>

          <AnimatePresence>
            {expandedInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl text-sm text-blue-800 dark:text-blue-200">
                  <h4 className={cn(
                    "font-semibold mb-3 flex items-center gap-2",
                    isRTL ? "flex-row-reverse" : ""
                  )}>
                    <HelpCircle className="h-4 w-4" />
                    {t('languageManagement.manage.help.title', 'Language Management Tips')}
                  </h4>
                  <ul className={cn(
                    "list-disc space-y-2",
                    isRTL ? "pr-5" : "pl-5"
                  )}>
                    <li>Use standard ISO language codes (en, ar, es, fr, etc.)</li>
                    <li>Active languages will be available for content translation</li>
                    <li>You can toggle language status without deleting content</li>
                    <li>Language IDs cannot be changed after creation</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>

        <CardContent className="p-8" dir={isRTL ? 'rtl' : 'ltr'}>
          {noWebsiteSelected ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center shadow-lg">
                <AlertTriangle className="h-12 w-12 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                {t('languageManagement.manage.emptyState.noWebsite.title', 'Website Required')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {t('languageManagement.manage.emptyState.noWebsite.description', 'Please create or select a website to manage languages')}
              </p>
            </div>
          ) : (
            <>
              {/* Search and Filter */}
              <div className={cn(
                "mb-8 flex flex-col lg:flex-row gap-4",
                isRTL ? "lg:flex-row-reverse" : ""
              )}>
                <div className="relative flex-1">
                  <div className={cn(
                    "absolute inset-y-0 flex items-center pointer-events-none z-10",
                    isRTL ? "right-0 pr-4" : "left-0 pl-4"
                  )}>
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <Input
                    placeholder={t('languageManagement.manage.search.placeholder', 'Search languages...')}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className={cn(
                      "h-12 border-2 rounded-xl transition-all duration-300",
                      "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                      "dark:focus:ring-blue-400/20 dark:focus:border-blue-400",
                      "dark:bg-slate-800/50 dark:border-slate-600",
                      isRTL ? "pr-12 pl-4" : "pl-12 pr-4"
                    )}
                  />
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
                  <Tabs value={activeTab} onValueChange={onTabChange}>
                    <TabsList className="grid grid-cols-3 bg-transparent gap-1">
                      <TabsTrigger 
                        value="all" 
                        className={cn(
                          "text-xs px-4 py-2 rounded-lg transition-all duration-300",
                          activeTab === 'all' ? "bg-blue-500 text-white shadow-sm" : "hover:bg-slate-100 dark:hover:bg-slate-700"
                        )}
                      >
                        {t('languageManagement.manage.tabs.all', 'All')} ({stats.total})
                      </TabsTrigger>
                      <TabsTrigger 
                        value="active" 
                        className={cn(
                          "text-xs px-4 py-2 rounded-lg transition-all duration-300",
                          activeTab === 'active' ? "bg-green-500 text-white shadow-sm" : "hover:bg-slate-100 dark:hover:bg-slate-700"
                        )}
                      >
                        {t('languageManagement.manage.tabs.active', 'Active')} ({stats.active})
                      </TabsTrigger>
                      <TabsTrigger 
                        value="inactive" 
                        className={cn(
                          "text-xs px-4 py-2 rounded-lg transition-all duration-300",
                          activeTab === 'inactive' ? "bg-gray-500 text-white shadow-sm" : "hover:bg-slate-100 dark:hover:bg-slate-700"
                        )}
                      >
                        {t('languageManagement.manage.tabs.inactive', 'Inactive')} ({stats.inactive})
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {filteredLanguages.length > 0 ? (
                <motion.div
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredLanguages.map((language: Language, index) => (
                    <motion.div 
                      key={language._id || `lang-${language.languageID}`} 
                      variants={itemVariants}
                      transition={{ delay: index * 0.1 }}
                    >
                      <LanguageCard
                        language={language}
                        onToggleActive={onToggleActive}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        hasWebsite={hasWebsite}
                        isToggling={isToggling}
                        t={t}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-16">
                  {searchQuery ? (
                    <>
                      <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center shadow-lg">
                        <Search className="h-12 w-12 text-slate-400 dark:text-slate-500" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                        {t('languageManagement.manage.search.noResults.title', 'No languages found')}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                        {t('languageManagement.manage.search.noResults.description', `No languages found matching "${searchQuery}"`)}
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => onSearchChange("")}
                        className="border-slate-200 dark:border-slate-700"
                      >
                        {t('languageManagement.manage.search.noResults.clearButton', 'Clear Search')}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-200 dark:from-purple-900/20 dark:to-blue-900/20 flex items-center justify-center shadow-lg">
                        <Languages className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                        {t('languageManagement.manage.emptyState.noLanguages.title', 'No languages configured')}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                        {t('languageManagement.manage.emptyState.noLanguages.description', 'Add your first language to enable multilingual support')}
                      </p>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}