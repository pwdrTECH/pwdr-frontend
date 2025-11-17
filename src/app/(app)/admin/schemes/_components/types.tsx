export type SchemeCode = "NHIS" | "PHIS" | "TSHIP" | "NYSC"

export type PlanItem = {
  id: string
  name: string
  premium: number
  servicesCount: number
  waitDays: number
  utilization: number
  serviceItems: string[]
  schemes: SchemeCode[]
  status?: "active" | "inactive"
}

export type SchemeGroup = {
  code: SchemeCode
  title: string
  subtitle: string
  active: boolean
  plans: PlanItem[]
}
