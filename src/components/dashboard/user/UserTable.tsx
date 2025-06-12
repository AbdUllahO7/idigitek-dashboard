// src/components/users/UserTable.tsx
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/src/components/ui/table";
import { TableLoader } from "@/src/components/ui/loader";
import { formatDate, getFullName, getRoleIcon, isOwnerRole } from "@/src/utils/user-helpers";
import { Calendar, Edit, Mail, MoreVertical, Search, Trash2, UsersIcon } from "lucide-react";
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
  t: (key: string, fallback?: string) => string; // Add translation function
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
  // Helper function for pluralization
  const getUserCountText = (count: number) => {
    if (count === 1) {
      return t('Users.table.user', 'user')
    }
    return t('Users.table.users', 'users')
  }

  // Helper function for translated filter names
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

  // Helper function for translated role names
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

  return (
    <Card className="border-none shadow-xl">
      <CardHeader className="bg-slate-50 dark:bg-slate-900 rounded-t-lg border-b px-6">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center">
              <UsersIcon className="mr-2 h-5 w-5 text-muted-foreground" />
              {t('Users.table.title', 'Users')}
              {activeTab !== "all" && (
                <Badge className="ml-2 capitalize">
                  {getFilterDisplayName(activeTab)}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1.5">
              {searchTerm ? 
                t('Users.table.searchResults', 'Search results for "{{term}}"') : 
                t('Users.table.showingAll', 'Showing all users')
              }
              {filteredUsers.length > 0 && (
                ` (${filteredUsers.length} ${getUserCountText(filteredUsers.length)})`
              )}
            </CardDescription>
          </div>
          {activeTab !== "all" && (
            <Button variant="ghost" size="sm" onClick={() => setActiveTab("all")}>
              {t('Users.buttons.clearFilter', 'Clear filter')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8">
            <TableLoader />
          </div>
        ) : (
          <div className="rounded-b-lg overflow-hidden">
            <Table className="border-collapse">
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="w-[250px] font-medium">
                    {t('Users.table.headers.name', 'Name')}
                  </TableHead>
                  <TableHead className="w-[250px] font-medium">
                    {t('Users.table.headers.email', 'Email')}
                  </TableHead>
                  <TableHead className="font-medium">
                    {t('Users.table.headers.role', 'Role')}
                  </TableHead>
                  <TableHead className="font-medium">
                    {t('Users.table.headers.status', 'Status')}
                  </TableHead>
                  <TableHead className="font-medium">
                    {t('Users.table.headers.createdAt', 'Created')}
                  </TableHead>
                  <TableHead className="text-right font-medium">
                    {t('Users.table.headers.actions', 'Actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {searchTerm || activeTab !== "all" ? (
                        <div className="flex flex-col items-center justify-center text-muted-foreground py-8">
                          <Search className="h-10 w-10 mb-3 text-muted-foreground/50" />
                          <p className="text-lg mb-1">
                            {t('Users.table.noUsersFound', 'No users found')}
                          </p>
                          <p className="text-sm text-muted-foreground/70">
                            {searchTerm && activeTab !== "all" 
                              ? t('Users.table.noFilteredSearchResults', `No ${getFilterDisplayName(activeTab).toLowerCase()} users match "${searchTerm}"`)
                              : searchTerm 
                                ? t('Users.table.noSearchResults', `No users match "${searchTerm}"`)
                                : t('Users.table.noFilterResults', `No users with status: ${getFilterDisplayName(activeTab)}`)
                            }
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground py-8">
                          <UsersIcon className="h-10 w-10 mb-3 text-muted-foreground/50" />
                          <p className="text-lg mb-1">
                            {t('Users.table.noUsersYet', 'No users yet')}
                          </p>
                          <p className="text-sm text-muted-foreground/70">
                            {t('Users.table.createFirstUser', 'Create your first user to get started')}
                          </p>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow 
                      key={user.id || user._id} 
                      className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50"
                      onClick={() => onViewUser(user)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <UserAvatar user={user} size="md" />
                          <span className="ml-3">{getFullName(user)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getRoleIcon(user.role || "")}
                          <span className="capitalize">
                            {getTranslatedRole(user.role || "user")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <UserStatusBadge status={user.status as UserStatus} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">
                                {t('Users.table.openMenu', 'Open menu')}
                              </span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                              {t('Users.table.actions', 'Actions')}
                            </DropdownMenuLabel>
                            
                            {/* Edit option - only if current user can edit */}
                            {(user.role?.toLowerCase() !== 'owner' || currentUserRole?.toLowerCase() === 'owner') && (
                              <DropdownMenuItem 
                                onClick={() => onEditUser(user)}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                {t('Users.buttons.edit', 'Edit')}
                              </DropdownMenuItem>
                            )}

                            {/* Delete option - only if user is not owner */}
                            {!isOwnerRole(user) && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => onDeleteUser(user)}
                                  className="cursor-pointer text-red-600 focus:text-red-600 dark:focus:text-red-400 dark:text-red-400"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t('Users.buttons.delete', 'Delete')}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}