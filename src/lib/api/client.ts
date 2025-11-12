export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://getmedcoemr.com/powder/controllers/api"

export interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
  status?: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export class ApiError extends Error {
  status: number
  response?: any
  constructor(message: string, status: number, response?: any) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.response = response
  }
}

interface RequestConfig extends RequestInit {
  timeout?: number
  credentials?: RequestCredentials
}

class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(baseUrl: string = apiBaseUrl || "") {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      "Content-Type": "application/json",
    }
  }

  // File upload via fetch (no progress)
  async upload<T>(
    endpoint: string,
    formData: FormData,
    config?: Omit<RequestConfig, "body">
  ): Promise<ApiResponse<T>> {
    const { headers, ...rest } = config || {}
    return this.request<T>(endpoint, {
      method: "POST",
      body: formData,
      headers,
      ...rest,
    })
  }

  // Core request
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { timeout = 10000, headers, credentials, ...rest } = config
    const url = `${this.baseUrl}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const isFormData =
        typeof FormData !== "undefined" && rest.body instanceof FormData

      // Merge headers & avoid setting Content-Type for multipart
      const merged: Record<string, string> = {
        ...this.defaultHeaders,
        ...(headers as Record<string, string> | undefined),
      }
      if (isFormData && merged["Content-Type"]) delete merged["Content-Type"]

      const res = await fetch(url, {
        signal: controller.signal,
        headers: merged,
        credentials: credentials ?? "include",
        ...rest,
      })
      clearTimeout(timeoutId)

      const text = await res.text()
      let data: any = text
        ? (() => {
            try {
              return JSON.parse(text)
            } catch {
              return { message: text }
            }
          })()
        : {}

      if (!res.ok) {
        throw new ApiError(
          data?.message || data?.detail || `HTTP ${res.status}`,
          res.status,
          data
        )
      }

      return {
        data: (data?.data ?? data) as T,
        message: data?.message,
        status: res.status,
      }
    } catch (err: any) {
      clearTimeout(timeoutId)
      if (err instanceof ApiError) throw err
      if (err?.name === "AbortError") throw new ApiError("Request timeout", 408)
      throw new ApiError(err?.message || "Network error", 0)
    }
  }

  async get<T>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET", ...config })
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    })
  }

  async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    })
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    })
  }

  async delete<T>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE", ...config })
  }

  setAuthToken(token: string | null | undefined) {
    if (!token) {
      delete this.defaultHeaders.Authorization
      return
    }
    this.defaultHeaders.Authorization = `Bearer ${token}`
  }

  removeAuthToken() {
    delete this.defaultHeaders.Authorization
  }

  async health(): Promise<ApiResponse<any>> {
    return this.get("/health")
  }

  // Upload with progress (XHR)
  async uploadWithProgress<T>(
    endpoint: string,
    formData: FormData,
    opts: {
      method?: "POST" | "PUT" | "PATCH"
      onProgress?: (pct: number) => void
    } = {}
  ): Promise<ApiResponse<T>> {
    const method = opts.method ?? "POST"
    const url = `${this.baseUrl}${endpoint}`

    return new Promise<ApiResponse<T>>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open(method, url, true)
      xhr.withCredentials = true

      const auth = this.defaultHeaders?.["Authorization"]
      if (auth) xhr.setRequestHeader("Authorization", auth)

      xhr.upload.onprogress = (e) => {
        if (!opts.onProgress || !e.lengthComputable) return
        opts.onProgress(Math.round((e.loaded / e.total) * 100))
      }

      xhr.onload = () => {
        const status = xhr.status
        let payload: any
        try {
          payload = xhr.responseText ? JSON.parse(xhr.responseText) : {}
        } catch {
          payload = { message: xhr.responseText }
        }
        if (status >= 200 && status < 300) {
          resolve({
            data: (payload?.data ?? payload) as T,
            message: payload?.message,
            status,
          })
        } else {
          reject(
            new ApiError(
              payload?.message || payload?.detail || `HTTP ${status}`,
              status,
              payload
            )
          )
        }
      }

      xhr.onerror = () => reject(new ApiError("Network error", 0))
      xhr.ontimeout = () => reject(new ApiError("Request timeout", 408))

      xhr.send(formData)
    })
  }
}

export const apiClient = new ApiClient()
export default apiClient
