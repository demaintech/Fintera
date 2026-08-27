const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://fintera-aquaculture-bckend.onrender.com";

const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

type EntityEndpoint = "harvest" | "ponds" | "stock" | "mortality";

export const getRecords = async (endpoint: EntityEndpoint) => {
  const response = await fetch(`${API_URL}/${endpoint}/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || `Failed to fetch ${endpoint} records.`);
  }
  return data;
};

export const createRecord = async (endpoint: EntityEndpoint, payload: Record<string, any>) => {
  const response = await fetch(`${API_URL}/${endpoint}/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || `Failed to create record in ${endpoint}.`);
  }
  return data;
};