<template>
  <view class="page-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-content">
        <image class="logo" src="/static/dm-logo.png" @longpress="openBlindBox"></image>
        <text class="page-title">DM工具箱</text>
        <text class="page-tip">长按 Logo 可直接打开工具盲盒</text>
      </view>
    </view>

    <!-- 页面内容 -->
    <view class="page-content">
      <ToolGrid :items="toolsList" @select="gotoPage" />
    </view>
  </view>
</template>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: 'DM工具箱 - 不实用的工具',
    path: '/pages/index/index',
    imageUrl: '/static/dm-logo.png'
  })
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import ToolGrid from '@/components/ToolGrid.vue'
import { getToolsList, getVisibleTools, type ToolItem } from '@/utils/toolsManager'
import { recordToolUsage } from '@/utils/toolUsage'

const toolsList = ref<ToolItem[]>([])

const loadTools = async () => {
  try {
    const allTools = await getToolsList()
    toolsList.value = getVisibleTools(allTools)
  } catch (error) {
    console.error('加载工具列表失败:', error)
  }
}

const gotoPage = (item: ToolItem) => {
  if (!item.url) {
    return
  }

  recordToolUsage({
    title: item.title,
    url: item.url
  }, 'home')

  uni.navigateTo({
    url: item.url
  })
}

const openBlindBox = () => {
  const blindBoxUrl = '/pkg-more/toolBlindBox/toolBlindBox'

  recordToolUsage({
    title: '工具盲盒',
    url: blindBoxUrl
  }, 'home-logo')

  uni.navigateTo({
    url: blindBoxUrl
  })
}

onLoad(() => {
  void loadTools()
})

onShow(() => {
  void loadTools()
})
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

    .page-tip {
      margin-top: 12rpx;
      font-size: 24rpx;
      line-height: 1.5;
      opacity: 0.92;
    }
  }
}

.page-content {
  padding: 30rpx;
}
</style>
