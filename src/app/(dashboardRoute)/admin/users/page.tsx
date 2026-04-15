"use client";
// src/app/(dashboardRoute)/admin/users/page.tsx
// API: GET /api/users | PATCH /api/users/:id/ban

import { useState } from "react";
import { Search, Ban, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// import StatusBadge from "../_components/StatusBadge";
import { useAdminUsers, useBanUser, type UserRole } from "@/hooks/admin/useAdminApi";
import StatusBadge from "@/components/Admin/StatusBadge";

const ROLE_TABS: { label: string; value: UserRole | "ALL" }[] = [
  { label: "All",    value: "ALL" },
  { label: "Users",  value: "USER" },
  { label: "Owners", value: "OWNER" },
  { label: "Admins", value: "ADMIN" },
];

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);

  const { data, isLoading } = useAdminUsers({
    page,
    role:   roleFilter === "ALL" ? undefined : roleFilter,
    search: search || undefined,
  });
  const { mutate: banUser, isPending: banning } = useBanUser();

  const users = data?.data ?? [];
  const pagination = data?.pagination;

  function handleBan(id: string, isBanned: boolean) {
    banUser(
      { id, isBanned },
      {
        onSuccess: () => toast.success(isBanned ? "User banned" : "User unbanned"),
        onError:   () => toast.error("Action failed"),
      }
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Users</h1>
        <p className="text-sm text-muted-foreground mt-1">{pagination?.total ?? 0} registered users</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name or email…"
            className="pl-9 h-9 text-sm"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Tabs value={roleFilter} onValueChange={(v) => { setRoleFilter(v as typeof roleFilter); setPage(1); }}>
          <TabsList>
            {ROLE_TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
          </TabsList>
        </Tabs>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && users.length === 0 && (
        <div className="text-center py-20 text-muted-foreground text-sm">
          <Users size={36} className="mx-auto mb-3 text-muted-foreground/20" />
          No users found
        </div>
      )}

      {/* Table */}
      {!isLoading && users.length > 0 && (
        <Card className="shadow-none">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left px-5 py-3 font-medium">User</th>
                    <th className="text-left px-4 py-3 font-medium">Role</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Joined</th>
                    <th className="text-right px-5 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-xs font-bold flex-shrink-0">
                            {u.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={u.role} />
                      </td>
                      <td className="px-4 py-3.5">
                        {u.isBanned ? (
                          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 text-[11px]">Banned</Badge>
                        ) : (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 text-[11px]">Active</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-7 text-xs gap-1.5 ${u.isBanned
                                ? "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                : "text-destructive border-destructive/30 hover:bg-destructive/5"}`}
                            >
                              {u.isBanned ? <><ShieldCheck size={11} /> Unban</> : <><Ban size={11} /> Ban</>}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{u.isBanned ? "Unban" : "Ban"} {u.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {u.isBanned
                                  ? "This will restore their access to the platform."
                                  : "This will block their access to all protected routes."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleBan(u.id, !u.isBanned)}
                                disabled={banning}
                                className={u.isBanned ? "bg-emerald-600 hover:bg-emerald-700" : "bg-destructive hover:bg-destructive/90"}
                              >
                                Confirm
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <span className="text-sm text-muted-foreground">{pagination.page} / {pagination.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}>Next</Button>
        </div>
      )}
    </div>
  );
}