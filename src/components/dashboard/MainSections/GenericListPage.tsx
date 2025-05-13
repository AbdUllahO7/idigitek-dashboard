"use client"

import React, { ReactNode } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Plus, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"

// Animation variants
const animations = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
  item: {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 10 },
    },
  }
}

// Types
export interface ListPageConfig {
  title: string
  description: string
  addButtonLabel: string
  emptyStateMessage: string
  noSectionMessage: string
  mainSectionRequiredMessage?: string
  sectionIntegrationTitle: string
  sectionIntegrationDescription: string
  addSectionButtonLabel: string
  editSectionButtonLabel: string
  saveSectionButtonLabel: string
  listTitle: string
  editPath: string
  createPath?: string
}

interface GenericListPageProps {
  config: ListPageConfig
  sectionId: string | null
  sectionConfig: any
  isAddButtonDisabled: boolean
  addButtonTooltip: string
  tableComponent: ReactNode
  createDialogComponent: ReactNode
  deleteDialogComponent: ReactNode
  onAddNew: () => void
  handleRefresh?: () => void
  isLoading?: boolean
  isLoadingSection?: boolean
  emptyCondition: boolean
  noSectionCondition: boolean
  customEmptyMessage?: string
}

export function GenericListPage({
  config,
  isAddButtonDisabled,
  addButtonTooltip,
  tableComponent,
  createDialogComponent,
  deleteDialogComponent,
  onAddNew,
  isLoading = false,
  emptyCondition,
  noSectionCondition,
  customEmptyMessage
}: GenericListPageProps) {
  // Determine message to display in empty state
  const emptyMessage = customEmptyMessage || 
              (noSectionCondition 
                ? config.noSectionMessage 
                : config.emptyStateMessage);

  // Render add button with tooltip
  const AddButton = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              className={`group transition-all duration-300 ${
                isAddButtonDisabled ? "opacity-70 cursor-not-allowed" : "hover:scale-105"
              }`}
              disabled={isAddButtonDisabled}
              onClick={onAddNew}
            >
              <Plus className="mr-2 h-4 w-4" />
              {config.addButtonLabel}
              <motion.span
                className="ml-1 opacity-0 group-hover:opacity-100 group-hover:ml-2"
                initial={{ width: 0 }}
                animate={{ width: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRight className="h-4 w-4" />
              </motion.span>
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{addButtonTooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Render page header with title, description and add button
  const PageHeader = (
    <motion.div 
      className="flex flex-col md:flex-row md:items-center justify-between gap-4" 
      variants={animations.item}
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
          {config.title}
        </h1>
        <p className="text-muted-foreground mt-1">{config.description}</p>
      </div>
      {AddButton}
    </motion.div>
  );

  // Loading state component
  const LoadingState = (
    <div className="flex justify-center items-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  // Empty state component with improved visuals
  const EmptyState = (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
      <p className="text-muted-foreground max-w-md mx-auto">
        {emptyMessage}
      </p>
    </div>
  );

  // Render table card with loading or empty states
  const TableCard = (
    <motion.div variants={animations.item}>
      <Card className="border-none shadow-lg overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            LoadingState
          ) : emptyCondition ? (
            EmptyState
          ) : (
            tableComponent
          )}
        </CardContent>
      </Card>
    </motion.div>
  );



  return (
    <>
      <motion.div 
        className="space-y-6" 
        initial="hidden" 
        animate="visible" 
        variants={animations.container}
      >
        {PageHeader}
        {TableCard}
      </motion.div>

      {/* Dialogs */}
      {createDialogComponent}
      {deleteDialogComponent}
    </>
  );
}