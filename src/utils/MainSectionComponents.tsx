"use client"

import React, { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Skeleton } from "@/src/components/ui/skeleton"
import {  Loader2, AlertTriangle} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert"
import { Tabs,  TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { ActionButtonProps, CancelButtonProps, ErrorCardProps, InfoAlertProps, LanguageSelectorProps, LanguageTabsProps, LoadingDialogProps, MainFormCardProps, SuccessCardProps, WarningAlertProps, WarningCardProps } from "../api/types/utils/MainSectionComponents.types"
import { useTranslation } from "react-i18next"

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
  
  const defaultErrorMessage = errorMessage || t('mainSectionComponents.couldNotLoad')
  
  return (
    <Card className="overflow-hidden border-0 shadow-xl bg-white dark:bg-gray-900 rounded-xl">
      <div className="bg-gradient-to-r from-red-50 to-red-50/70 dark:from-red-950/30 dark:to-red-950/10 px-1 py-1 rounded-t-xl">
        <CardHeader>
          <div className="flex items-center">
            <div className="bg-red-100 dark:bg-red-900/30 p-1.5 rounded-full mr-3">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
            </div>
            <CardTitle className="text-red-600 dark:text-red-400 font-semibold">
              {t('mainSectionComponents.errorTitle')}
            </CardTitle>
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
                {t('mainSectionComponents.tryAgain')}
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
  const { t } = useTranslation()
  
  return (
    <Card className="overflow-hidden border-0 shadow-xl bg-white dark:bg-gray-900 rounded-xl">
      <div className="bg-gradient-to-r from-amber-50 to-amber-50/70 dark:from-amber-950/30 dark:to-amber-950/10 px-1 py-1 rounded-t-xl">
        <CardHeader>
          <div className="flex items-center">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-full mr-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            </div>
            <CardTitle className="text-amber-600 dark:text-amber-400 font-semibold">
              {title || t('mainSectionComponents.warningTitle')}
            </CardTitle>
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
              <CardTitle className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {title || t('mainSectionComponents.successTitle')}
              </CardTitle>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/80 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:bg-gray-900/80 dark:border-emerald-800/50 dark:text-emerald-400 dark:hover:bg-emerald-950/30 transition-all duration-200 rounded-lg font-medium shadow-sm" 
                onClick={onEdit}
              >
                <Edit className="h-4 w-4 mr-2" />
                {t('mainSectionComponents.editContent')}
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
  const { t } = useTranslation()
  
  return (
    <Alert className="mb-6 border-0 shadow-lg bg-gradient-to-r from-amber-50 to-amber-50/70 dark:from-amber-950/30 dark:to-amber-950/10 rounded-xl">
      <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-full mr-2">
        <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
      </div>
      <AlertTitle className="text-amber-600 dark:text-amber-400 font-medium">
        {title || t('mainSectionComponents.warningTitle')}
      </AlertTitle>
      <AlertDescription className="text-amber-600 dark:text-amber-300 mt-1">
        {message}
      </AlertDescription>
    </Alert>
  )
}

// Info Alert Component
export function InfoAlert({ title, message }: InfoAlertProps) {
  const { t } = useTranslation()
  
  return (
    <Alert className="mb-6 border-0 shadow-lg bg-gradient-to-r from-sky-50 to-blue-50/70 dark:from-sky-950/30 dark:to-blue-950/10 rounded-xl">
      <div className="bg-sky-100 dark:bg-sky-900/30 p-1.5 rounded-full mr-2">
        <Info className="h-4 w-4 text-sky-500 dark:text-sky-400" />
      </div>
      <AlertTitle className="text-sky-600 dark:text-sky-400 font-medium">
        {title || t('mainSectionComponents.infoTitle')}
      </AlertTitle>
      <AlertDescription className="text-sky-600 dark:text-sky-300 mt-1">
        {message}
      </AlertDescription>
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
        {t('mainSectionComponents.activeLanguages')}
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
                  {t('mainSectionComponents.defaultLanguage')}
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
              {t('mainSectionComponents.creatingSubsection')}
            </>
          ) : isCreatingElements ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('mainSectionComponents.creatingContentElements')}
            </>
          ) : isUpdating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('mainSectionComponents.updatingContent')}
            </>
          ) : exists ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t('mainSectionComponents.saveChanges')}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              {t('mainSectionComponents.createMainSubsection')}
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
        {t('mainSectionComponents.cancel')}
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
  const { t } = useTranslation()
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl w-full flex">
        {languages.map(lang => (
          <TabsTrigger 
            key={lang.languageID} 
            value={lang.languageID}
            className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-md transition-all rounded-lg py-2"
          >
            {lang.isDefault && (
              <div className="w-2.5 h-2.5 bg-sky-500 rounded-full mr-2 inline-block shadow-sm shadow-sky-200 dark:shadow-sky-900/30"></div>
            )}
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
  const { t } = useTranslation()
  
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title || t('mainSectionComponents.loading')}</DialogTitle>
          <DialogDescription>{description || t('mainSectionComponents.pleaseWait')}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Icon mapping component to render the actual icons
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
  // 100 Newly added icons
  Home,
  Menu,
  ShoppingCart,
  Package,
  Users,
  BarChart,
  PieChart,
  Activity,
  Gift,
  Camera,
  Mic,
  Send,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  LogIn,
  LogOut,
  Shield,
  Briefcase,
  DollarSign,
  Percent,
  ShoppingBag,
  Scissors,
  Paperclip,
  Flag,
  Clock3,
  Battery,
  Wifi,
  Bluetooth,
  Cloud,
  Archive,
  Award,
  Book,
  Box,
  Building,
  CameraOff,
  CheckCircle,
  Circle,
  Clipboard,
  Code,
  Database,
  Feather,
  FileText,
  Grid,
  HelpCircle,
  Inbox,
  Key,
  Layers,
  LifeBuoy,
  Map,
  Maximize,
  Minimize,
  PenTool,
  Printer,
  Save,
  Server,
  Sliders,
  Table,
  Terminal,
  Thermometer,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  TrendingDown,
  UserCheck,
  UserMinus,
  UserPlus,
  Watch,
  Airplay,
  Anchor,
  Aperture,
  AtSign,
  BarChart2,
  BatteryCharging,
  BellOff,
  BookOpen,
  Cast,
  CheckSquare,
  CloudOff,
  Coffee,
  CornerDownLeft,
  CornerDownRight,
  Cpu,
  Crosshair,
  Disc,
  FileMinus,
  FilePlus,
  GitBranch,
  GitCommit,
  HardDrive,
  Hash,
  Hexagon,
} from "lucide-react";

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
    Home: <Home className="h-4 w-4" />,
    Menu: <Menu className="h-4 w-4" />,
    ShoppingCart: <ShoppingCart className="h-4 w-4" />,
    Package: <Package className="h-4 w-4" />,
    Users: <Users className="h-4 w-4" />,
    BarChart: <BarChart className="h-4 w-4" />,
    PieChart: <PieChart className="h-4 w-4" />,
    Activity: <Activity className="h-4 w-4" />,
    Gift: <Gift className="h-4 w-4" />,
    Camera: <Camera className="h-4 w-4" />,
    Mic: <Mic className="h-4 w-4" />,
    Send: <Send className="h-4 w-4" />,
    RefreshCw: <RefreshCw className="h-4 w-4" />,
    ChevronUp: <ChevronUp className="h-4 w-4" />,
    ChevronDown: <ChevronDown className="h-4 w-4" />,
    ChevronLeft: <ChevronLeft className="h-4 w-4" />,
    ChevronRight: <ChevronRight className="h-4 w-4" />,
    ArrowUp: <ArrowUp className="h-4 w-4" />,
    ArrowDown: <ArrowDown className="h-4 w-4" />,
    ArrowLeft: <ArrowLeft className="h-4 w-4" />,
    ArrowRight: <ArrowRight className="h-4 w-4" />,
    ExternalLink: <ExternalLink className="h-4 w-4" />,
    LogIn: <LogIn className="h-4 w-4" />,
    LogOut: <LogOut className="h-4 w-4" />,
    Shield: <Shield className="h-4 w-4" />,
    Briefcase: <Briefcase className="h-4 w-4" />,
    DollarSign: <DollarSign className="h-4 w-4" />,
    Percent: <Percent className="h-4 w-4" />,
    ShoppingBag: <ShoppingBag className="h-4 w-4" />,
    Scissors: <Scissors className="h-4 w-4" />,
    Paperclip: <Paperclip className="h-4 w-4" />,
    Flag: <Flag className="h-4 w-4" />,
    Clock3: <Clock3 className="h-4 w-4" />,
    Battery: <Battery className="h-4 w-4" />,
    Wifi: <Wifi className="h-4 w-4" />,
    Bluetooth: <Bluetooth className="h-4 w-4" />,
    Cloud: <Cloud className="h-4 w-4" />,
    Archive: <Archive className="h-4 w-4" />,
    Award: <Award className="h-4 w-4" />,
    Book: <Book className="h-4 w-4" />,
    Box: <Box className="h-4 w-4" />,
    Building: <Building className="h-4 w-4" />,
    CameraOff: <CameraOff className="h-4 w-4" />,
    CheckCircle: <CheckCircle className="h-4 w-4" />,
    Circle: <Circle className="h-4 w-4" />,
    Clipboard: <Clipboard className="h-4 w-4" />,
    Code: <Code className="h-4 w-4" />,
    Database: <Database className="h-4 w-4" />,
    Feather: <Feather className="h-4 w-4" />,
    FileText: <FileText className="h-4 w-4" />,
    Grid: <Grid className="h-4 w-4" />,
    HelpCircle: <HelpCircle className="h-4 w-4" />,
    Inbox: <Inbox className="h-4 w-4" />,
    Key: <Key className="h-4 w-4" />,
    Layers: <Layers className="h-4 w-4" />,
    LifeBuoy: <LifeBuoy className="h-4 w-4" />,
    Map: <Map className="h-4 w-4" />,
    Maximize: <Maximize className="h-4 w-4" />,
    Minimize: <Minimize className="h-4 w-4" />,
    PenTool: <PenTool className="h-4 w-4" />,
    Printer: <Printer className="h-4 w-4" />,
    Save: <Save className="h-4 w-4" />,
    Server: <Server className="h-4 w-4" />,
    Sliders: <Sliders className="h-4 w-4" />,
    Table: <Table className="h-4 w-4" />,
    Terminal: <Terminal className="h-4 w-4" />,
    Thermometer: <Thermometer className="h-4 w-4" />,
    ToggleLeft: <ToggleLeft className="h-4 w-4" />,
    ToggleRight: <ToggleRight className="h-4 w-4" />,
    TrendingUp: <TrendingUp className="h-4 w-4" />,
    TrendingDown: <TrendingDown className="h-4 w-4" />,
    UserCheck: <UserCheck className="h-4 w-4" />,
    UserMinus: <UserMinus className="h-4 w-4" />,
    UserPlus: <UserPlus className="h-4 w-4" />,
    Watch: <Watch className="h-4 w-4" />,
    Airplay: <Airplay className="h-4 w-4" />,
    Anchor: <Anchor className="h-4 w-4" />,
    Aperture: <Aperture className="h-4 w-4" />,
    AtSign: <AtSign className="h-4 w-4" />,
    BarChart2: <BarChart2 className="h-4 w-4" />,
    BatteryCharging: <BatteryCharging className="h-4 w-4" />,
    BellOff: <BellOff className="h-4 w-4" />,
    BookOpen: <BookOpen className="h-4 w-4" />,
    Cast: <Cast className="h-4 w-4" />,
    CheckSquare: <CheckSquare className="h-4 w-4" />,
    CloudOff: <CloudOff className="h-4 w-4" />,
    Coffee: <Coffee className="h-4 w-4" />,
    CornerDownLeft: <CornerDownLeft className="h-4 w-4" />,
    CornerDownRight: <CornerDownRight className="h-4 w-4" />,
    Cpu: <Cpu className="h-4 w-4" />,
    Crosshair: <Crosshair className="h-4 w-4" />,
    Disc: <Disc className="h-4 w-4" />,
    FileMinus: <FileMinus className="h-4 w-4" />,
    FilePlus: <FilePlus className="h-4 w-4" />,
    GitBranch: <GitBranch className="h-4 w-4" />,
    GitCommit: <GitCommit className="h-4 w-4" />,
    HardDrive: <HardDrive className="h-4 w-4" />,
    Hash: <Hash className="h-4 w-4" />,
    Hexagon: <Hexagon className="h-4 w-4" />,
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
  | 'Info'
  | 'Home'
  | 'Menu'
  | 'ShoppingCart'
  | 'Package'
  | 'Users'
  | 'BarChart'
  | 'PieChart'
  | 'Activity'
  | 'Gift'
  | 'Camera'
  | 'Mic'
  | 'Send'
  | 'RefreshCw'
  | 'ChevronUp'
  | 'ChevronDown'
  | 'ChevronLeft'
  | 'ChevronRight'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'ExternalLink'
  | 'LogIn'
  | 'LogOut'
  | 'Shield'
  | 'Briefcase'
  | 'DollarSign'
  | 'Percent'
  | 'ShoppingBag'
  | 'Scissors'
  | 'Paperclip'
  | 'Flag'
  | 'Clock3'
  | 'Battery'
  | 'Wifi'
  | 'Bluetooth'
  | 'Cloud'
  | 'Archive'
  | 'Award'
  | 'Book'
  | 'Box'
  | 'Building'
  | 'CameraOff'
  | 'CheckCircle'
  | 'Circle'
  | 'Clipboard'
  | 'Code'
  | 'Database'
  | 'Feather'
  | 'FileText'
  | 'Grid'
  | 'HelpCircle'
  | 'Inbox'
  | 'Key'
  | 'Layers'
  | 'LifeBuoy'
  | 'Map'
  | 'Maximize'
  | 'Minimize'
  | 'PenTool'
  | 'Printer'
  | 'Save'
  | 'Server'
  | 'Sliders'
  | 'Table'
  | 'Terminal'
  | 'Thermometer'
  | 'ToggleLeft'
  | 'ToggleRight'
  | 'TrendingUp'
  | 'TrendingDown'
  | 'UserCheck'
  | 'UserMinus'
  | 'UserPlus'
  | 'Watch'
  | 'Airplay'
  | 'Anchor'
  | 'Aperture'
  | 'AtSign'
  | 'BarChart2'
  | 'BatteryCharging'
  | 'BellOff'
  | 'BookOpen'
  | 'Cast'
  | 'CheckSquare'
  | 'CloudOff'
  | 'Coffee'
  | 'CornerDownLeft'
  | 'CornerDownRight'
  | 'Cpu'
  | 'Crosshair'
  | 'Disc'
  | 'FileMinus'
  | 'FilePlus'
  | 'GitBranch'
  | 'GitCommit'
  | 'HardDrive'
  | 'Hash'
  | 'Hexagon';