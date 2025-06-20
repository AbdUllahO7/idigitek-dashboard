
import { useState, useCallback, useEffect } from 'react'
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { useContentElements } from "@/src/hooks/webConfiguration/use-content-elements"
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations"
import { useToast } from "@/src/hooks/use-toast"

interface TeamNavigationItem {
  subsectionId: string
  teamItemId: string
  name: string
  url: string
  isActive: boolean
}

export const useTeamNavigation = (navigationSubSectionId: string | null, activeLanguages: any[]) => {
  const [teamNavigationItems, setTeamNavigationItems] = useState<TeamNavigationItem[]>([])
  const [loading, setLoading] = useState(false)
  
  const { toast } = useToast()
  
  // API hooks
  const { useCreate: useCreateSubSection, useDelete: useDeleteSubSection, useGetBySectionId } = useSubSections()
  const { useCreate: useCreateContentElement, useDelete: useDeleteContentElement } = useContentElements()
  const { useCreate: useCreateContentTranslation, useDelete: useDeleteContentTranslation } = useContentTranslations()
  
  const createSubSection = useCreateSubSection()
  const deleteSubSection = useDeleteSubSection()
  const createContentElement = useCreateContentElement()
  const deleteContentElement = useDeleteContentElement()
  const createContentTranslation = useCreateContentTranslation()
  const deleteContentTranslation = useDeleteContentTranslation()
  
  // Fetch existing navigation items
  const { data: navigationSubsections, refetch: refetchNavigationItems } = useGetBySectionId(
    navigationSubSectionId || "",
    Boolean(navigationSubSectionId)
  )

  // Parse navigation items from subsections
  useEffect(() => {
    if (navigationSubsections?.data) {
      const items: TeamNavigationItem[] = []
      const subsections = Array.isArray(navigationSubsections.data) 
        ? navigationSubsections.data 
        : [navigationSubsections.data]
      
      subsections.forEach((subsection: any) => {
        if (subsection.metadata?.isTeamNavigation && subsection.metadata?.teamItemId) {
          // Extract name and URL from elements
          const nameElement = subsection.elements?.find((el: any) => el.name === 'name')
          const urlElement = subsection.elements?.find((el: any) => el.name === 'url')
          
          items.push({
            subsectionId: subsection._id,
            teamItemId: subsection.metadata.teamItemId,
            name: nameElement?.defaultContent || '',
            url: urlElement?.defaultContent || '',
            isActive: subsection.isActive
          })
        }
      })
      
      setTeamNavigationItems(items)
    }
  }, [navigationSubsections])

  // Generate dynamic URL for team member
  const generateTeamMemberUrl = useCallback((teamItemId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://idigitek-client-dynamic.vercel.app'
    return `${baseUrl}/Pages/TeamDetailsPage/${teamItemId}`
  }, [])

  // Check if team item is in navigation
  const isTeamInNavigation = useCallback((teamItemId: string) => {
    return teamNavigationItems.some(item => item.teamItemId === teamItemId && item.isActive)
  }, [teamNavigationItems])

  // Add team item to navigation
  const addToNavigation = useCallback(async (teamItem: any) => {
    if (!navigationSubSectionId || !activeLanguages.length) {
      throw new Error('Navigation section not found or no active languages available')
    }

    setLoading(true)
    try {
      // Create sub-navigation subsection
      const subNavigationData = {
        name: `${teamItem.name} Navigation`,
        description: `Navigation entry for ${teamItem.name}`,
        type: "TeamMemberNavigation",
        slug: `team-member-nav-${teamItem._id}-${Date.now()}`,
        defaultContent: {
          name: teamItem.name,
          url: generateTeamMemberUrl(teamItem._id)
        },
        isMain: false,
        isActive: true,
        order: teamNavigationItems.length,
        parent: navigationSubSectionId,
        section: teamItem.section || navigationSubSectionId,
        WebSiteId: teamItem.WebSiteId,
        languages: activeLanguages.map(lang => lang._id),
        metadata: {
          teamItemId: teamItem._id,
          isTeamNavigation: true,
          createdAt: new Date().toISOString()
        }
      }

      const subNavResponse = await createSubSection.mutateAsync(subNavigationData)
      const createdSubNav = subNavResponse.data

      // Create content elements for name and URL
      const elements = [
        {
          name: "name",
          displayName: "Navigation Name", 
          defaultContent: teamItem.name,
          type: 'text',
          order: 0,
          parent: createdSubNav._id,
          WebSiteId: teamItem.WebSiteId,
          isActive: true,
          metadata: { 
            fieldId: "name", 
            teamItemId: teamItem._id,
            isNavigationElement: true
          }
        },
        {
          name: "url", 
          displayName: "Navigation URL",
          defaultContent: generateTeamMemberUrl(teamItem._id),
          type: 'text',
          order: 1,
          parent: createdSubNav._id,
          WebSiteId: teamItem.WebSiteId,
          isActive: true,
          metadata: { 
            fieldId: "url", 
            teamItemId: teamItem._id,
            isNavigationElement: true
          }
        }
      ]

      // Create elements and translations
      for (const elementData of elements) {
        const elementResponse = await createContentElement.mutateAsync(elementData)
        const createdElement = elementResponse.data

        // Create translations for all active languages
        for (const language of activeLanguages) {
          const translationData = {
            content: elementData.name === 'name' ? teamItem.name : generateTeamMemberUrl(teamItem._id),
            language: language._id,
            contentElement: createdElement._id,
            isActive: true
          }
          await createContentTranslation.mutateAsync(translationData)
        }
      }

      // Refresh navigation items
      await refetchNavigationItems()
      
      return createdSubNav
    } finally {
      setLoading(false)
    }
  }, [
    navigationSubSectionId, 
    activeLanguages, 
    teamNavigationItems.length,
    generateTeamMemberUrl,
    createSubSection,
    createContentElement,
    createContentTranslation,
    refetchNavigationItems
  ])

  // Remove team item from navigation
  const removeFromNavigation = useCallback(async (teamItemId: string) => {
    const navigationItem = teamNavigationItems.find(item => item.teamItemId === teamItemId)
    if (!navigationItem) {
      throw new Error('Navigation item not found')
    }

    setLoading(true)
    try {
      // Delete the subsection (this will cascade delete elements and translations)
      await deleteSubSection.mutateAsync(navigationItem.subsectionId)
      
      // Refresh navigation items
      await refetchNavigationItems()
      
    } finally {
      setLoading(false)
    }
  }, [teamNavigationItems, deleteSubSection, refetchNavigationItems])

  // Toggle team navigation
  const toggleNavigation = useCallback(async (teamItem: any, isChecked: boolean) => {
    try {
      if (isChecked) {
        await addToNavigation(teamItem)
        toast({
          title: "Success",
          description: `${teamItem.name} added to navigation`,
        })
      } else {
        await removeFromNavigation(teamItem._id)
        toast({
          title: "Success", 
          description: `${teamItem.name} removed from navigation`,
        })
      }
    } catch (error) {
      console.error('Navigation toggle error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update navigation",
        variant: "destructive"
      })
      throw error // Re-throw to handle in component
    }
  }, [addToNavigation, removeFromNavigation, toast])

  return {
    teamNavigationItems,
    loading,
    isTeamInNavigation,
    toggleNavigation,
    addToNavigation,
    removeFromNavigation,
    refetchNavigationItems
  }
}
