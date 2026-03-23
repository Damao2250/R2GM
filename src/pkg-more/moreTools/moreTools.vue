<template>
  <view class="page-container">
    <view class="page-header">
      <view class="header-content">
        <image class="logo" src="/static/dm-logo.png"></image>
        <text class="page-title">更多工具</text>
        <text class="page-subtitle">脑洞试验区 · 下一批奇怪功能都在这里排队</text>
      </view>
    </view>

    <view class="page-content">
      <view class="intro-card">
        <text class="intro-title">收录 {{ moreToolIdeas.length }} 个脑洞工具</text>
        <text class="intro-desc">现在每张卡片都能直接进入，试试看哪一个最像你下一步会真的用到的奇怪功能。</text>
      </view>

      <ToolGrid :items="moreToolIdeas" @select="openTool" />
    </view>
  </view>
</template>

<route lang="json5">
{
  style: {
    navigationBarTitleText: '更多工具',
    enablePullDownRefresh: false
  }
}
</route>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: '更多工具 - DM工具箱',
    path: '/pkg-more/moreTools/moreTools',
    imageUrl: '/static/dm-logo.png'
  })
}
</script>

<script setup lang="ts">
import ToolGrid from '@/components/ToolGrid.vue'
import { moreToolIdeas, type MoreToolIdeaItem } from '@/utils/moreTools'
import { recordToolUsage } from '@/utils/toolUsage'

const openTool = (item: MoreToolIdeaItem) => {
  recordToolUsage({
    title: item.title,
    url: item.url
  }, 'more-tools')

  uni.navigateTo({
    url: item.url
  })
}
</script>

<style lang="scss" scoped>
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
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  position: relative;
  z-index: 1;
}

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

.page-subtitle {
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.5;
  opacity: 0.92;
  text-align: center;
}

.page-content {
  padding: 30rpx;
}

.intro-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 28rpx 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.12);
  border: 2rpx solid rgba(118, 75, 162, 0.08);
}

.intro-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #2d3748;
}

.intro-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: #6b7280;
}
</style>
