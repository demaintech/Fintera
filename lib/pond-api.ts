export type PondStatus = 'Active' | 'Inactive' | 'Maintenance'

export type PondCurrentStock = {
  species: string
  quantity: number
}

export type Pond = {
  id: string
  name: string
  location: string
  status: PondStatus
  currentStock: PondCurrentStock
  lastHarvestDate?: string | null
  waterTemp: number
  phLevel: number
  pondType?: string
  capacity?: number
  isDeleted?: boolean
}

export type PondCreatePayload = {
  name: string
  location: string
  status: PondStatus
  pondType?: string
  pondCapacity?: number
  speciesInPond?: string
  pondStockQuantity?: number
  lastHarvestDate?: string | null
  waterTemp?: number
  phLevel?: number
}

export type PondUpdatePayload = Partial<PondCreatePayload>

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fintera-aquaculture-bckend.onrender.com'
const PONDS_ENDPOINT = `${API_BASE}/ponds`

const humanizeDetailMessage = (rawMessage: string): string => {
  if (!rawMessage) return 'Invalid value.'
  if (rawMessage.includes('Field required')) return 'is required.'
  if (rawMessage.includes('Input should be a valid string')) return 'must be a valid value.'
  return rawMessage.replace(/\.$/, '') + '.'
}

const responseToError = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? ''
  const text = await response.text()
  let message = response.statusText || `HTTP ${response.status}`

  if (contentType.includes('application/json')) {
    try {
      const data = JSON.parse(text)
      if (data?.detail && Array.isArray(data.detail)) {
        message = data.detail
          .map((detail: any) => {
            const loc = Array.isArray(detail.loc) ? detail.loc.filter((part: any) => part !== 'body') : detail.loc
            const field = Array.isArray(loc) ? loc.join('.') : String(loc ?? 'Input')
            const label = field.replace(/_/g, ' ')
            const prettyField = label ? `${label.charAt(0).toUpperCase()}${label.slice(1)}` : 'Input'
            const humanMessage = humanizeDetailMessage(String(detail.msg ?? 'Invalid value'))
            return `${prettyField} ${humanMessage}`
          })
          .join(' ')
      } else if (typeof data?.message === 'string') {
        message = data.message
      } else if (typeof data?.error === 'string') {
        message = data.error
      } else if (typeof data === 'string') {
        message = data
      }
    } catch {
      if (text) {
        message = text
      }
    }
  } else if (text) {
    message = text
  }

  throw new Error(message)
}

const serializeApiValue = (value: unknown) => {
  if (value == null) return undefined
  return typeof value === 'number' ? String(value) : value
}

const normalizePond = (input: any): Pond => {
  const rawStatus = String(input.status ?? input.pond_status ?? 'Inactive')
  const status = ['Active', 'Inactive', 'Maintenance'].includes(rawStatus)
    ? (rawStatus as PondStatus)
    : rawStatus.toLowerCase().includes('active')
    ? 'Active'
    : rawStatus.toLowerCase().includes('maintenance')
    ? 'Maintenance'
    : 'Inactive'

  return {
    id: String(input.id ?? input._id ?? input.pondId ?? input.pond_name ?? input.name ?? ''),
    name: String(input.name ?? input.pond_name ?? ''),
    location: String(input.location ?? input.pond_location ?? ''),
    status,
    currentStock: {
      species: String(input.currentStock?.species ?? input.species ?? input.species_in_pond ?? 'Unknown'),
      quantity: Number(input.currentStock?.quantity ?? input.quantity ?? input.pond_stock_quantity ?? 0),
    },
    lastHarvestDate: input.lastHarvestDate ?? input.last_harvest_date ?? null,
    waterTemp: Number(input.waterTemp ?? input.water_temp ?? 0),
    phLevel: Number(input.phLevel ?? input.ph_level ?? 0),
    pondType: input.pondType ?? input.pond_type ?? undefined,
    capacity: input.capacity ?? input.pond_capacity != null ? Number(input.pond_capacity) : undefined,
    isDeleted: Boolean(input.is_deleted ?? input.isDeleted ?? false),
  }
}

const mapPondPayloadToApi = (payload: PondCreatePayload | PondUpdatePayload) => ({
  pond_name: serializeApiValue(payload.name),
  pond_location: serializeApiValue(payload.location),
  pond_status: serializeApiValue(payload.status),
  pond_type: serializeApiValue(payload.pondType),
  pond_capacity: serializeApiValue(payload.pondCapacity),
  species_in_pond: serializeApiValue(payload.speciesInPond),
  pond_stock_quantity: serializeApiValue(payload.pondStockQuantity),
  last_harvest_date: serializeApiValue(payload.lastHarvestDate),
  water_temp: serializeApiValue(payload.waterTemp),
  ph_level: serializeApiValue(payload.phLevel),
})

export const getPonds = async (): Promise<Pond[]> => {
  const response = await fetch(PONDS_ENDPOINT)
  if (!response.ok) {
    await responseToError(response)
  }

  const data = await response.json()
  if (!Array.isArray(data)) {
    throw new Error('Invalid pond list response')
  }
  return data.map(normalizePond).filter((pond) => !pond.isDeleted)
}

export const getPond = async (id: string): Promise<Pond | null> => {
  const response = await fetch(`${PONDS_ENDPOINT}/${encodeURIComponent(id)}`)

  if (response.ok) {
    const pond = normalizePond(await response.json())
    return pond.isDeleted ? null : pond
  }

  if (response.status === 404 || response.status === 405) {
    const ponds = await getPonds()
    return ponds.find((pond) => String(pond.id) === String(id)) ?? null
  }

  await responseToError(response)
  throw new Error('Failed to load pond')
}

export const createPond = async (payload: PondCreatePayload): Promise<Pond> => {
  const response = await fetch(PONDS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mapPondPayloadToApi(payload)),
  })
  if (!response.ok) {
    await responseToError(response)
  }
  return normalizePond(await response.json())
}

export const updatePond = async (id: string, payload: PondUpdatePayload): Promise<Pond> => {
  const response = await fetch(`${PONDS_ENDPOINT}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mapPondPayloadToApi(payload)),
  })
  if (!response.ok) {
    await responseToError(response)
  }
  return normalizePond(await response.json())
}

export const deletePond = async (id: string): Promise<void> => {
  const response = await fetch(`${PONDS_ENDPOINT}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    await responseToError(response)
  }
}
