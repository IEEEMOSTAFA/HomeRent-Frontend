"use client";
// src/app/(dashboardRoute)/owner/properties/page.tsx
// API: GET /api/owner/properties | DELETE /api/owner/properties/:id

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Building2, MapPin, BedDouble, Bath, Pencil, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// import StatusBadge from "../_components/StatusBadge";
import { useOwnerProperties, useDeleteProperty, type PropertyStatus } from "@/hooks/owner/useOwnerApi";
import StatusBadge from "@/components/owner/StatusBadge";

const TABS: { label: string; value: PropertyStatus | "ALL" }[] = [
  { label: "All",      value: "ALL" },
  { label: "Approved", value: "APPROVED" },
  { label: "Pending",  value: "PENDING" },
  { label: "Rejected", value: "REJECTED" },
];

export default function MyPropertiesPage() {
  const [activeTab, setActiveTab] = useState<PropertyStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useOwnerProperties({
    page,
    status: activeTab === "ALL" ? undefined : activeTab,
  });
  const { mutate: deleteProperty, isPending: deleting } = useDeleteProperty();

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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Properties</h1>
          <p className="text-sm text-muted-foreground mt-1">{meta?.total ?? 0} properties</p>
        </div>
        <Link href="/owner/properties/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
            <Plus size={15} /> Add Property
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as typeof activeTab); setPage(1); }}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && properties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Building2 size={44} className="text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">No properties found</p>
          <Link href="/owner/properties/new">
            <Button variant="link" className="text-emerald-600 mt-2">Add your first property →</Button>
          </Link>
        </div>
      )}

      {/* Grid */}
      {!isLoading && properties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map((p) => (
            <Card key={p.id} className="overflow-hidden shadow-none hover:shadow-sm transition-shadow">
              {/* Image */}
              <div className="relative h-44 bg-muted">
                {p.images[0] ? (
                  <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Building2 size={32} className="text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <StatusBadge status={p.status} />
                </div>
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-[10px] font-medium">
                    {p.type.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4 space-y-2">
                <div>
                  <h3 className="font-semibold text-sm leading-tight line-clamp-1">{p.title}</h3>
                  <div className="flex items-center gap-1 mt-1 text-muted-foreground text-xs">
                    <MapPin size={11} /> {p.area}, {p.city}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><BedDouble size={11} /> {p.bedrooms} bed</span>
                  <span className="flex items-center gap-1"><Bath size={11} /> {p.bathrooms} bath</span>
                  <span className="ml-auto font-bold text-emerald-700 text-sm">
                    ৳{p.rentAmount.toLocaleString()}/mo
                  </span>
                </div>

                {p.status === "REJECTED" && p.rejectionReason && (
                  <div className="flex items-start gap-1.5 text-xs text-destructive bg-destructive/5 rounded-md px-2.5 py-2">
                    <AlertCircle size={11} className="mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{p.rejectionReason}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-1.5 pt-1">
                  <Link href={`/owner/properties/${p.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs h-8">View</Button>
                  </Link>
                  <Link href={`/owner/properties/${p.id}/edit`}>
                    <Button variant="outline" size="sm" className="text-xs h-8 gap-1 text-blue-600 border-blue-200 hover:bg-blue-50">
                      <Pencil size={11} /> Edit
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs h-8 gap-1 text-destructive border-destructive/30 hover:bg-destructive/5">
                        <Trash2 size={11} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Property?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete <strong>{p.title}</strong> and all its bookings. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {meta.page} of {meta.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}>
            Next
          </Button>
        </div>
      )}

    </div>
  );
}