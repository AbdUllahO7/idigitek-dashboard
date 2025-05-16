"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type React from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  LayoutDashboard,
  LifeBuoy,
  Package,
  Settings,
  Users,
  HelpCircle,
  Building,
  Briefcase,
  Megaphone,
  Handshake,
  Workflow,
  FolderKanban,
  UserCircle,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Menu,
  X,
  Component,
  MessageCircle,
  HeartHandshake,
  ShieldQuestion,
  PenBoxIcon,
} from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "@/src/lib/utils"
import { useAuth } from "@/src/context/AuthContext"
import type { Section } from "@/src/api/types/hooks/section.types"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import { useSections } from "@/src/hooks/webConfiguration/use-section"
import Link from "next/link"
import { useMediaQuery } from "@/src/hooks/useMediaQuery"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

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
    roles: ["superAdmin", "owner"],
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    roles: ["superAdmin", "owner"],
    icon: Users,
  },
  {
    title: "Services",
    href: "/dashboard/services",
    icon: FolderKanban,
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
    sectionId: "news",
  },
  {
    title: "Industry Solutions",
    href: "/dashboard/IndustrySolutions",
    icon: Building,
    sectionId: "industrysolutions",
  },
  {
    title: "Choose Us",
    href: "/dashboard/WhyChooseUs",
    icon: Briefcase,
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
    title: "Team",
    href: "/dashboard/team",
    icon: Component,
    sectionId: "team",
  },
  {
    title: "Client Comments",
    href: "/dashboard/clientComments",
    icon: MessageCircle,
    sectionId: "clientcomments",
  },
  {
    title: "Partners",
    href: "/dashboard/partners",
    icon: HeartHandshake,
    sectionId: "partners",
  },
    {
    title: "FAQ",
    href: "/dashboard/FAQ",
    icon: ShieldQuestion,
    sectionId: "faq",
  },
  {
    title: "Blog",
    href: "/dashboard/blog",
    icon: PenBoxIcon,
    sectionId: "blog",
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: Settings,
    roles: ["superAdmin", "owner", "admin", "user"],
  },
  {
    title: "Web Configurations",
    href: "/dashboard/addWebSiteConfiguration",
    icon: Workflow,
    roles: ["superAdmin", "owner"],
  },
  {
    title: "Idigitek Admin",
    href: "/dashboard/idigitekAdmin",
    icon: Settings,
    roles: ["idigitekAdmin"],
  },
    {
    title: "Idigitek Admin",
    href: "/dashboard/idigitekAdmin",
    icon: Settings,
    roles: ["idigitekAdmin"],
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
  const { websiteId } = useWebsiteContext()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Check if screen is mobile
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Store the mapping of section names to actual section IDs from API
  const [sectionIdMapping, setSectionIdMapping] = useState<Map<string, string>>(new Map())

  // Use refs to track the current user and website for cache invalidation
  const processedWebsiteRef = useRef<string | null>(null)
  const processedUserRef = useRef<string | null>(null)

  // Use the website-specific sections hook
  const { useGetByWebsiteId } = useSections()

  // Fetch sections for this website
  const {
    data: websiteSections,
    isLoading: isLoadingSections,
    error: sectionsError,
    isError,
    refetch: refetchWebsiteSections,
    dataUpdatedAt,
  } = useGetByWebsiteId(websiteId || "", false, !!websiteId)

  // Extract active sections from the API response
  const activeSections = websiteSections?.data?.filter((section: Section) => section.isActive) || []

  // Manual refresh function for sections
  const handleManualRefresh = useCallback(() => {
    setIsRefreshing(true)
    refetchWebsiteSections()
      .then(() => {
        setLastRefreshTime(new Date())
        processedWebsiteRef.current = null
      })
      .catch((error) => {
        console.error("Error refreshing sections:", error)
      })
      .finally(() => {
        setIsRefreshing(false)
      })
  }, [refetchWebsiteSections])

  // Listen for storage events that might indicate section changes
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key?.includes("section") || event.key?.includes("website")) {
        handleManualRefresh()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [handleManualRefresh])

  // When user changes, reset processing flags
  useEffect(() => {
    const currentUserId = user?.id || user?.id
    if (currentUserId !== processedUserRef.current) {
      processedUserRef.current = currentUserId as string
      processedWebsiteRef.current = null

      setNavItems([])
      setIsLoading(true)

      if (websiteId) {
        refetchWebsiteSections()
      }
    }
  }, [user, websiteId, refetchWebsiteSections])

  // Listen for changes in the URL
  useEffect(() => {
    if (pathname.includes("/addWebSiteConfiguration")) {
      const needsRefresh = true
      sessionStorage.setItem("needsSectionRefresh", String(needsRefresh))
    } else if (sessionStorage.getItem("needsSectionRefresh") === "true") {
      sessionStorage.removeItem("needsSectionRefresh")
      handleManualRefresh()
    }

    // Close mobile menu when navigating
    if (isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    }
  }, [pathname, handleManualRefresh, isMobile, isMobileMenuOpen])

  // Filter nav items based on role and active sections
  const filterNavItems = (
    userRole: string | undefined,
    activeSections: Section[],
    sectionNameMap: Map<string, string>,
  ) => {
    try {
      // Get active section IDs from the API data
      const activeSectionIds = activeSections.map((section: Section) => {
        return section.name.toLowerCase().replace(/\s/g, "")
      })

      // Start with all non-section-based nav items that match the user's role
      const baseNavItems = allNavItems.filter((item) => {
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
      const sectionNavItems = allNavItems
        .filter((item) => {
          // Only process items with section IDs
          if (!item.sectionId) return false

          // Check if this section ID is in our active sections
          return activeSectionIds.includes(item.sectionId)
        })
        .map((item) => {
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

  // Process sections only when necessary
  useEffect(() => {
    // Skip if we're still loading users or sections, or if we're refreshing
    if (userIsLoading || (websiteId && isLoadingSections) || isRefreshing) {
      return
    }

    // Get the current user ID
    const currentUserId = user?.id || user?.id

    // Check if we've already processed this website for this user on this data update
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
      const storageKey = currentUserId ? `selectedSections_${currentUserId}` : "selectedSections"

      const activeSectionIds = activeSections.map((section: { name: string }) =>
        section.name.toLowerCase().replace(/\s/g, ""),
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
  }, [user, userIsLoading, websiteId, isLoadingSections, activeSections, dataUpdatedAt, isRefreshing, lastRefreshTime])

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

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Sidebar content component to avoid duplication
  const SidebarContent = () => (
    <>
      {/* User info display */}
      <div className="px-4 py-3 mb-2">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
            <UserCircle className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user?.name || user?.email || "Unknown user"}</p>
            <Badge variant="outline" className="mt-1 text-xs">
              {user?.role || "Unknown"}
            </Badge>
          </div>
        </div>
        <div className="mt-2 flex justify-between items-center text-xs text-slate-500">
          <span>
            {lastRefreshTime ? (
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                {lastRefreshTime.toLocaleTimeString()}
              </span>
            ) : (
              "Not refreshed"
            )}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Refresh sections"
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </div>

      <Separator className="mb-4" />

      {/* Navigation items */}
      <div className="flex-1 overflow-auto px-3">
        {activeSections.length === 0 && websiteId ? (
          <div className="p-3 mb-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-amber-800 dark:text-amber-200 text-sm">No active sections found</p>
            <Button
              variant="link"
              className="p-0 h-auto text-xs mt-1 text-amber-700 dark:text-amber-300"
              onClick={() => handleNavigation("/dashboard/addWebSiteConfiguration")}
            >
              Configure Sections
            </Button>
          </div>
        ) : null}

        <nav className="space-y-1">
          <TooltipProvider delayDuration={300}>
            <AnimatePresence initial={false}>
              {navItems.map((item, index) => {
                const isActive = pathname === item.href
                const isNavigating = navigatingTo === item.href

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.05,
                      ease: "easeOut",
                    }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={cn(
                            "w-full justify-start rounded-lg py-2.5 px-3 text-sm font-medium transition-all",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200",
                            item.sectionId && "border-l-2 border-slate-200 dark:border-slate-700 pl-4",
                          )}
                          onClick={() => handleNavigation(item.href, item.sectionId)}
                          disabled={isNavigating}
                        >
                          {isNavigating ? (
                            <Loader2 className="mr-3 h-5 w-5 animate-spin flex-shrink-0" />
                          ) : (
                            <item.icon
                              className={cn(
                                "mr-3 h-5 w-5 flex-shrink-0",
                                isActive ? "text-primary-foreground" : "text-slate-500 dark:text-slate-400",
                              )}
                            />
                          )}
                          <span className="truncate">{item.title}</span>
                          {isActive && <ChevronRight className="ml-auto h-4 w-4 flex-shrink-0" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="hidden md:block">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </TooltipProvider>
        </nav>
      </div>

      {/* Sidebar footer */}
      <div className="mt-auto pt-4 border-t dark:border-slate-700">
        <Link
          href={`https://wa.me/905465234640`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 mx-3 p-3 rounded-lg bg-primary text-primary-foreground font-medium shadow-sm hover:bg-primary/90 transition-all"
        >
          <LifeBuoy className="h-5 w-5" />
          <span>Help & Support</span>
        </Link>
      </div>
    </>
  )

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
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-3">
            <div className="h-12 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800"></div>
            <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800"></div>
            <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800"></div>
            <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800"></div>
            <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800"></div>
          </div>
        </div>
      </div>
    )
  }

  // Mobile view
  if (isMobile) {
    return (
      <>
        {/* Mobile header */}
        <div className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between border-b dark:border-slate-700 bg-background dark:bg-slate-900 px-4">
          <button
            onClick={() => handleNavigation("/dashboard")}
            className="flex items-center gap-2 font-semibold"
            disabled={navigatingTo === "/dashboard"}
          >
            {navigatingTo === "/dashboard" ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Home className="h-6 w-6" />
            )}
            <span>Admin Dashboard</span>
          </button>

          <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="ml-auto">
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Mobile sidebar */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black"
                onClick={toggleMobileMenu}
              />

              {/* Sidebar */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed top-0 right-0 z-50 h-full w-[280px] flex flex-col bg-background dark:bg-slate-900 shadow-xl"
              >
                <div className="flex h-16 items-center justify-between border-b dark:border-slate-700 px-4">
                  <div className="flex items-center gap-2 font-semibold">
                    <Home className="h-6 w-6" />
                    <span>Menu</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="ml-auto">
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                <div className="flex flex-col h-[calc(100%-4rem)] overflow-hidden">
                  <SidebarContent />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Content padding for fixed header */}
        <div className="h-16" />
      </>
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
        <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center">
          <div className="text-center max-w-xs">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl mb-6">
              <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Website Selected</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Please select a website to view available sections and manage content.
              </p>
              <Button className="w-full" onClick={() => handleNavigation("/dashboard/addWebSiteConfiguration")}>
                Configure Website
              </Button>
            </div>

            <nav className="grid gap-2 mt-6">
              {navItems
                .filter((item) => !item.sectionId)
                .map((item, index) => {
                  const isActive = pathname === item.href
                  const isNavigating = navigatingTo === item.href

                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Button
                        variant={isActive ? "default" : "outline"}
                        className="w-full justify-start"
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
                  )
                })}
            </nav>
          </div>
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
        <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center">
          <div className="text-center max-w-xs">
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl mb-6">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Sections</h3>
              <p className="text-red-600 dark:text-red-300 mb-4">
                {(sectionsError as Error)?.message || "Unknown error occurred while loading sections."}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleManualRefresh}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
                <Button className="flex-1" onClick={() => handleNavigation("/dashboard/settings")}>
                  Settings
                </Button>
              </div>
            </div>

            <nav className="grid gap-2 mt-6">
              {navItems
                .filter((item) => !item.sectionId)
                .map((item, index) => {
                  const isActive = pathname === item.href
                  const isNavigating = navigatingTo === item.href

                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Button
                        variant={isActive ? "default" : "outline"}
                        className="w-full justify-start"
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
                  )
                })}
            </nav>
          </div>
        </div>
      </div>
    )
  }

  // Desktop view - normal sidebar
  return (
    <div className="flex h-full flex-col border-r dark:border-slate-700 bg-background dark:bg-slate-900 shadow-sm">
      {/* Sidebar header */}
      <div className="flex h-16 items-center border-b dark:border-slate-700 px-4">
        <button
          onClick={() => handleNavigation("/dashboard")}
          className="flex items-center gap-2 font-semibold"
          disabled={navigatingTo === "/dashboard"}
        >
          {navigatingTo === "/dashboard" ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Home className="h-6 w-6 text-primary" />
          )}
          <span className="text-lg">Admin Dashboard</span>
        </button>
      </div>

      {/* Main sidebar content */}
      <div className="flex flex-col h-[calc(100%-4rem)] p-2 overflow-hidden">
        <SidebarContent />
      </div>
    </div>
  )
}
