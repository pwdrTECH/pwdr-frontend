"use client"

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
import {
  useProcessClaim,
  useRequestDetails,
  useSubmitRequest,
} from "@/lib/api/requests"
import * as React from "react"
import { toast } from "sonner"
import type { RequestItem, RequestStatus } from "./types"
import { STATUS_BADGE, STATUS_LABEL } from "./types"

/* -------------------------------------------------------------------------- */
/*                      DEFINE MISSING API TYPES                        */
/* -------------------------------------------------------------------------- */

type RequestDetailsApiResponse = {
  status?: boolean | string | number
  message?: string
  data?: {
    claim?: any
    enrolee?: any
    services?: any[]
    summary?: any
    [k: string]: any
  }
  [k: string]: any
}

/* -------------------------------------------------------------------------- */
/*                               HELPER: AGE FROM DOB                         */
/* -------------------------------------------------------------------------- */

function calculateAge(dob: string | null | undefined): string | undefined {
  if (!dob) return undefined
  const birth = new Date(dob)
  if (Number.isNaN(birth.getTime())) return undefined

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  if (age < 0) return undefined
  return `${age} years`
}

/* -------------------------------------------------------------------------- */
/*                              STATUS MAPPING                                */
/* -------------------------------------------------------------------------- */

function mapClaimStatusToRequestStatus(
  status: string | undefined | null
): RequestStatus {
  const s = (status ?? "").toLowerCase()

  switch (s) {
    case "pending":
      return "pending"
    case "processed":
    case "approved":
      return "resolved"
    case "queried":
      return "overdue"
    default:
      return "pending"
  }
}

type RequestDetailParams = {
  claim_id?: number
  tracking_number?: string
}

interface RequestDetailsProps {
  requestId?: string
  selected?: RequestItem | null
}

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                   */
/* -------------------------------------------------------------------------- */

export function PreAuthRequestDetails({
  requestId,
  selected,
}: RequestDetailsProps) {
  const [reasonText, setReasonText] = React.useState("")
  const [reasonError, setReasonError] = React.useState("")
  const [assignedTo, setAssignedTo] = React.useState<string>("")
  const processClaim = useProcessClaim()
  const submitClaimRequest = useSubmitRequest()

  /* ------------------------------------------------------------------------ */
  /*           BUILD PARAMS FOR useRequestDetails (claim_id OR tracking)      */
  /* ------------------------------------------------------------------------ */

  const claimKey = selected?.id ?? requestId // "33" or "FE1C6E..." etc
  const hasSelection = Boolean(claimKey)

  const detailParams: RequestDetailParams | undefined = React.useMemo(() => {
    if (!claimKey) return undefined
    const asNumber = Number(claimKey)
    if (!Number.isNaN(asNumber)) return { claim_id: asNumber }
    return { tracking_number: String(claimKey) }
  }, [claimKey])

  /* ------------------------------------------------------------------------ */
  /*                    FIX: CALL useRequestDetails ONCE                      */
  /*          (removed duplicate requestDetailsResult + undefined params)      */
  /* ------------------------------------------------------------------------ */

  const requestDetailsResult = useRequestDetails(detailParams) as {
    data?: RequestDetailsApiResponse
    isLoading?: boolean
    error?: unknown
  }

  const data = requestDetailsResult?.data
  const isLoading: boolean = requestDetailsResult?.isLoading ?? false
  const fetchError: unknown = requestDetailsResult?.error
  const hasError = Boolean(fetchError)

  const apiDetail = data?.data
  const claim = apiDetail?.claim
  const enrollee = apiDetail?.enrolee
  const services = apiDetail?.services ?? []
  const summary = apiDetail?.summary
  const plan = claim?.plan
  const provider = claim?.provider

  const totalAmount =
    typeof summary?.total_amount === "number" ? summary.total_amount : undefined

  const coverage = typeof plan?.premium === "number" ? plan.premium : undefined

  const fullNameFromApi =
    `${enrollee?.first_name ?? ""} ${enrollee?.surname ?? ""}`.trim() ||
    enrollee?.enrolee_name ||
    undefined

  const genderFromApi = enrollee?.gender
    ? enrollee.gender.charAt(0).toUpperCase() + enrollee.gender.slice(1)
    : undefined

  const ageFromApi = calculateAge(enrollee?.dob)

  const displayName = fullNameFromApi || selected?.name || "—"
  const displayGender = genderFromApi || "—"
  const displayAge = ageFromApi || "—"

  const enrolleeNumber = enrollee?.enrolee_id || enrollee?.enrollee_id || "—"

  const trackingNumber = claim?.tracking_number ?? claim?.id?.toString() ?? "—"

  const createdBy = provider?.name ?? "—"

  const scheme = plan?.name ?? "—"

  const encounterDate = claim?.encounter_date ?? claim?.date_created ?? "—"

  const diagnoses = claim?.diagnosis ?? "—"

  const bill =
    totalAmount != null ? `NGN ${totalAmount.toLocaleString()}` : "NGN 0.00"

  const utilization =
    coverage != null ? `NGN ${coverage.toLocaleString()}` : "NGN 0.00"

  const utilizationUsed =
    coverage && totalAmount != null
      ? `${Math.round((totalAmount / coverage) * 100)}%`
      : "0%"

  const balanceLeft =
    coverage && totalAmount != null
      ? `NGN ${(coverage - totalAmount).toLocaleString()}`
      : "NGN 0.00"

  // include serviceId so we can call process-claim-service.php correctly
  const treatmentItems =
    services.length > 0
      ? services.map((it: any, idx: number) => ({
          id: String(it.id ?? idx + 1),
          serviceId: it.id ?? it.service_id,
          service: it.service_name ?? it.service ?? "",
          qty: it.quantity ?? it.qty ?? 0,
          category: it.item_type ?? it.category ?? "",
          submittedBill: `NGN ${Number(it.total ?? 0).toLocaleString()}`,
          rawStatus: it.status,
          action:
            it.status === "approved"
              ? "Approved"
              : it.status === "pending"
              ? "Approve"
              : "Queried",
        }))
      : []

  const totalApprovedDisplay =
    totalAmount != null ? `NGN ${totalAmount.toLocaleString()}` : "NGN 0.00"

  const statusFromClaim = mapClaimStatusToRequestStatus(claim?.status)
  const displayCode: RequestStatus =
    statusFromClaim ?? selected?.requestStatus ?? "pending"
  const displayLabel = STATUS_LABEL[displayCode]
  const badgeClass = STATUS_BADGE[displayCode]

  /* ------------------------------------------------------------------------ */
  /*                  PROCESS CLAIM: APPROVE / QUERY / SUBMIT                 */
  /* ------------------------------------------------------------------------ */

  const handleApproveService = async (
    serviceId: number | undefined,
    serviceName: string,
    amount: string
  ) => {
    if (!claim?.id) {
      toast.error("Missing claim id.")
      return
    }
    if (!serviceId) {
      toast.error("Missing service id.")
      return
    }

    try {
      await processClaim.mutateAsync({
        claim_id: claim.id,
        service_id: serviceId,
        status: "approved",
        notes: reasonText.trim(),
      })

      toast.success(
        `Service "${serviceName}" (${amount}) approved successfully.`
      )
      setReasonText("")
    } catch (err: any) {
      toast.error(err?.message || "Failed to approve claim service.")
    }
  }

  const handleQueryService = async (
    serviceId: number | undefined,
    serviceName: string,
    amount: string
  ) => {
    if (!reasonText.trim()) {
      setReasonError("Please provide a reason.")
      return
    }
    if (!claim?.id) {
      toast.error("Missing claim id.")
      return
    }
    if (!serviceId) {
      toast.error("Missing service id.")
      return
    }

    try {
      await processClaim.mutateAsync({
        claim_id: claim.id,
        service_id: serviceId,
        status: "queried",
        notes: reasonText.trim(),
      })

      toast.success(`Service "${serviceName}" (${amount}) marked as queried.`)
      setReasonText("")
      setReasonError("")
    } catch (err: any) {
      toast.error(err?.message || "Failed to query claim service.")
    }
  }

  // Footer "Submit" → approve all pending services
  const onProcessClaimSubmit = async () => {
    if (!claim?.id) {
      toast.error("Missing claim id.")
      return
    }

    try {
      await submitClaimRequest.mutateAsync({
        claim_id: claim.id,
      })

      toast.success("This claim has been submitted successfully")
      setReasonText("")
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit claim.")
    }
  }

  /* ------------------------------------------------------------------------ */
  /*                           EMPTY-STATE RENDER                             */
  /* ------------------------------------------------------------------------ */

  if (!hasSelection && !isLoading && !hasError) {
    return (
      <div className="flex-1 p-6 rounded-3xl border border-[#E4E7EC] bg-white flex items-center justify-center">
        <p className="text-sm text-[#667085]">
          Select a request from the left panel to view its details.
        </p>
      </div>
    )
  }

  /* ------------------------------------------------------------------------ */
  /*                                  RENDER                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="flex-1 p-2.5 rounded-3xl border border-[#E4E7EC] flex flex-col gap-2.5 bg-white overflow-y-auto">
      <div className="w-full flex flex-col gap-6 rounded-[12px] py-[14px] px-6">
        {/* HEADER */}
        <div className="sticky top-0 bg-white pb-4">
          <div className="flex items-start justify-between">
            {/* LEFT */}
            <div className="flex flex-col gap-2">
              <Badge className="h-[19px] bg-[#FF2E3B33] text-[#FF2E3B]">
                {trackingNumber}
              </Badge>

              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-bold text-[#101928]">
                  Request Details
                </h2>

                <Badge className={badgeClass}>{displayLabel}</Badge>
              </div>

              {isLoading && (
                <p className="text-xs text-gray-500">Loading details…</p>
              )}

              {hasError && (
                <p className="text-xs text-red-600">
                  Unable to load request details.
                </p>
              )}
            </div>

            {/* RIGHT: ASSIGNEE */}
            <div className="flex items-center gap-6">
              <span className="w-[85px] text-[15px]">Assigned to:</span>

              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger className="h-[44px] w-[200px]">
                  <SelectValue
                    placeholder={
                      claim?.assigned_to ? "Change assignee" : "Select Assignee"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {claim?.assigned_to && (
                    <SelectItem value={claim.assigned_to}>
                      {claim.assigned_to}
                    </SelectItem>
                  )}
                  {!claim?.assigned_to && (
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="h-px bg-[#E4E7EC]" />

        {/* MAIN CONTENT */}
        <div className="flex flex-col gap-[38px]">
          {/* --- TOP GRID INFO (Full name, gender, age, etc) --- */}
          <div className="grid grid-cols-3 gap-6">
            {[
              ["Full Name", displayName],
              ["Gender", displayGender],
              ["Age", displayAge],
              ["Scheme/Plan", scheme],
              ["Request ID", trackingNumber],
              ["Created By", createdBy],
              ["Enrollee Number", enrolleeNumber],
              ["Diagnoses", diagnoses],
              ["Bill", bill],
              ["Encounter Date", encounterDate],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1">
                <label htmlFor="" className="text-[14px] text-[#475367]">
                  {label}
                </label>
                <p className="text-[15px] font-bold text-[#484F59]">
                  {value ?? "—"}
                </p>
              </div>
            ))}
          </div>

          {/* PLAN INFO BOX */}
          <div className="bg-[#FFFFFF0F] rounded-xl p-2 grid grid-cols-4 gap-4 border border-[#1671D929]">
            {[
              ["Plan:", scheme],
              ["Utilization", utilization],
              ["Utilization Used", utilizationUsed],
              ["Balance left", balanceLeft],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center gap-3 px-[17px]">
                <label htmlFor="" className="text-[14px] text-[#475367]">
                  {label}
                </label>
                <p className="text-[15px] font-bold text-[#484F59]">
                  {value ?? "—"}
                </p>
              </div>
            ))}
          </div>

          {/* TREATMENT ITEMS */}
          <div className="bg-white rounded-[12px] border border-[#EAECF0] shadow">
            <h3 className="text-[18px] font-bold text-[#101828] py-[11px] px-[22px]">
              Treatment Items
            </h3>

            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead>Service Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Submitted Bill</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {treatmentItems.map((item: any) => (
                  <TableRow key={item.id} className="border-b">
                    <TableCell>{item.service}</TableCell>
                    <TableCell className="text-right">{item.qty}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">
                      {item.submittedBill}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.action === "Approve" && (
                        <div className="flex items-center gap-[11px] justify-center">
                          {/* APPROVE SERVICE */}
                          <ConfirmDialog
                            variant="info"
                            title="Confirm Claim Approval"
                            confirmText="Approve"
                            trigger={
                              <Button className="hover:text-[#1671D9] hover:bg-[#EDF5FF]">
                                Approve
                              </Button>
                            }
                            description={
                              <div className="flex flex-col gap-2">
                                <Label>Note</Label>
                                <Textarea
                                  value={reasonText}
                                  onChange={(e) => {
                                    setReasonText(e.target.value)
                                    if (reasonError) setReasonError("")
                                  }}
                                  className="bg-[#F8F8F8]"
                                />
                                {reasonError && (
                                  <span className="text-xs text-red-600">
                                    {reasonError}
                                  </span>
                                )}
                              </div>
                            }
                            onConfirm={() =>
                              handleApproveService(
                                item.serviceId as number,
                                item.service,
                                item.submittedBill
                              )
                            }
                          />

                          {/* QUERY SERVICE */}
                          <ConfirmDialog
                            title="Reason for Query"
                            confirmText="Submit"
                            trigger={
                              <Button
                                variant="outline"
                                className="hover:bg-transparent hover:text-black"
                              >
                                Query
                              </Button>
                            }
                            description={
                              <div className="space-y-2">
                                <p className="text-sm text-[#475367]">
                                  Provide a reason for querying{" "}
                                  <strong>{item.service}</strong> (
                                  {item.submittedBill}).
                                </p>
                                <Label title="Reason for Query" />
                                <Textarea
                                  value={reasonText}
                                  onChange={(e) => {
                                    setReasonText(e.target.value)
                                    if (reasonError) setReasonError("")
                                  }}
                                  className="bg-[#F8F8F8]"
                                />
                                {reasonError && (
                                  <span className="text-xs text-red-600">
                                    {reasonError}
                                  </span>
                                )}
                              </div>
                            }
                            onConfirm={() =>
                              handleQueryService(
                                item.serviceId as number,
                                item.service,
                                item.submittedBill
                              )
                            }
                          />
                        </div>
                      )}

                      {item.action === "Queried" && (
                        <Badge className="bg-[#F7F7F7] text-[#767676]">
                          Queried
                        </Badge>
                      )}

                      {item.action === "Approved" && (
                        <Badge className="bg-[#ECFDF3] text-[#166534]">
                          Approved
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow className="bg-[#E3EFFC42]">
                  <TableCell colSpan={3}>
                    Total Approved Service Amount
                  </TableCell>
                  <TableCell className="text-right">
                    {totalApprovedDisplay}
                  </TableCell>
                  <TableCell className="text-right">
                    <ConfirmDialog
                      variant="info"
                      title="Confirm Submit"
                      confirmText="Submit"
                      trigger={<Button>Submit</Button>}
                      description={
                        <p className="text-sm text-[#475367]">
                          You are about to submit all pending services for this
                          claim. Submitting will approve these services on
                          behalf of the reviewer.
                        </p>
                      }
                      onConfirm={onProcessClaimSubmit}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* ACTIVITY LOGS / COMMENTS (still static for now) */}
          <div className="border-t pt-6">
            <Tabs defaultValue="logs">
              <TabsList className="border-b bg-transparent p-0 gap-6">
                <TabsTrigger value="logs">Activity Logs</TabsTrigger>
                <TabsTrigger value="comments">
                  Comments{" "}
                  <span className="ml-2 text-white bg-[#1671D9] rounded px-2 text-xs">
                    1
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="logs" className="mt-4 space-y-4">
                <div className="flex justify-between">
                  <div className="flex gap-3">
                    <span className="w-2 h-2 bg-[#767676] rounded-full mt-1" />
                    <div>
                      <p className="text-[16px] font-medium text-[#2C3A52]">
                        Hassan Garba
                      </p>
                      <p className="text-[12px] text-[#667085]">
                        Submitted This Claim
                      </p>
                    </div>
                  </div>
                  <p className="text-[14px] text-[#667085]">
                    Jan 15, 2025 12:04pm
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="comments" className="mt-4 space-y-4">
                <div className="flex justify-between">
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="/images/profile.jpg" />
                      <AvatarFallback>HG</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[16px] font-medium text-[#2C3A52]">
                        Hassan Garba
                      </p>
                      <p className="text-[12px] text-[#667085]">
                        Documentation Manager
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-[#F7F7F7] text-[#767676]">Queried</Badge>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F8F8]">
                  <p className="text-[14px] text-[#515151]">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit...
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
