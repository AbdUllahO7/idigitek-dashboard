import { motion } from "framer-motion"
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/src/components/ui/button"

interface ModernErrorProps {
    error: any
    onRetry: () => void
}

export const ModernLoader = () => (
    <div className="min-h-[400px] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 rounded-3xl" />
        <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-2xl animate-pulse delay-1000" />
        </div>
        
        <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center gap-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/50 shadow-xl"
        >
        <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 blur-xl opacity-50 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Loading Sections
            </h3>
            <p className="text-slate-600 dark:text-slate-400">Fetching your website structure...</p>
        </div>
        </motion.div>
    </div>
)

export const ModernError = ({ error, onRetry }: ModernErrorProps) => (
    <div className="min-h-[400px] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-slate-950 dark:via-red-950 dark:to-orange-950 rounded-3xl" />
        
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center gap-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/50 shadow-xl"
        >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-xl">
            <AlertTriangle className="h-8 w-8 text-white" />
        </div>
        <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400">
            Error Loading Sections
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
            {error?.message || "Failed to fetch sections"}
            </p>
        </div>
        <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
        </Button>
        </motion.div>
    </div>
)