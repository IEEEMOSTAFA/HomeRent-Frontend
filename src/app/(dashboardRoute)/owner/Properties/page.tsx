// "use client";

// // ✅ FILE PATH: src/app/(dashboardRoute)/owner/properties/page.tsx
// // NOTE: তোমার project এ (dashboardRoute) বা (ownerRoute) যেটা সঠিক সেটা use করো

// import { useState } from "react";
// import Link from "next/link";

// import {
//   useOwnerProperties,
//   useDeleteProperty,
//   type PropertyStatus,
//   type Property,
// } from "@/hooks/owner/useOwnerApi";

// import { toast } from "sonner";
// import { Loader2, Pencil, Eye, Trash2, Plus } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";

// // ── Tab Config ─────────────────────────────────────────────────────────────────
// const TABS: { label: string; value: PropertyStatus | "ALL" }[] = [
//   { label: "All",      value: "ALL"      },
//   { label: "Approved", value: "APPROVED" },
//   { label: "Pending",  value: "PENDING"  },
//   { label: "Rejected", value: "REJECTED" },
// ];

// // ── Status Badge ───────────────────────────────────────────────────────────────
// function StatusBadge({ status }: { status: PropertyStatus }) {
//   const styles: Record<PropertyStatus, string> = {
//     APPROVED: "bg-emerald-100 text-emerald-700 border border-emerald-200",
//     PENDING:  "bg-amber-100 text-amber-700 border border-amber-200",
//     REJECTED: "bg-red-100 text-red-700 border border-red-200",
//   };
//   return (
//     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${styles[status]}`}>
//       {status}
//     </span>
//   );
// }

// // ── Property Row / Card ────────────────────────────────────────────────────────
// function PropertyCard({
//   property,
//   onDelete,
//   deleting,
// }: {
//   property: Property;
//   onDelete: (id: string) => void;
//   deleting: boolean;
// }) {
//   const image = property.images?.[0] ?? "/placeholder.png";

//   return (
//     <div className="flex flex-col sm:flex-row gap-4 bg-emerald-50 rounded-xl border border-emerald-200 p-4 hover:shadow-md hover:bg-emerald-100/60 transition-all duration-200">
//       {/* Thumbnail */}
//       <div className="w-full sm:w-36 h-28 rounded-lg overflow-hidden bg-emerald-100 flex-shrink-0">
//         <img
//           src={image}
//           alt={property.title}
//           className="w-full h-full object-cover"
//           onError={(e) => {
//             (e.target as HTMLImageElement).src = "/placeholder.png";
//           }}
//         />
//       </div>

//       {/* Info */}
//       <div className="flex-1 min-w-0 space-y-1">
//         <div className="flex items-start justify-between gap-2">
//           <h3 className="font-semibold text-gray-900 truncate text-sm">
//             {property.title}
//           </h3>
//           <StatusBadge status={property.status} />
//         </div>

//         <p className="text-xs text-emerald-700">
//           {property.area}, {property.city}
//         </p>

//         <p className="text-xs text-emerald-700/80">
//           {property.bedrooms} bed · {property.bathrooms} bath
//           {property.size ? ` · ${property.size} sqft` : ""}
//         </p>

//         <p className="font-bold text-emerald-700 text-sm">
//           ৳ {property.rentAmount.toLocaleString()}/month
//         </p>

//         <p className="text-xs text-emerald-600/70">
//           Type: {property.type.replace(/_/g, " ")} ·
//           For: {property.availableFor}
//         </p>
//       </div>

//       {/* Actions */}
//       <div className="flex sm:flex-col gap-2 justify-end flex-shrink-0">
//         <Link href={`/owner/properties/${property.id}`}>
//           <Button
//             variant="outline"
//             size="sm"
//             className="gap-1 text-xs w-full border-emerald-300 text-emerald-700 hover:bg-emerald-200 hover:border-emerald-400"
//           >
//             <Eye size={13} /> View
//           </Button>
//         </Link>
//         <Link href={`/owner/properties/${property.id}/edit`}>
//           <Button
//             variant="outline"
//             size="sm"
//             className="gap-1 text-xs w-full border-emerald-300 text-emerald-700 hover:bg-emerald-200 hover:border-emerald-400"
//           >
//             <Pencil size={13} /> Edit
//           </Button>
//         </Link>
//         <Button
//           variant="destructive"
//           size="sm"
//           className="gap-1 text-xs w-full"
//           disabled={deleting}
//           onClick={() => {
//             if (confirm("Are you sure you want to delete this property?")) {
//               onDelete(property.id);
//             }
//           }}
//         >
//           {deleting ? (
//             <Loader2 size={13} className="animate-spin" />
//           ) : (
//             <Trash2 size={13} />
//           )}
//           Delete
//         </Button>
//       </div>
//     </div>
//   );
// }

// // ── Empty State ────────────────────────────────────────────────────────────────
// function EmptyState({ tab }: { tab: string }) {
//   return (
//     <div className="flex flex-col items-center justify-center py-24 text-center">
//       <span className="text-5xl mb-4">🏠</span>
//       <h3 className="text-lg font-semibold text-gray-700 mb-1">
//         No properties found
//       </h3>
//       <p className="text-sm text-gray-400 max-w-xs">
//         {tab === "ALL"
//           ? "You haven't added any properties yet. Click the button below to add your first property."
//           : `You have no ${tab.toLowerCase()} properties right now.`}
//       </p>
//       {tab === "ALL" && (
//         <Link href="/owner/properties/new" className="mt-5">
//           <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
//             <Plus size={16} /> Add Your First Property
//           </Button>
//         </Link>
//       )}
//     </div>
//   );
// }

// // ── Main Page ──────────────────────────────────────────────────────────────────
// export default function OwnerPropertiesPage() {
//   const [activeTab, setActiveTab] = useState<PropertyStatus | "ALL">("ALL");
//   const [deletingId, setDeletingId] = useState<string | null>(null);

//   const { data, isLoading, isError, refetch } = useOwnerProperties(
//     activeTab === "ALL"
//       ? undefined
//       : { status: activeTab as PropertyStatus }
//   );

//   const { mutateAsync: deleteProperty } = useDeleteProperty();

//   const properties: Property[] = data?.data ?? [];
//   const total = data?.meta?.total ?? properties.length;

//   const handleDelete = async (id: string) => {
//     setDeletingId(id);
//     try {
//       await deleteProperty(id);
//       toast.success("Property deleted successfully");
//     } catch {
//       toast.error("Failed to delete property");
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="max-w-4xl mx-auto px-4 py-8">

//         {/* ── Header ──────────────────────────────────────────────── */}
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
//             <p className="text-sm text-gray-500 mt-0.5">
//               {isLoading
//                 ? "Loading..."
//                 : `${total} propert${total === 1 ? "y" : "ies"} found`}
//             </p>
//           </div>
//           <Link href="/owner/properties/new">
//             <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
//               <Plus size={16} /> Add Property
//             </Button>
//           </Link>
//         </div>

//         {/* ── Tabs ────────────────────────────────────────────────── */}
//         <div className="flex gap-0 border-b border-emerald-200 mb-6">
//           {TABS.map((tab) => (
//             <button
//               key={tab.value}
//               onClick={() => setActiveTab(tab.value)}
//               className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
//                 activeTab === tab.value
//                   ? "border-emerald-600 text-emerald-600"
//                   : "border-transparent text-gray-500 hover:text-emerald-600"
//               }`}
//             >
//               {tab.label}
//             </button>
//           ))}
//         </div>

//         {/* ── Loading ──────────────────────────────────────────────── */}
//         {isLoading && (
//           <div className="space-y-4">
//             {[1, 2, 3].map((i) => (
//               <div
//                 key={i}
//                 className="h-36 bg-emerald-50 rounded-xl border border-emerald-200 animate-pulse"
//               />
//             ))}
//           </div>
//         )}

//         {/* ── Error ────────────────────────────────────────────────── */}
//         {isError && !isLoading && (
//           <div className="text-center py-20 space-y-3">
//             <p className="text-red-500 font-medium">
//               ❌ Properties load করতে সমস্যা হয়েছে।
//             </p>
//             <Button variant="outline" onClick={() => refetch()}>
//               Try Again
//             </Button>
//           </div>
//         )}

//         {/* ── Empty ────────────────────────────────────────────────── */}
//         {!isLoading && !isError && properties.length === 0 && (
//           <EmptyState tab={activeTab} />
//         )}

//         {/* ── Property List ─────────────────────────────────────────── */}
//         {!isLoading && !isError && properties.length > 0 && (
//           <div className="space-y-4">
//             {properties.map((property) => (
//               <PropertyCard
//                 key={property.id}
//                 property={property}
//                 onDelete={handleDelete}
//                 deleting={deletingId === property.id}
//               />
//             ))}
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }

















// // "use client";

// // // ✅ FILE PATH: src/app/(ownerRoute)/owner/properties/page.tsx

// // import { useState } from "react";
// // import Link from "next/link";
// // import Image from "next/image";
// // import { Plus, MapPin, BedDouble, Bath, Pencil, Trash2, Building2, AlertCircle, Eye } from "lucide-react";
// // import { toast } from "sonner";

// // // ── shadcn components ──────────────────────────────────────────────────────────
// // import { Button }   from "@/components/ui/button";
// // import { Badge }    from "@/components/ui/badge";
// // import { Skeleton } from "@/components/ui/skeleton";
// // import { Card, CardContent } from "@/components/ui/card";
// // import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// // import {
// //   AlertDialog,
// //   AlertDialogAction,
// //   AlertDialogCancel,
// //   AlertDialogContent,
// //   AlertDialogDescription,
// //   AlertDialogFooter,
// //   AlertDialogHeader,
// //   AlertDialogTitle,
// //   AlertDialogTrigger,
// // } from "@/components/ui/alert-dialog";

// // // ── hooks ──────────────────────────────────────────────────────────────────────
// // import {
// //   useOwnerProperties,
// //   useDeleteProperty,
// //   type PropertyStatus,
// //   type Property,
// // } from "@/hooks/owner/useOwnerApi";

// // // ── Tab Config ─────────────────────────────────────────────────────────────────
// // const TABS: { label: string; value: PropertyStatus | "ALL" }[] = [
// //   { label: "All",      value: "ALL"      },
// //   { label: "Approved", value: "APPROVED" },
// //   { label: "Pending",  value: "PENDING"  },
// //   { label: "Rejected", value: "REJECTED" },
// // ];

// // // ── Status Badge ───────────────────────────────────────────────────────────────
// // function StatusBadge({ status }: { status: PropertyStatus }) {
// //   const styles: Record<PropertyStatus, string> = {
// //     APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
// //     PENDING:  "bg-amber-100  text-amber-700  border-amber-200",
// //     REJECTED: "bg-red-100    text-red-700    border-red-200",
// //   };
// //   return (
// //     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles[status]}`}>
// //       {status}
// //     </span>
// //   );
// // }

// // // ── Property Card ──────────────────────────────────────────────────────────────
// // function PropertyCard({
// //   property,
// //   onDelete,
// //   deleting,
// // }: {
// //   property: Property;
// //   onDelete: (id: string) => void;
// //   deleting: boolean;
// // }) {
// //   return (
// //     <Card className="overflow-hidden border border-border/60 shadow-none hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-white">

// //       {/* ── Image ── */}
// //       <div className="relative h-44 bg-muted">
// //         {property.images?.[0] ? (
// //           <Image
// //             src={property.images[0]}
// //             alt={property.title}
// //             fill
// //             className="object-cover"
// //           />
// //         ) : (
// //           <div className="flex items-center justify-center h-full">
// //             <Building2 size={36} className="text-muted-foreground/30" />
// //           </div>
// //         )}

// //         {/* Status badge — top right */}
// //         <div className="absolute top-2.5 right-2.5">
// //           <StatusBadge status={property.status} />
// //         </div>

// //         {/* Type badge — top left */}
// //         <div className="absolute top-2.5 left-2.5">
// //           <Badge variant="secondary" className="text-[10px] font-medium bg-black/50 text-white border-0">
// //             {property.type.replace(/_/g, " ")}
// //           </Badge>
// //         </div>
// //       </div>

// //       {/* ── Body ── */}
// //       <CardContent className="p-4 space-y-3">

// //         {/* Title + Location */}
// //         <div>
// //           <h3 className="font-semibold text-sm leading-snug line-clamp-1 text-foreground">
// //             {property.title}
// //           </h3>
// //           <div className="flex items-center gap-1 mt-1 text-muted-foreground text-xs">
// //             <MapPin size={11} />
// //             {property.area}, {property.city}
// //           </div>
// //         </div>

// //         {/* Stats row */}
// //         <div className="flex items-center gap-3 text-xs text-muted-foreground">
// //           <span className="flex items-center gap-1">
// //             <BedDouble size={11} /> {property.bedrooms} bed
// //           </span>
// //           <span className="flex items-center gap-1">
// //             <Bath size={11} /> {property.bathrooms} bath
// //           </span>
// //           <span className="ml-auto font-bold text-emerald-600 text-sm">
// //             ৳{property.rentAmount.toLocaleString()}/mo
// //           </span>
// //         </div>

// //         {/* Rejection reason */}
// //         {property.status === "REJECTED" && (
// //           <div className="flex items-start gap-1.5 text-xs text-destructive bg-destructive/8 rounded-lg px-2.5 py-2 border border-destructive/15">
// //             <AlertCircle size={11} className="mt-0.5 flex-shrink-0" />
// //             <span className="line-clamp-2 leading-relaxed">
// //               Admin rejected this property. Please edit and resubmit.
// //             </span>
// //           </div>
// //         )}

// //         {/* Action buttons */}
// //         <div className="flex gap-1.5 pt-1">
// //           {/* View */}
// //           <Link href={`/owner/properties/${property.id}`} className="flex-1">
// //             <Button
// //               variant="outline"
// //               size="sm"
// //               className="w-full text-xs h-8 gap-1 hover:bg-muted"
// //             >
// //               <Eye size={11} /> View
// //             </Button>
// //           </Link>

// //           {/* Edit */}
// //           <Link href={`/owner/properties/${property.id}/edit`}>
// //             <Button
// //               variant="outline"
// //               size="sm"
// //               className="text-xs h-8 gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
// //             >
// //               <Pencil size={11} /> Edit
// //             </Button>
// //           </Link>

// //           {/* Delete with confirm dialog */}
// //           <AlertDialog>
// //             <AlertDialogTrigger asChild>
// //               <Button
// //                 variant="outline"
// //                 size="sm"
// //                 className="text-xs h-8 px-2.5 text-destructive border-destructive/25 hover:bg-destructive/8 hover:border-destructive/40"
// //               >
// //                 <Trash2 size={11} />
// //               </Button>
// //             </AlertDialogTrigger>
// //             <AlertDialogContent>
// //               <AlertDialogHeader>
// //                 <AlertDialogTitle>Delete this property?</AlertDialogTitle>
// //                 <AlertDialogDescription>
// //                   <strong>{property.title}</strong> permanently delete হয়ে যাবে। এই কাজ undo করা যাবে না।
// //                 </AlertDialogDescription>
// //               </AlertDialogHeader>
// //               <AlertDialogFooter>
// //                 <AlertDialogCancel>Cancel</AlertDialogCancel>
// //                 <AlertDialogAction
// //                   onClick={() => onDelete(property.id)}
// //                   disabled={deleting}
// //                   className="bg-destructive hover:bg-destructive/90"
// //                 >
// //                   {deleting ? "Deleting…" : "Yes, Delete"}
// //                 </AlertDialogAction>
// //               </AlertDialogFooter>
// //             </AlertDialogContent>
// //           </AlertDialog>
// //         </div>

// //       </CardContent>
// //     </Card>
// //   );
// // }

// // // ── Loading Skeletons ──────────────────────────────────────────────────────────
// // function LoadingGrid() {
// //   return (
// //     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
// //       {[1, 2, 3, 4, 5, 6].map((i) => (
// //         <Card key={i} className="overflow-hidden border border-border/60 shadow-none">
// //           <Skeleton className="h-44 w-full rounded-none" />
// //           <CardContent className="p-4 space-y-3">
// //             <Skeleton className="h-4 w-3/4" />
// //             <Skeleton className="h-3 w-1/2" />
// //             <div className="flex gap-2">
// //               <Skeleton className="h-3 w-16" />
// //               <Skeleton className="h-3 w-16" />
// //             </div>
// //             <div className="flex gap-1.5">
// //               <Skeleton className="h-8 flex-1" />
// //               <Skeleton className="h-8 w-16" />
// //               <Skeleton className="h-8 w-9" />
// //             </div>
// //           </CardContent>
// //         </Card>
// //       ))}
// //     </div>
// //   );
// // }

// // // ── Empty State ────────────────────────────────────────────────────────────────
// // function EmptyState({ tab }: { tab: string }) {
// //   return (
// //     <div className="flex flex-col items-center justify-center py-28 text-center">
// //       <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center mb-4">
// //         <Building2 size={28} className="text-emerald-600" />
// //       </div>
// //       <h3 className="text-base font-semibold text-foreground mb-1">No properties found</h3>
// //       <p className="text-sm text-muted-foreground max-w-xs">
// //         {tab === "ALL"
// //           ? "You haven't added any properties yet. Start by adding your first one."
// //           : `You have no ${tab.toLowerCase()} properties right now.`}
// //       </p>
// //       {tab === "ALL" && (
// //         <Link href="/owner/properties/new" className="mt-5">
// //           <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
// //             <Plus size={15} /> Add First Property
// //           </Button>
// //         </Link>
// //       )}
// //     </div>
// //   );
// // }

// // // ── Main Page ──────────────────────────────────────────────────────────────────
// // export default function OwnerPropertiesPage() {
// //   const [activeTab, setActiveTab] = useState<PropertyStatus | "ALL">("ALL");
// //   const [deletingId, setDeletingId] = useState<string | null>(null);

// //   const { data, isLoading, isError, refetch } = useOwnerProperties(
// //     activeTab === "ALL" ? undefined : { status: activeTab as PropertyStatus }
// //   );

// //   const { mutateAsync: deleteProperty } = useDeleteProperty();

// //   const properties: Property[] = data?.data ?? [];
// //   const total = data?.meta?.total ?? properties.length;

// //   const handleDelete = async (id: string) => {
// //     setDeletingId(id);
// //     try {
// //       await deleteProperty(id);
// //       toast.success("Property deleted successfully");
// //     } catch {
// //       toast.error("Failed to delete property");
// //     } finally {
// //       setDeletingId(null);
// //     }
// //   };

// //   return (
// //     // ✅ bg-emerald-50 = soft green background
// //     <div className="min-h-screen bg-emerald-50">
// //       <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

// //         {/* ── Header ──────────────────────────────────────────────── */}
// //         <div className="flex items-center justify-between">
// //           <div>
// //             <h1 className="text-2xl font-bold text-foreground">My Properties</h1>
// //             <p className="text-sm text-muted-foreground mt-0.5">
// //               {isLoading
// //                 ? "Loading properties…"
// //                 : `${total} propert${total === 1 ? "y" : "ies"} found`}
// //             </p>
// //           </div>
// //           <Link href="/owner/properties/new">
// //             <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
// //               <Plus size={15} /> Add Property
// //             </Button>
// //           </Link>
// //         </div>

// //         {/* ── Tabs ────────────────────────────────────────────────── */}
// //         <Tabs
// //           value={activeTab}
// //           onValueChange={(v) => setActiveTab(v as typeof activeTab)}
// //         >
// //           <TabsList className="bg-emerald-100 border border-emerald-200">
// //             {TABS.map((tab) => (
// //               <TabsTrigger
// //                 key={tab.value}
// //                 value={tab.value}
// //                 className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=inactive]:text-emerald-700"
// //               >
// //                 {tab.label}
// //               </TabsTrigger>
// //             ))}
// //           </TabsList>
// //         </Tabs>

// //         {/* ── Loading ──────────────────────────────────────────────── */}
// //         {isLoading && <LoadingGrid />}

// //         {/* ── Error ────────────────────────────────────────────────── */}
// //         {isError && !isLoading && (
// //           <div className="flex flex-col items-center justify-center py-20 gap-3">
// //             <p className="text-destructive font-medium text-sm">
// //               ❌ Properties load করতে সমস্যা হয়েছে।
// //             </p>
// //             <Button variant="outline" size="sm" onClick={() => refetch()}>
// //               Try Again
// //             </Button>
// //           </div>
// //         )}

// //         {/* ── Empty ────────────────────────────────────────────────── */}
// //         {!isLoading && !isError && properties.length === 0 && (
// //           <EmptyState tab={activeTab} />
// //         )}

// //         {/* ── Property Grid ─────────────────────────────────────────── */}
// //         {!isLoading && !isError && properties.length > 0 && (
// //           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
// //             {properties.map((property) => (
// //               <PropertyCard
// //                 key={property.id}
// //                 property={property}
// //                 onDelete={handleDelete}
// //                 deleting={deletingId === property.id}
// //               />
// //             ))}
// //           </div>
// //         )}

// //       </div>
// //     </div>
// //   );
// // }



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
    APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    PENDING:  "bg-amber-100  text-amber-700  border-amber-200",
    REJECTED: "bg-red-100    text-red-700    border-red-200",
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
    <Card className="overflow-hidden border border-border/60 shadow-none hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-card">

      {/* ── Image ── */}
      <div className="relative h-44 bg-muted">
        {property.images?.[0] ? (
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Building2 size={36} className="text-muted-foreground/30" />
          </div>
        )}

        {/* Status badge — top right */}
        <div className="absolute top-2.5 right-2.5">
          <StatusBadge status={property.status} />
        </div>

        {/* Type badge — top left */}
        <div className="absolute top-2.5 left-2.5">
          <Badge variant="secondary" className="text-[10px] font-medium bg-black/50 text-white border-0">
            {property.type.replace(/_/g, " ")}
          </Badge>
        </div>
      </div>

      {/* ── Body ── */}
      <CardContent className="p-4 space-y-3">

        {/* Title + Location */}
        <div>
          <h3 className="font-semibold text-sm leading-snug line-clamp-1 text-foreground">
            {property.title}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-muted-foreground text-xs">
            <MapPin size={11} />
            {property.area}, {property.city}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BedDouble size={11} /> {property.bedrooms} bed
          </span>
          <span className="flex items-center gap-1">
            <Bath size={11} /> {property.bathrooms} bath
          </span>
          <span className="ml-auto font-bold text-emerald-600 text-sm">
            ৳{property.rentAmount.toLocaleString()}/mo
          </span>
        </div>

        {/* Rejection reason */}
        {property.status === "REJECTED" && (
          <div className="flex items-start gap-1.5 text-xs text-destructive bg-destructive/8 rounded-lg px-2.5 py-2 border border-destructive/15">
            <AlertCircle size={11} className="mt-0.5 flex-shrink-0" />
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
              className="w-full text-xs h-8 gap-1 hover:bg-muted"
            >
              <Eye size={11} /> View
            </Button>
          </Link>

          {/* Edit */}
          <Link href={`/owner/properties/${property.id}/edit`}>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
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
                className="text-xs h-8 px-2.5 text-destructive border-destructive/25 hover:bg-destructive/8 hover:border-destructive/40"
              >
                <Trash2 size={11} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this property?</AlertDialogTitle>
                <AlertDialogDescription>
                  <strong>{property.title}</strong> permanently delete হয়ে যাবে। এই কাজ undo করা যাবে না।
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(property.id)}
                  disabled={deleting}
                  className="bg-destructive hover:bg-destructive/90"
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
        <Card key={i} className="overflow-hidden border border-border/60 shadow-none">
          <Skeleton className="h-44 w-full rounded-none" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex gap-1.5">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-9" />
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
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
        <Building2 size={28} className="text-emerald-500" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">No properties found</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        {tab === "ALL"
          ? "You haven't added any properties yet. Start by adding your first one."
          : `You have no ${tab.toLowerCase()} properties right now.`}
      </p>
      {tab === "ALL" && (
        <Link href="/owner/properties/new" className="mt-5">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
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
    // ✅ bg-background = shadcn CSS variable, website এর নিজের background color নেবে
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Properties</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isLoading
                ? "Loading properties…"
                : `${total} propert${total === 1 ? "y" : "ies"} found`}
            </p>
          </div>
          <Link href="/owner/properties/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <Plus size={15} /> Add Property
            </Button>
          </Link>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────── */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        >
          <TabsList className="bg-muted/60">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
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
            <p className="text-destructive font-medium text-sm">
              ❌ Properties load করতে সমস্যা হয়েছে।
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
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