"use client";

// import { AdminUser } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminUser } from "@/types,/admin";

interface UserTableProps {
  users: AdminUser[];
  onToggleBan: (user: AdminUser) => void;
}

const roleBadgeColor: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700 border-red-200",
  TUTOR: "bg-purple-100 text-purple-700 border-purple-200",
  STUDENT: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function UserTable({ users, onToggleBan }: UserTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left px-4 py-3 font-medium">Name</th>
            <th className="text-left px-4 py-3 font-medium">Email</th>
            <th className="text-left px-4 py-3 font-medium">Role</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="text-left px-4 py-3 font-medium">Joined</th>
            <th className="text-left px-4 py-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">{user.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full border font-medium ${roleBadgeColor[user.role]}`}
                >
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3">
                {user.isBanned ? (
                  <Badge variant="destructive">Banned</Badge>
                ) : (
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    Active
                  </Badge>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                {user.role !== "ADMIN" && (
                  <Button
                    size="sm"
                    variant={user.isBanned ? "outline" : "destructive"}
                    onClick={() => onToggleBan(user)}
                  >
                    {user.isBanned ? "Unban" : "Ban"}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}