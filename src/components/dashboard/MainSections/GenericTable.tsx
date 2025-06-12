"use client"

import React, { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Button } from "@/src/components/ui/button"
import { 
  Edit, 
  Trash, 
  Search, 
  ArrowUpDown, 
  Filter, 
  Eye,
  Grid,
  List,
  LayoutGrid,
  MoreVertical,
  Sparkles,
  Database,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/src/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/src/components/ui/dropdown-menu"

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
  actionColumnHeader,
  title,
  subtitle,
  emptyMessage,
  loading = false
}: GenericTableProps) {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'list'>('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Use translations for default values
  const defaultActionColumnHeader = actionColumnHeader || t('GenericTable.actionsHeader', 'Actions')
  const defaultEmptyMessage = emptyMessage || t('GenericTable.emptyMessage', 'No data available')

  // Function to safely get nested property values
  const getValueByPath = (obj: any, path: string) => {
    const keys = path.split('.')
    return keys.reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : null, obj)
  }

  // Filter data based on search term
  const filteredData = data.filter(item => 
    columns.some(column => {
      const value = getValueByPath(item, column.accessor)
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    })
  )

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  // Action Dropdown Component
  const ActionDropdown = ({ item }: { item: any }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        {onView && (
          <DropdownMenuItem 
            onClick={() => onView(item[keyField])}
            className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/50"
          >
            <Eye className="mr-2 h-4 w-4 text-blue-600" />
            {t('GenericTable.view', 'View')}
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem 
            onClick={() => onEdit(item[keyField])}
            className="cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/50"
          >
            <Edit className="mr-2 h-4 w-4 text-amber-600" />
            {t('GenericTable.edit', 'Edit')}
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem 
            onClick={() => onDelete(item[keyField], item.name || 'item')}
            className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" />
            {t('GenericTable.delete', 'Delete')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  // Modern Loading Component
  const ModernLoader = () => (
    <div className="space-y-4">
      {Array(3).fill(0).map((_, rowIndex) => (
        <div key={`loading-${rowIndex}`} className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            </div>
            <div className="flex space-x-2">
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // Enhanced Empty State
  const EmptyState = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-lg">
          <Database className="h-10 w-10 text-slate-500 dark:text-slate-400" />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 blur-xl opacity-50" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
        {defaultEmptyMessage}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-md">
        {searchTerm 
          ? t('GenericTable.noSearchResults', `No results found for "${searchTerm}"`)
          : t('GenericTable.emptyDescription', 'No data available to display')
        }
      </p>
    </motion.div>
  )

  // Cards View
  const CardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {paginatedData.map((item, index) => (
        <motion.div
          key={item[keyField]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group relative bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-slate-900/20 hover:-translate-y-1 cursor-pointer backdrop-blur-sm"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                {columns.slice(0, 3).map((column, colIndex) => {
                  const value = getValueByPath(item, column.accessor)
                  return (
                    <div key={colIndex} className={colIndex === 0 ? "mb-2" : "mb-1"}>
                      {colIndex === 0 ? (
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                          {column.cell ? column.cell(item, value) : value}
                        </h3>
                      ) : (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          <span className="font-medium">{column.header}:</span>{' '}
                          {column.cell ? column.cell(item, value) : value}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
              {actionColumn && (onEdit || onDelete || onView) && (
                <ActionDropdown item={item} />
              )}
            </div>
            
            {/* Additional columns */}
            {columns.length > 3 && (
              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                {columns.slice(3).map((column, colIndex) => {
                  const value = getValueByPath(item, column.accessor)
                  return (
                    <div key={colIndex} className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400">{column.header}</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {column.cell ? column.cell(item, value) : value}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )

  // List View
  const ListView = () => (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 overflow-hidden backdrop-blur-sm">
      {paginatedData.map((item, index) => (
        <motion.div
          key={item[keyField]}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            "group flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer",
            index !== paginatedData.length - 1 ? 'border-b border-slate-100 dark:border-slate-700/60' : ''
          )}
        >
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
              {(item.name || item.title || 'I')[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-4">
                {columns.slice(0, 3).map((column, colIndex) => {
                  const value = getValueByPath(item, column.accessor)
                  return (
                    <div key={colIndex} className={colIndex === 0 ? "flex-1" : "hidden md:block"}>
                      {colIndex === 0 ? (
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {column.cell ? column.cell(item, value) : value}
                        </h3>
                      ) : (
                        <div className="text-sm">
                          <p className="text-slate-500 dark:text-slate-400 text-xs">{column.header}</p>
                          <p className="text-slate-700 dark:text-slate-300 font-medium">
                            {column.cell ? column.cell(item, value) : value}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          
          {actionColumn && (onEdit || onDelete || onView) && (
            <ActionDropdown item={item} />
          )}
        </motion.div>
      ))}
    </div>
  )

  // Table View (Enhanced)
  const TableView = () => (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 overflow-hidden backdrop-blur-sm shadow-xl">
      <Table>
        <TableHeader className="bg-slate-50/80 dark:bg-slate-900/50">
          <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            {columns.map((column, index) => (
              <TableHead 
                key={index} 
                className={cn(
                  column.className || '',
                  column.sortable ? 'cursor-pointer select-none' : '',
                  'text-slate-700 dark:text-slate-300 font-semibold text-sm'
                )}
              >
                <div className="flex items-center">
                  {column.header}
                  {column.sortable && <ArrowUpDown className="h-3.5 w-3.5 ml-1 text-slate-500" />}
                </div>
              </TableHead>
            ))}
            {actionColumn && (onEdit || onDelete || onView) && (
              <TableHead className="text-right text-slate-700 dark:text-slate-300 font-semibold text-sm">
                {defaultActionColumnHeader}
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((item, rowIndex) => (
            <motion.tr 
              key={item[keyField]}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rowIndex * 0.05 }}
              className={cn(
                "group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50",
                rowIndex === paginatedData.length - 1 ? '' : 'border-b border-slate-100 dark:border-slate-800'
              )}
            >
              {columns.map((column, colIndex) => (
                <TableCell 
                  key={`${item[keyField]}-${colIndex}`} 
                  className={cn(column.className || '', 'py-4 text-sm')}
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
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(item[keyField])}
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(item[keyField], item.name || 'item')}
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      {(title || subtitle) && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-400/10 dark:to-purple-400/10 rounded-2xl blur-xl" />
          <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 p-6 shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div>
                  {title && (
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-slate-600 dark:text-slate-400 mt-1">{subtitle}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Search */}
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder={t('GenericTable.searchPlaceholder', 'Search...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-10 w-64 pl-10 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                  />
                </div>
                
                {/* Filter Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 px-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {t('GenericTable.filterButton', 'Filter')}
                </Button>
                
                {/* View Mode Toggle */}
                <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('table')}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      viewMode === 'table'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    )}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      viewMode === 'cards'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    )}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      viewMode === 'list'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    )}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModernLoader />
          </motion.div>
        ) : filteredData.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 backdrop-blur-sm"
          >
            <EmptyState />
          </motion.div>
        ) : (
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {viewMode === 'table' && <TableView />}
            {viewMode === 'cards' && <CardsView />}
            {viewMode === 'list' && <ListView />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Pagination */}
      {filteredData.length > itemsPerPage && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 backdrop-blur-sm p-4"
        >
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('GenericTable.showingResults', 'Showing')} 
              <span className="font-semibold text-slate-900 dark:text-slate-100 mx-1">
                {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)}
              </span> 
              {t('GenericTable.of', 'of')} 
              <span className="font-semibold text-slate-900 dark:text-slate-100 mx-1">
                {filteredData.length}
              </span> 
              {t('GenericTable.resultsText', 'results')}
            </p>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-9 w-9 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {[...Array(Math.min(5, totalPages))].map((_, index) => {
                const pageNumber = index + 1
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={cn(
                      "h-9 w-9 p-0",
                      currentPage === pageNumber && "bg-blue-500 hover:bg-blue-600"
                    )}
                  >
                    {pageNumber}
                  </Button>
                )
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-9 w-9 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Enhanced cell renderers with modern styling
export const StatusCell = (item: any, value: boolean, translations?: { active: string, inactive: string }) => {
  const activeText = translations?.active || "Active"
  const inactiveText = translations?.inactive || "Inactive"
  
  return (
    <div className="flex items-center space-x-2">
      <div className={cn(
        "w-2 h-2 rounded-full",
        value ? "bg-green-500 shadow-green-500/50 shadow-sm" : "bg-red-500 shadow-red-500/50 shadow-sm"
      )} />
      <span className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
        value
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
      )}>
        {value ? activeText : inactiveText}
      </span>
    </div>
  )
}

export const CountBadgeCell = (item: any, value: number) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-sm">
    {value || 0}
  </span>
)

export const PriorityCell = (item: any, value: string, translations?: { high: string, medium: string, low: string }) => {
  const priorities = {
    high: { 
      bg: "bg-red-100", 
      text: "text-red-700", 
      border: "border-red-200", 
      darkBg: "dark:bg-red-900/30", 
      darkText: "dark:text-red-400", 
      darkBorder: "dark:border-red-800",
      dot: "bg-red-500"
    },
    medium: { 
      bg: "bg-amber-100", 
      text: "text-amber-700", 
      border: "border-amber-200", 
      darkBg: "dark:bg-amber-900/30", 
      darkText: "dark:text-amber-400", 
      darkBorder: "dark:border-amber-800",
      dot: "bg-amber-500"
    },
    low: { 
      bg: "bg-green-100", 
      text: "text-green-700", 
      border: "border-green-200", 
      darkBg: "dark:bg-green-900/30", 
      darkText: "dark:text-green-400", 
      darkBorder: "dark:border-green-800",
      dot: "bg-green-500"
    },
  }
  
  const priority = priorities[value?.toLowerCase() as keyof typeof priorities] || priorities.medium
  
  const getPriorityText = (priority: string) => {
    switch(priority?.toLowerCase()) {
      case 'high': return translations?.high || "High"
      case 'medium': return translations?.medium || "Medium"
      case 'low': return translations?.low || "Low"
      default: return translations?.medium || "Medium"
    }
  }
  
  return (
    <div className="flex items-center space-x-2">
      <div className={cn("w-2 h-2 rounded-full shadow-sm", priority.dot)} />
      <span className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm",
        priority.bg, priority.text, priority.darkBg, priority.darkText, 
        "border", priority.border, priority.darkBorder
      )}>
        {getPriorityText(value)}
      </span>
    </div>
  )
}

export const DateCell = (item: any, value: string) => {
  if (!value) return <span className="text-slate-400">-</span>
  const date = new Date(value)
  return (
    <div className="text-sm">
      <div className="font-medium text-slate-900 dark:text-slate-100">
        {date.toLocaleDateString()}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400">
        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  )
}

export const TruncatedCell = (item: any, value: string) => {
  if (!value) return <span className="text-slate-400">-</span>
  return (
    <div className="max-w-xs truncate font-medium text-slate-900 dark:text-slate-100" title={value}>
      {value}
    </div>
  )
}

export const BooleanCell = (item: any, value: boolean) => (
  <div className={cn(
    "w-5 h-5 rounded-full shadow-sm",
    value ? 'bg-green-500 shadow-green-500/30' : 'bg-gray-300 dark:bg-gray-600'
  )} />
)