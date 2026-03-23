<template>
  <view class="container">
    <PageHeader title="🕰️ 时间胶囊" subtitle="把今天的时间、设备和短句封存到未来某天" />

    <view class="page-content">
      <view class="card">
        <view class="card-title">此刻快照</view>
        <view class="snapshot-grid">
          <view class="snapshot-item">
            <text class="snapshot-label">当前时间</text>
            <text class="snapshot-value">{{ snapshotPreview.timeText }}</text>
          </view>
          <view class="snapshot-item">
            <text class="snapshot-label">设备</text>
            <text class="snapshot-value">{{ snapshotPreview.deviceText }}</text>
          </view>
          <view class="snapshot-item">
            <text class="snapshot-label">网络</text>
            <text class="snapshot-value">{{ snapshotPreview.networkType }}</text>
          </view>
          <view class="snapshot-item">
            <text class="snapshot-label">随机结果</text>
            <text class="snapshot-value">{{ snapshotPreview.randomNumber }}</text>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-title">封存新的胶囊</view>
        <input class="text-input" v-model="capsuleTitle" placeholder="胶囊标题，例如：三月末的我" />
        <textarea class="textarea-input" v-model="capsuleNote" maxlength="200" placeholder="写下一句给未来自己的话"></textarea>
        <picker mode="date" :value="openDate" :start="minOpenDate" @change="handleDateChange">
          <view class="picker-field">开启日期：{{ openDate }}</view>
        </picker>
        <button class="primary-btn" @click="createCapsule">封存这一天</button>
      </view>

      <view class="card">
        <view class="card-title">已封存的胶囊</view>
        <view v-if="capsules.length === 0" class="empty-text">还没有封存任何胶囊，先留一句给未来的话吧。</view>
        <view v-for="capsule in capsules" :key="capsule.id" class="capsule-item">
          <view class="capsule-header">
            <view>
              <text class="capsule-title">{{ capsule.title }}</text>
              <text class="capsule-meta">开启于 {{ formatDate(capsule.openAt) }} · {{ isUnlocked(capsule) ? '可开启' : '未到时间' }}</text>
            </view>
            <view class="capsule-actions">
              <text class="capsule-link" @click="openCapsule(capsule)">{{ activeCapsuleId === capsule.id && isUnlocked(capsule) ? '关闭' : '打开' }}</text>
              <text class="capsule-link danger" @click="removeCapsule(capsule.id)">删除</text>
            </view>
          </view>
          <view v-if="activeCapsuleId === capsule.id && isUnlocked(capsule)" class="capsule-detail">
            <text class="detail-line">写给未来：{{ capsule.note || '这次没写备注，只留下了当时的状态。' }}</text>
            <text class="detail-line">封存时间：{{ formatDateTime(capsule.createdAt) }}</text>
            <text class="detail-line">设备信息：{{ capsule.snapshot.deviceText }}</text>
            <text class="detail-line">网络情况：{{ capsule.snapshot.networkType }}</text>
            <text class="detail-line">随机结果：{{ capsule.snapshot.randomNumber }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<route lang="json5">
{
  style: {
    navigationBarTitleText: '时间胶囊',
    enablePullDownRefresh: false
  }
}
</route>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: '时间胶囊 - DM工具箱',
    path: '/pkg-more/timeCapsule/timeCapsule'
  })
}
</script>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import dayjs from '@/utils/dayjs'
import { recordPersonaSignal } from '@/utils/toolUsage'

interface CapsuleSnapshot {
  timeText: string
  deviceText: string
  networkType: string
  randomNumber: number
}

interface TimeCapsuleRecord {
  id: string
  title: string
  note: string
  createdAt: number
  openAt: number
  snapshot: CapsuleSnapshot
}

const STORAGE_KEY = 'time_capsules_v1'

const capsuleTitle = ref('')
const capsuleNote = ref('')
const openDate = ref('')
const activeCapsuleId = ref('')
const capsules = ref<TimeCapsuleRecord[]>([])
const snapshotPreview = ref<CapsuleSnapshot>({
  timeText: '加载中...',
  deviceText: '加载中...',
  networkType: '加载中...',
  randomNumber: 0
})

const getDefaultOpenDate = () => {
  return dayjs().add(1, 'day').format('YYYY-MM-DD')
}

const minOpenDate = computed(() => getDefaultOpenDate())

const formatDate = (timestamp: number) => {
  return dayjs(timestamp).format('YYYY-MM-DD')
}

const formatDateTime = (timestamp: number) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm')
}

const loadCapsules = () => {
  try {
    const rawValue = uni.getStorageSync(STORAGE_KEY)

    if (!rawValue) {
      capsules.value = []
      return
    }

    const parsed = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue
    capsules.value = Array.isArray(parsed) ? parsed : []
  } catch (error) {
    capsules.value = []
  }
}

const saveCapsules = () => {
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(capsules.value))
  } catch (error) {
    console.error('保存时间胶囊失败:', error)
  }
}

const captureSnapshot = async () => {
  const timeText = dayjs().format('YYYY-MM-DD HH:mm')

  try {
    const [systemInfo, networkInfo] = await Promise.all([
      uni.getSystemInfo(),
      uni.getNetworkType()
    ])

    return {
      timeText,
      deviceText: `${systemInfo.platform || '未知平台'} · ${systemInfo.model || '未知设备'}`,
      networkType: networkInfo.networkType || 'unknown',
      randomNumber: Math.floor(Math.random() * 90) + 10
    }
  } catch (error) {
    return {
      timeText,
      deviceText: '未知设备',
      networkType: 'unknown',
      randomNumber: Math.floor(Math.random() * 90) + 10
    }
  }
}

const refreshSnapshotPreview = async () => {
  snapshotPreview.value = await captureSnapshot()
}

const isUnlocked = (capsule: TimeCapsuleRecord) => {
  return dayjs().valueOf() >= capsule.openAt
}

const handleDateChange = (event: { detail?: { value?: string } }) => {
  const nextOpenDate = event.detail?.value || minOpenDate.value
  const selectedOpenDate = dayjs(nextOpenDate)
  const minDate = dayjs(minOpenDate.value)

  openDate.value =
    !selectedOpenDate.isValid() || selectedOpenDate.isBefore(minDate, 'day')
      ? minOpenDate.value
      : selectedOpenDate.format('YYYY-MM-DD')
}

const createCapsule = async () => {
  if (!capsuleTitle.value.trim()) {
    uni.showToast({
      title: '请先写个标题',
      icon: 'none'
    })
    return
  }

  const selectedOpenDate = dayjs(openDate.value)
  const minDate = dayjs(minOpenDate.value)

  if (!selectedOpenDate.isValid() || selectedOpenDate.isBefore(minDate, 'day')) {
    openDate.value = minOpenDate.value
    uni.showToast({
      title: '开启日期至少要从明天开始',
      icon: 'none'
    })
    return
  }

  const snapshot = await captureSnapshot()
  const now = dayjs()
  const openAt = selectedOpenDate.hour(9).minute(0).second(0).millisecond(0).valueOf()

  if (openAt <= now.valueOf()) {
    openDate.value = minOpenDate.value
    uni.showToast({
      title: '请选择未来日期',
      icon: 'none'
    })
    return
  }

  const createdAt = now.valueOf()
  const capsule: TimeCapsuleRecord = {
    id: `${createdAt}`,
    title: capsuleTitle.value.trim(),
    note: capsuleNote.value.trim(),
    createdAt,
    openAt,
    snapshot
  }

  capsules.value.unshift(capsule)

  saveCapsules()
  activeCapsuleId.value = isUnlocked(capsule) ? capsule.id : ''
  capsuleTitle.value = ''
  capsuleNote.value = ''
  openDate.value = getDefaultOpenDate()
  snapshotPreview.value = await captureSnapshot()
  recordPersonaSignal('time-capsule-save')

  uni.showToast({
    title: '已封存',
    icon: 'success'
  })
}

const openCapsule = (capsule: TimeCapsuleRecord) => {
  if (!isUnlocked(capsule)) {
    uni.showToast({
      title: `还没到 ${formatDate(capsule.openAt)}`,
      icon: 'none'
    })
    return
  }

  activeCapsuleId.value = activeCapsuleId.value === capsule.id ? '' : capsule.id
}

const removeCapsule = (capsuleId: string) => {
  uni.showModal({
    title: '删除胶囊',
    content: '确认删除这枚时间胶囊吗？',
    success: result => {
      if (!result.confirm) {
        return
      }

      capsules.value = capsules.value.filter(item => item.id !== capsuleId)
      if (activeCapsuleId.value === capsuleId) {
        activeCapsuleId.value = ''
      }
      saveCapsules()
    }
  })
}

onMounted(async () => {
  openDate.value = minOpenDate.value
  loadCapsules()
  await refreshSnapshotPreview()
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

.snapshot-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
}

.snapshot-item {
  background: #f8fafc;
  border-radius: 18rpx;
  padding: 20rpx;
}

.snapshot-label {
  display: block;
  font-size: 24rpx;
  color: #64748b;
}

.snapshot-value {
  display: block;
  font-size: 26rpx;
  color: #0f172a;
  line-height: 1.6;
  margin-top: 12rpx;
}

.text-input,
.textarea-input,
.picker-field {
  width: 100%;
  box-sizing: border-box;
  border-radius: 18rpx;
  border: 2rpx solid #e5e7eb;
  background: #f9fafb;
  font-size: 28rpx;
  color: #111827;
  margin-bottom: 18rpx;
}

.text-input,
.picker-field {
  min-height: 96rpx;
  height: 96rpx;
  padding: 0 24rpx;
  line-height: 96rpx;
}

.textarea-input {
  min-height: 220rpx;
  padding: 24rpx;
  line-height: 1.7;
}

.primary-btn {
  width: 100%;
  border: none;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #0f766e 0%, #0ea5e9 100%);
  color: #fff;
  font-size: 30rpx;
  padding: 24rpx 0;
}

.empty-text {
  font-size: 25rpx;
  color: #64748b;
  line-height: 1.8;
}

.capsule-item {
  border: 2rpx solid #e2e8f0;
  border-radius: 22rpx;
  padding: 22rpx;
  margin-bottom: 18rpx;
}

.capsule-item:last-child {
  margin-bottom: 0;
}

.capsule-header {
  display: flex;
  justify-content: space-between;
  gap: 18rpx;
}

.capsule-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #0f172a;
}

.capsule-meta {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #64748b;
}

.capsule-actions {
  display: flex;
  gap: 18rpx;
  align-items: flex-start;
}

.capsule-link {
  font-size: 24rpx;
  color: #0ea5e9;
}

.capsule-link.danger {
  color: #dc2626;
}

.capsule-detail {
  margin-top: 18rpx;
  padding-top: 18rpx;
  border-top: 1px solid #e2e8f0;
}

.detail-line {
  display: block;
  font-size: 24rpx;
  line-height: 1.8;
  color: #334155;
}
</style>
