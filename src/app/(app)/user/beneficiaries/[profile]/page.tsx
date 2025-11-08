"use client"

import { Card } from "@/components/ui/card"
import { useParams } from "next/navigation"
import React from "react"
import { DependentsSection } from "./_components/dependent"
import { ProfileHeader } from "./_components/header"
import { PlanSchemeSection } from "./_components/plan-scheme"
import { ProfileStats } from "./_components/stats"
// import { ProviderSection } from "./_components/provider"
import Breadcrumbs from "@/components/navigation/Breadcrumbs"
import { CircledUpArrow, EditAltIcon, PadlockIcon } from "@/components/svgs"
import { Button } from "@/components/ui/button"
import ClaimsTable from "./_components/claim-table"
import { NextOfKinSection } from "./_components/next-of-kin"

function unslug(str: string) {
  return decodeURIComponent(str.replace(/-/g, " "))
}

export default function BeneficiaryProfile() {
  const params = useParams<{ provider: string }>()
  const providerSlug = params?.provider ?? ""
  const beneficiaryName = React.useMemo(
    () => unslug(providerSlug),
    [providerSlug]
  )

  const claimsData = [
    {
      claimId: "SHTL/CAC/11081",
      diagnosis: "Allergic conjunctivitis",
      service: "General Consultation",
      drug: "Amoxicillin",
      cost: "N29090",
      status: "Approved",
      date: "12/10/23",
    },
    {
      claimId: "SHTL/CBC/11081",
      diagnosis: "Hypertension",
      service: "Dermatology",
      drug: "Paracetamol",
      cost: "N21877",
      status: "Rejected",
      date: "12/10/23",
    },
    {
      claimId: "CSTL/CAC/11082",
      diagnosis: "Asthma",
      service: "Cardiology",
      drug: "Omeprazole",
      cost: "N500,000",
      status: "Approved",
      date: "12/10/23",
    },
    {
      claimId: "BZTL/CBC/11081",
      diagnosis: "Major Depressive Disorder",
      service: "Radiology",
      drug: "Paracetamol",
      cost: "N877789",
      status: "Approved",
      date: "12/10/23",
    },
    {
      claimId: "SHTL/CAD/11081",
      diagnosis: "Malaria",
      service: "General Consultation",
      drug: "Omeprazole",
      cost: "N90,997",
      status: "Pending",
      date: "12/10/23",
    },
    {
      claimId: "CHTL/CBC/11081",
      diagnosis: "Osteoarthritis",
      service: "Cardiology",
      drug: "Atorvastatin",
      cost: "N76,000",
      status: "Approved",
      date: "12/10/23",
    },
    {
      claimId: "CBTL/CBC/11081",
      diagnosis: "Catarh",
      service: "Radiology",
      drug: "Paracetamol",
      cost: "N66,000",
      status: "Approved",
      date: "12/10/23",
    },
    {
      claimId: "SHTL/CBC/11081",
      diagnosis: "Malaria",
      service: "General Consultation",
      drug: "Omeprazole",
      cost: "N91,000",
      status: "Approved",
      date: "12/10/23",
    },
  ]

  const [activeTab, setActiveTab] = React.useState("all")

  return (
    <div className="w-full flex flex-col gap-4">
      <Breadcrumbs />
      <div className="h-10 flex gap-4 justify-end py-1">
        <Button
          variant="outline"
          className="w-fit h-10 rounded-xl border border-[#D0D5DD] py-2.5 px-3.5 flex items-center gap-2 bg-transparent text-[#344054] text-[14px]/[20px] tracking-normal font-semibold hover:bg-primary/5 hover:text-[#344054]"
        >
          <CircledUpArrow /> Upgrade Plan
        </Button>
        <Button
          variant="outline"
          className="h-10 rounded-xl border border-[#D0D5DD] py-2.5 px-3.5 flex items-center gap-2 bg-transparent text-[#344054] text-[14px]/[20px] tracking-normal font-semibold hover:bg-primary/5 hover:text-[#344054]"
        >
          <PadlockIcon /> Restrict Enrollee
        </Button>
        <Button
          variant="outline"
          className="h-10 rounded-xl border border-[#D0D5DD] py-2.5 px-3.5 flex items-center gap-2 bg-transparent text-[#344054] text-[14px]/[20px] tracking-normal font-semibold hover:bg-primary/5 hover:text-[#344054]"
        >
          <EditAltIcon /> Edit Profile
        </Button>
      </div>
      <Card className="px-8 rounded-2xl flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-full sm:w-[70%] flex flex-col gap-9">
            <ProfileHeader />
            <ProfileStats />
            <DependentsSection />
          </div>
          <div className="w-full sm:w-[30%] flex flex-col gap-6">
            <PlanSchemeSection />
            {/* <ProviderSection /> */}
            <NextOfKinSection />
          </div>
        </div>
        <ClaimsTable />
      </Card>
    </div>
  )
}
