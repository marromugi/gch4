export const API_BASE_URL =
  typeof window !== 'undefined'
    ? (import.meta.env?.VITE_API_URL ?? 'http://localhost:8080')
    : 'http://localhost:8080'

type RequestConfig = {
  url: string
  method: string
  params?: Record<string, string | number | boolean | null | undefined>
  data?: unknown
  headers?: HeadersInit
  signal?: AbortSignal
}

type RequestOptions = {
  headers?: HeadersInit
}

export async function customFetch<T>(config: RequestConfig, options?: RequestOptions): Promise<T> {
  // Replace API_BASE_URL placeholder with actual base URL
  const url = config.url.replace('API_BASE_URL', API_BASE_URL)
  const fullUrl = new URL(url)

  if (config.params) {
    Object.entries(config.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        fullUrl.searchParams.append(key, String(value))
      }
    })
  }

  const isFormData = config.data instanceof FormData

  // For FormData, don't set Content-Type - let the browser set it with the boundary
  const headers: HeadersInit = isFormData
    ? { ...options?.headers }
    : {
        'Content-Type': 'application/json',
        ...config.headers,
        ...options?.headers,
      }

  const response = await fetch(fullUrl.toString(), {
    method: config.method,
    headers,
    credentials: 'include',
    body: config.data
      ? isFormData
        ? (config.data as FormData)
        : JSON.stringify(config.data)
      : undefined,
    signal: config.signal,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error((error as { message?: string }).message ?? `HTTP Error: ${response.status}`)
  }

  // Handle empty responses
  const text = await response.text()
  return text ? JSON.parse(text) : ({} as T)
}
