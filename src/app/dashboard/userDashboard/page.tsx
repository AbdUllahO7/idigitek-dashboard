"use client"

import { useState, useEffect } from "react"
import {
  Globe,
  Layout,
  Book,
  FileText,
  MessageSquare,
  Users,
  BarChart3,
  Layers,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card"
import { useAuth } from "@/src/context/AuthContext"
import { useLanguages } from "@/src/hooks/webConfiguration/use-language"
import { useSections } from "@/src/hooks/webConfiguration/use-section"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import { motion } from "framer-motion"
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Skeleton } from "@/src/components/ui/skeleton"
import { useRouter } from "next/navigation"

// Define interfaces for the data structures
interface User {
  firstName?: string
  role?: string
}

interface Language {
  _id: string
  language: string
  languageID: string
  isActive: boolean
  updatedAt: string
}

interface Section {
  _id: string
  name?: string
  section_name?: string
  description?: string
  isActive: boolean
  updatedAt: string
}

interface ChartDataItem {
  name: string
  value: number
}

interface ApiResponse<T> {
  data: T[]
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/90 backdrop-blur-sm p-2 rounded-md border shadow-md">
        <p className="text-xs font-medium">{`${payload[0].name} : ${payload[0].value}`}</p>
      </div>
    )
  }
  return null
}

/**
 * User Dashboard page
 * A modern dashboard with 3D elements for regular users and admins
 */
export default function UserDashboard() {
  const [loading, setLoading] = useState(true)
  const { user } = useAuth() as { user: User | null }
  const { websiteId } = useWebsiteContext()
  const router = useRouter()
  const { useGetByWebsite: useGetAllLanguages } = useLanguages()

  const { data: languages, isLoading: isLoadingLanguages } = useGetAllLanguages(websiteId) as {
    data?: ApiResponse<Language>
    isLoading: boolean
  }

  const { useGetAll: useGetAllSections } = useSections()

  const { data: sections, isLoading: isLoadingSections } = useGetAllSections() as {
    data?: ApiResponse<Section>
    isLoading: boolean
  }

  // Extract sections and languages from the API response
  const sectionsData: Section[] = sections?.data || []
  const languagesData: Language[] = languages?.data || []

  // Count active/inactive languages and sections
  const activeLanguages = languagesData.filter((lang) => lang.isActive).length
  const inactiveLanguages = languagesData.length - activeLanguages

  const activeSections = sectionsData.filter((section) => section.isActive).length
  const inactiveSections = sectionsData.length - activeSections

  // Create chart data for languages and sections
  const languageChartData: ChartDataItem[] = [
    { name: "Active", value: activeLanguages },
    { name: "Inactive", value: inactiveLanguages },
  ]

  const sectionChartData: ChartDataItem[] = [
    { name: "Active", value: activeSections },
    { name: "Inactive", value: inactiveSections },
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

  // Track last updated times
  const getLastUpdatedDate = (dataArray: Array<{ updatedAt: string }>) => {
    if (!dataArray || dataArray.length === 0) return null

    return dataArray.reduce((latest, item) => {
      const itemDate = new Date(item.updatedAt)
      return itemDate > latest ? itemDate : latest
    }, new Date(0))
  }

  const lastUpdatedLanguage = getLastUpdatedDate(languagesData)
  const lastUpdatedSection = getLastUpdatedDate(sectionsData)

  // Format dates nicely
  const formatDate = (date: Date | null) => {
    if (!date) return "Never"

    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (days > 0) return `${days} days ago`
    if (hours > 0) return `${hours} hours ago`
    if (minutes > 0) return `${minutes} minutes ago`
    return "Just now"
  }

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Colors for charts
  const COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ef4444"]

  return (
    <div className="space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen p-6 rounded-xl">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20 dark:border-slate-700/20"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Content Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName || "User"} |{" "}
            <span className="font-medium text-indigo-600 dark:text-indigo-400">{user?.role || "User"}</span>
          </p>
        </div>
      </motion.div>

      {/* Stats overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading || isLoadingLanguages || isLoadingSections ? (
          Array(4)
            .fill(0)
            .map((_, index) => (
              <Card
                key={index}
                className="overflow-hidden bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700/20"
              >
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-full" />
                </CardContent>
                <div className="h-10">
                  <Skeleton className="h-full w-full" />
                </div>
              </Card>
            ))
        ) : (
          <>
            {/* Languages Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="overflow-hidden bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700/20 hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Languages</CardTitle>
                  <div className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 p-1.5 text-white shadow-md">
                    <Globe className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    {languagesData.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 dark:text-green-400 font-medium">{activeLanguages} active</span> /
                    <span className="text-gray-500 dark:text-gray-400">{inactiveLanguages} inactive</span>
                  </p>
                </CardContent>
                <CardFooter className="p-2 border-t text-xs text-muted-foreground bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10">
                  Last updated: {formatDate(lastUpdatedLanguage)}
                </CardFooter>
              </Card>
            </motion.div>

            {/* Sections Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="overflow-hidden bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700/20 hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
                  <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-400 p-1.5 text-white shadow-md">
                    <Layout className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    {sectionsData.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 dark:text-green-400 font-medium">{activeSections} active</span> /
                    <span className="text-gray-500 dark:text-gray-400">{inactiveSections} inactive</span>
                  </p>
                </CardContent>
                <CardFooter className="p-2 border-t text-xs text-muted-foreground bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
                  Last updated: {formatDate(lastUpdatedSection)}
                </CardFooter>
              </Card>
            </motion.div>

            {/* Language Distribution */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="overflow-hidden bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700/20 hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Language Status</CardTitle>
                  <div className="rounded-full bg-gradient-to-r from-green-500 to-emerald-400 p-1.5 text-white shadow-md">
                    <Book className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent className="pb-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                        {((activeLanguages / Math.max(languagesData.length, 1)) * 100).toFixed(0)}%
                      </div>
                      <p className="text-xs text-muted-foreground">Languages active</p>
                    </div>
                    <div className="h-16 w-24">
                      {languagesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={languageChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={15}
                              outerRadius={30}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {languageChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                          No data
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-2 border-t text-xs text-muted-foreground bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10">
                  Total languages: {languagesData.length}
                </CardFooter>
              </Card>
            </motion.div>

            {/* Section Distribution */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card className="overflow-hidden bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700/20 hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Section Status</CardTitle>
                  <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-400 p-1.5 text-white shadow-md">
                    <FileText className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent className="pb-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                        {((activeSections / Math.max(sectionsData.length, 1)) * 100).toFixed(0)}%
                      </div>
                      <p className="text-xs text-muted-foreground">Sections active</p>
                    </div>
                    <div className="h-16 w-24">
                      {sectionsData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={sectionChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={15}
                              outerRadius={30}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {sectionChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                          No data
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-2 border-t text-xs text-muted-foreground bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10">
                  Total sections: {sectionsData.length}
                </CardFooter>
              </Card>
            </motion.div>
          </>
        )}
      </div>

      {/* Content cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading || isLoadingLanguages || isLoadingSections ? (
          <>
            <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700/20">
              <CardHeader>
                <Skeleton className="h-6 w-36 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700/20">
              <CardHeader>
                <Skeleton className="h-6 w-36 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-52 w-full rounded-md" />
              </CardContent>
            </Card>

            <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700/20">
              <CardHeader>
                <Skeleton className="h-6 w-36 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  ))}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* 3D Globe Visualization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="overflow-hidden bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700/20 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="mr-2 h-5 w-5 text-blue-500" />
                    <span>Language Globe</span>
                  </CardTitle>
                  <CardDescription>3D visualization of languages</CardDescription>
                </CardHeader>
                <CardContent className="p-0 h-[250px]">
                  <div className="h-full w-full">
                    <div className="h-full w-full relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 rounded-lg shadow-lg">
                          <p className="text-lg font-bold">{languagesData.length}</p>
                          <p className="text-xs text-muted-foreground">Total Languages</p>
                        </div>
                      </div>
                      <div className="h-full w-full">
                        <div className="h-full w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-b-lg">
                          <div className="h-full w-full opacity-90">
                            <div className="h-full w-full relative">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-32 w-32 rounded-full bg-blue-500/20 animate-pulse"></div>
                                <div className="absolute h-40 w-40 rounded-full border-4 border-blue-400/30 animate-spin duration-[10s]"></div>
                                <div className="absolute h-48 w-48 rounded-full border-2 border-dashed border-indigo-400/40 animate-spin duration-[15s] animate-reverse"></div>
                                <div className="absolute h-24 w-24 rounded-full bg-gradient-to-r from-blue-500/40 to-indigo-500/40 animate-pulse"></div>
                              </div>
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={languageChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                  >
                                    {languageChartData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center p-4 border-t bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-blue-600 dark:text-blue-400">{activeLanguages}</span> active
                    languages
                  </div>

                </CardFooter>
              </Card>
            </motion.div>

            {/* Activity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="overflow-hidden bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700/20 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-purple-500" />
                    <span>Activity Overview</span>
                  </CardTitle>
                  <CardDescription>Weekly content activity</CardDescription>
                </CardHeader>
                <CardContent className="p-0 h-[250px]">
                  <div className="h-full w-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-b-lg p-4">
                    <div className="relative h-full w-full">
                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                        <div className="transform-style-3d perspective-1000 relative w-full h-full">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-32 w-32 rounded-full bg-purple-500/10 animate-pulse"></div>
                            <div className="absolute h-40 w-40 rounded-full border-4 border-purple-400/20 animate-spin"></div>
                            <div className="absolute h-48 w-48 rounded-full border-2 border-dashed border-pink-400/30 animate-reverse-spin"></div>
                          </div>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activityData}>
                          <defs>
                            <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#8b5cf6"
                            fillOpacity={1}
                            fill="url(#colorActivity)"
                          />
                          <Tooltip content={<CustomTooltip />} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center p-4 border-t bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-purple-600 dark:text-purple-400">40%</span> increase this week
                  </div>
              
                </CardFooter>
              </Card>
            </motion.div>

            {/* Recent Updates */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="overflow-hidden bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700/20 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5 text-green-500" />
                    <span>Recent Updates</span>
                  </CardTitle>
                  <CardDescription>Latest content changes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[250px] overflow-y-auto p-4">
                  {lastUpdatedSection ? (
                    <motion.div
                      className="flex items-start p-3 rounded-lg bg-white/70 dark:bg-slate-700/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="mr-4 mt-0.5">
                        <div className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-400 p-2 text-white shadow-md">
                          <Layout className="h-4 w-4" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Section Updated</p>
                        <p className="text-xs text-muted-foreground">
                          A section was updated {formatDate(lastUpdatedSection)}
                        </p>
                      </div>
                    </motion.div>
                  ) : null}

                  {lastUpdatedLanguage ? (
                    <motion.div
                      className="flex items-start p-3 rounded-lg bg-white/70 dark:bg-slate-700/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="mr-4 mt-0.5">
                        <div className="rounded-full bg-gradient-to-r from-green-500 to-emerald-400 p-2 text-white shadow-md">
                          <Globe className="h-4 w-4" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Language Updated</p>
                        <p className="text-xs text-muted-foreground">
                          A language was updated {formatDate(lastUpdatedLanguage)}
                        </p>
                      </div>
                    </motion.div>
                  ) : null}

                  <motion.div
                    className="flex items-start p-3 rounded-lg bg-white/70 dark:bg-slate-700/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="mr-4 mt-0.5">
                      <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-400 p-2 text-white shadow-md">
                        <Users className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Languages Status</p>
                      <p className="text-xs text-muted-foreground">
                        {activeLanguages} of {languagesData.length} languages are active
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start p-3 rounded-lg bg-white/70 dark:bg-slate-700/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="mr-4 mt-0.5">
                      <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-400 p-2 text-white shadow-md">
                        <Layers className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Sections Status</p>
                      <p className="text-xs text-muted-foreground">
                        {activeSections} of {sectionsData.length} sections are active
                      </p>
                    </div>
                  </motion.div>
                </CardContent>
                <CardFooter className="flex justify-between items-center p-4 border-t bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-green-600 dark:text-green-400">4</span> recent updates
                  </div>
                 
                </CardFooter>
              </Card>
            </motion.div>
          </>
        )}
      </div>

   
    </div>
  )
}
