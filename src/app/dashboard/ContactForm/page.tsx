"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { ContentLoader } from "@/src/components/ui/loader"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Trash2,
  Eye,
  Search,
  Filter,
  BarChart3,
  Users,
  MessageCircle,
  Calendar,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Check,
  X
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/src/hooks/use-toast"
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/src/context/LanguageContext"
import { cn } from "@/src/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { useContactForm } from "@/src/hooks/webConfiguration/use-contactForm"

// Types
interface ContactFormData {
  _id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

/**
 * Modern Contact Forms Admin Component
 * Beautiful, engaging interface for managing contact form submissions
 */
export default function ContactFormsPage() {
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [contactToDelete, setContactToDelete] = useState<string | null>(null)
  
  const router = useRouter()
  const { 
    useGetAllContactForms, 
    useGetContactFormsStats,
    useUpdateContactFormStatus,
    useDeleteContactForm,
    useGetContactFormById
  } = useContactForm()
  
  const { data: contactsData, isLoading: isContactsLoading, refetch } = useGetAllContactForms(currentPage, 10, statusFilter === "all" ? undefined : statusFilter as "pending" | "read" | "responded" | undefined)
  const { data: statsData, isLoading: isStatsLoading } = useGetContactFormsStats()
  const updateStatusMutation = useUpdateContactFormStatus()
  const deleteContactMutation = useDeleteContactForm()

  console.log("contactsData", contactsData)
  
  const { toast } = useToast()
  const { t, ready } = useTranslation()
  const { isLoaded, language } = useLanguage()
  const isRTL = language === 'ar'

  // Loading state based on API calls
  useEffect(() => {
    setLoading(isContactsLoading || isStatsLoading)
  }, [isContactsLoading, isStatsLoading])

  // Function to get status badge info
  const getStatusInfo = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pending':
        return { 
          color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", 
          icon: Clock,
          dotColor: "bg-yellow-500"
        };
      case 'read':
        return { 
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", 
          icon: Eye,
          dotColor: "bg-blue-500"
        };
      case 'responded':
        return { 
          color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", 
          icon: CheckCircle,
          dotColor: "bg-green-500"
        };
      default:
        return { 
          color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400", 
          icon: AlertCircle,
          dotColor: "bg-gray-500"
        };
    }
  };

  // Handle status update
  const handleStatusUpdate = async (contactId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: contactId, status: newStatus })
      toast({
        title: t('ContactForms.toasts.statusUpdated.title', 'Status Updated'),
        description: t('ContactForms.toasts.statusUpdated.description', 'Contact status has been updated successfully.'),
        duration: 3000
      })
      refetch()
    } catch (error) {
      toast({
        title: t('ContactForms.toasts.statusError.title', 'Update Failed'),
        description: t('ContactForms.toasts.statusError.description', 'Failed to update contact status.'),
        variant: "destructive",
        duration: 5000
      })
    }
  }

  // Handle delete contact
  const handleDeleteContact = async () => {
    if (!contactToDelete) return
    
    try {
      await deleteContactMutation.mutateAsync(contactToDelete)
      toast({
        title: t('ContactForms.toasts.deleted.title', 'Contact Deleted'),
        description: t('ContactForms.toasts.deleted.description', 'Contact has been deleted successfully.'),
        duration: 3000
      })
      setShowDeleteDialog(false)
      setContactToDelete(null)
      refetch()
    } catch (error) {
      toast({
        title: t('ContactForms.toasts.deleteError.title', 'Delete Failed'),
        description: t('ContactForms.toasts.deleteError.description', 'Failed to delete contact.'),
        variant: "destructive",
        duration: 5000
      })
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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

  const contacts = contactsData?.data?.contacts || []
  const stats = statsData?.data || { total: 0, byStatus: {} }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="space-y-8 max-w-7xl mx-auto p-6">
        {/* Modern Page Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-400/10 dark:to-purple-400/10 rounded-3xl blur-3xl" />
          <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-slate-700/50 p-8 shadow-xl">
            <div className="flex items-center justify-between">
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} space-x-4`}>
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <MessageSquare className="text-white text-2xl" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-green-500 border-4 border-white dark:border-slate-800 shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl ml-2 mr-2 font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {t('ContactForms.title', 'Contact Forms Management')}
                  </h1>
                  <p className="text-slate-600 ml-2 mr-2 dark:text-slate-400 mt-1">
                    {t('ContactForms.subtitle', 'Manage and respond to customer inquiries')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div>
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">{t('ContactForms.stats.total', 'Total')}</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-2xl">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div>
                  <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">{t('ContactForms.stats.pending', 'Pending')}</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.byStatus.pending || 0}</p>
                </div>
                <div className="p-3 bg-yellow-500 rounded-2xl">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-900/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div>
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">{t('ContactForms.stats.read', 'Read')}</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.byStatus.read || 0}</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-2xl">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div>
                  <p className="text-green-600 dark:text-green-400 text-sm font-medium">{t('ContactForms.stats.responded', 'Responded')}</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.byStatus.responded || 0}</p>
                </div>
                <div className="p-3 bg-green-500 rounded-2xl">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Tabs */}
        <Tabs defaultValue="contacts" className="space-y-8">
         
          
          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-6">
            {/* Filters and Search */}
            <Card className="border-none shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className={`flex flex-col md:flex-row gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
                  <div className="flex-1">
                    <div className="relative">
                      <Search className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} h-4 w-4 text-slate-400`} />
                      <Input
                        placeholder={t('ContactForms.search.placeholder', 'Search contacts...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={cn(
                          "h-12 transition-all duration-300 rounded-xl",
                          isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[200px] h-12 rounded-xl">
                        <SelectValue placeholder={t('ContactForms.filter.status', 'Filter by status')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('ContactForms.filter.all', 'All Status')}</SelectItem>
                        <SelectItem value="pending">{t('ContactForms.status.pending', 'Pending')}</SelectItem>
                        <SelectItem value="read">{t('ContactForms.status.read', 'Read')}</SelectItem>
                        <SelectItem value="responded">{t('ContactForms.status.responded', 'Responded')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contacts List */}
            {loading ? (
              <div className="flex justify-center p-12">
                <ContentLoader />
              </div>
            ) : (
              <div className="space-y-4">
                {contacts.length === 0 ? (
                  <Card className="border-none shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                      <MessageSquare className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                        {t('ContactForms.empty.title', 'No contact forms found')}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-500">
                        {t('ContactForms.empty.description', 'No contact forms match your current filters.')}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  contacts.map((contact, index) => {
                    const statusInfo = getStatusInfo(contact.status)
                    const StatusIcon = statusInfo.icon
                    
                    return (
                      <Card 
                        key={contact._id} 
                        className="border-none shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in fade-in-0 slide-in-from-bottom-2"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <CardContent className="p-6">
                          <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="flex-1">
                              <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                                    {contact.fullName}
                                  </h3>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {contact.email}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <p className="font-medium text-slate-800 dark:text-slate-200">
                                  {contact.subject}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                  {contact.message}
                                </p>
                                <div className={`flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                  <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(contact.createdAt)}
                                  </div>
                                  <Badge className={`${statusInfo.color} border-none`}>
                                    <StatusIcon className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                    {t(`ContactForms.status.${contact.status.toLowerCase()}`, contact.status)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                                  <DropdownMenuLabel>{t('ContactForms.actions.title', 'Actions')}</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(contact._id, 'read')}>
                                    <Eye className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                    {t('ContactForms.actions.markRead', 'Mark as Read')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(contact._id, 'responded')}>
                                    <Check className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                    {t('ContactForms.actions.markResponded', 'Mark as Responded')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(contact._id, 'pending')}>
                                    <Clock className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                    {t('ContactForms.actions.markPending', 'Mark as Pending')}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setContactToDelete(contact._id)
                                      setShowDeleteDialog(true)
                                    }}
                                    className="text-red-600 dark:text-red-400"
                                  >
                                    <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                    {t('ContactForms.actions.delete', 'Delete')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            )}

            {/* Pagination */}
            {contactsData?.data && contactsData.data.totalPages > 1 && (
              <div className={`flex justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl"
                >
                  {isRTL ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                </Button>
                <span className="flex items-center px-4 text-sm text-slate-600 dark:text-slate-400">
                  {t('ContactForms.pagination.page', 'Page')} {currentPage} {t('ContactForms.pagination.of', 'of')} {contactsData.data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(contactsData?.data?.totalPages || 1, prev + 1))}
                  disabled={currentPage === contactsData.data.totalPages}
                  className="rounded-xl"
                >
                  {isRTL ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </TabsContent>
          
       
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={`flex items-center text-red-600 dark:text-red-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Trash2 className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('ContactForms.delete.title', 'Delete Contact')}
            </DialogTitle>
            <DialogDescription>
              {t('ContactForms.delete.description', 'Are you sure you want to delete this contact? This action cannot be undone.')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="rounded-xl"
            >
              {t('ContactForms.delete.cancel', 'Cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteContact}
              disabled={deleteContactMutation.isPending}
              className="rounded-xl"
            >
              {deleteContactMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {t('ContactForms.delete.deleting', 'Deleting...')}
                </>
              ) : (
                <>
                  <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t('ContactForms.delete.confirm', 'Delete')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}