<template>
  <view class="container">
    <PageHeader title="🪓 反向决策器" subtitle="不替你选，而是一轮轮淘汰到只剩一个答案" />

    <view class="page-content">
      <view class="card">
        <view class="card-title">候选项</view>
        <textarea
          class="textarea-input"
          v-model="optionsText"
          placeholder="每行一个选项，也支持逗号或 / 分隔，例如：火锅 / 烤肉 / 寿司 / 麻辣烫"
        ></textarea>
        <view class="action-row">
          <view class="minor-btn" @click="startDecider">开始淘汰</view>
          <view class="minor-btn" @click="eliminateOne">继续淘汰</view>
          <view class="minor-btn danger" @click="resetDecider">重置</view>
        </view>
      </view>

      <view v-if="remainingOptions.length > 0" class="card">
        <view class="card-title">当前剩余</view>
        <view class="options-list">
          <view v-for="option in remainingOptions" :key="option" class="option-chip">
            {{ option }}
          </view>
        </view>
      </view>

      <view v-if="winner" class="result-card">
        <text class="result-label">最后留下的是</text>
        <text class="result-value">{{ winner }}</text>
        <text class="result-desc">如果看到它时你突然松了一口气，说明你本来就更想选这个。</text>
        <view class="action-row">
          <view class="minor-btn" @click="copyResult">复制结果</view>
          <view class="minor-btn primary" @click="resetDecider">再来一次</view>
        </view>
      </view>

      <view v-if="history.length > 0" class="card">
        <view class="card-title">淘汰记录</view>
        <view v-for="item in history" :key="item.label" class="history-item">
          <text class="history-title">淘汰 {{ item.label }}</text>
          <text class="history-desc">{{ item.reason }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<route lang="json5">
{
  style: {
    navigationBarTitleText: '反向决策器',
    enablePullDownRefresh: false
  }
}
</route>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: '反向决策器 - DM工具箱',
    path: '/pkg-more/reverseDecider/reverseDecider'
  })
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { recordPersonaSignal } from '@/utils/toolUsage'

interface HistoryItem {
  label: string
  reason: string
}

const eliminationReasons = [
  '它在最后关头没能给你足够强的心动感。',
  '看起来并不差，但也没强到让你立刻拍板。',
  '你并没有真的想坚持它，只是暂时还没删掉。',
  '在剩余选项面前，它的吸引力略微落后了一点。'
]

const optionsText = ref('')
const remainingOptions = ref<string[]>([])
const history = ref<HistoryItem[]>([])

const winner = computed(() => {
  return remainingOptions.value.length === 1 ? remainingOptions.value[0] : ''
})

const parseOptions = () => {
  return Array.from(
    new Set(
      optionsText.value
        .split('\n')
        .flatMap(line => line.split(/[，,／/]/))
        .map(item => item.trim())
        .filter(Boolean)
    )
  )
}

const startDecider = () => {
  const parsedOptions = parseOptions()

  if (parsedOptions.length < 2) {
    uni.showToast({
      title: '至少需要两个选项',
      icon: 'none'
    })
    return
  }

  remainingOptions.value = parsedOptions
  history.value = []
}

const eliminateOne = () => {
  if (remainingOptions.value.length === 0) {
    startDecider()
    return
  }

  if (remainingOptions.value.length === 1) {
    uni.showToast({
      title: '已经只剩最后一个了',
      icon: 'none'
    })
    return
  }

  const nextOptions = [...remainingOptions.value]
  const removedIndex = Math.floor(Math.random() * nextOptions.length)
  const [removed] = nextOptions.splice(removedIndex, 1)

  remainingOptions.value = nextOptions
  history.value.unshift({
    label: removed,
    reason: eliminationReasons[Math.floor(Math.random() * eliminationReasons.length)]
  })

  if (nextOptions.length === 1) {
    recordPersonaSignal('reverse-decider-finish', String(parseOptions().length))
  }
}

const resetDecider = () => {
  remainingOptions.value = []
  history.value = []
}

const copyResult = async () => {
  if (!winner.value) {
    return
  }

  try {
    await uni.setClipboardData({
      data: `反向决策器结果：${winner.value}`
    })
  } catch (error) {
    uni.showToast({
      title: '复制失败',
      icon: 'none'
    })
  }
}
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
.result-card {
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

.textarea-input {
  width: 100%;
  min-height: 240rpx;
  box-sizing: border-box;
  border-radius: 18rpx;
  border: 2rpx solid #e5e7eb;
  background: #f9fafb;
  padding: 24rpx;
  font-size: 28rpx;
  line-height: 1.7;
  color: #111827;
}

.action-row {
  display: flex;
  gap: 16rpx;
  margin-top: 20rpx;
}

.minor-btn {
  flex: 1;
  text-align: center;
  padding: 18rpx 0;
  border-radius: 18rpx;
  background: #e0e7ff;
  color: #4338ca;
  font-size: 25rpx;
}

.minor-btn.primary {
  background: #4338ca;
  color: #fff;
}

.minor-btn.danger {
  background: #fee2e2;
  color: #dc2626;
}

.options-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.option-chip {
  padding: 16rpx 20rpx;
  border-radius: 999rpx;
  background: #f5f3ff;
  color: #6d28d9;
  font-size: 25rpx;
}

.result-card {
  background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%);
  color: #fff;
}

.result-label {
  display: block;
  font-size: 26rpx;
  opacity: 0.92;
}

.result-value {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  margin: 18rpx 0 12rpx;
}

.result-desc {
  display: block;
  font-size: 24rpx;
  line-height: 1.8;
}

.history-item {
  padding: 16rpx 0;
  border-bottom: 1px solid #f1f5f9;
}

.history-item:last-child {
  border-bottom: none;
}

.history-title {
  display: block;
  font-size: 26rpx;
  color: #0f172a;
}

.history-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #64748b;
  line-height: 1.7;
}
</style>
