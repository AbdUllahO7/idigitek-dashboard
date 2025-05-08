import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import './globals.css'
import { ThemeProvider } from "../components/theme-provider" 
import { NavigationEvents } from "../components/navigation-events"
import { NavigationProgress } from "../components/navigation-progress"
import { AuthProvider } from "../context/AuthContext"
import QueryProvider from "../providers/QueryProvider"
import { Toaster } from "../components/ui/toaster"
import { WebsiteProvider } from "../providers/WebsiteContext"

// Load Inter font
const inter = Inter({ subsets: ["latin"] })

// Metadata for the application
export const metadata: Metadata = {
  title: "Dashboard",
  description: "Modern dashboard with Next.js, Tailwind CSS, and shadcn/ui",
  generator: 'v0.dev'
}

/**
 * Root layout component
 * Wraps the entire application
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <AuthProvider>
              <WebsiteProvider>
              {/* Navigation event handlers */}
              <NavigationEvents />
              <NavigationProgress />
              {children}
              </WebsiteProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}