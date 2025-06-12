"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { ContentLoader } from "@/src/components/ui/loader"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Edit, CheckCircle, Lock, Mail, UserCircle, Shield, Activity } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/src/components/ui/badge"
import useUsers, { User } from "@/src/hooks/users/use-users"
import { useToast } from "@/src/hooks/use-toast"
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/src/context/LanguageContext"

/**
 * Settings page component
 * Allows users to configure their account and application settings
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

  // Function to get status badge color
  const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-200 dark:bg-gray-700";
    
    switch(status.toLowerCase()) {
      case 'active':
        return "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700";
      case 'inactive':
        return "bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700";
      case 'suspended':
        return "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700";
      default:
        return "bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700";
    }
  };

  // Show loading state if translations aren't ready
  if (!ready || !isLoaded) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex justify-center p-12">
          <ContentLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          {t('ProfilePage.title', 'My Profile Settings')}
        </h1>
      </div>

      {/* Settings tabs */}
      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 h-auto p-1">
          <TabsTrigger value="account" className={`text-base py-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <UserCircle className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('ProfilePage.tabs.account', 'Account Information')}
          </TabsTrigger>
        </TabsList>
        
        {/* Account tab content */}
        <TabsContent value="account" className="space-y-6 ">
          {loading ? (
            <div className="flex justify-center p-12">
              <ContentLoader />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile summary sidebar */}
              <Card className="md:col-span-1  h-fit bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-none shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 flex items-center justify-center text-white text-2xl font-bold mb-2 mx-auto">
                      {formData.firstName?.charAt(0) || ""}{formData.lastName?.charAt(0) || ""}
                    </div>
                  </CardTitle>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mt-2">
                      {isRTL ? 
                        `${formData.lastName} ${formData.firstName}` : 
                        `${formData.firstName} ${formData.lastName}`
                      }
                    </h3>
                    <div className={`flex items-center justify-center mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Mail className={`h-4 w-4 text-muted-foreground ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      <p className="text-sm text-muted-foreground">{formData.email}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="space-y-4">
                    <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Shield className={`h-4 w-4 text-blue-500 dark:text-blue-400 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        <span className="text-sm font-medium">{t('ProfilePage.fields.role', 'Role')}</span>
                      </div>
                      <Badge variant="outline" className="font-medium bg-blue-50 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800">
                        {t(`ProfilePage.roles.${formData.role?.toLowerCase()}`)}
                      </Badge>
                    </div>
                    <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Activity className={`h-4 w-4 text-emerald-500 dark:text-emerald-400 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        <span className="text-sm font-medium">{t('ProfilePage.fields.status', 'Status')}</span>
                      </div>
                      <Badge className={`${getStatusColor(formData.status as string)} text-white`}>
                        {t(`ProfilePage.statuses.${formData.status?.toLowerCase()}`)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Editable information */}
              <Card className="md:col-span-2 shadow-xl border-none dark:bg-slate-900" dir={isRTL ? 'rtl' : 'ltr'}>
                <CardHeader>
                  <CardTitle>{t('ProfilePage.editProfile.title', 'Edit Profile')}</CardTitle>
                  <CardDescription>{t('ProfilePage.editProfile.description', 'Update your personal information')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="first-name" className="text-sm font-medium">
                        {t('ProfilePage.fields.firstName', 'First name')}
                      </Label>
                      <div className="relative">
                        <Input 
                          id="first-name" 
                          value={formData.firstName} 
                          onChange={handleInputChange}
                          className={`h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 dark:bg-slate-800 dark:border-slate-700 ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
                        />
                        <UserCircle className={`absolute top-3 h-5 w-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name" className="text-sm font-medium">
                        {t('ProfilePage.fields.lastName', 'Last name')}
                      </Label>
                      <div className="relative">
                        <Input 
                          id="last-name" 
                          value={formData.lastName} 
                          onChange={handleInputChange}
                          className={`h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 dark:bg-slate-800 dark:border-slate-700 ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
                        />
                        <UserCircle className={`absolute top-3 h-5 w-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Read-only fields */}
                  <div className="mt-8 pt-6 border-t border-dashed dark:border-slate-700" >
                    <h3 className={`text-lg font-medium mb-4 flex items-center ${isRTL ? 'text-left' : 'text-right'}`} >
                      <Lock className={`h-4 w-4 text-muted-foreground ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      <span className="text-muted-foreground">{t('ProfilePage.accountInfo.title', 'Account Information')}</span>
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                          {t('ProfilePage.fields.email', 'Email Address')}
                        </Label>
                        <div className="relative">
                          <Input 
                            id="email" 
                            value={formData.email} 
                            readOnly
                            className={`bg-slate-50 dark:bg-slate-800/50 h-11 cursor-not-allowed border-dashed dark:border-slate-700 ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
                          />
                          <Mail className={`absolute top-3 h-5 w-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="role" className="text-sm font-medium text-muted-foreground">
                            {t('ProfilePage.fields.role', 'Role')}
                          </Label>
                          <div className="relative">
                            <Input 
                              id="role" 
                              value={t(`ProfilePage.roles.${formData.role?.toLowerCase()}`)} 
                              readOnly
                              className={`bg-slate-50 dark:bg-slate-800/50 h-11 cursor-not-allowed border-dashed dark:border-slate-700 ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
                            />
                            <Shield className={`absolute top-3 h-5 w-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="status" className="text-sm font-medium text-muted-foreground">
                            {t('ProfilePage.fields.accountStatus', 'Account Status')}
                          </Label>
                          <div className="relative">
                            <Input 
                              id="status" 
                              value={t(`ProfilePage.statuses.${formData.status?.toLowerCase()}`)} 
                              readOnly
                              className={`bg-slate-50 dark:bg-slate-800/50 h-11 cursor-not-allowed border-dashed dark:border-slate-700 ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
                            />
                            <Activity className={`absolute top-3 h-5 w-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className={`flex justify-between border-t py-6 dark:border-slate-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Button 
                    onClick={handleUpdateProfile}
                    disabled={updateProfile.isPending}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white px-6 h-11"
                  >
                    {updateProfile.isPending ? 
                      t('ProfilePage.buttons.saving', 'Saving...') : 
                      t('ProfilePage.buttons.saveChanges', 'Save changes')
                    }
                  </Button>
                  {showSuccess && (
                    <div className={`flex items-center text-green-500 dark:text-green-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <CheckCircle className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      <span>{t('ProfilePage.messages.savedSuccessfully', 'Saved successfully')}</span>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}