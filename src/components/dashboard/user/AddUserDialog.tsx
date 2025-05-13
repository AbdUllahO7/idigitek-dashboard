"use client"

// src/components/users/AddUserDialog.tsx
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { getRoleIcon } from "@/src/utils/user-helpers"
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Info,
  Loader2,
  Lock,
  Mail,
  Plus,
  UserIcon,
  Shield,
  CheckCircle2,
} from "lucide-react"
import type React from "react"
import { UserStatus } from "@/src/api/user.types"

interface UserFormData {
  id?: string
  firstName?: string
  lastName?: string
  email: string
  password?: string
  confirmPassword?: string
  role?: string
  status: UserStatus
}

interface AddUserDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  formData: UserFormData
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRoleChange: (value: string) => void
  onStatusChange: (value: UserStatus) => void
  passwordError: string
  formError: string | null
  isCreating: boolean
  superOwnerExists: boolean
  showPassword: boolean
  showConfirmPassword: boolean
  toggleShowPassword: () => void
  toggleShowConfirmPassword: () => void
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
  toggleShowConfirmPassword,
}: AddUserDialogProps) {
  // Function to get status icon and color
  const getStatusInfo = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return { icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, color: "text-emerald-500" }
      case UserStatus.INACTIVE:
        return { icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, color: "text-amber-500" }
      case UserStatus.SUSPENDED:
        return { icon: <Shield className="h-4 w-4 text-red-500" />, color: "text-red-500" }
      case UserStatus.PENDING:
        return { icon: <Info className="h-4 w-4 text-blue-500" />, color: "text-blue-500" }
      default:
        return { icon: <Info className="h-4 w-4" />, color: "" }
    }
  }

  const statusInfo = getStatusInfo(formData.status)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-lg border shadow-lg">
        <DialogHeader className="p-6 pb-2 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
          <DialogTitle className="text-xl font-semibold flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
              <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            Add New User
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400 mt-1.5">
            Create a new user account by filling out the form below.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="p-6 pt-4 max-h-[calc(80vh-220px)]">
          {formError && (
            <Alert
              variant="destructive"
              className="mb-5 border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900"
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 space-x-2">
                <Label htmlFor="new-firstName" className="text-sm font-medium">
                  First Name
                </Label>
                <div className="relative">
                  <Input
                    id="new-firstName"
                    name="firstName"
                    value={formData.firstName || ""}
                    onChange={onChange}
                    placeholder="First name"
                    className="pl-9 h-10 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>
              <div className="space-y-2 mr-2">
                <Label htmlFor="new-lastName" className="text-sm font-medium">
                  Last Name
                </Label>
                <div className="relative">
                  <Input
                    id="new-lastName"
                    name="lastName"
                    value={formData.lastName || ""}
                    onChange={onChange}
                    placeholder="Last name"
                    className="pl-9 h-10 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="space-y-2 space-x-2 mr-2">
              <Label htmlFor="new-email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="new-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={onChange}
                  placeholder="user@example.com"
                  className="pl-9 h-10 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20"
                />
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-2 space-x-2 mr-2">
              <Label htmlFor="new-password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password || ""}
                  onChange={onChange}
                  placeholder="Enter password"
                  className="pl-9 pr-10 h-10 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20"
                />
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  onClick={toggleShowPassword}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2 space-x-2 mr-2">
              <Label htmlFor="new-confirm-password" className="text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="new-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword || ""}
                  onChange={onChange}
                  placeholder="Confirm password"
                  className="pl-9 pr-10 h-10 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20"
                />
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  onClick={toggleShowConfirmPassword}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
              {passwordError && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1 flex-shrink-0" />
                  {passwordError}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-1">
              <div className="space-y-2 space-x-2 mr-2 pb-5">
                <Label htmlFor="new-role" className="text-sm font-medium">
                  User Role
                </Label>
                <Select value={formData.role || "user"} onValueChange={onRoleChange}>
                  <SelectTrigger
                    id="new-role"
                    className="pl-9 h-10 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[var(--radix-select-content-available-height)] overflow-y-auto">
                    <SelectItem value="user" className="py-2.5">
                      User
                    </SelectItem>
                    <SelectItem value="admin" className="py-2.5">
                      Admin
                    </SelectItem>
                    <SelectItem value="superAdmin" className="py-2.5">
                      Super Admin
                    </SelectItem>
                    <SelectItem value="owner" className="py-2.5">
                      Owner
                    </SelectItem>
                  </SelectContent>
                </Select>
                {superOwnerExists && formData.role?.toLowerCase() === "owner" && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-center">
                    <Info className="h-3 w-3 mr-1 flex-shrink-0" />
                    An owner already exists in the system
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-status" className="text-sm font-medium">
                  Account Status
                </Label>
                <Select value={formData.status} onValueChange={onStatusChange}>
                  <SelectTrigger
                    id="new-status"
                    className="pl-9 h-10 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[var(--radix-select-content-available-height)] overflow-y-auto">
                    <SelectItem value={UserStatus.ACTIVE} className="py-2.5">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />
                        <span>Active</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={UserStatus.INACTIVE} className="py-2.5">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                        <span>Inactive</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={UserStatus.SUSPENDED} className="py-2.5">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-red-500 mr-2" />
                        <span>Suspended</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={UserStatus.PENDING} className="py-2.5">
                      <div className="flex items-center">
                        <Info className="h-4 w-4 text-blue-500 mr-2" />
                        <span>Pending</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-900 border-t flex-col sm:flex-row gap-3 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isCreating || !!formError}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 transition-all duration-200"
          >
            {isCreating ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Plus className="mr-2 h-4 w-4" />
                Create User
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
