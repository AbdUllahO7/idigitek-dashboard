"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import DashboardSidebar from "@/src/components/dashboard/dashboard-sidebar"
import DashboardHeader from "@/src/components/dashboard/dashboard-header"
import { useAuth } from "@/src/context/AuthContext"
import { RouteGuard } from "@/src/components/dashboard/RouteGuard"
import { Toaster } from "@/src/components/ui/toaster"
import { LanguageProvider } from "@/src/context/LanguageContext"

/**
 * Dashboard layout component
 * Provides the layout structure for all dashboard pages with authentication protection
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const checkScreenSize = () => {
      const isMobileView = window.innerWidth < 1024
      setIsMobile(isMobileView)
      if (isMobileView) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    // Initial check
    checkScreenSize()

    // Add event listener
    window.addEventListener("resize", checkScreenSize)

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }, [pathname, isMobile])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <RouteGuard>
      <LanguageProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          {/* Desktop sidebar - only show on desktop */}
          {!isMobile && (
            <AnimatePresence mode="wait">
              {isSidebarOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="w-[280px] border-r bg-background shadow-sm"
                >
                  <DashboardSidebar 
                    isSidebarOpen={isSidebarOpen} 
                    toggleSidebar={toggleSidebar} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Mobile sidebar - handled entirely by DashboardSidebar component */}
          {isMobile && (
            <DashboardSidebar 
              isSidebarOpen={isSidebarOpen} 
              toggleSidebar={toggleSidebar} 
            />
          )}

          {/* Main content area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <DashboardHeader 
              isSidebarOpen={isSidebarOpen} 
              toggleSidebar={toggleSidebar} 
            />
            <main className="flex-1 overflow-auto p-4 transition-all duration-300 ease-in-out">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className=" mx-auto"
              >
                {children}
                <Toaster/>
              </motion.div>
            </main>
          </div>
        </div>
      </LanguageProvider>
    </RouteGuard>
  )
}