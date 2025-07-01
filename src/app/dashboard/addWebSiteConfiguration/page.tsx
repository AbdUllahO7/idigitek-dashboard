"use client"
import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
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

// Modern Loading Component - Enhanced for Mobile
const ModernLoader = ({ text }: { text: string }) => (
  <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
    {/* Responsive animated background */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950" />
    <div className="absolute inset-0">
      <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-2xl md:blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-2xl md:blur-3xl animate-pulse delay-1000" />
    </div>
    
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative z-10 flex flex-col items-center gap-4 md:gap-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 border border-white/20 dark:border-slate-700/50 shadow-2xl w-full max-w-sm md:max-w-md"
    >
      <div className="relative">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
          <Loader2 className="h-8 w-8 md:h-10 md:w-10 text-white animate-spin" />
        </div>
        <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 blur-xl opacity-50 animate-pulse" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          Loading Configuration
        </h3>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium px-2">{text}</p>
      </div>
    </motion.div>
  </div>
);

// Modern Error Component - Enhanced for Mobile
const ModernError = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
  <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
    <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-slate-950 dark:via-red-950 dark:to-orange-950" />
    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 w-full max-w-sm md:max-w-lg"
    >
      <Card className="border-none shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4 shadow-xl">
            <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
          <CardTitle className="text-lg md:text-xl font-bold text-red-600 dark:text-red-400">
            Configuration Error
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4 px-4 md:px-6">
          <p className="text-sm md:text-base text-slate-700 dark:text-slate-300">
            {error?.message || 'Failed to load website configuration'}
          </p>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 md:p-4">
            <p className="text-xs md:text-sm text-red-700 dark:text-red-300">
              Please check your connection and try again
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pt-2 px-4 md:px-6">
          <Button 
            onClick={onRetry}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-4 md:px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base"
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
  
  // ✅ Read URL parameters to set initial tab
  const searchParams = useSearchParams();
  const urlTab = searchParams.get('tab');
  
  // ✅ Set initial tab based on URL parameter or default to "languages"
  const [activeTab, setActiveTab] = useState(() => {
    const validTabs = ["languages", "sections", "themes"];
    return validTabs.includes(urlTab || "") ? urlTab! : "languages";
  });
  
  const { t } = useTranslation();
  const { isLoaded, language } = useLanguage();
  const isRTL = language === 'ar';

  // 🎯 NEW: Add ref for tabs section to enable scrolling
  const tabsRef = useRef<HTMLDivElement>(null);

  // ✅ Update active tab when URL parameter changes
  useEffect(() => {
    const validTabs = ["languages", "sections", "themes"];
    if (urlTab && validTabs.includes(urlTab) && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab, activeTab]);

  // 🎯 NEW: Auto-scroll to tabs when navigating with tab parameter
  useEffect(() => {
    // Only scroll if there's a tab parameter in the URL and the page is loaded
    if (urlTab && tabsRef.current && !isLoadingWebsites) {
      // Add a small delay to ensure the page is fully rendered
      const scrollTimeout = setTimeout(() => {
        tabsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }, 300); // Small delay to ensure page is rendered

      return () => clearTimeout(scrollTimeout);
    }
  }, [urlTab, isLoadingWebsites, tabsRef]);

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
      {/* Responsive Modern Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/30" />
      
      {/* Responsive Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-2xl md:blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-0 w-40 h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-2xl md:blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/3 w-52 h-52 md:w-72 md:h-72 lg:w-80 lg:h-80 bg-pink-400/10 dark:bg-pink-600/10 rounded-full blur-2xl md:blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 md:py-4 lg:py-6 px-2 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 lg:space-y-12">
          
          {/* Enhanced Header Section - Fully Responsive */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 md:space-y-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-400/10 dark:to-purple-400/10 rounded-2xl md:rounded-3xl blur-2xl md:blur-3xl" />
              <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-slate-700/50 p-4 md:p-6 lg:p-8 shadow-2xl">
                <div className="flex items-center justify-center mb-4 md:mb-6">
                  <div className="relative">
                    <div className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                      <Settings className="h-7 w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 blur-xl opacity-50 animate-pulse" />
                  </div>
                </div>
                
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-3 md:mb-4 leading-tight">
                  {t('adminManagement.title', 'Website Configuration')}
                </h1>
                
                <p className="text-sm md:text-base lg:text-lg text-slate-600 dark:text-slate-400 max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-2 md:px-0">
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
          
          {/* 🎯 UPDATED: Enhanced Tabs Section with scroll target ref */}
          <motion.div
            ref={tabsRef} // Added ref for scrolling target
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="scroll-mt-4 md:scroll-mt-8" // Add scroll margin for better positioning
          >
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {/* Mobile-First Tab Navigation - NO SCROLLING */}
              <div className="flex justify-center mb-6 md:mb-8 px-2">
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl md:rounded-2xl p-1 md:p-2 border border-white/20 dark:border-slate-700/50 shadow-xl w-full max-w-2xl">
                  <TabsList className="grid grid-cols-3 bg-transparent gap-1 md:gap-2 w-full h-auto">
                    {tabConfig.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      
                      return (
                        <TabsTrigger 
                          key={tab.id}
                          value={tab.id} 
                          className={cn(
                            "relative px-2 sm:px-3 md:px-4 lg:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm md:text-base",
                            "data-[state=active]:text-white data-[state=active]:shadow-lg",
                            "hover:scale-105 active:scale-95 touch-manipulation",
                            "flex flex-col sm:flex-row items-center justify-center gap-1 md:gap-2",
                            "min-h-12 sm:min-h-10 md:min-h-12",
                            isRTL ? 'sm:flex-row-reverse' : '',
                            isActive 
                              ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg` 
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                          )}
                        >
                          <Icon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                          <span className="text-xs sm:text-sm md:text-base font-medium truncate max-w-full">
                            {t(`adminManagement.tabs.${tab.id}`, tab.label)}
                          </span>
                          
                          {isActive && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-lg md:rounded-xl"
                              transition={{ type: "spring", duration: 0.5 }}
                            />
                          )}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </div>
              </div>

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
                    "absolute inset-0 rounded-2xl md:rounded-3xl opacity-30 blur-2xl md:blur-3xl -z-10",
                    `bg-gradient-to-br ${activeTabConfig?.bgGradient}`
                  )} />
                  
                  <div className="relative bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-xl overflow-hidden">
                    <TabsContent value="languages" className="m-0 p-4 md:p-6 lg:p-8">
                      <div className="space-y-4 md:space-y-6">
                        <LanguageManagement hasWebsite={hasWebsite} />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="sections" className="m-0 p-4 md:p-6 lg:p-8">
                      <div className="space-y-4 md:space-y-6">
                        <SectionManagement hasWebsite={hasWebsite} />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="themes" className="m-0 p-4 md:p-6 lg:p-8">
                      <div className="space-y-4 md:space-y-6">
                        <ThemeManagement hasWebsite={hasWebsite} websites={websites} />
                      </div>
                    </TabsContent>
                  </div>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </motion.div>

          {/* Enhanced Footer  */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center space-y-3 md:space-y-4"
          >
            <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20 dark:border-slate-700/50 p-4 md:p-6 shadow-lg">
              <div className="flex items-center justify-center space-x-2 mb-2 md:mb-3">
                <Zap className="h-4 w-4 md:h-5 md:w-5 text-blue-500 flex-shrink-0" />
                <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm md:text-base text-center">
                  {t('adminManagement.footer.description', 'Powerful tools to customize every aspect of your website experience')}
                </span>
              </div>
                  
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-500 mt-2">
                {t('adminManagement.footer.note', 'Changes are applied instantly and synchronized across all devices')}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}