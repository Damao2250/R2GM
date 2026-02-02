<template>
  <view class="container">
    <!-- 页面头部 -->
    <PageHeader title="⏰ 当前时间" subtitle="精确到毫秒的时间工具" />

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 主时间显示卡片 -->
      <view class="card time-card">
        <view class="time-display" selectable user-select @click="copyMainTime">
          <view v-if="currentFormat === 'full'" class="time-display-full">
            <view class="time-date">{{ formattedDate }}</view>
            <view class="time-time">{{ formattedTime }}</view>
          </view>
          <view v-else>{{ formatMainTime() }}</view>
        </view>
        <view class="time-meta">
          <text class="meta-item">📅 {{ dayOfWeek }}</text>
          <text class="meta-divider">•</text>
          <text class="meta-item">🕐 第 {{ dayOfYear }} 天</text>
        </view>
        <view class="copy-hint" v-if="showCopyHint">✓ 已复制</view>
      </view>

      <!-- 记录按钮 -->
      <view class="record-button-wrapper">
        <button class="record-btn" @click="addRecord">📍 记录当前时间</button>
      </view>

      <!-- 格式选择器 -->
      <view class="card format-selector-card">
        <view class="card-title">时间格式</view>
        <view class="format-buttons">
          <wd-button v-for="fmt in formatOptions" :key="fmt.value"
            :type="currentFormat === fmt.value ? 'primary' : 'default'" size="small" @click="currentFormat = fmt.value">
            {{ fmt.label }}
          </wd-button>
        </view>
        <view class="format-display">
          <text class="format-label">当前格式示例：</text>
          <text class="format-value" selectable user-select @click="copyMainTime">
            {{ formatMainTime() }}
          </text>
        </view>
      </view>

      <!-- 详细信息卡片 -->
      <view class="card detail-card">
        <view class="card-title">详细信息</view>
        <view class="info-grid">
          <view class="info-item">
            <text class="info-label">时间戳</text>
            <text class="info-value" selectable user-select @click="copyTimestamp">
              {{ timestamp }}
            </text>
          </view>
          <view class="info-item">
            <text class="info-label">时区</text>
            <text class="info-value">{{ timezone }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">年份</text>
            <text class="info-value">{{ currentYear }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">季节</text>
            <text class="info-value">{{ season }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">月份</text>
            <text class="info-value">{{ currentMonth }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">周数</text>
            <text class="info-value">第 {{ weekNumber }} 周</text>
          </view>
        </view>
      </view>

      <!-- 快速复制卡片 -->
      <view class="card quick-copy-card">
        <view class="card-title">快速复制</view>
        <view class="button-grid">
          <wd-button block @click="copyTime('full')">📋 完整时间</wd-button>
          <wd-button block @click="copyTime('date')">📅 仅日期</wd-button>
          <wd-button block @click="copyTime('time')">🕐 仅时间</wd-button>
          <wd-button block @click="copyTime('timestamp')">🔢 时间戳</wd-button>
        </view>
      </view>

      <!-- 时间记录卡片 -->
      <view class="card record-card" v-if="records.length > 0">
        <view class="card-header-with-action">
          <view class="card-title">📌 时间记录</view>
          <wd-button size="small" type="danger" @click="clearRecords">清空</wd-button>
        </view>
        <view class="record-list">
          <view v-for="(record, index) in records" :key="index" class="record-item" @click="copyRecord(record)">
            <view class="record-index">{{ records.length - index }}</view>
            <view class="record-content">
              <text class="record-time">{{ record }}</text>
            </view>
            <view class="record-remove" @click.stop="removeRecord(index)">✕</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import PageHeader from '@/components/PageHeader.vue'

// 时间相关的 ref
const currentTime = ref(new Date())
let timer: number | null = null

// UI 状态
const currentFormat = ref<'full' | 'short' | '12h'>('full')
const showCopyHint = ref(false)
const records = ref<string[]>([])

// 格式选项
const formatOptions = [
  { label: '完整格式', value: 'full' as const },
  { label: '简洁格式', value: 'short' as const },
  { label: '12小时制', value: '12h' as const }
]

// 生命周期
onMounted(() => {
  updateTime()
  // 每10毫秒更新一次时间，显示毫秒级变化
  timer = setInterval(() => {
    updateTime()
  }, 10) as unknown as number
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
})

// 时间更新函数
const updateTime = () => {
  currentTime.value = new Date()
}

// 通用时间分量提取和格式化
const getTimeParts = (time: Date) => {
  return {
    year: time.getFullYear(),
    month: String(time.getMonth() + 1).padStart(2, '0'),
    day: String(time.getDate()).padStart(2, '0'),
    hours: String(time.getHours()).padStart(2, '0'),
    minutes: String(time.getMinutes()).padStart(2, '0'),
    seconds: String(time.getSeconds()).padStart(2, '0'),
    milliseconds: String(time.getMilliseconds()).padStart(3, '0')
  }
}

// 完整格式：YYYY-MM-DD HH:MM:SS.mmm
const formatFull = (time: Date): string => {
  const { year, month, day, hours, minutes, seconds, milliseconds } = getTimeParts(time)
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`
}

// 简洁格式：YYYY-MM-DD HH:MM:SS
const formatShort = (time: Date): string => {
  const { year, month, day, hours, minutes, seconds } = getTimeParts(time)
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 12小时制：MM-DD HH:MM:SS AM/PM
const format12Hour = (time: Date): string => {
  const { month, day, minutes, seconds } = getTimeParts(time)
  let hours = time.getHours()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  const hoursStr = String(hours).padStart(2, '0')
  return `${month}-${day} ${hoursStr}:${minutes}:${seconds} ${ampm}`
}

// 格式化主显示时间
const formatMainTime = (): string => {
  const time = currentTime.value

  switch (currentFormat.value) {
    case 'short':
      return formatShort(time)
    case '12h':
      return format12Hour(time)
    default:
      return formatFull(time)
  }
}

// 星期数组缓存
const DAYS_OF_WEEK = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

// 计算属性
const dayOfWeek = computed(() => {
  return DAYS_OF_WEEK[currentTime.value.getDay()]
})

const dayOfYear = computed(() => {
  const time = currentTime.value
  const start = new Date(time.getFullYear(), 0, 0)
  const diff = time.getTime() - start.getTime()
  return Math.floor(diff / 86400000)
})

const timestamp = computed(() => {
  return Math.floor(currentTime.value.getTime() / 1000).toString()
})

const timezone = computed(() => {
  const offset = -currentTime.value.getTimezoneOffset()
  const hours = Math.floor(Math.abs(offset) / 60)
  const minutes = Math.abs(offset) % 60
  const sign = offset >= 0 ? '+' : '-'
  return `UTC${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
})

const currentYear = computed(() => {
  return currentTime.value.getFullYear().toString()
})

const currentMonth = computed(() => {
  const month = currentTime.value.getMonth() + 1
  return `${month}月`
})

const season = computed(() => {
  const month = currentTime.value.getMonth() + 1
  if (month >= 3 && month <= 5) return '春季'
  if (month >= 6 && month <= 8) return '夏季'
  if (month >= 9 && month <= 11) return '秋季'
  return '冬季'
})

const weekNumber = computed(() => {
  const time = currentTime.value
  const first = new Date(time.getFullYear(), 0, 1)
  const days = Math.floor((time.getTime() - first.getTime()) / 86400000)
  return Math.ceil((days + first.getDay() + 1) / 7)
})

// 完整格式分行显示
const formattedDate = computed(() => {
  const time = currentTime.value
  const year = time.getFullYear()
  const month = String(time.getMonth() + 1).padStart(2, '0')
  const day = String(time.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

const formattedTime = computed(() => {
  const time = currentTime.value
  const hours = String(time.getHours()).padStart(2, '0')
  const minutes = String(time.getMinutes()).padStart(2, '0')
  const seconds = String(time.getSeconds()).padStart(2, '0')
  const milliseconds = String(time.getMilliseconds()).padStart(3, '0')
  return `${hours}:${minutes}:${seconds}.${milliseconds}`
})

// 复制函数
const copyMainTime = () => {
  copyToClipboard(formatMainTime())
}

const copyTimestamp = () => {
  copyToClipboard(timestamp.value)
}

const copyTime = (type: 'full' | 'date' | 'time' | 'timestamp') => {
  const time = currentTime.value
  let text = ''

  switch (type) {
    case 'full':
      text = formatFull(time)
      break
    case 'date': {
      const { year, month, day } = getTimeParts(time)
      text = `${year}-${month}-${day}`
      break
    }
    case 'time': {
      const { hours, minutes, seconds } = getTimeParts(time)
      text = `${hours}:${minutes}:${seconds}`
      break
    }
    case 'timestamp':
      text = timestamp.value
      break
  }

  copyToClipboard(text)
}

const copyToClipboard = (text: string) => {
  uni.setClipboardData({
    data: text,
    success: () => {
      showCopyHint.value = true
      uni.showToast({
        title: '已复制',
        duration: 1000
      })
      setTimeout(() => {
        showCopyHint.value = false
      }, 2000)
    },
    fail: () => {
      uni.showToast({
        title: '复制失败',
        icon: 'error',
        duration: 1000
      })
    }
  })
}

// 记录相关函数
const addRecord = () => {
  const fullTime = formatFull(currentTime.value)
  records.value.unshift(fullTime)
  uni.showToast({
    title: '已记录',
    duration: 800
  })
}

const removeRecord = (index: number) => {
  records.value.splice(index, 1)
}

const clearRecords = () => {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空所有记录吗？',
    success: res => {
      if (res.confirm) {
        records.value = []
        uni.showToast({
          title: '已清空',
          duration: 800
        })
      }
    }
  })
}

const copyRecord = (record: string) => {
  copyToClipboard(record)
}
</script>
<style scoped lang="scss">
@use '../../../styles/theme.scss' as *;

.container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 0 0 40rpx 0;
}

.card {
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
  margin-bottom: 20rpx;
}

.card-header-with-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;

  .card-title {
    margin-bottom: 0;
  }
}

/* ===== 时间卡片 ===== */
.time-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 320rpx;
  background: linear-gradient(135deg, #f5f7ff 0%, #e8eaf6 100%);
  position: relative;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.2);

  .time-display {
    font-size: 72rpx;
    font-weight: 700;
    color: #1a1a1a;
    font-family: 'Courier New', 'Monaco', 'Consolas', monospace;
    text-align: center;
    letter-spacing: 2rpx;
    word-break: keep-all;
    line-height: 1.3;
    padding: 20rpx 40rpx;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16rpx;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transform: translateZ(0);
    backface-visibility: hidden;
    will-change: auto;
  }

  .time-display-full {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    padding: 30rpx 50rpx;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20rpx;

    .time-date {
      font-size: 60rpx;
      font-weight: 700;
      letter-spacing: 2rpx;
    }

    .time-time {
      font-size: 56rpx;
      font-weight: 700;
      opacity: 1;
      letter-spacing: 2rpx;
    }
  }

  .time-meta {
    margin-top: 28rpx;
    font-size: 28rpx;
    color: rgba(44, 62, 80, 0.7);
    display: flex;
    align-items: center;
    gap: 24rpx;
    font-weight: 500;
    text-shadow: none;

    .meta-item {
      display: inline-block;
    }

    .meta-divider {
      color: rgba(44, 62, 80, 0.4);
      font-weight: 300;
    }
  }

  .copy-hint {
    position: absolute;
    bottom: 24rpx;
    right: 24rpx;
    padding: 12rpx 24rpx;
    background: rgba(93, 188, 76, 0.95);
    border-radius: 24rpx;
    font-size: 26rpx;
    color: white;
    font-weight: 700;
    animation: slideIn 0.3s ease;
    box-shadow: 0 4rpx 12rpx rgba(93, 188, 76, 0.4);
  }
}

/* ===== 记录按钮 ===== */
.record-button-wrapper {
  margin: 0 30rpx 30rpx;
}

.record-btn {
  width: 100%;
  padding: 24rpx;
  background: linear-gradient(135deg, #5dbc4c 0%, #4caf50 100%);
  color: white;
  border-radius: 12rpx;
  font-size: 30rpx;
  font-weight: bold;
  text-align: center;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(93, 188, 76, 0.3);
  transition: all 0.3s;

  &:active {
    transform: scale(0.95);
    box-shadow: 0 2rpx 8rpx rgba(93, 188, 76, 0.3);
  }
}

/* ===== 格式选择卡片 ===== */
.format-selector-card {
  .format-buttons {
    display: flex;
    gap: 20rpx;
    margin-bottom: 20rpx;

    :deep(.wd-button) {
      flex: 1;
      min-width: 150rpx;
      font-size: 28rpx !important;
      padding: 24rpx !important;
    }
  }

  .format-display {
    background: #f5f5f5;
    padding: 24rpx;
    border-radius: 12rpx;
    margin-top: 20rpx;

    .format-label {
      display: block;
      font-size: 24rpx;
      color: #999;
      margin-bottom: 12rpx;
    }

    .format-value {
      display: block;
      font-size: 28rpx;
      font-family: 'Courier New', monospace;
      color: #667eea;
      font-weight: 600;
      word-break: break-all;
      line-height: 1.4;

      &:active {
        opacity: 0.7;
      }
    }
  }
}

/* ===== 详细信息卡片 ===== */
.detail-card {
  .info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20rpx;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    padding: 20rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    transition: all 0.3s;

    &:active {
      background: #667eea;
      transform: scale(0.95);

      .info-label {
        color: rgba(255, 255, 255, 0.8);
      }

      .info-value {
        color: white;
      }
    }

    .info-label {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 8rpx;
      font-weight: 500;
    }

    .info-value {
      font-size: 28rpx;
      color: #333;
      font-weight: bold;
      font-family: 'Courier New', monospace;
      word-break: break-all;
      line-height: 1.3;
    }
  }
}

/* ===== 快速复制卡片 ===== */
.quick-copy-card {
  .button-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20rpx;

    :deep(.wd-button) {
      width: 100%;
      font-size: 28rpx !important;
      padding: 24rpx !important;
    }
  }
}

/* ===== 时间记录卡片 ===== */
/* ===== 时间记录卡片 ===== */
.record-card {
  .record-list {
    max-height: 400rpx;
    overflow-y: auto;

    .record-item {
      display: flex;
      align-items: center;
      gap: 20rpx;
      padding: 20rpx;
      margin-bottom: 16rpx;
      background: #f5f5f5;
      border-radius: 12rpx;
      transition: all 0.3s;
      border: 2rpx solid transparent;

      &:last-child {
        margin-bottom: 0;
      }

      &:active {
        background: #667eea;
        transform: scale(0.98);
        border-color: #667eea;

        .record-index {
          color: white;
          background: rgba(0, 0, 0, 0.2);
        }

        .record-time {
          color: white;
        }

        .record-remove {
          color: white;
          opacity: 0.8;
        }
      }

      .record-index {
        font-size: 24rpx;
        color: #999;
        font-weight: bold;
        min-width: 40rpx;
        text-align: center;
        padding: 8rpx;
        background: white;
        border-radius: 8rpx;
      }

      .record-content {
        flex: 1;
        min-width: 0;

        .record-time {
          font-size: 26rpx;
          color: #333;
          font-family: 'Courier New', monospace;
          font-weight: 500;
          word-break: break-all;
          line-height: 1.4;
        }
      }

      .record-remove {
        font-size: 32rpx;
        color: #ccc;
        padding: 8rpx;
        border-radius: 8rpx;
        transition: all 0.2s;

        &:active {
          color: #e74c3c;
          background: rgba(231, 76, 60, 0.15);
        }
      }
    }
  }

  .record-list::-webkit-scrollbar {
    width: 6rpx;
  }

  .record-list::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 3rpx;
  }

  .record-list::-webkit-scrollbar-thumb {
    background: #d0d0d0;
    border-radius: 3rpx;

    &:hover {
      background: #b0b0b0;
    }
  }
}

/* ===== 动画 ===== */
@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.8;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
