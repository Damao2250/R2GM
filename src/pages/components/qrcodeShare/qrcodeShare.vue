<template>
  <view class="page-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="page-title">📱 二维码分享</text>
    </view>

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 输入区域 -->
      <view class="input-section">
        <text class="section-label">输入要分享的文本</text>
        <textarea
          class="input-textarea"
          v-model="inputText"
          placeholder="输入文本或粘贴内容..."
          @input="onInput"
          maxlength="1000"
        ></textarea>
        <view class="char-count">{{ inputText.length }}/1000</view>
      </view>

      <!-- 按钮组 -->
      <view class="button-group">
        <button class="btn btn-secondary" @click="scanQrcode">📸 扫描</button>
        <button class="btn btn-secondary" @click="pasteText">📋 粘贴</button>
        <button class="btn btn-secondary" @click="clearText">🗑️ 清空</button>
        <button class="btn btn-primary" @click="generateQrcode" :disabled="!inputText">生成二维码</button>
      </view>

      <!-- Canvas 容器 -->
      <canvas canvas-id="qrcodeCanvas" class="qrcode-canvas"></canvas>

      <!-- 二维码显示区域 -->
      <view v-if="qrcodeUrl" class="qrcode-section">
        <text class="section-title">📲 二维码</text>
        <view class="qrcode-container">
          <image :src="qrcodeUrl" class="qrcode-image" mode="aspectFit"></image>
        </view>

        <!-- 二维码操作 -->
        <view class="qrcode-actions">
          <button class="action-btn" @click="copyText">📋 复制文本</button>
          <button class="action-btn" @click="saveQrcode">💾 保存二维码</button>
        </view>

        <!-- 文本预览 -->
        <view class="text-preview">
          <text class="preview-label">📝 文本预览</text>
          <view class="preview-box">
            <text class="preview-text">{{ inputText }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-icon">🔍</text>
        <text class="empty-text">输入文本并点击"生成二维码"</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import drawQrcode from 'weapp-qrcode'

const inputText = ref('')
const qrcodeUrl = ref('')

onLoad(() => {
  // 页面加载逻辑
})

const onInput = () => {
  // 实时输入处理
}

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

    // 直接调用 weapp-qrcode 绘制到 canvas
    drawQrcode({
      width: 250,
      height: 250,
      canvasId: 'qrcodeCanvas',
      text: inputText.value,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: 2
    })

    // 绘制完成后导出为临时文件（给 canvas 充分时间完成渲染）
    setTimeout(() => {
      uni.canvasToTempFilePath({
        canvasId: 'qrcodeCanvas',
        destWidth: 250,
        destHeight: 250,
        success: (res: any) => {
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
            title: '生成失败，请重试',
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

  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: #ffffff;
  }
}

.page-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 输入区域 */
.input-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: $app-spacing-lg;
  margin-bottom: $app-spacing-lg;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .section-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: $app-spacing-md;
  }

  .input-textarea {
    width: 100%;
    height: 150px;
    padding: 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    color: #333;
    background-color: #fafafa;
    box-sizing: border-box;
    line-height: 1.5;
  }

  .char-count {
    text-align: right;
    font-size: 12px;
    color: #999;
    margin-top: 8px;
  }
}

/* 按钮组 */
.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: $app-spacing-md;
  margin-bottom: $app-spacing-lg;

  .btn {
    flex: 1;
    min-width: 70px;
    padding: 12px;
    border-radius: 8px;
    border: none;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.3s ease;

    &.btn-primary {
      flex-basis: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;

      &:active {
        opacity: 0.8;
        transform: scale(0.98);
      }

      &:disabled {
        opacity: 0.5;
      }
    }

    &.btn-secondary {
      background-color: #f0f0f0;
      color: #333;
      border: 1px solid #e0e0e0;

      &:active {
        background-color: #e8e8e8;
      }
    }
  }
}

/* 二维码区域 */
.qrcode-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: $app-spacing-lg;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .section-title {
    display: block;
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: $app-spacing-lg;
  }
}

.qrcode-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: $app-spacing-lg;
  padding: $app-spacing-lg;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 2px dashed #e0e0e0;

  .qrcode-image {
    width: 250px;
    height: 250px;
    border-radius: 8px;
  }
}

/* 二维码操作按钮 */
.qrcode-actions {
  display: flex;
  gap: $app-spacing-md;
  margin-bottom: $app-spacing-lg;

  .action-btn {
    flex: 1;
    padding: 12px;
    background-color: #f0f0f0;
    color: #333;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;

    &:active {
      background-color: #e8e8e8;
      transform: scale(0.98);
    }
  }
}

/* 文本预览 */
.text-preview {
  margin-top: $app-spacing-lg;
  padding-top: $app-spacing-lg;
  border-top: 1px solid #f0f0f0;

  .preview-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: $app-spacing-md;
  }

  .preview-box {
    background-color: #f9f9f9;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: $app-spacing-md;
    max-height: 200px;
    overflow-y: auto;

    .preview-text {
      font-size: 13px;
      color: #666;
      line-height: 1.6;
      word-break: break-all;
    }
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px $app-spacing-lg;
  text-align: center;

  .empty-icon {
    font-size: 48px;
    margin-bottom: $app-spacing-lg;
  }

  .empty-text {
    font-size: 14px;
    color: #999;
  }
}

/* Canvas 容器（隐藏） */
.qrcode-canvas {
  position: absolute;
  left: -9999px;
  width: 250px;
  height: 250px;
}
</style>
