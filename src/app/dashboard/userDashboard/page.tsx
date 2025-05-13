"use client"

import { useState, useEffect } from "react"
import { 
  Globe, Layout, Book, 
  Bell, FileText, MessageSquare,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { 
  ResponsiveContainer,
  BarChart, Bar
} from 'recharts'
import { useAuth } from "@/src/context/AuthContext"
import { Badge } from "@/src/components/ui/badge"
import { Skeleton } from "@/src/components/ui/skeleton"
import { useLanguages } from "@/src/hooks/webConfiguration/use-language"
import { useSections } from "@/src/hooks/webConfiguration/use-section"
import Link from "next/link"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"

// Define interfaces for the data structures
interface User {
  firstName?: string;
  role?: string;
}

interface Language {
  _id: string;
  language: string;
  languageID: string;
  isActive: boolean;
  updatedAt: string;
}

interface Section {
  _id: string;
  name?: string;
  section_name?: string;
  description?: string;
  isActive: boolean;
  updatedAt: string;
}

interface ChartDataItem {
  name: string;
  value: number;
}

interface ApiResponse<T> {
  data: T[];
}

/**
 * User Dashboard page
 * A simpler dashboard view for regular users and admins
 */
export default function UserDashboard() {
  const [loading, setLoading] = useState(true)
  const { user } = useAuth() as { user: User | null }
  const { websiteId } = useWebsiteContext();

  const { 
    useGetByWebsite: useGetAllLanguages
  } = useLanguages();

  const { 
    data: languages, 
    isLoading: isLoadingLanguages,
  } = useGetAllLanguages(websiteId) as { 
    data?: ApiResponse<Language>, 
    isLoading: boolean 
  };

  const { 
    useGetAll: useGetAllSections
  } = useSections();

  const { 
    data: sections, 
    isLoading: isLoadingSections,
  } = useGetAllSections() as { 
    data?: ApiResponse<Section>, 
    isLoading: boolean 
  };

  // Extract sections and languages from the API response
  const sectionsData: Section[] = sections?.data || [];
  const languagesData: Language[] = languages?.data || [];
  
  // Count active/inactive languages and sections
  const activeLanguages = languagesData.filter(lang => lang.isActive).length;
  const inactiveLanguages = languagesData.length - activeLanguages;
  
  const activeSections = sectionsData.filter(section => section.isActive).length;
  const inactiveSections = sectionsData.length - activeSections;
  
  // Create chart data for languages and sections
  const languageChartData: ChartDataItem[] = [
    { name: 'Active', value: activeLanguages },
    { name: 'Inactive', value: inactiveLanguages }
  ];
  
  const sectionChartData: ChartDataItem[] = [
    { name: 'Active', value: activeSections },
    { name: 'Inactive', value: inactiveSections }
  ];
  
  // Track last updated times
  const getLastUpdatedDate = (dataArray: Array<{updatedAt: string}>) => {
    if (!dataArray || dataArray.length === 0) return null;
    
    return dataArray.reduce((latest, item) => {
      const itemDate = new Date(item.updatedAt);
      return itemDate > latest ? itemDate : latest;
    }, new Date(0));
  };
  
  const lastUpdatedLanguage = getLastUpdatedDate(languagesData);
  const lastUpdatedSection = getLastUpdatedDate(sectionsData);
  
  // Format dates nicely
  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    if (minutes > 0) return `${minutes} minutes ago`;
    return 'Just now';
  };
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName || 'User'} | Role: {user?.role || 'User'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(loading || isLoadingLanguages || isLoadingSections) ? (
          Array(4).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden">
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Languages</CardTitle>
                <div className="rounded-full bg-blue-100 p-1.5 text-blue-600 dark:bg-blue-900/40">
                  <Globe className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{languagesData.length}</div>
                <p className="text-xs text-muted-foreground">
                  {activeLanguages} active / {inactiveLanguages} inactive
                </p>
              </CardContent>
              <CardFooter className="p-2 border-t text-xs text-muted-foreground">
                Last updated: {formatDate(lastUpdatedLanguage)}
              </CardFooter>
            </Card>

            {/* Sections Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
                <div className="rounded-full bg-purple-100 p-1.5 text-purple-600 dark:bg-purple-900/40">
                  <Layout className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sectionsData.length}</div>
                <p className="text-xs text-muted-foreground">
                  {activeSections} active / {inactiveSections} inactive
                </p>
              </CardContent>
              <CardFooter className="p-2 border-t text-xs text-muted-foreground">
                Last updated: {formatDate(lastUpdatedSection)}
              </CardFooter>
            </Card>

            {/* Language Distribution */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Language Status</CardTitle>
                <div className="rounded-full bg-green-100 p-1.5 text-green-600 dark:bg-green-900/40">
                  <Book className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold">{((activeLanguages / Math.max(languagesData.length, 1)) * 100).toFixed(0)}%</div>
                    <p className="text-xs text-muted-foreground">Languages active</p>
                  </div>
                  <div className="h-14 w-24">
                    {languagesData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={languageChartData}>
                          <Bar dataKey="value" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                        No data
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-2 border-t text-xs text-muted-foreground">
                Total languages: {languagesData.length}
              </CardFooter>
            </Card>

            {/* Section Distribution */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Section Status</CardTitle>
                <div className="rounded-full bg-amber-100 p-1.5 text-amber-600 dark:bg-amber-900/40">
                  <FileText className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold">{((activeSections / Math.max(sectionsData.length, 1)) * 100).toFixed(0)}%</div>
                    <p className="text-xs text-muted-foreground">Sections active</p>
                  </div>
                  <div className="h-14 w-24">
                    {sectionsData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sectionChartData}>
                          <Bar dataKey="value" fill="#f59e0b" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                        No data
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-2 border-t text-xs text-muted-foreground">
                Total sections: {sectionsData.length}
              </CardFooter>
            </Card>
          </>
        )}
      </div>
      
      {/* Content cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(loading || isLoadingLanguages || isLoadingSections) ? (
          <>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-36 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
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
            
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-36 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-52 w-full rounded-md" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-36 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array(4).fill(0).map((_, i) => (
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
            {/* Available Languages */}
            <Card>
              <CardHeader>
                <CardTitle>Available Languages</CardTitle>
                <CardDescription>Currently configured languages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-80 overflow-y-auto">
                {languagesData.length === 0 ? (
                  <p className="text-center text-muted-foreground">No languages configured yet</p>
                ) : (
                  languagesData.map((lang) => (
                    <div key={lang._id} className="flex items-center space-x-4">
                      <div className={`rounded-full p-2 ${lang.isActive 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/40' 
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800/40'}`}>
                        <Globe className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{lang.language}</p>
                        <p className="text-xs text-muted-foreground">{lang.languageID}</p>
                      </div>
                      <Badge variant="outline" className={`ml-auto ${lang.isActive 
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                        : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800'}`}>
                        {lang.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
           
            </Card>
            
            {/* Website Sections */}
            <Card>
              <CardHeader>
                <CardTitle>Website Sections</CardTitle>
                <CardDescription>Navigate to different sections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-80 overflow-y-auto">
                {sectionsData.length === 0 ? (
                  <p className="text-center text-muted-foreground">No sections configured yet</p>
                ) : (
                  sectionsData.map((section) => (
                    <Link 
                      key={section._id} 
                      href={`/admin/sections/${section._id}`}
                      className="flex items-center space-x-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className={`rounded-full p-2 ${section.isActive 
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40' 
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800/40'}`}>
                        <Layout className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{section.name || section.section_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {section.description ? section.description : 'No description'}
                        </p>
                      </div>
                      <Badge variant="outline" className={`ml-auto ${section.isActive 
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                        : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800'}`}>
                        {section.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Link>
                  ))
                )}
              </CardContent>

            </Card>
            
            {/* Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
                <CardDescription>Latest content changes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {lastUpdatedSection ? (
                  <div className="flex items-start">
                    <div className="mr-4 mt-0.5">
                      <Layout className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Section Updated</p>
                      <p className="text-xs text-muted-foreground">
                        A section was updated {formatDate(lastUpdatedSection)}
                      </p>
                    </div>
                  </div>
                ) : null}
                
                {lastUpdatedLanguage ? (
                  <div className="flex items-start">
                    <div className="mr-4 mt-0.5">
                      <Globe className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Language Updated</p>
                      <p className="text-xs text-muted-foreground">
                        A language was updated {formatDate(lastUpdatedLanguage)}
                      </p>
                    </div>
                  </div>
                ) : null}
                
                <div className="flex items-start">
                  <div className="mr-4 mt-0.5">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Languages Status</p>
                    <p className="text-xs text-muted-foreground">
                      {activeLanguages} of {languagesData.length} languages are active
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 mt-0.5">
                    <FileText className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Sections Status</p>
                    <p className="text-xs text-muted-foreground">
                      {activeSections} of {sectionsData.length} sections are active
                    </p>
                  </div>
                </div>
              </CardContent>
          
            </Card>
          </>
        )}
      </div>
      
      
    </div>
  )
}