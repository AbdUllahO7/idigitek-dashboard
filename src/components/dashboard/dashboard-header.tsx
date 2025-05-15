"use client"

import { Bell, Menu, Search, User } from "lucide-react"

import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ThemeToggle } from "../theme-toggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useAuth } from "@/src/context/AuthContext"
import { useRouter } from "next/navigation"

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
    const { logout  } = useAuth();
    const router = useRouter()
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
          // Call the login function from our auth context
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
  
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 shadow-sm">
      {/* Mobile sidebar toggle */}
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden" aria-label="Toggle Menu">
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop sidebar toggle */}
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden lg:flex" aria-label="Toggle Menu">
        <Menu className="h-5 w-5" />
      </Button>

  

      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Theme toggle */}
        <ThemeToggle />


        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileToggle}>
              <User className="mr-2 h-4 w-4" />
                Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSubmit}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
