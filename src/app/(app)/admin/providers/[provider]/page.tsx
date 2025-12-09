"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import AddService from "./_components/addService";
import { Filters } from "./_components/filters";
import { ServicesTable } from "./_components/table";

function unslug(str: string) {
  return decodeURIComponent(str.replace(/-/g, " "));
}

const mockServices = [
  {
    id: "1",
    name: "Consultation - Orthopaedic Doctor",
    scheme: "NHIS",
    category: "Service",
    cost: "₦30,000",
    lastUpdated: "2mins ago",
    status: "Approved" as const,
  },
  {
    id: "2",
    name: "Consultation - Orthopaedic Doctor",
    scheme: "NHIS",
    category: "Drug",
    cost: "₦30,000",
    lastUpdated: "30mins ago",
    status: "Approved" as const,
  },
  {
    id: "3",
    name: "Consultation - Orthopaedic Doctor",
    scheme: "NHIS",
    category: "Laboratory",
    cost: "₦30,000",
    lastUpdated: "2 hours",
    status: "Pending" as const,
  },
  {
    id: "4",
    name: "Consultation - Orthopaedic Doctor",
    scheme: "PHIS",
    category: "Drug",
    cost: "₦30,000",
    lastUpdated: "12 Aug, 2025",
    status: "Approved" as const,
  },
  {
    id: "5",
    name: "Consultation - Orthopaedic Doctor",
    scheme: "PHIS",
    category: "Radiology",
    cost: "₦30,000",
    lastUpdated: "10 Aug, 2025",
    status: "Approved" as const,
  },
  {
    id: "6",
    name: "Consultation - Orthopaedic Doctor",
    scheme: "PHIS",
    category: "Consultation",
    cost: "₦30,000",
    lastUpdated: "9 Aug, 2025",
    status: "Approved" as const,
  },
  {
    id: "7",
    name: "Consultation - Orthopaedic Doctor",
    scheme: "PHIS",
    category: "Nursing",
    cost: "₦30,000",
    lastUpdated: "9 Aug, 2025",
    status: "Approved" as const,
  },
];
export default function ProviderDetail() {
  const params = useParams<{ provider: string }>();
  const providerSlug = params?.provider ?? "";
  const providerName = React.useMemo(
    () => unslug(providerSlug),
    [providerSlug],
  );

  const [filters, setFilters] = React.useState({
    search: "",
    cost: "min-max",
    status: "approved",
  });

  return (
    <div className="w-full flex flex-col gap-6">
      <Breadcrumbs />
      <span className="flex flex-col gap-">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl/[38px] font-hnd font-bold text-[#101828] capitalize">
            {providerName || "Provider"}
          </h1>
          <AddService />
        </div>
        <div className="h-px w-full bg-[#EAECF0]" />
      </span>

      <Filters
        onSearchChange={(value) => setFilters((f) => ({ ...f, search: value }))}
        onCostChange={(value) => setFilters((f) => ({ ...f, cost: value }))}
        onStatusChange={(value) => setFilters((f) => ({ ...f, status: value }))}
      />

      <ServicesTable services={mockServices} />
    </div>
  );
}
