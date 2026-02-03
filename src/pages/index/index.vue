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
        <view class="tool-item" v-for="(item, index) in toolsList" :key="index" @click="gotoPage(item)">
          <view class="tool-icon">{{ item.icon }}</view>
          <text class="tool-name">{{ item.title }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: 'DM工具箱 - 一款实用的工具集',
    path: '/pages/index/index',
    imageUrl: '/static/dm-logo.png'
  })
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

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
  },
  {
    title: '随机数工具',
    url: '/pages/components/randomNumber/randomNumber',
    icon: '🎲'
  },
  {
    title: '折扣计算器',
    url: '/pages/components/discountCalculator/discountCalculator',
    icon: '💵'
  },
  {
    title: '配对缘分',
    url: '/pages/components/matchCalculator/matchCalculator',
    icon: '💑'
  },
  {
    title: '倒数日',
    url: '/pages/components/countdown/countdown',
    icon: '📅'
  },
  {
    title: '决策助手',
    url: '/pages/components/randomDecider/randomDecider',
    icon: '🎴'
  },
  {
    title: '生日/星座',
    url: '/pages/components/birthdayCalculator/birthdayCalculator',
    icon: '🎂'
  },
  {
    title: '系统设置',
    url: '/pages/components/systemSettings/systemSettings',
    icon: '⚙️'
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
  background: #f5f7fa;
}

.page-header {
  padding: 40rpx;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border-bottom: 1px solid #e5e5e5;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .header-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: white;
    position: relative;
    z-index: 1;

    .logo {
      height: 60rpx;
      width: 60rpx;
      margin-bottom: 20rpx;
      border-radius: 12rpx;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
    }

    .page-title {
      font-size: 48rpx;
      font-weight: 700;
      letter-spacing: 1rpx;
      margin: 0;
      line-height: 1.2;
      color: white;
    }
  }
}

.page-content {
  padding: 30rpx;
}

.tools-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 30rpx;
  margin-top: 20rpx;

  .tool-item {
    background-color: white;
    border-radius: 20rpx;
    padding: 30rpx;
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
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
    }
  }
}
</style>
