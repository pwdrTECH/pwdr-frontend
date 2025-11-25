"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";

type BulkState = "idle" | "ready" | "analyzing" | "done";

export function BulkClaimAnalysisSheet({
  open,
  onOpenChange,
  onShowResult,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShowResult: () => void;
}) {
  const [state, setState] = React.useState<BulkState>("idle");
  const [fileName, setFileName] = React.useState<string | null>(null);

  const reset = () => {
    setState("idle");
    setFileName(null);
  };

  const handleFileChange = (file: File) => {
    setFileName(file.name);
    setState("ready");
  };

  const handleAnalyze = () => {
    setState("analyzing");
    setTimeout(() => {
      setState("done");
    }, 2000);
  };

  const handleClose = (value: boolean) => {
    if (!value) reset();
    onOpenChange(value);
  };

  const gradientButtonClass =
    "h-10 px-8 rounded-full text-sm font-medium text-white shadow-[0_14px_40px_rgba(99,102,241,0.45)] bg-[radial-gradient(circle_at_0%_0%,#38BDF8,transparent_45%),radial-gradient(circle_at_100%_0%,#6366F1,transparent_45%),radial-gradient(circle_at_50%_100%,#EC4899,transparent_40%)]";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[640px] rounded-[24px] p-0 overflow-hidden">
        <div className="px-8 pt-8 pb-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-semibold text-[#111827]">
              Bulk Claim Analysis
            </DialogTitle>
            <DialogDescription className="text-sm text-[#6B7280]">
              Add file to analyze claims
            </DialogDescription>
          </DialogHeader>

          {/* Upload area */}
          <label className="mb-6 block cursor-pointer rounded-[18px] border border-dashed border-[#CBD5F5] bg-[#F9FAFF] py-10 text-center">
            <input
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileChange(file);
              }}
            />
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white shadow">
              <UploadCloud className="h-5 w-5 text-[#2563EB]" aria-hidden />
            </div>
            <div className="text-sm font-medium text-[#2563EB]">
              Upload Claim File
            </div>
            <div className="mt-1 text-xs text-[#6B7280]">
              Click to Upload or Drag and drop your files here
              <br />
              Supported formats: CSV, XLSX, PDF · Max file size: 10MB
            </div>
          </label>

          {/* Selected file chip */}
          {fileName && (
            <div className="mb-8 flex items-center justify-between rounded-[14px] bg-[#2563EB] px-4 py-3 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  <span aria-hidden>📄</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{fileName}</span>
                  <span className="text-xs text-white/80">
                    253 kb · Recently uploaded
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="text-xs underline"
                onClick={reset}
              >
                Remove
              </button>
            </div>
          )}

          {/* States */}
          {state === "idle" && (
            <p className="mt-12 text-center text-xs text-[#9CA3AF]">
              No claim file uploaded yet.
            </p>
          )}

          {state === "ready" && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                className={gradientButtonClass}
                onClick={handleAnalyze}
              >
                Analyze Claim
              </button>
            </div>
          )}

          {state === "analyzing" && (
            <div className="mt-4 flex flex-col items-center gap-4">
              <button type="button" className={gradientButtonClass} disabled>
                Analyzing Claim
              </button>
              <div className="text-xs text-[#6B7280]">
                <span className="font-medium text-[#2563EB]">
                  Eligibility Check
                </span>{" "}
                · Fraud Check
              </div>
            </div>
          )}

          {state === "done" && (
            <div className="mt-4 flex flex-col items-center gap-4">
              <button
                type="button"
                className={gradientButtonClass}
                onClick={onShowResult}
              >
                View Result
              </button>
              <div className="text-xs text-[#6B7280]">Analysis completed</div>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-full px-4 text-sm"
              onClick={() => handleClose(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
