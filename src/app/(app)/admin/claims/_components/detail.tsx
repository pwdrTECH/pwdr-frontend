"use client";

import { CustomSheet } from "@/components/overlays/SideDialog";
import {
  MagicPenAltIcon,
  MagicPenIcon,
  SignatureIcon,
} from "@/components/svgs";
import { TableTitle } from "@/components/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useClaimDetails } from "@/lib/api/claims";
import { X } from "lucide-react";
import { useState } from "react";

interface ClaimDetailModalProps {
  claim:
    | {
        id: string;
        date: string;
        claimId: string;
        enrolleeName: string;
        enrolleeId: string;
        providerName: string;
        serviceCount: number;
        submittedCost: string;
        totalCost: string;
        status: "Pending" | "Approved";
      }
    | null
    | undefined;
  onClose: () => void;
  open?: boolean;
}

// small helper for age from dob
function getAgeLabel(dob?: string | null): string {
  if (!dob) return "—";
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return "—";

  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
    age--;
  }
  if (age < 0 || age > 120) return "—";
  return `${age} years`;
}

export default function ClaimDetailModal({
  claim,
  onClose,
  open = false,
}: ClaimDetailModalProps) {
  const hasClaim = !!claim;
  const [showInsight, setShowInsight] = useState(false);

  const {
    data: detail,
    isLoading,
    error,
  } = useClaimDetails({
    tracking_number: claim?.claimId,
  });

  if (!hasClaim) return null;

  const claimData = (detail as any)?.claim ?? {};
  const enrollee = (detail as any)?.enrolee ?? {};
  const services: any[] = (detail as any)?.services ?? [];
  const summary = (detail as any)?.summary ?? {};
  const scoring = claimData.scoring ?? {};

  const providerName =
    claimData.provider?.name ?? claim.providerName ?? "Unknown Provider";

  const encounterDate =
    claimData.encounter_date ?? claimData.date_created ?? claim.date;

  const enrolleeName =
    `${enrollee.first_name ?? ""} ${enrollee.surname ?? ""}`.trim() ||
    claim.enrolleeName;

  const enrolleeId = enrollee.enrolee_id ?? claim.enrolleeId;
  const enrolleeGender = enrollee.gender
    ? String(enrollee.gender).charAt(0).toUpperCase() +
      String(enrollee.gender).slice(1).toLowerCase()
    : "—";

  const enrolleeAge = getAgeLabel(enrollee.dob);

  const payableTotal =
    typeof summary.total_amount === "number"
      ? `₦${summary.total_amount.toLocaleString()}`
      : claim.totalCost;

  const items =
    services.map((s) => ({
      diagnosis: claimData.diagnosis ?? "—",
      services: s.service_name,
      serviceCode: s.item_type,
      category: s.item_type,
      qty: s.quantity,
      submittedBill:
        typeof s.cost === "number"
          ? `₦${s.cost.toLocaleString()}`
          : String(s.cost ?? "—"),
      status:
        s.status === "approved" ? ("Approved" as const) : ("Queried" as const),
      payableBill:
        typeof s.total === "number"
          ? `₦${s.total.toLocaleString()}`
          : String(s.total ?? "—"),
      payableNumeric:
        typeof s.total === "number" ? s.total : Number(s.total) || 0,
    })) ?? [];

  const numericSubtotal = items.reduce(
    (sum, it) => sum + (it.payableNumeric || 0),
    0,
  );
  const numericTax = numericSubtotal * 0.1;

  const payToAccountNumber = "1234567890";
  const payToBankName = "Zenith Bank Plc";
  const payToAccountName = providerName;

  const approverName = "John Doe";
  const approverRole = "HMO Manager";
  const approvedDate = encounterDate;

  return (
    <CustomSheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      contentClassName="xl:w-[1222px] p-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 bg-[#F9FAFC] rounded-[12px] border-b border-[#EBEDF2] relative p-6">
        <div className="w-full flex justify-end items-end">
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-4 h-4 hover:bg-primary/5 hover:text-black"
          >
            <X />
          </Button>
        </div>

        <div className="w-full flex justify-between gap-2">
          <SheetHeader className="h-[48px] w-full flex flex-col gap-0 p-0">
            <SheetTitle className="p-0 text-[24px] tracking-normal text-[#101928] font-hnd font-medium">
              {providerName}
            </SheetTitle>
            <SheetDescription className="text-[14px] tracking-normal text-[#5E6470]">
              {encounterDate}
            </SheetDescription>
          </SheetHeader>

          <div className="w-[300px] flex flex-col">
            <p className="text-[16px]/[18.1px] font-bold tracking-normal text-[#1671D9] text-right">
              {enrolleeName}
            </p>
            <p className="text-sm text-[#5E6470] font-hnd font-normal tracking-normal text-right">
              {enrolleeId}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-[30px] rounded-[12px] pt-[14px] pb-6 px-6">
        {/* Enrollee Claim Details */}
        <div className="w-full flex flex-col gap-4">
          <TableTitle>Enrollee Claim Details</TableTitle>

          {isLoading ? (
            <p className="text-sm text-[#667085]">Loading claim details…</p>
          ) : error ? (
            <p className="text-sm text-red-600">Failed to load claim details</p>
          ) : (
            <div className="grid grid-cols-4 gap-[38px]">
              <div className="h-[48px] flex flex-col gap-1">
                <p className="text-sm text-[#475367] tracking-normal font-normal font-hnd">
                  Age
                </p>
                <p className="font-medium font-hnd text-[15px]/[24px] text-[#39475E]">
                  {enrolleeAge}
                </p>
              </div>
              <div className="h-[48px] flex flex-col gap-1">
                <p className="text-sm text-[#475367] tracking-normal font-normal font-hnd">
                  Gender
                </p>
                <p className="font-medium font-hnd text-[15px]/[24px] text-[#39475E]">
                  {enrolleeGender}
                </p>
              </div>
              <div className="h-[48px] flex flex-col gap-1">
                <p className="text-sm text-[#475367] tracking-normal font-normal font-hnd">
                  Encounter Date
                </p>
                <p className="font-medium font-hnd text-[15px]/[24px] text-[#39475E]">
                  {encounterDate}
                </p>
              </div>
              <div className="h-[48px] flex flex-col gap-1">
                <p className="text-sm text-[#475367] tracking-normal font-normal font-hnd">
                  Payable Bill
                </p>
                <p className="font-bold text-primary">{payableTotal}</p>
              </div>
            </div>
          )}
        </div>

        {/* Treatment Items */}
        <div className="w-full flex flex-col gap-4 relative">
          {showInsight && (
            <div className="absolute -right-8 z-[100] -top-8 bg-white">
              <div className="w-[224px] rounded-3xl py-3 px-2 flex flex-col justify-between gap-2 shadow-[0px_21px_22.1px_0px_#0000000D] border border-[#F0F0F0]">
                <div className="h-[28px] bg-[#C2C2C217] w-full flex justify-between items-center rounded-[24px] py-[2px] pr-[2px] pl-[1px]">
                  <h3 className="font-light font-hnd text-[#616161] text-[14px]/[18.86px] tracking-normal">
                    AI Insight
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowInsight((p) => !p)}
                    className="p-1 rounded-md hover:bg-[#F2F4F7] transition"
                    title={showInsight ? "Hide AI Insight" : "Show AI Insight"}
                  >
                    <MagicPenAltIcon />
                  </button>
                </div>

                <p className="text-[12px]/[16px] text-[#C88200] font-normal font-hnd tracking-normal">
                  {scoring.description ??
                    "Clinical scoring details are not available for this claim."}
                </p>
              </div>
            </div>
          )}

          <div className="w-full overflow-x-auto border-[0.93px] shadow-[0px_0.93px_1.87px_0px_#1018280F,0px_0.93px_2.8px_0px_#1018281A] rounded-[24px] py-[2px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Diagnosis</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead className="w-28">Category</TableHead>
                  <TableHead className="w-16">Qty</TableHead>
                  <TableHead className="w-24">Submitted Bill</TableHead>
                  <TableHead className="text-center w-20">Status</TableHead>
                  <TableHead className="w-24">Payable Bill</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isLoading && !error && items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-6 text-center text-sm text-muted-foreground"
                    >
                      No services available for this claim.
                    </TableCell>
                  </TableRow>
                )}

                {items.map((item, idx) => (
                  <TableRow key={`${idx + 1}`}>
                    <TableCell>{item.diagnosis}</TableCell>
                    <TableCell>
                      <div className="w-fit bg-[#CFCFCF3D] flex items-center gap-2 text-[12px]/[18.68px] text-[#101828] tracking-normal rounded-xl py-[2px] px-2 h-[23px]">
                        <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                        {item.services}
                      </div>
                      <p className="font-hnd font-normal text-[14px]/[18px] text-[#101828] tracking-normal">
                        {item.serviceCode}
                      </p>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.qty}</TableCell>
                    <TableCell>{item.submittedBill}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={`h-[20.74px] ${
                          item.status === "Approved"
                            ? " bg-[#ECFDF3] text-[#027A48]"
                            : "bg-[#DE602B26] text-[#DE602B]"
                        }`}
                      >
                        <span
                          className={`inline-block w-[5.6px] h-[5.6px] rounded-full bg-current mr-1  ${
                            item.status === "Approved"
                              ? " text-[#027A48]"
                              : "text-[#DE602B]"
                          }`}
                        />
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.payableBill}</TableCell>
                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => setShowInsight((p) => !p)}
                        className="p-1 rounded-md hover:bg-[#F2F4F7] transition"
                        title={
                          showInsight ? "Hide AI Insight" : "Show AI Insight"
                        }
                      >
                        <MagicPenIcon
                          className={`w-5 h-5 text-[#667085] transition ${
                            showInsight ? "opacity-100" : "opacity-50"
                          }`}
                        />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}

                {items.length > 0 && (
                  <>
                    {/* Subtotal / tax */}
                    <TableRow className="w-full">
                      <TableCell colSpan={6}>
                        <span className="flex flex-col gap-4 text-[14px]/[18.66px] text-[#101828]">
                          <span>Sub Total</span>
                          <span>Tax (10%)</span>
                        </span>
                      </TableCell>
                      <TableCell colSpan={2}>
                        <span className="flex flex-col gap-4 text-[14px]/[18.66px]">
                          <span>
                            {numericSubtotal
                              ? `₦${numericSubtotal.toLocaleString()}`
                              : "—"}
                          </span>
                          <span>
                            {numericTax
                              ? `₦${numericTax.toLocaleString()}`
                              : "—"}
                          </span>
                        </span>
                      </TableCell>
                    </TableRow>

                    {/* Total */}
                    <TableRow className="w-full bg-[#F9FAFC] border border-[#EAECF0]">
                      <TableCell
                        colSpan={6}
                        className="tracking-normal text-[16px]/[18.66px] font-bold text-primary"
                      >
                        Total
                      </TableCell>
                      <TableCell
                        colSpan={2}
                        className="tracking-normal text-[16px]/[18.66px] font-bold text-primary"
                      >
                        {payableTotal}
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between">
          {/* Pay to */}
          <div className="flex flex-col gap-1">
            <p className="text-[12px]/[15.84px] text-[#1A1C21] font-medium tracking-normal mb-3">
              Pay to:
            </p>
            <p className="text-[14px]/[16px] text-[#344054] font-hnd font-normal tracking-normal">
              {payToAccountNumber}
            </p>
            <p className="text-[14px]/[16px] text-[#344054] font-hnd font-normal tracking-normal">
              {payToBankName}
            </p>
            <p className="text-[14px]/[16px] text-[#344054] font-hnd font-normal tracking-normal">
              {payToAccountName}
            </p>
            <p className="text-[14px]/[16px] text-[#344054] font-hnd font-normal tracking-normal mt-8">
              Thank you!
            </p>
          </div>

          {/* Approved by */}
          <div className="text-right">
            <p className="text-[12px]/[15.84px] text-[#1A1C21] font-medium tracking-normal mb-3">
              Approved by:
            </p>
            <p className="text-[14px]/[16px] text-[#344054] font-hnd font-normal tracking-normal">
              {approverName}
            </p>
            <p className="text-[14px]/[16px] text-[#344054] font-hnd font-normal tracking-normal">
              {approverRole}
            </p>
            <p className="text-[14px]/[16px] text-[#344054] font-hnd font-normal tracking-normal">
              {approvedDate}
            </p>

            <div className="flex justify-end items-end mt-8">
              <SignatureIcon />
            </div>
          </div>
        </div>
      </div>
    </CustomSheet>
  );
}
