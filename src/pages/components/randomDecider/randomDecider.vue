<template>
  <view class="container">
    <!-- 页面头部 -->
    <PageHeader title="🎴 随机决策助手" subtitle="帮你做出选择" />

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 模式选择 -->
      <view class="mode-tabs">
        <view 
          class="mode-tab" 
          :class="{ active: currentMode === 'decide' }"
          @click="currentMode = 'decide'"
        >
          <text>决策助手</text>
        </view>
        <view 
          class="mode-tab" 
          :class="{ active: currentMode === 'random' }"
          @click="currentMode = 'random'"
        >
          <text>随机选择</text>
        </view>
      </view>

      <!-- 决策助手模式 -->
      <view v-show="currentMode === 'decide'" class="mode-content">
        <view class="section-title">输入选项</view>
        
        <view class="options-list">
          <view v-for="(_, index) in options" :key="index" class="option-item">
            <input 
              v-model="options[index]" 
              type="text" 
              :placeholder="`选项 ${index + 1}`"
              class="option-input"
            />
            <view v-if="options.length > 2" class="delete-icon" @click="removeOption(index)">
              ✕
            </view>
          </view>
        </view>

        <view class="button-group">
          <button class="add-option-btn" @click="addOption">
            <text class="btn-icon">➕</text>
            <text>添加选项</text>
          </button>
        </view>

        <!-- 决策结果 -->
        <view v-if="showDecideResult" class="result-section">
          <view class="result-card">
            <view class="result-title">抽签结果</view>
            <view class="lottery-animation" v-if="isSpinning">
              <view class="spinner"></view>
            </view>
            <view v-else class="result-display">
              <text class="result-emoji">🎉</text>
              <text class="result-text">{{ decideResult }}</text>
            </view>
            <button v-if="!isSpinning" class="again-btn" @click="startDecide">
              <text class="btn-icon">🎰</text>
              <text>再来一次</text>
            </button>
          </view>
        </view>

        <button 
          v-else 
          class="decide-btn" 
          @click="startDecide"
          :disabled="options.filter(o => o.trim()).length < 2"
        >
          <text class="btn-icon">🎰</text>
          <text class="btn-text">开始抽签</text>
        </button>
      </view>

      <!-- 随机选择模式 -->
      <view v-show="currentMode === 'random'" class="mode-content">
        <view class="section-title">自定义列表</view>
        
        <view class="preset-buttons">
          <button class="preset-btn" @click="setPreset('meals')">
            <text class="preset-icon">🍽️</text>
            <text>今天吃什么</text>
          </button>
          <button class="preset-btn" @click="setPreset('colors')">
            <text class="preset-icon">🎨</text>
            <text>颜色选择</text>
          </button>
          <button class="preset-btn" @click="setPreset('times')">
            <text class="preset-icon">⏰</text>
            <text>时间段</text>
          </button>
          <button class="preset-btn" @click="setPreset('people')">
            <text class="preset-icon">👥</text>
            <text>人物选择</text>
          </button>
          <button class="preset-btn" @click="setPreset('poker')">
            <text class="preset-icon">🃏</text>
            <text>扑克选择</text>
          </button>
        </view>

        <view class="input-textarea">
          <textarea 
            v-model="randomInput" 
            placeholder="输入项目，每行一个(如:早餐、午餐、晚餐)"
            class="textarea-field"
          ></textarea>
        </view>

        <!-- 随机结果 -->
        <view v-if="showRandomResult" class="result-section">
          <view class="result-card">
            <view class="result-title">你的选择是</view>
            <view class="lottery-animation" v-if="isSpinning">
              <view class="spinner"></view>
            </view>
            <view v-else class="result-display">
              <text class="result-emoji">✨</text>
              <text class="result-text">{{ randomResult }}</text>
            </view>
            <button v-if="!isSpinning" class="again-btn" @click="startRandom">
              <text class="btn-icon">🎲</text>
              <text>再抽一次</text>
            </button>
          </view>
        </view>

        <button 
          v-else 
          class="decide-btn" 
          @click="startRandom"
          :disabled="randomInputItems.length < 2"
        >
          <text class="btn-icon">🎲</text>
          <text class="btn-text">随机选择</text>
        </button>
      </view>

      <!-- 提示 -->
      <view class="tips-section">
        <view class="tips-title">💡 使用说明</view>
        <view class="tips-content">
          <text class="tip-item">• <text class="tip-label">决策助手</text> - 在多个选项中随机选择一个</text>
          <text class="tip-item">• <text class="tip-label">随机选择</text> - 输入自定义项目，随机抽取</text>
          <text class="tip-item">• <text class="tip-label">快速决策</text> - 用于"今天吃什么"等日常决策</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  name: 'RandomDecider',
  ...getShareConfig({
    title: '随机决策助手 - DM工具箱',
    path: '/pages/components/randomDecider/randomDecider'
  })
}
</script>

<script setup lang="ts">
import { ref, computed } from 'vue'
import PageHeader from '@/components/PageHeader.vue'

const currentMode = ref<'decide' | 'random'>('decide')

// 决策模式
const options = ref(['选项 A', '选项 B'])
const decideResult = ref('')
const showDecideResult = ref(false)

// 随机模式
const randomInput = ref('')
const randomResult = ref('')
const showRandomResult = ref(false)

// 动画状态
const isSpinning = ref(false)

/**
 * 计算随机输入的项目数量
 */
const randomInputItems = computed(() => {
  return randomInput.value
    .split('\n')
    .map(item => item.trim())
    .filter(item => item)
})

/**
 * 添加选项
 */
const addOption = () => {
  if (options.value.length < 10) {
    options.value.push('')
  } else {
    uni.showToast({
      title: '最多添加10个选项',
      icon: 'none'
    })
  }
}

/**
 * 删除选项
 */
const removeOption = (index: number) => {
  if (options.value.length > 2) {
    options.value.splice(index, 1)
  }
}

/**
 * 开始决策
 */
const startDecide = async () => {
  const validOptions = options.value.filter(o => o.trim())
  
  if (validOptions.length < 2) {
    uni.showToast({
      title: '至少需要2个选项',
      icon: 'none'
    })
    return
  }

  isSpinning.value = true
  showDecideResult.value = true

  // 模拟转盘动画
  await new Promise(resolve => setTimeout(resolve, 1500))

  const randomIndex = Math.floor(Math.random() * validOptions.length)
  decideResult.value = validOptions[randomIndex]
  isSpinning.value = false
}

/**
 * 预设选项
 */
const setPreset = (type: string) => {
  const presets: { [key: string]: string } = {
    meals: '早餐\n午餐\n晚餐\n宵夜\n外卖\n自己做饭',
    colors: '红色\n橙色\n黄色\n绿色\n蓝色\n紫色',
    times: '8点\n10点\n12点\n14点\n16点\n18点',
    people: '小王\n小李\n小张\n小刘\n小赵',
    poker: [
      '♠️黑桃A', '♠️黑桃2', '♠️黑桃3', '♠️黑桃4', '♠️黑桃5', '♠️黑桃6', '♠️黑桃7', '♠️黑桃8', '♠️黑桃9', '♠️黑桃10', '♠️黑桃J', '♠️黑桃Q', '♠️黑桃K',
      '♥️红心A', '♥️红心2', '♥️红心3', '♥️红心4', '♥️红心5', '♥️红心6', '♥️红心7', '♥️红心8', '♥️红心9', '♥️红心10', '♥️红心J', '♥️红心Q', '♥️红心K',
      '♦️方块A', '♦️方块2', '♦️方块3', '♦️方块4', '♦️方块5', '♦️方块6', '♦️方块7', '♦️方块8', '♦️方块9', '♦️方块10', '♦️方块J', '♦️方块Q', '♦️方块K',
      '♣️梅花A', '♣️梅花2', '♣️梅花3', '♣️梅花4', '♣️梅花5', '♣️梅花6', '♣️梅花7', '♣️梅花8', '♣️梅花9', '♣️梅花10', '♣️梅花J', '♣️梅花Q', '♣️梅花K',
      '🃏王牌'
    ].join('\n')
  }

  randomInput.value = presets[type] || ''
}

/**
 * 开始随机选择
 */
const startRandom = async () => {
  const items = randomInput.value
    .split('\n')
    .map(item => item.trim())
    .filter(item => item)

  if (items.length < 2) {
    uni.showToast({
      title: '至少需要2个项目',
      icon: 'none'
    })
    return
  }

  isSpinning.value = true
  showRandomResult.value = true

  // 模拟转盘动画
  await new Promise(resolve => setTimeout(resolve, 1500))

  const randomIndex = Math.floor(Math.random() * items.length)
  randomResult.value = items[randomIndex]
  isSpinning.value = false
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

/* 模式选择 */
.mode-tabs {
  display: flex;
  gap: 10rpx;
  margin-bottom: 30rpx;
  background: white;
  border-radius: 16rpx;
  padding: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.mode-tab {
  flex: 1;
  padding: 14rpx 20rpx;
  text-align: center;
  font-size: 26rpx;
  color: #999;
  border-radius: 12rpx;
  transition: all 0.3s;

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 500;
  }
}

/* 模式内容 */
.mode-content {
  animation: fadeIn 0.3s;
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 0 auto 24rpx auto;
  max-width: 690rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

/* 段落标题 */
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
  margin-left: 0;
}

/* 选项列表 */
.options-list {
  background: #f5f7fa;
  border-radius: 12rpx;
  padding: 16rpx;
  margin-bottom: 24rpx;
  box-shadow: none;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.option-input {
  flex: 1;
  padding: 12rpx 14rpx;
  font-size: 28rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  background: #fafafa;
  height: 56rpx;

  &:focus {
    border-color: #667eea;
    background: white;
  }
}

.delete-icon {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #999;
  background: #f5f5f5;
  border-radius: 8rpx;

  &:active {
    background: #efefef;
  }
}

/* 按钮组 */
.button-group {
  margin-bottom: 24rpx;
}

.add-option-btn {
  width: 100%;
  height: 80rpx;
  border: 2rpx dashed #667eea;
  border-radius: 12rpx;
  background: transparent;
  color: #667eea;
  font-size: 28rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

/* 预设按钮 */
.preset-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6rpx;
  margin-bottom: 24rpx;
}

.preset-btn {
  background: white;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  width: 100%;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

  &:active {
    background: #f5f5f5;
  }
}

.preset-icon {
  font-size: 40rpx;
  line-height: 40rpx;
  margin-top: 15rpx;
}

/* 文本域 */
.input-textarea {
  background: #f5f7fa;
  border-radius: 12rpx;
  padding: 16rpx;
  margin-bottom: 24rpx;
  box-shadow: none;
}

.textarea-field {
  width: 100%;
  height: 250rpx;
  padding: 12rpx;
  font-size: 28rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  background: #fafafa;
  font-family: monospace;
  resize: none;
  line-height: 1.8;
  overflow-y: auto;
}

/* 决策按钮 */
.decide-btn {
  width: 100%;
  height: 100rpx;
  border: none;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 0;

  &:disabled {
    opacity: 0.5;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
}

.btn-icon {
  font-size: 40rpx;
}

.btn-text {
  font-size: 32rpx;
}

/* 结果区域 */
.result-section {
  margin-bottom: 0;
  animation: slideUp 0.4s ease;
}

.result-card {
  background: white;
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  text-align: center;
}

.result-title {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 24rpx;
}

.lottery-animation {
  padding: 40rpx 0;
}

.spinner {
  display: inline-block;
  width: 60rpx;
  height: 60rpx;
  border: 6rpx solid #f0f0f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.result-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 0;
  animation: popIn 0.5s ease;
}

.result-emoji {
  font-size: 60rpx;
}

.result-text {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  word-break: break-all;
  max-width: 300rpx;
}

.again-btn {
  width: 100%;
  height: 80rpx;
  margin-top: 24rpx;
  border: none;
  border-radius: 12rpx;
  background: #f0f0f0;
  color: #666;
  font-size: 28rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;

  &:active {
    background: #e8e8e8;
  }
}

/* 提示 */
.tips-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  border-left: 4rpx solid #667eea;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
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
  color: #667eea;
  font-weight: 500;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
