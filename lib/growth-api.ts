const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fintera-aquaculture-bckend.onrender.com';

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
  fcr: number;
  specificGrowthRate: number;
  recordedBy: string;
}

interface BackendGrowthRecord {
  id: string | number;
  pond_name?: string;
  species?: string;
  sample_date?: string;
  sample_count?: number;
  av_weight?: number;
  avg_weight?: number;
  total_feed_used?: number;
  feed_conversion_rate?: number;
  fcr?: number;
  specific_growth_rate?: number;
  recorded_by?: string;
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

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = typeof errorData.detail === 'string'
      ? errorData.detail
      : Array.isArray(errorData.detail)
      ? errorData.detail.map((e: any) => `${e.loc?.join('.')} ${e.msg}`).join(', ')
      : `Server Error (${response.status})`;
    throw new Error(message);
  }
  return response.json();
};

// Pure calculation utility
export const calculateFCR = (totalFeedKg: number, sampleCount: number, avgWeightGrams: number): number => {
  const totalBiomassKg = (sampleCount * avgWeightGrams) / 1000;
  if (totalBiomassKg <= 0) return 0;
  const fcr = totalFeedKg / totalBiomassKg;
  return Number(fcr.toFixed(2));
};

const transformGrowthRecord = (data: BackendGrowthRecord): GrowthRecord => {
  const sampleCount = Number(data.sample_count || 0);
  const avgWeightGrams = Number(data.av_weight ?? data.avg_weight ?? 0);
  const totalFeedUsedKg = Number(data.total_feed_used || 0);

  // Parse backend FCR, fallback to dynamic calculation if backend returns 0/null
  let rawFcr = Number(data.feed_conversion_rate ?? data.fcr ?? 0);
  if (rawFcr === 0 && totalFeedUsedKg > 0 && sampleCount > 0 && avgWeightGrams > 0) {
    rawFcr = calculateFCR(totalFeedUsedKg, sampleCount, avgWeightGrams);
  }

  return {
    id: String(data.id),
    pondName: data.pond_name || '',
    species: data.species || '',
    sampleDate: data.sample_date ? data.sample_date.split('T')[0] : '',
    sampleCount,
    avgWeightGrams,
    totalFeedUsedKg,
    feedConversionRate: rawFcr,
    fcr: rawFcr,
    specificGrowthRate: Number(data.specific_growth_rate || 0),
    recordedBy: data.recorded_by || 'System',
  };
};

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
  // Compute FCR prior to network dispatch
  const computedFcr = calculateFCR(input.totalFeedUsedKg, input.sampleCount, input.avgWeightGrams);

  const payload = {
    pond_name: input.pondName,
    species: input.species,
    sample_date: input.sampleDate,
    sample_count: input.sampleCount,
    av_weight: input.avgWeightGrams,
    avg_weight: input.avgWeightGrams,
    total_feed_used: input.totalFeedUsedKg,
    feed_conversion_rate: computedFcr,
    fcr: computedFcr,
  };

  const res = await fetch(`${API_BASE}/growth/`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await handleResponse(res);
  const recordData: BackendGrowthRecord = data.data ? data.data : data;
  return transformGrowthRecord(recordData);
};

export const deleteGrowthRecord = async (
  growthId: string,
  token: string | null
): Promise<void> => {
  const numericId = parseInt(growthId, 10);
  const targetId = isNaN(numericId) ? growthId : numericId;

  const res = await fetch(`${API_BASE}/growth/${targetId}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });

  await handleResponse(res);
};