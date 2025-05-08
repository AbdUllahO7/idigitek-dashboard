
export interface UseGenericListOptions {
  sectionId: string | null
  apiHooks: {
    useGetBySectionId: any
    useDelete: any
    useGetByWebSiteId: any
  }
  editPath: string
  onSuccessDelete?: () => void
  onErrorDelete?: (error: any) => void
}