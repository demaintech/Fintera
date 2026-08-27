const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://fintera-aquaculture-bckend.onrender.com';

// --- Interfaces matching FastAPI / Pydantic schema ---

export interface FeedingSchedulePayload {
  pond_name: string;
  species: string;
  feed_type: string;
  target_amount: number;
  feeding_time: string;
  frequency: string;
  is_active?: boolean;
  note?: string;
}

export interface FeedingScheduleItem extends FeedingSchedulePayload {
  id: number;
}

export interface GetSchedulesResponse {
  status: string;
  message?: string;
  data: FeedingScheduleItem[];
}

// --- Auth Utilities ---

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  let token =
    localStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('authToken');

  if (!token) {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        token = user?.token || user?.access_token || null;
      } catch {
        token = null;
      }
    }
  }

  if (!token) return null;
  return token.replace(/^"|"$/g, '').replace(/^Bearer\s+/i, '').trim();
};

const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// --- API Methods ---

/**
 * Fetch all schedules for the logged-in user
 */
export async function getSchedules(): Promise<GetSchedulesResponse> {
  const response = await fetch(`${API_BASE_URL}/schedule/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.detail || errorData?.message || `Failed to fetch schedules (Status: ${response.status})`
    );
  }

  return response.json();
}

/**
 * Create a new feeding schedule
 */
export async function createSchedule(
  payload: FeedingSchedulePayload
): Promise<FeedingScheduleItem> {
  const response = await fetch(`${API_BASE_URL}/schedule/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const detailMsg = Array.isArray(errorData?.detail)
      ? errorData?.detail?.[0]?.msg
      : errorData?.detail || errorData?.message;
    throw new Error(detailMsg || `Failed to create schedule (Status: ${response.status})`);
  }

  return response.json();
}

/**
 * Partially update a feeding schedule (PATCH)
 */
export async function updateSchedule(
  scheduleId: number,
  payload: Partial<FeedingSchedulePayload>
): Promise<FeedingScheduleItem> {
  const response = await fetch(`${API_BASE_URL}/schedule/${scheduleId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const detailMsg = Array.isArray(errorData?.detail)
      ? errorData?.detail?.[0]?.msg
      : errorData?.detail || errorData?.message;
    throw new Error(detailMsg || `Failed to update schedule (Status: ${response.status})`);
  }

  return response.json();
}

/**
 * Delete a feeding schedule (Soft delete on backend)
 */
export async function deleteSchedule(scheduleId: number): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/schedule/${scheduleId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.detail || errorData?.message || `Failed to delete schedule (Status: ${response.status})`
    );
  }

  return response.json();
}