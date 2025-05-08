// src/utils/user-helpers.ts
import { Shield, User as UserIcon } from "lucide-react";

// Get full name from user object
export const getFullName = (user: any) => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  } else if (user.firstName) {
    return user.firstName;
  } else if (user.lastName) {
    return user.lastName;
  }
  return "-";
};

// Get initials for avatar
export const getInitials = (user: any) => {
  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  } else if (user.firstName) {
    return user.firstName.charAt(0).toUpperCase();
  } else if (user.lastName) {
    return user.lastName.charAt(0).toUpperCase();
  }
  return user.email.charAt(0).toUpperCase() || 'U';
};

// Get avatar background color based on role
export const getAvatarColor = (role?: string) => {
  switch (role?.toLowerCase()) {
    case 'owner':
      return "bg-gradient-to-br from-yellow-500 to-rose-900 text-white";
    case 'superAdmin':
      return "bg-gradient-to-br from-red-500 to-rose-600 text-white";
    case 'admin':
      return "bg-gradient-to-br from-purple-500 to-indigo-600 text-white";
    default:
      return "bg-gradient-to-br from-blue-500 to-cyan-600 text-white";
  }
};

// Check if user is owner
export const isOwnerRole = (user: any) => {
  return user.role?.toLowerCase() === 'owner';
};

// Format date for display
export const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Get role icon component
export const getRoleIcon = (role: string) => {
  switch (role?.toLowerCase()) {
    case 'owner':
      return <Shield className="h-4 w-4 text-red-900 mr-2" />;
    case 'superAdmin':
      return <Shield className="h-4 w-4 text-red-500 mr-2" />;
    case 'admin':
      return <Shield className="h-4 w-4 text-purple-500 mr-2" />;
    default:
      return <UserIcon className="h-4 w-4 text-blue-500 mr-2" />;
  }
};

// Map form role to API role
export const mapFormRoleToApiRole = (formRole: string): string => {
  const role = formRole.toLowerCase();
  if (role === "admin") return "Admin";
  if (role === "superAdmin") return "superAdmin";
  if (role === "owner") return "owner";
  return "user";
};