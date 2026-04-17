"use client";
// src/app/(dashboardRoute)/admin/properties/pending/page.tsx

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, BedDouble, Bath, Building2, Clock } from "lucide-react";
import { toast } from "sonner";

import { Button }             from "@/components/ui/button";
import { Card, CardContent }  from "@/components/ui/card";
import { Skeleton }           from "@/components/ui/skeleton";
import { Input }              from "@/components/ui/input";
import {
  usePendingProperties,
  useApproveProperty,
  type PendingProperty,
} from "@/hooks/admin/useAdminApi";

export default function AdminPendingPropertiesPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = usePendingProperties();
  const { mutate: approveProperty, isPending: acting } = useApproveProperty();

  const properties: PendingProperty[] = data?.data ?? [];

  // client-side search filter
  const filtered = properties.filter((p) =>
    [p.title, p.city, p.area, p.owner?.name]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function handleApprove(id: string) {
    approveProperty(
      { id, status: "APPROVED" },
      {
        onSuccess: () => toast.success("Property approved!"),
        onError:   () => toast.error("Approval failed"),
      }
    );
  }

  function handleReject(id: string) {
    const reason = window.prompt("Rejection reason:");
    if (!reason?.trim()) return;
    approveProperty(
      { id, status: "REJECTED", rejectionReason: reason },
      {
        onSuccess: () => toast.success("Property rejected"),
        onError:   () => toast.error("Rejection failed"),
      }
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pending Properties</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data?.pagination?.total ?? 0} properties awaiting review
          </p>
        </div>
        <Link href="/admin/properties">
          <Button variant="outline" size="sm" className="text-xs">All Properties →</Button>
        </Link>
      </div>

      {/* Search */}
      <Input
        placeholder="Search by title, city, owner…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-20">
          <Clock size={40} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No pending properties</p>
        </div>
      )}

      {/* Cards */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Card key={p.id} className="overflow-hidden shadow-none hover:shadow-sm transition-shadow">

              {/* Image */}
              <div className="relative h-40 bg-muted">
                {p.images?.[0] ? (
                  <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Building2 size={28} className="text-muted-foreground/20" />
                  </div>
                )}
              </div>

              <CardContent className="p-4 space-y-3">
                {/* Title & Location */}
                <div>
                  <h3 className="font-semibold text-sm line-clamp-1">{p.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin size={11} />
                    {[p.area, p.city].filter(Boolean).join(", ")}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><BedDouble size={11} /> {p.bedrooms ?? "—"}</span>
                  <span className="flex items-center gap-1"><Bath size={11} /> {p.bathrooms ?? "—"}</span>
                  <span className="ml-auto font-bold text-emerald-700 text-sm">
                    ৳{p.rentAmount?.toLocaleString() ?? 0}/mo
                  </span>
                </div>

                {/* Owner */}
                <p className="text-[11px] text-muted-foreground">
                  By: {p.owner?.name ?? "Unknown"} · {p.owner?.email}
                </p>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Link href={`/admin/properties/${p.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      View Details
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(p.id)}
                    disabled={acting}
                    className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(p.id)}
                    disabled={acting}
                    className="text-xs text-destructive border-destructive/30 hover:bg-destructive/5"
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}