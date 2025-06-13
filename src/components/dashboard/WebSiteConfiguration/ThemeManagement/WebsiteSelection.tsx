import { Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { TFunction } from "i18next"

interface WebsiteSelectionProps {
  websites: any[]
  selectedWebsiteId: string
  onWebsiteChange: (websiteId: string) => void
  t: TFunction
}

export const WebsiteSelection = ({
  websites,
  selectedWebsiteId,
  onWebsiteChange,
  t
}: WebsiteSelectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {t('themeManagement.pageTitle', 'Theme Management')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="website-select">
              {t('themeManagement.websiteSelection.title', 'Select Website')}
            </Label>
            <Select value={selectedWebsiteId} onValueChange={onWebsiteChange}>
              <SelectTrigger id="website-select">
                <SelectValue placeholder={t('themeManagement.websiteSelection.placeholder', 'Choose a website')} />
              </SelectTrigger>
              <SelectContent>
                {websites.map((website) => (
                  <SelectItem key={website._id} value={website._id}>
                    {website.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}