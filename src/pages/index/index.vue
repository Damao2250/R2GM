<template>
  <view class="page-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-content">
        <image class="logo" src="/static/dm-logo.png"></image>
        <text class="page-title">DM工具箱</text>
      </view>
    </view>

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 工具网格 -->
      <view class="tools-grid">
        <view
          class="tool-item"
          v-for="(item, index) in toolsList"
          :key="index"
          @click="gotoPage(item)"
        >
          <view class="tool-icon">{{ item.icon }}</view>
          <text class="tool-name">{{ item.title }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

interface ToolItem {
  title: string
  url: string
  icon?: string
}

const toolsList = ref<ToolItem[]>([
  {
    title: '金额转大写',
    url: '/pages/components/convertCurrency/convertCurrency',
    icon: '💰'
  },
  {
    title: '网络信息',
    url: '/pages/components/networkInfo/networkInfo',
    icon: '🌐'
  },
  {
    title: 'base64/MD5',
    url: '/pages/components/base64Conver/base64Conver',
    icon: '🔐'
  },
  {
    title: '当前时间',
    url: '/pages/components/timeNow/timeNow',
    icon: '⏰'
  },
  {
    title: '设备信息',
    url: '/pages/components/deviceInfo/deviceInfo',
    icon: '📱'
  },
  {
    title: '二维码分享',
    url: '/pages/components/qrcodeShare/qrcodeShare',
    icon: '📲'
  },
  {
    title: '单位转换',
    url: '/pages/components/unitConvert/unitConvert',
    icon: '📏'
  },
  {
    title: '亲戚计算器',
    url: '/pages/components/relativeCalculator/relativeCalculator',
    icon: '👨‍👩‍👧‍👦'
  }
])

const gotoPage = (item: ToolItem) => {
  if (!item.url) return
  uni.navigateTo({
    url: item.url
  })
}
</script>

<style lang="scss" scoped>
@use '../../styles/theme.scss' as *;

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

  .header-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: $app-text-primary;
    position: relative;
    z-index: 1;

    .logo {
      height: 60rpx;
      width: 60rpx;
      margin-bottom: $app-spacing-sm;
      border-radius: 12rpx;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .page-title {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin: 0;
      line-height: 1.2;
      color: #4a63d2;
    }
  }
}

.page-content {
  padding: $app-spacing-md;
}

.tools-grid {
  display: flex;
  flex-wrap: wrap;
  gap: $app-spacing-md;
  margin-top: $app-spacing-sm;

  .tool-item {
    background-color: $app-bg-secondary;
    border-radius: $app-border-radius-lg;
    padding: $app-spacing-md;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    flex: 1;
    min-width: 120px;
    min-height: 90px;
    border: 2px solid #e0e0e0;
    /* #ifndef MP */
    transition: all 0.3s ease;
    /* #endif */

    &:active {
      /* #ifdef H5 */
      transform: scale(0.95);
      /* #endif */
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .tool-icon {
      font-size: 28px;
      margin-bottom: 4px;
    }

    .tool-name {
      font-size: $app-font-size-base;
      color: $app-text-primary;
      font-weight: 500;
    }
  }
}
</style>
