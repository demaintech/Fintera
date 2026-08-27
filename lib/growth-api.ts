// lib/growth-api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fintera-aquaculture-bckend.onrender.com';

// --- Types ---

export interface CreateGrowthInput {
  pondName: string;
  species: string;
  sampleDate: string;
  sampleCount: number;
  avgWeightGrams: number;
  totalFeedUsedKg: number;
}

export interface GrowthRecord {
  id: string;
  pondName: string;
  species: string;
  sampleDate: string;
  sampleCount: number;
  avgWeightGrams: number;
  totalFeedUsedKg: number;
  feedConversionRate: number;
  fcr?: number;
  specificGrowthRate: number;
  recordedBy: string;
}

// Backend DB Schema representation
interface BackendGrowthRecord {
  id: string;
  pond_name: string;
  species: string;
  sample_date: string;
  sample_count: number;
  av_weight: number;
  total_feed_used: number;
  feed_conversion_rate: number;
  specific_growth_rate: number;
  recorded_by?: string;
}

// --- Helpers ---

const getHeaders = (token: string | null): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP Error: ${response.status}`);
  }
  return response.json();
};

const transformGrowthRecord = (data: BackendGrowthRecord): GrowthRecord => {
  const feedConversionRate = Number(data.feed_conversion_rate ?? 1.2);
  return {
    id: data.id,
    pondName: data.pond_name,
    species: data.species,
    sampleDate: data.sample_date,
    sampleCount: data.sample_count,
    avgWeightGrams: data.av_weight,
    totalFeedUsedKg: data.total_feed_used,
    feedConversionRate,
    fcr: feedConversionRate,
    specificGrowthRate: data.specific_growth_rate,
    recordedBy: data.recorded_by || 'System',
  };
};

// --- API Functions ---

export const getGrowthRecords = async (token: string | null): Promise<GrowthRecord[]> => {
  const res = await fetch(`${API_BASE}/growth/`, {
    method: 'GET',
    headers: getHeaders(token),
  });

  const data = await handleResponse(res);
  const records: BackendGrowthRecord[] = Array.isArray(data) ? data : data.data || [];
  return records.map(transformGrowthRecord);
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
    av_weight: input.avgWeightGrams,
    total_feed_used: input.totalFeedUsedKg,
  };

  const res = await fetch(`${API_BASE}/growth/`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await handleResponse(res);
  // Unwraps single object responses cleanly
  const recordData: BackendGrowthRecord = data.data ? data.data : data;
  return transformGrowthRecord(recordData);
};

export const deleteGrowthRecord = async (
  growthId: string,
  token: string | null
): Promise<void> => {
  const res = await fetch(`${API_BASE}/growth/${growthId}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });

  await handleResponse(res);
};