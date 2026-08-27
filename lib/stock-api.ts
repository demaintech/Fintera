export type StockStatus = 'Completed' | 'Pending' | 'Cancelled';

export interface StockRecord {
  id: string;
  pondName: string;
  species: string;
  quantity: number;
  stockingDate: string;
  supplier: string;
  averageWeightKg: number;
  status: StockStatus;
}

export interface CreateStockInput {
  pondName: string;
  species: string;
  quantity: number;
  averageWeightKg: number;
  stockingDate: string;
  supplier: string;
  status?: StockStatus;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fintera-aquaculture-bckend.onrender.com';

const getHeaders = (token: string | null): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token && token !== 'null' && token !== 'undefined') {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }

  return headers;
};

const transformStockRecord = (raw: any): StockRecord => ({
  id: String(raw.id ?? raw._id ?? raw.recordId ?? `stk-${Math.random().toString(36).substring(2, 9)}`),
  pondName: raw.pond_name ?? raw.pondName ?? raw.pond ?? 'N/A',
  species: raw.species ?? raw.specie ?? raw.species_name ?? 'N/A',
  quantity: Number(raw.quantity ?? raw.qty ?? raw.count ?? 0) || 0,
  stockingDate:
    raw.stocking_date ??
    raw.stockingDate ??
    raw.date ??
    raw.created_at ??
    raw.createdAt ??
    'N/A',
  supplier: raw.supplier ?? raw.supplier_name ?? raw.vendor ?? 'N/A',
  averageWeightKg:
    Number(raw.average_weight ?? raw.average_weight_kg ?? raw.averageWeightKg ?? raw.avg_weight ?? 0) || 0,
  status: (raw.status ?? 'Pending') as StockStatus,
});

const handleResponse = async (res: Response) => {
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    throw new Error('Could not validate credentials. Please log in again.');
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = Array.isArray(errorData.detail)
      ? errorData.detail.map((err: any) => `${err.loc?.slice(-1)[0]}: ${err.msg}`).join(', ')
      : errorData.detail || `Request failed with status ${res.status}`;
    throw new Error(errorMessage);
  }

  return res.json();
};

export const getStockRecords = async (token: string | null): Promise<StockRecord[]> => {
  const res = await fetch(`${API_BASE}/stock`, {
    method: 'GET',
    headers: getHeaders(token),
  });

  const data = await handleResponse(res);
  const list = Array.isArray(data) ? data : data.data || [];
  return list.map(transformStockRecord);
};

export const createStockRecord = async (
  input: CreateStockInput,
  token: string | null
): Promise<StockRecord> => {
  const payload = {
    pond_name: input.pondName,
    species: input.species,
    quantity: input.quantity,
    average_weight: input.averageWeightKg,
    stocking_date: input.stockingDate,
    supplier: input.supplier,
    status: input.status || 'Pending',
  };

  const res = await fetch(`${API_BASE}/stock`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await handleResponse(res);
  return transformStockRecord(data);
};

export const deleteStockRecord = async (id: string, token: string | null): Promise<void> => {
  const res = await fetch(`${API_BASE}/stock/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });

  await handleResponse(res);
};