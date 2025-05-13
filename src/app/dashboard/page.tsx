"use client"

import { useState, useEffect } from "react"
import { Activity, AlertTriangle, ArrowUpRight, EllipsisIcon, FileText, Globe, Layers, UserCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { CardLoader } from "@/src/components/ui/loader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { useSections } from "@/src/hooks/webConfiguration/use-section"
import { useLanguages } from "@/src/hooks/webConfiguration/use-language"
import { Language } from "@/src/api/types/hooks/language.types"
import { Section } from "@/src/api/types/hooks/section.types"
import { useWebSite } from "@/src/hooks/webConfiguration/use-WebSite"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"

/**
 * Dashboard overview page
 * Shows key metrics and data visualizations
 */
export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const { websiteId } = useWebsiteContext()
  
  // Get website data
  const { 
    useGetMyWebsites,
    useGetWebsiteUsers
  } = useWebSite();

  // Get user's websites
  const { 
    data: websites, 
    isLoading: isLoadingWebsites
  } = useGetMyWebsites();

  // Get users for the current website
  const { 
    data: websiteUsers, 
    isLoading: isLoadingWebsiteUsers,
  } = useGetWebsiteUsers(websiteId);

  // Get data from API hooks
  const { 
    useGetByWebsiteId: useGetAllSections
  } = useSections();
  
  const { 
    useGetByWebsite: useGetWebsiteLanguages
  } = useLanguages();

  const { 
    data: sections, 
    isLoading: isLoadingSections,
  } = useGetAllSections(websiteId);

  const { 
    data: languages, 
    isLoading: isLoadingLanguages,
  } = useGetWebsiteLanguages(websiteId);

  // Extract active sections and languages from the API response
  const sectionsData = sections?.data || [];
  const languagesData = languages?.data || [];
  const activeSections = sectionsData.filter((section: Section) => section.isActive) || [];
  const activeLanguages = languagesData.filter((lang: Language) => lang.isActive) || [];

  // Get user role counts
  const usersData = websiteUsers || [];
  
  const userRoleCounts = usersData.reduce((acc: Record<string, number>, user: any) => {
    const role = user.role || 'user';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  // Create user role chart data
  const userRoleChartData = Object.entries(userRoleCounts).map(([name, value]) => ({
    name,
    value
  }));
  
  // Create data for sections visualization
  const sectionChartData = [
    { name: 'Active', value: activeSections.length },
    { name: 'Inactive', value: sectionsData.length - activeSections.length }
  ];
  
  // Create data for languages visualization
  const languageChartData = [
    { name: 'Active', value: activeLanguages.length },
    { name: 'Inactive', value: languagesData.length - activeLanguages.length }
  ];
  
  // Colors for charts
  const COLORS = ['#10b981', '#6366f1', '#8b5cf6', '#3b82f6', '#ef4444'];
  const ROLE_COLORS = {
    'owner' : '#ef444444',
    'superAdmin': '#ef4444',
    'admin': '#8b5cf6',
    'user': '#3b82f6'
  };
  
  // Set loading state based on API data loading
  useEffect(() => {
    if (!isLoadingSections && !isLoadingLanguages && !isLoadingWebsiteUsers && !isLoadingWebsites) {
      setLoading(false);
    }
  }, [isLoadingSections, isLoadingLanguages, isLoadingWebsiteUsers, isLoadingWebsites]);
  
  // Check if website is selected
  const noWebsiteSelected = !websiteId || websiteId === "";
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your website configuration and analytics</p>
        </div>
      </div>

      {/* Website selection notice */}
      {noWebsiteSelected && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="h-5 w-5" />
              <p>Please select a website to view its dashboard data.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
        </TabsList>

        {/* Overview tab content */}
        <TabsContent value="overview" className="space-y-6">
          {/* Metric cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                <Card className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
                    <div className="rounded-full bg-indigo-100 p-1.5 text-indigo-600 dark:bg-indigo-900/40">
                      <Layers className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-2xl font-bold">{sectionsData.length}</div>
                    <p className="flex items-center text-xs text-green-600">
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                      {Math.round((activeSections.length / Math.max(sectionsData.length, 1)) * 100)}% active
                    </p>
                  </CardContent>
                  <div className="h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sectionChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#6366f1" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorRevenue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Active Sections card */}
                <Card className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Sections</CardTitle>
                    <div className="rounded-full bg-purple-100 p-1.5 text-purple-600 dark:bg-purple-900/40">
                      <FileText className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-2xl font-bold">{activeSections.length}</div>
                    <p className="flex items-center text-xs text-green-600">
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                      {sectionsData.length - activeSections.length} inactive
                    </p>
                  </CardContent>
                  <div className="h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sectionChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Total Languages card */}
                <Card className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Languages</CardTitle>
                    <div className="rounded-full bg-green-100 p-1.5 text-green-600 dark:bg-green-900/40">
                      <Globe className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-2xl font-bold">{languagesData.length}</div>
                    <p className="flex items-center text-xs text-green-600">
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                      {Math.round((activeLanguages.length / Math.max(languagesData.length, 1)) * 100)}% active
                    </p>
                  </CardContent>
                  <div className="h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={languageChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Active Languages card */}
                <Card className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Languages</CardTitle>
                    <div className="rounded-full bg-blue-100 p-1.5 text-blue-600 dark:bg-blue-900/40">
                      <Activity className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-2xl font-bold">{activeLanguages.length}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {activeLanguages.slice(0, 3).map((lang: Language) => (
                        <div
                          key={lang._id}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium shadow-sm flex items-center gap-1"
                        >
                          <Globe className="h-3 w-3" />
                          {lang.languageID}
                        </div>
                      ))}
                      {activeLanguages.length > 3 && (
                        <div className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-md text-xs font-medium">
                          +{activeLanguages.length - 3} more
                        </div>
                      )}
                    </div>
                    <p className="mt-2 flex items-center text-xs text-green-600">
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                      {languagesData.length - activeLanguages.length} inactive
                    </p>
                  </CardContent>
                  <div className="h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={languageChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </>
            )}
          </div>
          
          {/* Add Website Users card in a separate row */}
          {!loading && !noWebsiteSelected && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Website Users card */}
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Website Users</CardTitle>
                  <div className="rounded-full bg-red-100 p-1.5 text-red-600 dark:bg-red-900/40">
                    <UserCircle className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-2xl font-bold">{usersData.length}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(userRoleCounts).map(([role, count]) => (
                      <div
                      key={role}
                      className={`text-white px-2 py-1 rounded-md text-xs font-medium shadow-sm flex items-center gap-1 ${
                        role === 'superAdmin' 
                          ? 'bg-red-500' : role === 'owner' ? 'bg-red-950' 
                          : role === 'admin'
                            ? 'bg-purple-500'
                            : 'bg-blue-500' 
                      }`}
                    >
                      <UserCircle className="h-3 w-3" />
                      <span>{`${role}: ${count}`}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <div className="h-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userRoleChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {userRoleChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={ROLE_COLORS[entry.name as keyof typeof ROLE_COLORS] || '#3b82f6'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}
          
          {/* Charts section */}
          {!loading && !noWebsiteSelected && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Section Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Section Distribution</CardTitle>
                  <CardDescription>Active vs. Inactive Sections</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sectionChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {sectionChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <div className="flex justify-between w-full text-sm text-muted-foreground">
                    <div>Total Sections: {sectionsData.length}</div>
                    <div>Updated: {new Date().toLocaleDateString()}</div>
                  </div>
                </CardFooter>
              </Card>
              
              {/* Language Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Language Distribution</CardTitle>
                  <CardDescription>Active vs. Inactive Languages</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={languageChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {languageChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <div className="flex justify-between w-full text-sm text-muted-foreground">
                    <div>Total Languages: {languagesData.length}</div>
                    <div>Updated: {new Date().toLocaleDateString()}</div>
                  </div>
                </CardFooter>
              </Card>
              
              {/* User Role Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>User Role Distribution</CardTitle>
                  <CardDescription>Website User Types</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={userRoleChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {userRoleChartData.map((entry) => (
                            <Cell 
                              key={`cell-${entry.name}`} 
                              fill={ROLE_COLORS[entry.name as keyof typeof ROLE_COLORS] || '#3b82f6'} 
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <div className="flex justify-between w-full text-sm text-muted-foreground">
                    <div>Total Website Users: {usersData.length}</div>
                    <div>Updated: {new Date().toLocaleDateString()}</div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Users tab content */}
        <TabsContent value="users" className="space-y-6">
          {loading || noWebsiteSelected ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6].map((_, index) => (
                <CardLoader key={index} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Website User Management</h2>
                <Button size="sm">
                  Add User
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {usersData.map((user: any) => (
                  <Card key={user._id || user.userId} className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium truncate">{user.name || user.email}</CardTitle>
                      <div className={`rounded-full p-1.5 ${
                        user.role === 'superAdmin' 
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/40' 
                          : user.role === 'admin'
                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40'
                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40'
                      }`}>
                        <UserCircle className="h-4 w-4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm truncate text-muted-foreground mb-2">{user.email}</div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === 'superAdmin'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {user.role}
                        </span>
                        {user.isActive ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                            Inactive
                          </span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-3 flex justify-end">
                      <Button variant="ghost" size="sm">
                        <EllipsisIcon className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}