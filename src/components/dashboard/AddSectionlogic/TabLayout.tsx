// TabLayout.tsx
"use client"

import { useState, ReactNode, JSX } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Button } from "@/src/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface TabItem {
  id: string
  label: string
  icon: JSX.Element
  content: ReactNode
}

interface TabLayoutProps {
  tabs: TabItem[]
  initialTab?: string
  onSave?: () => Promise<void>
  onBack?: () => void
  title: string
  subtitle: string
  isSubmitting?: boolean
  saveButtonLabel?: ReactNode
  showBackButton?: boolean
  backButtonLabel?: string
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
    transition: { type: "spring", stiffness: 100, damping: 10 },
  },
}

export function TabLayout({
  tabs,
  initialTab,
  onSave,
  onBack,
  title,
  subtitle,
  isSubmitting = false,
  saveButtonLabel = "Save",
  showBackButton = true,
  backButtonLabel = "Back"
}: TabLayoutProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab || tabs[0]?.id || "")

  // Get tab IDs in order
  const tabOrder = tabs.map(tab => tab.id)
  
  // Tab navigation functions
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)
  }

  const goToNextTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab)
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1])
    }
  }

  const goToPreviousTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1])
    }
  }

  // Check if current tab is the last one
  const isLastTab = activeTab === tabOrder[tabOrder.length - 1]
  const isFirstTab = activeTab === tabOrder[0]

  return (
    <motion.div className="container py-10" initial="hidden" animate="visible" variants={containerVariants}>
      <div className="flex flex-col space-y-8">
        <motion.div className="flex flex-col md:flex-row md:items-center justify-between gap-4" variants={itemVariants}>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          {showBackButton && (
            <Button
              variant="outline"
              onClick={onBack}
              className="border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backButtonLabel}
            </Button>
          )}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full p-0 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 rounded-none">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex-1 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-teal-500 rounded-none"
                >
                  <div className="flex items-center gap-2">
                    {tab.icon}
                    <span className="capitalize">{tab.label}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {tabs.map((tab) => (
                    <TabsContent key={tab.id} value={tab.id} className="mt-0">
                      {tab.content}
                    </TabsContent>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        </motion.div>

        <motion.div variants={itemVariants} className="pt-6 border-t flex justify-between">
          {!isFirstTab && (
            <Button
              onClick={goToPreviousTab}
              variant="outline"
              className="flex items-center border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800/50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          )}

          <div className="flex-1" />

          {/* {!isLastTab ? (
            <Button
              onClick={goToNextTab}
              className="flex items-center bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={onSave}
              disabled={isSubmitting}
              className="h-12 text-lg bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                saveButtonLabel
              )}
            </Button>
          )} */}
        </motion.div>
      </div>
    </motion.div>
  )
}