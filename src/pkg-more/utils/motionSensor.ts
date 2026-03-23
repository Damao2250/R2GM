export interface RawSensorAxes {
  x?: number | string | null
  y?: number | string | null
  z?: number | string | null
}

export interface DeviceMotionPayload {
  acceleration?: RawSensorAxes | null
}

export interface CompassPayload {
  direction?: number | string | null
}

interface UniSensorApi {
  onCompassChange?: (callback: (payload: CompassPayload) => void) => void
  offCompassChange?: () => void
  onCompass?: (callback: (payload: CompassPayload) => void) => void
  offCompass?: () => void
  onAccelerometerChange?: (callback: (payload: RawSensorAxes) => void) => void
  offAccelerometerChange?: () => void
  onAccelerometer?: (callback: (payload: RawSensorAxes) => void) => void
  offAccelerometer?: () => void
  onDeviceMotionChange?: (callback: (payload: DeviceMotionPayload) => void) => void
  offDeviceMotionChange?: () => void
  startCompass?: (options: {
    success?: () => void
    fail?: () => void
  }) => void
  stopCompass?: () => void
  startAccelerometer?: (options: {
    interval?: 'game' | 'ui' | 'normal'
    success?: () => void
    fail?: () => void
  }) => void
  stopAccelerometer?: () => void
}

export interface SensorAxes {
  x: number
  y: number
  z: number
}

export const createSensorApi = () => uni as typeof uni & UniSensorApi

const FULL_CIRCLE = 360

const toFiniteNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseFloat(value)

    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return null
}

export const normalizeAngle = (angle: number) => (angle % FULL_CIRCLE + FULL_CIRCLE) % FULL_CIRCLE

export const getDirectionName = (angle: number): string => {
  const safeAngle = normalizeAngle(angle)
  const directions = [
    { name: '北', min: 337.5, max: FULL_CIRCLE },
    { name: '北', min: 0, max: 22.5 },
    { name: '东北', min: 22.5, max: 67.5 },
    { name: '东', min: 67.5, max: 112.5 },
    { name: '东南', min: 112.5, max: 157.5 },
    { name: '南', min: 157.5, max: 202.5 },
    { name: '西南', min: 202.5, max: 247.5 },
    { name: '西', min: 247.5, max: 292.5 },
    { name: '西北', min: 292.5, max: 337.5 }
  ]

  for (const direction of directions) {
    if (safeAngle >= direction.min && safeAngle <= direction.max) {
      return direction.name
    }
  }

  return '北'
}

export const resolveSensorAxes = (payload: RawSensorAxes | DeviceMotionPayload | null | undefined) => {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const source =
    'acceleration' in payload && payload.acceleration
      ? payload.acceleration
      : (payload as RawSensorAxes)
  const x = toFiniteNumber(source.x)
  const y = toFiniteNumber(source.y)
  const z = toFiniteNumber(source.z)

  if (x === null || y === null || z === null) {
    return null
  }

  return {
    x,
    y,
    z
  }
}

export const getTiltFromAxes = (axes: SensorAxes) => {
  const { x, y, z } = axes
  const roll = Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI)
  const pitch = Math.atan2(-x, Math.sqrt(y * y + z * z)) * (180 / Math.PI)
  const yaw = Math.atan2(z, Math.sqrt(x * x + y * y)) * (180 / Math.PI)

  return {
    pitch,
    roll,
    yaw
  }
}

export const registerCompassListener = (
  api: ReturnType<typeof createSensorApi>,
  callback: (angle: number) => void
) => {
  const handler = (payload: CompassPayload) => {
    const direction = toFiniteNumber(payload.direction)

    if (direction === null) {
      return
    }

    callback(normalizeAngle(direction))
  }

  if (typeof api.onCompassChange === 'function') {
    api.onCompassChange(handler)
    return true
  }

  if (typeof api.onCompass === 'function') {
    api.onCompass(handler)
    return true
  }

  return false
}

export const registerAccelerometerListener = (
  api: ReturnType<typeof createSensorApi>,
  callback: (axes: SensorAxes) => void
) => {
  const handler = (payload: RawSensorAxes | DeviceMotionPayload) => {
    const axes = resolveSensorAxes(payload)

    if (axes) {
      callback(axes)
    }
  }

  if (typeof api.onAccelerometerChange === 'function') {
    api.onAccelerometerChange(handler)
    return true
  }

  if (typeof api.onAccelerometer === 'function') {
    api.onAccelerometer(handler)
    return true
  }

  if (typeof api.onDeviceMotionChange === 'function') {
    api.onDeviceMotionChange(handler)
    return true
  }

  return false
}

export const startCompassSensor = async (api: ReturnType<typeof createSensorApi>) => {
  if (typeof api.startCompass !== 'function') {
    return false
  }

  return await new Promise<boolean>(resolve => {
    api.startCompass?.({
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
}

export const startAccelerometerSensor = async (api: ReturnType<typeof createSensorApi>) => {
  if (typeof api.startAccelerometer !== 'function') {
    return false
  }

  const startWithOptions = (options?: { interval?: 'game' | 'ui' | 'normal' }) =>
    new Promise<boolean>(resolve => {
      api.startAccelerometer?.({
        ...options,
        success: () => resolve(true),
        fail: () => resolve(false)
      })
    })

  if (await startWithOptions({ interval: 'normal' })) {
    return true
  }

  return await startWithOptions()
}

export const stopCompassListener = (api: ReturnType<typeof createSensorApi>) => {
  if (typeof api.offCompassChange === 'function') {
    api.offCompassChange()
    return
  }

  api.offCompass?.()
}

export const stopAccelerometerListener = (api: ReturnType<typeof createSensorApi>) => {
  if (typeof api.offAccelerometerChange === 'function') {
    api.offAccelerometerChange()
    return
  }

  if (typeof api.offAccelerometer === 'function') {
    api.offAccelerometer()
    return
  }

  api.offDeviceMotionChange?.()
}

export const stopCompassSensor = (api: ReturnType<typeof createSensorApi>) => {
  stopCompassListener(api)
  api.stopCompass?.()
}

export const stopAccelerometerSensor = (api: ReturnType<typeof createSensorApi>) => {
  stopAccelerometerListener(api)
  api.stopAccelerometer?.()
}
