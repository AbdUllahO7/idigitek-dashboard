"use client"
import { useSearchParams } from "next/navigation"
import { Layout, Sparkles, MessageSquare, Mail, MapPin, Settings } from "lucide-react"
import { useLanguages } from "@/src/hooks/webConfiguration/use-language"
import { useSectionItems } from "@/src/hooks/webConfiguration/use-section-items"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { FormShell } from "@/src/components/dashboard/AddSectionlogic/FormShell"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import { FormDataContact } from "@/src/api/types/sections/contact/contactSection.type"
import ContactInformationForm from "./tabs/ContactInformationForm/ContactInformationForm"
import SendUsaMessageForm from "./tabs/SendUsaMessage/SendUsaMessageForm"
import { useTranslation } from "react-i18next"
import { useState } from "react"

// Form sections to collect data from
const FORM_SECTIONS = ["contact", "contactSendMessage"]

export default function AddContact() {
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Get URL parameters
  const sectionId = searchParams.get('sectionId')
  const sectionItemId = searchParams.get('sectionItemId')
  const mode = searchParams.get('mode') || 'edit'
  const isCreateMode = mode === 'create'
  const { websiteId } = useWebsiteContext();

  // API hooks
  const { useGetByWebsite: useGetAllLanguages } = useLanguages()
  const { useGetById: useGetSectionItemById } = useSectionItems()
  const { useGetBySectionItemId: useGetSubSectionsBySectionItemId } = useSubSections()
  
  // Get languages
  const { 
    data: languagesData, 
    isLoading: isLoadingLanguages 
  } = useGetAllLanguages(websiteId)
  
  // Get section item data if in edit mode
  const {
    data: sectionItemData,
    isLoading: isLoadingSectionItem
  } = useGetSectionItemById(
    sectionItemId || '', 
    Boolean(sectionItemId) && !isCreateMode, // Only fetch in edit mode
    false,
  )
  
  // Get subsections for this service if in edit mode
  const {
    data: subsectionsData,
    isLoading: isLoadingSubsections
  } = useGetSubSectionsBySectionItemId(
    sectionItemId || '',
    Boolean(sectionItemId) && !isCreateMode, // Only fetch in edit mode
    100,
    0,
    false,
  )
  
  // Filter active languages
  const activeLanguages = languagesData?.data?.filter((lang: { isActive: any }) => lang.isActive) || []
  
  // Helper function to find a subsection by slug - FIXED to be case-insensitive
  const findSubsection = (baseSlug: string) => {
    if (!subsectionsData?.data) return undefined;
    
    // Normalize the baseSlug to lowercase and handle special cases
    const normalizedBaseSlug = baseSlug.toLowerCase();
    
    // Create a mapping for known slug patterns
    const slugMappings: Record<string, string> = {
      'basic-info': 'basic-info',
      'more-info': 'more-info',
      'contactinformationform-section': 'contactinformationform-section',
      'contact-sendusAmessageform-section': 'contact-sendusAmessageform-section'
    };
    
    // Get the normalized version of the slug
    const normalizedSlug = slugMappings[normalizedBaseSlug] || normalizedBaseSlug;
    
    // Expected pattern is: normalizedSlug-sectionItemId
    const expectedSlug = `${normalizedSlug}-${sectionItemId}`;
    
    // Find subsection that matches in a case-insensitive way
    const subsection = subsectionsData.data.find((s: { slug: string }) => 
      s.slug.toLowerCase() === expectedSlug.toLowerCase()
    );
    
    if (subsection) {
      return subsection;
    }
    
    // If no exact match, try partial matching (containing both the base slug and section ID)
    const partialMatch = subsectionsData.data.find((s: { slug: string }) => {
      const lowerSlug = s.slug.toLowerCase();
      // Check both with hyphen and without
      return (lowerSlug.includes(normalizedSlug.replace('-', '')) || 
              lowerSlug.includes(normalizedSlug)) && 
              sectionItemId && lowerSlug.includes(sectionItemId.toLowerCase());
    });
    
    if (partialMatch) {
      return partialMatch;
    }
    
    return undefined;
  };
  
  // Generate proper slugs for subsections
  const getSlug = (baseSlug: string) => {
    if (isCreateMode) return "";
    
    // Find the subsection
    const subsection = findSubsection(baseSlug);
    
    // If found, use its actual slug
    if (subsection) {
      return subsection.slug;
    }
    
    // Default fallback - construct the expected slug format
    return `${baseSlug.toLowerCase()}-${sectionItemId}`;
  };
  
  // Validation function
  const validateFormData = (formData: FormDataContact): string[] => {
    const errors: string[] = [];
    const contactData = formData.contact || {};
    
    // Check if at least one language has title and description
    let hasValidContent = false;
    
    for (const langCode in contactData) {
      if (langCode !== 'backgroundImage' && typeof contactData[langCode] === 'object') {
        const langValues = contactData[langCode] as Record<string, any>;
        if (langValues?.title && langValues?.description) {
          hasValidContent = true;
          break;
        }
      }
    }
    
    if (!hasValidContent) {
      errors.push(t('addContact.form.validation.nameRequired'));
      errors.push(t('addContact.form.validation.descriptionRequired'));
    }
    
    return errors;
  };
  
  // Define tabs configuration with translations
  const tabs = [
    {
      id: "contact",
      label: t('addContact.tabs.contact'),
      icon: <Mail className="h-4 w-4" />,
      component: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('addContact.form.contactInfoDescription')}
          </p>
          <ContactInformationForm
            languageIds={activeLanguages.map((lang: { _id: any }) => lang._id)}
            activeLanguages={activeLanguages}
            slug={getSlug('ContactInformationForm-section')}
            ParentSectionId={isCreateMode ? sectionId || "" : (sectionItemId || "")}
            initialData={findSubsection('ContactInformationForm-section')}
          />
        </div>
      )
    },
    {
      id: "contactSendMessage",
      label: t('addContact.tabs.contactSendMessage'),
      icon: <MessageSquare className="h-4 w-4" />,
      component: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('addContact.form.sendMessageDescription')}
          </p>
          <SendUsaMessageForm
            languageIds={activeLanguages.map((lang: { _id: any }) => lang._id)}
            activeLanguages={activeLanguages}
            slug={getSlug('contact-SendUsaMessageForm-section')}
            ParentSectionId={isCreateMode ? sectionId || "" : (sectionItemId || "")}
            initialData={findSubsection('contact-SendUsaMessageForm-section')}
          />
        </div>
      )
    },
  ]

  // Define save handler for the service with validation and error handling
  const handleSaveContact = async (formData: FormDataContact) => {
    setIsSubmitting(true);
    
    try {
      // Validate form data
      const validationErrors = validateFormData(formData);
      if (validationErrors.length > 0) {
        setIsSubmitting(false);
        return;
      }
      
      
      // Extract service info from contact data for title/description
      const contactData = formData.contact || {}
      
      // Get English title and description values or fallback to the first language
      let serviceName = t('addContact.page.defaultContactName')
      let serviceDescription = ""
      
      // Loop through languages to find title and description
      for (const langCode in contactData) {
        if (langCode !== 'backgroundImage' && typeof contactData[langCode] === 'object') {
          const langValues = contactData[langCode] as Record<string, any>
          if (langValues?.title) {
            serviceName = langValues.title
          }
          if (langValues?.description) {
            serviceDescription = langValues.description
          }
          // Prefer English if available
          if (langCode === 'en') {
            break
          }
        }
      }
      
      // Create the service payload
      const servicePayload = {
        name: serviceName,
        description: serviceDescription,
        image: contactData.backgroundImage || null,
        isActive: true,
        section: sectionId
      }
      
     
      
      // Return data for saving
      return servicePayload
      
    } catch (error) {
      console.error('Error saving contact:', error);
      setIsSubmitting(false);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Generate page title and subtitle with translations
  const getPageTitle = () => {
    return isCreateMode 
      ? t('addContact.page.createTitle')
      : t('addContact.page.editTitle')
  }
  
  const getPageSubtitle = () => {
    if (isCreateMode) {
      return t('addContact.page.createSubtitle')
    } else {
      const contactName = sectionItemData?.data?.name || t('addContact.page.defaultContactName')
      return t('addContact.page.editSubtitle', { name: contactName })
    }
  }
  
  // Loading state
  const isLoading = isLoadingLanguages || (!isCreateMode && (isLoadingSectionItem || isLoadingSubsections))
  
  // Show loading message while data is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('addContact.form.loading')}
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <FormShell
      title={getPageTitle()}
      subtitle={getPageSubtitle()}
      backUrl={`/dashboard/contact?sectionId=${sectionId}`}
      activeLanguages={activeLanguages}
      serviceData={sectionItemData?.data}
      sectionId={sectionId}
      sectionItemId={sectionItemId}
      mode={mode}
      onSave={handleSaveContact}
      tabs={tabs}
      formSections={FORM_SECTIONS}
      isLoading={isLoading}
    />
  )
}