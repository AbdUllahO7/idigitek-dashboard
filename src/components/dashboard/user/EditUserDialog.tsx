// src/components/users/EditUserDialog.tsx
import { Button } from "@/src/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/src/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { getRoleIcon } from "@/src/utils/user-helpers";
import { 
  AlertTriangle, 
  Edit,
  Eye, 
  EyeOff, 
  Info, 
  Loader2, 
  Lock, 
  Mail, 
  User as UserIcon 
} from "lucide-react";
import React from "react";
import { UserStatus } from "@/src/api/user.types";

interface UserFormData {
  id?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  status: UserStatus;
}

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: UserFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: UserStatus) => void;
  passwordError: string;
  formError: string | null;
  isUpdating: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  toggleShowPassword: () => void;
  toggleShowConfirmPassword: () => void;
}

export function EditUserDialog({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onChange,
  onRoleChange,
  onStatusChange,
  passwordError,
  formError,
  isUpdating,
  showPassword,
  showConfirmPassword,
  toggleShowPassword,
  toggleShowConfirmPassword
}: EditUserDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl flex items-center">
            <Edit className="h-5 w-5 mr-2 text-blue-500" />
            Edit User
          </DialogTitle>
          <DialogDescription>
            Make changes to the user's information below.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 pt-2">
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm">First Name</Label>
                <div className="relative">
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName || ""}
                    onChange={onChange}
                    placeholder="First name"
                    className="pl-9"
                  />
                  <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                <div className="relative">
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName || ""}
                    onChange={onChange}
                    placeholder="Last name"
                    className="pl-9"
                  />
                  <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={onChange}
                  placeholder="user@example.com"
                  className="pl-9"
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
           
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm">Role</Label>
              
                <Select
                  value={formData.role || "user"}
                  onValueChange={onRoleChange}
                >
                  <SelectTrigger id="role" className="pl-9">
                    <div className="absolute left-3 top-2 h-4 w-4 text-muted-foreground">
                      {getRoleIcon(formData.role || "")}
                    </div>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superAdmin">Super Admin</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={onStatusChange}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
                    <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
                    <SelectItem value={UserStatus.SUSPENDED}>Suspended</SelectItem>
                    <SelectItem value={UserStatus.PENDING}>Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formData.role?.toLowerCase() === 'owner' && (
              <div className="text-xs text-amber-600 dark:text-amber-400 mb-1 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                This user is currently a owner
              </div>
            )}

            {/* Password reset section */}
            <div className="mt-4 pt-4 border-t border-dashed dark:border-slate-700">
              <h3 className="text-base font-medium mb-3 flex items-center">
                <Lock className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                Reset Password
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Leave these fields empty if you don't want to change the password
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-password" className="text-sm">New Password</Label>
                  <div className="relative">
                    <Input
                      id="edit-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password || ""}
                      onChange={onChange}
                      placeholder="Enter new password"
                      className="pl-9 pr-10"
                    />
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={toggleShowPassword}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-confirm-password" className="text-sm">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="edit-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword || ""}
                      onChange={onChange}
                      placeholder="Confirm new password"
                      className="pl-9 pr-10"
                    />
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={toggleShowConfirmPassword}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                  {passwordError && (
                    <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-900 border-t">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={onSubmit}
            disabled={isUpdating || !!formError}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}