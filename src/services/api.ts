// API Service Layer - Central hub for all backend API calls
// Configure base URL based on environment

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token management
const getToken = (): string | null => {
  return localStorage.getItem('wms_token');
};

const setToken = (token: string) => {
  localStorage.setItem('wms_token', token);
};

const clearToken = () => {
  localStorage.removeItem('wms_token');
};

// Common headers
const getHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit & { method?: string } = {},
  includeAuth = true
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getHeaders(includeAuth);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    // Handle token expiration
    if (response.status === 401) {
      clearToken();
      localStorage.removeItem('wms_user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      let errorMessage = `API Error: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use default message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data as T;
  } catch (error: any) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
}

// ==================== AUTH ENDPOINTS ====================
export const authAPI = {
  register: async (data: any) => {
    const response: any = await apiCall(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      false
    );

    const token = response?.data?.token || response?.token;
    if (token) localStorage.setItem('wms_token', token);

    return response;
  },

  login: async (email: string, password: string) => {
    const response: any = await apiCall(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      false
    );

    const token = response?.data?.token || response?.token;
    if (token) localStorage.setItem('wms_token', token);

    return response;
  },

  logout: async () => {
    try {
      await apiCall('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('wms_token');
  },

  getProfile: async () => {
    return apiCall('/auth/profile', { method: 'GET' });
  },

  updateProfile: async (data: any) => {
    return apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    return apiCall('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },
};

// ==================== CITIZEN ENDPOINTS ====================
export const citizenAPI = {
  // Pickup Requests
  createPickupRequest: async (data: {
    wasteType: string;
    wasteQuantity: number;
    pickupAddress: string;
    scheduledDate: string;
    preferredTimeSlot: string;
    description?: string;
    pickupLatitude?: number;
    pickupLongitude?: number;
    priority?: string;
  }) => {
    return apiCall('/citizen/pickup-request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getPickupRequests: async (status?: string, page = 1, limit = 10) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', String(page));
    params.append('limit', String(limit));
    return apiCall(`/citizen/pickup-requests?${params}`);
  },

  getPickupRequestById: async (id: string) => {
    return apiCall(`/citizen/pickup-request/${id}`);
  },

  updatePickupRequestStatus: async (id: string, requestStatus: string, notes?: string) => {
    return apiCall(`/citizen/pickup-request/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ requestStatus, notes }),
    });
  },

  cancelPickupRequest: async (id: string, reason?: string) => {
    return apiCall(`/citizen/pickup-request/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ requestStatus: 'cancelled', notes: reason }),
    });
  },

  getStatistics: async () => {
    return apiCall('/citizen/statistics');
  },

  // Bin Status
  getNearbyBins: async () => {
    return apiCall('/citizen/bins');
  },

  // Payments
  getPayments: async (page = 1, limit = 10) => {
    return apiCall(`/citizen/payments?page=${page}&limit=${limit}`);
  },

  getPaymentByPickupRequest: async (pickupRequestId: string) => {
    return apiCall(`/citizen/payment/${pickupRequestId}`);
  },

  generateInvoice: async (pickupRequestId: string) => {
    return apiCall('/citizen/invoice', {
      method: 'POST',
      body: JSON.stringify({ pickupRequestId }),
    });
  },

  initiatePayment: async (paymentId: string, paymentMethod: string, transactionReference?: string) => {
    return apiCall('/citizen/payment/initiate', {
      method: 'POST',
      body: JSON.stringify({ paymentId, paymentMethod, transactionReference }),
    });
  },

  completePayment: async (paymentId: string, transactionId?: string) => {
    return apiCall('/citizen/payment/complete', {
      method: 'POST',
      body: JSON.stringify({ paymentId, transactionId }),
    });
  },

  // Complaints
  submitComplaint: async (data: { category: string; description: string; location?: string }) => {
    return apiCall('/citizen/complaint', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getComplaints: async (page = 1, limit = 20, status?: string) => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (status) params.append('status', status);
    return apiCall(`/citizen/complaints?${params}`);
  },
};

// ==================== COLLECTOR ENDPOINTS ====================
export const collectorAPI = {
  getAvailableRequests: async (page = 1, limit = 10) => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    return apiCall(`/collector/available-requests?${params}`);
  },

  getAssignedRequests: async (page = 1, limit = 10) => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    return apiCall(`/collector/assigned-requests?${params}`);
  },

  getRequestById: async (id: string) => {
    return apiCall(`/collector/request/${id}`);
  },

  acceptRequest: async (id: string) => {
    return apiCall(`/collector/request/${id}/accept`, {
      method: 'PUT',
    });
  },

  rejectRequest: async (id: string) => {
    return apiCall(`/collector/request/${id}/reject`, {
      method: 'PUT',
    });
  },

  markInTransit: async (id: string) => {
    return apiCall(`/collector/request/${id}/in-transit`, {
      method: 'PUT',
    });
  },

  markCollected: async (id: string) => {
    return apiCall(`/collector/request/${id}/collected`, {
      method: 'PUT',
    });
  },
};

// ==================== ADMIN ENDPOINTS ====================
export const adminAPI = {
  // Pickup Request Management
  getAllPickupRequests: async (status?: string, page = 1, limit = 10) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', String(page));
    params.append('limit', String(limit));
    return apiCall(`/admin/pickup-requests?${params}`);
  },

  getPickupRequestById: async (id: string) => {
    return apiCall(`/admin/pickup-request/${id}`);
  },

  // Collector Assignment
  assignPickupRequest: async (pickupRequestId: string, collectorId: string) => {
    return apiCall(`/admin/pickup-request/${pickupRequestId}/assign-collector`, {
      method: 'PUT',
      body: JSON.stringify({ collectorId }),
    });
  },

  verifyCollection: async (pickupRequestId: string, notes?: string) => {
    return apiCall(`/admin/pickup-request/${pickupRequestId}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ requestStatus: 'verified', notes }),
    });
  },

  // Payments
  getPayments: async (status?: string, page = 1, limit = 10) => {
    const params = new URLSearchParams();
    if (status) params.append('paymentStatus', status);
    params.append('page', String(page));
    params.append('limit', String(limit));
    return apiCall(`/admin/payments?${params}`);
  },

  refundPayment: async (paymentId: string, refundReason: string) => {
    return apiCall('/admin/payment/refund', {
      method: 'POST',
      body: JSON.stringify({ paymentId, refundReason }),
    });
  },

  // Dashboard & Analytics
  getSystemStats: async () => {
    return apiCall('/admin/dashboard-stats');
  },

  getWasteAnalytics: async () => {
    return apiCall('/admin/analytics/waste');
  },

  getSystemHealth: async () => {
    return apiCall('/admin/system-health');
  },

  // User Management (via auth routes, admin can list users)
  getUsers: async (role?: string, page = 1, limit = 50) => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    params.append('page', String(page));
    params.append('limit', String(limit));
    return apiCall(`/admin/users?${params}`);
  },

  updateUserStatus: async (userId: string, status: string) => {
    return apiCall(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Bins
  getAllBins: async () => {
    return apiCall('/admin/bins');
  },

  createBin: async (data: { location: string; wasteType: string; fillLevel?: number; status?: string }) => {
    return apiCall('/admin/bins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateBin: async (id: string, data: { location?: string; wasteType?: string; fillLevel?: number; status?: string }) => {
    return apiCall(`/admin/bins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteBin: async (id: string) => {
    return apiCall(`/admin/bins/${id}`, {
      method: 'DELETE',
    });
  },

  updateBinFillLevel: async (id: string, fillLevel: number) => {
    return apiCall(`/admin/bins/${id}/fill-level`, {
      method: 'PUT',
      body: JSON.stringify({ fillLevel }),
    });
  },

  markBinCollected: async (id: string) => {
    return apiCall(`/admin/bins/${id}/mark-collected`, {
      method: 'PUT',
    });
  },

  // Complaints
  getComplaints: async (page = 1, limit = 20, status?: string, category?: string) => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    return apiCall(`/admin/complaints?${params}`);
  },

  updateComplaintStatus: async (complaintId: string, status: string, adminNotes?: string) => {
    return apiCall(`/admin/complaint/${complaintId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes }),
    });
  },

  // Settings
  getSettings: async () => {
    return apiCall('/admin/settings');
  },

  saveSettings: async (settings: Record<string, any>) => {
    return apiCall('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};

// ==================== IOT ENDPOINTS ====================
export const iotAPI = {
  getSensorData: async (binId: string, limit = 100) => {
    const params = new URLSearchParams();
    params.append('limit', String(limit));
    return apiCall(`/iot/sensor-data/${binId}?${params}`);
  },

  getBinsStatus: async () => {
    return apiCall('/iot/bins/status');
  },

  getAlerts: async () => {
    return apiCall('/iot/alerts');
  },

  recordSensorData: async (data: {
    binId: string;
    location?: { latitude: number; longitude: number; address: string };
    sensorReadings: {
      fillLevel: number;
      weight?: number;
      temperature?: number;
      humidity?: number;
    };
    wasteType: string;
    status: string;
  }) => {
    return apiCall('/iot/sensor-data', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'x-api-key': 'iot-sensor-key' },
    });
  },

  logCollection: async (binId: string, data: {
    collectorId: string;
    quantityCollected: number;
    notes?: string;
  }) => {
    return apiCall(`/iot/bin/${binId}/collection-logged`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export default {
  authAPI,
  citizenAPI,
  collectorAPI,
  adminAPI,
  iotAPI,
  getToken,
  setToken,
  clearToken,
};
