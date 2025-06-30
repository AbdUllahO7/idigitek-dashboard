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
  X,
  Component,
  MessageCircle,
  HeartHandshake,
  ShieldQuestion,
  PenBoxIcon,
  Contact,
  TouchpadOff,
  Files,
  Type,
  Globe,
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
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/src/context/LanguageContext"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { PREDEFINED_SECTIONS } from "@/src/Const/SectionsData"

/**
 * Props for the DashboardSidebar component
 */
interface DashboardSidebarProps {
  isSidebarOpen?: boolean
  toggleSidebar?: () => void
}

/**
 * Navigation item interface
 */
interface NavItem {
  titleKey: string
  href: string
  icon: React.ElementType
  sectionId?: string
  roles?: string[]
  customName?: string // Custom name based on current language
  originalName?: string // Original predefined name for tooltip
  isMultilingual?: boolean // 🎯 NEW: Whether this section has multilingual names
  multilingualNames?: { en: string; ar: string; tr: string } // 🎯 NEW: All language names for tooltip
}

/**
 * Section order interface
 */
interface SectionOrder {
  name: string
  order: number
  id: string
}

/**
 * All possible navigation items for the sidebar
 */
const allNavItems: NavItem[] = [
  {
    titleKey: "Dashboard_sideBar.nav.dashboard",
    href: "/dashboard",
    roles: ["superAdmin", "owner"],
    icon: LayoutDashboard,
  },
  {
    titleKey: "Dashboard_sideBar.nav.users",
    href: "/dashboard/users",
    roles: ["superAdmin", "owner"],
    icon: Users,
  },
  {
    titleKey: "Dashboard_sideBar.nav.Forms",
    href: "/dashboard/ContactForm",
    roles: ["superAdmin", "owner"],
    icon: Files,
  },

  {
    titleKey: "Dashboard_sideBar.nav.services",
    href: "/dashboard/services",
    icon: FolderKanban,
    sectionId: "services",
  },
  {
    titleKey: "Dashboard_sideBar.nav.header",
    href: "#",
    icon: Package,
    sectionId: "header",
  },
  {
    titleKey: "Dashboard_sideBar.nav.news",
    href: "/dashboard/News",
    icon: Megaphone,
    sectionId: "news",
  },
    {
    titleKey: "Dashboard_sideBar.nav.products",
    href: "/dashboard/products",
    icon: Megaphone,
    sectionId: "products",
  },
  {
    titleKey: "Dashboard_sideBar.nav.industrySolutions",
    href: "/dashboard/IndustrySolutions",
    icon: Building,
    sectionId: "industrysolutions",
  },
  {
    titleKey: "Dashboard_sideBar.nav.whyChooseUs",
    href: "/dashboard/WhyChooseUs",
    icon: Briefcase,
    sectionId: "whychooseus",
  },
  {
    titleKey: "Dashboard_sideBar.nav.projects",
    href: "/dashboard/projects",
    icon: Handshake,
    sectionId: "projects",
  },
  {
    titleKey: "Dashboard_sideBar.nav.ourProcess",
    href: "/dashboard/ourProcess",
    icon: HelpCircle,
    sectionId: "ourprocess",
  },
  {
    titleKey: "Dashboard_sideBar.nav.team",
    href: "/dashboard/team",
    icon: Component,
    sectionId: "team",
  },
  {
    titleKey: "Dashboard_sideBar.nav.clientComments",
    href: "/dashboard/clientComments",
    icon: MessageCircle,
    sectionId: "clientcomments",
  },
  {
    titleKey: "Dashboard_sideBar.nav.partners",
    href: "/dashboard/partners",
    icon: HeartHandshake,
    sectionId: "partners",
  },
  {
    titleKey: "Dashboard_sideBar.nav.faq",
    href: "/dashboard/FAQ",
    icon: ShieldQuestion,
    sectionId: "faq",
  },
  {
    titleKey: "Dashboard_sideBar.nav.blog",
    href: "/dashboard/blog",
    icon: PenBoxIcon,
    sectionId: "blog",
  },
  {
    titleKey: "Dashboard_sideBar.nav.contact",
    href: "/dashboard/contact",
    icon: Contact,
    sectionId: "contact",
  },
  {
    titleKey: "Dashboard_sideBar.nav.hero",
    href: "/dashboard/heroSection",
    icon: TouchpadOff,
    sectionId: "hero",
  },
  {
    titleKey: "Dashboard_sideBar.nav.footer",
    href: "/dashboard/footer",
    icon: TouchpadOff,
    sectionId: "footer",
  },
  {
    titleKey: "Dashboard_sideBar.nav.profile",
    href: "/dashboard/profile",
    icon: Settings,
    roles: ["superAdmin", "owner", "admin", "user"],
  },
  {
    titleKey: "Dashboard_sideBar.nav.webConfigurations",
    href: "/dashboard/addWebSiteConfiguration",
    icon: Workflow,
    roles: ["superAdmin", "owner"],
  },
      {
    titleKey: "Dashboard_sideBar.nav.addNewSection",
    href: "/dashboard/addWebSiteConfiguration?tab=sections", 
    roles: ["superAdmin", "owner"],
    icon: Files,
  },
  {
    titleKey: "Dashboard_sideBar.nav.idigitekAdmin",
    href: "/dashboard/idigitekAdmin",
    icon: Settings,
    roles: ["idigitekAdmin"],
  },
]

/**
 * Dashboard Sidebar component
 * Contains the main navigation for the dashboard
 */
export default function DashboardSidebar({ isSidebarOpen = false, toggleSidebar }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  const { user, isLoading: userIsLoading } = useAuth()
  const { websiteId } = useWebsiteContext()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)
  const { t, ready } = useTranslation()
  const { isLoaded, language } = useLanguage() // 🎯 UPDATED: Get current language

  // Check if screen is mobile
  const isMobile = useMediaQuery("(max-width: 1024px)")

  // Store the mapping of section names to actual section IDs and orders
  const [sectionIdMapping, setSectionIdMapping] = useState<Map<string, string>>(new Map())
  const [sectionOrderMapping, setSectionOrderMapping] = useState<Map<string, SectionOrder>>(new Map())

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

  // 🎯 UPDATED: Function to get section identifier for matching with multilingual support
  const getSectionIdentifier = (section: Section) => {
    // Try to match by subName first (most reliable)
    if (section.subName) {
      return section.subName.toLowerCase()
    }
    // Fallback to processed English name for multilingual sections
    if (typeof section.name === 'object' && section.name.en) {
      return section.name.en.toLowerCase().replace(/\s/g, "")
    }
    // Fallback to processed name for legacy sections
    if (typeof section.name === 'string') {
      return section.name.toLowerCase().replace(/\s/g, "")
    }
    return 'unknown'
  }

  // 🎯 UPDATED: Function to get the original section name for tooltip with multilingual support
  const getOriginalSectionName = (section: Section) => {
    if (section.subName) {
      // Find the predefined section to get translated name
      const predefinedSection = PREDEFINED_SECTIONS.find(ps => ps.subName === section.subName)
      if (predefinedSection && ready) {
        return t(predefinedSection.nameKey, predefinedSection.nameKey.split('.').pop() || '')
      }
    }
    return null
  }

  // 🎯 NEW: Function to get section display name based on current language
  const getSectionDisplayName = (section: Section) => {
    // Handle multilingual names based on current language
    if (typeof section.name === 'object') {
      // Use current language if available
      if (section.name[language as keyof typeof section.name]) {
        return section.name[language as keyof typeof section.name]
      }
      // Fallback to English
      if (section.name.en) {
        return section.name.en
      }
    }
    
    // Handle legacy string names
    if (typeof section.name === 'string' && section.name.trim()) {
      return section.name.trim()
    }
    
    // Final fallback to translated predefined name
    if (section.subName) {
      const predefinedSection = PREDEFINED_SECTIONS.find(ps => ps.subName === section.subName)
      if (predefinedSection && ready) {
        return t(predefinedSection.nameKey, predefinedSection.nameKey.split('.').pop() || '')
      }
    }
    
    return section.subName || 'Unknown Section'
  }

  // 🎯 NEW: Function to check if section has multilingual names
  const hasMultilingualNames = (section: Section) => {
    return typeof section.name === 'object' && section.name.en && section.name.ar && section.name.tr
  }

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

  // Listen for changes in the URL and close mobile menu when navigating
  useEffect(() => {
    if (pathname.includes("/addWebSiteConfiguration")) {
      const needsRefresh = true
      sessionStorage.setItem("needsSectionRefresh", String(needsRefresh))
    } else if (sessionStorage.getItem("needsSectionRefresh") === "true") {
      sessionStorage.removeItem("needsSectionRefresh")
      handleManualRefresh()
    }
  }, [pathname, handleManualRefresh])

  // 🎯 UPDATED: Filter nav items based on role and active sections with custom names
  const filterNavItems = (
    userRole: string | undefined,
    activeSections: Section[],
    sectionNameMap: Map<string, string>,
    sectionOrderMap: Map<string, SectionOrder>,
  ) => {
    try {
      // 🎯 UPDATED: Create a mapping of section identifiers to section data
      const sectionDataMap = new Map<string, Section>()
      activeSections.forEach((section: Section) => {
        const identifier = getSectionIdentifier(section)
        sectionDataMap.set(identifier, section)
      })

      // Get active section identifiers
      const activeSectionIds = Array.from(sectionDataMap.keys())

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

      // 🎯 UPDATED: Add section-specific items with custom names
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
          
          // 🎯 NEW: Get the section data and set custom name with multilingual support
          const sectionData = sectionDataMap.get(item.sectionId!)
          if (sectionData) {
            // Use the display name based on current language
            newItem.customName = getSectionDisplayName(sectionData)
            // Get the original translated name for tooltip
            newItem.originalName = getOriginalSectionName(sectionData)
            // Store multilingual info for tooltip
            newItem.isMultilingual = hasMultilingualNames(sectionData)
            newItem.multilingualNames = hasMultilingualNames(sectionData) ? sectionData.name : undefined
          }
          
          return newItem
        })
        // Sort section-specific items based on order from sectionOrderMap
        .sort((a, b) => {
          if (!a.sectionId || !b.sectionId) return 0
          const orderA = sectionOrderMap.get(a.sectionId)?.order ?? Number.POSITIVE_INFINITY
          const orderB = sectionOrderMap.get(b.sectionId)?.order ?? Number.POSITIVE_INFINITY
          return orderA - orderB
        })

      // Combine and return all matching nav items
      return [...baseNavItems, ...sectionNavItems]
    } catch (error) {
      console.error("Error filtering nav items:", error)
      // In case of error, show only the items without sectionId and respect role restrictions
      return allNavItems.filter((item) => {
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

    // Map section IDs to their names and orders
    const sectionNameMap = new Map<string, string>()
    const idMapping = new Map<string, string>()
    const orderMapping = new Map<string, SectionOrder>()

    if (websiteSections?.data?.length > 0) {
      const activeSections = websiteSections.data.filter((section: Section) => section.isActive)
      activeSections.forEach((section: Section) => {
        const sectionId = getSectionIdentifier(section)
        sectionNameMap.set(sectionId, section.name)
        if (section._id) {
          idMapping.set(sectionId, section._id)
          orderMapping.set(sectionId, {
            name: section.name,
            order: section.order ?? 0,
            id: section._id,
          })
        }
      })

      // Save the ID and order mappings
      setSectionIdMapping(idMapping)
      setSectionOrderMapping(orderMapping)

      // Store active section IDs in localStorage for persistence
      const storageKey = currentUserId ? `selectedSections_${currentUserId}` : "selectedSections"
      const activeSectionIds = activeSections.map((section: Section) => getSectionIdentifier(section))
      localStorage.setItem(storageKey, JSON.stringify(activeSectionIds))
    }

    // Filter nav items based on user role, active sections, and order
    const filteredItems = filterNavItems(
      user?.role,
      websiteSections?.data?.filter((section: Section) => section.isActive) || [],
      sectionNameMap,
      orderMapping,
    )
    setNavItems(filteredItems)

    // Update loading state
    setIsLoading(false)

    // Mark this website, user, and timestamp as processed
    processedWebsiteRef.current = websiteId
    processedUserRef.current = currentUserId as string
    setLastRefreshTime(new Date(currentTimestamp))
  }, [user, userIsLoading, websiteId, isLoadingSections, websiteSections, dataUpdatedAt, isRefreshing, lastRefreshTime])

  /**
   * Handle navigation with loading indicator and section ID parameter
   */
  const handleNavigation = useCallback((href: string, sectionId?: string) => {
    // Don't navigate if already navigating or if clicking the current page
    if (navigatingTo || pathname === href) {
      return
    }

    // Close mobile sidebar when navigating
    if (isMobile && isSidebarOpen && toggleSidebar) {
      toggleSidebar()
    }

    // Set the navigating state to show loading indicator
    setNavigatingTo(href)

    // If this navigation item is for a section that has an ID in our mapping, append it as a query param
    let targetUrl = href
    if (sectionId && sectionIdMapping.has(sectionId)) {
      const actualSectionId = sectionIdMapping.get(sectionId)
      targetUrl = `${href}?sectionId=${actualSectionId}`
    }

    // Navigate to the new page with section ID if available
    router.push(targetUrl)

    // Clear the navigating state after navigation completes
    setTimeout(() => {
      setNavigatingTo(null)
    }, 500)
  }, [navigatingTo, pathname, isMobile, isSidebarOpen, toggleSidebar, sectionIdMapping, router])

  // Safe translation function
  const safeTranslate = useCallback((key: string, fallback: string = "") => {
    if (!ready || !t) {
      return fallback || key.split(".").pop() || ""
    }
    try {
      return t(key, fallback || key.split(".").pop() || "")
    } catch (error) {
      return fallback || key.split(".").pop() || ""
    }
  }, [ready, t])

  // 🎯 NEW: Function to get display name for navigation item
  const getDisplayName = (item: NavItem) => {
    // Use custom name if available (for sections)
    if (item.customName) {
      return item.customName
    }
    // Fallback to translated name
    return safeTranslate(item.titleKey, item.titleKey.split(".").pop() || "")
  }

  // Render navigation items
  const renderNavItems = () => {
    // Show loading state if still loading
    if ((isLoading || userIsLoading || (websiteId && isLoadingSections)) && navItems.length === 0) {
      return (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800"></div>
          ))}
        </div>
      )
    }

    return (
      <>
        {/* Warning if no sections */}
        {websiteSections?.data?.length === 0 && websiteId && (
          <div className="p-3 mb-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-amber-800 dark:text-amber-200 text-sm">
              {safeTranslate("Dashboard_sideBar.noActiveSections", "No active sections found")}
            </p>
            <Button
              variant="link"
              className="p-0 h-auto text-xs mt-1 text-amber-700 dark:text-amber-300"
              onClick={() => handleNavigation("/dashboard/addWebSiteConfiguration")}
            >
              {safeTranslate("Dashboard_sideBar.configureSections", "Configure Sections")}
            </Button>
          </div>
        )}

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href
            const isNavigating = navigatingTo === item.href
            const displayName = getDisplayName(item)
            const hasCustomName = !!item.customName
            const originalName = item.originalName
            const isMultilingual = item.isMultilingual // 🎯 NEW

            // 🎯 UPDATED: Navigation item with multilingual support
            const NavigationButton = (
              <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start rounded-lg py-3 px-3 text-sm font-medium transition-all h-auto",
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
                
                {/* 🎯 UPDATED: Display name with multilingual indicators */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="truncate text-left">{displayName}</span>
                  {isMultilingual && (
                    <Globe className={cn(
                      "h-3 w-3 flex-shrink-0",
                      isActive ? "text-primary-foreground/70" : "text-green-500"
                    )} />
                  )}
                  {hasCustomName && !isMultilingual && originalName && (
                    <Type className={cn(
                      "h-3 w-3 flex-shrink-0",
                      isActive ? "text-primary-foreground/70" : "text-blue-500"
                    )} />
                  )}
                </div>
                
                {isActive && <ChevronRight className="ml-auto h-4 w-4 flex-shrink-0" />}
              </Button>
            )

            // 🎯 UPDATED: Enhanced tooltip with multilingual support
            if (hasCustomName && (originalName || isMultilingual)) {
              return (
                <TooltipProvider key={item.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {NavigationButton}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[280px]">
                      <div className="space-y-2">
                        <div className="font-semibold text-sm flex items-center gap-2">
                          {isMultilingual && <Globe className="h-3 w-3" />}
                          {displayName}
                        </div>
                        
                        {isMultilingual && item.multilingualNames && (
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground font-medium">
                              {safeTranslate("Dashboard_sideBar.allLanguages", "All Languages")}:
                            </div>
                            <div className="text-xs space-y-1">
                              <div className="flex items-center gap-2">
                                <span>🇺🇸</span>
                                <span className="font-medium">EN:</span>
                                <span>{item.multilingualNames.en}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>🇸🇦</span>
                                <span className="font-medium">AR:</span>
                                <span dir="rtl">{item.multilingualNames.ar}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>🇹🇷</span>
                                <span className="font-medium">TR:</span>
                                <span>{item.multilingualNames.tr}</span>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground pt-1 border-t">
                              {safeTranslate("Dashboard_sideBar.currentLanguage", "Current")}: {language.toUpperCase()}
                            </div>
                          </div>
                        )}
                        
                        {!isMultilingual && originalName && originalName !== displayName && (
                          <div className="text-xs text-muted-foreground">
                            {safeTranslate("Dashboard_sideBar.sectionType", "Section Type")}: {originalName}
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            }

            return NavigationButton
          })}
        </nav>
      </>
    )
  }

  // Mobile view
  if (isMobile) {
    return (
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={toggleSidebar}
            />

            {/* Mobile Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ 
                type: "spring", 
                damping: 30, 
                stiffness: 300,
                duration: 0.3
              }}
              className="fixed top-0 left-0 z-50 h-full w-[320px] max-w-[85vw] bg-background dark:bg-slate-900 shadow-2xl border-r dark:border-slate-700 flex flex-col"
            >
              {/* Mobile Header */}
              <div className="flex h-16 items-center justify-between border-b dark:border-slate-700 px-4 flex-shrink-0">
                <div className="flex items-center gap-2 font-semibold">
                  <Home className="h-6 w-6" />
                  <span>{safeTranslate("Dashboard_sideBar.menu", "Menu")}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleSidebar} 
                  className="ml-auto hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* Mobile User Info */}
              <div className="px-4 py-3 border-b dark:border-slate-700 flex-shrink-0">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                    <UserCircle className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">
                      {user?.name || user?.email || safeTranslate("Dashboard_sideBar.unknownUser", "Unknown user")}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {user?.role || safeTranslate("Dashboard_sideBar.unknownRole", "Unknown")}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="flex-1 overflow-y-auto px-3 py-2">
                {renderNavItems()}
              </div>

              {/* Mobile Footer */}
              <div className="p-3 border-t dark:border-slate-700 flex-shrink-0">
                <Link
                  href={`https://wa.me/905465234640`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary text-primary-foreground font-medium shadow-sm hover:bg-primary/90 transition-all text-sm"
                  onClick={() => {
                    if (isMobile && isSidebarOpen && toggleSidebar) {
                      toggleSidebar()
                    }
                  }}
                >
                  <LifeBuoy className="h-5 w-5" />
                  <span>{safeTranslate("Dashboard_sideBar.helpSupport", "Help & Support")}</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  // Desktop loading state
  if (isLoading || userIsLoading || (websiteId && isLoadingSections) || !isLoaded || !ready) {
    return (
      <div className="flex h-full flex-col border-r dark:border-slate-700 bg-background dark:bg-slate-900">
        <div className="flex h-16 items-center border-b dark:border-slate-700 px-6">
          <div className="flex items-center gap-2 font-semibold">
            <Home className="h-6 w-6" />
            <span>{safeTranslate("Dashboard_sideBar.title", "Admin Dashboard")}</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Desktop view
  return (
    <div className="flex h-full flex-col border-r dark:border-slate-700 bg-background dark:bg-slate-900 shadow-sm">
      {/* Desktop Header */}
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
          <span className="text-lg">{safeTranslate("Dashboard_sideBar.title", "Admin Dashboard")}</span>
        </button>
      </div>
      
      {/* Desktop Navigation */}
      <div className="flex-1 overflow-auto p-2">
        {renderNavItems()}
      </div>

      {/* Desktop Footer */}
      <div className="p-4 border-t dark:border-slate-700">
        <Link
          href={`https://wa.me/905465234640`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-all text-sm"
        >
          <LifeBuoy className="h-4 w-4" />
          <span>{safeTranslate("Dashboard_sideBar.helpSupport", "Help & Support")}</span>
        </Link>
      </div>
    </div>
  )
}