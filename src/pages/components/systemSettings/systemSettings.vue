<template>
  <view class="container">
    <!-- 页面头部 -->
    <PageHeader title="⚙️ 系统设置" subtitle="应用管理与维护" />

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 存储信息卡片 -->
      <view class="info-card">
        <view class="card-header">
          <text class="header-icon">💾</text>
          <text class="header-title">缓存信息</text>
        </view>
        <view class="info-item">
          <text class="info-label">当前缓存大小</text>
          <text class="info-value">{{ storageSize }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">应用版本</text>
          <text class="info-value">{{ appVersion }}</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="operation-section">
        <view class="section-title">操作</view>

        <!-- 清除缓存 -->
        <view class="option-card">
          <view class="option-header">
            <view class="option-info">
              <text class="option-icon">🗑️</text>
              <view class="option-text">
                <text class="option-title">清除缓存</text>
                <text class="option-desc">清除所有本地缓存数据</text>
              </view>
            </view>
            <button class="action-btn danger-btn" @click="clearCache">
              <text class="btn-text">清除</text>
            </button>
          </view>
        </view>

        <!-- 重启应用 -->
        <view class="option-card">
          <view class="option-header">
            <view class="option-info">
              <text class="option-icon">🔄</text>
              <view class="option-text">
                <text class="option-title">重启应用</text>
                <text class="option-desc">重新加载应用并返回首页</text>
              </view>
            </view>
            <button class="action-btn primary-btn" @click="restartApp">
              <text class="btn-text">重启</text>
            </button>
          </view>
        </view>

        <!-- 检查更新 -->
        <view class="option-card">
          <view class="option-header">
            <view class="option-info">
              <text class="option-icon">✨</text>
              <view class="option-text">
                <text class="option-title">检查更新</text>
                <text class="option-desc">检查新版本并更新</text>
              </view>
            </view>
            <button class="action-btn primary-btn" @click="checkUpdate" :disabled="isCheckingUpdate">
              <text class="btn-text">{{ isCheckingUpdate ? '检查中...' : '检查' }}</text>
            </button>
          </view>
        </view>
      </view>

      <!-- 系统信息 -->
      <view class="system-info-section">
        <view class="section-title">系统信息</view>
        <view class="info-grid">
          <view class="info-box">
            <text class="label">平台</text>
            <text class="value">{{ systemInfo.platform }}</text>
          </view>
          <view class="info-box">
            <text class="label">系统版本</text>
            <text class="value">{{ systemInfo.osVersion }}</text>
          </view>
          <view class="info-box">
            <text class="label">机型</text>
            <text class="value">{{ systemInfo.model }}</text>
          </view>
          <view class="info-box">
            <text class="label">屏幕高度</text>
            <text class="value">{{ systemInfo.screenHeight }}px</text>
          </view>
        </view>
      </view>

      <!-- 功能说明 -->
      <view class="tips-section">
        <view class="tips-title">💡 功能说明</view>
        <view class="tips-content">
          <text class="tip-item">• <text class="tip-label">清除缓存</text> - 删除应用所有本地存储数据，可能包括用户设置等，请谨慎使用</text>
          <text class="tip-item">• <text class="tip-label">重启应用</text> - 重新加载应用，可以解决应用卡顿或状态异常等问题</text>
          <text class="tip-item">• <text class="tip-label">检查更新</text> - 检查微信服务器是否有新版本，有新版本时会自动下载安装</text>
        </view>
      </view>

      <!-- 关于本应用 -->
      <view class="about-section">
        <view class="about-title">📱 关于 DM工具箱</view>
        <view class="about-content">
          <text class="about-text">集成多种不实用功能的离线工具，专为日常生活和工作提供阻碍。</text>
          <text class="about-version">版本：{{ appVersion }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: '系统设置 - DM工具箱',
    path: '/pages/components/systemSettings/systemSettings'
  })
}
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/PageHeader.vue'

interface SystemInfo {
  platform: string
  osVersion: string
  model: string
  screenHeight: number
}

const storageSize = ref('计算中...')
const appVersion = ref('1.0.0')
const isCheckingUpdate = ref(false)
const systemInfo = ref<SystemInfo>({
  platform: '',
  osVersion: '',
  model: '',
  screenHeight: 0
})

onMounted(() => {
  getSystemInfo()
  calculateStorageSize()
})

/**
 * 获取系统信息
 * 思考：获取系统信息对于调试和用户了解设备状态很重要
 */
const getSystemInfo = async () => {
  try {
    const info = await uni.getSystemInfo()
    systemInfo.value = {
      platform: info.platform === 'android' ? 'Android' : 'iOS',
      osVersion: info.system,
      model: info.model,
      screenHeight: info.screenHeight
    }
    // 获取应用版本号
    const appInfo = await uni.getAppBaseInfo()
    if (appInfo.appVersion) {
      appVersion.value = appInfo.appVersion
    }
  } catch (e) {
    console.error('获取系统信息失败:', e)
  }
}

/**
 * 计算存储大小
 * 思考：遍历所有缓存项获取总大小，给用户直观的缓存占用信息
 */
const calculateStorageSize = async () => {
  try {
    const allKeys = await uni.getStorageInfo()
    let totalSize = 0

    if (allKeys.keys && allKeys.keys.length > 0) {
      for (const key of allKeys.keys) {
        try {
          const res = await uni.getStorage({ key })
          const itemSize = JSON.stringify(res.data).length
          totalSize += itemSize
        } catch (e) {
          // 跳过无法读取的项
        }
      }
    }

    if (totalSize === 0) {
      storageSize.value = '无缓存'
    } else if (totalSize < 1024) {
      storageSize.value = `${totalSize}B`
    } else if (totalSize < 1024 * 1024) {
      storageSize.value = `${(totalSize / 1024).toFixed(2)}KB`
    } else {
      storageSize.value = `${(totalSize / (1024 * 1024)).toFixed(2)}MB`
    }
  } catch (e) {
    storageSize.value = '无法计算'
  }
}

/**
 * 清除缓存
 * 思考：
 * 1. 使用确认对话框防止用户误操作
 * 2. 清除成功后显示提示，并重新计算存储大小
 * 3. 这是一个危险操作，应该有清晰的提示
 */
const clearCache = () => {
  uni.showModal({
    title: '清除缓存',
    content: '确定要清除所有缓存数据吗？此操作不可撤销！',
    confirmText: '清除',
    confirmColor: '#d32f2f',
    success: async (res) => {
      if (res.confirm) {
        try {
          await uni.clearStorage()
          uni.showToast({
            title: '缓存已清除',
            duration: 1000
          })
          // 重新计算存储大小
          calculateStorageSize()
        } catch (e) {
          uni.showToast({
            title: '清除失败',
            icon: 'none',
            duration: 1000
          })
        }
      }
    }
  })
}

/**
 * 重启应用
 * 思考：
 * 1. 使用 reLaunch 返回首页，确保应用状态重置
 * 2. 不需要确认，因为重启是可恢复的操作
 * 3. 可以解决异常状态、内存泄漏等问题
 */
const restartApp = () => {
  uni.reLaunch({
    url: '/pages/index/index'
  })
}

/**
 * 检查更新
 * 思考：
 * 1. 仅在微信小程序环境中有效（使用 getUpdateManager）
 * 2. 显示检查中的状态，避免用户重复点击
 * 3. 处理三种情况：
 *    - 已是最新版本
 *    - 有新版本自动下载
 *    - 有新版本需要用户确认
 * 4. 更新完成后提示用户重启应用
 */
const checkUpdate = () => {
  isCheckingUpdate.value = true

  try {
    // 仅在微信小程序中可用
    const updateManager = uni.getUpdateManager()

    updateManager.onCheckForUpdate(() => {
      // 已经在检查，不需要额外处理
    })

    updateManager.onUpdateReady(() => {
      // 新版本已下载完毕，可立即应用
      uni.showModal({
        title: '更新提示',
        content: '新版本已准备就绪，是否立即更新?',
        confirmText: '更新',
        success: (res) => {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      })
    })

    updateManager.onUpdateFailed(() => {
      uni.showToast({
        title: '更新失败，请稍后重试',
        icon: 'none',
        duration: 1500
      })
    })

    // 延迟后隐藏检查状态（防止频繁点击）
    setTimeout(() => {
      isCheckingUpdate.value = false
      // 如果没有任何回调触发，说明是最新版本
      if (!updateManager.clientVersion) {
        uni.showToast({
          title: '已是最新版本',
          duration: 1500
        })
      }
    }, 2000)
  } catch (e) {
    isCheckingUpdate.value = false
    uni.showToast({
      title: '当前环境不支持更新检查',
      icon: 'none',
      duration: 1500
    })
  }
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

/* 信息卡片 */
.info-card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.header-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.header-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 28rpx;
  color: #666;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

/* 操作区域 */
.operation-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  margin-left: 10rpx;
}

.option-card {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.option-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.option-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.option-icon {
  font-size: 40rpx;
  min-width: 40rpx;
}

.option-text {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  flex: 1;
}

.option-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}

.option-desc {
  font-size: 24rpx;
  color: #999;
}

.action-btn {
  border: none;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
  font-size: 26rpx;
  font-weight: 500;
  min-width: 100rpx;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;

  &.primary-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  &.danger-btn {
    background: #ff6b6b;
    color: white;
  }

  &:disabled {
    opacity: 0.6;
  }
}

.btn-text {
  font-size: 26rpx;
}

/* 系统信息 */
.system-info-section {
  margin-bottom: 30rpx;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.info-box {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.label {
  font-size: 24rpx;
  color: #999;
}

.value {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
  text-align: center;
  word-break: break-all;
}

/* 功能说明 */
.tips-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  border-left: 4rpx solid #667eea;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  margin-bottom: 30rpx;
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

.tip-label {
  font-weight: 600;
  color: #667eea;
}

/* 关于本应用 */
.about-section {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-radius: 16rpx;
  padding: 24rpx;
  border: 1rpx solid rgba(102, 126, 234, 0.1);
}

.about-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.about-content {
  padding-left: 8rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.about-text {
  font-size: 26rpx;
  line-height: 1.8;
  color: #666;
}

.about-version {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.tip-label {
  color: #667eea;
  font-weight: 500;
}
</style>
