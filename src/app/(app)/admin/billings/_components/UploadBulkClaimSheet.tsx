"use client"

import { AddButon, CancelButton } from "@/components/form/button"
import { CustomSheet } from "@/components/overlays/SideDialog"
import { ExcelFileIcon, MarkedIcon, UploadFile } from "@/components/svgs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import * as React from "react"
import { ClaimAnalysisResultSheet } from "./AnalysisResult"

type BulkState = "idle" | "uploading" | "ready" | "analyzing" | "done"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

function AnalyzingSpinner({ size = 42 }: { size?: number }) {
  const innerOffset = 4
  return (
    <div
      className="relative flex items-center justify-center bg-[#D9D9D9]/30"
      style={{ width: size, height: size }}
    >
      {/* Outer spinning gradient ring */}
      <div
        className="animate-spin rounded-full bg-[conic-gradient(from_90deg_at_50%_50%,_rgba(255,_255,_255,_0)_0deg,_#F4F4F4_89.68deg,_#1A74D9_299.66deg,_#1671D9_360deg)]"
        style={{ width: size, height: size }}
      />
      {/* Inner solid circle to create donut effect */}
      <div
        className="absolute rounded-full bg-white"
        style={{
          width: size - innerOffset * 2,
          height: size - innerOffset * 2,
        }}
      />
    </div>
  )
}

export function UploadBulkClaimSheet({
  openResultSheet,
  onOpenResultChange,
}: {
  openResultSheet: boolean
  onOpenResultChange: (open: boolean) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [state, setState] = React.useState<BulkState>("idle")
  const [fileName, setFileName] = React.useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [fileSize, setFileSize] = React.useState<string>("")

  const uploadIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(
    null
  )
  const analysisTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  const clearUploadInterval = () => {
    if (uploadIntervalRef.current) {
      clearInterval(uploadIntervalRef.current)
      uploadIntervalRef.current = null
    }
  }

  const clearAnalysisTimeout = () => {
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current)
      analysisTimeoutRef.current = null
    }
  }

  const reset = () => {
    setState("idle")
    setFileName(null)
    setFileSize("")
    setUploadProgress(0)
    clearUploadInterval()
    clearAnalysisTimeout()
  }

  const startFakeUpload = () => {
    clearUploadInterval()
    setState("uploading")
    setUploadProgress(0)

    uploadIntervalRef.current = setInterval(() => {
      setUploadProgress((prev) => {
        const next = Math.min(prev + 5, 100)

        if (next === 100) {
          clearUploadInterval()
          setState("ready")
        }

        return next
      })
    }, 200) // ~4s total
  }

  const handleFileChange = (file: File) => {
    setFileName(file.name)
    setFileSize(formatFileSize(file.size))
    startFakeUpload()
  }

  const handleAnalyze = () => {
    if (!fileName || state !== "ready") return
    setState("analyzing")

    clearAnalysisTimeout()
    analysisTimeoutRef.current = setTimeout(() => {
      setState("done")
    }, 2500) // fake analysis duration
  }

  const handleSheetChange = (next: boolean) => {
    if (!next) reset()
    setOpen(next)
  }

  // cleanup on unmount – inline the cleanup to avoid extra deps in the array
  React.useEffect(() => {
    return () => {
      if (uploadIntervalRef.current) {
        clearInterval(uploadIntervalRef.current)
        uploadIntervalRef.current = null
      }
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current)
        analysisTimeoutRef.current = null
      }
    }
  }, [])

  return (
    <CustomSheet
      title="Bulk Claim Analysis"
      subtitle="Add file to analyze claims"
      position="center"
      panelClassName="h-full max-h-[750px] top-[137px] w-[calc(100vw-32px)] md:w-[522px]"
      open={open}
      trigger={
        <AddButon
          text="Upload Files"
          icon={<UploadFile className="text-white" />}
        />
      }
      onOpenChange={handleSheetChange}
      contentClassName="px-8 py-6 space-y-6"
      footer={
        <div className="flex w-full items-center justify-between">
          <CancelButton
            onClick={() => handleSheetChange(false)}
            text="Cancel"
          />
        </div>
      }
    >
      <div className="w-full flex flex-col">
        {/* Upload area */}
        <label className="w-full h-[206px] py-6 block cursor-pointer rounded-3xl border border-[#E9EAEB] bg-[#FFFFFF] text-center">
          <input
            type="file"
            className="hidden"
            accept=".csv,.xlsx,.xls,.pdf"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileChange(file)
            }}
          />
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-[0px_4px_4px_0px_#0000000A] border border-[#E9EAEB]">
            <UploadFile className="text-[#292D32]" aria-hidden />
          </div>
          <p className="flex flex-col gap-3 text-[#6F6F6F] text-sm font-normal font-hnd tracking-normal">
            <span className="text-[#1671D9] font-bold text-[21.33px]">
              Upload Claim File
            </span>
            <span>
              <span className="text-[#1671D9] hover:underline">
                Click to Upload{" "}
              </span>{" "}
              or drag and drop your files here
              <br />
              Supported formats: CSV, XLSX, PDF · Max file size: 10MB
            </span>
          </p>
        </label>

        {/* Selected file chip + progress */}
        {fileName && (
          <div className="w-full flex flex-col justify-center items-center gap-6 mt-4">
            <div className="w-full max-w-[426px] flex items-center gap-2 justify-between rounded-br-2xl rounded-bl-2xl bg-[#1671D9] px-4 py-[11px] text-white">
              <div className="flex items-center gap-[9px]">
                <ExcelFileIcon />

                <div className="flex flex-col">
                  <span className="font-hnd font-semibold text-sm tracking-normal text-white text-center">
                    {fileName}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-hnd font-normal text-sm text-white/66">
                      {fileSize}
                    </span>
                    <Button
                      variant="ghost"
                      className="w-fit h-4 font-hnd font-normal text-xs underline hover:bg-transparent text-[#FFFFFFA8] tracking-normal p-0"
                      onClick={reset}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>

              {/* Upload progress vs done check */}
              {state === "uploading" ? (
                <Progress
                  variant="circular"
                  value={uploadProgress}
                  size={42}
                  strokeWidth={6}
                  showLabel
                />
              ) : (
                <MarkedIcon />
              )}
            </div>

            {/* Analyze / View Result section */}
            {(state === "ready" || state === "analyzing") && (
              <div className="relative flex w-full justify-center mt-2">
                <Image
                  alt=""
                  src="/analyze-glow.png"
                  width={210}
                  height={54}
                  aria-hidden="true"
                  className="w-[210px] pointer-events-none absolute inset-0 m-auto"
                />

                <Button
                  type="button"
                  onClick={handleAnalyze}
                  className="relative z-10 h-[44px] rounded-full bg-white text-base font-semibold text-[#1671D9] hover:bg-white/80 border-0"
                >
                  {state === "analyzing" ? (
                    <>
                      <AnalyzingSpinner size={24} /> Analyzing Claim
                    </>
                  ) : (
                    "Analyze Claim"
                  )}
                </Button>
              </div>
            )}
            {state === "done" && (
              <div className="relative flex w-full justify-center mt-2">
                <Image
                  alt=""
                  src="/analyze-glow.png"
                  width={210}
                  height={54}
                  aria-hidden="true"
                  className="w-[210px] pointer-events-none absolute inset-0 m-auto"
                />

                <ClaimAnalysisResultSheet
                  open={openResultSheet}
                  onOpenChange={onOpenResultChange}
                />
              </div>
            )}
          </div>
        )}

        {/* State hints */}
        {state === "idle" && (
          <p className="pt-8 text-center text-xs font-normal text-[#9CA3AF]">
            No claim file uploaded yet.
          </p>
        )}

        {state === "analyzing" && (
          <div className="w-full flex flex-col justify-center items-center pt-12">
            <div className="flex flex-col gap-2">
              <div className="h-[11.95px] font-hnd font-semibold text-sm text-[#1671D9] tracking-normal flex items-center">
                Eligibility Check <MarkedIcon className="text-[#1671D9]" />
              </div>
              <p className="h-[19px] text-base font-semibold font-hnd text-[#A7A7A7] tracking-normal">
                Fraud Check
              </p>
            </div>
          </div>
        )}

        {state === "done" && (
          <p className="h-[41px] pt-12 text-center text-sm text-[#797979] font-hnd font-normal tracking-normal">
            Analysis completed
          </p>
        )}
      </div>
    </CustomSheet>
  )
}
