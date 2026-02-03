<template>
  <view class="container">
    <!-- 页面头部 -->
    <PageHeader title="📅 倒数日" subtitle="快速查看和计算重要日期" />

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 添加新纪念日 -->
      <view class="add-section">
        <view class="section-title">添加新倒数日</view>
        <view class="input-card">
          <view class="input-item">
            <input 
              v-model="newEvent.title" 
              type="text" 
              placeholder="倒数日名称 (如: 生日、纪念日)"
              class="input-field"
            />
          </view>

          <view class="input-item">
            <picker mode="date" @change="onDateChange">
              <view class="date-picker">
                <text>{{ newEvent.date || '请选择日期' }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>

          <button class="add-btn" @click="addEvent" :disabled="!newEvent.date">
            <text class="btn-icon">➕</text>
            <text class="btn-text">添加</text>
          </button>
        </view>
      </view>

      <!-- 快捷选项 -->
      <view class="quick-add-section">
        <view class="section-title">快捷添加</view>
        <view class="quick-buttons">
          <button class="quick-btn" @click="addQuickEvent('生日')">
            <text class="quick-icon">🎂</text>
            <text class="quick-text">生日</text>
          </button>
          <button class="quick-btn" @click="addQuickEvent('结婚纪念')">
            <text class="quick-icon">💒</text>
            <text class="quick-text">结婚纪念</text>
          </button>
          <button class="quick-btn" @click="addQuickEvent('相识纪念')">
            <text class="quick-icon">💕</text>
            <text class="quick-text">相识纪念</text>
          </button>
          <button class="quick-btn" @click="addQuickEvent('假期')">
            <text class="quick-icon">✈️</text>
            <text class="quick-text">假期</text>
          </button>
        </view>
      </view>

      <!-- 纪念日列表 -->
      <view class="events-section">
        <view class="section-title">{{ events.length > 0 ? '我的纪念日' : '暂无纪念日' }}</view>
        
        <view v-for="(event, index) in events" :key="index" class="event-card" :style="{ '--progress': event.progressPercent / 100 }">
          <!-- 删除按钮 -->
          <view class="delete-btn" @click="deleteEvent(index)">
            <text>✕</text>
          </view>

          <!-- 主内容区 -->
          <view class="event-main">

            <!-- 事件信息 -->
            <view class="event-info">
              <text class="event-title">{{ event.title }}<text class="event-date">（{{ event.date }}）</text></text>
              
              <view class="event-details">
                <view v-if="event.daysUntil >= 0" class="detail-item">
                  <text class="detail-label">距今</text>
                  <text class="detail-value">{{ Math.abs(event.daysPassed) }}天</text>
                </view>
                <view v-else class="detail-item">
                  <text class="detail-label">已过</text>
                  <text class="detail-value">{{ Math.abs(event.daysUntil) }}天</text>
                </view>
                <view class="detail-item">
                  <text class="detail-label">年/月/日</text>
                  <text class="detail-value">{{ event.yearsPassed }}年{{ event.monthsPassed }}月{{ event.daysInMonth }}天</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 清空全部 -->
      <view v-if="events.length > 0" class="clear-section">
        <button class="clear-btn" @click="clearAll">
          <text class="btn-icon">🗑️</text>
          <text class="btn-text">清空全部</text>
        </button>
      </view>

      <!-- 提示 -->
      <view class="tips-section">
        <view class="tips-title">💡 功能说明</view>
        <view class="tips-content">
          <text class="tip-item">• 快速计算距离目标日期还有多少天</text>
          <text class="tip-item">• 支持未来和过去的日期查看</text>
          <text class="tip-item">• 查询历史记录自动保存到本地</text>
          <text class="tip-item">• 长按可分享查询结果</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  name: 'Countdown',
  ...getShareConfig({
    title: '倒数日/纪念日 - DM工具箱',
    path: '/pages/components/countdown/countdown'
  })
}
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/PageHeader.vue'

interface Event {
  title: string
  date: string
  daysUntil: number
  daysPassed: number
  yearsPassed: number
  monthsPassed: number
  daysInMonth: number
  progressPercent: number
}

const events = ref<Event[]>([])

const newEvent = ref({
  title: '',
  date: ''
})

const STORAGE_KEY = 'countdown_events'

onMounted(() => {
  loadEvents()
})

/**
 * 从本地存储加载事件
 */
const loadEvents = async () => {
  try {
    const res = await uni.getStorage({
      key: STORAGE_KEY
    })
    events.value = res.data || []
    updateAllEvents()
  } catch (e) {
    // 首次使用，无数据
    events.value = []
  }
}

/**
 * 保存事件到本地存储
 */
const saveEvents = async () => {
  try {
    await uni.setStorage({
      key: STORAGE_KEY,
      data: events.value
    })
  } catch (e) {
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    })
  }
}

/**
 * 计算日期差异
 */
const calculateDays = (dateString: string) => {
  const targetDate = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  targetDate.setHours(0, 0, 0, 0)
  
  const diff = targetDate.getTime() - today.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * 计算年份差异
 */
const calculateYears = (dateString: string) => {
  const targetDate = new Date(dateString)
  const today = new Date()
  
  // 判断是未来还是过去
  const isFuture = targetDate > today
  
  let years = Math.abs(targetDate.getFullYear() - today.getFullYear())
  
  if (isFuture) {
    // 未来日期：如果今年还没到目标日期，年数减1
    if (today.getMonth() > targetDate.getMonth() || 
        (today.getMonth() === targetDate.getMonth() && today.getDate() > targetDate.getDate())) {
      years = Math.max(0, years - 1)
    }
  } else {
    // 过去日期：如果今年还没到纪念日，年数减1
    if (today.getMonth() < targetDate.getMonth() || 
        (today.getMonth() === targetDate.getMonth() && today.getDate() < targetDate.getDate())) {
      years = Math.max(0, years - 1)
    }
  }
  
  return years
}

/**
 * 计算月份差异（不包括整年的月份）
 */
const calculateMonths = (dateString: string) => {
  const targetDate = new Date(dateString)
  const today = new Date()
  
  // 判断是未来还是过去
  const isFuture = targetDate > today
  
  let [startDate, endDate] = isFuture ? [today, targetDate] : [targetDate, today]
  
  let months = endDate.getMonth() - startDate.getMonth()
  
  // 如果结束日期的日小于开始日期的日，月数减1
  if (endDate.getDate() < startDate.getDate()) {
    months -= 1
  }
  
  // 如果月数为负，加12
  if (months < 0) {
    months += 12
  }
  
  return months
}

/**
 * 计算月内天数（不包括整月的天数）
 */
const calculateDaysInMonth = (dateString: string) => {
  const targetDate = new Date(dateString)
  const today = new Date()
  
  // 判断是未来还是过去
  const isFuture = targetDate > today
  
  let [startDate, endDate] = isFuture ? [today, targetDate] : [targetDate, today]
  
  // 如果结束日期的日大于等于开始日期的日，直接相减
  if (endDate.getDate() >= startDate.getDate()) {
    return endDate.getDate() - startDate.getDate()
  } else {
    // 如果结束日期的日小于开始日期，需要从上个月借天数
    const lastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0)
    const daysInLastMonth = lastMonth.getDate()
    return daysInLastMonth - startDate.getDate() + endDate.getDate()
  }
}

/**
 * 计算进度百分比
 */
const calculateProgress = (dateString: string) => {
  const targetDate = new Date(dateString)
  const today = new Date()
  
  // 找到这一年或去年的纪念日
  let startDate = new Date(today.getFullYear(), targetDate.getMonth(), targetDate.getDate())
  let endDate = new Date(today.getFullYear() + 1, targetDate.getMonth(), targetDate.getDate())
  
  if (today > startDate) {
    startDate = endDate
    endDate = new Date(today.getFullYear() + 2, targetDate.getMonth(), targetDate.getDate())
  }
  
  const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  const passedDays = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  
  return Math.min(100, Math.max(0, (passedDays / totalDays) * 100))
}

/**
 * 更新所有事件的计算字段
 */
const updateAllEvents = () => {
  events.value = events.value.map(event => ({
    ...event,
    daysUntil: calculateDays(event.date),
    daysPassed: calculateDays(event.date),
    yearsPassed: calculateYears(event.date),
    monthsPassed: calculateMonths(event.date),
    daysInMonth: calculateDaysInMonth(event.date),
    progressPercent: calculateProgress(event.date)
  }))
}

/**
 * 日期选择器变化
 */
const onDateChange = (e: any) => {
  newEvent.value.date = e.detail.value
}

/**
 * 添加新事件
 */
const addEvent = async () => {
  if (!newEvent.value.title) {
    uni.showToast({
      title: '请输入倒数日名称',
      icon: 'none'
    })
    return
  }
  
  if (!newEvent.value.date) {
    uni.showToast({
      title: '请选择日期',
      icon: 'none'
    })
    return
  }

  const daysUntil = calculateDays(newEvent.value.date)
  
  events.value.push({
    title: newEvent.value.title,
    date: newEvent.value.date,
    daysUntil,
    daysPassed: daysUntil,
    yearsPassed: calculateYears(newEvent.value.date),
    monthsPassed: calculateMonths(newEvent.value.date),
    daysInMonth: calculateDaysInMonth(newEvent.value.date),
    progressPercent: calculateProgress(newEvent.value.date)
  })

  // 按daysUntil排序
  events.value.sort((a, b) => a.daysUntil - b.daysUntil)

  await saveEvents()

  uni.showToast({
    title: '已添加',
    duration: 1000
  })

  newEvent.value = { title: '', date: '' }
}

/**
 * 快捷添加
 */
const addQuickEvent = (title: string) => {
  newEvent.value.title = title
  // 打开日期选择器
  uni.showToast({
    title: '请先选择日期',
    icon: 'none'
  })
}

/**
 * 删除事件
 */
const deleteEvent = async (index: number) => {
  uni.showModal({
    title: '删除确认',
    content: `确定要删除"${events.value[index].title}"吗?`,
    success: async (res) => {
      if (res.confirm) {
        events.value.splice(index, 1)
        await saveEvents()
        uni.showToast({
          title: '已删除',
          duration: 1000
        })
      }
    }
  })
}

/**
 * 清空全部
 */
const clearAll = () => {
  uni.showModal({
    title: '清空确认',
    content: '确定要删除所有纪念日吗?',
    confirmText: '清空',
    confirmColor: '#d32f2f',
    success: async (res) => {
      if (res.confirm) {
        events.value = []
        await saveEvents()
        uni.showToast({
          title: '已清空',
          duration: 1000
        })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 0 0 40rpx 0;
}

.page-content {
  padding: 30rpx;
}

/* 段落标题 */
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  margin-left: 10rpx;
}

/* 添加区域 */
.add-section {
  margin-bottom: 30rpx;
}

.input-card {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.input-item {
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.input-label {
  display: block;
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
  margin-bottom: 12rpx;
}

.input-field {
  width: 100%;
  padding: 12rpx 14rpx;
  font-size: 28rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  background: #fafafa;
  height: 56rpx;

  &:focus {
    border-color: #667eea;
    background: white;
  }
}

.date-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 14rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  background: #fafafa;
  height: 56rpx;
  font-size: 28rpx;
  color: #333;
}

.picker-arrow {
  font-size: 20rpx;
  color: #999;
}

.add-btn {
  width: 100%;
  height: 80rpx;
  margin-top: 20rpx;
  border: none;
  border-radius: 12rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 30rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;

  &:disabled {
    opacity: 0.5;
  }
}

.btn-icon {
  font-size: 32rpx;
}

.btn-text {
  font-size: 28rpx;
}

/* 事件列表 */
.events-section {
  margin-bottom: 30rpx;

  .section-title {
    margin-bottom: 16rpx;
  }
}

.event-card {
  background: white;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.event-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transform: scaleX(var(--progress, 0.5));
  transform-origin: left;
}

.event-main {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.delete-btn {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #999;

  &:active {
    background: #efefef;
  }
}

.days-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 60rpx;
  padding: 12rpx;
  background: linear-gradient(135deg, #667eea15, #764ba215);
  border-radius: 12rpx;
}

.days-number {
  font-size: 32rpx;
  font-weight: bold;
  color: #667eea;
  line-height: 1;
}

.days-label {
  font-size: 20rpx;
  color: #999;
  margin-top: 4rpx;

  &.today {
    color: #ff6b6b;
    font-weight: 600;
  }
}

.event-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding-right: 10rpx;
}

.event-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.event-date {
  font-size: 24rpx;
  color: #999;
}

.event-details {
  display: flex;
  gap: 8rpx;
  margin-top: 8rpx;
}

.detail-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  min-height: 72rpx;
  padding: 12rpx 8rpx;
  background: #f5f7fa;
  border-radius: 8rpx;
  font-size: 22rpx;
}

.detail-label {
  color: #999;
  font-size: 20rpx;
}

.detail-value {
  color: #667eea;
  font-weight: 600;
  font-size: 24rpx;
}

.progress-bar {
  display: none;
}

/* 快捷按钮 */
.quick-add-section {
  margin-bottom: 30rpx;
}

.quick-buttons {
  display: flex;
  justify-content: flex-start;
  gap: 8rpx;
  flex-wrap: wrap;
}

.quick-btn {
  flex: 0 0 calc(25% - 6rpx);
  height: 160rpx;
  background: white;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  padding: 16rpx 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: all 0.2s ease;

  &:active {
    background: #f9f9f9;
    border-color: #667eea;
    box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.15);
  }
}

.quick-icon {
  font-size: 52rpx;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60rpx;
}

.quick-text {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
  max-width: 100%;
  word-break: break-word;
}

/* 清空区域 */
.clear-section {
  margin-bottom: 20rpx;
}

.clear-btn {
  width: 100%;
  height: 80rpx;
  border: none;
  border-radius: 12rpx;
  background: #f5f5f5;
  color: #999;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

/* 提示 */
.tips-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  border-left: 4rpx solid #667eea;
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
