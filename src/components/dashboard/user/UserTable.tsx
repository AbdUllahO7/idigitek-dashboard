// src/components/users/UserTable.tsx
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/src/components/ui/dropdown-menu";
import { Badge } from "@/src/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/src/components/ui/card";
import { TableLoader } from "@/src/components/ui/loader";
import { formatDate, getFullName, getRoleIcon, isOwnerRole } from "@/src/utils/user-helpers";
import { 
  Calendar, 
  Edit, 
  Mail, 
  MoreVertical, 
  Search, 
  Trash2, 
  UsersIcon,
  Grid,
  List,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { UserAvatar } from "./UserAvatar";
import { UserStatusBadge } from "./UserStatusBadge";
import { UserStatus } from "@/src/api/user.types";

interface UserTableProps {
  users: any[];
  filteredUsers: any[];
  isLoading: boolean;
  activeTab: string;
  searchTerm: string;
  setActiveTab: (tab: string) => void;
  onViewUser: (user: any) => void;
  onEditUser: (user: any) => void;
  onDeleteUser: (user: any) => void;
  currentUserRole: string;
  t: (key: string, fallback?: string) => string;
}

export function UserTable({
  users,
  filteredUsers,
  isLoading,
  activeTab,
  searchTerm,
  setActiveTab,
  onViewUser,
  onEditUser,
  onDeleteUser,
  currentUserRole,
  t
}: UserTableProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'list' | 'tiles'>('cards');

  // Helper functions (keep existing ones)
  const getUserCountText = (count: number) => {
    if (count === 1) {
      return t('Users.table.user', 'user')
    }
    return t('Users.table.users', 'users')
  }

  const getFilterDisplayName = (filter: string) => {
    const filterMap: Record<string, string> = {
      'all': t('Users.table.filters.all', 'All Users'),
      'active': t('Users.table.filters.active', 'Active'),
      'inactive': t('Users.table.filters.inactive', 'Inactive'),
      'owner': t('Users.table.filters.owner', 'Owners'),
      'admin': t('Users.table.filters.admin', 'Admins'),
      'user': t('Users.table.filters.user', 'Users'),
      'superAdmin': t('Users.table.filters.superAdmin', 'Super Admins')
    }
    return filterMap[filter] || filter
  }

  const getTranslatedRole = (role: string) => {
    const roleMap: Record<string, string> = {
      'owner': t('Users.roles.owner', 'Owner'),
      'superAdmin': t('Users.roles.superAdmin', 'Super Admin'),
      'admin': t('Users.roles.admin', 'Admin'),
      'user': t('Users.roles.user', 'User'),
      'moderator': t('Users.roles.moderator', 'Moderator'),
      'editor': t('Users.roles.editor', 'Editor'),
      'viewer': t('Users.roles.viewer', 'Viewer')
    }
    return roleMap[role] || role
  }

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'owner': return 'from-yellow-400 to-orange-500 dark:from-yellow-500 dark:to-orange-400';
      case 'superadmin': return 'from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400';
      case 'admin': return 'from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400';
      case 'moderator': return 'from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400';
      case 'editor': return 'from-orange-500 to-red-500 dark:from-orange-400 dark:to-red-400';
      default: return 'from-gray-500 to-slate-500 dark:from-gray-400 dark:to-slate-400';
    }
  };

  // User Action Dropdown Component
  const UserActionDropdown = ({ user }: { user: any }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100 dark:hover:bg-slate-700/60"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="sr-only">{t('Users.table.openMenu', 'Open menu')}</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <DropdownMenuLabel className="text-slate-900 dark:text-slate-100">
          {t('Users.table.actions', 'Actions')}
        </DropdownMenuLabel>
        
        {(user.role?.toLowerCase() !== 'owner' || currentUserRole?.toLowerCase() === 'owner') && (
          <DropdownMenuItem 
            onClick={(e) => {
              e.stopPropagation();
              onEditUser(user);
            }}
            className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100"
          >
            <Edit className="mr-2 h-4 w-4" />
            {t('Users.buttons.edit', 'Edit')}
          </DropdownMenuItem>
        )}

        {!isOwnerRole(user) && (
          <>
            <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onDeleteUser(user);
              }}
              className="cursor-pointer text-red-600 focus:text-red-600 dark:focus:text-red-400 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('Users.buttons.delete', 'Delete')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Card Grid Layout
  const CardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredUsers.map((user) => (
        <div
          key={user.id || user._id}
          className="group relative shadow-xl bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-slate-900/20 hover:-translate-y-1 cursor-pointer backdrop-blur-sm"
          onClick={() => onViewUser(user)}
        >
          {/* Status indicator */}
          <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
            user.status === 'active' 
              ? 'bg-green-500 shadow-lg shadow-green-500/50 dark:shadow-green-400/40' 
              : 'bg-gray-400 dark:bg-gray-500'
          }`} />
          
          <div className="p-6">
            {/* Header with avatar and role */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <UserAvatar user={user} size="lg" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {getFullName(user)}
                  </h3>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="text-slate-600 dark:text-slate-400">
                      {getRoleIcon(user.role || "")}
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                      {getTranslatedRole(user.role || "user")}
                    </span>
                  </div>
                </div>
              </div>
              
              <UserActionDropdown user={user} />
            </div>

            {/* Email */}
            <div className="flex items-center space-x-2 mb-3 text-slate-600 dark:text-slate-400">
              <Mail className="w-4 h-4" />
              <span className="text-sm truncate">{user.email}</span>
            </div>

            {/* Status */}
            <div className="mb-4">
              <UserStatusBadge status={user.status as UserStatus} />
            </div>

            {/* Created date */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{t('Users.table.headers.createdAt', 'Created')}</span>
              <span className="font-medium">{formatDate(user.createdAt)}</span>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              {(user.role?.toLowerCase() !== 'owner' || currentUserRole?.toLowerCase() === 'owner') && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditUser(user);
                  }}
                  className="flex-1 bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-600/80 text-slate-700 dark:text-slate-200 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                >
                  <Edit className="w-3 h-3" />
                  <span>{t('Users.buttons.edit', 'Edit')}</span>
                </button>
              )}
              {!isOwnerRole(user) && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteUser(user);
                  }}
                  className="bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Compact List View
  const ListView = () => (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 overflow-hidden backdrop-blur-sm">
      {filteredUsers.map((user, index) => (
        <div
          key={user.id || user._id}
          className={`group flex  items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer ${
            index !== filteredUsers.length - 1 ? 'border-b border-slate-100 dark:border-slate-700/60' : ''
          }`}
          onClick={() => onViewUser(user)}
        >
          <div className="flex items-center space-x-4 flex-1">
            {/* Avatar with status */}
            <div className="relative">
              <UserAvatar user={user} size="md" />
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${
                user.status === 'active' ? 'bg-green-500 dark:bg-green-400' : 'bg-gray-400 dark:bg-gray-500'
              }`} />
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {getFullName(user)}
                </h3>
                <div className="flex items-center space-x-1">
                  <div className="text-slate-500 dark:text-slate-400">
                    {getRoleIcon(user.role || "")}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                    {getTranslatedRole(user.role || "user")}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                {user.email}
              </p>
            </div>

            {/* Status */}
            <div className="hidden md:block">
              <UserStatusBadge status={user.status as UserStatus} />
            </div>

            {/* Created date */}
            <div className="hidden lg:block text-right">
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('Users.table.headers.createdAt', 'Created')}</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {formatDate(user.createdAt)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <UserActionDropdown user={user} />
          </div>
        </div>
      ))}
    </div>
  );

  // Dashboard Tiles View
  const TilesView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {filteredUsers.map((user) => (
        <div
          key={user.id || user._id}
          className="group relative shadow-xl bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-800/90 dark:to-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60 p-4 hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-slate-900/30 transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-sm"
          onClick={() => onViewUser(user)}
        >
          {/* Status and role indicator */}
          <div className="flex items-center justify-between mb-3">
            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${getRoleColor(user.role || 'user')}`}>
              <div className="text-white">
                {getRoleIcon(user.role || "")}
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full ${
              user.status === 'active' ? 'bg-green-500 dark:bg-green-400' : 'bg-gray-400 dark:bg-gray-500'
            }`} />
          </div>

          {/* Avatar */}
          <div className="text-center mb-3">
            <UserAvatar user={user} size="lg" className="mx-auto" />
          </div>

          {/* User info */}
          <div className="text-center">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1">
              {getFullName(user)}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 capitalize">
              {getTranslatedRole(user.role || "user")}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user.email}
            </p>
          </div>

          {/* Quick actions overlay */}
          <div className="absolute inset-0 bg-black/5 dark:bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
            {(user.role?.toLowerCase() !== 'owner' || currentUserRole?.toLowerCase() === 'owner') && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEditUser(user);
                }}
                className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-lg hover:scale-110 transition-transform border border-slate-200 dark:border-slate-600"
              >
                <Edit className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
            )}
            {!isOwnerRole(user) && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteUser(user);
                }}
                className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-lg hover:scale-110 transition-transform border border-slate-200 dark:border-slate-600"
              >
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // Empty State Component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {searchTerm || activeTab !== "all" ? (
        <>
          <Search className="h-12 w-12 mb-4 text-slate-400 dark:text-slate-500" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-2">
            {t('Users.table.noUsersFound', 'No users found')}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            {searchTerm && activeTab !== "all" 
              ? t('Users.table.noFilteredSearchResults', `No ${getFilterDisplayName(activeTab).toLowerCase()} users match "${searchTerm}"`)
              : searchTerm 
                ? t('Users.table.noSearchResults', `No users match "${searchTerm}"`)
                : t('Users.table.noFilterResults', `No users with status: ${getFilterDisplayName(activeTab)}`)
            }
          </p>
        </>
      ) : (
        <>
          <UsersIcon className="h-12 w-12 mb-4 text-slate-400 dark:text-slate-500" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-2">
            {t('Users.table.noUsersYet', 'No users yet')}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            {t('Users.table.createFirstUser', 'Create your first user to get started')}
          </p>
        </>
      )}
    </div>
  );

  return (
    <Card className="border-none shadow-xl dark:shadow-2xl dark:shadow-slate-900/20">
      <CardHeader className="bg-slate-50 dark:bg-slate-900/80 rounded-t-lg border-b border-slate-200 dark:border-slate-700 px-6">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center text-slate-900 dark:text-slate-100">
              <UsersIcon className="mr-2 h-5 w-5 text-muted-foreground" />
              {t('Users.table.title', 'Users')}
              {activeTab !== "all" && (
                <Badge className="ml-2 capitalize bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                  {getFilterDisplayName(activeTab)}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1.5 text-slate-600 dark:text-slate-400">
              {searchTerm ? 
                t('Users.table.searchResults', 'Search results for "{{term}}"').replace('{{term}}', searchTerm) : 
                t('Users.table.showingAll', 'Showing all users')
              }
              {filteredUsers.length > 0 && (
                ` (${filteredUsers.length} ${getUserCountText(filteredUsers.length)})`
              )}
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View mode toggle */}
            <div className="flex items-center bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewMode('cards')}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === 'cards'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                )}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('tiles')}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === 'tiles'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {activeTab !== "all" && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveTab("all")}
                className="hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300"
              >
                {t('Users.buttons.clearFilter', 'Clear filter')}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 bg-white dark:bg-slate-800/40">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <TableLoader />
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="transition-all duration-300">
            {viewMode === 'cards' && <CardsView />}
            {viewMode === 'list' && <ListView />}
            {viewMode === 'tiles' && <TilesView />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}