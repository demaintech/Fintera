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

const transformGrowthRecord = (data: BackendGrowthRecord): GrowthRecord => {
  const fcrVal = Number(data.feed_conversion_rate ?? 0);
  return {
    id: String(data.id),
    pondName: data.pond_name || '',
    species: data.species || '',
    sampleDate: data.sample_date ? data.sample_date.split('T')[0] : '',
    sampleCount: Number(data.sample_count || 0),
    avgWeightGrams: Number(data.av_weight || 0),
    totalFeedUsedKg: Number(data.total_feed_used || 0),
    feedConversionRate: fcrVal,
    fcr: fcrVal,
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