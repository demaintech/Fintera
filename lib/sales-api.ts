export interface SaleRecord {
  id: string;
  salesId: number;
  customer: string;
  species: string;
  quantity: number;
  totalWeight: number;
  cost: number;
  profit: number;
  paymentStatus: 'Paid' | 'Pending' | 'Partial' | 'Overdue';
  saleDate: string;
}

export interface CreateSaleInput {
  customer: string;
  species: string;
  quantity: number;
  total_weight: number;
  cost: number;
  profit: number;
  status: string;
  date: string;
}

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fintera-aquaculture-bckend.onrender.com';
const API_BASE = RAW_API_URL.replace(/\/+$/, '');

const getHeaders = (token: string | null): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    const cleanToken = token.replace(/^"|"$/g, '').trim();
    if (cleanToken && cleanToken !== 'null' && cleanToken !== 'undefined') {
      headers['Authorization'] = `Bearer ${cleanToken}`;
    }
  }
  return headers;
};

const transformSaleRecord = (raw: any): SaleRecord => ({
  id: String(raw.sales_id ?? `sale-${Math.random().toString(36).substring(2, 9)}`),
  salesId: Number(raw.sales_id),
  customer: raw.customer ?? 'Unknown Customer',
  species: raw.species ?? 'N/A',
  quantity: Number(raw.quantity ?? 0),
  totalWeight: Number(raw.total_weight ?? 0),
  cost: Number(raw.cost ?? 0),
  profit: Number(raw.profit ?? 0),
  paymentStatus: (raw.status as any) || 'Paid',
  saleDate: raw.date ?? new Date().toISOString().split('T')[0],
});

const handleResponse = async (res: Response) => {
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    throw new Error('Session expired or invalid credentials. Please log in again.');
  }

  if (!res.ok) {
    let errorMessage = `Server returned status ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      const rawText = await res.text().catch(() => '');
      if (rawText) errorMessage = rawText;
    }
    throw new Error(errorMessage);
  }

  return res.json();
};

export const getSalesRecords = async (token: string | null): Promise<SaleRecord[]> => {
  const res = await fetch(`${API_BASE}/sales/`, {
    method: 'GET',
    headers: getHeaders(token),
  });

  const responseData = await handleResponse(res);
  const list = Array.isArray(responseData) ? responseData : responseData.data || [];
  return list.map(transformSaleRecord);
};

export const createSaleRecord = async (
  input: CreateSaleInput,
  token: string | null
): Promise<SaleRecord> => {
  const res = await fetch(`${API_BASE}/sales/`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(input),
  });

  const data = await handleResponse(res);
  return transformSaleRecord(data);
};

export const deleteSaleRecord = async (salesId: number, token: string | null): Promise<void> => {
  const res = await fetch(`${API_BASE}/sales/${salesId}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });

  await handleResponse(res);
};