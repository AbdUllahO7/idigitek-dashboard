"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useSectionItems } from "@/src/hooks/webConfiguration/use-section-items"
import { useGenericList } from "@/src/hooks/useGenericList"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { CountBadgeCell, GenericTable, StatusCell, TruncatedCell } from "@/src/components/dashboard/MainSections/GenericTable"
import { GenericListPage } from "@/src/components/dashboard/MainSections/GenericListPage"
import DialogCreateSectionItem from "@/src/components/DialogCreateSectionItem"
import CreateMainSubSection from "@/src/utils/CreateMainSubSection"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import DeleteSectionDialog from "@/src/components/DeleteSectionDialog"
import { headerSectionConfig } from "./HeaderSectionConfig"

// Configuration for the Services page
const SERVICES_CONFIG = {
  title: "Header Management",
  description: "Manage your Header inventory and multilingual content",
  addButtonLabel: "Add New Nav item",
  emptyStateMessage: "No Header found. Create your first Header by clicking the \"Add New Header\" button.",
  noSectionMessage: "Please create a Header section first before adding Header.",
  mainSectionRequiredMessage: "Please enter your main section data before adding Header.",
  emptyFieldsMessage: "Please complete all required fields in the main section before adding Header.",
  sectionIntegrationTitle: "Service Section Content",
  sectionIntegrationDescription: "Manage your Header section content in multiple languages.",
  addSectionButtonLabel: "Add Service Section",
  editSectionButtonLabel: "Edit Header Section",
  saveSectionButtonLabel: "Save Header Section",
  listTitle: "Header List",
  editPath: "header/addNavItems"
}

// Service table column definitions
const SERVICE_COLUMNS = [
  {
    header: "Name",
    accessor: "name",
    className: "font-medium"
  },
  {
    header: "Description",
    accessor: "description",
    cell: TruncatedCell
  },
  {
    header: "Status",
    accessor: "isActive",
    cell: (item: any, value: boolean) => (
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          {StatusCell(item, value)}
          {item.isMain && (
            <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              Main
            </span>
          )}
        </div>
      </div>
    )
  },
  {
    header: "Order",
    accessor: "order"
  },
  {
    header: "Subsections",
    accessor: "subsections.length",
    cell: CountBadgeCell
  }
]

export default function ServicesPage() {
  const searchParams = useSearchParams()
  const sectionId = searchParams.get("sectionId")
  const [hasMainSubSection, setHasMainSubSection] = useState<boolean>(false)
  const [isLoadingMainSubSection, setIsLoadingMainSubSection] = useState<boolean>(true)
  const [mainSectionFormValid, setMainSectionFormValid] = useState<boolean>(false)
  const [mainSectionErrorMessage, setMainSectionErrorMessage] = useState<string | undefined>(SERVICES_CONFIG.mainSectionRequiredMessage)
  const [sectionData, setSectionData] = useState<any>(null)
  const { websiteId } = useWebsiteContext();

  
  // Check if main subsection exists
  const { useGetMainByWebSiteId } = useSubSections()
  
  const {
    data: mainSubSectionData,
    isLoading: isLoadingCompleteSubsections
  } = useGetMainByWebSiteId(websiteId)


  // Use the generic list hook for Header management
  const {
    section: HeaderSection,
    items: services,
    isLoadingItems: isLoadingServices,
    isCreateDialogOpen,
    isDeleteDialogOpen,
    itemToDelete,
    isDeleting,
    isAddButtonDisabled: defaultAddButtonDisabled,
    addButtonTooltip: defaultAddButtonTooltip,
    handleSectionChange,
    handleEdit,
    handleDelete,
    handleAddNew,
    handleItemCreated,
    showDeleteDialog,
    setIsCreateDialogOpen,
    setIsDeleteDialogOpen,
    setSection
  } = useGenericList({
    sectionId,
    apiHooks: useSectionItems(),
    editPath: SERVICES_CONFIG.editPath
  })

  // Determine if main subsection exists when data loads & set section data if needed
  useEffect(() => {
    if (!isLoadingCompleteSubsections && mainSubSectionData) {
      // Check if data exists and has isMain: true
      const hasMain = mainSubSectionData?.data && mainSubSectionData.data.isMain === true
      setHasMainSubSection(hasMain)
      setIsLoadingMainSubSection(false)
      
      // Extract section data from the main subsection and set it
      if (hasMain && mainSubSectionData.data.section) {
        // The section could be either a string ID or a populated object
        const sectionInfo = typeof mainSubSectionData.data.section === 'string' 
          ? {_id : mainSubSectionData.data.section } 
          : mainSubSectionData.data.section

        // Set local section data
        setSectionData(sectionInfo)
        
        // Update the serviceSection in useGenericList hook if not already set
        if (HeaderSection === null) {
          setSection(sectionInfo)
        }
      }
    } else if (!isLoadingCompleteSubsections) {
      // No main subsection found
      setHasMainSubSection(false)
      setIsLoadingMainSubSection(false)
    }
  }, [mainSubSectionData, isLoadingCompleteSubsections, HeaderSection, setSection])

  // Handle form validity changes
  const handleFormValidityChange = (isValid: boolean, message?: string) => {
    setMainSectionFormValid(isValid)
    if (message) {
      setMainSectionErrorMessage(message)
    } else {
      setMainSectionErrorMessage(undefined)
    }
  }

  // Custom add button logic based on main subsection existence and form validity
  const isAddButtonDisabled = 
    defaultAddButtonDisabled || 
    !hasMainSubSection || 
    isLoadingMainSubSection ||
    !mainSectionFormValid
  
  // Custom tooltip message based on condition
  const addButtonTooltip = !HeaderSection && !sectionData 
    ? SERVICES_CONFIG.noSectionMessage 
    : (!hasMainSubSection && !isLoadingMainSubSection)
      ? SERVICES_CONFIG.mainSectionRequiredMessage
      : (!mainSectionFormValid && mainSectionErrorMessage)
        ? mainSectionErrorMessage
        : defaultAddButtonTooltip

  // Custom message for empty state based on conditions
  const emptyStateMessage = !HeaderSection && !sectionData 
    ? SERVICES_CONFIG.noSectionMessage 
    : (!hasMainSubSection && !isLoadingMainSubSection)
      ? SERVICES_CONFIG.mainSectionRequiredMessage
      : (!mainSectionFormValid && mainSectionErrorMessage)
        ? mainSectionErrorMessage
        : SERVICES_CONFIG.emptyStateMessage

  // Handle main subsection creation
  const handleMainSubSectionCreated = (subsection: any) => {
    setHasMainSubSection(subsection.isMain === true)
    
    // If we have section data from the subsection, update it
    if (subsection.section) {
      const sectionInfo = typeof subsection.section === 'string' 
        ? { _id: subsection.section } 
        : subsection.section
        
      setSectionData(sectionInfo)
      setSection(sectionInfo)
    }
  }

  // Components
  const ServicesTable = (
    <GenericTable
      columns={SERVICE_COLUMNS}
      data={services}
      onEdit={handleEdit}
      onDelete={showDeleteDialog}
    />
  )


  const CreateDialog = (
    <DialogCreateSectionItem
      open={isCreateDialogOpen}
      onOpenChange={setIsCreateDialogOpen}
      sectionId={sectionId || ""}
      onServiceCreated={handleItemCreated}
      title="Header"
    />
  )

  const DeleteDialog = (
    <DeleteSectionDialog
      open={isDeleteDialogOpen}
      onOpenChange={setIsDeleteDialogOpen}
      serviceName={itemToDelete?.name || ""}
      onConfirm={handleDelete}
      isDeleting={isDeleting}
      title="Delete Section"
      confirmText="Confirm"
    />
  )

  return (
    <div className="space-y-6">
      {/* Main list page with table and section integration */}
      <GenericListPage
        config={SERVICES_CONFIG}
        sectionId={sectionId}
        sectionConfig={headerSectionConfig}
        isAddButtonDisabled={isAddButtonDisabled}
        addButtonTooltip={addButtonTooltip}
        tableComponent={ServicesTable}
        // sectionIntegrationComponent={SectionIntegration}
        createDialogComponent={CreateDialog}
        deleteDialogComponent={DeleteDialog}
        onAddNew={handleAddNew}
        isLoading={isLoadingServices || isLoadingMainSubSection}
        emptyCondition={services.length === 0}
        noSectionCondition={!HeaderSection && !sectionData}
        customEmptyMessage={emptyStateMessage}
      />
      
      {/* Main subsection management (only shown when section exists) */}
      {sectionId && (
        <CreateMainSubSection 
          sectionId={sectionId}
          sectionConfig={headerSectionConfig}
          onSubSectionCreated={handleMainSubSectionCreated}
          onFormValidityChange={handleFormValidityChange}
        />
      )}
    </div>
  )
}