"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/src/context/AuthContext"
import { useSections } from "@/src/hooks/webConfiguration/use-section"
import { Section } from "@/src/api/types/hooks/section.types"

// Define route permissions map
interface RoutePermission {
  roles?: string[]
  sectionId?: string
}

// Map routes to their required permissions
const routePermissions: Record<string, RoutePermission> = {
  "/dashboard": { roles: ["superAdmin", "owner"] }, // const 
  "/dashboard/users": { roles: ["superAdmin", "owner"] }, // const 
  "/dashboard/userDashboard": { roles: ["user", "admin", "superAdmin", "owner"] }, // const 
  "/dashboard/features": {},
  "/dashboard/hero": { sectionId: "hero" },
  "/dashboard/services": {},
  "/dashboard/blog": {},
  "/dashboard/case-studies": {},
  "/dashboard/clients": {},
  "/dashboard/contact": {},
  "/dashboard/cta": {},
  "/dashboard/faq": {},
  "/dashboard/industry-solutions": {},
  "/dashboard/news": {},
  "/dashboard/partners": {},
  "/dashboard/process": {},
  "/dashboard/projects": {},
  "/dashboard/team": {},
  "/dashboard/technology-stack": {},
  "/dashboard/testimonials": {},
  "/dashboard/addWebSiteConfiguration": { roles: ["superAdmin", "owner"] }, // const 
  "/dashboard/idigitekAdmin": { roles: ["idigitekAdmin"] }, // const 

}

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, isLoading: userIsLoading } = useAuth()
  
  const { 
    useGetAll: useGetAllSections
  } = useSections()

  const { 
    data: sections, 
    isLoading: isLoadingSections,
  } = useGetAllSections()

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!userIsLoading && !isAuthenticated) {
      router.push("/sign-in")
      return
    }

    // Don't check permissions while loading or on the login page
    if (userIsLoading || isLoadingSections || pathname === "/sign-in") {
      return
    }
    

    // Handle initial dashboard access based on role
    if (pathname === "/dashboard" && user?.role) {
      const userRole = user.role.toLowerCase()

        if (userRole === "idigitekadmin") {
        router.push("/dashboard/idigitekAdmin")
        return
      }

      // Redirect non-owner/non-superAdmin roles to user dashboard
      if (userRole === "admin" || userRole === "user") {
        router.push("/dashboard/userDashboard")
        return
      }
        
    
    }

    // Skip permission checks for routes not in the map
    if (!routePermissions[pathname]) {
      return
    }

    // Get active sections
    const activeSections = sections?.data?.data?.filter((section: Section) => section.isActive) || []
    const activeSectionIds = activeSections.map((section: Section) => 
      section.name.toLowerCase().replace(/\s/g, "")
    )

    const permission = routePermissions[pathname]
    
    // Check role-based access
    if (permission.roles && user?.role) {
      if (!permission.roles.includes(user.role)) {
        router.push("/dashboard/unauthorized")
        return
      }
    }

    // Check section-based access
    if (permission.sectionId) {
      if (!activeSectionIds.includes(permission.sectionId)) {
        router.push("/dashboard/unauthorized")
        return
      }
    }
  }, [pathname, user, isAuthenticated, userIsLoading, sections, isLoadingSections, router])

  return <>{children}</>
}