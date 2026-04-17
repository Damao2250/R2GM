<template>
  <view class="container">
    <!-- 页面头部 -->
    <PageHeader title="🎲 随机数工具" subtitle="随机数·抛硬币·掷骰子" />

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 功能1: 随机数生成 -->
      <view class="card random-number-card">
        <view class="card-title">🎯 幸运数字</view>

        <view class="input-group">
          <view class="input-item">
            <text class="input-label">最小值</text>
            <input
              class="input-field"
              type="number"
              v-model="minValue"
              placeholder="请输入最小值"
            />
          </view>
          <view class="input-item">
            <text class="input-label">最大值</text>
            <input
              class="input-field"
              type="number"
              v-model="maxValue"
              placeholder="请输入最大值"
            />
          </view>
        </view>

        <view class="input-item">
          <text class="input-label">抽取个数</text>
          <input class="input-field" type="number" v-model="count" placeholder="请输入抽取个数" />
        </view>

        <view class="checkbox-item">
          <checkbox-group @change="onAllowDuplicateChange">
            <label>
              <checkbox :checked="allowDuplicate" />
              <text class="checkbox-label">允许重复</text>
            </label>
          </checkbox-group>
          <checkbox-group @change="onGenerateOneByOneChange">
            <label>
              <checkbox :checked="generateOneByOne" />
              <text class="checkbox-label">逐个生成</text>
            </label>
          </checkbox-group>
        </view>

        <button class="generate-btn" @click="isGenerating ? cancelGenerate() : generateRandomNumbers()">
          <text class="btn-text" v-if="!isGenerating">🎲 生成幸运数</text>
          <text class="btn-text generating" v-else>⏸️ 停止生成</text>
        </button>

        <view class="result-area" v-if="randomResults.length > 0">
          <view class="result-title">{{ isGenerating ? '正在生成...' : '生成结果' }}</view>
          <view class="result-numbers">
            <view
              class="number-item"
              :class="{ rolling: isGenerating, final: !isGenerating }"
              v-for="(num, index) in randomResults"
              :key="index"
              :style="{ animationDelay: index * 0.05 + 's' }"
            >
              {{ num }}
            </view>
          </view>
          <button class="copy-result-btn" @click="copyRandomResults" v-if="!isGenerating">
            📋 复制结果
          </button>
        </view>
      </view>

      <!-- 功能2: 抛硬币 -->
      <view class="card coin-card">
        <view class="card-title">🪙 抛硬币</view>

        <view class="coin-container" @click="flipCoin">
          <view class="coin" :class="{ flipping: isFlipping, [coinResult]: !isFlipping }">
            <view class="coin-face coin-heads">
              <text class="coin-text">正面</text>
            </view>
            <view class="coin-face coin-tails">
              <text class="coin-text">反面</text>
            </view>
          </view>
        </view>

        <view class="coin-result" :class="{ visible: coinResult && !isFlipping }">
          {{ coinResult ? (coinResult === 'heads' ? '🎊 正面' : '🎉 反面') : ' ' }}
        </view>

        <button class="action-btn" @click="flipCoin" :disabled="isFlipping">
          {{ isFlipping ? '抛掷中...' : '🪙 抛硬币' }}
        </button>

        <view class="statistics" v-if="coinStats.total > 0">
          <text class="stats-text">统计: 正面 {{ coinStats.heads }} 次 | 反面 {{ coinStats.tails }} 次</text>
          <button class="reset-stats-btn" @click="resetCoinStats">重置</button>
        </view>
      </view>

      <!-- 功能3: 掷骰子 -->
      <view class="card dice-card">
        <view class="card-title">🎲 掷骰子</view>

        <view class="dice-selector">
          <text class="selector-label">骰子数量</text>
          <view class="dice-count-buttons">
            <view
              class="count-btn"
              v-for="num in [1, 2, 3]"
              :key="num"
              :class="{ active: diceCount === num }"
              @click="diceCount = num"
            >
              {{ num }}
            </view>
          </view>
        </view>

        <view class="dice-container">
          <view
            class="dice-wrapper"
            v-for="(value, index) in diceResults"
            :key="index"
          >
            <view 
              class="dice"
              :class="{ rolling: isRolling, ['show-' + value]: !isRolling, [diceAnimations[index]]: isRolling }"
              :style="{ 
                animationDelay: index * 0.1 + 's'
              }"
            >
              <!-- 面1 (前面) -->
              <view class="dice-face face-1">
                <view class="dice-dots dots-1">
                  <view class="dot"></view>
                </view>
              </view>
              <!-- 面2 (右面) -->
              <view class="dice-face face-2">
                <view class="dice-dots dots-2">
                  <view class="dot"></view>
                  <view class="dot"></view>
                </view>
              </view>
              <!-- 面3 (上面) -->
              <view class="dice-face face-3">
                <view class="dice-dots dots-3">
                  <view class="dot"></view>
                  <view class="dot"></view>
                  <view class="dot"></view>
                </view>
              </view>
              <!-- 面4 (下面) -->
              <view class="dice-face face-4">
                <view class="dice-dots dots-4">
                  <view class="dot"></view>
                  <view class="dot"></view>
                  <view class="dot"></view>
                  <view class="dot"></view>
                </view>
              </view>
              <!-- 面5 (左面) -->
              <view class="dice-face face-5">
                <view class="dice-dots dots-5">
                  <view class="dot"></view>
                  <view class="dot"></view>
                  <view class="dot"></view>
                  <view class="dot"></view>
                  <view class="dot"></view>
                </view>
              </view>
              <!-- 面6 (后面) -->
              <view class="dice-face face-6">
                <view class="dice-dots dots-6">
                  <view class="dot"></view>
                  <view class="dot"></view>
                  <view class="dot"></view>
                  <view class="dot"></view>
                  <view class="dot"></view>
                  <view class="dot"></view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="dice-sum" :class="{ visible: !isRolling && diceResults.length > 0 }">
          总点数: {{ diceSum }}
        </view>

        <button class="action-btn" @click="rollDice" :disabled="isRolling">
          {{ isRolling ? '投掷中...' : '🎲 掷骰子' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: '随机数工具 - DM工具箱',
    path: '/pages/components/randomNumber/randomNumber'
  })
}
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import dayjs from '@/utils/dayjs'

// 随机数生成相关
const minValue = ref('1')
const maxValue = ref('100')
const count = ref('1')
const allowDuplicate = ref(true)
const generateOneByOne = ref(true)
const randomResults = ref<number[]>([])
const isGenerating = ref(false)
let generateTimer: any = null

// 抛硬币相关
const coinResult = ref<'heads' | 'tails' | ''>('')
const isFlipping = ref(false)
const coinStats = ref({ heads: 0, tails: 0, total: 0 })

// 掷骰子相关
const diceCount = ref(1)
const diceResults = ref<number[]>([1])
const diceAnimations = ref<string[]>([])  // 为每个骰子存储不同的动画名称
const isRolling = ref(false)

// 监听骰子数量变化，自动更新显示
watch(diceCount, (newCount) => {
  if (!isRolling.value) {
    diceResults.value = new Array(newCount).fill(1)
  }
}, { immediate: true })

// 掷骰子总点数
const diceSum = computed(() => {
  return diceResults.value.reduce((sum, val) => sum + val, 0)
})

/**
 * 增强的随机数生成器 - 结合多个随机源
 */
const getSecureRandom = () => {
  // 方法1: 使用Date的毫秒时间戳
  const now = dayjs().valueOf()
  const timeSeed = (now * Math.random()) % 1

  // 方法2: 使用多次Math.random()混合
  let mixedRandom = 0
  for (let i = 0; i < 3; i++) {
    mixedRandom += Math.random()
  }
  mixedRandom = mixedRandom % 1

  // 方法3: 使用JSON.stringify的对象引用作为额外随机源
  const objSeed = (Math.random() + dayjs().millisecond() / 1000) % 1

  // 混合所有随机源
  const combined = (timeSeed + mixedRandom + objSeed) / 3

  // XorShift算法进一步混淆
  let seed = Math.floor(combined * 0xffffffff)
  seed ^= seed << 13
  seed ^= seed >> 17
  seed ^= seed << 5
  
  return Math.abs(seed / 0xffffffff)
}

/**
 * 生成指定范围内的随机整数
 */
const getRandomInt = (min: number, max: number): number => {
  const random = getSecureRandom()
  return Math.floor(random * (max - min + 1)) + min
}

/**
 * 生成随机数
 */
const generateRandomNumbers = () => {
  if (isGenerating.value) return

  const min = parseInt(minValue.value)
  const max = parseInt(maxValue.value)
  const num = parseInt(count.value)

  if (isNaN(min) || isNaN(max) || isNaN(num)) {
    uni.showToast({
      title: '请输入有效的数字',
      icon: 'none'
    })
    return
  }

  if (min >= max) {
    uni.showToast({
      title: '最小值必须小于最大值',
      icon: 'none'
    })
    return
  }

  if (num <= 0 || num > 1000) {
    uni.showToast({
      title: '抽取个数需在1-1000之间',
      icon: 'none'
    })
    return
  }

  if (!allowDuplicate.value && num > max - min + 1) {
    uni.showToast({
      title: '不允许重复时，抽取个数不能超过范围',
      icon: 'none'
    })
    return
  }

  // 开始生成动画
  isGenerating.value = true
  randomResults.value = []

  // 先生成所有结果
  const finalResults: number[] = []

  if (allowDuplicate.value) {
    // 允许重复 - 使用增强的随机数生成器
    for (let i = 0; i < num; i++) {
      finalResults.push(getRandomInt(min, max))
    }
  } else {
    // 不允许重复 - 使用 Fisher-Yates 洗牌算法
    const available = Array.from({ length: max - min + 1 }, (_, i) => min + i)

    // Fisher-Yates 洗牌
    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(getSecureRandom() * (i + 1))
      ;[available[i], available[j]] = [available[j], available[i]]
    }

    // 取前 num 个
    finalResults.push(...available.slice(0, num))
  }

  // 判断生成模式
  if (!generateOneByOne.value) {
    // 一次全部生成模式 - 所有数字同时滚动
    randomResults.value = new Array(num).fill(0)
    
    let rollCount = 0
    const maxRolls = 15 // 滚动15次
    generateTimer = setInterval(() => {
      // 所有数字同时滚动
      const tempResults: number[] = []
      for (let i = 0; i < num; i++) {
        tempResults.push(getRandomInt(min, max))
      }
      randomResults.value = tempResults

      rollCount++
      if (rollCount >= maxRolls) {
        clearInterval(generateTimer)
        generateTimer = null
        // 显示最终结果
        randomResults.value = finalResults
        isGenerating.value = false
      }
    }, 50)
  } else {
    // 逐个生成模式 - 每个数字显示前先滚动
    let currentIndex = 0
    const showNextNumber = () => {
      if (currentIndex >= finalResults.length) {
        isGenerating.value = false
        return
      }

      // 当前数字滚动动画
      let rollCount = 0
      const maxRolls = 10 // 滚动10次
      generateTimer = setInterval(() => {
        // 显示滚动中的随机数（只更新当前位置）
        const tempResults = [...randomResults.value]
        tempResults[currentIndex] = getRandomInt(min, max)
        randomResults.value = tempResults

        rollCount++
        if (rollCount >= maxRolls) {
          clearInterval(generateTimer)
          
          // 显示最终数字
          const finalTemp = [...randomResults.value]
          finalTemp[currentIndex] = finalResults[currentIndex]
          randomResults.value = finalTemp
          
          // 延迟后显示下一个
          currentIndex++
          generateTimer = setTimeout(showNextNumber, 150)
        }
      }, 50)
    }

    // 开始显示第一个
    setTimeout(showNextNumber, 100)
  }
}

/**
 * 取消生成
 */
const cancelGenerate = () => {
  if (generateTimer) {
    clearInterval(generateTimer)
    clearTimeout(generateTimer)
    generateTimer = null
  }
  isGenerating.value = false
  uni.showToast({
    title: '已停止生成',
    icon: 'none'
  })
}

/**
 * 复制随机数结果
 */
const copyRandomResults = () => {
  const text = randomResults.value.join(', ')
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({
        title: '已复制',
        icon: 'success'
      })
    }
  })
}

/**
 * 允许重复选项变化
 */
const onAllowDuplicateChange = (e: any) => {
  allowDuplicate.value = e.detail.value.length > 0
}

/**
 * 生成模式选项变化
 */
const onGenerateOneByOneChange = (e: any) => {
  generateOneByOne.value = e.detail.value.length > 0
}

/**
 * 抛硬币
 */
const flipCoin = () => {
  if (isFlipping.value) return

  isFlipping.value = true
  coinResult.value = ''

  setTimeout(() => {
    // 使用 Math.random() 生成0-1之间的随机数
    const randomValue = Math.random()
    // 严格的 50/50 概率：< 0.5 为正面，>= 0.5 为反面
    const result = randomValue < 0.5 ? 'heads' : 'tails'
    
    coinResult.value = result
    isFlipping.value = false

    // 更新统计
    coinStats.value.total++
    if (result === 'heads') {
      coinStats.value.heads++
    } else {
      coinStats.value.tails++
    }
  }, 1000)
}

/**
 * 重置硬币统计
 */
const resetCoinStats = () => {
  coinStats.value = { heads: 0, tails: 0, total: 0 }
  uni.showToast({
    title: '统计已重置',
    icon: 'success'
  })
}

/**
 * 掷骰子
 */
const rollDice = () => {
  if (isRolling.value) return

  // 先生成最终结果
  const results: number[] = []
  const animations: string[] = []
  const animationTypes = ['roll3d-v1', 'roll3d-v2', 'roll3d-v3']
  
  for (let i = 0; i < diceCount.value; i++) {
    results.push(getRandomInt(1, 6))
    // 为每个骰子随机选择不同的旋转动画
    animations.push(animationTypes[Math.floor(Math.random() * animationTypes.length)])
  }
  
  // 初始化显示为全1，准备动画
  diceResults.value = new Array(diceCount.value).fill(1)
  diceAnimations.value = animations
  isRolling.value = true

  setTimeout(() => {
    // 动画完成后显示最终结果
    diceResults.value = results
    diceAnimations.value = []
    isRolling.value = false
  }, 1500)
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

.card {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

/* ===== 随机数生成 ===== */
.input-group {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.input-item {
  flex: 1;
  margin-bottom: 20rpx;

  .input-label {
    display: block;
    font-size: 28rpx;
    color: #666;
    margin-bottom: 12rpx;
    font-weight: 500;
  }

  .input-field {
    width: 100%;
    padding: 16rpx 24rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    font-size: 32rpx;
    border: 2rpx solid #e0e0e0;
    box-sizing: border-box;
    height: 88rpx;
    line-height: 56rpx;
    vertical-align: middle;
  }
}

.checkbox-item {
  margin: 20rpx 0 30rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 30rpx;

  checkbox-group {
    flex-shrink: 0;
  }

  label {
    display: flex;
    align-items: center;
  }

  .checkbox-label {
    font-size: 28rpx;
    color: #666;
    margin-left: 12rpx;
  }
}

.generate-btn {
  width: 100%;
  padding: 28rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12rpx;
  border: none;
  position: relative;
  overflow: hidden;

  &:active:not(:disabled) {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.6;
  }

  .btn-text {
    font-size: 32rpx;
    font-weight: bold;
    color: white;
    position: relative;
    z-index: 1;

    &.generating {
      animation: pulse 1s ease-in-out infinite;
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    text-align: center;
  }
}

.result-area {
  padding: 30rpx;
  background: #f8f9ff;
  border-radius: 16rpx;
  border: 2rpx solid #e0e5ff;

  .result-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #667eea;
    margin-bottom: 20rpx;
  }

  .result-numbers {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-bottom: 20rpx;
  }

  .number-item {
    min-width: 80rpx;
    padding: 16rpx 24rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12rpx;
    font-size: 32rpx;
    font-weight: bold;
    text-align: center;
  }

  .copy-result-btn {
    width: 100%;
    padding: 20rpx;
    background: white;
    border: 2rpx solid #667eea;
    color: #667eea;
    border-radius: 12rpx;
    font-size: 28rpx;
    font-weight: 600;

    &:active {
      background: #f0f4ff;
    }
  }
}

/* ===== 抛硬币 ===== */
.coin-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300rpx;
  margin: 20rpx 0;
}

.coin {
  width: 200rpx;
  height: 200rpx;
  position: relative;
  transform-style: preserve-3d;
  cursor: pointer;

  &.flipping {
    animation: flip 1s linear;
  }

  &.heads {
    transform: rotateY(0deg);
  }

  &.tails {
    transform: rotateY(180deg);
  }
}

.coin-face {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.2);

  .coin-text {
    font-size: 40rpx;
    font-weight: bold;
    color: white;
  }
}

.coin-heads {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  transform: rotateY(0deg);
}

.coin-tails {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  transform: rotateY(180deg);
}

.coin-result {
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #667eea;
  margin: 20rpx 0;
  min-height: 50rpx;
  line-height: 50rpx;
  opacity: 0;
  transition: opacity 0.3s ease;

  &.visible {
    opacity: 1;
  }
}

.statistics {
  margin-top: 30rpx;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .stats-text {
    font-size: 26rpx;
    color: #666;
  }

  .reset-stats-btn {
    padding: 12rpx 24rpx;
    background: white;
    border: 2rpx solid #e0e0e0;
    border-radius: 8rpx;
    font-size: 24rpx;
    color: #999;

    &:active {
      background: #f0f0f0;
    }
  }
}

/* ===== 掷骰子 ===== */
.dice-selector {
  margin-bottom: 40rpx;

  .selector-label {
    display: block;
    font-size: 28rpx;
    color: #666;
    margin-bottom: 16rpx;
    font-weight: 500;
  }

  .dice-count-buttons {
    display: flex;
    gap: 20rpx;
  }

  .count-btn {
    flex: 1;
    padding: 24rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    border: 2rpx solid #e0e0e0;
    font-size: 32rpx;
    font-weight: bold;
    color: #666;
    text-align: center;
    transition: all 0.3s;

    &.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: transparent;
    }

    &:active {
      transform: scale(0.95);
    }
  }
}

.dice-container {
  display: flex;
  justify-content: center;
  gap: 60rpx;
  margin: 40rpx 0;
  min-height: 240rpx;
  align-items: center;
  perspective: 1000rpx;
}

.dice-wrapper {
  width: 160rpx;
  height: 160rpx;
  perspective: 1000rpx;
}

.dice {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s ease-in-out;

  &.roll3d-v1 {
    animation: roll3d-v1 1.5s linear;
  }

  &.roll3d-v2 {
    animation: roll3d-v2 1.5s linear;
  }

  &.roll3d-v3 {
    animation: roll3d-v3 1.5s linear;
  }

  // 根据点数显示对应的面
  &.show-1 {
    transform: rotateX(0deg) rotateY(0deg);
  }

  &.show-2 {
    transform: rotateX(0deg) rotateY(90deg);
  }

  &.show-3 {
    transform: rotateX(-90deg) rotateY(0deg);
  }

  &.show-4 {
    transform: rotateX(90deg) rotateY(0deg);
  }

  &.show-5 {
    transform: rotateX(0deg) rotateY(-90deg);
  }

  &.show-6 {
    transform: rotateX(0deg) rotateY(180deg);
  }
}

.dice-face {
  position: absolute;
  width: 160rpx;
  height: 160rpx;
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  border-radius: 16rpx;
  box-shadow: inset 0 0 8rpx rgba(0, 0, 0, 0.1),
              0 8rpx 24rpx rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #e0e0e0;
  backface-visibility: hidden;

  &.face-1 {
    transform: translateZ(80rpx);
  }

  &.face-2 {
    transform: rotateY(90deg) translateZ(80rpx);
  }

  &.face-3 {
    transform: rotateX(90deg) translateZ(80rpx);
  }

  &.face-4 {
    transform: rotateX(-90deg) translateZ(80rpx);
  }

  &.face-5 {
    transform: rotateY(-90deg) translateZ(80rpx);
  }

  &.face-6 {
    transform: rotateY(180deg) translateZ(80rpx);
  }
}

.dice-dots {
  width: 100%;
  height: 100%;
  padding: 20rpx;
  display: grid;
  gap: 10rpx;
  place-items: center;

  .dot {
    width: 24rpx;
    height: 24rpx;
    background: radial-gradient(circle, #1a1a1a, #000000);
    border-radius: 50%;
    box-shadow: inset 0 2rpx 4rpx rgba(255, 255, 255, 0.3);
  }

  &.dots-1 {
    grid-template: 1fr 1fr 1fr / 1fr 1fr 1fr;

    .dot {
      grid-area: 2 / 2;
    }
  }

  &.dots-2 {
    grid-template: 1fr 1fr 1fr / 1fr 1fr 1fr;

    .dot:nth-child(1) {
      grid-area: 1 / 1;
    }

    .dot:nth-child(2) {
      grid-area: 3 / 3;
    }
  }

  &.dots-3 {
    grid-template: 1fr 1fr 1fr / 1fr 1fr 1fr;

    .dot:nth-child(1) {
      grid-area: 1 / 1;
    }

    .dot:nth-child(2) {
      grid-area: 2 / 2;
    }

    .dot:nth-child(3) {
      grid-area: 3 / 3;
    }
  }

  &.dots-4 {
    grid-template: 1fr 1fr / 1fr 1fr;

    .dot {
      margin: auto;
    }
  }

  &.dots-5 {
    grid-template: 1fr 1fr 1fr / 1fr 1fr 1fr;

    .dot:nth-child(1) {
      grid-area: 1 / 1;
    }

    .dot:nth-child(2) {
      grid-area: 1 / 3;
    }

    .dot:nth-child(3) {
      grid-area: 2 / 2;
    }

    .dot:nth-child(4) {
      grid-area: 3 / 1;
    }

    .dot:nth-child(5) {
      grid-area: 3 / 3;
    }
  }

  &.dots-6 {
    grid-template: 1fr 1fr 1fr / 1fr 1fr;

    .dot {
      margin: auto;
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

@keyframes numberRoll {
  0% {
    transform: translateY(0);
    opacity: 1;
  }

  50% {
    transform: translateY(-3rpx);
    opacity: 0.8;
  }

  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes numberPop {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.dice-sum {
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #667eea;
  margin: 20rpx 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  min-height: 50rpx;

  &.visible {
    opacity: 1;
  }
}

.action-btn {
  width: 100%;
  padding: 28rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12rpx;
  border: none;
  font-size: 32rpx;
  font-weight: bold;
  color: white;

  &:active:not(:disabled) {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.6;
  }
}

/* ===== 动画 ===== */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10rpx);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes flip {
  0% {
    transform: rotateY(0deg);
  }

  100% {
    transform: rotateY(1800deg);
  }
}

@keyframes roll3d-v1 {
  0% {
    transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
  }
  
  5% {
    transform: rotateX(36deg) rotateY(36deg) rotateZ(18deg);
  }
  
  10% {
    transform: rotateX(72deg) rotateY(72deg) rotateZ(36deg);
  }
  
  20% {
    transform: rotateX(144deg) rotateY(144deg) rotateZ(72deg);
  }
  
  35% {
    transform: rotateX(252deg) rotateY(252deg) rotateZ(126deg);
  }
  
  50% {
    transform: rotateX(360deg) rotateY(360deg) rotateZ(180deg);
  }
  
  65% {
    transform: rotateX(468deg) rotateY(468deg) rotateZ(234deg);
  }
  
  80% {
    transform: rotateX(576deg) rotateY(576deg) rotateZ(288deg);
  }

  100% {
    transform: rotateX(720deg) rotateY(720deg) rotateZ(360deg);
  }
}

@keyframes roll3d-v2 {
  0% {
    transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
  }
  
  5% {
    transform: rotateX(40deg) rotateY(35deg) rotateZ(15deg);
  }
  
  10% {
    transform: rotateX(80deg) rotateY(70deg) rotateZ(30deg);
  }
  
  20% {
    transform: rotateX(160deg) rotateY(140deg) rotateZ(60deg);
  }
  
  35% {
    transform: rotateX(280deg) rotateY(245deg) rotateZ(105deg);
  }
  
  50% {
    transform: rotateX(400deg) rotateY(350deg) rotateZ(150deg);
  }
  
  65% {
    transform: rotateX(520deg) rotateY(455deg) rotateZ(195deg);
  }
  
  80% {
    transform: rotateX(640deg) rotateY(560deg) rotateZ(240deg);
  }

  100% {
    transform: rotateX(720deg) rotateY(720deg) rotateZ(360deg);
  }
}

@keyframes roll3d-v3 {
  0% {
    transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
  }
  
  5% {
    transform: rotateX(35deg) rotateY(45deg) rotateZ(25deg);
  }
  
  10% {
    transform: rotateX(70deg) rotateY(90deg) rotateZ(50deg);
  }
  
  20% {
    transform: rotateX(140deg) rotateY(180deg) rotateZ(100deg);
  }
  
  35% {
    transform: rotateX(245deg) rotateY(315deg) rotateZ(175deg);
  }
  
  50% {
    transform: rotateX(350deg) rotateY(450deg) rotateZ(250deg);
  }
  
  65% {
    transform: rotateX(455deg) rotateY(585deg) rotateZ(325deg);
  }
  
  80% {
    transform: rotateX(560deg) rotateY(720deg) rotateZ(400deg);
  }

  100% {
    transform: rotateX(720deg) rotateY(720deg) rotateZ(360deg);
  }
}
</style>
