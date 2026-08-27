export type HarvestMethod = 'Netting' | 'Draining' | 'Trapping';

export interface HarvestRecord {
  id: string;
  pondName: string;
  species: string;
  quantity: number;
  averageWeightKg: number;
  totalWeightKg: number;
  harvestDate: string;
  method: HarvestMethod;
  recordedBy: string;
}

export interface CreateHarvestInput {
  pondName: string;
  species: string;
  quantity: number;
  averageWeightKg: number;
  totalWeightKg: number;
  harvestDate: string;
  method: HarvestMethod;
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

const transformHarvestRecord = (raw: any): HarvestRecord => {
  const quantity = Number(raw.harvest_quantity ?? raw.quantity ?? raw.qty ?? 0) || 0;
  const averageWeightKg = Number(raw.average_weight ?? raw.averageWeightKg ?? raw.avgWeight ?? 0) || 0;

  return {
    id: String(raw.id ?? raw._id ?? raw.recordId ?? `harv-${Math.random().toString(36).substring(2, 9)}`),
    pondName: raw.pond_name ?? raw.pondName ?? raw.pond ?? 'N/A',
    species: raw.species ?? raw.specie ?? raw.speciesName ?? 'N/A',
    quantity,
    averageWeightKg,
    totalWeightKg: Number(raw.total_weight ?? raw.totalWeightKg ?? (quantity * averageWeightKg)) || 0,
    harvestDate: raw.harvest_date ?? raw.harvestDate ?? raw.date ?? raw.createdAt ?? '',
    method: (raw.method_of_harvest ?? raw.harvest_method ?? raw.method ?? 'Netting') as HarvestMethod,
    recordedBy: raw.recorded_by ?? raw.recordedBy ?? raw.user ?? 'System',
  };
};

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

export const getHarvestRecords = async (token: string | null): Promise<HarvestRecord[]> => {
  const res = await fetch(`${API_BASE}/harvest`, {
    method: 'GET',
    headers: getHeaders(token),
  });

  const data = await handleResponse(res);
  const list = Array.isArray(data) ? data : data.data || [];
  return list.map(transformHarvestRecord);
};

export const createHarvestRecord = async (
  input: CreateHarvestInput,
  token: string | null
): Promise<HarvestRecord> => {
  const payload = {
    pond_name: input.pondName,
    species: input.species,
    harvest_quantity: input.quantity,
    average_weight: input.averageWeightKg,
    total_weight: input.totalWeightKg,
    harvest_date: input.harvestDate,
    method_of_harvest: input.method,
    recorded_by: input.recordedBy,
  };

  const res = await fetch(`${API_BASE}/harvest`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await handleResponse(res);
  return transformHarvestRecord(data);
};