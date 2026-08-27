export interface FeedInventoryPayload {
  feed_name: string;
  feed_type: string;
  quantity: number;
  av_weight_per_bag: number;
  feed_cost_per_bag: number;
  feed_total_cost: number;
  supplier: string;
  expiry_date: string;
  purchase_date: string;
  status: string;
}

export interface FeedInventoryRecord extends FeedInventoryPayload {
  id?: string;
  recorded_by?: string;
  created_at?: string;
}

export interface FeedInventoryResponse {
  status: string;
  message?: string;
  data: FeedInventoryRecord[];
}

export interface SingleFeedInventoryResponse {
  status: string;
  message?: string;
  data: FeedInventoryRecord;
}

export interface FeedLogPayload {
  feed_inventory_id: string;
  quantity_used: number;
  log_date: string;
  notes?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

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

const getHeaders = (token?: string): HeadersInit => {
  const authToken = token || getAuthToken();
  if (!authToken) {
    throw new Error('Authentication required. Please log in.');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
  };
};

const handleResponse = async (response: Response, errorMessage: string) => {
  if (response.status === 401) {
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.detail || errorData?.message || `${errorMessage} (Status: ${response.status})`
    );
  }

  return response.json();
};

/**
 * Fetch all feed inventory records
 */
export async function getFeedInventory(token?: string): Promise<FeedInventoryRecord[]> {
  const headers = getHeaders(token);
  const response = await fetch(`${API_BASE_URL}/feed_inventory/`, {
    method: 'GET',
    headers,
  });

  const result: FeedInventoryResponse = await handleResponse(
    response,
    'Failed to fetch feed inventory'
  );
  return result.data || [];
}

/**
 * Fetch a single feed inventory record by ID
 */
export async function getFeedInventoryById(
  id: string,
  token?: string
): Promise<FeedInventoryRecord> {
  const headers = getHeaders(token);
  const response = await fetch(`${API_BASE_URL}/feed_inventory/${id}/`, {
    method: 'GET',
    headers,
  });

  const result: SingleFeedInventoryResponse = await handleResponse(
    response,
    'Failed to fetch feed inventory record'
  );
  return result.data || result;
}

/**
 * Create a new feed inventory record
 */
export async function createFeedInventory(
  payload: FeedInventoryPayload,
  token?: string
): Promise<FeedInventoryRecord> {
  const headers = getHeaders(token);
  const response = await fetch(`${API_BASE_URL}/feed_inventory/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  return handleResponse(response, 'Failed to save feed inventory record');
}

/**
 * Partial update of an existing feed inventory record (PATCH)
 */
export async function updateFeedInventory(
  id: string,
  payload: Partial<FeedInventoryPayload>,
  token?: string
): Promise<FeedInventoryRecord> {
  const headers = getHeaders(token);
  const response = await fetch(`${API_BASE_URL}/feed_inventory/${id}/`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload),
  });

  const result = await handleResponse(response, 'Failed to update feed inventory record');
  return result.data || result;
}

/**
 * Client-calculated stock reduction via PATCH
 */
export async function deductFeedInventory(
  inventoryRecord: FeedInventoryRecord,
  quantityUsed: number,
  token?: string
): Promise<FeedInventoryRecord> {
  if (!inventoryRecord.id) {
    throw new Error('Inventory ID is required to deduct feed stock.');
  }

  const currentQty = Number(inventoryRecord.quantity) || 0;
  if (currentQty < quantityUsed) {
    throw new Error(
      `Insufficient stock for ${inventoryRecord.feed_name}. Available: ${currentQty}, Requested: ${quantityUsed}`
    );
  }

  const newQuantity = currentQty - quantityUsed;
  const costPerBag = Number(inventoryRecord.feed_cost_per_bag) || 0;
  const newTotalCost = newQuantity * costPerBag;

  let newStatus = inventoryRecord.status;
  if (newQuantity <= 0) {
    newStatus = 'out_of_stock';
  } else if (newQuantity < 5) {
    newStatus = 'low_stock';
  }

  return await updateFeedInventory(
    inventoryRecord.id,
    {
      quantity: newQuantity,
      feed_total_cost: newTotalCost,
      status: newStatus,
    },
    token
  );
}

/**
 * Atomic stock deduction via custom backend endpoint POST /feed_inventory/:id/deduct/
 * Use this if your backend supports server-side atomic deductions.
 */
export async function deductFeedStockOnBackend(
  inventoryId: string,
  quantityUsed: number,
  token?: string
): Promise<FeedInventoryRecord> {
  const headers = getHeaders(token);
  const response = await fetch(`${API_BASE_URL}/feed_inventory/${inventoryId}/deduct/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ quantity_used: quantityUsed }),
  });

  const result = await handleResponse(response, 'Failed to deduct stock on backend');
  return result.data || result;
}

/**
 * Atomic combined helper: Creates a feed log entry and reduces stock in a single flow
 */
export async function logFeedConsumption(
  logPayload: FeedLogPayload,
  inventoryRecord: FeedInventoryRecord,
  token?: string
): Promise<{ feedLog: unknown; updatedInventory: FeedInventoryRecord }> {
  // 1. Verify availability
  if (inventoryRecord.quantity < logPayload.quantity_used) {
    throw new Error(
      `Insufficient stock. Current stock is ${inventoryRecord.quantity}, but tried to log ${logPayload.quantity_used}.`
    );
  }

  // 2. Post feed log entry
  const headers = getHeaders(token);
  const logResponse = await fetch(`${API_BASE_URL}/feed_logs/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(logPayload),
  });
  const feedLog = await handleResponse(logResponse, 'Failed to create feed log entry');

  // 3. Deduct stock from inventory
  const updatedInventory = await deductFeedInventory(
    inventoryRecord,
    logPayload.quantity_used,
    token
  );

  return { feedLog, updatedInventory };
}