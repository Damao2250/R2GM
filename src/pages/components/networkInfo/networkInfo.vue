<template>
  <view class="page-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="page-title">网络信息</text>
    </view>

    <!-- 页面内容 -->
    <view class="page-content">
      <view class="card">
        <view class="card-title">网络信息详情</view>
        <view class="info-list">
          <view class="info-item">
            <text class="label">网络类型：</text>
            <text class="value" user-select>{{ networkType || '-' }}</text>
          </view>
          <view v-if="networkType === 'wifi'" class="info-item">
            <text class="label">Wifi 名称：</text>
            <text class="value" user-select>{{ wifiInfo.SSID || '-' }}</text>
          </view>
          <view v-if="networkType === 'wifi'" class="info-item">
            <text class="label">BSSID：</text>
            <text class="value" user-select>{{ wifiInfo.BSSID || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="label">IP 地址：</text>
            <text class="value" user-select>{{ localip || '-' }}</text>
          </view>
        </view>

        <button class="wd-button primary full-width" @click="getNetworkInfo">
          刷新网络信息
        </button>
      </view>

      <!-- 网络状态指示器 -->
      <view class="card status-card">
        <view class="status-item">
          <view class="status-indicator" :class="networkType ? 'connected' : 'disconnected'"></view>
          <view class="status-text">
            {{ networkType ? '已连接' : '未连接' }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface WifiInfo {
  SSID?: string
  BSSID?: string
  autoJoined?: boolean
  justJoined?: boolean
  secure?: boolean
  signalStrength?: number
}

const networkType = ref('')
const localip = ref('')
const wifiInfo = ref<WifiInfo>({})

onMounted(() => {
  getNetworkInfo()
})

const getNetworkInfo = async () => {
  const network = await uni.getNetworkType()
  console.log(network)
  networkType.value = network.networkType

  uni.getLocalIPAddress({
    success: res => {
      console.log(res)
      localip.value = res.localip
    }
  })

  if (networkType.value === 'wifi') {
    const wifiInfoRes = await uni.getConnectedWifi()
    console.log(wifiInfoRes)
    wifiInfo.value = wifiInfoRes.wifi
  }
}
</script>

<style lang="scss" scoped>
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
  padding: $app-spacing-lg;
}

.card {
  background-color: $app-bg-secondary;
  border-radius: $app-border-radius-md;
  padding: $app-spacing-lg;
  margin-bottom: $app-spacing-lg;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .card-title {
    font-size: $app-font-size-lg;
    color: $app-text-primary;
    font-weight: 600;
    margin-bottom: $app-spacing-lg;
    padding-bottom: $app-spacing-md;
    border-bottom: 2px solid $app-divider-color;
  }
}

.info-list {
  margin-bottom: $app-spacing-lg;

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $app-spacing-lg 0;
    border-bottom: 1px solid $app-divider-color;

    &:last-child {
      border-bottom: none;
    }

    .label {
      color: $app-text-secondary;
      font-size: $app-font-size-base;
      font-weight: 500;
      min-width: 100px;
    }

    .value {
      color: $app-primary-color;
      font-size: $app-font-size-base;
      flex: 1;
      text-align: right;
      word-break: break-all;
    }
  }
}


.status-card {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;

  .status-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $app-spacing-lg;

    .status-indicator {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      /* #ifndef MP */
      animation: pulse 2s infinite;
      /* #endif */

      &.connected {
        background-color: $app-success-color;
      }

      &.disconnected {
        background-color: $app-danger-color;
      }
    }

    .status-text {
      font-size: $app-font-size-lg;
      font-weight: 600;
      color: $app-text-primary;
    }
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
/* #endif */
</style>
