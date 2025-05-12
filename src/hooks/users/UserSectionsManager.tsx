import { useAuth } from '@/src/context/AuthContext';
import React, { useState } from 'react';
import { useSections } from '../webConfiguration/use-section';
import { Section } from '@/src/api/types/hooks/section.types';


interface UserSectionsManagerProps {
  userId?: string; // Optional - if not provided, will use current user ID from auth context
}

const UserSectionsManager: React.FC<UserSectionsManagerProps> = ({ userId }) => {
  const { user } = useAuth(); // Assuming this returns the current authenticated user
  const currentUserId = userId || user?.id;
  
  // Custom hooks from useSections
  const { 
    useGetAll: useGetAllSections,
    useGetUserActiveSections,
    useToggleSectionForUser 
  } = useSections();

  // Get all available sections that are globally active
  const { data: allSections, isLoading: loadingSections } = useGetAllSections(
    false, // includeItemsCount 
    true   // activeOnly - only get globally active sections
  );
  
  // Get sections that are active for the current user
  const { 
    data: userActiveSections, 
    isLoading: loadingUserSections 
  } = !currentUserId ? { data: null, isLoading: false } : useGetUserActiveSections(currentUserId);
  
  // Toggle section activation
  const toggleSectionMutation = useToggleSectionForUser();
  
  // Handle section toggle
  const handleToggleSection = (sectionId: string) => {
    if (!currentUserId) return;
    
    toggleSectionMutation.mutate({
      userId: currentUserId,
      sectionId
    });
  };
  
  // Check if a section is active for the user
  const isSectionActive = (sectionId: string): boolean => {
    if (!userActiveSections || !userActiveSections.data) return false;
    
    return userActiveSections.data.some(
      (section: Section) => section._id === sectionId
    );
  };
  
  if (loadingSections || loadingUserSections) {
    return <div>Loading sections...</div>;
  }
  
  if (!allSections || !allSections.data || allSections.data.length === 0) {
    return <div>No sections available.</div>;
  }
  
  return (
    <div className="user-sections-manager">
      <h2>Manage Your Sections</h2>
      <p>Toggle sections to activate or deactivate them for your account.</p>
      
      <div className="sections-grid">
        {allSections.data.map((section: Section) => (
          <div key={section._id} className="section-card">
            <div className="section-info">
              <h3>{section.name}</h3>
              {section.description && <p>{section.description}</p>}
              {section.image && (
                <img 
                  src={section.image} 
                  alt={section.name} 
                  className="section-image" 
                />
              )}
            </div>
            
            <div className="section-actions">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={section._id ? isSectionActive(section._id) : false}
                  onChange={() => section._id && handleToggleSection(section._id)}
                  disabled={toggleSectionMutation.isPending}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="status-text">
                {section._id ? isSectionActive(section._id) ? 'Active' : 'Inactive' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {toggleSectionMutation.isError && (
        <div className="error-message">
          Error: {toggleSectionMutation.error.message}
        </div>
      )}
    </div>
  );
};

export default UserSectionsManager;