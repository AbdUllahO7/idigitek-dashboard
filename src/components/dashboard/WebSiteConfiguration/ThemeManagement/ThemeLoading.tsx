import { motion } from "framer-motion"
import { Palette } from "lucide-react"
import { Card, CardContent } from "@/src/components/ui/card"
import { TFunction } from "i18next"

interface ThemeLoadingProps {
  t: TFunction
}

interface NoWebsiteProps {
  t: TFunction
}

export const ThemeLoading = ({ t }: ThemeLoadingProps) => (
  <Card className="w-full">
    <CardContent className="flex flex-col items-center justify-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1 }}
        className="h-16 w-16 text-slate-400 mb-4"
      >
        <Palette />
      </motion.div>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
        {t('themeManagement.states.loading.title', 'Loading Themes')}
      </h3>
    </CardContent>
  </Card>
)

export const NoWebsite = ({ t }: NoWebsiteProps) => (
  <Card className="w-full">
    <CardContent className="flex flex-col items-center justify-center py-12">
      <Palette className="h-16 w-16 text-slate-400 mb-4" />
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
        {t('themeManagement.states.noWebsite.title', 'No Website Selected')}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
        {t('themeManagement.states.noWebsite.description', 'Please create or select a website to manage themes')}
      </p>
    </CardContent>
  </Card>
)