"use client"

import { Menu } from "lucide-react"
import { Button } from "../ui/button"
import { ThemeToggle } from "../theme-toggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useAuth } from "@/src/context/AuthContext"
import { useLanguage } from "@/src/context/LanguageContext"
import { useRouter } from "next/navigation"
import LanguageSelector from "./LanguageSelectorComponent"
import { useTranslation } from "react-i18next"
import useUsers from "@/src/hooks/users/use-users"
import { getInitials } from "@/src/utils/user-helpers"

/**
 * Props for the DashboardHeader component
 */
interface DashboardHeaderProps {
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

/**
 * Dashboard Header component
 * Contains the top navigation bar with search, notifications, and user menu
 */
export default function DashboardHeader({ isSidebarOpen, toggleSidebar }: DashboardHeaderProps) {
  const { logout } = useAuth()
  const { language, setLanguage, isLoaded } = useLanguage()
  const router = useRouter()
  const { t } = useTranslation()
  const { useGetCurrentUser } = useUsers()
  const { data: currentUserData, isLoading: isUserLoading } = useGetCurrentUser()
  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Call the logout function from our auth context
      await logout()
      // Trigger navigation event manually (if needed for your app)
      document.dispatchEvent(new Event("navigationstart"))
    } catch (err: any) {
      console.log(err)
    }
  }

  const handleProfileToggle = () => {
    router.push('/dashboard/profile')
  }

  // Language change handler
  const handleLanguageChange = (languageCode: string) => {
    setLanguage(languageCode as 'en' | 'ar' | 'tr')
  }

  // Safe translation function
  const safeTranslate = (key: string, fallback: string = "") => {
    try {
      return t && typeof t === 'function' ? t(key, fallback) : fallback
    } catch (error) {
      return fallback
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 shadow-sm">
      {/* Sidebar toggle button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleSidebar} 
        aria-label={safeTranslate("Dashboard_sideBar.menu", "Toggle Menu")}
        className="hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Spacer to push right content to the end */}
      <div className="flex-1" />

      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Language Selector - only show when context is loaded to prevent hydration mismatch */}
        {isLoaded && (
          <LanguageSelector 
            currentLanguage={language}
            onLanguageChange={handleLanguageChange}
          />
        )}
        
        {/* Theme toggle */}
        <ThemeToggle />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback>
                  {currentUserData?.data ? getInitials(currentUserData?.data) : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              {safeTranslate("common.myAccount", "My Account")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileToggle}>
              {safeTranslate("common.profile", "Profile")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              {safeTranslate("common.logout", "Log out")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}