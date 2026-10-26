import AsyncStorage from '@react-native-async-storage/async-storage'

export const GATEWAYS = [
  'https://api.savsis.xyz/api/anilibria',
  'https://ani.savsis.xyz/api/anilibria',
]

const KEY = 'anisav:gateway'
const TIMEOUT_MS = 5000

let active = 0

export function activeGateway(): string {
  return GATEWAYS[active]
}

export async function loadGateway(): Promise<void> {
  try {
    const n = Number(await AsyncStorage.getItem(KEY))
    if (n >= 0 && n < GATEWAYS.length) active = n
  } catch {}
}

function setActive(index: number): void {
  if (index === active) return
  active = index
  AsyncStorage.setItem(KEY, String(index)).catch(() => {})
}

export async function fetchWithFailover(path: string, init?: RequestInit): Promise<Response> {
  const start = active
  let lastError: unknown = new Error('Нет доступных серверов')
  let lastResponse: Response | null = null
  let lastIndex = start

  for (let i = 0; i < GATEWAYS.length; i++) {
    const index = (start + i) % GATEWAYS.length
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const res = await fetch(`${GATEWAYS[index]}/api/v1${path}`, {
        ...init,
        signal: controller.signal,
      })
      if (res.status < 500) {
        setActive(index)
        return res
      }
      lastResponse = res
      lastIndex = index
    } catch (e) {
      lastError = e
    } finally {
      clearTimeout(timer)
    }
  }

  if (lastResponse) {
    setActive(lastIndex)
    return lastResponse
  }
  throw lastError
}
