<template>
  <view class="page-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-content">
        <text class="page-title">⏰ 当前时间</text>
        <wd-button size="small" type="primary" @click="addRecord">📍 记录</wd-button>
      </view>
    </view>

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

      <!-- 格式选择器 -->
      <view class="card format-selector-card">
        <view class="card-title">时间格式</view>
        <view class="format-buttons">
          <wd-button
            v-for="fmt in formatOptions"
            :key="fmt.value"
            :type="currentFormat === fmt.value ? 'primary' : 'default'"
            size="small"
            @click="currentFormat = fmt.value"
          >
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
    success: (res) => {
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

.page-container {
  min-height: 100vh;
  background-color: $app-bg-primary;
  padding-bottom: 10px;
}

.page-header {
  padding: $app-spacing-md 0;
  background: linear-gradient(135deg, #4a63d2 0%, #5b7ce8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border-bottom: none;
  position: relative;

  .header-content {
    display: flex;
    align-items: center;
    gap: $app-spacing-md;
    width: 100%;
    padding: 0 $app-spacing-md;
    justify-content: center;

    :deep(.wd-button) {
      min-width: 70px;
    }
  }

  .page-title {
    font-size: $app-font-size-lg;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: white;
    margin: 0;
  }
}

.page-content {
  padding: $app-spacing-sm $app-spacing-md;
}

.card {
  background-color: $app-bg-secondary;
  border-radius: 8px;
  padding: $app-spacing-xs;
  margin-bottom: $app-spacing-sm;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:active {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }
}

.card-title {
  font-size: $app-font-size-base;
  color: $app-text-primary;
  font-weight: 700;
  margin-bottom: $app-spacing-sm;
  padding-bottom: $app-spacing-xs;
  border-bottom: 2px solid $app-divider-color;
}

.card-header-with-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $app-spacing-sm;
  padding-bottom: $app-spacing-xs;
  border-bottom: 2px solid $app-divider-color;

  .card-title {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  :deep(.wd-button) {
    min-width: 60px;
  }
}

/* ===== 时间卡片 ===== */
.time-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 130px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-top: 3px solid #4a63d2;
  cursor: pointer;
  position: relative;

  .time-display {
    font-size: 24px;
    font-weight: 700;
    color: #4a63d2;
    font-family: 'Courier New', monospace;
    text-align: center;
    letter-spacing: 0.5px;
    word-break: break-all;
    animation: pulse 2s ease-in-out infinite;
    line-height: 1.2;
  }

  .time-display-full {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .time-date {
      font-size: 22px;
    }

    .time-time {
      font-size: 20px;
      opacity: 0.85;
    }
  }

  .time-meta {
    margin-top: 4px;
    font-size: $app-font-size-xs;
    color: #999;
    display: flex;
    align-items: center;
    gap: 4px;

    .meta-item {
      display: inline-block;
    }

    .meta-divider {
      color: #ddd;
    }
  }

  .copy-hint {
    margin-top: 4px;
    font-size: $app-font-size-xs;
    color: #5dbc4c;
    font-weight: 600;
    animation: slideIn 0.3s ease;
  }
}

/* ===== 格式选择卡片 ===== */
.format-selector-card {
  border-top: 3px solid #17a2b8;

  .format-buttons {
    display: flex;
    gap: 6px;
    margin-bottom: $app-spacing-sm;
    flex-wrap: wrap;

    :deep(.wd-button) {
      flex: 1;
      min-width: 75px;
      font-size: 12px !important;
    }
  }

  .format-display {
    background-color: $app-bg-primary;
    padding: 6px 8px;
    border-radius: 6px;
    border-left: 2px solid #17a2b8;

    .format-label {
      display: block;
      font-size: 11px;
      color: #999;
      margin-bottom: 2px;
    }

    .format-value {
      display: block;
      font-size: 12px;
      font-family: 'Courier New', monospace;
      color: #4a63d2;
      word-break: break-all;
      cursor: pointer;
      padding: 2px 0;
      border-bottom: 1px dashed #ddd;
      padding-bottom: 2px;
    }
  }
}

/* ===== 详细信息卡片 ===== */
.detail-card {
  border-top: 3px solid #ffc107;

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 4px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    border-radius: 6px;
    border-left: 2px solid #ffc107;
    padding: 10px 0 !important;

    .info-label {
      font-size: 10px;
      color: #999;
      margin-bottom: 1px;
      font-weight: 600;
      line-height: 1.2;
    }

    .info-value {
      font-size: 12px;
      color: #4a63d2;
      font-weight: 600;
      font-family: 'Courier New', monospace;
      cursor: pointer;
      padding: 2px 4px;
      background-color: $app-bg-primary;
      border-radius: 3px;
      word-break: break-all;
      line-height: 1.3;

      &:active {
        opacity: 0.7;
      }
    }
  }
}

/* ===== 快速复制卡片 ===== */
.quick-copy-card {
  border-top: 3px solid #e83e8c;

  .button-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;

    :deep(.wd-button) {
      width: 100%;
      font-size: 12px !important;
    }
  }
}

/* ===== 时间记录卡片 ===== */
.record-card {
  border-top: 3px solid #6c757d;

  .record-list {
    max-height: 300px;
    overflow-y: auto;

    .record-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      margin-bottom: 4px;
      background-color: $app-bg-primary;
      border-radius: 4px;
      border-left: 2px solid #6c757d;
      cursor: pointer;
      transition: all 0.2s ease;

      &:last-child {
        margin-bottom: 0;
      }

      &:active {
        opacity: 0.8;
        transform: scale(0.98);
      }

      .record-index {
        font-size: 11px;
        color: #999;
        font-weight: 600;
        min-width: 20px;
        text-align: center;
      }

      .record-content {
        flex: 1;
        min-width: 0;

        .record-time {
          font-size: 11px;
          color: #4a63d2;
          font-family: 'Courier New', monospace;
          word-break: break-all;
          display: block;
          line-height: 1.3;
        }
      }

      .record-remove {
        font-size: 14px;
        color: #ccc;
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 2px;
        transition: all 0.2s;

        &:active {
          color: #e74c3c;
          background-color: rgba(231, 76, 60, 0.1);
        }
      }
    }
  }

  // 美化滚动条
  ::-webkit-scrollbar {
    width: 3px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: #d0d0d0;
    border-radius: 2px;

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
