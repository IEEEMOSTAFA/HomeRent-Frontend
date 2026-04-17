"use client";

// ✅ FILE PATH: src/app/(ownerRoute)/owner/properties/page.tsx

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, MapPin, BedDouble, Bath, Pencil, Trash2, Building2, AlertCircle, Eye } from "lucide-react";
import { toast } from "sonner";

// ── shadcn components ──────────────────────────────────────────────────────────
import { Button }   from "@/components/ui/button";
import { Badge }    from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// ── hooks ──────────────────────────────────────────────────────────────────────
import {
  useOwnerProperties,
  useDeleteProperty,
  type PropertyStatus,
  type Property,
} from "@/hooks/owner/useOwnerApi";

// ── Tab Config ─────────────────────────────────────────────────────────────────
const TABS: { label: string; value: PropertyStatus | "ALL" }[] = [
  { label: "All",      value: "ALL"      },
  { label: "Approved", value: "APPROVED" },
  { label: "Pending",  value: "PENDING"  },
  { label: "Rejected", value: "REJECTED" },
];

// ── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: PropertyStatus }) {
  const styles: Record<PropertyStatus, string> = {
    APPROVED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    PENDING:  "bg-amber-500/20  text-amber-400  border-amber-500/30",
    REJECTED: "bg-red-500/20    text-red-400    border-red-500/30",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles[status]}`}>
      {status}
    </span>
  );
}

// ── Property Card ──────────────────────────────────────────────────────────────
function PropertyCard({
  property,
  onDelete,
  deleting,
}: {
  property: Property;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  return (
    <Card className="overflow-hidden border border-white/10 shadow-none hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5 transition-all duration-200 bg-zinc-900">

      {/* ── Image ── */}
      <div className="relative h-44 bg-zinc-800">
        {property.images?.[0] ? (
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Building2 size={36} className="text-zinc-600" />
          </div>
        )}

        {/* Status badge — top right */}
        <div className="absolute top-2.5 right-2.5">
          <StatusBadge status={property.status} />
        </div>

        {/* Type badge — top left */}
        <div className="absolute top-2.5 left-2.5">
          <Badge variant="secondary" className="text-[10px] font-medium bg-black/60 text-zinc-200 border-0">
            {property.type.replace(/_/g, " ")}
          </Badge>
        </div>
      </div>

      {/* ── Body ── */}
      <CardContent className="p-4 space-y-3">

        {/* Title + Location */}
        <div>
          <h3 className="font-semibold text-sm leading-snug line-clamp-1 text-zinc-100">
            {property.title}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-zinc-400 text-xs">
            <MapPin size={11} />
            {property.area}, {property.city}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <BedDouble size={11} /> {property.bedrooms} bed
          </span>
          <span className="flex items-center gap-1">
            <Bath size={11} /> {property.bathrooms} bath
          </span>
          <span className="ml-auto font-bold text-emerald-400 text-sm">
            ৳{property.rentAmount.toLocaleString()}/mo
          </span>
        </div>

        {/* Rejection reason */}
        {property.status === "REJECTED" && (
          <div className="flex items-start gap-1.5 text-xs text-red-400 bg-red-500/10 rounded-lg px-2.5 py-2 border border-red-500/20">
            <AlertCircle size={11} className="mt-0.5 shrink-0" />
            <span className="line-clamp-2 leading-relaxed">
              Admin rejected this property. Please edit and resubmit.
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-1.5 pt-1">
          {/* View */}
          <Link href={`/owner/properties/${property.id}`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-8 gap-1 bg-transparent border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white"
            >
              <Eye size={11} /> View
            </Button>
          </Link>

          {/* Edit */}
          <Link href={`/owner/properties/${property.id}/edit`}>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 gap-1 bg-transparent text-blue-400 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-400/50"
            >
              <Pencil size={11} /> Edit
            </Button>
          </Link>

          {/* Delete with confirm dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 px-2.5 bg-transparent text-red-400 border-red-500/30 hover:bg-red-500/10 hover:border-red-400/50"
              >
                <Trash2 size={11} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-900 border border-white/10 text-zinc-100">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-zinc-100">Delete this property?</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                  <strong className="text-zinc-200">{property.title}</strong> permanently delete হয়ে যাবে। এই কাজ undo করা যাবে না।
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border-white/10 text-zinc-300 hover:bg-white/5">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(property.id)}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleting ? "Deleting…" : "Yes, Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

      </CardContent>
    </Card>
  );
}

// ── Loading Skeletons ──────────────────────────────────────────────────────────
function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="overflow-hidden border border-white/10 shadow-none bg-zinc-900">
          <Skeleton className="h-44 w-full rounded-none bg-zinc-800" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4 bg-zinc-800" />
            <Skeleton className="h-3 w-1/2 bg-zinc-800" />
            <div className="flex gap-2">
              <Skeleton className="h-3 w-16 bg-zinc-800" />
              <Skeleton className="h-3 w-16 bg-zinc-800" />
            </div>
            <div className="flex gap-1.5">
              <Skeleton className="h-8 flex-1 bg-zinc-800" />
              <Skeleton className="h-8 w-16 bg-zinc-800" />
              <Skeleton className="h-8 w-9 bg-zinc-800" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────
function EmptyState({ tab }: { tab: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
        <Building2 size={28} className="text-emerald-400" />
      </div>
      <h3 className="text-base font-semibold text-zinc-100 mb-1">No properties found</h3>
      <p className="text-sm text-zinc-400 max-w-xs">
        {tab === "ALL"
          ? "You haven't added any properties yet. Start by adding your first one."
          : `You have no ${tab.toLowerCase()} properties right now.`}
      </p>
      {tab === "ALL" && (
        <Link href="/owner/properties/new" className="mt-5">
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
            <Plus size={15} /> Add First Property
          </Button>
        </Link>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function OwnerPropertiesPage() {
  const [activeTab, setActiveTab] = useState<PropertyStatus | "ALL">("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useOwnerProperties(
    activeTab === "ALL" ? undefined : { status: activeTab as PropertyStatus }
  );

  const { mutateAsync: deleteProperty } = useDeleteProperty();

  const properties: Property[] = data?.data ?? [];
  const total = data?.meta?.total ?? properties.length;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteProperty(id);
      toast.success("Property deleted successfully");
    } catch {
      toast.error("Failed to delete property");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    // ✅ Dark background — zinc-950 = near black, zinc-900 = dark gray cards
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">My Properties</h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              {isLoading
                ? "Loading properties…"
                : `${total} propert${total === 1 ? "y" : "ies"} found`}
            </p>
          </div>
          <Link href="/owner/properties/new">
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
              <Plus size={15} /> Add Property
            </Button>
          </Link>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────── */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        >
          <TabsList className="bg-zinc-900 border border-white/10">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-zinc-400 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* ── Loading ──────────────────────────────────────────────── */}
        {isLoading && <LoadingGrid />}

        {/* ── Error ────────────────────────────────────────────────── */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-red-400 font-medium text-sm">
              ❌ Properties load করতে সমস্যা হয়েছে।
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}
              className="border-white/10 text-zinc-300 hover:bg-white/5">
              Try Again
            </Button>
          </div>
        )}

        {/* ── Empty ────────────────────────────────────────────────── */}
        {!isLoading && !isError && properties.length === 0 && (
          <EmptyState tab={activeTab} />
        )}

        {/* ── Property Grid ─────────────────────────────────────────── */}
        {!isLoading && !isError && properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onDelete={handleDelete}
                deleting={deletingId === property.id}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}