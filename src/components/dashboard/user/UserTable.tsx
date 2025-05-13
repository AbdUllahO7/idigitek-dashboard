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
  currentUserRole
}: UserTableProps) {
  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="bg-slate-50 dark:bg-slate-900 rounded-t-lg border-b px-6">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center">
              <UsersIcon className="mr-2 h-5 w-5 text-muted-foreground" />
              Users
              {activeTab !== "all" && (
                <Badge className="ml-2 capitalize">
                  {activeTab}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1.5">
              {searchTerm ? `Search results for "${searchTerm}"` : "Showing all users"}
              {filteredUsers.length > 0 && ` (${filteredUsers.length} ${filteredUsers.length === 1 ? 'user' : 'users'})`}
            </CardDescription>
          </div>
          {activeTab !== "all" && (
            <Button variant="ghost" size="sm" onClick={() => setActiveTab("all")}>
              Clear filter
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
                  <TableHead className="w-[250px] font-medium">Name</TableHead>
                  <TableHead className="w-[250px] font-medium">Email</TableHead>
                  <TableHead className="font-medium">Role</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Created</TableHead>
                  <TableHead className="text-right font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {searchTerm || activeTab !== "all" ? (
                        <div className="flex flex-col items-center justify-center text-muted-foreground py-8">
                          <Search className="h-10 w-10 mb-3 text-muted-foreground/50" />
                          <p className="text-lg mb-1">No users found</p>
                          <p className="text-sm text-muted-foreground/70">
                            {searchTerm && activeTab !== "all" 
                              ? `No ${activeTab} users match "${searchTerm}"` 
                              : searchTerm 
                                ? `No users match "${searchTerm}"`
                                : `No users with status: ${activeTab}`}
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground py-8">
                          <UsersIcon className="h-10 w-10 mb-3 text-muted-foreground/50" />
                          <p className="text-lg mb-1">No users yet</p>
                          <p className="text-sm text-muted-foreground/70">Create your first user to get started</p>
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
                          <span className="capitalize">{user.role || "user"}</span>
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
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            
                            {/* Edit option - only if current user can edit */}
                            {(user.role?.toLowerCase() !== 'owner' || currentUserRole?.toLowerCase() === 'owner') && (
                              <DropdownMenuItem 
                                onClick={() => onEditUser(user)}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
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
                                  Delete
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