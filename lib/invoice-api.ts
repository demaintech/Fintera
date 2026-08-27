const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fintera-aquaculture-bckend.onrender.com';

export type InvoiceStatus = 'Paid' | 'Unpaid' | 'Overdue' | 'Sent' | 'Draft' | 'Cancelled';

export interface CreateInvoiceInput {
  customer: string;
  date: string;
  due_date: string;
  amount: number;
  status: string;
}

export interface InvoiceRecord {
  id: number;
  customer: string;
  date: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  createdBy?: string;
}

const getHeaders = (token: string | null): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retries = 3,
  delayMs = 2000
): Promise<Response> => {
  try {
    const res = await fetch(url, options);
    if (res.status >= 502 && res.status <= 504 && retries > 0) {
      throw new Error(`Server warming up (${res.status})`);
    }
    return res;
  } catch (err) {
    if (retries > 0) {
      await new Promise((res) => setTimeout(res, delayMs));
      return fetchWithRetry(url, options, retries - 1, delayMs * 1.5);
    }
    throw err;
  }
};

const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    throw new Error('Could not validate credentials');
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP Error: ${response.status}`);
  }
  return response.json();
};

const transformInvoice = (data: any): InvoiceRecord => ({
  // Extract pure integer ID from backend invoice_id field
  id: Number(data.invoice_id || data.id),
  customer: data.customer || '',
  date: data.date || '',
  dueDate: data.due_date || data.dueDate || '',
  amount: Number(data.amount) || 0,
  status: (data.status as InvoiceStatus) || 'Unpaid',
  createdBy: data.recorded_by || data.created_by || data.createdBy || 'System',
});

export const getInvoices = async (token: string | null): Promise<InvoiceRecord[]> => {
  if (!token) throw new Error('Could not validate credentials');

  const res = await fetchWithRetry(`${API_BASE}/invoices/`, {
    method: 'GET',
    headers: getHeaders(token),
  });

  const data = await handleResponse(res);
  const records = Array.isArray(data) ? data : data.data || [];
  return records.map(transformInvoice);
};

export const createInvoice = async (
  input: CreateInvoiceInput,
  token: string | null
): Promise<InvoiceRecord> => {
  if (!token) throw new Error('Could not validate credentials');

  const res = await fetchWithRetry(`${API_BASE}/invoices/`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(input),
  });

  const data = await handleResponse(res);
  const recordData = data.data ? data.data[0] || data.data : data;
  return transformInvoice(recordData);
};

export const deleteInvoice = async (
  invoiceId: number | string,
  token: string | null
): Promise<void> => {
  if (!token) throw new Error('Could not validate credentials');

  // Strip non-numeric string prefixes if present and parse to integer for FastAPI route validation
  const cleanId = typeof invoiceId === 'string' ? invoiceId.replace(/\D/g, '') : invoiceId;
  const numericId = Number(cleanId);

  if (isNaN(numericId)) {
    throw new Error('Invalid invoice ID format');
  }

  const res = await fetchWithRetry(`${API_BASE}/invoices/${numericId}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });

  await handleResponse(res);
};