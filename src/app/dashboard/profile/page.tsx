"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { ContentLoader } from "@/src/components/ui/loader"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { 
  Edit, 
  CheckCircle, 
  Lock, 
  Mail, 
  UserCircle, 
  Shield, 
  Activity, 
  Crown,
  Star,
  Sparkles,
  User,
  Settings
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/src/components/ui/badge"
import useUsers from "@/src/hooks/users/use-users"
import { useToast } from "@/src/hooks/use-toast"
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/src/context/LanguageContext"
import { cn } from "@/src/lib/utils"

/**
 * Modern Profile Settings Component
 * Beautiful, engaging interface for user profile management
 */
export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { useGetCurrentUser, useUpdateProfile } = useUsers()
  const { data: currentUserData, isLoading: isUserLoading } = useGetCurrentUser()
  const updateProfile = useUpdateProfile()
  const [showSuccess, setShowSuccess] = useState(false)
  const { toast } = useToast()
  const { t, ready } = useTranslation()
  const { isLoaded, language } = useLanguage()
  const isRTL = language === 'ar'

  // Form state for account information
  const [formData, setFormData] = useState<Partial<User>>({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    status: undefined
  })

  // Load user data when available
  useEffect(() => {
    if (currentUserData?.data) {
      const userData = currentUserData.data
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        role: userData.role || "",
        status: userData.status || ""
      })
      setLoading(false)
    }
  }, [currentUserData])

  // Loading state based on API call
  useEffect(() => {
    setLoading(isUserLoading)
  }, [isUserLoading])

  const handleNavigate = () => { 
    router.push("/websiteConfiguration")
  }

  const handleInputChange = (e: { target: { id: any; value: any } }) => {
    const { id, value } = e.target
    
    // Map the input IDs to the correct state property names
    let fieldName;
    if (id === 'first-name') {
      fieldName = 'firstName';
    } else if (id === 'last-name') {
      fieldName = 'lastName';
    } else {
      // For any other fields, just remove dashes
      fieldName = id.replace('-', '');
    }
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const handleUpdateProfile = async () => {
    try {
      await updateProfile.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName
      })
      
      // Show success indicator
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      
      toast({
        title: t('ProfilePage.toasts.updateSuccess.title', 'Profile updated'),
        description: t('ProfilePage.toasts.updateSuccess.description', 'Your profile information has been updated successfully.'),
        duration: 3000
      })
    } catch (error) {
      toast({
        title: t('ProfilePage.toasts.updateError.title', 'Update failed'),
        description: (error instanceof Error ? error.message : t('ProfilePage.toasts.updateError.description', 'There was a problem updating your profile')),
        variant: "destructive",
        duration: 5000
      })
    }
  }

  // Function to get role icon and color
  const getRoleInfo = (role: string | undefined) => {
    if (!role) return { icon: User, color: 'from-gray-500 to-slate-500' };
    
    switch(role.toLowerCase()) {
      case 'owner':
        return { 
          icon: Crown, 
          color: 'from-yellow-400 to-orange-500 dark:from-yellow-500 dark:to-orange-400',
          textColor: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'superadmin':
        return { 
          icon: Star, 
          color: 'from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400',
          textColor: 'text-purple-600 dark:text-purple-400'
        };
      case 'admin':
        return { 
          icon: Shield, 
          color: 'from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400',
          textColor: 'text-blue-600 dark:text-blue-400'
        };
      case 'moderator':
        return { 
          icon: Settings, 
          color: 'from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400',
          textColor: 'text-green-600 dark:text-green-400'
        };
      default:
        return { 
          icon: User, 
          color: 'from-gray-500 to-slate-500 dark:from-gray-400 dark:to-slate-400',
          textColor: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  // Function to get status badge color and info
  const getStatusInfo = (status: string | undefined) => {
    if (!status) return { color: "bg-gray-200 dark:bg-gray-700", textColor: "text-gray-700 dark:text-gray-300" };
    
    switch(status.toLowerCase()) {
      case 'active':
        return { 
          color: "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700", 
          textColor: "text-green-700 dark:text-green-300",
          dotColor: "bg-green-500 shadow-green-500/50"
        };
      case 'inactive':
        return { 
          color: "bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700", 
          textColor: "text-yellow-700 dark:text-yellow-300",
          dotColor: "bg-yellow-500 shadow-yellow-500/50"
        };
      case 'suspended':
        return { 
          color: "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700", 
          textColor: "text-red-700 dark:text-red-300",
          dotColor: "bg-red-500 shadow-red-500/50"
        };
      default:
        return { 
          color: "bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700", 
          textColor: "text-gray-700 dark:text-gray-300",
          dotColor: "bg-gray-500"
        };
    }
  };

  const roleInfo = getRoleInfo(formData.role);
  const statusInfo = getStatusInfo(formData.status as string);
  const RoleIcon = roleInfo.icon;

  // Show loading state if translations aren't ready
  if (!ready || !isLoaded) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto p-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex justify-center p-12">
          <ContentLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="space-y-8 max-w-6xl mx-auto p-6">
        {/* Modern Page Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-400/10 dark:to-purple-400/10 rounded-3xl blur-3xl" />
          <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-slate-700/50 p-8 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${roleInfo.color} flex items-center justify-center shadow-lg`}>
                    <div className="text-white text-2xl font-bold">
                      {formData.firstName?.charAt(0) || ""}{formData.lastName?.charAt(0) || ""}
                    </div>
                  </div>
                  <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full ${statusInfo.dotColor} border-4 border-white dark:border-slate-800 shadow-lg`} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {t('ProfilePage.title', 'My Profile Settings')}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    {t('ProfilePage.subtitle', 'Manage your personal information and account settings')}
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {t('ProfilePage.welcome', 'Welcome back!')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Tabs */}
        <Tabs defaultValue="account" className="space-y-8">
          <TabsList className="grid w-full grid-cols-1 h-auto p-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-lg">
            <TabsTrigger 
              value="account" 
              className={cn(
                "text-base py-4 px-6 rounded-xl transition-all duration-300",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500",
                "data-[state=active]:text-white data-[state=active]:shadow-lg",
                "hover:bg-slate-100 dark:hover:bg-slate-700/50",
                isRTL ? 'flex-row-reverse' : ''
              )}
            >
              <UserCircle className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('ProfilePage.tabs.account', 'Account Information')}
            </TabsTrigger>
          </TabsList>
          
          {/* Account tab content */}
          <TabsContent value="account" className="space-y-8">
            {loading ? (
              <div className="flex justify-center p-12">
                <ContentLoader />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Enhanced Profile Summary Card */}
                <Card className="lg:col-span-1 h-fit border-none shadow-2xl bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 backdrop-blur-sm">
                  <CardHeader className="pb-6 text-center">
                    <div className="relative mx-auto mb-6">
                      <div className={`h-24 w-24 rounded-3xl bg-gradient-to-br ${roleInfo.color} flex items-center justify-center text-white text-3xl font-bold shadow-2xl mx-auto`}>
                        {formData.firstName?.charAt(0) || ""}{formData.lastName?.charAt(0) || ""}
                      </div>
                      <div className={`absolute -bottom-3 -right-3 w-8 h-8 rounded-full ${statusInfo.dotColor} border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center`}>
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    </div>
                    
                    <CardTitle className="text-center">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                        {isRTL ? 
                          `${formData.lastName} ${formData.firstName}` : 
                          `${formData.firstName} ${formData.lastName}`
                        }
                      </h3>
                      <div className={`flex items-center justify-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg mr-2">
                          <Mail className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{formData.email}</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Role Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30">
                      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${roleInfo.color} shadow-lg`}>
                            <RoleIcon className="h-5 w-5 text-white" />
                          </div>
                          <div className={isRTL ? 'mr-3' : 'ml-3'}>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                              {t('ProfilePage.fields.role', 'Role')}
                            </p>
                            <p className={`font-bold ${roleInfo.textColor}`}>
                              {t(`ProfilePage.roles.${formData.role?.toLowerCase()}`)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Card */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl p-4 border border-green-100 dark:border-green-900/30">
                      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                            <Activity className="h-5 w-5 text-white" />
                          </div>
                          <div className={isRTL ? 'mr-3' : 'ml-3'}>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                              {t('ProfilePage.fields.status', 'Status')}
                            </p>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`} />
                              <p className={`font-bold ${statusInfo.textColor}`}>
                                {t(`ProfilePage.statuses.${formData.status?.toLowerCase()}`)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24/7</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Access</div>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">✓</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Verified</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Editable Information Card */}
                <Card className="lg:col-span-2 border-none shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-t-2xl border-b border-slate-200 dark:border-slate-700">
                    <CardTitle className="flex items-center text-xl">
                      <div className="p-2 bg-blue-500 rounded-lg mr-3">
                        <Edit className="h-5 w-5 text-white" />
                      </div>
                      {t('ProfilePage.editProfile.title', 'Edit Profile')}
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      {t('ProfilePage.editProfile.description', 'Update your personal information')}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-8 space-y-8">
                    {/* Editable Fields Section */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {t('ProfilePage.personalInfo.title', 'Personal Information')}
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-3">
                          <Label htmlFor="first-name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {t('ProfilePage.fields.firstName', 'First name')}
                          </Label>
                          <div className="relative group">
                            <Input 
                              id="first-name" 
                              value={formData.firstName} 
                              onChange={handleInputChange}
                              className={cn(
                                "h-12 transition-all duration-300",
                                "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                                "dark:focus:ring-blue-400/20 dark:focus:border-blue-400",
                                "dark:bg-slate-800/50 dark:border-slate-600",
                                "group-hover:shadow-lg group-hover:shadow-blue-500/10",
                                "rounded-xl border-2",
                                isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'
                              )}
                            />
                            <div className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'}`}>
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                <UserCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <Label htmlFor="last-name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {t('ProfilePage.fields.lastName', 'Last name')}
                          </Label>
                          <div className="relative group">
                            <Input 
                              id="last-name" 
                              value={formData.lastName} 
                              onChange={handleInputChange}
                              className={cn(
                                "h-12 transition-all duration-300",
                                "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                                "dark:focus:ring-blue-400/20 dark:focus:border-blue-400",
                                "dark:bg-slate-800/50 dark:border-slate-600",
                                "group-hover:shadow-lg group-hover:shadow-blue-500/10",
                                "rounded-xl border-2",
                                isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'
                              )}
                            />
                            <div className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'}`}>
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                <UserCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Read-only Account Information */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border-2 border-dashed border-slate-300 dark:border-slate-600">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-slate-300 dark:bg-slate-600 rounded-lg">
                          <Lock className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                          {t('ProfilePage.accountInfo.title', 'Account Information')}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {t('ProfilePage.readOnly', 'Read Only')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label htmlFor="email" className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {t('ProfilePage.fields.email', 'Email Address')}
                          </Label>
                          <div className="relative">
                            <Input 
                              id="email" 
                              value={formData.email} 
                              readOnly
                              className={cn(
                                "h-12 bg-slate-100 dark:bg-slate-700/50 cursor-not-allowed",
                                "border-2 border-dashed border-slate-300 dark:border-slate-600",
                                "rounded-xl",
                                isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'
                              )}
                            />
                            <div className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'}`}>
                              <div className="p-2 bg-slate-200 dark:bg-slate-600 rounded-lg">
                                <Mail className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div className="space-y-3">
                            <Label htmlFor="role" className="text-sm font-medium text-slate-600 dark:text-slate-400">
                              {t('ProfilePage.fields.role', 'Role')}
                            </Label>
                            <div className="relative">
                              <Input 
                                id="role" 
                                value={t(`ProfilePage.roles.${formData.role?.toLowerCase()}`)} 
                                readOnly
                                className={cn(
                                  "h-12 bg-slate-100 dark:bg-slate-700/50 cursor-not-allowed",
                                  "border-2 border-dashed border-slate-300 dark:border-slate-600",
                                  "rounded-xl",
                                  isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'
                                )}
                              />
                              <div className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'}`}>
                                <div className="p-2 bg-slate-200 dark:bg-slate-600 rounded-lg">
                                  <RoleIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <Label htmlFor="status" className="text-sm font-medium text-slate-600 dark:text-slate-400">
                              {t('ProfilePage.fields.accountStatus', 'Account Status')}
                            </Label>
                            <div className="relative">
                              <Input 
                                id="status" 
                                value={t(`ProfilePage.statuses.${formData.status?.toLowerCase()}`)} 
                                readOnly
                                className={cn(
                                  "h-12 bg-slate-100 dark:bg-slate-700/50 cursor-not-allowed",
                                  "border-2 border-dashed border-slate-300 dark:border-slate-600",
                                  "rounded-xl",
                                  isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'
                                )}
                              />
                              <div className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'}`}>
                                <div className="p-2 bg-slate-200 dark:bg-slate-600 rounded-lg">
                                  <Activity className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className={cn(
                    "flex justify-between items-center border-t border-slate-200 dark:border-slate-700 py-6 px-8",
                    "bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700",
                    "rounded-b-2xl",
                    isRTL ? 'flex-row-reverse' : ''
                  )}>
                    <Button 
                      onClick={handleUpdateProfile}
                      disabled={updateProfile.isPending}
                      className={cn(
                        "bg-gradient-to-r from-blue-600 to-purple-600",
                        "hover:from-blue-700 hover:to-purple-700",
                        "dark:from-blue-500 dark:to-purple-500",
                        "dark:hover:from-blue-600 dark:hover:to-purple-600",
                        "text-white px-8 h-12 rounded-xl font-semibold",
                        "shadow-lg hover:shadow-xl transition-all duration-300",
                        "hover:scale-105 active:scale-95"
                      )}
                    >
                      {updateProfile.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          {t('ProfilePage.buttons.saving', 'Saving...')}
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          {t('ProfilePage.buttons.saveChanges', 'Save changes')}
                        </>
                      )}
                    </Button>
                    
                    {showSuccess && (
                      <div className={cn(
                        "flex items-center text-green-600 dark:text-green-400",
                        "bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-xl",
                        "border border-green-200 dark:border-green-800",
                        "animate-in fade-in-0 slide-in-from-right-2 duration-300",
                        isRTL ? 'flex-row-reverse' : ''
                      )}>
                        <CheckCircle className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        <span className="font-medium">{t('ProfilePage.messages.savedSuccessfully', 'Saved successfully')}</span>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}