// src/components/users/UserStatusBadge.tsx
import { UserStatus } from "@/src/api/user.types";
import { Badge } from "@/src/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, ShieldAlert } from "lucide-react";

interface UserStatusBadgeProps {
  status: UserStatus;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  switch (status) {
    case UserStatus.ACTIVE:
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Active</span>
        </Badge>
      );
    case UserStatus.INACTIVE:
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Inactive</span>
        </Badge>
      );
    case UserStatus.SUSPENDED:
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 flex items-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Suspended</span>
        </Badge>
      );
    case UserStatus.PENDING:
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>Pending</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Unknown</span>
        </Badge>
      );
  }
}