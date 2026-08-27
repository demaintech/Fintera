export interface GrowthRecord {
  id: string;
  pondName: string;
  species: string;
  sampleDate: string;
  sampleCount: number;
  avgWeightGrams: number;
  totalFeedUsedKg: number;
  fcr: number;
  sgr: number;
  recordedBy: string;
}

export interface CreateGrowthInput {
  pondName: string;
  species: string;
  sampleDate: string;
  sampleCount: number;
  avgWeightGrams: number;
  totalFeedUsedKg: number;
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

const transformGrowthRecord = (raw: any): GrowthRecord => ({
  id: String(raw.id ?? raw._id ?? `growth-${Math.random().toString(36).substring(2, 9)}`),
  pondName: raw.pond_name ?? raw.pondName ?? raw.pond ?? 'N/A',
  species: raw.species ?? raw.species_name ?? 'N/A',
  sampleDate: raw.sample_date ?? raw.sampleDate ?? raw.date ?? new Date().toISOString().split('T')[0],
  sampleCount: Number(raw.sample_count ?? raw.sampleCount ?? 0),
  avgWeightGrams: Number(raw.avg_weight_grams ?? raw.avgWeightGrams ?? 0),
  totalFeedUsedKg: Number(raw.total_feed_used_kg ?? raw.totalFeedUsedKg ?? 0),
  fcr: Number(raw.fcr ?? 0),
  sgr: Number(raw.sgr ?? 0),
  recordedBy: raw.recorded_by ?? raw.recordedBy ?? 'System',
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

export const getGrowthRecords = async (token: string | null): Promise<GrowthRecord[]> => {
  const res = await fetch(`${API_BASE}/growth`, {
    method: 'GET',
    headers: getHeaders(token),
  });

  const data = await handleResponse(res);
  const list = Array.isArray(data) ? data : data.data || [];
  return list.map(transformGrowthRecord);
};

export const createGrowthRecord = async (
  input: CreateGrowthInput,
  token: string | null
): Promise<GrowthRecord> => {
  const payload = {
    pond_name: input.pondName,
    species: input.species,
    sample_date: input.sampleDate,
    sample_count: input.sampleCount,
    avg_weight_grams: input.avgWeightGrams,
    total_feed_used_kg: input.totalFeedUsedKg,
    recorded_by: input.recordedBy,
  };

  const res = await fetch(`${API_BASE}/growth`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await handleResponse(res);
  return transformGrowthRecord(data);
};