const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';

export interface ApiInvoice {
  invoice_id: number;
  customer: string;
  date: string;
  due_date: string;
  amount: number;
  status: InvoiceStatus;
}

export interface CreateInvoicePayload {
  customer: string;
  date: string;
  due_date: string;
  amount: number;
  status: InvoiceStatus;
}

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

export const invoiceApi = {
  getInvoices: async (): Promise<ApiInvoice[]> => {
    const response = await fetch(`${API_BASE_URL}/invoices/`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch invoices');
    const res = await response.json();
    return res.data || [];
  },

  createInvoice: async (payload: CreateInvoicePayload): Promise<ApiInvoice> => {
    const response = await fetch(`${API_BASE_URL}/invoices/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create invoice');
    return response.json();
  },

  updateInvoice: async (invoiceId: number, payload: Partial<CreateInvoicePayload>): Promise<ApiInvoice> => {
    const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to update invoice');
    return response.json();
  },

  deleteInvoice: async (invoiceId: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete invoice');
    return response.json();
  },
};