"use client"

import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Button } from "@/src/components/ui/button"
import { Edit, Trash, Search, ArrowUpDown, Filter, Eye } from "lucide-react"

// Column definition interface
export interface ColumnDefinition {
  header: string
  accessor: string
  cell?: (item: any, value: any) => React.ReactNode
  className?: string
  sortable?: boolean
}

// Generic table props
interface GenericTableProps {
  columns: ColumnDefinition[]
  data: any[]
  onEdit?: (id: string) => void
  onDelete?: (id: string, name: string) => void
  onView?: (id: string) => void
  keyField?: string
  actionColumn?: boolean
  actionColumnHeader?: string
  title?: string
  subtitle?: string
  emptyMessage?: string
  loading?: boolean
}

export function GenericTable({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  keyField = "_id",
  actionColumn = true,
  actionColumnHeader = "Actions",
  title,
  subtitle,
  emptyMessage = "No data available",
  loading = false
}: GenericTableProps) {
  // Function to safely get nested property values
  const getValueByPath = (obj: any, path: string) => {
    const keys = path.split('.')
    return keys.reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : null, obj)
  }

  return (
    <div className="space-y-4">
      {/* Table header with title and optional search */}
      {(title || subtitle) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
          <div className="flex space-x-2">
            {/* Example filter buttons - can be customized based on needs */}
            <Button variant="outline" size="sm" className="hidden sm:flex items-center h-8 px-2 text-xs">
              <Filter className="h-3.5 w-3.5 mr-1" />
              Filter
            </Button>
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="h-8 w-full sm:w-[180px] pl-8 pr-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-800">
            <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              {columns.map((column, index) => (
                <TableHead 
                  key={index} 
                  className={`${column.className || ''} ${column.sortable ? 'cursor-pointer select-none' : ''} text-gray-700 dark:text-gray-300 font-medium text-sm`}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && <ArrowUpDown className="h-3.5 w-3.5 ml-1 text-gray-500" />}
                  </div>
                </TableHead>
              ))}
              {actionColumn && (onEdit || onDelete || onView) && (
                <TableHead className="text-right text-gray-700 dark:text-gray-300 font-medium text-sm">{actionColumnHeader}</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading state
              Array(3).fill(0).map((_, rowIndex) => (
                <TableRow key={`loading-${rowIndex}`} className="animate-pulse border-b border-gray-100 dark:border-gray-800">
                  {columns.map((_, colIndex) => (
                    <TableCell key={`loading-cell-${rowIndex}-${colIndex}`} className="py-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </TableCell>
                  ))}
                  {actionColumn && (onEdit || onDelete || onView) && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (actionColumn ? 1 : 0)} 
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                    <p className="font-medium">{emptyMessage}</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Try changing your search or filter criteria</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              data.map((item, rowIndex) => (
                <TableRow 
                  key={item[keyField]} 
                  className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                    rowIndex === data.length - 1 ? '' : 'border-b border-gray-100 dark:border-gray-800'
                  }`}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell 
                      key={`${item[keyField]}-${colIndex}`} 
                      className={`${column.className || ''} py-3 text-sm`}
                    >
                      {column.cell
                        ? column.cell(item, getValueByPath(item, column.accessor))
                        : getValueByPath(item, column.accessor)}
                    </TableCell>
                  ))}
                  {actionColumn && (onEdit || onDelete || onView) && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onView(item[keyField])}
                            title={`View ${item.name || 'item'}`}
                            className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(item[keyField])}
                            title={`Edit ${item.name || 'item'}`}
                            className="h-8 w-8 text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(item[keyField], item.name || 'item')}
                            title={`Delete ${item.name || 'item'}`}
                            className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination example - can be implemented as needed */}
      {data.length > 0 && (
        <div className="flex justify-between items-center py-4 px-4 space-y-6 space">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium text-gray-900 dark:text-gray-100">{data.length}</span> results
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-8 px-3 text-xs" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="h-8 px-3 text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800">1</Button>
            <Button variant="outline" size="sm" className="h-8 px-3 text-xs">2</Button>
            <Button variant="outline" size="sm" className="h-8 px-3 text-xs">3</Button>
            <Button variant="outline" size="sm" className="h-8 px-3 text-xs">Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced cell renderers
export const StatusCell = (item: any, value: boolean) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      value
        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
    }`}
  >
    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${value ? "bg-green-500" : "bg-red-500"}`}></span>
    {value ? "Active" : "Inactive"}
  </span>
)

export const CountBadgeCell = (item: any, value: number) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
    {value || 0}
  </span>
)

export const PriorityCell = (item: any, value: string) => {
  const priorities = {
    high: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", darkBg: "dark:bg-red-900/30", darkText: "dark:text-red-400", darkBorder: "dark:border-red-800" },
    medium: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", darkBg: "dark:bg-amber-900/30", darkText: "dark:text-amber-400", darkBorder: "dark:border-amber-800" },
    low: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", darkBg: "dark:bg-green-900/30", darkText: "dark:text-green-400", darkBorder: "dark:border-green-800" },
  }
  
  const priority = priorities[value?.toLowerCase() as keyof typeof priorities] || priorities.medium
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priority.bg} ${priority.text} ${priority.darkBg} ${priority.darkText} border ${priority.border} ${priority.darkBorder}`}>
      {value || "Medium"}
    </span>
  )
}

export const DateCell = (item: any, value: string) => {
  if (!value) return "-"
  const date = new Date(value)
  return date.toLocaleDateString()
}

export const TruncatedCell = (item: any, value: string) => {
  if (!value) return "-"
  return (
    <div className="max-w-xs truncate" title={value}>
      {value}
    </div>
  )
}

export const BooleanCell = (item: any, value: boolean) => (
  <div className={`w-4 h-4 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
)