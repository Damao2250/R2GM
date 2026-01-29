<template>
  <view class="content">
    <view class="info">
      <view class="list">
        <view class="label">
          <text user-select>网络类型：</text
          ><text user-select class="value">{{ networkType || '-' }}</text>
        </view>
        <view class="label" v-if="networkType == 'wifi'">
          <text user-select>Wifi名称：</text
          ><text user-select class="value">{{ wifiInfo.SSID || '-' }}</text>
        </view>
        <view class="label" v-if="networkType == 'wifi'">
          <text user-select>BSSID：</text
          ><text user-select class="value">{{ wifiInfo.BSSID || '-' }}</text>
        </view>
        <view class="label">
          <text user-select>IP地址：</text
          ><text user-select class="value">{{ localip || '-' }}</text>
        </view>
      </view>
    </view>
    <button @click="getNetworkInfo">刷新网络信息</button>
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

<style lang="less">
.content {
  padding: 20px;

  .info {
    .list {
      font-size: 14px;

      .label {
        padding: 8px 0;
        padding-right: 10px;

        .value {
        }
      }
    }
  }
}
</style>
