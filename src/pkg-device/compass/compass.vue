<template>
  <view class="container">
    <!-- 页面头部 -->
    <PageHeader title="🧭 灵感罗盘" subtitle="陀螺仪·水平仪·方向指南" />

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 罗盘主卡片 -->
      <view class="compass-card">
        <!-- 罗盘圆形容器 -->
        <view class="compass-circle-wrapper" :style="{ transform: `rotate(${-compassAngle}deg)` }">
          <!-- 罗盘背景 -->
          <view class="compass-background">
            <!-- 外圆 -->
            <view class="compass-outer-circle"></view>
            <!-- 刻度 -->
            <view class="compass-marks">
              <view class="compass-mark" v-for="i in 36" :key="i" :style="{ transform: `rotate(${(i - 1) * 10}deg)` }"></view>
            </view>
            <!-- 方向标签 -->
            <view class="compass-labels">
              <view class="compass-label north">N</view>
              <view class="compass-label east">E</view>
              <view class="compass-label south">S</view>
              <view class="compass-label west">W</view>
            </view>
          </view>
          <!-- 中心十字准星 -->
          <view class="center-crosshair">
            <view class="cross-h"></view>
            <view class="cross-v"></view>
          </view>
          <!-- 中心圆点 -->
          <view class="center-dot"></view>
          <!-- 顶部指针 -->
          <view class="compass-pointer"></view>
        </view>

        <!-- 角度和方向信息 -->
        <view class="angle-info">
          <view class="angle-value">{{ Math.round(compassAngle) }}°</view>
          <view class="direction-text">{{ currentDirection }}</view>
          <view class="coordinates">{{ sensorStatus }}</view>
        </view>
      </view>

      <!-- 水平仪卡片 -->
      <view class="level-card">
        <view class="card-title">📐 水平仪</view>
        <view class="level-indicator">
          <!-- 水平仪背景 -->
          <view class="level-bg">
            <!-- X 轴水平刻度 -->
            <view class="level-scale-x">
              <view class="scale-mark" v-for="i in 7" :key="'x' + i">{{ (i - 4) * 30 }}</view>
            </view>
            <!-- Y 轴纵向刻度 -->
            <view class="level-scale-y">
              <view class="scale-mark" v-for="i in 7" :key="'y' + i">{{ (i - 4) * 30 }}</view>
            </view>
          </view>
          <!-- 水平仪指示器球 -->
          <view
            class="level-bubble"
            :class="[isLevel ? 'level-ok' : 'level-warning']"
            :style="{ left: `calc(50% + ${levelOffsetX}px)`, top: `calc(50% + ${levelOffsetY}px)` }"
          ></view>
          <!-- 水平仪中心线 -->
          <view class="level-center-line-x"></view>
          <view class="level-center-line-y"></view>
        </view>
        <view class="level-status" :class="[isLevel ? 'ok' : 'warning']">
          <text class="status-icon">{{ isLevel ? '✓' : '!' }}</text>
          <text class="status-text">{{ isLevel ? '已水平' : '请调整设备水平' }} X:{{ Math.round(accelerometer.y * 10) / 10 }}° Y:{{ Math.round(accelerometer.x * 10) / 10 }}° Z:{{ Math.round(accelerometer.z * 10) / 10 }}°</text>
        </view>
      </view>

      <!-- 详细数据卡片 -->
      <view class="data-card">
        <view class="card-title">📊 传感器数据</view>
        <view class="data-grid">
          <view class="data-item">
            <text class="data-label">前后倾斜 (Y轴)</text>
            <text class="data-value">{{ Math.round(accelerometer.x * 10) / 10 }}°</text>
          </view>
          <view class="data-item">
            <text class="data-label">左右倾斜 (X轴)</text>
            <text class="data-value">{{ Math.round(accelerometer.y * 10) / 10 }}°</text>
          </view>
          <view class="data-item">
            <text class="data-label">旋转角 (Z轴)</text>
            <text class="data-value">{{ Math.round(accelerometer.z * 10) / 10 }}°</text>
          </view>
          <view class="data-item">
            <text class="data-label">磁力方位</text>
            <text class="data-value">{{ Math.round(magnetic) }}°</text>
          </view>
        </view>
      </view>

      <!-- 功能说明 -->
      <view class="tips-section">
        <view class="tips-title">💡 功能说明</view>
        <view class="tips-content">
          <text class="tip-item">• 罗盘显示当前设备指向方向（相对于地磁北极）</text>
          <text class="tip-item">• 水平仪判识设备是否保持水平状态（±5°范围内）</text>
          <text class="tip-item">• 前后倾斜：设备围绕Y轴的倾斜角度</text>
          <text class="tip-item">• 左右倾斜：设备围绕X轴的倾斜角度</text>
          <text class="tip-item">• 需要设备支持陀螺仪和磁力传感器</text>
        </view>
      </view>
    </view>
  </view>
</template>

<route lang="json5">
{
  style: {
    navigationBarTitleText: '灵感罗盘',
    enablePullDownRefresh: false
  }
}
</route>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: '灵感罗盘 - DM工具箱',
    path: '/pkg-device/compass/compass'
  })
}
</script>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'

interface SensorAxes {
  x: number
  y: number
  z: number
}

interface RawSensorAxes {
  x?: number | string | null
  y?: number | string | null
  z?: number | string | null
}

interface DeviceMotionPayload {
  acceleration?: RawSensorAxes | null
}

interface CompassPayload {
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
  stopCompass?: () => void
  stopAccelerometer?: () => void
}

const LEVEL_THRESHOLD = 5
const LEVEL_OFFSET_LIMIT = 180
const LEVEL_OFFSET_MULTIPLIER = 2
const SENSOR_START_DELAY = 300
const FULL_CIRCLE = 360
const DEBUG_SENSOR_LOGS = false

const uniSensorApi = uni as typeof uni & UniSensorApi

const compassAngle = ref(0)
const accelerometer = reactive({
  x: 0,
  y: 0,
  z: 0
})
const magnetic = ref(0)
const isLevel = ref(false)
const levelOffsetX = ref(0)
const levelOffsetY = ref(0)
const sensorStatus = ref('等待传感器')
const currentDirection = ref('北')

let sensorStartupTimer: ReturnType<typeof setTimeout> | null = null
let sensorDebugTimer: ReturnType<typeof setInterval> | null = null

const debugLog = (...args: unknown[]) => {
  if (DEBUG_SENSOR_LOGS) {
    console.log('[compass]', ...args)
  }
}

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

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const roundToOne = (value: number) => Math.round(value * 10) / 10
const normalizeAngle = (angle: number) => (angle % FULL_CIRCLE + FULL_CIRCLE) % FULL_CIRCLE

const getDirectionName = (angle: number): string => {
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

  for (const dir of directions) {
    if (safeAngle >= dir.min && safeAngle <= dir.max) {
      return dir.name
    }
  }

  return '北'
}

const updateDirection = (angle: number) => {
  currentDirection.value = getDirectionName(angle)
}

const applyCompassDirection = (angle: number) => {
  const safeAngle = normalizeAngle(angle)
  compassAngle.value = safeAngle
  magnetic.value = safeAngle
  updateDirection(safeAngle)
}

const resolveSensorAxes = (payload: RawSensorAxes | DeviceMotionPayload | null | undefined): SensorAxes | null => {
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

  return { x, y, z }
}

const handleCompassChange = (payload: CompassPayload) => {
  const direction = toFiniteNumber(payload.direction)

  if (direction === null) {
    return
  }

  applyCompassDirection(direction)
}

const handleAccelerometerData = (payload: RawSensorAxes | DeviceMotionPayload) => {
  const axes = resolveSensorAxes(payload)

  if (!axes) {
    return
  }

  const { x, y, z } = axes
  const roll = Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI)
  const pitch = Math.atan2(-x, Math.sqrt(y * y + z * z)) * (180 / Math.PI)
  const yaw = Math.atan2(z, Math.sqrt(x * x + y * y)) * (180 / Math.PI)

  accelerometer.x = roundToOne(pitch)
  accelerometer.y = roundToOne(roll)
  accelerometer.z = roundToOne(yaw)

  isLevel.value = Math.abs(pitch) < LEVEL_THRESHOLD && Math.abs(roll) < LEVEL_THRESHOLD
  levelOffsetX.value = clamp(roll * LEVEL_OFFSET_MULTIPLIER, -LEVEL_OFFSET_LIMIT, LEVEL_OFFSET_LIMIT)
  levelOffsetY.value = clamp(pitch * LEVEL_OFFSET_MULTIPLIER, -LEVEL_OFFSET_LIMIT, LEVEL_OFFSET_LIMIT)

  debugLog('accelerometer', { x, y, z, pitch, roll, yaw })
}

const registerCompassListener = () => {
  if (typeof uniSensorApi.onCompassChange === 'function') {
    uniSensorApi.onCompassChange(handleCompassChange)
    return true
  }

  if (typeof uniSensorApi.onCompass === 'function') {
    uniSensorApi.onCompass(handleCompassChange)
    return true
  }

  return false
}

const registerAccelerometerListener = () => {
  if (typeof uniSensorApi.onAccelerometerChange === 'function') {
    uniSensorApi.onAccelerometerChange(handleAccelerometerData)
    return true
  }

  if (typeof uniSensorApi.onAccelerometer === 'function') {
    uniSensorApi.onAccelerometer(handleAccelerometerData)
    return true
  }

  if (typeof uniSensorApi.onDeviceMotionChange === 'function') {
    uniSensorApi.onDeviceMotionChange(handleAccelerometerData)
    return true
  }

  return false
}

const startAccelerometerWithRetry = () => {
  if (!registerAccelerometerListener()) {
    uni.showToast({
      title: '设备不支持加速度计',
      icon: 'none'
    })
    return
  }

  uni.startAccelerometer({
    interval: 'normal',
    success: () => {
      debugLog('accelerometer started')
    },
    fail: () => {
      uni.startAccelerometer({
        success: () => {
          debugLog('accelerometer started without interval')
        },
        fail: () => {
          uni.showToast({
            title: '设备不支持加速度计',
            icon: 'none'
          })
        }
      })
    }
  })
}

const clearSensorTimers = () => {
  if (sensorStartupTimer) {
    clearTimeout(sensorStartupTimer)
    sensorStartupTimer = null
  }

  if (sensorDebugTimer) {
    clearInterval(sensorDebugTimer)
    sensorDebugTimer = null
  }
}

const stopCompassListener = () => {
  if (typeof uniSensorApi.offCompassChange === 'function') {
    uniSensorApi.offCompassChange()
  } else if (typeof uniSensorApi.offCompass === 'function') {
    uniSensorApi.offCompass()
  }
}

const stopAccelerometerListener = () => {
  if (typeof uniSensorApi.offAccelerometerChange === 'function') {
    uniSensorApi.offAccelerometerChange()
  } else if (typeof uniSensorApi.offAccelerometer === 'function') {
    uniSensorApi.offAccelerometer()
  } else if (typeof uniSensorApi.offDeviceMotionChange === 'function') {
    uniSensorApi.offDeviceMotionChange()
  }
}

const startSensors = () => {
  if (!registerCompassListener()) {
    sensorStatus.value = '罗盘不可用'
    uni.showToast({
      title: '设备不支持罗盘',
      icon: 'none'
    })
  } else {
    uni.startCompass({
      success: () => {
        sensorStatus.value = '罗盘已就绪'
        uni.showToast({
          title: '罗盘已就绪',
          icon: 'success',
          duration: 1000
        })
      },
      fail: () => {
        sensorStatus.value = '罗盘不可用'
        stopCompassListener()
        uni.showToast({
          title: '设备不支持罗盘',
          icon: 'none'
        })
      }
    })
  }

  startAccelerometerWithRetry()

  if (DEBUG_SENSOR_LOGS) {
    sensorDebugTimer = setInterval(() => {
      debugLog('status', {
        compass: compassAngle.value,
        accelerometer: { ...accelerometer }
      })
    }, 3000)
  }
}

onMounted(() => {
  sensorStartupTimer = setTimeout(startSensors, SENSOR_START_DELAY)
})

onBeforeUnmount(() => {
  clearSensorTimers()
  stopCompassListener()
  stopAccelerometerListener()

  if (typeof uniSensorApi.stopCompass === 'function') {
    uniSensorApi.stopCompass()
  }

  if (typeof uniSensorApi.stopAccelerometer === 'function') {
    uniSensorApi.stopAccelerometer()
  }
})
</script>

<style lang="scss" scoped>
@use '../../styles/theme.scss' as *;

.container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 0 0 40rpx 0;
}

.page-content {
  padding: 30rpx;
}

/* ===== 罗盘卡片 ===== */
.compass-card {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.compass-circle-wrapper {
  position: relative;
  width: 240rpx;
  height: 240rpx;
  margin: 0 auto 30rpx;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.1s ease;
}

.compass-background {
  position: relative;
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 50%;
}

.compass-outer-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2rpx solid #e0e0e0;
  border-radius: 50%;
  box-sizing: border-box;
}

.compass-marks {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.compass-mark {
  position: absolute;
  top: 0;
  left: 50%;
  width: 1px;
  height: 12rpx;
  background: #ccc;
  transform-origin: 50% 120rpx;
  margin-left: -0.5px;
}

.compass-labels {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.compass-label {
  position: absolute;
  width: 30rpx;
  height: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: bold;
  border-radius: 50%;

  &.north {
    top: 12rpx;
    left: 50%;
    transform: translateX(-50%);
    color: #FF6B6B;
    background: rgba(255, 107, 107, 0.1);
  }

  &.east {
    right: 12rpx;
    top: 50%;
    transform: translateY(-50%);
    color: #333;
  }

  &.south {
    bottom: 12rpx;
    left: 50%;
    transform: translateX(-50%);
    color: #333;
  }

  &.west {
    left: 12rpx;
    top: 50%;
    transform: translateY(-50%);
    color: #333;
  }
}

.compass-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.center-crosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60rpx;
  height: 60rpx;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.cross-h,
.cross-v {
  position: absolute;
  background: rgba(0, 0, 0, 0.2);
}

.cross-h {
  width: 60rpx;
  height: 1px;
  top: 30rpx;
  left: 0;
}

.cross-v {
  width: 1px;
  height: 60rpx;
  top: 0;
  left: 30rpx;
}

.center-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8rpx;
  height: 8rpx;
  background: #667eea;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 8rpx rgba(102, 126, 234, 0.5);
}

.compass-pointer {
  position: absolute;
  top: 10rpx;
  left: 50%;
  width: 4rpx;
  height: 50rpx;
  background: linear-gradient(180deg, #ff6b6b 0%, transparent 100%);
  transform: translateX(-50%);
  border-radius: 2rpx;
  box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.3);
}

.angle-info {
  text-align: center;
  width: 100%;
}

.angle-value {
  font-size: 56rpx;
  font-weight: bold;
  color: $app-primary-color;
  line-height: 1.2;
}

.direction-text {
  font-size: 32rpx;
  color: $app-text-secondary;
  margin-top: 8rpx;
}

.coordinates {
  font-size: 24rpx;
  color: $app-text-tertiary;
  margin-top: 12rpx;
  word-break: break-all;
}

/* ===== 水平仪卡片 ===== */
.level-card {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

.level-indicator {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: linear-gradient(90deg, #f0f0f0 0%, #ffffff 50%, #f0f0f0 100%),
              linear-gradient(180deg, #f0f0f0 0%, #ffffff 50%, #f0f0f0 100%);
  background-size: 100% 50%, 50% 100%;
  background-position: 0 0, 0 0;
  background-repeat: no-repeat;
  border-radius: 12rpx;
  border: 2rpx solid #e0e0e0;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.level-bg {
  width: 100%;
  height: 100%;
  position: relative;
}

.level-scale-x {
  position: absolute;
  width: 100%;
  height: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-around;
  align-items: center;
  opacity: 0.8;
}

.level-scale-y {
  position: absolute;
  width: 50rpx;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  opacity: 0.8;
}

.scale-mark {
  font-size: 12rpx;
  color: #555;
  font-weight: 600;
  white-space: nowrap;
}

.level-bubble {
  position: absolute;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: #ffb800;
  box-shadow: 0 2rpx 8rpx rgba(255, 184, 0, 0.3);
  transition: all 0.05s ease;
  will-change: left, top;

  &.level-ok {
    background: #5dbc4c;
    box-shadow: 0 2rpx 8rpx rgba(93, 188, 76, 0.3);
  }

  &.level-warning {
    background: #ffb800;
    box-shadow: 0 2rpx 8rpx rgba(255, 184, 0, 0.3);
  }
}

.level-center-line-x {
  position: absolute;
  height: 2rpx;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.15);
}

.level-center-line-y {
  position: absolute;
  width: 2rpx;
  height: 100%;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.15);
}

.level-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: #ffb800;

  &.ok {
    color: #5dbc4c;
  }

  &.warning {
    color: #ffb800;
  }

  .status-icon {
    font-size: 32rpx;
    font-weight: bold;
  }
}

/* ===== 数据卡片 ===== */
.data-card {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.data-item {
  background: #f8f9ff;
  border-radius: 12rpx;
  padding: 24rpx;
  border: 1px solid #e0e5ff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.data-label {
  font-size: 26rpx;
  color: $app-text-secondary;
}

.data-value {
  font-size: 32rpx;
  font-weight: bold;
  color: $app-primary-color;
}

/* ===== 功能说明 ===== */
.tips-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  border-left: 4rpx solid $app-primary-color;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.tips-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.tips-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.tip-item {
  font-size: 24rpx;
  line-height: 1.6;
  color: #666;
}
</style>
