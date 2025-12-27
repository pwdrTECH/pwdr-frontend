"use client"

import * as React from "react"
import { ReportShell } from "./_components/ReportShell"
import type { ReportKey } from "./_components/report-config"

export default function ReportPage() {
  const [active, setActive] = React.useState<ReportKey>("requests_by_provider")

  return <ReportShell active={active} onActiveChange={setActive} />
}
