<template>
  <view class="container">
    <!-- 页面头部 -->
    <PageHeader title="📲 二维码分享" subtitle="扫描·生成·分享" />

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 输入卡片 -->
      <view class="input-card">
        <view class="section-title">📝 输入文本</view>
        <textarea class="text-input" v-model="inputText" placeholder="输入要生成二维码的文本内容..." maxlength="1000"></textarea>
        <view class="char-counter">{{ inputText.length }}/1000</view>

        <!-- 操作按钮 -->
        <view class="action-buttons">
          <view class="action-btn secondary-btn" @tap="scanQrcode"> 📸 扫描 </view>
          <view class="action-btn secondary-btn" @tap="pasteText"> 📋 粘贴 </view>
          <view class="action-btn secondary-btn" @tap="clearText"> 🗑️ 清空 </view>
        </view>

        <view class="generate-btn" :class="{ disabled: !inputText }" @tap="generateQrcode">
          ✨ 生成二维码
        </view>
      </view>

      <!-- Canvas 容器 -->
      <canvas canvas-id="qrcodeCanvas" class="qrcode-canvas"></canvas>

      <!-- 二维码结果卡片 -->
      <view v-if="qrcodeUrl" class="qrcode-card">
        <view class="section-title">📲 二维码结果</view>
        <view class="qrcode-display">
          <image :src="qrcodeUrl" class="qrcode-img" mode="aspectFit"></image>
        </view>

        <!-- 操作按钮 -->
        <view class="qrcode-actions">
          <view class="qr-action-btn" @tap="saveQrcode"> 💾 保存图片 </view>
          <view class="qr-action-btn" @tap="copyText"> 📋 复制文本 </view>
        </view>

        <!-- 文本预览 -->
        <view class="text-preview">
          <view class="preview-title">预览内容</view>
          <text class="preview-content">{{ inputText }}</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-icon">💡</text>
        <text class="empty-text">输入文本后点击"生成二维码"</text>
        <text class="empty-hint">支持最多 1000 个字符</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: '二维码分享 - DM工具箱',
    path: '/pages/components/qrcodeShare/qrcodeShare'
  })
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PageHeader from '@/components/PageHeader.vue'
import drawQrcode from 'weapp-qrcode'

// 类型定义
interface CanvasTempFileResult {
  tempFilePath: string
  errMsg: string
}

interface QrcodeConfig {
  width: number
  height: number
  canvasId: string
  text: string
  colorDark: string
  colorLight: string
  correctLevel: number
}

const inputText = ref('')
const qrcodeUrl = ref('')

onLoad(() => {
  console.log('二维码分享页面加载')
})

const scanQrcode = async () => {
  try {
    const result = await uni.scanCode({
      onlyFromCamera: true,
      scanType: ['qrCode']
    })

    if (result.result) {
      inputText.value = result.result
      qrcodeUrl.value = ''
      uni.showToast({
        title: '扫描成功',
        icon: 'success',
        duration: 1500
      })
    }
  } catch (e) {
    uni.showToast({
      title: '扫描取消',
      icon: 'none'
    })
  }
}

const clearText = () => {
  inputText.value = ''
  qrcodeUrl.value = ''
}

const pasteText = async () => {
  try {
    const result = await uni.getClipboardData()
    inputText.value = result.data
  } catch (e) {
    uni.showToast({
      title: '粘贴失败',
      icon: 'error'
    })
  }
}

/**
 * 生成二维码
 * 使用 weapp-qrcode 在 canvas 上绘制二维码，然后导出为图片
 */
const generateQrcode = async () => {
  if (!inputText.value.trim()) {
    uni.showToast({
      title: '请输入文本',
      icon: 'error'
    })
    return
  }

  try {
    uni.showLoading({
      title: '生成中...'
    })

    // 配置二维码参数
    const config: QrcodeConfig = {
      width: 250,
      height: 250,
      canvasId: 'qrcodeCanvas',
      text: inputText.value,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: 2 // H级纠错
    }

    // 直接调用 weapp-qrcode 绘制到 canvas
    drawQrcode(config)

    // 绘制完成后导出为临时文件
    setTimeout(() => {
      uni.canvasToTempFilePath({
        canvasId: 'qrcodeCanvas',
        destWidth: 250,
        destHeight: 250,
        success: (res: CanvasTempFileResult) => {
          qrcodeUrl.value = res.tempFilePath
          uni.hideLoading()
          uni.showToast({
            title: '生成成功',
            icon: 'success',
            duration: 1500
          })
        },
        fail: (err: any) => {
          uni.hideLoading()
          console.error('Canvas to temp file error:', err)
          uni.showToast({
            title: err.errMsg || '生成失败，请重试',
            icon: 'error'
          })
        }
      })
    }, 200)
  } catch (e: any) {
    uni.hideLoading()
    console.error('QR Code generation error:', e)
    uni.showToast({
      title: e?.message || '生成失败，请重试',
      icon: 'error'
    })
  }
}

const copyText = async () => {
  try {
    await uni.setClipboardData({
      data: inputText.value
    })
    uni.showToast({
      title: '已复制',
      icon: 'success',
      duration: 1500
    })
  } catch (e) {
    uni.showToast({
      title: '复制失败',
      icon: 'error'
    })
  }
}

const saveQrcode = async () => {
  try {
    // 小程序保存图片到相册
    uni.saveImageToPhotosAlbum({
      filePath: qrcodeUrl.value,
      success: () => {
        uni.showToast({
          title: '已保存到相册',
          icon: 'success',
          duration: 2000
        })
      },
      fail: () => {
        uni.showToast({
          title: '保存失败，请检查权限',
          icon: 'error'
        })
      }
    })
  } catch (e) {
    uni.showToast({
      title: '保存失败',
      icon: 'error'
    })
  }
}
</script>

<style lang="scss" scoped>
@use '../../../styles/theme.scss' as *;

.container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 0 0 40rpx 0;
}

.page-content {
  padding: 30rpx;
}

/* 输入卡片 */
.input-card {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

.text-input {
  width: 100%;
  min-height: 280rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
  border: none;
  box-sizing: border-box;
  display: block;
}

.char-counter {
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 16rpx;
  margin-bottom: 30rpx;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
  transition: all 0.3s;

  &.secondary-btn {
    background: white;
    color: #667eea;
    border: 2rpx solid #667eea;
  }

  &:active {
    transform: scale(0.95);
  }
}

.generate-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: bold;
  color: white;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s;

  &.disabled {
    opacity: 0.5;
  }

  &:active:not(.disabled) {
    transform: scale(0.98);
  }
}

/* 二维码卡片 */
.qrcode-card {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.qrcode-display {
  padding: 40rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30rpx;
}

.qrcode-img {
  width: 500rpx;
  height: 500rpx;
}

.qrcode-actions {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.qr-action-btn {
  flex: 1;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s;

  &:active {
    transform: scale(0.95);
  }
}

.text-preview {
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.preview-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
  font-weight: bold;
}

.preview-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  word-break: break-all;
}

/* 空状态 */
.empty-state {
  background: white;
  border-radius: 20rpx;
  padding: 120rpx 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  text-align: center;
}

.empty-icon {
  font-size: 120rpx;
  display: block;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  font-weight: bold;
  display: block;
  margin-bottom: 16rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #999;
  display: block;
}

/* 隐藏的Canvas */
.qrcode-canvas {
  position: absolute;
  left: -9999rpx;
  width: 500rpx;
  height: 500rpx;
}
</style>
