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

/**
 * Safely retrieves the authentication token across common storage key names.
 */
const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('auth_token')
  );
};

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getStoredToken();

  if (!token) {
    throw new Error('Not authenticated. Please log in.');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Clear invalid/expired token from local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('auth_token');
      }
      throw new Error('Not authenticated. Session expired or token invalid.');
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
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