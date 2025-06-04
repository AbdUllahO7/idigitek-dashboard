"use client"

import React, { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Skeleton } from "@/src/components/ui/skeleton"
import {  Loader2,  Save, AlertTriangle} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert"
import { Tabs,  TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { ActionButtonProps, CancelButtonProps, ErrorCardProps, InfoAlertProps, LanguageSelectorProps, LanguageTabsProps, LoadingDialogProps, MainFormCardProps, SuccessCardProps, WarningAlertProps, WarningCardProps } from "../api/types/utils/MainSectionComponents.types"
import { useTranslation } from "react-i18next"

// Icon imports
import {
  Car,
  MonitorSmartphone,
  Settings,
  CreditCard,
  Clock,
  MessageSquare,
  LineChart,
  Headphones,
  User,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Globe,
  Lock,
  Unlock,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Eye,
  EyeOff,
  Search,
  Filter,
  Edit,
  Trash,
  Plus,
  Minus,
  Check,
  X,
  Download,
  Upload,
  Share,
  Link,
  Copy,
  Bookmark,
  Tag,
  Folder,
  File,
  Image,
  Video,
  Music,
  Play,
  Pause,
  Volume,
  VolumeX,
  Sun,
  Moon,
  Bell,
  AlertCircle,
  Info,
} from "lucide-react";

// Loading Card Component
export function LoadingCard() {
  return (
    <Card className="overflow-hidden border-0 shadow-xl bg-white dark:bg-gray-900 rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle><Skeleton className="h-6 w-3/4 rounded-lg" /></CardTitle>
        <CardDescription><Skeleton className="h-4 w-1/2 rounded-lg mt-2" /></CardDescription>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-4 mt-5">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}

// Error Card Component
export function ErrorCard({ 
  errorMessage, 
  onRetry 
}: ErrorCardProps) {
  const { t } = useTranslation()
  
  const defaultErrorMessage = errorMessage || t('mainSectionComponents.errorCard.defaultMessage')
  
  return (
    <Card className="overflow-hidden border-0 shadow-xl bg-white dark:bg-gray-900 rounded-xl">
      <div className="bg-gradient-to-r from-red-50 to-red-50/70 dark:from-red-950/30 dark:to-red-950/10 px-1 py-1 rounded-t-xl">
        <CardHeader>
          <div className="flex items-center">
            <div className="bg-red-100 dark:bg-red-900/30 p-1.5 rounded-full mr-3">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
            </div>
            <CardTitle className="text-red-600 dark:text-red-400 font-semibold">{t('mainSectionComponents.errorCard.title')}</CardTitle>
          </div>
          <CardDescription className="text-red-500 dark:text-red-300 font-medium mt-2 ml-10">
            {defaultErrorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {onRetry && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="outline" 
                className="bg-white/80 text-red-600 border-red-200 hover:bg-red-50 dark:bg-gray-900/80 dark:border-red-800/50 dark:text-red-400 dark:hover:bg-red-950/30 transition-all duration-200 rounded-lg font-medium shadow-sm" 
                onClick={onRetry}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                {t('mainSectionComponents.errorCard.tryAgain')}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </div>
    </Card>
  )
}

// Warning Card Component
export function WarningCard({ title, message }: WarningCardProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-xl bg-white dark:bg-gray-900 rounded-xl">
      <div className="bg-gradient-to-r from-amber-50 to-amber-50/70 dark:from-amber-950/30 dark:to-amber-950/10 px-1 py-1 rounded-t-xl">
        <CardHeader>
          <div className="flex items-center">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-full mr-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            </div>
            <CardTitle className="text-amber-600 dark:text-amber-400 font-semibold">{title}</CardTitle>
          </div>
          <CardDescription className="text-amber-500 dark:text-amber-300 font-medium mt-2 ml-10">
            {message}
          </CardDescription>
        </CardHeader>
      </div>
    </Card>
  )
}

// Success Card Component
export function SuccessCard({ 
  title, 
  description, 
  onEdit 
}: SuccessCardProps) {
  const { t } = useTranslation()
  
  return (
    <Card className="overflow-hidden border-0 shadow-xl bg-white dark:bg-gray-900 rounded-xl">
      <div className="bg-gradient-to-r from-emerald-50 to-green-50/70 dark:from-emerald-950/30 dark:to-green-950/10 px-1 py-1 rounded-t-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-full mr-3">
                <Check className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-emerald-600 dark:text-emerald-400 font-semibold">{title}</CardTitle>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/80 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:bg-gray-900/80 dark:border-emerald-800/50 dark:text-emerald-400 dark:hover:bg-emerald-950/30 transition-all duration-200 rounded-lg font-medium shadow-sm" 
                onClick={onEdit}
              >
                <Edit className="h-4 w-4 mr-2" />
                {t('mainSectionComponents.successCard.editContent')}
              </Button>
            </motion.div>
          </div>
          <CardDescription className="text-emerald-500 dark:text-emerald-300 font-medium mt-2 ml-10">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white/80 dark:bg-gray-900/80 rounded-xl p-5 mx-3 mb-3 border border-emerald-100 dark:border-emerald-900/50 shadow-sm">
        </CardContent>
      </div>
    </Card>
  )
}

// Warning Alert Component
export function WarningAlert({ title, message }: WarningAlertProps) {
  return (
    <Alert className="mb-6 border-0 shadow-lg bg-gradient-to-r from-amber-50 to-amber-50/70 dark:from-amber-950/30 dark:to-amber-950/10 rounded-xl">
      <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-full mr-2">
        <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
      </div>
      <AlertTitle className="text-amber-600 dark:text-amber-400 font-medium">{title}</AlertTitle>
      <AlertDescription className="text-amber-600 dark:text-amber-300 mt-1">{message}</AlertDescription>
    </Alert>
  )
}

// Info Alert Component
export function InfoAlert({ title, message }: InfoAlertProps) {
  return (
    <Alert className="mb-6 border-0 shadow-lg bg-gradient-to-r from-sky-50 to-blue-50/70 dark:from-sky-950/30 dark:to-blue-950/10 rounded-xl">
      <div className="bg-sky-100 dark:bg-sky-900/30 p-1.5 rounded-full mr-2">
        <Info className="h-4 w-4 text-sky-500 dark:text-sky-400" />
      </div>
      <AlertTitle className="text-sky-600 dark:text-sky-400 font-medium">{title}</AlertTitle>
      <AlertDescription className="text-sky-600 dark:text-sky-300 mt-1">{message}</AlertDescription>
    </Alert>
  )
}

// Language Selector Component
export function LanguageSelector({ languages }: LanguageSelectorProps) {
  const { t } = useTranslation()
  
  return (
    <div className="mb-6 bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-lg">
      <h3 className="text-sm font-medium mb-4 flex items-center text-gray-700 dark:text-gray-300">
        <div className="bg-sky-100 dark:bg-sky-900/30 p-1.5 rounded-full mr-2">
          <Globe className="h-4 w-4 text-sky-500 dark:text-sky-400" />
        </div>
        {t('mainSectionComponents.languageSelector.activeLanguages')}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {languages.map(lang => (
          <motion.div 
            key={lang._id}
            whileHover={{ scale: 1.03 }}
            className="flex items-center bg-gray-50 dark:bg-gray-800 p-2.5 px-3.5 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2.5 shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {lang.name || lang.language} {lang.isDefault && (
                <span className="text-xs bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300 px-1.5 py-0.5 rounded-md ml-1.5 font-semibold">
                  {t('mainSectionComponents.languageSelector.default')}
                </span>
              )}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Action Button Component
export function ActionButton({ 
  isLoading,
  isCreating, 
  isCreatingElements, 
  isUpdating, 
  exists, 
  onClick,
  disabled = false,
  className = "w-full mt-6"
}: ActionButtonProps) {
  const { t } = useTranslation()
  const isProcessing = isLoading || isCreating || isCreatingElements || isUpdating;
  
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button 
        onClick={onClick}
        disabled={disabled || isProcessing}
        className={`${className} relative overflow-hidden transition-all duration-300 ${
          exists 
            ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 dark:from-emerald-600 dark:to-green-600 dark:hover:from-emerald-700 dark:hover:to-green-700' 
            : 'bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 dark:from-sky-600 dark:to-blue-600 dark:hover:from-sky-700 dark:hover:to-blue-700'
        } text-white font-medium shadow-lg hover:shadow-xl rounded-lg py-2.5`}
      >
        {isProcessing && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
            <Loader2 className="h-5 w-5 animate-spin text-white/90" />
          </span>
        )}
        
        <span className={`flex items-center justify-center ${isProcessing ? 'opacity-0' : 'opacity-100'}`}>
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('mainSectionComponents.actionButton.creatingSubsection')}
            </>
          ) : isCreatingElements ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('mainSectionComponents.actionButton.creatingElements')}
            </>
          ) : isUpdating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('mainSectionComponents.actionButton.updatingContent')}
            </>
          ) : exists ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t('mainSectionComponents.actionButton.saveChanges')}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              {t('mainSectionComponents.actionButton.createMainSubsection')}
            </>
          )}
        </span>
      </Button>
    </motion.div>
  )
}

// Cancel Button Component
export function CancelButton({ 
  onClick, 
  className = "w-full mt-3" 
}: CancelButtonProps) {
  const { t } = useTranslation()
  
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button 
        variant="outline" 
        onClick={onClick} 
        className={`${className} border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 rounded-lg shadow-sm`}
      >
        {t('mainSectionComponents.cancelButton.cancel')}
      </Button>
    </motion.div>
  )
}

// Language Tabs Container
export function LanguageTabs({ 
  activeTab, 
  setActiveTab, 
  languages,
  children 
}: LanguageTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl w-full flex">
        {languages.map(lang => (
          <TabsTrigger 
            key={lang.languageID} 
            value={lang.languageID}
            className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-md transition-all rounded-lg py-2"
          >
            {lang.isDefault && <div className="w-2.5 h-2.5 bg-sky-500 rounded-full mr-2 inline-block shadow-sm shadow-sky-200 dark:shadow-sky-900/30"></div>}
            {lang.name || lang.language}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-lg">
        {children}
      </div>
    </Tabs>
  )
}

// Main Form Card
export function MainFormCard({ 
  title, 
  description, 
  children 
}: MainFormCardProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-xl bg-white dark:bg-gray-900 rounded-xl">
      <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-gray-50/70 dark:from-gray-800/50 dark:to-gray-800/30 rounded-t-xl">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400 mt-1.5">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  )
}

// Loading Dialog Component
export const LoadingDialog = ({ isOpen, title, description } : LoadingDialogProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Icon Component
export const IconComponent = ({ iconName }: { iconName: IconNames }) => {
  const icons = {
    Car: <Car className="h-4 w-4" />,
    MonitorSmartphone: <MonitorSmartphone className="h-4 w-4" />,
    Settings: <Settings className="h-4 w-4" />,
    CreditCard: <CreditCard className="h-4 w-4" />,
    Clock: <Clock className="h-4 w-4" />,
    MessageSquare: <MessageSquare className="h-4 w-4" />,
    LineChart: <LineChart className="h-4 w-4" />,
    Headphones: <Headphones className="h-4 w-4" />,
    User: <User className="h-4 w-4" />,
    Calendar: <Calendar className="h-4 w-4" />,
    Mail: <Mail className="h-4 w-4" />,
    Phone: <Phone className="h-4 w-4" />,
    MapPin: <MapPin className="h-4 w-4" />,
    Globe: <Globe className="h-4 w-4" />,
    Lock: <Lock className="h-4 w-4" />,
    Unlock: <Unlock className="h-4 w-4" />,
    Star: <Star className="h-4 w-4" />,
    Heart: <Heart className="h-4 w-4" />,
    ThumbsUp: <ThumbsUp className="h-4 w-4" />,
    ThumbsDown: <ThumbsDown className="h-4 w-4" />,
    Eye: <Eye className="h-4 w-4" />,
    EyeOff: <EyeOff className="h-4 w-4" />,
    Search: <Search className="h-4 w-4" />,
    Filter: <Filter className="h-4 w-4" />,
    Edit: <Edit className="h-4 w-4" />,
    Trash: <Trash className="h-4 w-4" />,
    Plus: <Plus className="h-4 w-4" />,
    Minus: <Minus className="h-4 w-4" />,
    Check: <Check className="h-4 w-4" />,
    X: <X className="h-4 w-4" />,
    Download: <Download className="h-4 w-4" />,
    Upload: <Upload className="h-4 w-4" />,
    Share: <Share className="h-4 w-4" />,
    Link: <Link className="h-4 w-4" />,
    Copy: <Copy className="h-4 w-4" />,
    Bookmark: <Bookmark className="h-4 w-4" />,
    Tag: <Tag className="h-4 w-4" />,
    Folder: <Folder className="h-4 w-4" />,
    File: <File className="h-4 w-4" />,
    Image: <Image className="h-4 w-4" />,
    Video: <Video className="h-4 w-4" />,
    Music: <Music className="h-4 w-4" />,
    Play: <Play className="h-4 w-4" />,
    Pause: <Pause className="h-4 w-4" />,
    Volume: <Volume className="h-4 w-4" />,
    VolumeX: <VolumeX className="h-4 w-4" />,
    Sun: <Sun className="h-4 w-4" />,
    Moon: <Moon className="h-4 w-4" />,
    Bell: <Bell className="h-4 w-4" />,
    AlertCircle: <AlertCircle className="h-4 w-4" />,
    Info: <Info className="h-4 w-4" />,
  };

  return icons[iconName] || <Car className="h-4 w-4" />;
};

export type IconNames =
  | 'Car'
  | 'MonitorSmartphone'
  | 'Settings'
  | 'CreditCard'
  | 'Clock'
  | 'MessageSquare'
  | 'LineChart'
  | 'Headphones'
  | 'User'
  | 'Calendar'
  | 'Mail'
  | 'Phone'
  | 'MapPin'
  | 'Globe'
  | 'Lock'
  | 'Unlock'
  | 'Star'
  | 'Heart'
  | 'ThumbsUp'
  | 'ThumbsDown'
  | 'Eye'
  | 'EyeOff'
  | 'Search'
  | 'Filter'
  | 'Edit'
  | 'Trash'
  | 'Plus'
  | 'Minus'
  | 'Check'
  | 'X'
  | 'Download'
  | 'Upload'
  | 'Share'
  | 'Link'
  | 'Copy'
  | 'Bookmark'
  | 'Tag'
  | 'Folder'
  | 'File'
  | 'Image'
  | 'Video'
  | 'Music'
  | 'Play'
  | 'Pause'
  | 'Volume'
  | 'VolumeX'
  | 'Sun'
  | 'Moon'
  | 'Bell'
  | 'AlertCircle'
  | 'Info';