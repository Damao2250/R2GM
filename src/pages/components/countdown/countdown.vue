<template>
  <view class="container">
    <!-- 页面头部 -->
    <PageHeader title="📅 幸运日" subtitle="快速查看和计算重要日期" />

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 添加新纪念日 -->
      <view class="add-section">
        <view class="section-title">添加新幸运日</view>
        <view class="input-card">
          <view class="input-item">
            <input 
              v-model="newEvent.title" 
              type="text" 
              placeholder="幸运日名称 (如: 生日、纪念日)"
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

          <button class="add-btn" @click="addEvent" :disabled="!newEvent.title || !newEvent.date">
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
          <button class="quick-btn" @click="addQuickEvent('节日')">
            <text class="quick-icon">🎄</text>
            <text class="quick-text">节日</text>
          </button>
          <button class="quick-btn" @click="addQuickEvent('假期')">
            <text class="quick-icon">✈️</text>
            <text class="quick-text">假期</text>
          </button>
          <button class="quick-btn" @click="addQuickEvent('幸运日')">
            <text class="quick-icon"> 🎉</text>
            <text class="quick-text">幸运日</text>
          </button>
        </view>
      </view>

      <!-- 幸运日列表 -->
      <view class="events-section">
        <view class="section-title">{{ events.length > 0 ? '我的幸运日' : '暂无幸运日' }}</view>
        
        <view v-for="(event, index) in events" :key="index" class="event-card" :style="{ '--progress': event.progressPercent / 100 }">
          <!-- 删除按钮 -->
          <view class="delete-btn" @click="deleteEvent(index)">
            <text>✕</text>
          </view>
          
          <!-- 主内容区 -->
          <view class="event-main">

            <!-- 事件信息 -->
            <view class="event-info">
              <text class="event-title">{{ event.title }}<text class="event-date">（{{ event.date }}）</text>
              <!-- 编辑按钮 -->
              <!-- <text > -->
                <text class="edit-btn" @click="startEdit(index)">✎</text>
              <!-- </text> -->
              </text>
              
              <view class="event-details">
                <view v-if="event.daysUntil >= 0" class="detail-item">
                  <text class="detail-label">距今</text>
                  <text class="detail-value">{{ event.daysUntil }}天</text>
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
          <text class="tip-item">• 所有记录自动保存到本地</text>
        </view>
      </view>
    </view>

    <!-- 编辑对话框 -->
    <view v-if="editingIndex !== null" class="modal-overlay" @click="cancelEdit">
      <view class="modal-content" @click.stop>
        <view class="modal-title">编辑幸运日</view>
        
        <view class="modal-body">
          <view class="modal-input-item">
            <text class="modal-label">名称</text>
            <input 
              v-model="editingEvent.title" 
              type="text" 
              placeholder="幸运日名称"
              class="modal-input"
            />
          </view>

          <view class="modal-input-item">
            <text class="modal-label">日期</text>
            <picker mode="date" :value="editingEvent.date" @change="(e: any) => editingEvent.date = e.detail.value">
              <view class="modal-date-picker">
                <text>{{ editingEvent.date || '请选择日期' }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
        </view>

        <view class="modal-actions">
          <button class="modal-btn cancel-btn" @click="cancelEdit">取消</button>
          <button class="modal-btn confirm-btn" @click="saveEdit">保存</button>
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
    title: '幸运日/纪念日 - DM工具箱',
    path: '/pages/components/countdown/countdown'
  })
}
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import dayjs from 'dayjs'

interface Event {
  title: string
  date: string
  daysUntil: number
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

const editingIndex = ref<number | null>(null)
const editingEvent = ref({
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
  const targetDate = dayjs(dateString).startOf('day')
  const today = dayjs().startOf('day')
  return targetDate.diff(today, 'day')
}

/**
 * 计算年份差异
 */
const calculateYears = (dateString: string) => {
  const targetDate = dayjs(dateString).startOf('day')
  const today = dayjs().startOf('day')
  
  const isFuture = targetDate.isAfter(today)
  const [start, end] = isFuture ? [today, targetDate] : [targetDate, today]
  
  return end.diff(start, 'year')
}

/**
 * 计算月份差异（不包括整年的月份）
 */
const calculateMonths = (dateString: string) => {
  const targetDate = dayjs(dateString).startOf('day')
  const today = dayjs().startOf('day')
  
  const isFuture = targetDate.isAfter(today)
  const [start, end] = isFuture ? [today, targetDate] : [targetDate, today]
  
  // 计算总月数，然后减去整年的月数
  const totalMonths = end.diff(start, 'month')
  const years = end.diff(start, 'year')
  
  return totalMonths - (years * 12)
}

/**
 * 计算月内天数（不包括整月的天数）
 */
const calculateDaysInMonth = (dateString: string) => {
  const targetDate = dayjs(dateString).startOf('day')
  const today = dayjs().startOf('day')
  
  const isFuture = targetDate.isAfter(today)
  const [start, end] = isFuture ? [today, targetDate] : [targetDate, today]
  
  // 计算扣除整年整月后的剩余天数
  const years = end.diff(start, 'year')
  const months = end.diff(start.add(years, 'year'), 'month')
  const daysInMonths = end.diff(start.add(years, 'year').add(months, 'month'), 'day')
  
  return daysInMonths
}

/**
 * 计算进度百分比
 */
const calculateProgress = (dateString: string) => {
  const targetDate = dayjs(dateString).startOf('day')
  const today = dayjs().startOf('day')
  
  // 找到这一年或去年的纪念日
  let startDate = dayjs().year(today.year()).month(targetDate.month()).date(targetDate.date()).startOf('day')
  let endDate = startDate.add(1, 'year')
  
  if (today.isAfter(startDate)) {
    startDate = endDate
    endDate = startDate.add(1, 'year')
  }
  
  const totalDays = endDate.diff(startDate, 'day')
  const passedDays = today.diff(startDate, 'day')
  
  return Math.min(100, Math.max(0, (passedDays / totalDays) * 100))
}

/**
 * 更新所有事件的计算字段
 */
const updateAllEvents = () => {
  events.value = events.value.map(event => ({
    ...event,
    daysUntil: calculateDays(event.date),
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
  const title = newEvent.value.title.trim()
  
  if (!title) {
    uni.showToast({
      title: '请输入幸运日名称',
      icon: 'none'
    })
    return
  }
  
  if (title.length > 20) {
    uni.showToast({
      title: '名称最多20个字符',
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
    title,
    date: newEvent.value.date,
    daysUntil,
    yearsPassed: calculateYears(newEvent.value.date),
    monthsPassed: calculateMonths(newEvent.value.date),
    daysInMonth: calculateDaysInMonth(newEvent.value.date),
    progressPercent: calculateProgress(newEvent.value.date)
  })

  // 按daysUntil排序：未来的从近到远，过去的从远到近
  events.value.sort((a, b) => {
    if (a.daysUntil >= 0 && b.daysUntil >= 0) {
      return a.daysUntil - b.daysUntil
    } else if (a.daysUntil < 0 && b.daysUntil < 0) {
      return b.daysUntil - a.daysUntil
    } else {
      return a.daysUntil >= 0 ? -1 : 1
    }
  })

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
    title: `已填入"${title}"，请选择日期`,
    icon: 'none'
  })
}

/**
 * 开始编辑事件
 */
const startEdit = (index: number) => {
  editingIndex.value = index
  editingEvent.value = {
    title: events.value[index].title,
    date: events.value[index].date
  }
}

/**
 * 保存编辑
 */
const saveEdit = async () => {
  if (!editingEvent.value.title.trim()) {
    uni.showToast({
      title: '请输入幸运日名称',
      icon: 'none'
    })
    return
  }
  
  if (editingEvent.value.title.length > 20) {
    uni.showToast({
      title: '名称最多20个字符',
      icon: 'none'
    })
    return
  }
  
  if (!editingEvent.value.date) {
    uni.showToast({
      title: '请选择日期',
      icon: 'none'
    })
    return
  }

  if (editingIndex.value !== null) {
    const index = editingIndex.value
    events.value[index].title = editingEvent.value.title.trim()
    events.value[index].date = editingEvent.value.date
    events.value[index].daysUntil = calculateDays(editingEvent.value.date)
    events.value[index].yearsPassed = calculateYears(editingEvent.value.date)
    events.value[index].monthsPassed = calculateMonths(editingEvent.value.date)
    events.value[index].daysInMonth = calculateDaysInMonth(editingEvent.value.date)
    events.value[index].progressPercent = calculateProgress(editingEvent.value.date)

    // 编辑后重新排序
    events.value.sort((a, b) => {
      if (a.daysUntil >= 0 && b.daysUntil >= 0) {
        return a.daysUntil - b.daysUntil
      } else if (a.daysUntil < 0 && b.daysUntil < 0) {
        return b.daysUntil - a.daysUntil
      } else {
        return a.daysUntil >= 0 ? -1 : 1
      }
    })

    await saveEvents()
    
    uni.showToast({
      title: '已保存',
      duration: 1000
    })
    
    editingIndex.value = null
    editingEvent.value = { title: '', date: '' }
  }
}

/**
 * 取消编辑
 */
const cancelEdit = () => {
  editingIndex.value = null
  editingEvent.value = { title: '', date: '' }
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

  .btn-text {
    color: #fff;
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

.edit-btn {
  font-size: 24rpx;
  color: #667eea;
  margin-left: 20rpx;
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

/* 编辑对话框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  width: 90%;
  max-width: 600rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
  text-align: center;
}

.modal-body {
  margin-bottom: 28rpx;
}

.modal-input-item {
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.modal-label {
  display: block;
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
  margin-bottom: 10rpx;
}

.modal-input {
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

.modal-date-picker {
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

.modal-actions {
  display: flex;
  gap: 12rpx;
}

.modal-btn {
  flex: 1;
  height: 56rpx;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
</style>
