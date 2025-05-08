"use client"

import { useState, useEffect } from "react"
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
  Loader2
} from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "@/src/lib/utils"
import { useAuth } from "@/src/context/AuthContext"
import { useSections } from "@/src/hooks/webConfiguration/use-section"
import { Section } from "@/src/api/types"

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
    title: "Features",
    href: "/dashboard/features",
    icon: Package,
    sectionId: "features", // Show when "features" section is selected 
  },
  {
    title: "Hero",
    href: "/dashboard/hero",
    icon: Package,
    sectionId: "hero", // Show when "features" section is selected
  },
  {
    title: "Services",
    href: "/dashboard/services",
    icon: Package,
    sectionId: "services", // Show when "service" section is selected
  },
  {
    title: "Blog",
    href: "/dashboard/blog",
    icon: FileText,
    sectionId: "blog", // Show when "blog" section is selected
  },
  {
    title: "Case Studies",
    href: "/dashboard/case-studies",
    icon: Briefcase,
    sectionId: "caseStudiesSection", // Show when "caseStudiesSection" section is selected
  },
  {
    title: "Clients",
    href: "/dashboard/clients",
    icon: Building,
    sectionId: "clientsSection", // Show when "clientsSection" section is selected
  },
  {
    title: "Contact",
    href: "/dashboard/contact",
    icon: Contact,
    sectionId: "contact", // Show when "contactSection" section is selected

  },
  {
    title: "CTA",
    href: "/dashboard/cta",
    icon: Send,
    sectionId: "ctaSection", // Show when "ctaSection" section is selected
  },
  {
    title: "FAQ",
    href: "/dashboard/faq",
    icon: HelpCircle,
    sectionId: "faqSection", // Show when "faqSection" section is selected
  },
  {
    title: "Industry Solutions",
    href: "/dashboard/industry-solutions",
    icon: Building,
    sectionId: "idustrySolutionsSection", // Show when "idustrySolutionsSection" section is selected
  },
  {
    title: "News",
    href: "/dashboard/news",
    icon: Megaphone,
    sectionId: "newsSection", // Show when "newsSection" section is selected
  },
  {
    title: "Partners",
    href: "/dashboard/partners",
    icon: Handshake,
    sectionId: "partnerSection", // Show when "partnerSection" section is selected
  },
  {
    title: "Process",
    href: "/dashboard/process",
    icon: Workflow,
    sectionId: "ProcessSection", // Show when "ProcessSection" section is selected
  },
  {
    title: "Projects",
    href: "/dashboard/projects",
    icon: FolderKanban,
    sectionId: "projectsSection", // Show when "projectsSection" section is selected
  },
  {
    title: "Team",
    href: "/dashboard/team",
    icon: UserCircle,
    sectionId: "teamSection", // Show when "teamSection" section is selected 
  },
  {
    title: "Technology Stack",
    href: "/dashboard/technology-stack",
    icon: Server,
    sectionId: "technologyStackSection", // Show when "technologyStackSection" section is selected
  },
  {
    title: "Testimonials",
    href: "/dashboard/testimonials",
    icon: MessageSquare,
    sectionId: "testimonialsSection", // Show when "testimonialsSection" section is selected
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
    href: "/dashboard/addWebSiteConfiguration", // const 
    icon: Settings,
    roles: ['superAdmin' , 'owner'], // Only superAdmin can see this
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
  const { user, isLoading: userIsLoading } = useAuth();
  
  // Store the mapping of section names to actual section IDs from API
  const [sectionIdMapping, setSectionIdMapping] = useState<Map<string, string>>(new Map());

  const { 
    useGetAll: useGetAllSections
  } = useSections();


  const { 
    data: sections, 
    isLoading: isLoadingSections,
    error: sectionsError
  } = useGetAllSections();

  // Extract active sections from the API response
  const activeSections = sections?.data?.filter((section: Section) => section.isActive) || [];
  
  useEffect(() => {
    // Map section IDs to their names from the active sections
    const sectionNameMap = new Map<string, string>();
    const idMapping = new Map<string, string>();
    
    if (activeSections.length > 0) {
      activeSections.forEach((section: Section) => {
        const sectionId = section.name.toLowerCase().replace(/\s/g, "");
        sectionNameMap.set(sectionId, section.name);
        // Store the actual database ID for each section
        idMapping.set(sectionId, section._id);
      });
      
      // Save the ID mapping for use in navigation
      setSectionIdMapping(idMapping);
    }
    
    if (!userIsLoading && !isLoadingSections) {
      try {
        // Get active section IDs from the API data
        const activeSectionIds = activeSections.map((section: Section) => 
          section.name.toLowerCase().replace(/\s/g, "")
        );
        
        // Store active section IDs in localStorage for persistence
        localStorage.setItem("selectedSections", JSON.stringify(activeSectionIds));
        
        // Filter nav items based on active sections and user roles
        const filteredNavItems = allNavItems.map(item => {
          // Create a copy of the item to modify
          const newItem = { ...item };
          
          // If this is a section-based item, update its title from the API data
          if (item.sectionId && sectionNameMap.has(item.sectionId)) {
            newItem.title = sectionNameMap.get(item.sectionId) || item.title;
          }
          
          return newItem;
        }).filter((item) => {
          // Check if the item has role restrictions
          if (item.roles && user?.role) {
            // If item has role restrictions, user must have one of those roles
            if (!item.roles.includes(user.role)) {
              return false;
            }
          }

          // Include items that don't have a sectionId (always shown)
          // Or items whose sectionId is in the active sections
          return !item.sectionId || activeSectionIds.includes(item.sectionId);
        });

        setNavItems(filteredNavItems);
      } catch (error) {
        console.error("Error processing sections:", error);
        // In case of error, show only the items without sectionId and respect role restrictions
        setNavItems(allNavItems.filter((item) => {
          // Check role restrictions
          if (item.roles && user?.role) {
            if (!item.roles.includes(user.role)) {
              return false;
            }
          }
          return !item.sectionId;
        }));
      } finally {
        setIsLoading(false);
      }
    }
  }, [user, userIsLoading, sections, isLoadingSections]);

  /**
   * Handle navigation with loading indicator and section ID parameter
   */
  const handleNavigation = (href: string, sectionId?: string) => {
    // Don't navigate if already navigating or if clicking the current page
    if (navigatingTo || pathname === href) {
      return;
    }
    
    // Set the navigating state to show loading indicator
    setNavigatingTo(href);
    
    // If this navigation item is for a section that has an ID in our mapping, append it as a query param
    let targetUrl = href;
    if (sectionId && sectionIdMapping.has(sectionId)) {
      const actualSectionId = sectionIdMapping.get(sectionId);
      targetUrl = `${href}?sectionId=${actualSectionId}`;
    }
    
    // Prefetch the page before navigating
    router.prefetch(targetUrl);
    
    // Navigate to the new page with section ID if available
    router.push(targetUrl);
    
    // Clear the navigating state after navigation completes
    setTimeout(() => {
      setNavigatingTo(null);
    }, 500);
  }

  // Show loading state while fetching sections or user
  if (isLoading || userIsLoading || isLoadingSections) {
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

  return (
    <div className="flex h-full flex-col border-r dark:border-slate-700 bg-background dark:bg-slate-900">
      {/* Sidebar header */}
      <div className="flex h-16 items-center border-b dark:border-slate-700 px-6">
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
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-auto py-6">
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