export interface Scheme {
  id: number
  name: string
}

export interface State {
  id: number
  name: string
}
export interface Plan {
  id: number
  name: string
}
export interface PlanPayload {
  token: string
  scheme_id: number
  name: string
}

export interface EnrolleePayload {
  token: string
  email: string
  first_name: string
  surname: string
  other_names: string
  gender: string
  dob: string
  address: string
  city: string
  state: string
  phone: string
  marital_status: string
  origin_state: string
  origin_lga: string
  employment_status: string
  occupation: string
  user_role: string
  principal_id: number | null
  plan_id: number
  next_of_kin: string
  next_of_kin_relationship: string
  next_of_kin_phone: string
  next_of_kin_address: string
}

export interface LoginApiResponse {
  status: number | string
  token?: string | undefined
  data?: {
    id: number
    first_name: string
    last_name: string
    email: string
    phone: string
    user_type: string
  }
  message?: string
}

export interface ApiResponse {
  status: string
  data?: Scheme[]
  message?: string
}

export interface PlanApiResponse {
  status: string
  message?: string
}

export interface EnrolleeApiResponse {
  status: string
  message?: string
}
