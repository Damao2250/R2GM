<template>
  <view class="container">
    <PageHeader title="🚨 紧急演出模式" subtitle="超大字板、临时二维码、闪屏 SOS、简易摩斯电码" />

    <view class="page-content">
      <view class="tab-row">
        <view
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-item"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </view>
      </view>

      <view v-if="activeTab === 'board'" class="card">
        <view class="card-title">超大字板</view>
        <input class="text-input" v-model="boardText" placeholder="输入要展示的大字，例如：请扫码 / 还有空位 / 稍等一下" />
        <view class="slider-row">
          <view class="minor-btn" @click="adjustBoardSize(-12)">A-</view>
          <view class="size-text">字号 {{ boardSize }}</view>
          <view class="minor-btn" @click="adjustBoardSize(12)">A+</view>
        </view>
        <view class="board-preview" :style="{ fontSize: `${boardSize}rpx` }">{{ boardText || '请输入大字内容' }}</view>
      </view>

      <view v-else-if="activeTab === 'qr'" class="card">
        <view class="card-title">临时二维码</view>
        <textarea class="textarea-input" v-model="qrText" maxlength="500" placeholder="输入临时链接、收款说明或联系信息"></textarea>
        <button class="primary-btn" @click="generateQrcode">生成二维码</button>
        <canvas canvas-id="emergencyQrcodeCanvas" class="hidden-canvas"></canvas>
        <image v-if="qrImage" class="qr-image" :src="qrImage" mode="aspectFit"></image>
        <view v-if="qrImage" class="action-row">
          <view class="minor-btn" @click="copyQrText">复制内容</view>
          <view class="minor-btn primary" @click="saveQrImage">保存图片</view>
        </view>
      </view>

      <view v-else-if="activeTab === 'sos'" class="card">
        <view class="card-title">闪屏 SOS</view>
        <view class="sos-screen" :class="{ flashing: isFlashing, dark: flashDark }">SOS</view>
        <button class="primary-btn" @click="toggleFlash">{{ isFlashing ? '停止闪屏' : '开始闪屏' }}</button>
      </view>

      <view v-else class="card">
        <view class="card-title">简易摩斯电码</view>
        <textarea class="textarea-input" v-model="morseInput" maxlength="200" placeholder="输入英文和数字，例如：HELP 123"></textarea>
        <view class="morse-output">{{ morseOutput }}</view>
        <view class="action-row">
          <view class="minor-btn" @click="copyMorse">复制摩斯码</view>
          <view class="minor-btn" @click="fillMorseDemo">填入 HELP</view>
        </view>
      </view>
    </view>
  </view>
</template>

<route lang="json5">
{
  style: {
    navigationBarTitleText: '紧急演出模式',
    enablePullDownRefresh: false
  }
}
</route>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: '紧急演出模式 - DM工具箱',
    path: '/pkg-more/emergencyShow/emergencyShow'
  })
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import drawQrcode from 'weapp-qrcode'
import PageHeader from '@/components/PageHeader.vue'
import { exportCanvasImage, getErrorMessage } from '../utils/canvasTools'
import { recordPersonaSignal } from '@/utils/toolUsage'

type ShowTab = 'board' | 'qr' | 'sos' | 'morse'

const QR_CODE_CANVAS_ID = 'emergencyQrcodeCanvas'
const QR_CODE_SIZE = 320
const MORSE_MAP: Record<string, string> = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
  ' ': '/'
}

const tabs = [
  { id: 'board', label: '超大字板' },
  { id: 'qr', label: '临时二维码' },
  { id: 'sos', label: '闪屏 SOS' },
  { id: 'morse', label: '摩斯电码' }
] as const

const activeTab = ref<ShowTab>('board')
const boardText = ref('请扫码')
const boardSize = ref(84)
const qrText = ref('')
const qrImage = ref('')
const isFlashing = ref(false)
const flashDark = ref(false)
const morseInput = ref('')

let flashTimer: ReturnType<typeof setInterval> | null = null

const morseOutput = computed(() => {
  const text = morseInput.value.trim().toUpperCase()

  if (!text) {
    return '... --- ...'
  }

  return text
    .split('')
    .map(char => MORSE_MAP[char] || '?')
    .join(' ')
})

const clearFlashTimer = () => {
  if (flashTimer) {
    clearInterval(flashTimer)
    flashTimer = null
  }
}

const adjustBoardSize = (delta: number) => {
  boardSize.value = Math.min(140, Math.max(48, boardSize.value + delta))
}

const generateQrcode = async () => {
  if (!qrText.value.trim()) {
    uni.showToast({
      title: '请输入二维码内容',
      icon: 'none'
    })
    return
  }

  try {
    drawQrcode({
      canvasId: QR_CODE_CANVAS_ID,
      width: QR_CODE_SIZE,
      height: QR_CODE_SIZE,
      text: qrText.value,
      colorDark: '#111827',
      colorLight: '#ffffff',
      correctLevel: 2
    })

    qrImage.value = await exportCanvasImage(QR_CODE_CANVAS_ID, QR_CODE_SIZE, QR_CODE_SIZE)
  } catch (error) {
    uni.showToast({
      title: getErrorMessage(error, '二维码生成失败'),
      icon: 'none'
    })
  }
}

const copyQrText = async () => {
  try {
    await uni.setClipboardData({
      data: qrText.value
    })
  } catch (error) {
    uni.showToast({
      title: '复制失败',
      icon: 'none'
    })
  }
}

const saveQrImage = async () => {
  if (!qrImage.value) {
    return
  }

  try {
    await uni.saveImageToPhotosAlbum({
      filePath: qrImage.value
    })
  } catch (error) {
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    })
  }
}

const toggleFlash = () => {
  if (isFlashing.value) {
    isFlashing.value = false
    flashDark.value = false
    clearFlashTimer()
    return
  }

  isFlashing.value = true
  recordPersonaSignal('emergency-flash-start')
  flashTimer = setInterval(() => {
    flashDark.value = !flashDark.value
  }, 360)
}

watch(activeTab, value => {
  if (value !== 'sos' && isFlashing.value) {
    isFlashing.value = false
    flashDark.value = false
    clearFlashTimer()
  }
})

const fillMorseDemo = () => {
  morseInput.value = 'HELP 123'
}

const copyMorse = async () => {
  try {
    await uni.setClipboardData({
      data: morseOutput.value
    })
  } catch (error) {
    uni.showToast({
      title: '复制失败',
      icon: 'none'
    })
  }
}

onBeforeUnmount(() => {
  clearFlashTimer()
})
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f7fa;
}

.page-content {
  padding: 30rpx;
}

.tab-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.tab-item {
  padding: 16rpx 20rpx;
  border-radius: 18rpx;
  background: #e2e8f0;
  color: #334155;
  font-size: 25rpx;
}

.tab-item.active {
  background: #111827;
  color: #fff;
}

.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.06);
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20rpx;
}

.text-input,
.textarea-input {
  width: 100%;
  box-sizing: border-box;
  border-radius: 18rpx;
  border: 2rpx solid #e5e7eb;
  background: #f9fafb;
  font-size: 28rpx;
  color: #111827;
  margin-bottom: 20rpx;
}

.text-input {
  min-height: 96rpx;
  height: 96rpx;
  padding: 0 24rpx;
  line-height: 96rpx;
}

.textarea-input {
  min-height: 220rpx;
  padding: 24rpx;
  line-height: 1.7;
}

.slider-row,
.action-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.minor-btn {
  flex: 1;
  text-align: center;
  padding: 18rpx 0;
  border-radius: 18rpx;
  background: #e0e7ff;
  color: #4338ca;
  font-size: 25rpx;
}

.minor-btn.primary {
  background: #111827;
  color: #fff;
}

.size-text {
  min-width: 140rpx;
  text-align: center;
  font-size: 24rpx;
  color: #475569;
}

.primary-btn {
  width: 100%;
  border: none;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #111827 0%, #334155 100%);
  color: #fff;
  font-size: 30rpx;
  padding: 24rpx 0;
}

.board-preview {
  min-height: 360rpx;
  border-radius: 24rpx;
  background: #111827;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1.25;
  padding: 24rpx;
}

.hidden-canvas {
  position: fixed;
  left: -9999px;
  top: -9999px;
  width: 320px;
  height: 320px;
  opacity: 0;
}

.qr-image {
  width: 360rpx;
  height: 360rpx;
  display: block;
  margin: 20rpx auto;
  border-radius: 24rpx;
  background: #fff;
}

.sos-screen {
  height: 360rpx;
  border-radius: 24rpx;
  background: #ef4444;
  color: #fff;
  font-size: 120rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 10rpx;
  margin-bottom: 20rpx;
}

.sos-screen.flashing.dark {
  background: #111827;
}

.morse-output {
  min-height: 180rpx;
  border-radius: 18rpx;
  background: #f8fafc;
  padding: 22rpx;
  font-size: 28rpx;
  color: #0f172a;
  line-height: 1.8;
  word-break: break-all;
  margin-bottom: 20rpx;
}
</style>
