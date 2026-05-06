import type { StoredInputs } from '../types/roulette'

const STORAGE_KEY = 'roulette-inputs-v1'
const LAST_ROLES_KEY = 'roulette-last-roles-v1'

export function loadStoredInputs(): StoredInputs | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return {
      names: typeof parsed.names === 'string' ? parsed.names : '',
      roles: typeof parsed.roles === 'string' ? parsed.roles : '',
      teamCount:
        typeof parsed.teamCount === 'number' && parsed.teamCount >= 1
          ? parsed.teamCount
          : 2,
    }
  } catch {
    return null
  }
}

export function storeInputs(inputs: StoredInputs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs))
  } catch {
    // ignore quota / unavailable
  }
}

export function loadLastRoles(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LAST_ROLES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    const out: Record<string, string> = {}
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof k === 'string' && typeof v === 'string') out[k] = v
    }
    return out
  } catch {
    return {}
  }
}

export function storeLastRoles(map: Record<string, string>) {
  try {
    localStorage.setItem(LAST_ROLES_KEY, JSON.stringify(map))
  } catch {
    // ignore quota / unavailable
  }
}
