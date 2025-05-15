"use client"

import { useState, useEffect } from "react"
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  FileText,
  Globe,
  Layers,
  UserCircle,
  BarChart3,
  TrendingUp,
  Sparkles,
  Settings,
  Users,
  Zap,
  LayoutDashboard,
} from "lucide-react"
import { CardLoader } from "@/src/components/ui/loader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useSections } from "@/src/hooks/webConfiguration/use-section"
import { useLanguages } from "@/src/hooks/webConfiguration/use-language"
import type { Language } from "@/src/api/types/hooks/language.types"
import type { Section } from "@/src/api/types/hooks/section.types"
import { useWebSite } from "@/src/hooks/webConfiguration/use-WebSite"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-3 rounded-lg border shadow-lg">
        <p className="text-xs font-medium">{`${label || payload[0].name} : ${payload[0].value}`}</p>
      </div>
    )
  }
  return null
}

/**
 * Dashboard overview page
 * Shows key metrics and data visualizations with ultra-modern UI and 3D effects
 */
export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const { websiteId } = useWebsiteContext()
  const router = useRouter()

  // Get website data
  const { useGetMyWebsites, useGetWebsiteUsers } = useWebSite()

  // Get user's websites
  const { data: websites, isLoading: isLoadingWebsites } = useGetMyWebsites()

  // Get users for the current website
  const { data: websiteUsers, isLoading: isLoadingWebsiteUsers } = useGetWebsiteUsers(websiteId)

  // Get data from API hooks
  const { useGetByWebsiteId: useGetAllSections } = useSections()
  const { useGetByWebsite: useGetWebsiteLanguages } = useLanguages()

  const { data: sections, isLoading: isLoadingSections } = useGetAllSections(websiteId)
  const { data: languages, isLoading: isLoadingLanguages } = useGetWebsiteLanguages(websiteId)

  // Extract active sections and languages from the API response
  const sectionsData = sections?.data || []
  const languagesData = languages?.data || []
  const activeSections = sectionsData.filter((section: Section) => section.isActive) || []
  const activeLanguages = languagesData.filter((lang: Language) => lang.isActive) || []

  // Get user role counts
  const usersData = websiteUsers || []

  const userRoleCounts = usersData.reduce((acc: Record<string, number>, user: any) => {
    const role = user.role || "user"
    acc[role] = (acc[role] || 0) + 1
    return acc
  }, {})

  // Create user role chart data
  const userRoleChartData = Object.entries(userRoleCounts).map(([name, value]) => ({
    name,
    value,
  }))

  // Create data for sections visualization
  const sectionChartData = [
    { name: "", value: activeSections.length },
    { name: "", value: sectionsData.length - activeSections.length },
  ]

  // Create data for languages visualization
  const languageChartData = [
    { name: "", value: activeLanguages.length },
    { name: "", value: languagesData.length - activeLanguages.length },
  ]

  // Activity data for area chart
  const activityData = [
    { name: "Mon", value: 20 },
    { name: "Tue", value: 35 },
    { name: "Wed", value: 25 },
    { name: "Thu", value: 40 },
    { name: "Fri", value: 30 },
    { name: "Sat", value: 15 },
    { name: "Sun", value: 10 },
  ]

  // Colors for charts - using a more cohesive color palette
  const COLORS = ["#06b6d4", "#8b5cf6", "#ec4899", "#f97316", "#10b981"]
  const ROLE_COLORS = {
    owner: "#f43f5e",
    superAdmin: "#ec4899",
    admin: "#8b5cf6",
    user: "#06b6d4",
  }

  // Set loading state based on API data loading
  useEffect(() => {
    if (!isLoadingSections && !isLoadingLanguages && !isLoadingWebsiteUsers && !isLoadingWebsites) {
      const timer = setTimeout(() => {
        setLoading(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isLoadingSections, isLoadingLanguages, isLoadingWebsiteUsers, isLoadingWebsites])

  // Check if website is selected
  const noWebsiteSelected = !websiteId || websiteId === ""

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6 rounded-xl">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30 }}
        className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/20 mb-8"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-cyan-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground mt-2">Monitor your website configuration and analytics</p>
        </div>
        
      </motion.div>

      {/* Website selection notice */}
      {noWebsiteSelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 500, damping: 30 }}
        >
          <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40 border-yellow-200 dark:border-yellow-900/50 overflow-hidden shadow-xl">
            <CardContent className="py-8">
              <div className="flex items-center gap-4 text-yellow-800 dark:text-yellow-200">
                <div className="rounded-xl bg-yellow-100 dark:bg-yellow-900/50 p-3 text-yellow-600 dark:text-yellow-300 shadow-lg">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-lg">No Website Selected</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Please select a website to view its dashboard data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Metric cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8"
      >
        {loading || noWebsiteSelected ? (
          <>
            <CardLoader />
            <CardLoader />
            <CardLoader />
            <CardLoader />
          </>
        ) : (
          <>
            {/* Total Sections card */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-700/20 hover:shadow-2xl transition-all duration-500 hover:translate-y-[-5px] group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
                  <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 p-2.5 text-white shadow-lg group-hover:shadow-cyan-500/20 dark:group-hover:shadow-purple-500/20 transition-all duration-500 group-hover:scale-110">
                    <Layers className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                    {sectionsData.length}
                  </div>
                  <p className="flex items-center text-xs text-cyan-600 dark:text-cyan-400 font-medium mt-1">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    {Math.round((activeSections.length / Math.max(sectionsData.length, 1)) * 100)}% active
                  </p>
                </CardContent>
                <div className="h-16 bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-cyan-950/20 dark:to-purple-950/20">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sectionChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSections" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSections)"
                      />
                      <Tooltip content={<CustomTooltip />} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            {/* Active Sections card */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-700/20 hover:shadow-2xl transition-all duration-500 hover:translate-y-[-5px] group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Sections</CardTitle>
                  <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-2.5 text-white shadow-lg group-hover:shadow-purple-500/20 dark:group-hover:shadow-pink-500/20 transition-all duration-500 group-hover:scale-110">
                    <FileText className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {activeSections.length}
                  </div>
                  <p className="flex items-center text-xs text-muted-foreground mt-1">
                    <span className="text-gray-500 dark:text-gray-400">
                      {sectionsData.length - activeSections.length} inactive
                    </span>
                  </p>
                </CardContent>
                <div className="h-16 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sectionChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Tooltip content={<CustomTooltip />} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            {/* Total Languages card */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-700/20 hover:shadow-2xl transition-all duration-500 hover:translate-y-[-5px] group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Languages</CardTitle>
                  <div className="rounded-xl bg-gradient-to-br from-pink-500 to-orange-600 p-2.5 text-white shadow-lg group-hover:shadow-pink-500/20 dark:group-hover:shadow-orange-500/20 transition-all duration-500 group-hover:scale-110">
                    <Globe className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                    {languagesData.length}
                  </div>
                  <p className="flex items-center text-xs text-pink-600 dark:text-pink-400 font-medium mt-1">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    {Math.round((activeLanguages.length / Math.max(languagesData.length, 1)) * 100)}% active
                  </p>
                </CardContent>
                <div className="h-16 bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-950/20 dark:to-orange-950/20">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={languageChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Line type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={2} dot={false} />
                      <Tooltip content={<CustomTooltip />} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            {/* Active Languages card */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-700/20 hover:shadow-2xl transition-all duration-500 hover:translate-y-[-5px] group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Languages</CardTitle>
                  <div className="rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 p-2.5 text-white shadow-lg group-hover:shadow-orange-500/20 dark:group-hover:shadow-amber-500/20 transition-all duration-500 group-hover:scale-110">
                    <Activity className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    {activeLanguages.length}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activeLanguages.length > 3 && (
                      <div className="bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 px-2 py-1 rounded-md text-xs font-medium">
                        +{activeLanguages.length - 3} more
                      </div>
                    )}
                  </div>
                  <p className="mt-1 flex items-center text-xs text-muted-foreground">
                    <span className="text-gray-500 dark:text-gray-400">
                      {languagesData.length - activeLanguages.length} inactive
                    </span>
                  </p>
                </CardContent>
                <div className="h-16 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={languageChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
                      <Tooltip content={<CustomTooltip />} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Add Website Users card in a separate row */}
      {!loading && !noWebsiteSelected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 300, damping: 30 }}
          className="mb-8"
        >
          <Card className="overflow-hidden bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-700/20 hover:shadow-2xl transition-all duration-500 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-500" />
                  Website Users
                </CardTitle>
                <CardDescription>User role distribution</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300"
                onClick={() => {
                  router.push("dashboard/users")
                }}
              >
                Manage Users <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    {usersData.length}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {Object.entries(userRoleCounts).map(([role, count]) => (
                      <div
                        key={role}
                        className={`text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg flex items-center gap-1.5 ${
                          role === "superAdmin"
                            ? "bg-gradient-to-r from-pink-500 to-pink-600"
                            : role === "owner"
                              ? "bg-gradient-to-r from-rose-500 to-rose-600"
                              : role === "admin"
                                ? "bg-gradient-to-r from-purple-500 to-purple-600"
                                : "bg-gradient-to-r from-cyan-500 to-cyan-600"
                        }`}
                      >
                        <UserCircle className="h-3.5 w-3.5" />
                        <span className="capitalize">{`${role}: ${count}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-40 w-full md:w-64 mt-4 md:mt-0 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-24 w-24 rounded-full bg-purple-500/10 animate-pulse"></div>
                    <div className="absolute h-32 w-32 rounded-full border-4 border-purple-400/20 animate-spin duration-[15s]"></div>
                    <div className="absolute h-40 w-40 rounded-full border-2 border-dashed border-cyan-400/30 animate-spin duration-[20s] animate-reverse"></div>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userRoleChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {userRoleChartData.map((entry) => (
                          <Cell
                            key={`cell-${entry.name}`}
                            fill={ROLE_COLORS[entry.name as keyof typeof ROLE_COLORS] || "#06b6d4"}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center p-4 border-t border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-purple-600 dark:text-purple-400">Last updated:</span>{" "}
                {new Date().toLocaleDateString()}
              </div>
              <div className="flex items-center text-xs text-purple-600 dark:text-purple-400">
                <Zap className="h-3.5 w-3.5 mr-1" />
                Real-time data
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {/* Charts section */}
      {!loading && !noWebsiteSelected && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8"
        >
          {/* Section Distribution Chart */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-700/20 hover:shadow-2xl transition-all duration-500 h-full">
              <CardHeader className="bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-cyan-950/20 dark:to-purple-950/20 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="flex items-center text-lg">
                  <div className="bg-gradient-to-r from-cyan-500 to-purple-600 p-2 rounded-lg shadow-lg mr-3">
                    <Layers className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                    Section Distribution
                  </span>
                </CardTitle>
                <CardDescription>Active vs. Inactive Sections</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[280px] w-full relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-32 w-32 rounded-full bg-cyan-500/10 animate-pulse"></div>
                    <div className="absolute h-40 w-40 rounded-full border-4 border-cyan-400/20 animate-spin duration-[15s]"></div>
                    <div className="absolute h-48 w-48 rounded-full border-2 border-dashed border-purple-400/30 animate-spin duration-[20s] animate-reverse"></div>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectionChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => ` ${(percent * 100).toFixed(0)}%`}
                      >
                        {sectionChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center p-4 border-t border-slate-100 dark:border-slate-800 bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-cyan-950/20 dark:to-purple-950/20">
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-cyan-600 dark:text-cyan-400">Total:</span> {sectionsData.length}{" "}
                  sections
                </div>
                <div className="flex items-center text-xs text-purple-600 dark:text-purple-400">
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                  {activeSections.length} active
                </div>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Language Distribution Chart */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-700/20 hover:shadow-2xl transition-all duration-500 h-full">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-950/20 dark:to-orange-950/20 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="flex items-center text-lg">
                  <div className="bg-gradient-to-r from-pink-500 to-orange-600 p-2 rounded-lg shadow-lg mr-3">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                    Language Distribution
                  </span>
                </CardTitle>
                <CardDescription>Active vs. Inactive Languages</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[280px] w-full relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-32 w-32 rounded-full bg-pink-500/10 animate-pulse"></div>
                    <div className="absolute h-40 w-40 rounded-full border-4 border-pink-400/20 animate-spin duration-[15s]"></div>
                    <div className="absolute h-48 w-48 rounded-full border-2 border-dashed border-orange-400/30 animate-spin duration-[20s] animate-reverse"></div>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={languageChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {languageChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center p-4 border-t border-slate-100 dark:border-slate-800 bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-950/20 dark:to-orange-950/20">
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-pink-600 dark:text-pink-400">Total:</span> {languagesData.length}{" "}
                  languages
                </div>
                <div className="flex items-center text-xs text-orange-600 dark:text-orange-400">
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                  {activeLanguages.length} active
                </div>
              </CardFooter>
            </Card>
          </motion.div>

          {/* User Role Distribution Chart */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-700/20 hover:shadow-2xl transition-all duration-500 h-full">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-purple-950/20 dark:to-cyan-950/20 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="flex items-center text-lg">
                  <div className="bg-gradient-to-r from-purple-500 to-cyan-600 p-2 rounded-lg shadow-lg mr-3">
                    <UserCircle className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                    User Role Distribution
                  </span>
                </CardTitle>
                <CardDescription>Website User Types</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[280px] w-full relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-32 w-32 rounded-full bg-purple-500/10 animate-pulse"></div>
                    <div className="absolute h-40 w-40 rounded-full border-4 border-purple-400/20 animate-spin duration-[15s]"></div>
                    <div className="absolute h-48 w-48 rounded-full border-2 border-dashed border-cyan-400/30 animate-spin duration-[20s] animate-reverse"></div>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userRoleChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {userRoleChartData.map((entry) => (
                          <Cell
                            key={`cell-${entry.name}`}
                            fill={ROLE_COLORS[entry.name as keyof typeof ROLE_COLORS] || "#06b6d4"}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center p-4 border-t border-slate-100 dark:border-slate-800 bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-purple-950/20 dark:to-cyan-950/20">
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-purple-600 dark:text-purple-400">Total:</span> {usersData.length}{" "}
                  users
                </div>
                <div className="flex items-center text-xs text-cyan-600 dark:text-cyan-400">
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                  {Object.keys(userRoleCounts).length} roles
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Activity Overview */}
      {!loading && !noWebsiteSelected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, type: "spring", stiffness: 300, damping: 30 }}
        >
          <Card className="overflow-hidden bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-700/20 hover:shadow-2xl transition-all duration-500">
            <CardHeader className="bg-gradient-to-r from-cyan-50 via-purple-50 to-pink-50 dark:from-cyan-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="flex items-center text-lg">
                <div className="bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 p-2 rounded-lg shadow-lg mr-3">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Activity Overview
                </span>
              </CardTitle>
              <CardDescription>Weekly content activity</CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-[300px]">
              <div className="h-full w-full bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-6">
                <div className="relative h-full w-full">
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                    <div className="transform-style-3d perspective-1000 relative w-full h-full">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-32 w-32 rounded-full bg-purple-500/10 animate-pulse"></div>
                        <div className="absolute h-40 w-40 rounded-full border-4 border-purple-400/20 animate-spin duration-[15s]"></div>
                        <div className="absolute h-48 w-48 rounded-full border-2 border-dashed border-cyan-400/30 animate-spin duration-[20s] animate-reverse"></div>
                      </div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData}>
                      <defs>
                        <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorActivity)"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center p-4 border-t border-slate-100 dark:border-slate-800 bg-gradient-to-r from-cyan-50 via-purple-50 to-pink-50 dark:from-cyan-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-purple-600 dark:text-purple-400">40%</span> increase this week
              </div>
              <div className="flex items-center text-xs text-cyan-600 dark:text-cyan-400">
                <Zap className="h-3.5 w-3.5 mr-1" />
                Updated in real-time
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
