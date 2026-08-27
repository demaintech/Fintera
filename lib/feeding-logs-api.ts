// feeding-logs-api.ts
import { getFeedInventory, FeedInventoryRecord } from './feed-inventory-api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fintera-aquaculture-bckend.onrender.com';

// --- Interfaces ---

export interface CreateFeedingLogPayload {
  feeding_date: string;
  pond_name: string;
  species: string;
  feed_type: string;
  feed_quantity: number;
  feed_cost: number;
  notes?: string;
}

export interface FeedingLogItem {
  id: string;
  feeding_date?: string;
  date?: string;
  pond_name: string;
  species?: string;
  feed_type?: string;
  feed_type_name?: string;
  feed_quantity?: number;
  quantity_kg?: number;
  feed_cost?: number;
  cost?: number;
  recorded_by?: string;
  notes?: string;
  created_at?: string;
}

export interface GetFeedingLogsResponse {
  status: string;
  message?: string;
  data: FeedingLogItem[];
}

// --- Robust Token Retrieval (Matching inventory-api.ts) ---

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

// --- API Service Functions ---

/**
 * Update an existing feed inventory record.
 */
export async function updateFeedInventory(id: string, payload: Partial<FeedInventoryRecord>): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/feed_inventory/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.detail || errorData?.message || `Failed to update inventory (Status: ${response.status})`
    );
  }

  return response.json();
}

/**
 * Fetch all feeding logs for the user.
 */
export async function getFeedingLogs(): Promise<GetFeedingLogsResponse> {
  const response = await fetch(`${API_BASE_URL}/feeding_logs/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.detail || errorData?.message || `Failed to fetch logs (Status: ${response.status})`
    );
  }

  return response.json();
}

/**
 * Create a new feeding log record with payload matching backend Pydantic validation.
 * Checks inventory stock and updates total quantity upon submission.
 */
export async function createFeedingLog(payload: CreateFeedingLogPayload): Promise<FeedingLogItem> {
  // 1. Fetch current feed inventory records
  const inventoryList = await getFeedInventory();

  // 2. Locate feed inventory item matching selected feed type
  const matchingFeed = inventoryList.find((item) => {
    const name = item.feed_name || item.feed_type || '';
    return name.trim().toLowerCase() === payload.feed_type.trim().toLowerCase();
  });

  if (!matchingFeed) {
    throw new Error('No feed in inventory matching the selected feed type.');
  }

  const bagsCount = matchingFeed.quantity || 0;
  const weightPerBag = matchingFeed.av_weight_per_bag || 1;
  const availableStockKg = bagsCount * weightPerBag;

  // 3. Validate stock levels
  if (availableStockKg <= 0 || payload.feed_quantity > availableStockKg) {
    throw new Error('Inventory is low or insufficient feed in inventory.');
  }

  // 4. Create the feeding log entry
  const response = await fetch(`${API_BASE_URL}/feeding_logs/`, {
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
    throw new Error(detailMsg || `Failed to create log (Status: ${response.status})`);
  }

  const createdLog = await response.json();

  // 5. Deduct feed and update inventory database
  const remainingKg = availableStockKg - payload.feed_quantity;
  const updatedBags = remainingKg / weightPerBag;
  const targetId = matchingFeed.id;

  if (targetId) {
    await updateFeedInventory(targetId, {
      ...matchingFeed,
      quantity: updatedBags,
      feed_total_cost: updatedBags * (matchingFeed.feed_cost_per_bag || 0),
    });
  }

  return createdLog;
}