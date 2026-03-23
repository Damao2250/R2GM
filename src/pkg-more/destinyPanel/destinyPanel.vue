<template>
  <view class="container">
    <PageHeader title="🔮 今日命运面板" subtitle="把生日、时间、随机数和方向拼成一本正经的今日运势" />

    <view class="page-content">
      <view class="card">
        <view class="card-title">基础信息</view>
        <input class="text-input" v-model="userName" placeholder="你的名字，默认匿名工具人" />
        <picker mode="date" :value="birthday" @change="handleBirthdayChange">
          <view class="picker-field">{{ birthday || '选择生日会让面板更像真的' }}</view>
        </picker>
        <view class="sensor-card">
          <view class="sensor-item">
            <text class="sensor-label">当前方向</text>
            <text class="sensor-value">{{ directionText }}</text>
          </view>
          <view class="sensor-item">
            <text class="sensor-label">罗盘状态</text>
            <text class="sensor-value">{{ sensorReady ? '已就绪' : '未检测到，使用随机方向兜底' }}</text>
          </view>
        </view>
        <button class="primary-btn" @click="generatePanel">刷新今日命运</button>
      </view>

      <view v-if="report" class="fortune-card">
        <text class="fortune-name">{{ report.name }}</text>
        <text class="fortune-title">{{ report.title }}</text>
        <text class="fortune-subtitle">{{ report.summary }}</text>

        <view class="fortune-grid">
          <view class="fortune-box">
            <text class="fortune-label">幸运数字</text>
            <text class="fortune-value">{{ report.luckyNumber }}</text>
          </view>
          <view class="fortune-box">
            <text class="fortune-label">推荐方向</text>
            <text class="fortune-value">{{ report.direction }}</text>
          </view>
          <view class="fortune-box">
            <text class="fortune-label">星座标签</text>
            <text class="fortune-value">{{ report.constellation }}</text>
          </view>
          <view class="fortune-box">
            <text class="fortune-label">最佳时段</text>
            <text class="fortune-value">{{ report.luckyWindow }}</text>
          </view>
        </view>

        <view class="score-card">
          <view v-for="score in report.scores" :key="score.label" class="score-row">
            <view class="score-header">
              <text class="score-label">{{ score.label }}</text>
              <text class="score-number">{{ score.value }}</text>
            </view>
            <view class="score-track">
              <view class="score-fill" :style="{ width: `${score.value}%` }"></view>
            </view>
          </view>
        </view>

        <view class="note-box">
          <text class="note-title">今日建议</text>
          <text class="note-text">{{ report.advice }}</text>
        </view>

        <view class="action-row">
          <view class="minor-btn" @click="copyReport">复制面板文案</view>
          <view class="minor-btn primary" @click="generatePanel">再测一次</view>
        </view>
      </view>
    </view>
  </view>
</template>

<route lang="json5">
{
  style: {
    navigationBarTitleText: '今日命运面板',
    enablePullDownRefresh: false
  }
}
</route>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: '今日命运面板 - DM工具箱',
    path: '/pkg-more/destinyPanel/destinyPanel'
  })
}
</script>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { createSensorApi, getDirectionName, registerCompassListener, startCompassSensor, stopCompassSensor } from '@/utils/motionSensor'
import { recordPersonaSignal } from '@/utils/toolUsage'

interface FortuneScore {
  label: string
  value: number
}

interface FortuneReport {
  name: string
  title: string
  summary: string
  luckyNumber: number
  direction: string
  constellation: string
  luckyWindow: string
  advice: string
  scores: FortuneScore[]
}

const sensorApi = createSensorApi()

const fallbackDirections = ['东', '南', '西', '北', '东北', '东南', '西南', '西北']
const fortuneTitles = ['稳住就是主角', '今天适合发疯式推进', '行动力略高于常人', '适合认真地离谱']
const fortuneSummaries = [
  '你今天看起来像一个很会把混乱变成成果的人。',
  '表面平静，实际暗中有好运在给你递工具。',
  '今天适合做决定，也适合把决定改成更像自己的版本。',
  '如果非要选一个关键词，那就是“顺手就成了”。'
]
const advicePool = [
  '先做最小的一步，后面的动力会自动跟上。',
  '今天适合把复杂问题拆成三小块，一块块解决。',
  '把注意力放在一个最想推进的点上，别贪多。',
  '允许自己先乱一点，今天的好运很擅长收尾。'
]

const userName = ref('匿名工具人')
const birthday = ref('')
const directionText = ref('未定')
const sensorReady = ref(false)
const report = ref<FortuneReport | null>(null)

const padTwo = (value: number) => String(value).padStart(2, '0')

const getConstellation = (birthdayText: string) => {
  if (!birthdayText) {
    return '未指定'
  }

  const [, monthText = '1', dayText = '1'] = birthdayText.split('-')
  const month = Number.parseInt(monthText, 10)
  const day = Number.parseInt(dayText, 10)
  const thresholds = [
    [1, 20, '水瓶座'],
    [2, 19, '双鱼座'],
    [3, 21, '白羊座'],
    [4, 20, '金牛座'],
    [5, 21, '双子座'],
    [6, 22, '巨蟹座'],
    [7, 23, '狮子座'],
    [8, 23, '处女座'],
    [9, 23, '天秤座'],
    [10, 24, '天蝎座'],
    [11, 23, '射手座'],
    [12, 22, '摩羯座']
  ] as const

  for (let index = thresholds.length - 1; index >= 0; index--) {
    const [targetMonth, thresholdDay, constellation] = thresholds[index]
    if (month > targetMonth || (month === targetMonth && day >= thresholdDay)) {
      return constellation
    }
  }

  return '摩羯座'
}

const seedValue = (offset: number) => {
  const now = new Date()
  const nameSeed = Array.from(userName.value || '匿名工具人').reduce((total, char) => total + char.charCodeAt(0), 0)
  const birthdaySeed = birthday.value
    ? birthday.value.replace(/-/g, '').split('').reduce((total, char) => total + Number.parseInt(char, 10), 0)
    : 17
  const baseSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const mixed = Math.sin(baseSeed + birthdaySeed * 13 + nameSeed * 7 + offset * 17) * 10000

  return mixed - Math.floor(mixed)
}

const generatePanel = () => {
  const luckyNumber = Math.floor(seedValue(1) * 89) + 11
  const direction = sensorReady.value ? directionText.value : fallbackDirections[Math.floor(seedValue(2) * fallbackDirections.length)]
  const constellation = getConstellation(birthday.value)
  const luckyHour = Math.floor(seedValue(3) * 8) + 9
  const luckyMinute = Math.floor(seedValue(4) * 6) * 10
  const scores = [
    {
      label: '行动力',
      value: Math.floor(seedValue(5) * 41) + 55
    },
    {
      label: '社交值',
      value: Math.floor(seedValue(6) * 41) + 50
    },
    {
      label: '财运感',
      value: Math.floor(seedValue(7) * 41) + 48
    },
    {
      label: '离谱指数',
      value: Math.floor(seedValue(8) * 51) + 35
    }
  ]

  report.value = {
    name: userName.value.trim() || '匿名工具人',
    title: fortuneTitles[Math.floor(seedValue(9) * fortuneTitles.length)],
    summary: fortuneSummaries[Math.floor(seedValue(10) * fortuneSummaries.length)],
    luckyNumber,
    direction,
    constellation,
    luckyWindow: `${padTwo(luckyHour)}:${padTwo(luckyMinute)}`,
    advice: advicePool[Math.floor(seedValue(11) * advicePool.length)],
    scores
  }

  recordPersonaSignal('destiny-refresh', direction)
}

const handleBirthdayChange = (event: { detail?: { value?: string } }) => {
  birthday.value = event.detail?.value || ''
}

const copyReport = async () => {
  if (!report.value) {
    return
  }

  const reportText = [
    `${report.value.name} · 今日命运面板`,
    report.value.title,
    report.value.summary,
    `幸运数字：${report.value.luckyNumber}`,
    `推荐方向：${report.value.direction}`,
    `星座标签：${report.value.constellation}`,
    `最佳时段：${report.value.luckyWindow}`,
    `今日建议：${report.value.advice}`
  ].join('\n')

  try {
    await uni.setClipboardData({
      data: reportText
    })
  } catch (error) {
    uni.showToast({
      title: '复制失败',
      icon: 'none'
    })
  }
}

onMounted(async () => {
  if (registerCompassListener(sensorApi, angle => {
    directionText.value = `${getDirectionName(angle)} · ${Math.round(angle)}°`
  })) {
    sensorReady.value = await startCompassSensor(sensorApi)
  }

  generatePanel()
})

onBeforeUnmount(() => {
  stopCompassSensor(sensorApi)
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

.card,
.fortune-card {
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

.text-input,
.picker-field {
  width: 100%;
  box-sizing: border-box;
  min-height: 96rpx;
  height: 96rpx;
  border-radius: 18rpx;
  border: 2rpx solid #e5e7eb;
  background: #f9fafb;
  padding: 0 24rpx;
  font-size: 28rpx;
  line-height: 96rpx;
  color: #111827;
  margin-bottom: 18rpx;
}

.sensor-card {
  background: #f8fafc;
  border-radius: 20rpx;
  padding: 22rpx;
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.sensor-item {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.sensor-label {
  font-size: 25rpx;
  color: #64748b;
}

.sensor-value {
  font-size: 25rpx;
  color: #0f172a;
  text-align: right;
}

.primary-btn {
  width: 100%;
  border: none;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%);
  color: #fff;
  font-size: 30rpx;
  padding: 24rpx 0;
}

.fortune-card {
  background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%);
  color: #fff;
}

.fortune-name {
  display: block;
  font-size: 28rpx;
  opacity: 0.92;
}

.fortune-title {
  display: block;
  font-size: 46rpx;
  font-weight: 700;
  margin: 18rpx 0 12rpx;
}

.fortune-subtitle {
  display: block;
  font-size: 25rpx;
  line-height: 1.8;
  opacity: 0.95;
}

.fortune-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
  margin: 28rpx 0;
}

.fortune-box {
  background: rgba(255, 255, 255, 0.14);
  border-radius: 20rpx;
  padding: 20rpx;
}

.fortune-label {
  display: block;
  font-size: 24rpx;
  opacity: 0.88;
}

.fortune-value {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  margin-top: 12rpx;
}

.score-card {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 22rpx;
  padding: 22rpx;
}

.score-row {
  margin-bottom: 16rpx;
}

.score-row:last-child {
  margin-bottom: 0;
}

.score-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.score-label,
.score-number {
  font-size: 24rpx;
}

.score-track {
  height: 14rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.2);
}

.score-fill {
  height: 100%;
  border-radius: inherit;
  background: #fff;
}

.note-box {
  margin-top: 24rpx;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 22rpx;
  padding: 22rpx;
}

.note-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 10rpx;
}

.note-text {
  display: block;
  font-size: 24rpx;
  line-height: 1.8;
}

.action-row {
  display: flex;
  gap: 18rpx;
  margin-top: 24rpx;
}

.minor-btn {
  flex: 1;
  text-align: center;
  padding: 18rpx 0;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  font-size: 26rpx;
}

.minor-btn.primary {
  background: rgba(255, 255, 255, 0.24);
}
</style>
