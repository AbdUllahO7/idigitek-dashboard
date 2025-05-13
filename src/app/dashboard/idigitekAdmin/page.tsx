"use client"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Plus, RefreshCw, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/src/hooks/use-toast"
import useUsers from "@/src/hooks/users/use-users"
import { useWebSite } from "@/src/hooks/webConfiguration/use-WebSite"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import { useAuth } from "@/src/context/AuthContext"
import { User, UserStatus } from "@/src/api/user.types"
import { ViewUserDialog } from "@/src/components/dashboard/user/ViewUserDialog"
import { EditUserDialog } from "@/src/components/dashboard/user/EditUserDialog"
import { DeleteUserDialog } from "@/src/components/dashboard/user/DeleteUserDialog"
import { AddUserDialog } from "@/src/components/dashboard/user/AddUserDialog"

export default function OwnerUsersPage() {
  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // User and form states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [ownerUsers, setOwnerUsers] = useState<User[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  
  // Default form data
  const [formData, setFormData] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: UserStatus;
    password?: string;
    confirmPassword?: string;  // Make confirmPassword optional
  }>({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "owner", // Default to owner role for this page
    status: UserStatus.ACTIVE,
    password: "",
    confirmPassword: ""
  });
  
  // API hooks
  const { useGetAll, useDelete, useUpdate, useCreate } = useUsers();
  const { useAddUser } = useWebSite();
  const { websiteId } = useWebsiteContext();
  
  const { 
    data: usersResponse, 
    isLoading: isLoadingUsers,
    refetch: refetchUsers
  } = useGetAll();
  
  const deleteUserMutation = useDelete();
  const updateUserMutation = useUpdate();
  const createUserMutation = useCreate();
  const createWebSiteUser = useAddUser();
  const { toast } = useToast();
  const user = useAuth();
  
  // Filter for owner users
  useEffect(() => {
    if (usersResponse?.data) {
      const owners = usersResponse.data.filter((user: User) => 
        user.role?.toLowerCase() === 'owner'
      );
      setOwnerUsers(owners);
    }
  }, [usersResponse]);
  
  // Filter owners based on search term
  const filteredOwners = ownerUsers.filter((user: User) => {
    // Construct full name for search
    const fullName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`.toLowerCase()
      : (user.firstName || user.lastName || "").toLowerCase();
      
    return fullName.includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.status?.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Get current user role
  const getCurrentUserRole = () => {
    return user?.user?.role?.toString() || "";
  };
  
  // Check if current user is idigitekAdmin
  const isIdigitekAdmin = () => {
    const currentUserRole = getCurrentUserRole();
    return currentUserRole?.toLowerCase() === 'idigitekadmin';
  };
  
  // Dialog handlers
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };
  
  const handleEditUser = (user: User) => {
    // Only idigitekAdmin can edit owner users
    if (!isIdigitekAdmin()) {
      toast({
        title: "Permission denied",
        description: "Only idigitekAdmin users can edit owner accounts",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedUser(user);
    setFormData({
      id: user?._id || user?.id || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      role: user.role || "owner",
      status: user.status || UserStatus.ACTIVE,
      password: "",
      confirmPassword: ""
    });
    setPasswordError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormError(null);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteUser = (user: User) => {
    // Only idigitekAdmin can delete owner users
    if (!isIdigitekAdmin()) {
      toast({
        title: "Permission denied",
        description: "Only idigitekAdmin users can delete owner accounts",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };
  
  const handleAddUserDialog = () => {
    // Only idigitekAdmin can create owner users
    if (!isIdigitekAdmin()) {
      toast({
        title: "Permission denied",
        description: "Only idigitekAdmin users can create owner accounts",
        variant: "destructive"
      });
      return;
    }
    
    setFormData({
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      role: "owner", // Default to owner for this page
      status: UserStatus.ACTIVE,
      password: "",
      confirmPassword: ""
    });
    setPasswordError("");
    setFormError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsAddDialogOpen(true);
  };
  
  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear password error when user types
    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
    
    // Clear form error
    setFormError(null);
  };
  
  const handleRoleChange = (value: string) => {
    // For this page, we always set role to owner
    setFormData((prev) => ({ ...prev, role: "owner" }));
    setFormError(null);
  };
  
  const handleStatusChange = (value: UserStatus) => {
    setFormData((prev) => ({ ...prev, status: value }));
    setFormError(null);
  };
  
  // Validate password match
  const validatePasswords = () => {
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    if ((formData.password || "").length < 8 && formData.password) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }
    return true;
  };
  
  // Password visibility toggles
  const toggleShowPassword = () => setShowPassword(prev => !prev);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(prev => !prev);
  
  // Form submission handlers
  const submitEditUser = async () => {
    // Check if user is idigitekAdmin
    if (!isIdigitekAdmin()) {
      toast({
        title: "Permission denied",
        description: "Only idigitekAdmin users can update owner accounts",
        variant: "destructive"
      });
      setIsEditDialogOpen(false);
      return;
    }
    
    // Use id if available, otherwise fall back to _id
    const userId = selectedUser?.id || selectedUser?._id;
    
    if (!userId) return;

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
        description: "The owner user has been updated successfully",
        variant: "default"
      });
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to update user. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const submitDeleteUser = async () => {
    // Check if user is idigitekAdmin
    if (!isIdigitekAdmin()) {
      toast({
        title: "Permission denied",
        description: "Only idigitekAdmin users can delete owner accounts",
        variant: "destructive"
      });
      setIsDeleteDialogOpen(false);
      return;
    }
    
    // Use id if available, otherwise fall back to _id
    const userId = selectedUser?.id || selectedUser?._id;
    
    if (!userId) return;
    
    try {
      await deleteUserMutation.mutateAsync(userId);
      
      // Refresh the users list after successful deletion
      await refetchUsers();
      
      toast({
        title: "Owner user deleted",
        description: "The owner user has been deleted successfully",
        variant: "default"
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete owner user. Please try again.",
        variant: "destructive"
      });
    }
  };
  
    const submitAddUser = async () => {
    // Check if user is idigitekAdmin
    if (!isIdigitekAdmin()) {
        toast({
        title: "Permission denied",
        description: "Only idigitekAdmin users can create owner accounts",
        variant: "destructive"
        });
        setIsAddDialogOpen(false);
        return;
    }
    
    // Validate password match
    if (!validatePasswords()) return;
    
    // Create a copy of form data without confirmPassword
    const userData = { ...formData };
    delete userData.confirmPassword;
    
    // Force role to be owner
    userData.role = "owner";
    
    try {
        // Create the user without adding to website
        const newUser = await createUserMutation.mutateAsync(userData as any);
        
        // Refresh users list
        await refetchUsers();
        
        toast({
        title: "Owner user added",
        description: "The new owner user has been created successfully",
        variant: "default"
        });
        
        setIsAddDialogOpen(false);
    } catch (error: any) {
        console.error("Error in user creation process:", error);
        
        toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to add owner user. Please try again.",
        variant: "destructive"
        });
    }
    }
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-1">
              Owner Users
            </h1>
            <p className="text-muted-foreground">
              View and manage owner accounts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search owners..."
                className="w-full md:w-[300px] pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => refetchUsers()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            {/* Only show Add User button to idigitekAdmin */}
            {isIdigitekAdmin() && (
              <Button onClick={handleAddUserDialog} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500">
                <Plus className="mr-2 h-4 w-4" />
                Add Owner
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Owners table */}
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {isLoadingUsers ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center">
                    <div className="flex justify-center items-center h-24">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredOwners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    {searchTerm ? "No owner users found matching your search." : "No owner users found."}
                  </td>
                </tr>
              ) : (
                filteredOwners.map((owner) => (
                  <tr key={owner.id || owner._id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium mr-3">
                          {owner.firstName?.[0]}{owner.lastName?.[0]}
                        </div>
                        <div>
                          <div className="font-medium">{owner.firstName} {owner.lastName}</div>
                          <div className="text-xs text-muted-foreground">Owner</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">{owner.email}</td>
                    <td className="p-4 align-middle">
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                        ${owner.status === 'active' ? 'bg-green-100 text-green-800' : 
                          owner.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {owner.status}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      {owner.createdAt ? new Date(owner.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewUser(owner)}>
                          View
                        </Button>
                        {/* Only show Edit/Delete buttons to idigitekAdmin */}
                        {isIdigitekAdmin() && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleEditUser(owner)}>
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(owner)} className="text-red-500 hover:text-red-700">
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>



      {/* View User Dialog */}
      <ViewUserDialog
        user={selectedUser}
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        onEdit={isIdigitekAdmin() ? handleEditUser : undefined}
        onDelete={isIdigitekAdmin() ? handleDeleteUser : undefined}
        canEditOwner={isIdigitekAdmin()}
      />

      {/* Add User Dialog */}
      <AddUserDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={submitAddUser}
        formData={formData}
        onChange={handleChange}
        onRoleChange={handleRoleChange}
        onStatusChange={handleStatusChange}
        passwordError={passwordError}
        formError={formError}
        isCreating={createUserMutation.isPending}
        superOwnerExists={ownerUsers.length > 0}
        showPassword={showPassword}
        showConfirmPassword={showConfirmPassword}
        toggleShowPassword={toggleShowPassword}
        toggleShowConfirmPassword={toggleShowConfirmPassword}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={submitEditUser}
        formData={formData}
        onChange={handleChange}
        onRoleChange={handleRoleChange}
        onStatusChange={handleStatusChange}
        passwordError={passwordError}
        formError={formError}
        isUpdating={updateUserMutation.isPending}
        showPassword={showPassword}
        showConfirmPassword={showConfirmPassword}
        toggleShowPassword={toggleShowPassword}
        toggleShowConfirmPassword={toggleShowConfirmPassword}
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog
        user={selectedUser}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={submitDeleteUser}
        isDeleting={deleteUserMutation.isPending}
      />
        {/* <IdigitekAdminSections hasWebsite={true} /> */}

    </div>
  );
}