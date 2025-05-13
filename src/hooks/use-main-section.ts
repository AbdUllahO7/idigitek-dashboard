import { MultilingualSectionData } from "../api/types/hooks/MultilingualSection.types";
import { useSectionItems } from "./webConfiguration/use-section-items";

/**
 * Creates a main-service section item if it doesn't exist
 * @param ParentSectionId The parent section ID
 * @param sectionData The multilingual section data (for extracting title/description)
 * @returns Promise with the section item ID
 */
export async function createMainServiceItem(
  ParentSectionId: string | any,
  sectionData: MultilingualSectionData
): Promise<string> {
  // Get the section items hook
  const { 
    useGetBySectionId, 
    useCreate: useCreateSectionItem 
  } = useSectionItems();
  
  // Ensure ParentSectionId is a string (extract _id if it's an object)
  const sectionId = typeof ParentSectionId === 'object' 
    ? ParentSectionId._id || ParentSectionId.id || ''
    : ParentSectionId;
  
  // If we couldn't get a valid section ID, throw an error
  if (!sectionId) {
    throw new Error("Invalid section ID provided");
  }
  
  // Get section items for this section
  const sectionItemsQuery = useGetBySectionId(sectionId);
  
  // Create mutation
  const createSectionItem = useCreateSectionItem();
  
  // Wait for query to complete
  await sectionItemsQuery.refetch();
  
  // Check if main-service already exists
  const existingMainService = sectionItemsQuery.data?.data?.find(
    (item: any) => item.name === "main-service"
  );
  
  // If main-service exists, return its ID
  if (existingMainService?._id) {
    console.log("Found existing main-service:", existingMainService._id);
    return existingMainService._id;
  }
  
  // Extract title and description from section data if available
  let title = "Main Service";
  let description = "Primary service offering";
  
  // Try to get title from first language in the data
  if (sectionData && sectionData.title && typeof sectionData.title === 'object') {
    const firstLangTitle = Object.values(sectionData.title)[0] as string;
    if (firstLangTitle) {
      title = firstLangTitle;
    }
  }
  
  // Try to get description from first language in the data
  if (sectionData && sectionData.description && typeof sectionData.description === 'object') {
    const firstLangDesc = Object.values(sectionData.description)[0] as string;
    if (firstLangDesc) {
      description = firstLangDesc;
    }
  }
  
  // Create the main-service section item
  try {
    const sectionItemData = {
      name: "main-service",
      description: description,
      section: sectionId, // Ensure we're using the string ID
      isActive: true,
      isMain: true,
      order: 0,
      // Optional image from section data if available
      image: sectionData.imageUrl || null,
      WebSiteId : localStorage.getItem('websiteId')
    };
    
    const response = await createSectionItem.mutateAsync(sectionItemData);
    
    // Extract and return the new ID
    if (response && response.data && response.data._id) {
      return response.data._id;
    } else {
      throw new Error("Failed to extract ID from response");
    }
  } catch (error) {
    console.error("Error creating main-service:", error);
    throw error;
  }
}