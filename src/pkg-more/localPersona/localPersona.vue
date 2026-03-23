<template>
  <view class="container">
    <PageHeader title="🧠 本地人格画像" subtitle="根据使用时段、常用工具和决策偏好生成你的工具人画像" />

    <view class="page-content">
      <view class="hero-card">
        <text class="hero-tag">工具人格</text>
        <text class="hero-title">{{ personaTitle }}</text>
        <text class="hero-desc">{{ personaDescription }}</text>
      </view>

      <view class="card stats-card">
        <view class="stat-box">
          <text class="stat-label">总打开次数</text>
          <text class="stat-value">{{ usageCount }}</text>
        </view>
        <view class="stat-box">
          <text class="stat-label">高频时段</text>
          <text class="stat-value">{{ activeBucket }}</text>
        </view>
        <view class="stat-box">
          <text class="stat-label">最常用工具</text>
          <text class="stat-value">{{ favoriteTool }}</text>
        </view>
        <view class="stat-box">
          <text class="stat-label">决策倾向</text>
          <text class="stat-value">{{ decisionStyle }}</text>
        </view>
      </view>

      <view class="card" v-if="topTools.length > 0">
        <view class="card-title">常用工具 Top 5</view>
        <view v-for="tool in topTools" :key="tool.title" class="tool-row">
          <text class="tool-title">{{ tool.title }}</text>
          <text class="tool-count">{{ tool.count }} 次</text>
        </view>
      </view>

      <view class="card" v-if="signalTags.length > 0">
        <view class="card-title">最近行为标签</view>
        <view class="tag-list">
          <view v-for="tag in signalTags" :key="tag" class="tag-item">{{ tag }}</view>
        </view>
      </view>

      <view class="card" v-if="usageCount === 0">
        <view class="card-title">数据还不够</view>
        <view class="empty-text">先去试试“工具盲盒”“反向决策器”“时间胶囊”这些工具，再回来会更像一份认真胡说的人格报告。</view>
      </view>
    </view>
  </view>
</template>

<route lang="json5">
{
  style: {
    navigationBarTitleText: '本地人格画像',
    enablePullDownRefresh: false
  }
}
</route>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: '本地人格画像 - DM工具箱',
    path: '/pkg-more/localPersona/localPersona'
  })
}
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { getPersonaSignals, getTimeBucket, getToolUsageHistory } from '@/utils/toolUsage'

interface TopTool {
  title: string
  count: number
}

const personaTitle = ref('待观察工具人')
const personaDescription = ref('你刚把画像页打开，系统暂时只知道你对“了解自己”这件事有点兴趣。')
const usageCount = ref(0)
const activeBucket = ref('暂无数据')
const favoriteTool = ref('暂无')
const decisionStyle = ref('随缘试探型')
const topTools = ref<TopTool[]>([])
const signalTags = ref<string[]>([])

const personaMap = {
  planner: {
    title: '秩序搭建师',
    description: '你喜欢先把时间、流程和入口理顺，再开始真正动手。'
  },
  explorer: {
    title: '方向漫游者',
    description: '你对新鲜工具和奇怪入口有天然兴趣，喜欢边走边开新地图。'
  },
  showman: {
    title: '现场导演',
    description: '你会自然地把结果做成卡片、二维码或大字板，适合当现场执行总控。'
  },
  analyst: {
    title: '冷静分析师',
    description: '你偏爱数字、比较和验证，看到参数表会有一种熟悉的安全感。'
  },
  vibe: {
    title: '气氛占卜师',
    description: '你会把随机、命运和小情绪混在一起处理，选择里总带点直觉。'
  }
} as const

const analyzePersona = () => {
  const history = getToolUsageHistory()
  const signals = getPersonaSignals()
  const scores = {
    planner: 0,
    explorer: 0,
    showman: 0,
    analyst: 0,
    vibe: 0
  }

  usageCount.value = history.length

  if (history.length > 0) {
    const toolCountMap = new Map<string, number>()
    const bucketCountMap = new Map<string, number>()

    for (const record of history) {
      toolCountMap.set(record.title, (toolCountMap.get(record.title) || 0) + 1)

      const bucket = getTimeBucket(record.hour)
      bucketCountMap.set(bucket, (bucketCountMap.get(bucket) || 0) + 1)

      const title = record.title
      if (/(时间|倒数|系统设置|工具管理|时间胶囊|拖延启动器)/.test(title)) scores.planner += 2
      if (/(罗盘|方向|盲盒|残局|地势|围栏|更多工具)/.test(title)) scores.explorer += 2
      if (/(二维码|结果卡片|演出|分享)/.test(title)) scores.showman += 2
      if (/(折扣|单位|BMI|设备|网络|编码|金额)/.test(title)) scores.analyst += 2
      if (/(命运|生日|配对|随机|决策)/.test(title)) scores.vibe += 2
    }

    const sortedTools = [...toolCountMap.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([title, count]) => ({ title, count }))

    topTools.value = sortedTools
    favoriteTool.value = sortedTools[0]?.title || '暂无'

    const mostActiveBucket = [...bucketCountMap.entries()].sort((left, right) => right[1] - left[1])[0]
    activeBucket.value = mostActiveBucket?.[0] || '暂无数据'
  }

  const signalCount = new Map<string, number>()
  for (const signal of signals) {
    signalCount.set(signal.type, (signalCount.get(signal.type) || 0) + 1)
  }

  scores.explorer += (signalCount.get('blind-box-open') || 0) * 3
  scores.explorer += (signalCount.get('direction-room-unlocked') || 0) * 2
  scores.planner += (signalCount.get('time-capsule-save') || 0) * 3
  scores.planner += (signalCount.get('procrastination-complete') || 0) * 3
  scores.showman += (signalCount.get('result-card-export') || 0) * 3
  scores.showman += (signalCount.get('emergency-flash-start') || 0) * 2
  scores.analyst += (signalCount.get('reverse-decider-finish') || 0) * 3
  scores.vibe += (signalCount.get('destiny-refresh') || 0) * 2

  const sortedPersona = Object.entries(scores).sort((left, right) => right[1] - left[1])[0]
  const personaKey = (sortedPersona?.[0] || 'planner') as keyof typeof personaMap

  personaTitle.value = personaMap[personaKey].title
  personaDescription.value = personaMap[personaKey].description

  const reverseCount = signalCount.get('reverse-decider-finish') || 0
  const blindBoxCount = signalCount.get('blind-box-open') || 0
  const starterCount = signalCount.get('procrastination-complete') || 0

  if (reverseCount > blindBoxCount && reverseCount > 0) {
    decisionStyle.value = '反复筛选型'
  } else if (blindBoxCount > reverseCount && blindBoxCount > 0) {
    decisionStyle.value = '先开再说型'
  } else if (starterCount > 0) {
    decisionStyle.value = '需要启动仪式型'
  } else {
    decisionStyle.value = '随缘试探型'
  }

  signalTags.value = [...signalCount.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([type, count]) => `${type} × ${count}`)
}

onMounted(() => {
  analyzePersona()
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

.hero-card,
.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.06);
}

.hero-card {
  background: linear-gradient(135deg, #111827 0%, #4338ca 100%);
  color: #fff;
}

.hero-tag {
  display: block;
  font-size: 24rpx;
  opacity: 0.82;
}

.hero-title {
  display: block;
  font-size: 46rpx;
  font-weight: 700;
  margin: 18rpx 0 12rpx;
}

.hero-desc {
  display: block;
  font-size: 24rpx;
  line-height: 1.8;
}

.stats-card {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
}

.stat-box {
  background: #f8fafc;
  border-radius: 20rpx;
  padding: 20rpx;
}

.stat-label {
  display: block;
  font-size: 24rpx;
  color: #64748b;
}

.stat-value {
  display: block;
  font-size: 30rpx;
  color: #0f172a;
  font-weight: 600;
  margin-top: 12rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20rpx;
}

.tool-row {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1px solid #f1f5f9;
}

.tool-row:last-child {
  border-bottom: none;
}

.tool-title,
.tool-count {
  font-size: 25rpx;
  color: #0f172a;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag-item {
  padding: 14rpx 18rpx;
  border-radius: 999rpx;
  background: #ede9fe;
  color: #6d28d9;
  font-size: 24rpx;
}

.empty-text {
  font-size: 24rpx;
  line-height: 1.8;
  color: #475569;
}
</style>
