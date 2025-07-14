"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
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
  Copy, // NEW: Add Copy icon
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
 * Navigation item interface - UPDATED to handle duplicates
 */
interface NavItem {
  titleKey: string
  href: string
  icon: React.ElementType
  sectionId?: string
  actualSectionId?: string // NEW: Actual section ID from database
  roles?: string[]
  customName?: string
  originalName?: string
  isMultilingual?: boolean
  multilingualNames?: { en: string; ar: string; tr: string }
  
  // NEW: Duplicate information
  isDuplicate?: boolean
  duplicateIndex?: number
  originalSectionId?: string
  duplicateOf?: string
  sectionType?: string // The base section type (e.g., "partners", "services")
}

/**
 * Section order interface
 */
interface SectionOrder {
  name: string
  order: number
  id: string
  isDuplicate?: boolean // NEW
  duplicateIndex?: number // NEW
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
    sectionType: "services", // NEW
  },

  {
    titleKey: "Dashboard_sideBar.nav.news",
    href: "/dashboard/News",
    icon: Megaphone,
    sectionId: "news",
    sectionType: "news", // NEW
  },
  {
    titleKey: "Dashboard_sideBar.nav.products",
    href: "/dashboard/products",
    icon: Megaphone,
    sectionId: "products",
    sectionType: "products", // NEW
  },
  {
    titleKey: "Dashboard_sideBar.nav.industrySolutions",
    href: "/dashboard/IndustrySolutions",
    icon: Building,
    sectionId: "industrysolutions",
    sectionType: "industrysolutions", // NEW
  },
  {
    titleKey: "Dashboard_sideBar.nav.whyChooseUs",
    href: "/dashboard/WhyChooseUs",
    icon: Briefcase,
    sectionId: "whychooseus",
    sectionType: "whychooseus", // NEW
  },
  {
    titleKey: "Dashboard_sideBar.nav.projects",
    href: "/dashboard/projects",
    icon: Handshake,
    sectionId: "projects",
    sectionType: "projects", // NEW
  },
  {
    titleKey: "Dashboard_sideBar.nav.ourProcess",
    href: "/dashboard/ourProcess",
    icon: HelpCircle,
    sectionId: "ourprocess",
    sectionType: "ourprocess", // NEW
  },
  {
    titleKey: "Dashboard_sideBar.nav.team",
    href: "/dashboard/team",
    icon: Component,
    sectionId: "team",
    sectionType: "team", // NEW
  },
  {
    titleKey: "Dashboard_sideBar.nav.clientComments",
    href: "/dashboard/clientComments",
    icon: MessageCircle,
    sectionId: "clientcomments",
    sectionType: "clientcomments", // NEW
  },
  {
    titleKey: "Dashboard_sideBar.nav.partners",
    href: "/dashboard/partners",
    icon: HeartHandshake,
    sectionId: "partners",
    sectionType: "partners", // NEW
  },
  {
    titleKey: "Dashboard_sideBar.nav.faq",
    href: "/dashboard/FAQ",
    icon: ShieldQuestion,
    sectionId: "faq",
    sectionType: "faq", // NEW
  },
  {
    titleKey: "Dashboard_sideBar.nav.blog",
    href: "/dashboard/blog",
    icon: PenBoxIcon,
    sectionId: "blog",
    sectionType: "blog", // NEW
  },
  {
    titleKey: "Dashboard_sideBar.nav.contact",
    href: "/dashboard/contact",
    icon: Contact,
    sectionId: "contact",
    sectionType: "contact", // NEW
  },
  {
    titleKey: "Dashboard_sideBar.nav.hero",
    href: "/dashboard/heroSection",
    icon: TouchpadOff,
    sectionId: "hero",
    sectionType: "hero", // NEW
  },
  {
    titleKey: "Dashboard_sideBar.nav.footer",
    href: "/dashboard/footer",
    icon: TouchpadOff,
    sectionId: "footer",
    sectionType: "footer", // NEW
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
  const { isLoaded, language } = useLanguage()
  const searchParams = useSearchParams()

  const isMobile = useMediaQuery("(max-width: 1024px)")

  // Store the mapping of section IDs to actual section data
  const [sectionDataMapping, setSectionDataMapping] = useState<Map<string, Section>>(new Map())
  const [sectionOrderMapping, setSectionOrderMapping] = useState<Map<string, SectionOrder>>(new Map())

  const processedWebsiteRef = useRef<string | null>(null)
  const processedUserRef = useRef<string | null>(null)

  const { useGetByWebsiteId } = useSections()

  const {
    data: websiteSections,
    isLoading: isLoadingSections,
    error: sectionsError,
    isError,
    refetch: refetchWebsiteSections,
    dataUpdatedAt,
  } = useGetByWebsiteId(websiteId || "", false, !!websiteId)

  // NEW: Function to get section type from subName
  const getSectionType = (section: Section): string => {
    if (section.subName) {
      // Handle duplicates - extract base type
      if (section.subName.includes('-duplicate-')) {
        return section.subName.split('-duplicate-')[0].toLowerCase()
      }
      return section.subName.toLowerCase()
    }
    
    if (typeof section.name === 'object' && section.name.en) {
      return section.name.en.toLowerCase().replace(/\s/g, "")
    }
    
    if (typeof section.name === 'string') {
      return section.name.toLowerCase().replace(/\s/g, "")
    }
    
    return 'unknown'
  }

  // NEW: Function to create unique identifier for sections (including duplicates)
  const createUniqueIdentifier = (section: Section): string => {
    if (section._id) {
      return section._id // Use actual ID as unique identifier
    }
    
    // Fallback for sections without ID
    const baseType = getSectionType(section)
    const duplicateInfo = section.isDuplicate ? `-duplicate-${section.duplicateIndex}` : ''
    return `${baseType}${duplicateInfo}`
  }

  // Updated function to get section display name
  const getSectionDisplayName = (section: Section) => {
    if (typeof section.name === 'object') {
      if (section.name[language as keyof typeof section.name]) {
        return section.name[language as keyof typeof section.name]
      }
      if (section.name.en) {
        return section.name.en
      }
    }
    
    if (typeof section.name === 'string' && section.name.trim()) {
      return section.name.trim()
    }
    
    if (section.subName) {
      const predefinedSection = PREDEFINED_SECTIONS.find(ps => ps.subName === getSectionType(section))
      if (predefinedSection && ready) {
        const baseName = t(predefinedSection.nameKey, predefinedSection.nameKey.split('.').pop() || '')
        // Add duplicate indicator if it's a duplicate
        if (section.isDuplicate) {
          return `${baseName} (${t('navigation.copy', 'Copy')} ${section.duplicateIndex})`
        }
        return baseName
      }
    }
    
    return section.subName || 'Unknown Section'
  }

  // Updated function to get original section name
  const getOriginalSectionName = (section: Section) => {
    const baseType = getSectionType(section)
    const predefinedSection = PREDEFINED_SECTIONS.find(ps => ps.subName.toLowerCase() === baseType)
    if (predefinedSection && ready) {
      return t(predefinedSection.nameKey, predefinedSection.nameKey.split('.').pop() || '')
    }
    return null
  }

  // Function to check if section has multilingual names
  const hasMultilingualNames = (section: Section) => {
    return typeof section.name === 'object' && section.name.en && section.name.ar && section.name.tr
  }

  // Manual refresh function
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

  // Listen for URL changes
  useEffect(() => {
    if (pathname.includes("/addWebSiteConfiguration")) {
      const needsRefresh = true
      sessionStorage.setItem("needsSectionRefresh", String(needsRefresh))
    } else if (sessionStorage.getItem("needsSectionRefresh") === "true") {
      sessionStorage.removeItem("needsSectionRefresh")
      handleManualRefresh()
    }
  }, [pathname, handleManualRefresh])

  // NEW: Updated filter function to handle both original and duplicate sections
  const filterNavItems = (
    userRole: string | undefined,
    activeSections: Section[],
  ) => {
    try {
      // Create mapping of sections by their unique identifiers
      const sectionDataMap = new Map<string, Section>()
      const sectionOrderMap = new Map<string, SectionOrder>()
      
      activeSections.forEach((section: Section) => {
        const uniqueId = createUniqueIdentifier(section)
        sectionDataMap.set(uniqueId, section)
        
        if (section._id) {
          sectionOrderMap.set(uniqueId, {
            name: getSectionDisplayName(section),
            order: section.order ?? 0,
            id: section._id,
            isDuplicate: section.isDuplicate,
            duplicateIndex: section.duplicateIndex,
          })
        }
      })

      // Store mappings for navigation
      setSectionDataMapping(sectionDataMap)
      setSectionOrderMapping(sectionOrderMap)

      // Filter base nav items (non-section items)
      const baseNavItems = allNavItems.filter((item) => {
        if (item.roles && userRole) {
          if (!item.roles.includes(userRole)) {
            return false
          }
        }
        return !item.sectionId
      })

      // NEW: Create nav items for ALL active sections (originals + duplicates)
      const sectionNavItems: NavItem[] = []
      
      activeSections.forEach((section: Section) => {
        const sectionType = getSectionType(section)
        
        // Find matching nav item template
        const navTemplate = allNavItems.find(item => item.sectionType === sectionType)
        if (!navTemplate) return
        
        // Create unique nav item for this section
        const uniqueId = createUniqueIdentifier(section)
        const customName = getSectionDisplayName(section)
        const originalName = getOriginalSectionName(section)
        
        const navItem: NavItem = {
          ...navTemplate,
          // Create unique href by appending section ID
          href: `${navTemplate.href}?sectionId=${section._id}`,
          sectionId: uniqueId, // Use unique identifier
          actualSectionId: section._id, // Store actual section ID
          customName: customName,
          originalName: originalName,
          isMultilingual: hasMultilingualNames(section),
          multilingualNames: hasMultilingualNames(section) ? section.name : undefined,
          
          // NEW: Duplicate information
          isDuplicate: section.isDuplicate || false,
          duplicateIndex: section.duplicateIndex,
          originalSectionId: section.originalSectionId,
          duplicateOf: section.duplicateOf,
          sectionType: sectionType,
        }
        
        sectionNavItems.push(navItem)
      })

      // Sort section nav items by order, with duplicates after their originals
      sectionNavItems.sort((a, b) => {
        const orderA = sectionOrderMap.get(a.sectionId!)?.order ?? Number.POSITIVE_INFINITY
        const orderB = sectionOrderMap.get(b.sectionId!)?.order ?? Number.POSITIVE_INFINITY
        
        // If same order, sort by duplicate status (original first)
        if (orderA === orderB) {
          if (a.isDuplicate && !b.isDuplicate) return 1
          if (!a.isDuplicate && b.isDuplicate) return -1
          if (a.isDuplicate && b.isDuplicate) {
            return (a.duplicateIndex || 0) - (b.duplicateIndex || 0)
          }
        }
        
        return orderA - orderB
      })

      return [...baseNavItems, ...sectionNavItems]
    } catch (error) {
      console.error("Error filtering nav items:", error)
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

  // Process sections effect
  useEffect(() => {
    if (userIsLoading || (websiteId && isLoadingSections) || isRefreshing) {
      return
    }

    const currentUserId = user?.id || user?.id
    const currentTimestamp = dataUpdatedAt || 0
    
    if (
      websiteId === processedWebsiteRef.current &&
      currentUserId === processedUserRef.current &&
      lastRefreshTime?.getTime() === currentTimestamp
    ) {
      return
    }

    if (websiteSections?.data?.length > 0) {
      const activeSections = websiteSections.data.filter((section: Section) => section.isActive)
      
      // Store active section IDs in localStorage
      const storageKey = currentUserId ? `selectedSections_${currentUserId}` : "selectedSections"
      const activeSectionIds = activeSections.map((section: Section) => createUniqueIdentifier(section))
      localStorage.setItem(storageKey, JSON.stringify(activeSectionIds))
    }

    // Filter nav items with new logic
    const filteredItems = filterNavItems(
      user?.role,
      websiteSections?.data?.filter((section: Section) => section.isActive) || [],
    )
    setNavItems(filteredItems)
    setIsLoading(false)

    processedWebsiteRef.current = websiteId
    processedUserRef.current = currentUserId as string
    setLastRefreshTime(new Date(currentTimestamp))
  }, [user, userIsLoading, websiteId, isLoadingSections, websiteSections, dataUpdatedAt, isRefreshing, lastRefreshTime])

  // Updated navigation handler
  const handleNavigation = useCallback((href: string, actualSectionId?: string) => {
    if (navigatingTo || pathname === href) {
      return
    }

    if (isMobile && isSidebarOpen && toggleSidebar) {
      toggleSidebar()
    }

    setNavigatingTo(href)

    // Use the href as-is since it already contains the section ID
    router.push(href)

    setTimeout(() => {
      setNavigatingTo(null)
    }, 500)
  }, [navigatingTo, pathname, isMobile, isSidebarOpen, toggleSidebar, router])

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

  // Function to get display name for navigation item
  const getDisplayName = (item: NavItem) => {
    if (item.customName) {
      return item.customName
    }
    return safeTranslate(item.titleKey, item.titleKey.split(".").pop() || "")
  }

  // Render navigation items
  const renderNavItems = () => {
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

        <nav className="space-y-1">
        {navItems.map((item, index) => {
          // FIXED: Improved active state detection
          let isActive = false;
          
          if (item.href === "/dashboard") {
            // Dashboard should only be active on exact match
            isActive = pathname === "/dashboard";
          } else if (item.sectionId && item.actualSectionId) {
            // For section items, check both the base path and the sectionId parameter
            const basePath = item.href.split('?')[0];
            const currentSectionId = searchParams.get('sectionId');
            
            isActive = pathname === basePath && currentSectionId === item.actualSectionId;
          } else {
            // For other items, check exact match or if it's a direct sub-path
            const basePath = item.href.split('?')[0];
            if (pathname === item.href) {
              isActive = true;
            } else if (pathname.startsWith(basePath + '/')) {
              // Only active if it's a direct sub-path (not just contains the path)
              isActive = true;
            }
          }

          const isNavigating = navigatingTo === item.href;
          const displayName = getDisplayName(item);
          const hasCustomName = !!item.customName;
          const originalName = item.originalName;
          const isMultilingual = item.isMultilingual;
          const isDuplicate = item.isDuplicate;

          // Rest of your existing code remains the same...
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
                isDuplicate && "border-l-4 border-orange-400 dark:border-orange-500",
              )}
              onClick={() => handleNavigation(item.href, item.actualSectionId)}
              disabled={isNavigating}
            >
              {/* Rest of your button content remains the same */}
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
              
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="truncate text-left">{displayName}</span>
                
                {isDuplicate && (
                  <Copy className={cn(
                    "h-3 w-3 flex-shrink-0",
                    isActive ? "text-primary-foreground/70" : "text-orange-500"
                  )} />
                )}
                
                {isMultilingual && (
                  <Globe className={cn(
                    "h-3 w-3 flex-shrink-0",
                    isActive ? "text-primary-foreground/70" : "text-green-500"
                  )} />
                )}
                
                {hasCustomName && !isMultilingual && !isDuplicate && originalName && (
                  <Type className={cn(
                    "h-3 w-3 flex-shrink-0",
                    isActive ? "text-primary-foreground/70" : "text-blue-500"
                  )} />
                )}
              </div>
              
              {isActive && <ChevronRight className="ml-auto h-4 w-4 flex-shrink-0" />}
            </Button>
          );

          // Rest of your tooltip and return logic remains the same...
          if (hasCustomName && (originalName || isMultilingual || isDuplicate)) {
            return (
              <TooltipProvider key={item.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {NavigationButton}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[320px]">
                    {/* Your existing tooltip content */}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }

          return NavigationButton;
        })}
      </nav>
      </>
    )
  }

  // Rest of the component remains the same (mobile/desktop views)
  if (isMobile) {
    return (
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={toggleSidebar}
            />

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

              <div className="flex-1 overflow-y-auto px-3 py-2">
                {renderNavItems()}
              </div>

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

  return (
    <div className="flex h-full flex-col border-r dark:border-slate-700 bg-background dark:bg-slate-900 shadow-sm">
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
      
      <div className="flex-1 overflow-auto p-2">
        {renderNavItems()}
      </div>

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