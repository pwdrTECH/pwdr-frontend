"use client";

import { CustomSheet } from "@/components/overlays/SideDialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BillingRow } from "../page";

const formatNaira = (v: number) =>
  `₦${v.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

type DetailVariant = "single" | "multi";

interface BillServiceLine {
  id: string;
  encounterDate: string;
  enrolleeId: string;
  diagnosis: string;
  code: string;
  services: { label: string; cost: number; color: string }[];
  drugs?: { label: string; cost: number; color: string }[];
}

const SINGLE_LINES: BillServiceLine[] = [
  {
    id: "1211",
    encounterDate: "12 Dec 2024",
    enrolleeId: "13/OW7E270",
    diagnosis: "Malaria\nTyphoid\nCold/Flu",
    code: "CGGEFIB93898092HJE",
    services: [
      { label: "Admission - Tier 3", cost: 75_000, color: "#00B894" },
      { label: "MRI Test", cost: 110_500, color: "#00B894" },
      { label: "Stool v1", cost: 6_500, color: "#00B894" },
    ],
    drugs: [
      { label: "Widal Test", cost: 40_000, color: "#9B59B6" },
      { label: "Benadryl 25mg", cost: 5_000, color: "#9B59B6" },
      { label: "Panadol", cost: 1_000, color: "#9B59B6" },
    ],
  },
];

const MULTI_LINES: BillServiceLine[] = [
  {
    id: "1",
    encounterDate: "12 Dec 2024",
    enrolleeId: "13/OW7E270",
    diagnosis: "Malaria",
    code: "CGGEFIB93898092HJE",
    services: [
      { label: "Admission - Tier 3", cost: 75_000, color: "#00B894" },
      { label: "MRI Test", cost: 110_500, color: "#00B894" },
      { label: "Stool v1", cost: 6_500, color: "#00B894" },
    ],
    drugs: [
      { label: "Widal Test", cost: 40_000, color: "#9B59B6" },
      { label: "Benadryl 25mg", cost: 5_000, color: "#9B59B6" },
      { label: "Panadol", cost: 1_000, color: "#9B59B6" },
    ],
  },
  {
    id: "2",
    encounterDate: "13 Dec 2024",
    enrolleeId: "13/OW7E270",
    diagnosis: "Malaria",
    code: "CGGEFIB93898092BTE",
    services: [{ label: "Malaria Test", cost: 5_000, color: "#00B894" }],
    drugs: [{ label: "Lyntemin Tablets X12", cost: 4_250, color: "#9B59B6" }],
  },
  {
    id: "3",
    encounterDate: "13 Dec 2024",
    enrolleeId: "13/OW7E270",
    diagnosis: "Malaria",
    code: "CGGEFIB93898092BTE",
    services: [{ label: "Malaria Test", cost: 5_000, color: "#00B894" }],
    drugs: [{ label: "Lyntemin Tablets X12", cost: 4_250, color: "#9B59B6" }],
  },
  {
    id: "4",
    encounterDate: "13 Dec 2024",
    enrolleeId: "13/OW7E270",
    diagnosis: "Malaria",
    code: "CGGEFIB93898092BTE",
    services: [{ label: "Malaria Test", cost: 5_000, color: "#00B894" }],
    drugs: [{ label: "Lyntemin Tablets X12", cost: 4_250, color: "#9B59B6" }],
  },
];

interface BillDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: BillingRow;
  variant: DetailVariant;
}

export function BillDetailSheet({
  open,
  onOpenChange,
  bill,
  variant,
}: BillDetailSheetProps) {
  const lines = variant === "single" ? SINGLE_LINES : MULTI_LINES;

  const subtotal = lines.reduce(
    (sum, l) =>
      sum +
      l.services.reduce((s, x) => s + x.cost, 0) +
      (l.drugs?.reduce((s, x) => s + x.cost, 0) ?? 0),
    0,
  );
  const tax = subtotal * 0.1;
  const totalDue = subtotal + tax;

  return (
    <CustomSheet
      title="Bill Review"
      subtitle={`${bill.provider} · ${bill.dueDate}`}
      open={open}
      onOpenChange={onOpenChange}
      // extra padding because this is a “document”
      contentClassName="px-10 py-6 space-y-8"
      footer={
        <div className="flex items-center justify-between border-t border-[#EAECF0] pt-4">
          <div className="text-[11px] text-[#9CA3AF]">
            Page {variant === "single" ? "28/28" : "1/28"}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-full px-4 text-sm"
            >
              Print
            </Button>
            <Button
              type="button"
              className="h-9 rounded-full bg-[#2563EB] px-4 text-sm text-white hover:bg-[#1D4ED8]"
            >
              Download
            </Button>
          </div>
        </div>
      }
    >
      {/* Top header area matching the mock */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E5F4FF]">
            <span className="font-hnd text-lg font-bold text-[#2563EB]">
              TCH
            </span>
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-[#111827]">
              Ally Healthcare
            </span>
            <span className="text-xs text-[#6B7280]">ALTP2B4/G34H</span>
            <span className="text-xs text-[#6B7280]">
              {bill.dueDate} · Bill Review
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 text-sm font-medium">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#00B894]" />
          <span>Services</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#9B59B6]" />
          <span>Drugs</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[20px] border border-[#E5E7EB]">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F9FAFB]">
              <TableHead className="w-[72px] text-xs">
                {variant === "multi" ? "#" : "Encounter"}
              </TableHead>
              <TableHead className="text-xs">Encounter Date</TableHead>
              <TableHead className="text-xs">Enrollee ID</TableHead>
              <TableHead className="text-xs">Diagnosis</TableHead>
              <TableHead className="text-xs">Code</TableHead>
              <TableHead className="text-right text-xs">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line, idx) => {
              const servicesTotal = line.services.reduce(
                (s, x) => s + x.cost,
                0,
              );
              const drugsTotal =
                line.drugs?.reduce((s, x) => s + x.cost, 0) ?? 0;
              const total = servicesTotal + drugsTotal;

              return (
                <TableRow key={line.id}>
                  <TableCell className="align-top text-xs">
                    {variant === "multi" ? idx + 1 : line.id}
                  </TableCell>
                  <TableCell className="align-top text-xs">
                    {line.encounterDate}
                  </TableCell>
                  <TableCell className="align-top text-xs">
                    {line.enrolleeId}
                  </TableCell>
                  <TableCell className="align-top whitespace-pre-line text-xs">
                    {line.diagnosis}
                  </TableCell>
                  <TableCell className="align-top text-xs">
                    {line.code}
                  </TableCell>
                  <TableCell className="align-top text-xs">
                    <div className="flex flex-col items-end gap-1">
                      {line.services.map((s) => (
                        <div
                          key={s.label}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: s.color }}
                          />
                          <span>{s.label}</span>
                          <span>{formatNaira(s.cost)}</span>
                        </div>
                      ))}
                      {line.drugs?.map((d) => (
                        <div
                          key={d.label}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: d.color }}
                          />
                          <span>{d.label}</span>
                          <span>{formatNaira(d.cost)}</span>
                        </div>
                      ))}
                      {variant === "multi" && (
                        <div className="mt-1 text-xs font-semibold">
                          {formatNaira(total)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Totals + footer text */}
      <div className="flex flex-col gap-8">
        <div className="ml-auto w-full max-w-xs text-sm">
          <div className="flex justify-between pb-2">
            <span className="text-[#6B7280]">Subtotal</span>
            <span className="font-medium text-[#111827]">
              {formatNaira(subtotal)}
            </span>
          </div>
          <div className="flex justify-between pb-2">
            <span className="text-[#6B7280]">Tax (10%)</span>
            <span className="font-medium text-[#111827]">
              {formatNaira(tax)}
            </span>
          </div>
          <div className="mt-2 flex justify-between border-t border-[#E5E7EB] pt-3">
            <span className="font-semibold text-[#111827]">Total due</span>
            <span className="font-semibold text-[#2563EB]">
              {formatNaira(totalDue)}
            </span>
          </div>
        </div>

        <div className="grid gap-6 text-sm text-[#111827] sm:grid-cols-2">
          <div>
            <div className="mb-1 font-semibold">Pay to:</div>
            <div>1234567890</div>
            <div>Zenith Bank Plc</div>
            <div>Hospital XYZ</div>
            <div className="mt-4">Thank you!</div>
          </div>
          <div className="sm:text-right">
            <div className="mb-1 font-semibold">Approved by:</div>
            <div>John Doe</div>
            <div>HMO Manager</div>
            <div>12 December 2024</div>
            <div className="mt-6 text-3xl">✍️</div>
          </div>
        </div>
      </div>
    </CustomSheet>
  );
}
