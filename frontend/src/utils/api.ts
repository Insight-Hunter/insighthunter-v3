const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.insighthunter.app';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export class APIError extends Error {
  constructor(public status: number, public statusText: string, message?: string) {
    super(message || statusText);
    this.name = 'APIError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = true, headers: customHeaders, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (requiresAuth) {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      let error: any = {};
      try {
        error = await response.json();
      } catch {}

      throw new APIError(
        response.status,
        response.statusText,
        error.message || error.error || response.statusText
      );
    }

    return response.json();
  } catch (error: any) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(0, 'Network Error', error?.message || 'Unknown error');
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string,  any, options?: RequestOptions) => 
    apiRequest<T>(endpoint, { 
      ...options,
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
    
  put: <T>(endpoint: string,  any, options?: RequestOptions) => 
    apiRequest<T>(endpoint, { 
      ...options,
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
    
  patch: <T>(endpoint: string,  any, options?: RequestOptions) => 
    apiRequest<T>(endpoint, { 
      ...options,
      method: 'PATCH', 
      body: JSON.stringify(data) 
    }),
    
  delete: <T>(endpoint: string, options?: RequestOptions) => 
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};


// Upload file helper
export async function uploadFile(
  endpoint: string,
  file: File,
  additionalData?: Record<string, string>
): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  const token = localStorage.getItem('authToken');
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    let error: any = {};
    try {
      error = await response.json();
    } catch {}

    throw new APIError(response.status, response.statusText, error.message || response.statusText);
  }

  return response.json();
}
