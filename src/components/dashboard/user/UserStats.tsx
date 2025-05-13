// src/components/users/UserStats.tsx
import { Card, CardContent } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";
import { AlertCircle, CheckCircle2, Clock, ShieldAlert, UsersIcon } from "lucide-react";

interface UserStatsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    suspended: number;
  };
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function UserStats({ stats, activeTab, setActiveTab }: UserStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Users</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <UsersIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </CardContent>
      </Card>
      
      <Card 
        className={cn(
          "shadow-sm hover:shadow-md transition-shadow cursor-pointer",
          activeTab === "active" ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-white dark:bg-slate-950"
        )} 
        onClick={() => setActiveTab(activeTab === "active" ? "all" : "active")}
      >
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Active</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.active}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        </CardContent>
      </Card>
      
      <Card 
        className={cn(
          "shadow-sm hover:shadow-md transition-shadow cursor-pointer",
          activeTab === "inactive" ? "bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800" : "bg-white dark:bg-slate-950"
        )} 
        onClick={() => setActiveTab(activeTab === "inactive" ? "all" : "inactive")}
      >
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Inactive</p>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-400">{stats.inactive}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
        </CardContent>
      </Card>
      
      <Card 
        className={cn(
          "shadow-sm hover:shadow-md transition-shadow cursor-pointer",
          activeTab === "pending" ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800" : "bg-white dark:bg-slate-950"
        )} 
        onClick={() => setActiveTab(activeTab === "pending" ? "all" : "pending")}
      >
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.pending}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
        </CardContent>
      </Card>
      
      <Card 
        className={cn(
          "shadow-sm hover:shadow-md transition-shadow cursor-pointer",
          activeTab === "suspended" ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" : "bg-white dark:bg-slate-950"
        )} 
        onClick={() => setActiveTab(activeTab === "suspended" ? "all" : "suspended")}
      >
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Suspended</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.suspended}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}