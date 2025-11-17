"use client"

import { SubmitButton } from "@/components/form/button"
import Label from "@/components/form/label"
import { ConfirmDialog } from "@/components/overlays/ConfirmDialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import * as React from "react"
import type { RequestItem, RequestStatus } from "./types"
import { STATUS_BADGE, STATUS_LABEL, labelToCode } from "./types"

interface RequestDetailsProps {
  requestId?: string
  selected?: RequestItem | null
}

const requestsDataMap: Record<string, any> = {
  "1": {
    id: "02:56",
    status: "Pending",
    assignedTo: "Hassan Garba",
    fullName: "Olivia Rhye",
    gender: "Female",
    age: "32 years",
    enrolleeNumber: "212Z10I7703-1",
    requestId: "RDU27G/04",
    createdBy: "ACME Hospital",
    scheme: "PHIS /Gold Plan",
    encounterDate: "Wed Dec 04 2024",
    diagnoses: "Acute Upper Respiratory Tract Infection",
    bill: "NGN 18,000.00",
    plan: "Gold",
    utilization: "N850,000",
    utilizationUsed: "32%",
    balanceLeft: "N578,000",
    treatmentItems: [
      {
        id: "1",
        service: "GENERAL CONSULTATION",
        qty: 100,
        category: "Consultation",
        submittedBill: "N18,000",
        action: "Approve",
      },
      {
        id: "2",
        service: "Tab. Loratadine 10 mg — 1 tab od ×...",
        qty: 100,
        category: "Drugs",
        submittedBill: "N18,000",
        action: "Queried",
      },
      {
        id: "3",
        service: "COVID-19 Rapid Antigen Test (if in...",
        qty: 100,
        category: "Test",
        submittedBill: "N18,000",
        action: "Approved",
      },
    ],
    totalApproved: "N18,000",
  },
  "2": {
    id: "03:15",
    status: "In Review",
    assignedTo: "Dr. Jane Smith",
    fullName: "Linda Eseyin",
    gender: "Female",
    age: "28 years",
    enrolleeNumber: "212Z10I7703-2",
    requestId: "RDU27G/05",
    createdBy: "Reliance HMO",
    scheme: "Premium Health Plan",
    encounterDate: "Thu Dec 05 2024",
    diagnoses: "Hypertension Management",
    bill: "NGN 25,000.00",
    plan: "Premium",
    utilization: "N500,000",
    utilizationUsed: "45%",
    balanceLeft: "N275,000",
    treatmentItems: [
      {
        id: "1",
        service: "SPECIALIST CONSULTATION",
        qty: 1,
        category: "Consultation",
        submittedBill: "N25,000",
        action: "Approve",
      },
      {
        id: "2",
        service: "Blood Pressure Monitor",
        qty: 1,
        category: "Equipment",
        submittedBill: "N15,000",
        action: "Approved",
      },
    ],
    totalApproved: "N40,000",
  },
  "3": {
    id: "03:45",
    status: "Pending",
    assignedTo: "Hassan Garba",
    fullName: "Joseph Jibril",
    gender: "Male",
    age: "45 years",
    enrolleeNumber: "212Z10I7703-3",
    requestId: "RDU27G/06",
    createdBy: "Hygeia HMO",
    scheme: "Corporate Gold",
    encounterDate: "Fri Dec 06 2024",
    diagnoses: "Orthopedic Surgery Follow-up",
    bill: "NGN 150,000.00",
    plan: "Gold",
    utilization: "N2,000,000",
    utilizationUsed: "60%",
    balanceLeft: "N800,000",
    treatmentItems: [
      {
        id: "1",
        service: "ORTHOPEDIC CONSULTATION",
        qty: 1,
        category: "Consultation",
        submittedBill: "N30,000",
        action: "Approve",
      },
      {
        id: "2",
        service: "X-Ray Imaging",
        qty: 2,
        category: "Imaging",
        submittedBill: "N50,000",
        action: "Queried",
      },
      {
        id: "3",
        service: "Physiotherapy Sessions",
        qty: 5,
        category: "Therapy",
        submittedBill: "N70,000",
        action: "Approved",
      },
    ],
    totalApproved: "N150,000",
  },
  "4": {
    id: "04:20",
    status: "Resolved",
    assignedTo: "Dr. Michael Brown",
    fullName: "Chisom Chika",
    gender: "Female",
    age: "35 years",
    enrolleeNumber: "212Z10I7703-4",
    requestId: "RDU27G/07",
    createdBy: "Reliance HMO",
    scheme: "Family Plan",
    encounterDate: "Sat Dec 07 2024",
    diagnoses: "Pediatric Vaccination",
    bill: "NGN 5,000.00",
    plan: "Family",
    utilization: "N100,000",
    utilizationUsed: "15%",
    balanceLeft: "N85,000",
    treatmentItems: [
      {
        id: "1",
        service: "VACCINATION SERVICES",
        qty: 3,
        category: "Preventive",
        submittedBill: "N5,000",
        action: "Approved",
      },
    ],
    totalApproved: "N5,000",
  },
  "5": {
    id: "05:10",
    status: "Pending",
    assignedTo: "Hassan Garba",
    fullName: "Hafsat Woru",
    gender: "Female",
    age: "52 years",
    enrolleeNumber: "212Z10I7703-5",
    requestId: "RDU27G/08",
    createdBy: "Hygeia HMO",
    scheme: "Executive Plan",
    encounterDate: "Sun Dec 08 2024",
    diagnoses: "Cardiac Assessment",
    bill: "NGN 200,000.00",
    plan: "Executive",
    utilization: "N5,000,000",
    utilizationUsed: "70%",
    balanceLeft: "N1,500,000",
    treatmentItems: [
      {
        id: "1",
        service: "CARDIOLOGY CONSULTATION",
        qty: 1,
        category: "Consultation",
        submittedBill: "N50,000",
        action: "Approve",
      },
      {
        id: "2",
        service: "ECG and Stress Test",
        qty: 1,
        category: "Diagnostic",
        submittedBill: "N75,000",
        action: "Queried",
      },
      {
        id: "3",
        service: "Echocardiogram",
        qty: 1,
        category: "Imaging",
        submittedBill: "N100,000",
        action: "Approved",
      },
    ],
    totalApproved: "N225,000",
  },
  "6": {
    id: "05:50",
    status: "Pending",
    assignedTo: "Dr. Peace Okafor",
    fullName: "Kabir Suru",
    gender: "Male",
    age: "41 years",
    enrolleeNumber: "212Z10I7703-6",
    requestId: "RDU27G/09",
    createdBy: "Reliance HMO",
    scheme: "Standard Plan",
    encounterDate: "Mon Dec 09 2024",
    diagnoses: "Dental Procedure",
    bill: "NGN 35,000.00",
    plan: "Standard",
    utilization: "N300,000",
    utilizationUsed: "25%",
    balanceLeft: "N225,000",
    treatmentItems: [
      {
        id: "1",
        service: "DENTAL CONSULTATION",
        qty: 1,
        category: "Dental",
        submittedBill: "N10,000",
        action: "Approve",
      },
      {
        id: "2",
        service: "Crown and Bridge Work",
        qty: 2,
        category: "Dental",
        submittedBill: "N25,000",
        action: "Queried",
      },
    ],
    totalApproved: "N35,000",
  },
}

export function RequestDetails({ requestId, selected }: RequestDetailsProps) {
  const [reasonText, setReasonText] = React.useState("")
  const [reasonError, setReasonError] = React.useState("")
  const [assignedTo, setAssignedTo] = React.useState("")

  const mockRequest = requestId
    ? requestsDataMap[requestId]
    : requestsDataMap["1"]

  const nameFromSelected = selected?.name?.trim()
  const codeFromSelected: RequestStatus | undefined = selected?.requestStatus

  const codeFromMock: RequestStatus | undefined = labelToCode(
    mockRequest?.status
  )
  const displayCode: RequestStatus = (codeFromSelected ||
    codeFromMock ||
    "pending") as RequestStatus

  const displayName = nameFromSelected || mockRequest?.fullName || "—"
  const displayLabel = STATUS_LABEL[displayCode]
  const badgeClass = STATUS_BADGE[displayCode]

  const queryId = "query-reason"

  const submitQueryReason = () => {
    if (!reasonText.trim()) {
      setReasonError("Please provide a reason.")
      return
    }
    console.log("Reason submitted:", reasonText)
    setReasonError("")
    setReasonText("")
  }

  return (
    <div className="flex-1 p-2.5 rounded-3xl border border-[#E4E7EC] flex flex-col gap-2.5 bg-white overflow-y-auto">
      <div className="w-full flex flex-col gap-6 rounded-[12px] py-[14px] px-6">
        {/* Header */}
        <div className="sticky top-0 bg-white">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <Badge className="h-[19.56px] flex justify-center items-center bg-[#FF2E3B33] px-[8.34px] rounded-xl text-[#FF2E3B]  py-[2.78px]  text-sm font-semibold">
                {mockRequest?.id}
              </Badge>

              <div className="flex items-center gap-2">
                <h2 className="text-[18px]/[24px] font-hnd font-bold tracking-normal text-[#101928]">
                  Request Details
                </h2>
                <Badge className={badgeClass} variant="secondary">
                  {displayLabel}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-6 rounded-3xl h-12.5">
              <span className="w-[85px] font-normal font-hnd text-[#1F2937] text-[15px] leading-[-0.5%]">
                Assigned to:
              </span>
              <div className="relative">
                <Select
                  value={assignedTo}
                  onValueChange={(v) => setAssignedTo(v as any)}
                >
                  <SelectTrigger className="data-[size=default]:h-[44px] w-full py-3 px-[14px] border border-[#D0D5DD] rounded-[12px] shadow-none">
                    <SelectValue placeholder="Select Assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={mockRequest?.assignedTo}>
                      {mockRequest?.assignedTo}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <div className="h-px bg-[#E4E7EC]" />

        <div className="flex flex-col gap-[38px]">
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-[14px]/[20px] font-normal font-hnd tracking-normal text-[#475367]">
                Full Name
              </label>
              <p className="text-[15px]/[24px] font-bold font-hnd text-[#484F59] tracking-normal">
                {displayName}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[14px]/[20px] font-normal font-hnd tracking-normal text-[#475367]">
                Gender
              </label>
              <p className="text-[15px]/[24px] font-bold font-hnd text-[#484F59] tracking-normal">
                {mockRequest?.gender}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[14px]/[20px] font-normal font-hnd tracking-normal text-[#475367]">
                Age
              </label>
              <p className="text-[15px]/[24px] font-bold font-hnd text-[#484F59] tracking-normal">
                {mockRequest?.age}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[14px]/[20px] font-normal font-hnd tracking-normal text-[#475367]">
                Scheme/Plan
              </label>
              <p className="text-[15px]/[24px] font-bold font-hnd text-[#484F59] tracking-normal">
                {mockRequest?.scheme}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[14px]/[20px] font-normal font-hnd tracking-normal text-[#475367]">
                Request ID
              </label>
              <p className="text-[15px]/[24px] font-bold font-hnd text-[#484F59] tracking-normal">
                {mockRequest?.requestId}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[14px]/[20px] font-normal font-hnd tracking-normal text-[#475367]">
                Created By
              </label>
              <p className="text-[15px]/[24px] font-bold font-hnd text-[#484F59] tracking-normal">
                {mockRequest?.createdBy}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[14px]/[20px] font-normal font-hnd tracking-normal text-[#475367]">
                Enrollee Number
              </label>
              <p className="text-[15px]/[24px] font-bold font-hnd text-[#484F59] tracking-normal">
                {mockRequest?.enrolleeNumber}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[14px]/[20px] font-normal font-hnd tracking-normal text-[#475367]">
                Diagnoses
              </label>
              <p className="text-[15px]/[24px] font-bold font-hnd text-[#484F59] tracking-normal">
                {mockRequest?.diagnoses}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[14px]/[20px] font-normal font-hnd tracking-normal text-[#475367]">
                Bill
              </label>
              <p className="text-[15px]/[24px] font-bold font-hnd text-[#484F59] tracking-normal">
                {mockRequest?.bill}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[14px]/[20px] font-normal font-hnd tracking-normal text-[#475367]">
                Encounter Date
              </label>
              <p className="text-[15px]/[24px] font-bold font-hnd text-[#484F59] tracking-normal">
                {mockRequest?.encounterDate}
              </p>
            </div>
          </div>

          {/* Plan Information */}
          <div className="bg-[#FFFFFF0F] rounded-xl p-2 grid grid-cols-4 gap-4 border border-[#1671D929]">
            <div className="flex items-center gap-3 py-1 px-[17px] h-[28px]">
              <label className="text-[14px]/[20px] font-normal font-hnd tracking-normal text-[#475367]">
                Plan:
              </label>
              <p className="text-[15px]/[24px] font-bold font-hnd text-[#484F59] tracking-normal">
                {mockRequest?.plan}
              </p>
            </div>
            <div className="flex items-center gap-3 py-1 px-[17px] h-[28px]">
              <label className="text-[14px]/[20px] font-normal font-hnd tracking-normal text-[#475367]">
                Utilization
              </label>
              <p className="text-[15px]/[24px] font-bold font-hnd text-[#484F59] tracking-normal">
                {mockRequest?.utilization}
              </p>
            </div>
            <div className="flex items-center gap-3 py-1 px-[17px] h-[28px]">
              <label className="text-[14px]/[20px] font-normal font-hnd tracking-normal text-[#475367]">
                Utilization Used
              </label>
              <p className="text-[15px]/[24px] font-bold font-hnd text-[#484F59] tracking-normal">
                {mockRequest?.utilizationUsed}
              </p>
            </div>
            <div className="flex items-center gap-3 py-1 px-[17px] h-[28px]">
              <label className="text-[14px]/[20px] font-normal font-hnd tracking-normal text-[#475367]">
                Balance left
              </label>
              <p className="text-[15px]/[24px] font-bold font-hnd text-[#484F59] tracking-normal">
                {mockRequest?.balanceLeft}
              </p>
            </div>
          </div>

          {/* Treatment Items */}
          <div className="bg-white rounded-[12px] border-[0.93px] border-[#EAECF0] shadow-[0px_0.93px_1.87px_0px_#1018280F,0px_0.93px_2.8px_0px_#1018281A]">
            <h3 className="text-[18px]/[24px] font-bold text-[#101828] py-[11.21px] px-[22.42px]">
              Treatment Items
            </h3>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#EAECF0]">
                  <TableHead className="">Service Item</TableHead>
                  <TableHead className=" text-right">Qty</TableHead>
                  <TableHead className="">Category</TableHead>
                  <TableHead className=" text-right">Submitted Bill</TableHead>
                  <TableHead className=" text-center">Action</TableHead>
                </TableRow>
              </TableHeader>

              {/* ONE tbody only */}
              <TableBody>
                {mockRequest?.treatmentItems?.map((item: any) => (
                  <TableRow key={item.id} className="border-b border-[#EAECF0]">
                    <TableCell className="text-sm text-[#636E7D]">
                      {item.service}
                    </TableCell>
                    <TableCell className="text-sm text-[#636E7D] text-right">
                      {item.qty}
                    </TableCell>
                    <TableCell className="text-sm text-[#636E7D]">
                      {item.category}
                    </TableCell>
                    <TableCell className="text-sm text-[#636E7D] text-right">
                      {item.submittedBill}
                    </TableCell>
                    <TableCell>
                      {item.action === "Approve" && (
                        <div className="flex items-center gap-[11.2px]">
                          {/* Approve */}
                          <ConfirmDialog
                            variant="info"
                            title="Confirm Submit"
                            confirmText="Yes, Submit"
                            trigger={
                              <Button className="h-[33.94px] border-0 bg-[#EDF5FF] text-[#1671D9] py-[7.47px] px-[13.08px] hover:bg-[#EDF5FF]/90">
                                {item.action}
                              </Button>
                            }
                            onConfirm={() => {
                              console.log("Approving claim")
                            }}
                            description={
                              <p className="font-hnd font-normal text-[#666666] text-[16px]/[24px] tracking-normal">
                                Are you sure you want to approve this Claim?
                              </p>
                            }
                          />

                          <ConfirmDialog
                            variant="info"
                            title="Reason for Query"
                            confirmText="Submit"
                            button={<SubmitButton>Submit</SubmitButton>}
                            trigger={
                              <Button
                                variant="outline"
                                className="h-[33.94px] rounded-[7.63px] border-[0.93px] border-[#D0D5DD] text-[#344054] py-[7.47px] px-[13.08px] hover:bg-transparent hover:text-[#344054]"
                              >
                                Query
                              </Button>
                            }
                            onConfirm={submitQueryReason}
                            description={
                              <div className="space-y-2">
                                <Label
                                  htmlFor={queryId}
                                  title="Reason for Query"
                                />
                                <Textarea
                                  id={queryId}
                                  value={reasonText}
                                  onChange={(e) => {
                                    setReasonText(e.target.value)
                                    if (reasonError) setReasonError("")
                                  }}
                                  placeholder="Description"
                                  className="bg-[#F8F8F8]"
                                />

                                {reasonError && (
                                  <span className="text-xs text-red-600">
                                    {reasonError}
                                  </span>
                                )}
                              </div>
                            }
                          />
                        </div>
                      )}

                      {item.action === "Queried" && (
                        <ConfirmDialog
                          variant="info"
                          title="Reason for Query"
                          confirmText="Close"
                          trigger={
                            <Badge className="bg-[#F7F7F7] h-5 flex gap-[5.6px] items-center justify-center rounded-2xl py-[1.87px] px-[7.47px]">
                              <span className="w-2 h-2 rounded-full bg-[#767676]" />
                              <span className="font-medium font-hnd text-[12px]/[14px] text-[#767676]">
                                {item.action}
                              </span>
                            </Badge>
                          }
                          description={
                            <div className="space-y-2">
                              <Label
                                htmlFor={queryId}
                                title="Reason for Query"
                              />
                              <Textarea
                                id={`${queryId}-view`}
                                value={reasonText}
                                onChange={(e) => setReasonText(e.target.value)}
                                placeholder="(No reason saved yet) Type to draft/update..."
                                maxLength={300}
                                className="mt-1"
                              />
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-[#98A2B3]">
                                  {reasonText.length}/300
                                </span>
                              </div>
                            </div>
                          }
                        />
                      )}

                      {item.action === "Approved" && (
                        <Badge className="bg-[#ECFDF3] h-5 flex gap-[5.6px] items-center justify-center rounded-2xl py-[1.87px] px-[7.47px]">
                          <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                          <span className="font-medium font-hnd text-[12px]/[14px] text-[#166534]">
                            {item.action}
                          </span>
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-[#E3EFFC42]">
                  <TableCell
                    colSpan={3}
                    className="font-hnd font-medium tracking-normal text-[14px]/[18.66px] text-[#3C475D]"
                  >
                    Total Approved Service Amount
                  </TableCell>
                  <TableCell
                    colSpan={1}
                    className="font-hnd font-semibold text-[16px]/[18.66px] text-[#667085] tracking-normal text-right"
                  >
                    {mockRequest?.totalApproved}
                  </TableCell>
                  <TableCell colSpan={1} className="text-right">
                    <ConfirmDialog
                      variant="info"
                      title="Confirm Submit"
                      confirmText="Yes, Submit"
                      trigger={
                        <Button className="h-[33.94px] py-[7.47px] px-[13.08px]">
                          Submit
                        </Button>
                      }
                      onConfirm={() => {
                        console.log("Submitting claim")
                      }}
                      description={
                        <p className="font-hnd font-normal text-[#666666] text-[16px]/[24px] tracking-normal">
                          Are you sure you want to submit this Claim?
                        </p>
                      }
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Activity Tabs */}
          <div className="border-t border-[#EAECF0] pt-6">
            <Tabs defaultValue="logs" className="w-full">
              <TabsList className="bg-transparent border-b border-[#EAECF0] p-0 h-auto gap-6">
                <TabsTrigger value="logs" className="font-bold">
                  Activity Logs
                </TabsTrigger>
                <TabsTrigger value="comments" className="font-bold">
                  Comments{" "}
                  <span className="h-[22px] rounded-[10px] ml-2 text-white bg-[#1671D9] text-xs px-2 py-0.5 font-hnd font-medium tracking-[-0.5%]">
                    1
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="logs" className="mt-4 space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-3 justify-between">
                    <div className="flex gap-3">
                      <span className="mt-1 w-2 h-2 rounded-full bg-[#767676]" />
                      <div>
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col gap-[5px]">
                            <p className="text-[16px]/[16px] tracking-normal font-hnd font-medium text-[#2C3A52]">
                              Hassan Garba
                            </p>
                            <p className="text-[12px]/[14px] text-[#667085] font-medium font-hnd tracking-normal">
                              Submitted This Claim
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-[14px]/[22px] text-[#667085] font-medium font-hnd tracking-normal">
                      Jan 15, 2025 12:04pm
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-3 justify-between">
                    <div className="flex gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#767676]" />
                      <div>
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col gap-[5px]">
                            <p className="text-[16px]/[16px] tracking-normal font-hnd font-medium text-[#2C3A52]">
                              Favour Grace Ikekhua
                            </p>
                            <p className="text-[12px]/[14px] text-[#667085] font-medium font-hnd tracking-normal">
                              Approved This claimed
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-[14px]/[22px] text-[#667085] font-medium font-hnd tracking-normal">
                      Jan 15, 2025 12:04pm
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="comments" className="mt-4">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-3 justify-between">
                    <div className="flex gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="/images/profile.jpg" />
                        <AvatarFallback>HG</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col gap-[5px]">
                            <p className="text-[16px]/[16px] tracking-normal font-hnd font-medium text-[#2C3A52]">
                              Hassan Garba
                            </p>
                            <p className="text-[12px]/[14px] text-[#667085] font-medium font-hnd tracking-normal">
                              Documentation Manager
                            </p>
                          </div>
                          <Badge className="bg-[#F7F7F7] h-5 flex gap-[5.6px] items-center justify-center rounded-2xl py-[1.87px] px-[7.47px]">
                            <span className="w-2 h-2 rounded-full bg-[#767676]" />
                            <span className="font-medium font-hnd text-[12px]/[14px] text-[#767676]">
                              Queried
                            </span>
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-[14px]/[22px] text-[#667085] font-medium font-hnd tracking-normal">
                      Jan 15, 2025 12:04pm
                    </p>
                  </div>
                  <div className="p-2 rounded-2xl bg-[#F8F8F8]">
                    <p className="font-normal font-hnd text-[14px]/[20px] text-[#515151] tracking-normal">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Aliquam interdum in arcu a lobortis. Fusce fermentum
                      vulputate arcu, sit amet commodo lectus suscipit
                      convallis. Aliquam cursus sem arcu, hendrerit iaculis
                      lorem iaculis non.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
