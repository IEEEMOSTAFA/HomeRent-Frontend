"use client";
// src/app/(dashboardRoute)/admin/properties/page.tsx
// API: GET /api/properties (admin view with all statuses)

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, BedDouble, Bath, Building2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// import StatusBadge from "../_components/StatusBadge";
import { useAllAdminProperties, useAdminDeleteProperty, type PropertyStatus } from "@/hooks/admin/useAdminApi";
import StatusBadge from "@/components/Admin/StatusBadge";

const TABS: { label: string; value: PropertyStatus | "ALL" }[] = [
  { label: "All",      value: "ALL" },
  { label: "Approved", value: "APPROVED" },
  { label: "Pending",  value: "PENDING" },
  { label: "Rejected", value: "REJECTED" },
];

export default function AdminAllPropertiesPage() {
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAllAdminProperties({
    page,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });
  const { mutate: deleteProperty, isPending: deleting } = useAdminDeleteProperty();

  const properties = data?.data ?? [];
  const meta = data?.meta;

  function handleDelete(id: string) {
    deleteProperty(id, {
      onSuccess: () => toast.success("Property deleted"),
      onError:   () => toast.error("Delete failed"),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Properties</h1>
          <p className="text-sm text-muted-foreground mt-1">{meta?.total ?? 0} properties on platform</p>
        </div>
        <Link href="/admin/properties/pending">
          <Button variant="outline" size="sm" className="text-xs">View Pending →</Button>
        </Link>
      </div>

      <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v as typeof statusFilter); setPage(1); }}>
        <TabsList>
          {TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
        </div>
      )}

      {!isLoading && properties.length === 0 && (
        <div className="text-center py-20">
          <Building2 size={40} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No properties found</p>
        </div>
      )}

      {!isLoading && properties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map((p) => (
            <Card key={p.id} className="overflow-hidden shadow-none hover:shadow-sm transition-shadow">
              <div className="relative h-40 bg-muted">
                {p.images[0] ? (
                  <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Building2 size={28} className="text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute top-2 right-2"><StatusBadge status={p.status} /></div>
              </div>
              <CardContent className="p-4 space-y-2">
                <div>
                  <h3 className="font-semibold text-sm line-clamp-1">{p.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin size={11} /> {p.area}, {p.city}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><BedDouble size={11} /> {p.bedrooms}</span>
                  <span className="flex items-center gap-1"><Bath size={11} /> {p.bathrooms}</span>
                  <Badge variant="secondary" className="text-[10px] ml-auto">{p.type.replace("_"," ")}</Badge>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-emerald-700 text-sm">৳{p.rentAmount.toLocaleString()}/mo</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/5">
                        <Trash2 size={11} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete property?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently remove <strong>{p.title}</strong>.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(p.id)} disabled={deleting} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <p className="text-[11px] text-muted-foreground">By: {p.owner.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <span className="text-sm text-muted-foreground">{meta.page} / {meta.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}>Next</Button>
        </div>
      )}
    </div>
  );
}