export interface ToolUsageRecord {
  title: string
  url: string
  source: string
  openedAt: number
  hour: number
}

export interface PersonaSignalRecord {
  type: string
  meta?: string
  createdAt: number
}

const TOOL_USAGE_KEY = 'tool_usage_history_v1'
const PERSONA_SIGNAL_KEY = 'persona_signal_history_v1'
const MAX_TOOL_HISTORY = 240
const MAX_SIGNAL_HISTORY = 240

const parseStorageList = <T>(value: unknown): T[] => {
  if (!value) {
    return []
  }

  if (Array.isArray(value)) {
    return value as T[]
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? (parsed as T[]) : []
    } catch (error) {
      return []
    }
  }

  return []
}

const readList = <T>(key: string): T[] => {
  try {
    return parseStorageList<T>(uni.getStorageSync(key))
  } catch (error) {
    return []
  }
}

const writeList = <T>(key: string, value: T[]) => {
  try {
    uni.setStorageSync(key, JSON.stringify(value))
  } catch (error) {
    console.error('写入本地记录失败:', error)
  }
}

export const recordToolUsage = (
  item: Pick<ToolUsageRecord, 'title' | 'url'>,
  source = 'unknown'
) => {
  const history = readList<ToolUsageRecord>(TOOL_USAGE_KEY)
  history.unshift({
    title: item.title,
    url: item.url,
    source,
    openedAt: Date.now(),
    hour: new Date().getHours()
  })

  writeList(TOOL_USAGE_KEY, history.slice(0, MAX_TOOL_HISTORY))
}

export const getToolUsageHistory = () => {
  return readList<ToolUsageRecord>(TOOL_USAGE_KEY)
}

export const recordPersonaSignal = (type: string, meta?: string) => {
  const history = readList<PersonaSignalRecord>(PERSONA_SIGNAL_KEY)
  history.unshift({
    type,
    meta,
    createdAt: Date.now()
  })

  writeList(PERSONA_SIGNAL_KEY, history.slice(0, MAX_SIGNAL_HISTORY))
}

export const getPersonaSignals = () => {
  return readList<PersonaSignalRecord>(PERSONA_SIGNAL_KEY)
}

export const getTimeBucket = (hour: number) => {
  if (hour < 5) {
    return '深夜'
  }

  if (hour < 9) {
    return '清晨'
  }

  if (hour < 12) {
    return '上午'
  }

  if (hour < 18) {
    return '下午'
  }

  return '夜晚'
}
