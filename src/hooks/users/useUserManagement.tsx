// src/hooks/useUserManagement.tsx
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/src/hooks/use-toast";
import useUsers from "@/src/hooks/users/use-users";
import { useWebSite } from "@/src/hooks/webConfiguration/use-WebSite";
import { useWebsiteContext } from "@/src/providers/WebsiteContext";
import { useAuth } from "@/src/context/AuthContext";
import { mapFormRoleToApiRole } from "@/src/utils/user-helpers";
import { Roles, User, UserFormData, UserStatus } from "@/src/api/user.types";

export function useUserManagement() {
  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // User and form states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [superOwnerExists, setSuperOwnerExists] = useState(false);

 
  
  // Default form data
  const [formData, setFormData] = useState<UserFormData>({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    role: undefined,
    status: UserStatus.ACTIVE,
    password: "",
    confirmPassword: ""
  });
  
  // API hooks
  const { useDelete, useUpdate, useCreate } = useUsers();
  const { useGetWebsiteUsers, useAddUser } = useWebSite();
  const { websiteId } = useWebsiteContext();
  
  const { 
    data: usersResponse, 
    isLoading: isLoadingUsers,
    refetch: refetchUsers
  } = useGetWebsiteUsers(websiteId);
  
  const deleteUserMutation = useDelete();
  const updateUserMutation = useUpdate();
  const createUserMutation = useCreate();
  const createWebSiteUser = useAddUser();
  const { toast } = useToast();
  
  const users = usersResponse || [];
  const user = useAuth();
  
  // Check if an owner already exists
  useEffect(() => {
    if (users && users.length > 0) {
      const hasOwnerAdmin = users.some((user: User) => 
        user.role?.toLowerCase() === 'owner'
      );
      setSuperOwnerExists(hasOwnerAdmin);
    }
  }, [users]);
  
  // Filter users based on search term and active tab
  const filteredUsers = users.filter((user: User) => {
    // Construct full name for search
    const fullName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`.toLowerCase()
      : (user.firstName || user.lastName || "").toLowerCase();
      
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.status?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply tab filter
    if (activeTab !== "all") {
      return matchesSearch && user.status === activeTab;
    }
    
    return matchesSearch;
  });
  
  // Get user statistics 
  const userStats = {
    total: users.length,
    active: users.filter((user: User) => user.status === UserStatus.ACTIVE).length,
    inactive: users.filter((user: User) => user.status === UserStatus.INACTIVE).length,
    pending: users.filter((user: User) => user.status === UserStatus.PENDING).length,
    suspended: users.filter((user: User) => user.status === UserStatus.SUSPENDED).length,
  };
  
  // Get current user role
  const getCurrentUserRole = useCallback(() => {
    return user?.user?.role?.toString() || "";
  }, [user]);
  
  // Check if a user can be modified by the current user
  const canModifyOwnerUser = useCallback((targetUser: User) => {
    const currentUserRole = getCurrentUserRole();
    
    // If the target user is an owner, only another owner can modify them
    if (targetUser?.role?.toLowerCase() === 'owner') {
      return currentUserRole?.toLowerCase() === 'owner';
    }
    
    // Non-owner users can be modified by anyone
    return true;
  }, [getCurrentUserRole]);
  
  // Form handlers
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    
    // Clear password error when user types
    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
    
    // Clear form error
    setFormError(null);
  }, []);
  
  const handleRoleChange = useCallback((value: string) => {
    setFormData((prev: any) => ({ ...prev, role: value }));
    
    // Clear form error
    setFormError(null);
    
    // Show warning if selecting owner and one already exists
    if (value.toLowerCase() === 'owner' && superOwnerExists && isAddDialogOpen) {
      setFormError("A owner user already exists in the system. Only one owner is allowed.");
    }
  }, [superOwnerExists, isAddDialogOpen]);
  
  const handleStatusChange = useCallback((value: UserStatus) => {
    setFormData((prev: any) => ({ ...prev, status: value }));
    setFormError(null);
  }, []);
  
  // Dialog handlers
  const handleViewUser = useCallback((user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  }, []);
  
  const handleEditUser = useCallback((user: User) => {
    // Check if trying to edit an owner user when current user is not an owner
    if (user.role?.toLowerCase() === 'owner' && !canModifyOwnerUser(user)) {
      toast({
        title: "Permission denied",
        description: "Only owner users can edit owner accounts",
        variant: "destructive"
      });
      return;
    }
  
    setSelectedUser(user);
    setFormData({
      id: user._id || user.id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      role: user.role,
      status: user.status || UserStatus.ACTIVE,
      password: "",
      confirmPassword: ""
    });
    setPasswordError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormError(null);
    setIsEditDialogOpen(true);
  }, [canModifyOwnerUser, toast]);
  
  const handleDeleteUser = useCallback((user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  }, []);
  
  const handleAddUserDialog = useCallback(() => {
    setFormData({
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      role: Roles.USER,
      status: UserStatus.ACTIVE,
      password: "",
      confirmPassword: ""
    });
    setPasswordError("");
    setFormError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsAddDialogOpen(true);
  }, []);
  
  // Validate password match
  const validatePasswords = useCallback(() => {
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    if ((formData.password || "").length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }
    return true;
  }, [formData.password, formData.confirmPassword]);
  
  // Form submission handlers
  const submitDeleteUser = useCallback(async () => {
    // Use id if available, otherwise fall back to _id
    const userId = selectedUser?.id || selectedUser?._id;
    
    if (!userId) return;
    
    // Extra safety check to prevent deletion of owner users
    if (selectedUser && selectedUser.role?.toLowerCase() === 'owner') {
      toast({
        title: "Operation not allowed",
        description: "Owner users cannot be deleted",
        variant: "destructive"
      });
      setIsDeleteDialogOpen(false);
      return;
    }
    
    try {
      await deleteUserMutation.mutateAsync(userId);
      
      // Refresh the users list after successful deletion
      await refetchUsers();
      
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully",
        variant: "default"
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive"
      });
    }
  }, [selectedUser, deleteUserMutation, refetchUsers, toast]);
  
  const submitEditUser = useCallback(async () => {
    // Use id if available, otherwise fall back to _id
    const userId = selectedUser?.id || selectedUser?._id;
    
    if (!userId) return;
    
    // Check if trying to change role to owner when one already exists
    if (
      formData.role?.toLowerCase() === 'owner' && 
      superOwnerExists && 
      selectedUser?.role?.toLowerCase() !== 'owner'
    ) {
      setFormError("A owner user already exists in the system. Only one owner is allowed.");
      return;
    }

    // Validate password if it's being changed
    if (formData.password && !validatePasswords()) {
      return;
    }
    
    // Remove confirmPassword before sending to API
    const userData = { ...formData };
    if (!userData.password) {
      delete userData.password;
    }
    delete userData.confirmPassword;
    
    try {
      await updateUserMutation.mutateAsync({
        id: userId,
        data: userData
      });
      
      // Refresh users after update
      await refetchUsers();
      
      toast({
        title: "User updated",
        description: "The user has been updated successfully",
        variant: "default"
      });
      setIsEditDialogOpen(false);
    } catch (error: any) {
      // Check for the specific owner error
      if (
        error?.response?.data?.message?.includes("owner user already exists") || 
        error?.message?.includes("owner user already exists")
      ) {
        setFormError("A owner user already exists in the system. Only one owner is allowed.");
      } else {
        toast({
          title: "Error",
          description: error?.response?.data?.message || error?.message || "Failed to update user. Please try again.",
          variant: "destructive"
        });
      }
    }
  }, [
    selectedUser, 
    formData, 
    superOwnerExists, 
    validatePasswords, 
    updateUserMutation, 
    refetchUsers, 
    toast
  ]);
  
  const submitAddUser = useCallback(async () => {
    // Validate password match
    if (!validatePasswords()) return;
    
    // Check if trying to create a owner when one already exists
    if (formData.role?.toLowerCase() === 'owner' && superOwnerExists) {
      setFormError("A owner user already exists in the system. Only one owner is allowed.");
      return;
    }
    
    // Create a copy of form data without confirmPassword
    const userData = { ...formData };
    delete userData.confirmPassword;
    
    // Variable to track created user ID for potential rollback
    let createdUserId: string | undefined;
    let userCreated = false;
    let websiteUserCreated = false;
    
    try {
      // Step 1: Create the user
      const newUser = await createUserMutation.mutateAsync(userData as any);
      
      // Get the user ID from the response
      createdUserId = newUser?.data?.id || newUser?.data?._id || newUser?.id || newUser?._id;
      
      if (!createdUserId) {
        throw new Error("Failed to get new user ID from response");
      }
      userCreated = true;
      try {
        await createWebSiteUser.mutateAsync({ 
          websiteId, 
          userId: createdUserId, 
          role: userData.role as Roles
        });
        
        websiteUserCreated = true;
        await refetchUsers();
        toast({
          title: "User added",
          description: "The new user has been added successfully and assigned to this website",
          variant: "default"
        });
        
        setIsAddDialogOpen(false);
      } catch (websiteError: any) {
        // The website user creation failed, but the user was created
        console.error("Error adding user to website:", websiteError);
        
        // We should consider this operation a failure
        throw new Error(`User was created but could not be added to the website: ${websiteError.message || "Unknown error"}`);
      }
    } catch (error: any) {
      console.error("Error in user creation process:", error);
      
      // Handle specific owner error
      if (
        error?.response?.data?.message?.includes("owner user already exists") || 
        error?.message?.includes("owner user already exists")
      ) {
        setFormError("A owner user already exists in the system. Only one owner is allowed.");
      } else {
        // Show the appropriate error message
        let errorMessage = "Failed to add user. Please try again.";
        
        if (userCreated && !websiteUserCreated) {
          errorMessage = "User was created but could not be added to the website. Please contact support for assistance.";
          
          // Optionally: Attempt to delete the user that was created but not added to the website
          // This would be a rollback operation
          try {
            if (createdUserId) {
              await deleteUserMutation.mutateAsync(createdUserId);
              console.log("Rolled back user creation due to failure to add to website");
            }
          } catch (rollbackError) {
            console.error("Failed to roll back user creation:", rollbackError);
          }
        }
        
        toast({
          title: "Error",
          description: error?.response?.data?.message || error?.message || errorMessage,
          variant: "destructive"
        });
      }
      
    }
  }, [
    validatePasswords, 
    formData, 
    superOwnerExists, 
    createUserMutation, 
    websiteId, 
    createWebSiteUser, 
    refetchUsers, 
    toast,
    // Add deleteUserMutation if you implement rollback
  ]);
  
  // Password visibility toggles
  const toggleShowPassword = useCallback(() => setShowPassword(prev => !prev), []);
  const toggleShowConfirmPassword = useCallback(() => setShowConfirmPassword(prev => !prev), []);
  
  return {
    // Data
    users,
    filteredUsers,
    userStats,
    selectedUser,
    formData,
    searchTerm,
    activeTab,
    passwordError,
    formError,
    superOwnerExists,
    
    // Loading states
    isLoadingUsers,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    isCreating: createUserMutation.isPending,
    
    // Dialog states
    isViewDialogOpen,
    isEditDialogOpen,
    isAddDialogOpen,
    isDeleteDialogOpen,
    setIsViewDialogOpen,
    setIsEditDialogOpen,
    setIsAddDialogOpen,
    setIsDeleteDialogOpen,
    
    // Password visibility
    showPassword,
    showConfirmPassword,
    toggleShowPassword,
    toggleShowConfirmPassword,
    
    // State setters
    setSearchTerm,
    setActiveTab,
    setFormData,
    
    // Form handlers
    handleChange,
    handleRoleChange,
    handleStatusChange,
    
    // Dialog handlers
    handleViewUser,
    handleEditUser,
    handleDeleteUser,
    handleAddUserDialog,
    
    // Form submission
    submitDeleteUser,
    submitEditUser,
    submitAddUser,
    validatePasswords,
    
    // User role helpers
    getCurrentUserRole,
    canModifyOwnerUser,
    
    // Data management
    refetchUsers
  };
}