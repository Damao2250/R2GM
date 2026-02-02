<template>
  <view class="page-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="page-title">网络信息</text>
    </view>

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 网络状态卡片 -->
      <view class="card status-card">
        <view class="status-item">
          <view class="status-indicator" :class="networkType ? 'connected' : 'disconnected'"></view>
          <view class="status-text">
            {{ networkType ? '已连接' : '未连接' }}
          </view>
          <view class="status-subtext">
            {{ networkTypeLabel }}
          </view>
        </view>
      </view>

      <!-- 网络基本信息 -->
      <view class="card">
        <view class="card-title-header" @click="toggleBasicInfo">
          <text class="card-title">网络基本信息</text>
          <text class="expand-icon" :class="showBasicInfo ? 'expanded' : ''">›</text>
        </view>
        <view v-show="showBasicInfo" class="info-list">
          <view class="info-item">
            <view class="info-left">
              <text class="label">网络类型</text>
              <text class="desc">network type</text>
            </view>
            <text class="value" user-select>{{ networkType || '-' }}</text>
          </view>

          <view class="info-item">
            <view class="info-left">
              <text class="label">IP 地址</text>
              <text class="desc">local ip address</text>
            </view>
            <text class="value" user-select>{{ localip || '-' }}</text>
          </view>

          <view v-if="networkType === 'wifi'" class="info-item">
            <view class="info-left">
              <text class="label">WiFi 名称</text>
              <text class="desc">wifi ssid</text>
            </view>
            <text class="value" user-select>{{ wifiInfo.SSID || '-' }}</text>
          </view>

          <view v-if="networkType === 'wifi'" class="info-item">
            <view class="info-left">
              <text class="label">BSSID</text>
              <text class="desc">mac address</text>
            </view>
            <text class="value" user-select>{{ wifiInfo.BSSID || '-' }}</text>
          </view>

          <view v-if="networkType !== 'wifi' && networkType" class="info-item">
            <view class="info-left">
              <text class="label">运营商信息</text>
              <text class="desc">carrier info</text>
            </view>
            <text class="value" user-select>{{ operatorInfo || '-' }}</text>
          </view>
        </view>
      </view>

      <!-- 网络诊断 -->
      <view class="card">
        <view class="card-title-header" @click="toggleDiagnosis">
          <text class="card-title">网络诊断</text>
          <text class="expand-icon" :class="showDiagnosis ? 'expanded' : ''">›</text>
        </view>
        <view v-show="showDiagnosis" class="diagnosis-list">
          <view class="diagnosis-item">
            <view class="diagnosis-left">
              <text class="label">网络连接</text>
              <text class="status-badge" :class="networkType ? 'success' : 'danger'">
                {{ networkType ? '已连接' : '未连接' }}
              </text>
            </view>
          </view>

          <view class="diagnosis-item">
            <view class="diagnosis-left">
              <text class="label">互联网连接</text>
              <text class="status-badge" :class="isInternetAvailable ? 'success' : 'warning'">
                {{ isInternetAvailable ? '可用' : '检测中...' }}
              </text>
            </view>
          </view>

          <view class="diagnosis-item">
            <view class="diagnosis-left">
              <text class="label">安全连接</text>
              <text class="status-badge" :class="wifiInfo.secure ? 'success' : 'warning'">
                {{ wifiInfo.secure ? '已加密' : wifiInfo.SSID ? '未加密' : '-' }}
              </text>
            </view>
          </view>

          <view class="diagnosis-item">
            <view class="diagnosis-left">
              <text class="label">DNS 连接</text>
              <text class="status-badge" :class="isDnsAvailable ? 'success' : 'warning'">
                {{ isDnsAvailable ? '正常' : '检测中...' }}
              </text>
            </view>
          </view>

          <view class="diagnosis-item">
            <view class="diagnosis-left">
              <text class="label">网络延迟</text>
              <text class="status-badge" :class="networkLatency ? 'success' : 'warning'">
                {{ networkLatency ? `${networkLatency}ms` : '检测中...' }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="button-group">
        <wd-button block type="primary" @click="getNetworkInfo" :loading="isLoading">
          <text :class="isLoading ? 'loading-text' : ''">{{ isLoading ? '刷新中...' : '刷新网络信息' }}</text>
        </wd-button>
        <wd-button block type="info" @click="copyNetworkInfo">
          复制信息
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

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
const showBasicInfo = ref(true)
const showDiagnosis = ref(true)

// 网络类型标签
const networkTypeLabel = computed(() => {
  const labels: { [key: string]: string } = {
    'wifi': '无线网络',
    '2g': '2G 移动网络',
    '3g': '3G 移动网络',
    '4g': '4G 移动网络',
    '5g': '5G 移动网络',
    'ethernet': '以太网'
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

// 展开/收起基本信息
const toggleBasicInfo = () => {
  showBasicInfo.value = !showBasicInfo.value
}

// 展开/收起诊断
const toggleDiagnosis = () => {
  showDiagnosis.value = !showDiagnosis.value
}

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
    const startTime = Date.now()
    // 使用百度首页检测延迟（国内访问较快）
    await uni.request({
      url: 'https://www.baidu.com/',
      method: 'HEAD',
      timeout: 8000,
      withCredentials: false
    })
    const endTime = Date.now()
    networkLatency.value = endTime - startTime
  } catch (e) {
    // 尝试备选地址
    try {
      const startTime = Date.now()
      await uni.request({
        url: 'https://www.qq.com',
        method: 'HEAD',
        timeout: 8000,
        withCredentials: false
      })
      const endTime = Date.now()
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
@use '../../../styles/theme.scss' as *;

.page-container {
  min-height: 100vh;
  background-color: $app-bg-primary;
  padding-bottom: 20px;
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

  .card-title {
    font-size: $app-font-size-base;
    color: $app-text-primary;
    font-weight: 600;
    margin-bottom: $app-spacing-md;
    padding-bottom: $app-spacing-sm;
    border-bottom: 2px solid #4a63d2;
  }

  .card-title-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding-bottom: $app-spacing-sm;
    border-bottom: 2px solid #4a63d2;
    margin-bottom: $app-spacing-md;

    .card-title {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
      flex: 1;
    }

    .expand-icon {
      font-size: 24px;
      color: #4a63d2;
      transition: transform 0.3s ease;
      margin-left: $app-spacing-md;

      &.expanded {
        transform: rotate(90deg);
      }
    }
  }
}

// 网络状态卡片
.status-card {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  background: linear-gradient(135deg, #4a63d2 0%, #5b7ce8 100%);

  .status-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $app-spacing-md;

    .status-indicator {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      /* #ifndef MP */
      animation: pulse 2s infinite;
      /* #endif */

      &.connected {
        background-color: #5dbc4c;
      }

      &.disconnected {
        background-color: #d32f2f;
      }
    }

    .status-text {
      font-size: $app-font-size-lg;
      font-weight: 600;
      color: white;
    }

    .status-subtext {
      font-size: $app-font-size-sm;
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

// 信息列表
.info-list {
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $app-spacing-md 0;
    border-bottom: 1px solid $app-divider-color;

    &:last-child {
      border-bottom: none;
    }

    .info-left {
      display: flex;
      flex-direction: column;
      gap: $app-spacing-xs;

      .label {
        color: $app-text-primary;
        font-size: $app-font-size-base;
        font-weight: 500;
      }

      .desc {
        color: #999;
        font-size: $app-font-size-xs;
      }
    }

    .value {
      color: #4a63d2;
      font-size: $app-font-size-base;
      font-weight: 500;
      text-align: right;
      word-break: break-all;
      max-width: 50%;
    }
  }
}

// 诊断列表
.diagnosis-list {
  .diagnosis-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $app-spacing-md 0;
    border-bottom: 1px solid $app-divider-color;

    &:last-child {
      border-bottom: none;
    }

    .diagnosis-left {
      display: flex;
      align-items: center;
      gap: $app-spacing-md;

      .label {
        color: $app-text-primary;
        font-size: $app-font-size-base;
        font-weight: 500;
      }

      .status-badge {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: $app-font-size-xs;
        font-weight: 500;

        &.success {
          background-color: rgba(93, 188, 76, 0.1);
          color: #5dbc4c;
        }

        &.warning {
          background-color: rgba(255, 193, 7, 0.1);
          color: #ffc107;
        }

        &.danger {
          background-color: rgba(211, 47, 47, 0.1);
          color: #d32f2f;
        }
      }
    }
  }
}

// 按钮组
.button-group {
  display: flex;
  gap: $app-spacing-md;
  flex-direction: column;

  .loading-text {
    /* #ifndef MP */
    animation: rotate 1s linear infinite;
    /* #endif */
  }
}

/* #ifndef MP */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(93, 188, 76, 0.7);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(93, 188, 76, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(93, 188, 76, 0);
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
/* #endif */
</style>
