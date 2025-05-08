// src/components/users/UserAvatar.tsx
import { cn } from "@/src/lib/utils";
import { getAvatarColor, getInitials } from "@/src/utils/user-helpers";

interface UserAvatarProps {
  user: any;
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({ user, size = "md" }: UserAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-24 h-24 text-3xl border-4 border-white dark:border-slate-900 shadow-lg"
  };

  return (
    <div 
      className={cn(
        "rounded-full flex items-center justify-center font-semibold",
        getAvatarColor(user.role),
        sizeClasses[size]
      )}
    >
      {getInitials(user)}
    </div>
  );
}