"use client"

import { Bell, Menu, Search, User } from "lucide-react"

import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ThemeToggle } from "../theme-toggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useAuth } from "@/src/context/AuthContext"

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

      {/* Search input - hidden on mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative hidden md:flex"
      >
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-64 rounded-full bg-muted pl-8 focus-visible:ring-slate-400"
        />
      </motion.div>

      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>

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
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSubmit}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
