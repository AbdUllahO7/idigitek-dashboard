// src/components/users/AddUserDialog.tsx
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
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { getRoleIcon } from "@/src/utils/user-helpers";
import { 
    AlertTriangle, 
    Eye, 
    EyeOff, 
    Info, 
    Loader2, 
    Lock, 
    Mail, 
    Plus, 
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

interface AddUserDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    formData: UserFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRoleChange: (value: string) => void;
    onStatusChange: (value: UserStatus) => void;
    passwordError: string;
    formError: string | null;
    isCreating: boolean;
    superOwnerExists: boolean;
    showPassword: boolean;
    showConfirmPassword: boolean;
    toggleShowPassword: () => void;
    toggleShowConfirmPassword: () => void;
}

export function AddUserDialog({
    isOpen,
    onClose,
    onSubmit,
    formData,
    onChange,
    onRoleChange,
    onStatusChange,
    passwordError,
    formError,
    isCreating,
    superOwnerExists,
    showPassword,
    showConfirmPassword,
    toggleShowPassword,
    toggleShowConfirmPassword
}: AddUserDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl flex items-center">
                <Plus className="h-5 w-5 mr-2 text-blue-500" />
                Add New User
            </DialogTitle>
            <DialogDescription>
                Create a new user account by filling out the form below.
            </DialogDescription>
            </DialogHeader>
            <ScrollArea className="p-6 pt-2 max-h-[calc(80vh-220px)]">
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
                    <Label htmlFor="new-firstName" className="text-sm">First Name</Label>
                    <div className="relative">
                    <Input
                        id="new-firstName"
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
                    <Label htmlFor="new-lastName" className="text-sm">Last Name</Label>
                    <div className="relative">
                    <Input
                        id="new-lastName"
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
                <Label htmlFor="new-email" className="text-sm">Email</Label>
                <div className="relative">
                    <Input
                    id="new-email"
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
                <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm">Password</Label>
                <div className="relative">
                    <Input
                    id="new-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password || ""}
                    onChange={onChange}
                    placeholder="Enter password"
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
                <Label htmlFor="new-confirm-password" className="text-sm">Confirm Password</Label>
                <div className="relative">
                    <Input
                    id="new-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword || ""}
                    onChange={onChange}
                    placeholder="Confirm password"
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
                <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="new-role" className="text-sm">Role</Label>
                    
                    <Select
                    value={formData.role || "user"}
                    onValueChange={onRoleChange}
                    >
                    <SelectTrigger id="new-role" className="pl-9">
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
                    <Label htmlFor="new-status" className="text-sm">Status</Label>
                    <Select
                    value={formData.status}
                    onValueChange={onStatusChange}
                    >
                    <SelectTrigger id="new-status">
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
                {superOwnerExists && formData.role?.toLowerCase() === 'owner' && (
                <div className="text-xs text-amber-600 dark:text-amber-400 mb-1 flex items-center">
                    <Info className="h-3 w-3 mr-1" />
                    A owner already exists in the system
                </div>
                )}
            </div>
            </ScrollArea>
            <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-900 border-t">
            <Button 
                variant="outline" 
                onClick={onClose}
            >
                Cancel
            </Button>
            <Button 
                onClick={onSubmit}
                disabled={isCreating || !!formError}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500"
            >
                {isCreating ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                </>
                ) : (
                "Create User"
                )}
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    );
}