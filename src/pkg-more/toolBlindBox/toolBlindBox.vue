<template>
  <view class="container">
    <PageHeader title="🎁 工具盲盒" subtitle="摇一摇或长按，随机开出一个奇怪工具" />

    <view class="page-content">
      <view class="card">
        <view class="card-title">今日怪工具推荐</view>
        <view v-if="dailyOddball" class="daily-box">
          <text class="daily-icon">{{ dailyOddball.icon || '🧰' }}</text>
          <view class="daily-meta">
            <text class="daily-title">{{ dailyOddball.title }}</text>
            <text class="daily-desc">{{ dailyOddball.description }}</text>
          </view>
        </view>
      </view>

      <view class="card blind-box-card">
        <view class="box-shell" @click="openBlindBox('tap')" @longpress="openBlindBox('longpress')">
          <view class="box-lid" :class="{ rocking: isOpening }"></view>
          <view class="box-body">{{ isOpening ? '摇匀中...' : '长按 / 轻点开盒' }}</view>
        </view>
        <view class="box-hint">
          {{ sensorReady ? '已启用摇一摇，晃动设备也能开盒。' : '当前设备未启用摇一摇，依然可以点击或长按开盒。' }}
        </view>
        <view class="rolling-title">{{ isOpening ? rollingLabel : '候选工具池' }}</view>
        <view class="pool-meta">当前可随机工具数：{{ toolPool.length }}</view>
      </view>

      <view v-if="pickedTool" class="card result-card">
        <view class="card-title">本次抽中</view>
        <view class="picked-name">{{ pickedTool.icon || '🧰' }} {{ pickedTool.title }}</view>
        <view class="picked-desc">{{ pickedTool.description }}</view>
        <view class="action-row">
          <view class="minor-btn" @click="openBlindBox('reroll')">再开一次</view>
          <view class="minor-btn primary" @click="openPickedTool">立即进入</view>
        </view>
      </view>

      <view class="card">
        <view class="card-title">开盒规则</view>
        <view class="rule-item">1. 主工具和脑洞工具都会进入随机池，但会自动排除“更多工具”和“工具盲盒”自己。</view>
        <view class="rule-item">2. 长按首页 Logo 也可以直接跳到这个页面，再摇一摇抽选。</view>
        <view class="rule-item">3. 抽中的工具会被记入本地使用记录，后面的人格画像会参考这些行为。</view>
      </view>
    </view>
  </view>
</template>

<route lang="json5">
{
  style: {
    navigationBarTitleText: '工具盲盒',
    enablePullDownRefresh: false
  }
}
</route>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: '工具盲盒 - DM工具箱',
    path: '/pkg-more/toolBlindBox/toolBlindBox'
  })
}
</script>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import dayjs from '@/utils/dayjs'
import { moreToolIdeas } from '@/utils/moreTools'
import { getToolsList, getVisibleTools } from '@/utils/toolsManager'
import { createSensorApi, registerAccelerometerListener, startAccelerometerSensor, stopAccelerometerSensor, type SensorAxes } from '@/utils/motionSensor'
import { recordPersonaSignal, recordToolUsage } from '@/utils/toolUsage'

interface BlindBoxTool {
  title: string
  url: string
  icon?: string
  description: string
}

const EXCLUDED_URLS = new Set([
  '/pkg-more/moreTools/moreTools',
  '/pkg-more/toolBlindBox/toolBlindBox'
])
const SHAKE_THRESHOLD = 2.4
const SHAKE_COOLDOWN = 1400

const sensorApi = createSensorApi()
const toolPool = ref<BlindBoxTool[]>([])
const dailyOddball = ref<BlindBoxTool | null>(null)
const pickedTool = ref<BlindBoxTool | null>(null)
const rollingLabel = ref('准备拆盒...')
const sensorReady = ref(false)
const isOpening = ref(false)

let lastAxes: SensorAxes | null = null
let lastShakeAt = 0
let rouletteTimer: ReturnType<typeof setInterval> | null = null
let revealTimer: ReturnType<typeof setTimeout> | null = null

const clearTimers = () => {
  if (rouletteTimer) {
    clearInterval(rouletteTimer)
    rouletteTimer = null
  }

  if (revealTimer) {
    clearTimeout(revealTimer)
    revealTimer = null
  }
}

const getRandomItem = <T,>(items: T[]) => {
  return items[Math.floor(Math.random() * items.length)]
}

const pickDailyOddball = (items: BlindBoxTool[]) => {
  if (!items.length) {
    return null
  }

  const dayKey = dayjs().format('YYYY-M-D')
  let hash = 0

  for (const char of dayKey) {
    hash = (hash * 31 + char.charCodeAt(0)) % items.length
  }

  return items[hash]
}

const loadToolPool = async () => {
  const visibleTools = getVisibleTools(await getToolsList())
    .filter(tool => !EXCLUDED_URLS.has(tool.url))
    .map(tool => ({
      title: tool.title,
      url: tool.url,
      icon: tool.icon,
      description: '来自首页主工具池'
    }))

  const ideaTools = moreToolIdeas
    .filter(tool => !EXCLUDED_URLS.has(tool.url))
    .map(tool => ({
      title: tool.title,
      url: tool.url,
      icon: tool.icon,
      description: tool.description
    }))

  const merged = [...visibleTools, ...ideaTools]
  const uniqueTools: BlindBoxTool[] = []
  const seen = new Set<string>()

  for (const tool of merged) {
    if (seen.has(tool.url)) {
      continue
    }

    seen.add(tool.url)
    uniqueTools.push(tool)
  }

  toolPool.value = uniqueTools
  dailyOddball.value = pickDailyOddball(uniqueTools)
}

const finishBlindBox = (trigger: string) => {
  clearTimers()

  const selected = getRandomItem(toolPool.value)
  pickedTool.value = selected
  rollingLabel.value = selected.title
  isOpening.value = false
  recordPersonaSignal('blind-box-open', trigger)
}

const openBlindBox = (trigger: string) => {
  if (!toolPool.value.length || isOpening.value) {
    return
  }

  isOpening.value = true
  pickedTool.value = null

  rouletteTimer = setInterval(() => {
    rollingLabel.value = getRandomItem(toolPool.value).title
  }, 100)

  revealTimer = setTimeout(() => {
    finishBlindBox(trigger)
  }, 1200)
}

const openPickedTool = () => {
  if (!pickedTool.value) {
    return
  }

  recordToolUsage(
    {
      title: pickedTool.value.title,
      url: pickedTool.value.url
    },
    'blind-box'
  )

  uni.navigateTo({
    url: pickedTool.value.url
  })
}

const handleMotion = (axes: SensorAxes) => {
  if (!lastAxes) {
    lastAxes = axes
    return
  }

  const delta =
    Math.abs(axes.x - lastAxes.x) +
    Math.abs(axes.y - lastAxes.y) +
    Math.abs(axes.z - lastAxes.z)

  lastAxes = axes

  const now = dayjs().valueOf()

  if (delta >= SHAKE_THRESHOLD && now - lastShakeAt > SHAKE_COOLDOWN) {
    lastShakeAt = now
    openBlindBox('shake')
  }
}

onMounted(async () => {
  await loadToolPool()

  if (registerAccelerometerListener(sensorApi, handleMotion)) {
    sensorReady.value = await startAccelerometerSensor(sensorApi)
  }
})

onBeforeUnmount(() => {
  clearTimers()
  stopAccelerometerSensor(sensorApi)
})
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f7fa;
}

.page-content {
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.06);
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20rpx;
}

.daily-box {
  display: flex;
  gap: 20rpx;
  align-items: flex-start;
  background: linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%);
  border-radius: 22rpx;
  padding: 22rpx;
}

.daily-icon {
  font-size: 60rpx;
  line-height: 1;
}

.daily-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.daily-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #92400e;
}

.daily-desc {
  font-size: 24rpx;
  line-height: 1.7;
  color: #78350f;
}

.blind-box-card {
  text-align: center;
}

.box-shell {
  width: 320rpx;
  margin: 0 auto 24rpx;
}

.box-lid {
  height: 52rpx;
  border-radius: 24rpx 24rpx 8rpx 8rpx;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  transform-origin: center bottom;
}

.box-lid.rocking {
  animation: rocking 0.35s ease-in-out infinite alternate;
}

.box-body {
  min-height: 200rpx;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
  color: #fff7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 600;
  box-shadow: inset 0 -8rpx 0 rgba(0, 0, 0, 0.08);
}

.box-hint,
.pool-meta {
  font-size: 24rpx;
  color: #64748b;
  line-height: 1.7;
}

.rolling-title {
  margin: 18rpx 0 10rpx;
  font-size: 34rpx;
  font-weight: 600;
  color: #111827;
}

.picked-name {
  font-size: 38rpx;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16rpx;
}

.picked-desc {
  font-size: 25rpx;
  line-height: 1.8;
  color: #475569;
  background: #f8fafc;
  border-radius: 18rpx;
  padding: 22rpx;
}

.action-row {
  display: flex;
  gap: 18rpx;
  margin-top: 22rpx;
}

.minor-btn {
  flex: 1;
  text-align: center;
  padding: 18rpx 0;
  border-radius: 18rpx;
  background: #e0e7ff;
  color: #4338ca;
  font-size: 26rpx;
}

.minor-btn.primary {
  background: #4338ca;
  color: #fff;
}

.rule-item {
  font-size: 24rpx;
  line-height: 1.8;
  color: #475569;
  margin-bottom: 10rpx;
}

.rule-item:last-child {
  margin-bottom: 0;
}

@keyframes rocking {
  from {
    transform: rotate(-6deg);
  }

  to {
    transform: rotate(6deg);
  }
}
</style>
