"use client";

import { useCallback, useEffect, useState } from "react";
import { Link, Globe, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { useTranslation } from "react-i18next";

interface NavigationStatusDisplayProps {
  subsectionId: string;
  languages: any[];
  sectionConfig: any;
  existingElements?: any[];
  existingTranslations?: Record<string, any[]>;
}

interface NavigationItem {
  id: string;
  title: string;
  url: string;
  sourceItemId?: string;
}

export const NavigationStatusDisplay = ({
  subsectionId,
  languages,
  sectionConfig,
  existingElements = [],
  existingTranslations = {}
}: NavigationStatusDisplayProps) => {
  const { t } = useTranslation();
  
  // State
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const defaultLanguage = languages.find(lang => lang.isDefault) || languages[0];

  // Load navigation items from existing elements
  useEffect(() => {
    if (existingElements.length > 0 && languages.length > 0) {
      setIsLoading(true);
      
      try {
        // Filter sub-navigation elements
        const subNavElements = existingElements.filter(el => 
          el.metadata?.isSubNavigation || 
          el.name?.startsWith('SubNav_') ||
          el.type === 'subnav'
        );
        
        // Group elements by sub-navigation item
        const groupedItems: Record<string, { titleElement?: any, urlElement?: any }> = {};
        
        subNavElements.forEach(element => {
          const itemId = element.metadata?.subNavId || element.name?.split('_')[1] || 'default';
          if (!groupedItems[itemId]) {
            groupedItems[itemId] = {};
          }
          
          if (element.name?.includes('Title') || element.metadata?.fieldType === 'title') {
            groupedItems[itemId].titleElement = element;
          } else if (element.name?.includes('URL') || element.metadata?.fieldType === 'url') {
            groupedItems[itemId].urlElement = element;
          }
        });
        
        // Convert to NavigationItem array
        const items: NavigationItem[] = Object.entries(groupedItems).map(([itemId, elements]) => {
          const titleTranslations = elements.titleElement ? existingTranslations[elements.titleElement._id] || [] : [];
          const urlTranslations = elements.urlElement ? existingTranslations[elements.urlElement._id] || [] : [];
          
          // Get title in default language
          const titleTranslation = titleTranslations.find(t => 
            (typeof t.language === 'string' && t.language === defaultLanguage?._id) ||
            (t.language && t.language._id === defaultLanguage?._id)
          );
          
          // Get URL
          const urlTranslation = urlTranslations.find(t => 
            (typeof t.language === 'string' && t.language === defaultLanguage?._id) ||
            (t.language && t.language._id === defaultLanguage?._id)
          );
          
          return {
            id: itemId,
            title: titleTranslation?.content || elements.titleElement?.defaultContent || 'Untitled',
            url: urlTranslation?.content || elements.urlElement?.defaultContent || '',
            sourceItemId: elements.titleElement?.metadata?.sourceItemId
          };
        });
        
        setNavigationItems(items);
      } catch (error) {
        console.error('Error loading navigation items:', error);
        setNavigationItems([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setNavigationItems([]);
    }
  }, [existingElements, existingTranslations, defaultLanguage, languages]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Link size={20} className="mr-3 text-blue-600 dark:text-blue-400" />
            Navigation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Loading navigation status...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Link size={20} className="mr-3 text-blue-600 dark:text-blue-400" />
            Navigation Status
          </div>
          <Badge variant="secondary" className="flex items-center">
            {navigationItems.length > 0 ? (
              <>
                <Eye size={12} className="mr-1" />
                {navigationItems.length} item{navigationItems.length !== 1 ? 's' : ''} active
              </>
            ) : (
              <>
                <EyeOff size={12} className="mr-1" />
                No items
              </>
            )}
          </Badge>
        </CardTitle>
        <CardDescription>
          Current team members that appear in the navigation menu
        </CardDescription>
      </CardHeader>
      <CardContent>
        {navigationItems.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <EyeOff size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              No team members in navigation
            </div>
            <div className="text-sm text-gray-400 dark:text-gray-500">
              Enable navigation for team members when creating or editing them
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {navigationItems.map((item, index) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs font-medium rounded">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {item.title}
                    </div>
                    {item.url && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 max-w-64 truncate">
                        {item.url}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Globe size={12} className="text-gray-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {languages.length} lang{languages.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                    Active
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {navigationItems.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Link size={10} className="text-white" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Navigation Management
                </div>
                <div className="text-blue-700 dark:text-blue-300">
                  To modify navigation items, edit individual team members and toggle their navigation setting. 
                  The navigation will automatically update with the current form titles.
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};