"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type React from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Home,
  LayoutDashboard,
  LifeBuoy,
  Package,
  Settings,
  Users,
  MessageSquare,
  HelpCircle,
  FileText,
  Contact,
  Building,
  Briefcase,
  Send,
  Megaphone,
  Handshake,
  Workflow,
  FolderKanban,
  Server,
  UserCircle,
  Loader2,
  AlertTriangle,
  RefreshCw
} from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "@/src/lib/utils"
import { useAuth } from "@/src/context/AuthContext"
import { Section } from "@/src/api/types/hooks/section.types"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import { useSections } from "@/src/hooks/webConfiguration/use-section"

/**
 * Navigation item interface
 */
interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  sectionId?: string // The section ID this nav item corresponds to
  roles?: string[] 
}

/**
 * All possible navigation items for the sidebar
 */
const allNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    roles: ['superAdmin' , 'owner'], // Only superAdmin can see this
    icon: LayoutDashboard, // const 
    // Dashboard is always shown
  },
  {
    title: "Users",
    href: "/dashboard/users",
    roles: ['superAdmin' , 'owner'], // Only superAdmin can see this
    icon: Users, // const 
    // Users is always shown
  },
  {
    title: "Services",
    href: "/dashboard/services",
    icon: Package,
    sectionId: "services", 
  },
  {
    title: "Header",
    href: "/dashboard/header",
    icon: Package,
    sectionId: "header", 
  },
  {
    title: "News",
    href: "/dashboard/News",
    icon: Megaphone,
    sectionId: "news", // Show when "newsSection" section is selected
  },
  {
    title: "Industry Solutions",
    href: "/dashboard/IndustrySolutions",
    icon: Building,
    sectionId: "industrysolutions", 
  },
  {
    title: "Chose Us",
    href: "/dashboard/WhyChooseUs",
    icon: Handshake,
    sectionId: "choseus", 
  },
    {
    title: "Projects",
    href: "/dashboard/projects",
    icon: Handshake,
    sectionId: "projects", 
  },
  {
    title: "Our Process",
    href: "/dashboard/ourProcess",
    icon: HelpCircle,
    sectionId: "ourprocess", 
  },
  {
    title: "Settings",
    href: "/dashboard/settings", // const  
    icon: Settings,
    roles: ['superAdmin' , 'owner' , 'admin' , 'user'],
    // Settings is always shown
  },
  {
    title: "Web Configurations",
    href: "/dashboard/addWebSiteConfiguration", 
    icon: Settings,
    roles: ['superAdmin' , 'owner'], 
  },
  {
    title: "Idigitek Admin",
    href: "/dashboard/idigitekAdmin", 
    icon: Settings,
    roles: ['idigitekAdmin'], 
  },
  
]

/**
 * Dashboard Sidebar component
 * Contains the main navigation for the dashboard
 */
export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  const { user, isLoading: userIsLoading } = useAuth()
  const { websiteId } = useWebsiteContext() // Get websiteId from context
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)
  
  // Store the mapping of section names to actual section IDs from API
  const [sectionIdMapping, setSectionIdMapping] = useState<Map<string, string>>(new Map())
  
  // Use refs to track the current user and website for cache invalidation
  const processedWebsiteRef = useRef<string | null>(null)
  const processedUserRef = useRef<string | null>(null)
  
  // Use the website-specific sections hook instead of getAllSections
  const { 
    useGetByWebsiteId,
  } = useSections()

  // Fetch sections for this website - with a shorter staleTime to refresh more frequently
  const { 
    data: websiteSections, 
    isLoading: isLoadingSections,
    error: sectionsError,
    isError,
    refetch: refetchWebsiteSections,
    dataUpdatedAt
  } = useGetByWebsiteId(
    websiteId || "",      // Pass the websiteId (empty string if null)
    false,                // Only active sections
    !!websiteId,          // Only run the query if we have a websiteId
  )

  // Extract active sections from the API response
  const activeSections = websiteSections?.data?.filter((section: Section) => section.isActive) || []
  
  // Manual refresh function for sections
  const handleManualRefresh = useCallback(() => {
    setIsRefreshing(true)
    refetchWebsiteSections()
      .then(() => {
        setLastRefreshTime(new Date())
        // Reset the processed website flag to force UI update
        processedWebsiteRef.current = null
      })
      .catch(error => {
        console.error("Error refreshing sections:", error)
      })
      .finally(() => {
        setIsRefreshing(false)
      })
  }, [refetchWebsiteSections])
  
  // Listen for storage events that might indicate section changes
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Check if the event is related to sections
      if (event.key?.includes('section') || event.key?.includes('website')) {
        handleManualRefresh()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [handleManualRefresh])
  
  // When user changes, we need to reset our processing flags
  useEffect(() => {
    const currentUserId = user?.id || user?.id
    if (currentUserId !== processedUserRef.current) {
      // If the user has changed, reset the processing flags
      processedUserRef.current = currentUserId as string
      processedWebsiteRef.current = null
      
      // Reset the nav items for the new user
      setNavItems([])
      setIsLoading(true)
      
      // Force refetch for the new user if we have a websiteId
      if (websiteId) {
        refetchWebsiteSections()
      }
    }
  }, [user, websiteId, refetchWebsiteSections])

  // Listen for changes in the URL - if we go to the configuration page and back, refresh sections
  useEffect(() => {
    if (pathname.includes('/addWebSiteConfiguration')) {
      // When leaving the config page, mark that we need to refresh
      const needsRefresh = true;
      sessionStorage.setItem('needsSectionRefresh', String(needsRefresh));
    } else if (sessionStorage.getItem('needsSectionRefresh') === 'true') {
      // If we're coming back from the config page, refresh sections
      sessionStorage.removeItem('needsSectionRefresh');
      handleManualRefresh();
    }
  }, [pathname, handleManualRefresh]);
  
  // Set up a function to filter nav items based on role and active sections
  const filterNavItems = (
    userRole: string | undefined, 
    activeSections: Section[], 
    sectionNameMap: Map<string, string>
  ) => {
    try {
      // Get active section IDs from the API data
      const activeSectionIds = activeSections.map((section: Section) => {
        // Make sure to strip spaces and lowercase for consistent matching
        return section.name.toLowerCase().replace(/\s/g, "")
      })
      
      // Start with all non-section-based nav items that match the user's role
      const baseNavItems = allNavItems.filter(item => {
        // Check role restrictions first
        if (item.roles && userRole) {
          if (!item.roles.includes(userRole)) {
            return false
          }
        }
        
        // Include if it's not a section-specific item
        return !item.sectionId
      })
      
      // Then add section-specific items that match active sections
      const sectionNavItems = allNavItems.filter(item => {
        // Only process items with section IDs
        if (!item.sectionId) return false
        
        // Check if this section ID is in our active sections
        return activeSectionIds.includes(item.sectionId)
      }).map(item => {
        // Create a copy to modify
        const newItem = { ...item }
        
        // Update title if we have it in our mapping
        if (item.sectionId && sectionNameMap.has(item.sectionId)) {
          newItem.title = sectionNameMap.get(item.sectionId) || item.title
        }
        
        return newItem
      })
      
      // Combine and return all matching nav items
      return [...baseNavItems, ...sectionNavItems]
      
    } catch (error) {
      console.error("Error filtering nav items:", error)
      // In case of error, show only the items without sectionId and respect role restrictions
      return allNavItems.filter((item) => {
        // Check role restrictions
        if (item.roles && userRole) {
          if (!item.roles.includes(userRole)) {
            return false
          }
        }
        return !item.sectionId
      })
    }
  }
  
  // Process sections only when necessary - with additional triggers for data updates
  useEffect(() => {
    // Skip if we're still loading users or sections, or if we're refreshing
    if (userIsLoading || (websiteId && isLoadingSections) || isRefreshing) {
      return
    }
    
    // Get the current user ID
    const currentUserId = user?.id || user?.id
    
    // Check if we've already processed this website for this user on this data update
    // The dataUpdatedAt timestamp is key here - it will change whenever the data refreshes
    const currentTimestamp = dataUpdatedAt || 0
    if (
      websiteId === processedWebsiteRef.current && 
      currentUserId === processedUserRef.current &&
      lastRefreshTime?.getTime() === currentTimestamp
    ) {
      return
    }
    
    // Map section IDs to their names
    const sectionNameMap = new Map<string, string>()
    const idMapping = new Map<string, string>()
    
    if (activeSections.length > 0) {
      activeSections.forEach((section: Section) => {
        const sectionId = section.name.toLowerCase().replace(/\s/g, "")
        sectionNameMap.set(sectionId, section.name)
        
        // Store the actual database ID for each section
        if (section._id) {
          idMapping.set(sectionId, section._id)
        }
      })
      
      // Save the ID mapping for use in navigation
      setSectionIdMapping(idMapping)
      
      // Store active section IDs in localStorage for persistence
      // We now include the user ID in the key to avoid conflicts between users
      const storageKey = currentUserId ? `selectedSections_${currentUserId}` : 'selectedSections'
      
      const activeSectionIds = activeSections.map((section: { name: string }) => 
        section.name.toLowerCase().replace(/\s/g, "")
      )
      localStorage.setItem(storageKey, JSON.stringify(activeSectionIds))
    }
    
    // Filter nav items based on user role and active sections
    const filteredItems = filterNavItems(user?.role, activeSections, sectionNameMap)
    setNavItems(filteredItems)
    
    // Update loading state
    setIsLoading(false)
    
    // Mark this website, user, and timestamp as processed
    processedWebsiteRef.current = websiteId
    processedUserRef.current = currentUserId as string
    setLastRefreshTime(new Date(currentTimestamp))
    
  }, [
    user,
    userIsLoading,
    websiteId,
    isLoadingSections,
    activeSections,
    dataUpdatedAt, // Add dataUpdatedAt as a dependency to catch data refreshes
    isRefreshing,
    lastRefreshTime
  ])

  /**
   * Handle navigation with loading indicator and section ID parameter
   */
  const handleNavigation = (href: string, sectionId?: string) => {
    // Don't navigate if already navigating or if clicking the current page
    if (navigatingTo || pathname === href) {
      return
    }
    
    // Set the navigating state to show loading indicator
    setNavigatingTo(href)
    
    // If this navigation item is for a section that has an ID in our mapping, append it as a query param
    let targetUrl = href
    if (sectionId && sectionIdMapping.has(sectionId)) {
      const actualSectionId = sectionIdMapping.get(sectionId)
      targetUrl = `${href}?sectionId=${actualSectionId}`
    }
    
    // Prefetch the page before navigating
    router.prefetch(targetUrl)
    
    // Navigate to the new page with section ID if available
    router.push(targetUrl)
    
    // Clear the navigating state after navigation completes
    setTimeout(() => {
      setNavigatingTo(null)
    }, 500)
  }

  // Show loading state while fetching sections or user
  if (isLoading || userIsLoading || (websiteId && isLoadingSections)) {
    return (
      <div className="flex h-full flex-col border-r dark:border-slate-700 bg-background dark:bg-slate-900">
        <div className="flex h-16 items-center border-b dark:border-slate-700 px-6">
          <div className="flex items-center gap-2 font-semibold">
            <Home className="h-6 w-6" />
            <span>Admin Dashboard</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto py-6">
          <div className="grid gap-2 px-4">
            {[1, 2, 3, 4].map((_, index) => (
              <div key={index} className="h-10 w-full animate-pulse rounded-md bg-slate-200 dark:bg-slate-800"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // No website selected yet
  if (!websiteId) {
    return (
      <div className="flex h-full flex-col border-r dark:border-slate-700 bg-background dark:bg-slate-900">
        <div className="flex h-16 items-center border-b dark:border-slate-700 px-6">
          <div className="flex items-center gap-2 font-semibold">
            <Home className="h-6 w-6" />
            <span>Admin Dashboard</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto py-6">
          <div className="px-4 py-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
            <p className="mt-4 text-slate-500">
              Please select a website to view available sections.
            </p>
            <Button 
              className="mt-4"
              onClick={() => handleNavigation("/dashboard/addWebSiteConfiguration")}
            >
              Configure Website
            </Button>
          </div>
          <nav className="grid gap-2 px-4 mt-6">
            {navItems.filter(item => !item.sectionId).map((item, index) => {
              const isActive = pathname === item.href;
              const isNavigating = navigatingTo === item.href;
              
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground",
                    )}
                    onClick={() => handleNavigation(item.href, item.sectionId)}
                    disabled={isNavigating}
                  >
                    {isNavigating ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <item.icon className="mr-2 h-5 w-5" />
                    )}
                    {item.title}
                  </Button>
                </motion.div>
              );
            })}
          </nav>
        </div>
      </div>
    )
  }

  // Error fetching sections
  if (isError) {
    return (
      <div className="flex h-full flex-col border-r dark:border-slate-700 bg-background dark:bg-slate-900">
        <div className="flex h-16 items-center border-b dark:border-slate-700 px-6">
          <div className="flex items-center gap-2 font-semibold">
            <Home className="h-6 w-6" />
            <span>Admin Dashboard</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto py-6">
          <div className="px-4 py-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <p className="mt-4 text-red-500">
              Error loading sections: {(sectionsError as Error)?.message || "Unknown error"}
            </p>
            <Button 
              className="mt-4"
              onClick={() => handleNavigation("/dashboard/settings")}
            >
              Go to Settings
            </Button>
          </div>
          <nav className="grid gap-2 px-4 mt-6">
            {navItems.filter(item => !item.sectionId).map((item, index) => {
              const isActive = pathname === item.href;
              const isNavigating = navigatingTo === item.href;
              
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground",
                    )}
                    onClick={() => handleNavigation(item.href, item.sectionId)}
                    disabled={isNavigating}
                  >
                    {isNavigating ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <item.icon className="mr-2 h-5 w-5" />
                    )}
                    {item.title}
                  </Button>
                </motion.div>
              );
            })}
          </nav>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col border-r dark:border-slate-700 bg-background dark:bg-slate-900">
      {/* Sidebar header */}
      <div className="flex h-16 items-center border-b dark:border-slate-700 px-6">
        <button 
          onClick={() => handleNavigation("/dashboard")} 
          className="flex items-center gap-2 font-semibold flex-1"
          disabled={navigatingTo === "/dashboard"}
        >
          {navigatingTo === "/dashboard" ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Home className="h-6 w-6" />
          )}
          <span>Admin Dashboard</span>
        </button>
        
        {/* Add a refresh button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          title="Refresh sections"
          className="ml-auto"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        </Button>
      </div>

      {/* User info display - helps debug user switching issues */}
      <div className="px-4 py-2 text-xs text-slate-500 border-b dark:border-slate-700">
        <div className="flex items-center gap-2">
          <UserCircle className="h-4 w-4" />
          <span>{user?.name || user?.email || "Unknown user"}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span>Role: {user?.role || "Unknown"}</span>
          <span className="text-xs text-slate-400">
            {lastRefreshTime ? `Updated: ${lastRefreshTime.toLocaleTimeString()}` : "Not refreshed yet"}
          </span>
        </div>
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-auto py-6">
        {activeSections.length === 0 && websiteId ? (
          <div className="px-4 py-4 mb-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md mx-4 text-center">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              No active sections found for this website.
            </p>
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm mt-1"
              onClick={() => handleNavigation("/dashboard/addWebSiteConfiguration")}
            >
              Configure Sections
            </Button>
          </div>
        ) : null}

        <nav className="grid gap-2 px-4">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            const isNavigating = navigatingTo === item.href;
            
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground",
                  )}
                  onClick={() => handleNavigation(item.href, item.sectionId)}
                  disabled={isNavigating}
                >
                  {isNavigating ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <item.icon className="mr-2 h-5 w-5" />
                  )}
                  {item.title}
                </Button>
              </motion.div>
            );
          })}
        </nav>
      </div>

      {/* Sidebar footer */}
      <div className="border-t dark:border-slate-700 p-4">
        <Button variant="outline" className="w-full justify-start">
          <LifeBuoy className="mr-2 h-5 w-5" />
          Help & Support
        </Button>
      </div>
    </div>
  )
}