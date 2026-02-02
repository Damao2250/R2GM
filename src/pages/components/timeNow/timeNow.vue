<template>
  <view class="page-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="page-title">当前时间</text>
    </view>

    <!-- 页面内容 -->
    <view class="page-content">
      <view class="card time-card">
        <view class="time-display" selectable user-select>
          {{ timeNow }}
        </view>
        <view class="time-info">
          <text>实时更新中...</text>
        </view>
      </view>

      <!-- 时间格式说明 -->
      <view class="card format-card">
        <view class="card-title">时间格式</view>
        <view class="format-list">
          <view class="format-item">
            <text class="format-label">格式：</text>
            <text class="format-value">YYYY-MM-DD HH:MM:SS.mmm</text>
          </view>
          <view class="format-item">
            <text class="format-label">示例：</text>
            <text class="format-value">2026-01-29 14:30:45.123</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const timeNow = ref('')
let timer: number | null = null

onMounted(() => {
  getTimeNow()
  // 每10毫秒更新一次时间
  timer = setInterval(() => {
    getTimeNow()
  }, 10) as unknown as number
})

onBeforeUnmount(() => {
  // 组件销毁前清除定时器
  if (timer) {
    clearInterval(timer)
  }
})

const getTimeNow = () => {
  const now = new Date()
  timeNow.value = formatTime(now)
}

const formatTime = (time: Date): string => {
  const year = time.getFullYear()
  const month = String(time.getMonth() + 1).padStart(2, '0')
  const day = String(time.getDate()).padStart(2, '0')
  const hours = String(time.getHours()).padStart(2, '0')
  const minutes = String(time.getMinutes()).padStart(2, '0')
  const seconds = String(time.getSeconds()).padStart(2, '0')
  const milliseconds = String(time.getMilliseconds()).padStart(3, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`
}
</script>
<style scoped lang="scss">
@use '../../../styles/theme.scss' as *;

.page-container {
  min-height: 100vh;
  background-color: $app-bg-primary;
}

.page-header {
  padding: $app-spacing-lg;
  background-color: #f5f6fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $app-text-primary;
  border-bottom: 1px solid #e5e5e5;
  position: relative;
  /* #ifdef H5 */
  background: linear-gradient(180deg, #ffffff 0%, #f5f6fa 100%);
  /* #endif */

  .page-title {
    font-size: $app-font-size-2xl;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: #4a63d2;
    margin: 0;
  }
}

.page-content {
  padding: $app-spacing-md;
}

.card {
  background-color: $app-bg-secondary;
  border-radius: $app-border-radius-md;
  padding: $app-spacing-lg;
  margin-bottom: $app-spacing-lg;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.time-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;

  .time-display {
    font-size: 28px;
    font-weight: 700;
    color: $app-primary-color;
    font-family: 'Courier New', monospace;
    text-align: center;
    letter-spacing: 1px;
  }

  .time-info {
    margin-top: $app-spacing-lg;
    font-size: $app-font-size-sm;
    color: $app-text-tertiary;
  }
}

.card-title {
  font-size: $app-font-size-lg;
  color: $app-text-primary;
  font-weight: 600;
  margin-bottom: $app-spacing-lg;
  padding-bottom: $app-spacing-md;
  border-bottom: 2px solid $app-divider-color;
}

.format-card {
  .format-list {
    .format-item {
      display: flex;
      flex-direction: column;
      padding: $app-spacing-lg 0;
      border-bottom: 1px solid $app-divider-color;

      &:last-child {
        border-bottom: none;
      }

      .format-label {
        color: $app-text-secondary;
        font-size: $app-font-size-sm;
        font-weight: 500;
        margin-bottom: $app-spacing-sm;
      }

      .format-value {
        color: $app-primary-color;
        font-size: $app-font-size-base;
        font-family: 'Courier New', monospace;
        padding: $app-spacing-sm;
        background-color: $app-bg-primary;
        border-radius: $app-border-radius-sm;
      }
    }
  }
}
</style>
