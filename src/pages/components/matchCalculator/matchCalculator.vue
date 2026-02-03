<template>
  <view class="container">
    <!-- 页面头部 -->
    <PageHeader title="💑 配对缘分计算" subtitle="测测你们的匹配度" />

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 输入区域 -->
      <view class="input-section">
        <view class="input-card">
          <view class="input-item">
            <text class="input-label">你的名字</text>
            <view class="input-wrapper">
              <input 
                v-model="yourName" 
                type="text" 
                placeholder="请输入名字"
                class="input-field"
                maxlength="10"
              />
              <view v-if="yourName" class="clear-btn" @click="yourName = ''">✕</view>
            </view>
          </view>

          <view class="divider"></view>

          <view class="input-item">
            <text class="input-label">TA的名字</text>
            <view class="input-wrapper">
              <input 
                v-model="theirName" 
                type="text" 
                placeholder="请输入名字"
                class="input-field"
                maxlength="10"
              />
              <view v-if="theirName" class="clear-btn" @click="theirName = ''">✕</view>
            </view>
          </view>

          <button class="calculate-btn" @click="calculateMatch" :disabled="!yourName || !theirName">
            <text class="btn-icon">{{ showResult ? '🔄' : '✨' }}</text>
            <text class="btn-text">{{ showResult ? '重新测试' : '开始测试' }}</text>
          </button>
        </view>
      </view>

      <!-- 结果展示 -->
      <view v-if="showResult" class="result-section">
        <!-- 缘分等级 -->
        <view class="match-card">
          <view class="match-header">
            <text class="match-label">缘分指数</text>
            <text class="match-value">{{ matchScore }}%</text>
          </view>

          <!-- 进度条 -->
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: matchScore + '%' }"></view>
          </view>

          <!-- 评级 -->
          <view class="rating">
            <text class="rating-text">{{ ratingText }}</text>
            <text class="rating-emoji">{{ ratingEmoji }}</text>
          </view>

          <!-- 配对建议 -->
          <view class="advice">
            <text>{{ adviceText }}</text>
          </view>
        </view>

        <!-- 详细分析 -->
        <view class="analysis-card">
          <view class="analysis-title">详细分析</view>
          <view class="analysis-item">
            <text class="analysis-label">姓名笔画</text>
            <view class="analysis-content">
              <view class="mini-progress">
                <view class="mini-fill" :style="{ width: strokeScore + '%' }"></view>
              </view>
              <text class="analysis-value">{{ strokeScore }}%</text>
            </view>
          </view>
          <view class="analysis-item">
            <text class="analysis-label">五行搭配</text>
            <view class="analysis-content">
              <view class="mini-progress">
                <view class="mini-fill" :style="{ width: wuxingScore + '%' }"></view>
              </view>
              <text class="analysis-value">{{ wuxingScore }}%</text>
            </view>
          </view>
          <view class="analysis-item">
            <text class="analysis-label">音韵和谐</text>
            <view class="analysis-content">
              <view class="mini-progress">
                <view class="mini-fill" :style="{ width: soundScore + '%' }"></view>
              </view>
              <text class="analysis-value">{{ soundScore }}%</text>
            </view>
          </view>
          <view class="analysis-item">
            <text class="analysis-label">字义搭配</text>
            <view class="analysis-content">
              <view class="mini-progress">
                <view class="mini-fill" :style="{ width: meaningScore + '%' }"></view>
              </view>
              <text class="analysis-value">{{ meaningScore }}%</text>
            </view>
          </view>
        </view>

        <!-- 名字对比 -->
        <view class="names-card">
          <view class="names-title">你们的名字</view>
          <view class="names-display">
            <view class="name-box">
              <text class="name-label">你</text>
              <text class="name-value">{{ yourName }}</text>
            </view>
            <view class="heart">💕</view>
            <view class="name-box">
              <text class="name-label">TA</text>
              <text class="name-value">{{ theirName }}</text>
            </view>
          </view>
        </view>

        <!-- 分享提示 -->
        <view class="share-tips">
          <text class="tips-icon">👇</text>
          <text class="tips-text">向下滑动可分享此结果</text>
        </view>
      </view>

      <!-- 使用提示 -->
      <view class="tips-section" v-if="!showResult">
        <view class="tips-title">💡 说明</view>
        <view class="tips-content">
          <text class="tip-item">• 此工具为娱乐性工具，仅供参考</text>
          <text class="tip-item">• 缘分指数根据姓名笔画、五行、音韵综合计算</text>
          <text class="tip-item">• 结果仅代表名字的搭配程度，不代表真实关系</text>
          <text class="tip-item">• 可分享给朋友一起试试</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  name: 'MatchCalculator',
  ...getShareConfig({
    title: '配对缘分计算 - DM工具箱',
    path: '/pages/components/matchCalculator/matchCalculator'
  })
}
</script>

<script setup lang="ts">
import { ref, computed } from 'vue'
import PageHeader from '@/components/PageHeader.vue'

const yourName = ref('')
const theirName = ref('')
const showResult = ref(false)

const strokeScore = ref(0)
const wuxingScore = ref(0)
const soundScore = ref(0)
const meaningScore = ref(0)

const matchScore = computed(() => {
  return Math.round((strokeScore.value + wuxingScore.value + soundScore.value + meaningScore.value) / 4)
})

const ratingText = computed(() => {
  if (matchScore.value >= 90) return '天生一对'
  if (matchScore.value >= 80) return '非常般配'
  if (matchScore.value >= 70) return '很好搭配'
  if (matchScore.value >= 60) return '相当不错'
  if (matchScore.value >= 50) return '有些相合'
  return '缘分有限'
})

const ratingEmoji = computed(() => {
  if (matchScore.value >= 90) return '💑'
  if (matchScore.value >= 80) return '💕'
  if (matchScore.value >= 70) return '😍'
  if (matchScore.value >= 60) return '😊'
  if (matchScore.value >= 50) return '🤔'
  return '😅'
})

const adviceText = computed(() => {
  if (matchScore.value >= 90) return '你们的名字搭配完美，简直就是天生一对！'
  if (matchScore.value >= 80) return '绝佳的搭配！名字里充满了你们的缘分。'
  if (matchScore.value >= 70) return '配对得相当不错，这样的组合很和谐。'
  if (matchScore.value >= 60) return '搭配还是不错的，有不少共通之处。'
  if (matchScore.value >= 50) return '虽然有些差异，但也能找到共同点。'
  return '缘分还需要时间来证明呢，加油！'
})

/**
 * 计算字符串的哈希值
 * 用于生成伪随机的分值
 */
const getHashScore = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * 计算字符串笔画分
 */
const calculateStrokeScore = (): number => {
  const combined = yourName.value + theirName.value
  const hash = getHashScore(combined)
  const baseScore = (hash % 40) + 60 // 60-100分
  return baseScore
}

/**
 * 计算五行搭配分
 */
const calculateWuxingScore = (): number => {
  const combined = yourName.value + theirName.value
  const hash = getHashScore(combined + 'wuxing')
  const baseScore = (hash % 40) + 60
  return baseScore
}

/**
 * 计算音韵和谐分
 */
const calculateSoundScore = (): number => {
  const combined = yourName.value + theirName.value
  const hash = getHashScore(combined + 'sound')
  
  // 检查谐音（同音字）
  let soundBonus = 0
  for (let i = 0; i < yourName.value.length; i++) {
    for (let j = 0; j < theirName.value.length; j++) {
      if (yourName.value[i] === theirName.value[j]) {
        soundBonus += 5
      }
    }
  }
  
  const baseScore = (hash % 40) + 60
  return Math.min(100, baseScore + soundBonus)
}

/**
 * 计算字义搭配分
 */
const calculateMeaningScore = (): number => {
  const combined = yourName.value + theirName.value
  const hash = getHashScore(combined + 'meaning')
  const baseScore = (hash % 40) + 60
  return baseScore
}

const calculateMatch = () => {
  strokeScore.value = calculateStrokeScore()
  wuxingScore.value = calculateWuxingScore()
  soundScore.value = calculateSoundScore()
  meaningScore.value = calculateMeaningScore()
  
  showResult.value = true
  
  // 滚动到结果位置
  setTimeout(() => {
    uni.pageScrollTo({
      scrollTop: 300,
      duration: 300
    })
  }, 100)
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5f7 0%, #f5f0ff 100%);
  padding: 0 0 40rpx 0;
}

.page-content {
  padding: 30rpx;
}

/* 输入区域 */
.input-section {
  margin-bottom: 30rpx;
}

.input-card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.input-item {
  margin-bottom: 20rpx;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.input-label {
  display: block;
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
  margin-bottom: 12rpx;
}

.input-field {
  width: 100%;
  padding: 14rpx 16rpx;
  font-size: 32rpx;
  border: 2rpx solid #e8d7ff;
  border-radius: 12rpx;
  background: #faf8ff;
  height: 64rpx;

  &:focus {
    border-color: #c99ddc;
    background: white;
  }
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper .input-field {
  padding-right: 40rpx;
}

.clear-btn {
  position: absolute;
  right: 12rpx;
  width: 28rpx;
  height: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 20rpx;
}

.divider {
  height: 2rpx;
  background: linear-gradient(90deg, transparent, #e8d7ff, transparent);
  margin: 24rpx 0;
}

.calculate-btn {
  width: 100%;
  height: 88rpx;
  margin-top: 24rpx;
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

  &:active:not(:disabled) {
    opacity: 0.9;
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
  }
}

.btn-icon {
  font-size: 36rpx;
}

.btn-text {
  font-size: 32rpx;
}

/* 结果区域 */
.result-section {
  animation: slideUp 0.4s ease;
}

.match-card {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  text-align: center;
}

.match-header {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.match-label {
  font-size: 28rpx;
  color: #999;
}

.match-value {
  font-size: 56rpx;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.progress-bar {
  width: 100%;
  height: 16rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 8rpx;
  transition: width 0.6s ease;
}

.rating {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.rating-emoji {
  font-size: 48rpx;
}

.rating-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.advice {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

/* 详细分析 */
.analysis-card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.analysis-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.analysis-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  gap: 16rpx;

  &:last-child {
    border-bottom: none;
  }
}

.analysis-label {
  font-size: 28rpx;
  color: #666;
  min-width: 70rpx;
}

.analysis-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.mini-progress {
  flex: 1;
  height: 8rpx;
  background: #f0f0f0;
  border-radius: 4rpx;
  overflow: hidden;
}

.mini-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4rpx;
  transition: width 0.6s ease;
}

.analysis-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #764ba2;
  min-width: 45rpx;
  text-align: right;
}

/* 名字展示 */
.names-card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.names-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
  text-align: center;
}

.names-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
}

.name-box {
  flex: 1;
  padding: 20rpx;
  background: #f0f4ff;
  border-radius: 16rpx;
  text-align: center;
  border: 2rpx solid #e0e8ff;
}

.name-label {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.name-value {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #667eea;
}

.heart {
  font-size: 48rpx;
  animation: heartBeat 1.2s infinite;
}

/* 分享提示 */
.share-tips {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 20rpx 0;
  font-size: 26rpx;
  color: #999;
}

.tips-icon {
  font-size: 28rpx;
  animation: bounce 1.5s infinite;
}

/* 说明 */
.tips-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  border-left: 4rpx solid #764ba2;
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

@keyframes heartBeat {
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.2);
  }
  50% {
    transform: scale(1);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(4rpx);
  }
}
</style>
