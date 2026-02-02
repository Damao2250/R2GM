<template>
  <view class="page-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-bg"></view>
      <text class="page-title">📱 设备信息</text>
    </view>

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 设备高亮信息卡 -->
      <view class="highlight-card">
        <view class="highlight-item">
          <text class="highlight-label">系统</text>
          <text class="highlight-value">{{ deviceInfo.platform === 'ios' ? 'iOS' : 'Android' }}</text>
        </view>
        <view class="highlight-divider"></view>
        <view class="highlight-item">
          <text class="highlight-label">屏幕</text>
          <text class="highlight-value">{{ deviceInfo.screenWidth }}×{{ deviceInfo.screenHeight }}</text>
        </view>
        <view class="highlight-divider"></view>
        <view class="highlight-item">
          <text class="highlight-label">DPI</text>
          <text class="highlight-value">{{ deviceInfo.devicePixelRatio }}</text>
        </view>
      </view>

      <!-- 系统信息 -->
      <view class="section-card system-card">
        <view class="section-header">
          <text class="section-icon">⚙️</text>
          <text class="section-title">系统信息</text>
        </view>
        <view class="info-item">
          <text class="info-label">操作系统</text>
          <text class="info-value">{{ deviceInfo.platform === 'ios' ? 'iOS' : 'Android' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">系统版本</text>
          <text class="info-value">{{ deviceInfo.system }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">设备品牌</text>
          <text class="info-value">{{ deviceInfo.brand || '未知' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">设备型号</text>
          <text class="info-value">{{ deviceInfo.model }}</text>
        </view>
      </view>

      <!-- 屏幕信息 -->
      <view class="section-card screen-card">
        <view class="section-header">
          <text class="section-icon">🖥️</text>
          <text class="section-title">屏幕信息</text>
        </view>
        <view class="info-item">
          <text class="info-label">屏幕宽度</text>
          <text class="info-value">{{ deviceInfo.screenWidth }}px</text>
        </view>
        <view class="info-item">
          <text class="info-label">屏幕高度</text>
          <text class="info-value">{{ deviceInfo.screenHeight }}px</text>
        </view>
        <view class="info-item">
          <text class="info-label">窗口宽度</text>
          <text class="info-value">{{ deviceInfo.windowWidth }}px</text>
        </view>
        <view class="info-item">
          <text class="info-label">窗口高度</text>
          <text class="info-value">{{ deviceInfo.windowHeight }}px</text>
        </view>
        <view class="info-item">
          <text class="info-label">设备像素比</text>
          <text class="info-value">{{ deviceInfo.devicePixelRatio }}</text>
        </view>
      </view>

      <!-- 应用信息 -->
      <view class="section-card app-card">
        <view class="section-header">
          <text class="section-icon">📦</text>
          <text class="section-title">应用信息</text>
        </view>
        <view class="info-item">
          <text class="info-label">应用名称</text>
          <text class="info-value">{{ deviceInfo.appName || 'DM工具箱' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">App版本</text>
          <text class="info-value">{{ deviceInfo.appVersion || '1.0.0' }}</text>
        </view>
      </view>

      <!-- 其他信息 -->
      <view class="section-card other-card">
        <view class="section-header">
          <text class="section-icon">ℹ️</text>
          <text class="section-title">其他信息</text>
        </view>
        <view class="info-item">
          <text class="info-label">语言</text>
          <text class="info-value">{{ deviceInfo.language }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">屏幕方向</text>
          <text class="info-value">{{ deviceInfo.screenHeight > deviceInfo.screenWidth ? '竖屏' : '横屏' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">刘海屏</text>
          <text class="info-value">{{ deviceInfo.safeArea ? '是' : '否' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">状态栏高度</text>
          <text class="info-value">{{ deviceInfo.statusBarHeight }}px</text>
        </view>
      </view>

      <!-- 复制按钮 -->
      <view class="action-section">
        <button class="copy-btn" @click="copyDeviceInfo">
          <text class="btn-icon">📋</text>
          <text class="btn-text">复制所有信息</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

interface DeviceInfoType {
  platform: string
  system: string
  brand: string
  model: string
  screenWidth: number
  screenHeight: number
  windowWidth: number
  windowHeight: number
  devicePixelRatio: number
  appName: string
  appVersion: string
  language: string
  statusBarHeight: number
  safeArea?: any
}

const deviceInfo = reactive<DeviceInfoType>({
  platform: '',
  system: '',
  brand: '',
  model: '',
  screenWidth: 0,
  screenHeight: 0,
  windowWidth: 0,
  windowHeight: 0,
  devicePixelRatio: 0,
  appName: 'DM工具箱',
  appVersion: '1.0.0',
  language: '',
  statusBarHeight: 0
})

onLoad(() => {
  loadDeviceInfo()
})

const loadDeviceInfo = () => {
  uni.getSystemInfo({
    success: (res: any) => {
      Object.assign(deviceInfo, {
        platform: res.platform,
        system: res.system,
        brand: res.brand || '未知',
        model: res.model,
        screenWidth: res.screenWidth,
        screenHeight: res.screenHeight,
        windowWidth: res.windowWidth,
        windowHeight: res.windowHeight,
        devicePixelRatio: res.devicePixelRatio,
        language: res.language,
        statusBarHeight: res.statusBarHeight,
        safeArea: res.safeArea
      })
    }
  })
}

const copyDeviceInfo = () => {
  const info = `
设备信息详情：

【系统信息】
操作系统: ${deviceInfo.platform === 'ios' ? 'iOS' : 'Android'}
系统版本: ${deviceInfo.system}
设备品牌: ${deviceInfo.brand}
设备型号: ${deviceInfo.model}

【屏幕信息】
屏幕宽度: ${deviceInfo.screenWidth}px
屏幕高度: ${deviceInfo.screenHeight}px
窗口宽度: ${deviceInfo.windowWidth}px
窗口高度: ${deviceInfo.windowHeight}px
设备像素比: ${deviceInfo.devicePixelRatio}

【应用信息】
应用名称: ${deviceInfo.appName}
App版本: ${deviceInfo.appVersion}

【其他信息】
语言: ${deviceInfo.language}
屏幕方向: ${deviceInfo.screenHeight > deviceInfo.screenWidth ? '竖屏' : '横屏'}
是否刘海屏: ${deviceInfo.safeArea ? '是' : '否'}
状态栏高度: ${deviceInfo.statusBarHeight}px
  `.trim()

  uni.setClipboardData({
    data: info,
    success: () => {
      uni.showToast({
        title: '已复制到剪贴板',
        icon: 'success',
        duration: 2000
      })
    }
  })
}
</script>

<style lang="scss" scoped>
@use '../../../styles/theme.scss' as *;

.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.page-header {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.1;
  }

  .page-title {
    font-size: 22px;
    font-weight: 700;
    color: #ffffff;
    position: relative;
    z-index: 1;
    letter-spacing: 0.5px;
  }
}

.page-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 高亮信息卡 */
.highlight-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
  margin-bottom: 8px;

  .highlight-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex: 1;

    .highlight-label {
      font-size: 9px;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 600;
      letter-spacing: 1px;
    }

    .highlight-value {
      font-size: 14px;
      color: #ffffff;
      font-weight: 700;
    }
  }

  .highlight-divider {
    width: 1px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.2);
    margin: 0 12px;
  }
}

/* 各类别卡片 */
.section-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border-top: 4px solid #667eea;

  &:active {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }

  &.system-card {
    border-top-color: #667eea;
  }

  &.screen-card {
    border-top-color: #764ba2;
  }

  &.app-card {
    border-top-color: #f093fb;
  }

  &.other-card {
    border-top-color: #4facfe;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f0f0f0;

    .section-icon {
      font-size: 18px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: $app-text-primary;
    }
  }
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  .info-label {
    font-size: 12px;
    color: #999;
    font-weight: 600;
    flex: 0.5;
  }

  .info-value {
    font-size: 13px;
    color: $app-text-primary;
    font-weight: 700;
    text-align: right;
    flex: 0.5;
    word-break: break-all;
  }
}

.action-section {
  padding: 8px 0;
  display: flex;
  gap: $app-spacing-md;
  margin-top: 8px;

  .copy-btn {
    flex: 1;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    border: none;
    border-radius: 12px;
    padding: 16px;
    font-size: 14px;
    font-weight: 700;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

    &:active {
      opacity: 0.85;
      transform: scale(0.98);
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
    }

    .btn-icon {
      font-size: 16px;
    }

    .btn-text {
      font-size: 14px;
    }
  }
}
</style>
