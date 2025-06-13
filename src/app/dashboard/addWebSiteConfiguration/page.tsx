"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Globe, 
  LayoutGrid, 
  AlertTriangle,
  Loader2,
  Palette,
  Settings,
  Sparkles,
  Layers,
  Brush,
  Languages,
  Grid3X3,
  Zap,
  Star,
  ArrowRight
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { useWebSite } from "@/src/hooks/webConfiguration/use-WebSite"
import WebsiteList from "@/src/components/dashboard/WebSiteConfiguration/WebSite"
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/src/context/LanguageContext"
import { cn } from "@/src/lib/utils"
import { SectionManagement } from "@/src/components/dashboard/WebSiteConfiguration/SectionManagement/Sections"
import { LanguageManagement } from "@/src/components/dashboard/WebSiteConfiguration/LanguageManagement/Languages"
import { ThemeManagement } from "@/src/components/dashboard/WebSiteConfiguration/ThemeManagement/ThemeManagement"

// Modern Loading Component
const ModernLoader = ({ text }: { text: string }) => (
  <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
    {/* Animated background */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950" />
    <div className="absolute inset-0">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
    </div>
    
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative z-10 flex flex-col items-center gap-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-12 border border-white/20 dark:border-slate-700/50 shadow-2xl"
    >
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
          <Loader2 className="h-10 w-10 text-white animate-spin" />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 blur-xl opacity-50 animate-pulse" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          Loading Configuration
        </h3>
        <p className="text-slate-600 dark:text-slate-400 font-medium">{text}</p>
      </div>
    </motion.div>
  </div>
);

// Modern Error Component
const ModernError = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
  <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
    <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-slate-950 dark:via-red-950 dark:to-orange-950" />
    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 w-full max-w-lg"
    >
      <Card className="border-none shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4 shadow-xl">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-xl font-bold text-red-600 dark:text-red-400">
            Configuration Error
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-slate-700 dark:text-slate-300">
            {error?.message || 'Failed to load website configuration'}
          </p>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-sm text-red-700 dark:text-red-300">
              Please check your connection and try again
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pt-2">
          <Button 
            onClick={onRetry}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  </div>
);

// Tab Configuration
const tabConfig = [
  {
    id: "languages",
    icon: Languages,
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50",
    label: "Languages"
  },
  {
    id: "sections", 
    icon: Grid3X3,
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50",
    label: "Sections"
  },
  {
    id: "themes",
    icon: Brush,
    gradient: "from-orange-500 to-red-500", 
    bgGradient: "from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50",
    label: "Themes"
  }
];

// Main Component
export default function AdminManagementPage() {
  const { useGetMyWebsites } = useWebSite();
  const { data: websites = [], isLoading: isLoadingWebsites, error: websitesError } = useGetMyWebsites();
  const [activeTab, setActiveTab] = useState("languages");
  const { t } = useTranslation();
  const { isLoaded, language } = useLanguage();
  const isRTL = language === 'ar';

  const activeTabConfig = tabConfig.find(tab => tab.id === activeTab);

  if (isLoadingWebsites) {
    return <ModernLoader text={t('adminManagement.loading.content', 'Loading your configuration...')} />;
  }

  if (websitesError) {
    return (
      <ModernError 
        error={websitesError as Error} 
        onRetry={() => window.location.reload()} 
      />
    );
  }

  const hasWebsite = websites.length > 0;

  return (
    <div className={cn(
      "min-h-screen relative overflow-hidden",
      isRTL ? 'rtl' : ''
    )}>
      {/* Modern Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/30" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-pink-400/10 dark:bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Enhanced Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-400/10 dark:to-purple-400/10 rounded-3xl blur-3xl" />
              <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-8 shadow-2xl">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                      <Settings className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 blur-xl opacity-50 animate-pulse" />
                  </div>
                </div>
                
                <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-4">
                  {t('adminManagement.title', 'Website Configuration')}
                </h1>
                
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                  {t('adminManagement.subtitle', 'Customize your website with advanced configuration options')}
                </p>

                
              </div>
            </div>
          </motion.div>

          {/* Website List Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <WebsiteList />
          </motion.div>
          
          {/* Enhanced Tabs Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Tabs 
              defaultValue="languages" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {/* Modern Tab Navigation */}
              <div className="flex justify-center mb-8">
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-2 border border-white/20 dark:border-slate-700/50 shadow-xl">
                  <TabsList className="grid grid-cols-3 bg-transparent gap-2">
                    {tabConfig.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      
                      return (
                        <TabsTrigger 
                          key={tab.id}
                          value={tab.id} 
                          className={cn(
                            "relative px-6 py-3 rounded-xl font-semibold transition-all duration-300",
                            "data-[state=active]:text-white data-[state=active]:shadow-lg",
                            "hover:scale-105 active:scale-95",
                            isRTL ? 'flex-row-reverse' : '',
                            isActive 
                              ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg` 
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                          )}
                        >
                          <Icon className={cn("h-5 w-5", isRTL ? 'ml-2' : 'mr-2')} />
                          {t(`adminManagement.tabs.${tab.id}`, tab.label)}
                          
                          {isActive && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl"
                              transition={{ type: "spring", duration: 0.5 }}
                            />
                          )}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </div>
              </div>

              {/* Enhanced Tab Content with Animated Backgrounds */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  {/* Dynamic Background for Active Tab */}
                  <div className={cn(
                    "absolute inset-0 rounded-3xl opacity-30 blur-3xl -z-10",
                    `bg-gradient-to-br ${activeTabConfig?.bgGradient}`
                  )} />
                  
                  <div className="relative bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-xl overflow-hidden">
                    <TabsContent value="languages" className="m-0 p-8">
                      <div className="space-y-6">
                        <LanguageManagement hasWebsite={hasWebsite} />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="sections" className="m-0 p-8">
                      <div className="space-y-6">
                      
                        <SectionManagement hasWebsite={hasWebsite} />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="themes" className="m-0 p-8">
                      <div className="space-y-6">
                      
                        <ThemeManagement hasWebsite={hasWebsite} websites={websites} />
                      </div>
                    </TabsContent>
                  </div>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </motion.div>

          {/* Enhanced Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center space-y-4"
          >
            <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 p-6 shadow-lg">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Zap className="h-5 w-5 text-blue-500" />
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                                  {t('adminManagement.footer.description', 'Powerful tools to customize every aspect of your website experience')}
                </span>
              </div>
                  
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                {t('adminManagement.footer.note', 'Changes are applied instantly and synchronized across all devices')}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}