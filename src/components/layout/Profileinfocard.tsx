"use client";

// ================= PROFILE INFO CARD =================
// Reusable component — shows read-only user info in a styled card
// Used in: student/profile, tutor/profile

type ProfileInfoCardProps = {
  email: string;
  role: string;
  createdAt: string;
  image?: string | null;
  name: string;
};

export function ProfileInfoCard({
  email,
  role,
  createdAt,
  image,
  name,
}: ProfileInfoCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 shadow-sm">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-primary/5 translate-y-1/2 -translate-x-1/2" />

      <div className="relative flex items-center gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20 ring-offset-2"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 ring-2 ring-primary/20 ring-offset-2 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">{initials}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-lg truncate">{name}</p>
          <p className="text-sm text-muted-foreground truncate">{email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary">
              {role}
            </span>
            <span className="text-xs text-muted-foreground">
              Joined {new Date(createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}