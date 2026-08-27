export interface ExpenseItem {
  expense_id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
  status: string;
  created_at?: string;
}

export interface CreateExpensePayload {
  date: string;
  category: string;
  description: string;
  amount: number;
  status: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'An API error occurred');
  }
  return response.json();
}

export const getExpenses = async (): Promise<ExpenseItem[]> => {
  const result = await fetchWithAuth('/expenses/');
  return Array.isArray(result) ? result : result.data || [];
};

export const createExpense = async (payload: CreateExpensePayload): Promise<ExpenseItem> => {
  return fetchWithAuth('/expenses/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateExpense = async (id: number, payload: Partial<CreateExpensePayload>): Promise<ExpenseItem> => {
  return fetchWithAuth(`/expenses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const deleteExpense = async (id: number): Promise<{ message: string }> => {
  return fetchWithAuth(`/expenses/${id}`, {
    method: 'DELETE',
  });
};