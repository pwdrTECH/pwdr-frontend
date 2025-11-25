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
import { X } from "lucide-react";

interface ClaimDetailModalProps {
  claim: {
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
  };
  onClose: () => void;
  open?: boolean;
}

interface TreatmentItem {
  diagnosis: string;
  services: string;
  serviceCode: string;
  category: string;
  qty: string;
  submittedBill: string;
  status: "Approved" | "Queried";
  payableBill: string;
}

const treatmentItems: TreatmentItem[] = [
  {
    diagnosis: "Cold/Flu",
    services: "CGGEFI98398092HJE",
    serviceCode: "GYNAECOLOGIST CONSULTATION",
    category: "Consultation",
    qty: "1.00",
    submittedBill: "N18,000",
    status: "Approved",
    payableBill: "N600,000",
  },
  {
    diagnosis: "Cold/Flu",
    services: "CGGEFI98398092HJE",
    serviceCode: "Benadyl 25mg",
    category: "Drugs",
    qty: "1.00",
    submittedBill: "N18,000",
    status: "Approved",
    payableBill: "N23,000,000",
  },
  {
    diagnosis: "Cold/Flu",
    services: "CGGEFI98398092HJE",
    serviceCode: "Benadyl 25mg",
    category: "Drugs",
    qty: "1.00",
    submittedBill: "N18,000",
    status: "Queried",
    payableBill: "N400,000",
  },
];

export default function ClaimDetailModal({
  claim,
  onClose,
  open = false,
}: ClaimDetailModalProps) {
  if (!claim) return null;

  return (
    <CustomSheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      contentClassName="xl:w-[1222px] p-6"
    >
      {/* Header Info */}
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
              {claim.providerName}
            </SheetTitle>
            <SheetDescription className="text-[14px] tracking-normal text-[#5E6470]">
              {claim.date}
            </SheetDescription>
          </SheetHeader>

          <div className="w-[300px] flex flex-col">
            <p className="text-[16px]/[18.1px] font-bold tracking-normal text-[#1671D9] text-right">
              {claim.enrolleeName}
            </p>
            <p className="text-sm text-[#5E6470] font-hnd font-normal tracking-normal text-right">
              {claim.enrolleeId}
            </p>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col gap-[30px] rounded-[12px] pt-[14px] pb-6 px-6">
        {/* Enrollee Claim Details */}
        <div className="w-full flex flex-col gap-4">
          <TableTitle>Enrollee Claim Details</TableTitle>
          <div className="grid grid-cols-4 gap-[38px]">
            <div className="h-[48px] flex flex-col gap-1">
              <p className="text-sm text-[#475367] tracking-normal font-normal font-hnd">
                Age
              </p>
              <p className="font-medium font-hnd text-[15px]/[24px] text-[#39475E]">
                32 years
              </p>
            </div>
            <div className="h-[48px] flex flex-col gap-1">
              <p className="text-sm text-[#475367] tracking-normal font-normal font-hnd">
                Gender
              </p>
              <p className="font-medium font-hnd text-[15px]/[24px] text-[#39475E]">
                Female
              </p>
            </div>
            <div className="h-[48px] flex flex-col gap-1">
              <p className="text-sm text-[#475367] tracking-normal font-normal font-hnd">
                Encounter Date
              </p>
              <p className="font-medium font-hnd text-[15px]/[24px] text-[#39475E]">
                Wed Dec 04 2024
              </p>
            </div>
            <div className="h-[48px] flex flex-col gap-1">
              <p className="text-sm text-[#475367] tracking-normal font-normal font-hnd">
                Payable Bill
              </p>
              <p className="font-bold text-primary">{claim.totalCost}</p>
            </div>
          </div>
        </div>

        {/* Treatment Items */}
        <div className="w-full flex flex-col gap-4 relative">
          <div className="absolute -right-8 z-100 -top-8 bg-white">
            <div className="w-[224px] rounded-3xl py-3 px-2 flex flex-col justify-between gap-2 shadow-[0px_21px_22.1px_0px_#0000000D] border border-[#F0F0F0]">
              <div className="h-[28px] bg-[#C2C2C217] w-full flex justify-between items-center rounded-[24px] py-[2px] pr-[2px] pl-[1px]">
                <h3 className="font-light font-hnd text-[#616161] text-[14px]/[18.86px] tracking-normal">
                  AI Insight
                </h3>
                <MagicPenAltIcon />
              </div>

              <p className="text-[14px]/[18px] text-[#C88200] font-normal font-hnd tracking-normal">
                Service approved and available within Utilization threshold.
              </p>
            </div>
          </div>

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
                {treatmentItems.map((item, idx) => (
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
                        className={`h-[20.74px]] ${
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
                    <TableCell>
                      <MagicPenIcon className="text-[#667085]" />
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="w-full">
                  <TableCell colSpan={6}>
                    <span className="flex flex-col gap-4 text-[14px]/[18.66px] text-[#101828]">
                      <span>Sub Total</span>

                      <span>Tax (10%)</span>
                    </span>
                  </TableCell>
                  <TableCell colSpan={2}>
                    <span className="flex flex-col gap-4 text-[14px]/[18.66px]">
                      <span>N22,000,000</span>
                      <span>N2,200,000</span>
                    </span>
                  </TableCell>
                </TableRow>
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
                    {claim.totalCost}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-[12px]/[15.84px] text-[#1A1C21] font-medium tracking-normal mb-3">
              Pay to:
            </p>
            <p className="text-[14px]/[16px] text-[#344054] font-hnd font-normal tracking-normal">
              1234567890
            </p>
            <p className="text-[14px]/[16px] text-[#344054] font-hnd font-normal tracking-normal">
              Zenith Bank Plc
            </p>
            <p className="text-[14px]/[16px] text-[#344054] font-hnd font-normal tracking-normal">
              {claim.providerName}
            </p>
            <p className="text-[14px]/[16px] text-[#344054] font-hnd font-normal tracking-normal mt-8">
              Thank you!
            </p>
          </div>
          <div className="text-right">
            <p className="text-[12px]/[15.84px] text-[#1A1C21] font-medium tracking-normal mb-3">
              Approved by:
            </p>
            <p className="text-[14px]/[16px] text-[#344054] font-hnd font-normal tracking-normal">
              John Doe
            </p>
            <p className="text-[14px]/[16px] text-[#344054] font-hnd font-normal tracking-normal">
              HMO Manager
            </p>
            <p className="text-[14px]/[16px] text-[#344054] font-hnd font-normal tracking-normal">
              12 December 2024
            </p>
            {/* Signature */}
            <div className="flex justify-end items-end mt-8">
              <SignatureIcon />
            </div>
          </div>
        </div>
      </div>
    </CustomSheet>
  );
}
