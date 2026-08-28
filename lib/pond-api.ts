export type PondStatus = 'Active' | 'Inactive' | 'Maintenance';

export interface Pond {
  id: string;
  name: string;
  location: string;
  status: PondStatus;
  pondType: string;
  pondCapacity: number;
  waterTemp: number;
  phLevel: number;
  lastHarvestDate: string | null;
  currentStock: {
    quantity: number;
    species: string;
  };
}

export interface CreatePondInput {
  name: string;
  location: string;
  status: PondStatus;
  pondType: string;
  pondCapacity: number;
  speciesInPond: string;
  pondStockQuantity: number;
  lastHarvestDate: string;
  waterTemp: number;
  phLevel: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://fintera-aquaculture-bckend.onrender.com";

const getHeaders = (token: string | null) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const transformPondData = (rawPond: any): Pond => ({
  id: String(rawPond.pond_id ?? rawPond.id ?? rawPond.pond_name),
  name: rawPond.pond_name || rawPond.name || "Unnamed Pond",
  location: rawPond.pond_location || rawPond.location || "N/A",
  status: (rawPond.pond_status || rawPond.status || "Active") as PondStatus,
  pondType: rawPond.pond_type || rawPond.pondType || "Standard",
  pondCapacity: Number(rawPond.pond_capacity || rawPond.pondCapacity || 0),
  waterTemp: Number(rawPond.water_temp || rawPond.waterTemp || 0),
  phLevel: Number(rawPond.pH_level ?? rawPond.ph_level ?? rawPond.phLevel ?? 7.0),
  lastHarvestDate: rawPond.last_harvest_date || rawPond.lastHarvestDate || null,
  currentStock: {
    quantity: Number(rawPond.pond_stock_quantity || rawPond.currentStock?.quantity || 0),
    species: rawPond.species_in_pond || rawPond.currentStock?.species || "Unspecified",
  },
});

export const getPonds = async (token: string | null): Promise<Pond[]> => {
  const response = await fetch(`${API_URL}/ponds/`, {
    method: "GET",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to fetch ponds");
  }

  const result = await response.json();
  const list = Array.isArray(result) ? result : result.data || [];
  return list.map(transformPondData);
};

export const getPond = async (pondId: string, token: string | null): Promise<Pond | null> => {
  // Fetch all user ponds and locate the targeted pond by ID
  const allPonds = await getPonds(token);
  const found = allPonds.find((pond) => String(pond.id) === String(pondId));
  return found || null;
};

export const createPond = async (input: CreatePondInput, token: string | null): Promise<Pond> => {
  const payload = {
    pond_name: input.name,
    pond_location: input.location,
    pond_status: input.status,
    pond_type: input.pondType,
    pond_capacity: input.pondCapacity,
    species_in_pond: input.speciesInPond,
    pond_stock_quantity: input.pondStockQuantity,
    last_harvest_date: input.lastHarvestDate,
    water_temp: String(input.waterTemp),
    pH_level: Number(input.phLevel),
  };

  const response = await fetch(`${API_URL}/ponds/ponds`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create pond");
  }

  const created = await response.json();
  return transformPondData(created);
};

export const updatePond = async (
  pondId: string,
  updates: Partial<{ name: string; location: string; status: PondStatus; waterTemp: number; phLevel: number }>,
  token: string | null
): Promise<Pond> => {
  const payload: Record<string, any> = {};
  if (updates.name) payload.pond_name = updates.name;
  if (updates.location) payload.pond_location = updates.location;
  if (updates.status) payload.pond_status = updates.status;
  if (updates.waterTemp !== undefined) payload.water_temp = String(updates.waterTemp);
  if (updates.phLevel !== undefined) payload.pH_level = updates.phLevel;

  const response = await fetch(`${API_URL}/ponds/${pondId}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to update pond");
  }

  const updated = await response.json();
  return transformPondData(Array.isArray(updated) ? updated[0] : updated);
};

export const deletePond = async (pondId: string, token: string | null): Promise<void> => {
  const response = await fetch(`${API_URL}/ponds/${pondId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to delete pond");
  }
};