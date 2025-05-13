// src/components/users/ViewUserDialog.tsx
import { Button } from "@/src/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogTitle 
} from "@/src/components/ui/dialog";
import { formatDate, getRoleIcon } from "@/src/utils/user-helpers";
import { AlertCircle, Calendar, CheckCircle2, Edit, Mail, RefreshCw, Trash2 } from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import { UserStatusBadge } from "./UserStatusBadge";

interface ViewUserDialogProps {
  user: any | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (user: any) => void;
  onDelete?: (user: any) => void;
  canEditOwner: boolean;
}

export function ViewUserDialog({ 
  user, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete,
  canEditOwner
}: ViewUserDialogProps) {
  if (!user) return null;
  
  const isOwner = user.role?.toLowerCase() === 'owner';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle></DialogTitle>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
        <div className="relative">
          {/* Header gradient background */}
          <div className="absolute inset-0 h-40 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700" />
          
          {/* User card with avatar that overlaps the gradient */}
          <div className="relative pt-16 px-6">
            <div className="flex flex-col items-center">
              <UserAvatar user={user} size="lg" />
              <h2 className="mt-4 text-2xl font-bold">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user.firstName || user.lastName || "User"}
              </h2>
              <div className="flex items-center mt-1 text-muted-foreground">
                <Mail className="h-4 w-4 mr-1.5" />
                <span>{user.email}</span>
              </div>
              <div className="mt-3">
                <UserStatusBadge status={user.status} />
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Role</h3>
                  <div className="flex items-center">
                    {getRoleIcon(user.role || "")}
                    <span className="font-medium capitalize">{user.role || "User"}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Account Created</h3>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h3>
                  <div className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{formatDate(user.updatedAt)}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Email Verification</h3>
                  <div className="flex items-center">
                    {user.isEmailVerified ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        <span className="text-green-600 dark:text-green-400">Verified</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                        <span className="text-amber-600 dark:text-amber-400">Not verified</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t">
            <div className="flex items-center justify-between w-full">
              <div>
                {/* Only show Delete button if user is not owner */}
                {!isOwner && (
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onDelete?.(user);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                >
                  Close
                </Button>
                
                {/* Only show Edit button if current user can edit this user */}
                {(!isOwner || canEditOwner) && (
                  <Button 
                    onClick={() => {
                      onClose();
                      onEdit?.(user);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit User
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}