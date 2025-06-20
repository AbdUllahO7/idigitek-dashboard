import { Checkbox } from "@/src/components/ui/checkbox"
import { CountBadgeCell, StatusCell, TruncatedCell } from "@/src/components/dashboard/MainSections/GenericTable"

export const createTeamColumns = (
  t: any,
  isTeamInNavigation: (teamItemId: string) => boolean,
  onNavigationToggle: (teamItem: any, isChecked: boolean) => Promise<void>,
  processingNavigation: string | null,
  hasNavigationSubSection: boolean
) => [
  {
    header: t('teamManagement.navigation', 'Navigation'),
    accessor: "inNavigation",
    cell: (item: any) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={isTeamInNavigation(item._id)}
          onCheckedChange={async (checked) => {
            try {
              await onNavigationToggle(item, checked as boolean)
            } catch (error) {
              // Error is already handled in the hook
            }
          }}
          disabled={processingNavigation === item._id || !hasNavigationSubSection}
          className="h-4 w-4"
        />
        {processingNavigation === item._id && (
          <div className="ml-2 h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        )}
      </div>
    ),
    className: "w-20 text-center"
  },
  {
    header: t('teamManagement.name'),
    accessor: "name",
    className: "font-medium"
  },
  {
    header: t('teamManagement.description'),
    accessor: "description", 
    cell: TruncatedCell
  },
  {
    header: t('teamManagement.status'),
    accessor: "isActive",
    cell: (item: any, value: boolean) => (
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          {StatusCell(item, value)}
          {item.isMain && (
            <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {t('teamManagement.main')}
            </span>
          )}
        </div>
      </div>
    )
  },
  {
    header: t('teamManagement.order'),
    accessor: "order"
  },
  {
    header: t('teamManagement.subsections'),
    accessor: "subsections.length",
    cell: CountBadgeCell
  }
]