export type MortalityCause = 'Disease' | 'Low Oxygen' | 'Handling Stress' | 'Predation' | 'Unknown';

export interface MortalityRecord {
  id: string;
  pondName: string;
  species: string;
  dateRecorded: string;
  quantity: number;
  cause: MortalityCause;
  recordedBy: string;
}

export interface CreateMortalityInput {
  pondName: string;
  species: string;
  quantity: number;
  dateRecorded: string;
  cause: MortalityCause;
  recordedBy: string;
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

const transformMortalityRecord = (raw: any): MortalityRecord => ({
  id: String(raw.id ?? raw._id ?? raw.recordId ?? `mor-${Math.random().toString(36).substring(2, 9)}`),
  pondName: raw.pond_name ?? raw.pondName ?? raw.pond ?? 'N/A',
  species: raw.species ?? raw.specie ?? raw.species_name ?? 'N/A',
  quantity: Number(raw.Mortality_count ?? raw.quantity ?? raw.qty ?? raw.count ?? 0) || 0,
  dateRecorded:
    raw.date_recorded ??
    raw.dateRecorded ??
    raw.date ??
    raw.harvest_date ??
    raw.created_at ??
    raw.createdAt ??
    raw.created_date ??
    'N/A',
  cause: (raw.suspected_cause ?? raw.cause ?? 'Unknown') as MortalityCause,
  recordedBy: raw.recorded_by ?? raw.recordedBy ?? raw.user ?? 'System',
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

export const getMortalityRecords = async (token: string | null): Promise<MortalityRecord[]> => {
  const res = await fetch(`${API_BASE}/mortality`, {
    method: 'GET',
    headers: getHeaders(token),
  });

  const data = await handleResponse(res);
  const list = Array.isArray(data) ? data : data.data || [];
  return list.map(transformMortalityRecord);
};

export const createMortalityRecord = async (
  input: CreateMortalityInput,
  token: string | null
): Promise<MortalityRecord> => {
  const payload = {
    pond_name: input.pondName,
    species: input.species,
    Mortality_count: input.quantity,
    date_recorded: input.dateRecorded,
    suspected_cause: input.cause,
    recorded_by: input.recordedBy,
  };

  const res = await fetch(`${API_BASE}/mortality`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await handleResponse(res);
  return transformMortalityRecord(data);
};