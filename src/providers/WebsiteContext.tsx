'use client'
import { createContext, useContext, ReactNode } from 'react';
import { useWebSite } from '@/src/hooks/webConfiguration/use-WebSite';

// Define the context type
interface WebsiteContextType {
  websites: any[];
  currentWebsite: any ;
  websiteId: string ;
  isLoadingWebsites: boolean;
  websitesError: any;
}

// Create the context with a default value
const WebsiteContext = createContext<WebsiteContextType>({
  websites: [],
  currentWebsite: null,
  websiteId: "",
  isLoadingWebsites: false,
  websitesError: null,
});

// Create the provider component
export function WebsiteProvider({ children }: { children: ReactNode }) {
  const { useGetMyWebsites } = useWebSite();
  const { 
    data: websites = [], 
    isLoading  :isLoadingWebsites, 
    error : websitesError 
  } = useGetMyWebsites();

  // Get the first website by default or let components access the full list
  const currentWebsite = websites.length > 0 ? websites[0] : null;
  const websiteId = currentWebsite?._id || null;

  // The value to be provided to consuming components
  const value = {
    websites,
    currentWebsite,
    websiteId,
    isLoadingWebsites,
    websitesError,
  };

  return (
    <WebsiteContext.Provider value={value}>
      {children}
    </WebsiteContext.Provider>
  );
}

// Create a custom hook for using the context
export function useWebsiteContext() {
  const context = useContext(WebsiteContext);
  if (context === undefined) {
    throw new Error('useWebsiteContext must be used within a WebsiteProvider');
  }
  return context;
}