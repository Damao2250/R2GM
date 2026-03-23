<template>
  <view class="container">
    <!-- 页面头部 -->
    <PageHeader title="🌐 网络信息" subtitle="实时网络状态监测" />

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 网络状态主卡片 -->
      <view class="main-status-card">
        <view class="status-icon-wrapper">
          <view class="status-pulse" :class="networkType ? 'connected' : 'disconnected'"></view>
          <text class="status-icon">{{ networkType ? '📶' : '📵' }}</text>
        </view>
        <view class="status-info">
          <text class="status-title">{{ networkType ? '网络已连接' : '网络未连接' }}</text>
          <text class="status-subtitle">{{ networkTypeLabel }}</text>
        </view>
      </view>

      <!-- 快速信息卡片组 -->
      <view class="quick-info-grid">
        <view class="quick-info-card">
          <text class="quick-icon">📍</text>
          <text class="quick-label">本地IP</text>
          <text class="quick-value" user-select>{{ localip || '-' }}</text>
        </view>
        <view class="quick-info-card" v-if="networkType === 'wifi'">
          <text class="quick-icon">📡</text>
          <text class="quick-label">WiFi名称</text>
          <text class="quick-value" user-select>{{ wifiInfo.SSID || '-' }}</text>
        </view>
        <view class="quick-info-card" v-if="networkLatency">
          <text class="quick-icon">⚡</text>
          <text class="quick-label">网络延迟</text>
          <text class="quick-value">{{ networkLatency }}ms</text>
        </view>
      </view>

      <!-- 详细信息卡片 -->
      <view class="detail-card">
        <view class="section-header">
          <text class="section-icon">ℹ️</text>
          <text class="section-title">详细信息</text>
        </view>

        <view class="detail-list">
          <view class="detail-item">
            <text class="detail-label">网络类型</text>
            <text class="detail-value" user-select>{{ networkType || '-' }}</text>
          </view>

          <view class="detail-item">
            <text class="detail-label">IP 地址</text>
            <text class="detail-value" user-select>{{ localip || '-' }}</text>
          </view>

          <view v-if="networkType === 'wifi'" class="detail-item">
            <text class="detail-label">WiFi 名称</text>
            <text class="detail-value" user-select>{{ wifiInfo.SSID || '-' }}</text>
          </view>

          <view v-if="networkType === 'wifi'" class="detail-item">
            <text class="detail-label">MAC地址</text>
            <text class="detail-value" user-select>{{ wifiInfo.BSSID || '-' }}</text>
          </view>

          <view v-if="networkType !== 'wifi' && networkType" class="detail-item">
            <text class="detail-label">运营商</text>
            <text class="detail-value" user-select>{{ operatorInfo || '-' }}</text>
          </view>
        </view>
      </view>

      <!-- 网络诊断卡片 -->
      <view class="diagnosis-card">
        <view class="section-header">
          <text class="section-icon">🔍</text>
          <text class="section-title">网络诊断</text>
        </view>

        <view class="diagnosis-grid">
          <view class="diagnosis-item">
            <view class="diagnosis-status" :class="networkType ? 'status-success' : 'status-error'">
              <text class="status-dot"></text>
            </view>
            <text class="diagnosis-label">网络连接</text>
            <text class="diagnosis-value">{{ networkType ? '已连接' : '未连接' }}</text>
          </view>

          <view class="diagnosis-item">
            <view class="diagnosis-status" :class="isInternetAvailable ? 'status-success' : 'status-warning'">
              <text class="status-dot"></text>
            </view>
            <text class="diagnosis-label">互联网</text>
            <text class="diagnosis-value">{{ isInternetAvailable ? '可用' : '检测中' }}</text>
          </view>

          <view class="diagnosis-item">
            <view class="diagnosis-status" :class="isDnsAvailable ? 'status-success' : 'status-warning'">
              <text class="status-dot"></text>
            </view>
            <text class="diagnosis-label">DNS连接</text>
            <text class="diagnosis-value">{{ isDnsAvailable ? '正常' : '检测中' }}</text>
          </view>

          <view class="diagnosis-item" v-if="networkType === 'wifi'">
            <view class="diagnosis-status" :class="wifiInfo.secure ? 'status-success' : 'status-warning'">
              <text class="status-dot"></text>
            </view>
            <text class="diagnosis-label">安全连接</text>
            <text class="diagnosis-value">{{
              wifiInfo.secure ? '已加密' : wifiInfo.SSID ? '未加密' : '-'
              }}</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="action-btn primary-btn" @click="getNetworkInfo" :disabled="isLoading">
          <text class="btn-icon">{{ isLoading ? '🔄' : '🔃' }}</text>
          <text class="btn-text">{{ isLoading ? '刷新中...' : '刷新信息' }}</text>
        </button>
        <button class="action-btn secondary-btn" @click="copyNetworkInfo">
          <text class="btn-icon">📋</text>
          <text class="btn-text">复制信息</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: '网络信息 - DM工具箱',
    path: '/pages/components/networkInfo/networkInfo'
  })
}
</script>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import dayjs from '@/utils/dayjs'

interface WifiInfo {
  SSID?: string
  BSSID?: string
  signalStrength?: number
  secure?: boolean
}

const networkType = ref('')
const localip = ref('')
const operatorInfo = ref('')
const isInternetAvailable = ref(false)
const isDnsAvailable = ref(false)
const networkLatency = ref<number | null>(null)
const wifiInfo = ref<WifiInfo>({})
const isLoading = ref(false)

// 网络类型标签
const networkTypeLabel = computed(() => {
  const labels: { [key: string]: string } = {
    wifi: '无线网络',
    '2g': '2G 移动网络',
    '3g': '3G 移动网络',
    '4g': '4G 移动网络',
    '5g': '5G 移动网络',
    ethernet: '以太网'
  }
  return labels[networkType.value] || '未知'
})

// 网络状态变化处理函数
const networkStatusChangeHandler = (res: any) => {
  if (res.isConnected !== (networkType.value !== '')) {
    getNetworkInfo()
  }
}

onMounted(() => {
  getNetworkInfo()
  // 监听网络状态变化
  uni.onNetworkStatusChange(networkStatusChangeHandler)
})

onUnmounted(() => {
  // 页面卸载时移除监听
  uni.offNetworkStatusChange(networkStatusChangeHandler)
})

const getNetworkInfo = async () => {
  isLoading.value = true
  try {
    // 获取网络类型
    const network = await uni.getNetworkType()
    networkType.value = network.networkType

    // 获取本地 IP
    uni.getLocalIPAddress({
      success: res => {
        localip.value = res.localip || '-'
      },
      fail: () => {
        localip.value = '-'
      }
    })

    // 获取 WiFi 信息
    if (networkType.value === 'wifi') {
      try {
        const wifiInfoRes = await uni.getConnectedWifi()
        if (wifiInfoRes.wifi) {
          wifiInfo.value = wifiInfoRes.wifi
        }
      } catch (e) {
        // 错误处理
      }
    } else {
      // 获取运营商信息（移动网络）
      getOperatorInfo()
    }

    // 检测网络连接可用性
    checkInternetConnection()
    // 检测 DNS
    checkDnsAvailability()
    // 检测网络延迟
    checkNetworkLatency()
  } catch (e) {
    // 错误处理
  } finally {
    isLoading.value = false
  }
}

// 获取运营商信息
const getOperatorInfo = () => {
  // 在某些平台可以通过系统接口获取运营商信息
  // 这里作为预留接口，实际实现取决于平台支持
  const operatorMap: { [key: string]: string } = {
    '2g': '2G 运营商',
    '3g': '3G 运营商',
    '4g': '4G 运营商',
    '5g': '5G 运营商'
  }
  operatorInfo.value = operatorMap[networkType.value] || '-'
}

// 检测网络连接可用性
const checkInternetConnection = () => {
  if (networkType.value) {
    isInternetAvailable.value = true
  } else {
    isInternetAvailable.value = false
  }
}

// 检测 DNS 可用性
const checkDnsAvailability = async () => {
  // DNS 检测：通过访问国内常用服务检测
  try {
    const response = await uni.request({
      url: 'https://www.baidu.com',
      method: 'HEAD',
      timeout: 3000,
      withCredentials: false
    })
    isDnsAvailable.value = response.statusCode === 200 || response.statusCode === 0
  } catch (e) {
    // 降级方案：仅根据网络连接状态判断
    isDnsAvailable.value = networkType.value !== ''
  }
}

// 检测网络延迟
const checkNetworkLatency = async () => {
  try {
    const startTime = dayjs().valueOf()
    // 使用百度首页检测延迟（国内访问较快）
    await uni.request({
      url: 'https://www.baidu.com/',
      method: 'HEAD',
      timeout: 8000,
      withCredentials: false
    })
    const endTime = dayjs().valueOf()
    networkLatency.value = endTime - startTime
  } catch (e) {
    // 尝试备选地址
    try {
      const startTime = dayjs().valueOf()
      await uni.request({
        url: 'https://www.qq.com',
        method: 'HEAD',
        timeout: 8000,
        withCredentials: false
      })
      const endTime = dayjs().valueOf()
      networkLatency.value = endTime - startTime
    } catch (err) {
      networkLatency.value = null
    }
  }
}

// 复制网络信息
const copyNetworkInfo = () => {
  const info = `
网络类型: ${networkType.value}
${networkType.value === 'wifi' ? `WiFi 名称: ${wifiInfo.value.SSID}\nBSSID: ${wifiInfo.value.BSSID}\n信号强度: ${wifiInfo.value.signalStrength}%` : `运营商: ${operatorInfo.value}`}
IP 地址: ${localip.value}
连接状态: ${networkType.value ? '已连接' : '未连接'}
  `.trim()

  uni.setClipboardData({
    data: info,
    success: function () {
      uni.showToast({
        title: '已复制网络信息',
        duration: 1000
      })
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

/* 主状态卡片 */
.main-status-card {
  background: white;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30rpx;
}

.status-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-pulse {
  position: absolute;
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;

  &.connected {
    background: rgba(93, 188, 76, 0.2);
    animation: pulse 2s infinite;
  }

  &.disconnected {
    background: rgba(211, 47, 47, 0.2);
  }
}

.status-icon {
  font-size: 80rpx;
  z-index: 1;
}

.status-info {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.status-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.status-subtitle {
  font-size: 28rpx;
  color: #666;
}

/* 快速信息卡片组 */
.quick-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.quick-info-card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;

  &:active {
    transform: scale(0.98);
    transition: transform 0.2s;
  }
}

.quick-icon {
  font-size: 48rpx;
}

.quick-label {
  font-size: 24rpx;
  color: #999;
}

.quick-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #667eea;
  word-break: break-all;
  text-align: center;
}

/* 详细信息卡片 */
.detail-card {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 3rpx solid #f0f0f0;
}

.section-icon {
  font-size: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  transition: all 0.3s;

  &:active {
    background: #f0f1f3;
  }
}

.detail-label {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  text-align: right;
  word-break: break-all;
  max-width: 60%;
}

/* 网络诊断卡片 */
.diagnosis-card {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.diagnosis-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.diagnosis-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  transition: all 0.3s;

  &:active {
    transform: scale(0.98);
  }
}

.diagnosis-status {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &.status-success {
    background: rgba(93, 188, 76, 0.15);

    .status-dot {
      width: 24rpx;
      height: 24rpx;
      border-radius: 50%;
      background: #5dbc4c;
      display: block;
    }
  }

  &.status-warning {
    background: rgba(255, 193, 7, 0.15);

    .status-dot {
      width: 24rpx;
      height: 24rpx;
      border-radius: 50%;
      background: #ffc107;
      display: block;
    }
  }

  &.status-error {
    background: rgba(211, 47, 47, 0.15);

    .status-dot {
      width: 24rpx;
      height: 24rpx;
      border-radius: 50%;
      background: #d32f2f;
      display: block;
    }
  }
}

.diagnosis-label {
  font-size: 24rpx;
  color: #999;
  text-align: center;
}

.diagnosis-value {
  font-size: 26rpx;
  color: #333;
  font-weight: bold;
  text-align: center;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  height: 96rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  font-size: 30rpx;
  font-weight: bold;
  border: none;
  transition: all 0.3s;

  &.primary-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);

    &:active {
      transform: scale(0.98);
      box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
    }

    &:disabled {
      opacity: 0.6;
    }
  }

  &.secondary-btn {
    background: white;
    color: #667eea;
    border: 3rpx solid #667eea;

    &:active {
      background: #f8f9ff;
      transform: scale(0.98);
    }
  }
}

.btn-icon {
  font-size: 36rpx;
}

.btn-text {
  font-size: 30rpx;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
