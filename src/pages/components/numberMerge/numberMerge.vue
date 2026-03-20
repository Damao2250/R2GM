<template>
  <view class="container">
    <!-- 口算题界面 -->
    <view v-if="currentMode === 'quiz'" class="quiz-container">
      <PageHeader title="📝 口算练习" subtitle="提升计算能力，锻炼思维敏捷性" />

      <view class="quiz-wrapper">
        <!-- 运算符选择 -->
        <view class="operator-selector">
          <view class="selector-label">选择运算类型</view>
          <view class="operator-buttons">
            <button v-for="op in ['加', '减', '乘', '除', '随机']" :key="op" class="op-btn"
              :class="{ active: selectedOperators.has(op) }" @tap="toggleOperator(op)">
              {{ op }}法
            </button>
          </view>
        </view>

        <!-- 题目显示 -->
        <view class="quiz-question">
          <view class="quiz-content">
            <text class="num1">{{ quizNum1 }}</text>
            <text class="operator">{{ getOperatorSymbol() }}</text>
            <text class="num2">{{ quizNum2 }}</text>
            <text class="equal">=</text>
            <input v-model="quizResult" type="number" class="answer-input" :disabled="quizSubmitted" placeholder="请输入答案"
              @confirm="submitQuiz" />
          </view>

          <!-- 答题结果显示 -->
          <view v-if="quizSubmitted" class="quiz-result">
            <view class="result-info" :class="{ correct: quizIsCorrect, wrong: !quizIsCorrect }">
              <view class="result-icon">{{ quizIsCorrect ? '✓' : '✗' }}</view>
              <view class="result-details">
                <view class="result-text">
                  <text class="user-answer-label">你的答案：</text>
                  <text class="user-answer-value">{{ quizResult }}</text>
                </view>
                <view class="correct-answer-text">
                  <text class="correct-answer-label">正确答案：</text>
                  <text class="correct-answer-value">{{ quizCorrectAnswer }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 提交/下一题按钮 -->
        <view class="quiz-submit">
          <view class="submit-buttons">
            <button v-if="!quizSubmitted" class="next-btn" @tap="submitQuiz">提交答案</button>
            <button class="next-btn" @tap="nextQuiz">下一题</button>
          </view>
        </view>

        <!-- 说明文字 -->
        <view class="quiz-tips">
          <text>💡 坚持练习，持续提升计算速度</text>
          <view class="calculator-actions">
            <button class="hidden-calculator-btn" @tap="submitMatrixEvolver">矩阵演化器</button>
            <button class="hidden-calculator-btn secondary" @tap="submitFenceCalculator">围栏计算器</button>
            <button class="hidden-calculator-btn tertiary" @tap="submitTerrainAnalyzer">地势演算器</button>
          </view>
        </view>

      </view>
    </view>

    <view v-else-if="currentMode === 'evolver'" class="evolver-container">
      <MatrixEvolver @back="backToQuiz" />
    </view>

    <view v-else-if="currentMode === 'fence'" class="fence-container">
      <FenceCalculator @back="backToQuiz" />
    </view>

    <view v-else class="terrain-container">
      <TerrainAnalyzer @back="backToQuiz" />
    </view>
  </view>
</template>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: '数值矩阵演化工具 - DM工具箱',
    path: '/pages/components/numberMerge/numberMerge'
  })
}
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import FenceCalculator from '@/components/fenceCalculator/fenceCalculator.vue'
import MatrixEvolver from '@/components/matrixEvolver/matrixEvolver.vue'
import TerrainAnalyzer from '@/components/terrainAnalyzer/terrainAnalyzer.vue'

// 口算题相关状态
const currentMode = ref<'quiz' | 'evolver' | 'fence' | 'terrain'>('quiz')
const quizNum1 = ref(0)
const quizNum2 = ref(0)
const quizOperator = ref<'+' | '-' | '*' | '/'>('+')
const quizResult = ref('')
const quizSubmitted = ref(false)
const quizIsCorrect = ref(false)
const quizCorrectAnswer = ref(0)
const selectedOperators = ref(new Set<string>(['随机']))

onMounted(() => {
  generateQuiz()
})

/**
 * 切换运算符选择
 */
const toggleOperator = (op: string) => {
  if (op === '随机') {
    // 随机模式：清空其他选择
    selectedOperators.value.clear()
    selectedOperators.value.add('随机')
  } else {
    // 具体运算符模式：移除随机
    selectedOperators.value.delete('随机')

    if (selectedOperators.value.has(op)) {
      selectedOperators.value.delete(op)
    } else {
      selectedOperators.value.add(op)
    }

    // 如果没有选择任何具体运算符，恢复到随机
    if (selectedOperators.value.size === 0) {
      selectedOperators.value.add('随机')
    }
  }

  generateQuiz()
}

/**
 * 获取运算符符号
 */
const getOperatorSymbol = (): string => {
  const symbolMap: { [key: string]: string } = {
    '+': '+',
    '-': '−',
    '*': '×',
    '/': '÷'
  }
  return symbolMap[quizOperator.value] || '+'
}

/**
 * 生成口算题
 */
const generateQuiz = () => {
  quizResult.value = ''
  quizSubmitted.value = false
  quizIsCorrect.value = false
  quizCorrectAnswer.value = 0

  // 确定运算符
  let operators: ('+' | '-' | '*' | '/')[] = []

  if (selectedOperators.value.has('随机')) {
    operators = ['+', '-', '*', '/']
  } else {
    if (selectedOperators.value.has('加')) operators.push('+')
    if (selectedOperators.value.has('减')) operators.push('-')
    if (selectedOperators.value.has('乘')) operators.push('*')
    if (selectedOperators.value.has('除')) operators.push('/')
  }

  if (operators.length === 0) {
    operators = ['+', '-', '*', '/']
  }

  quizOperator.value = operators[Math.floor(Math.random() * operators.length)]

  // 生成数字（每个数字在0-100范围内）
  let num1 = Math.floor(Math.random() * 101)
  let num2 = Math.floor(Math.random() * 101)

  // 除法特殊处理：确保能整除
  if (quizOperator.value === '/') {
    // 先生成被除数（1-100，避免0）
    num1 = Math.floor(Math.random() * 100) + 1
    // 找到被除数的所有因数
    const divisors: number[] = []
    for (let i = 1; i <= num1 && i <= 100; i++) {
      if (num1 % i === 0) {
        divisors.push(i)
      }
    }
    // 随机选择一个因数作为除数
    num2 = divisors[Math.floor(Math.random() * divisors.length)]
  }

  quizNum1.value = num1
  quizNum2.value = num2
}

/**
 * 提交答案
 */
const submitQuiz = () => {
  if (quizSubmitted.value) return

  // 检查888魔法码
  if (quizResult.value === '888') {
    currentMode.value = 'evolver'
    return
  }

  // 计算正确答案
  let correctAnswer = 0
  switch (quizOperator.value) {
    case '+':
      correctAnswer = quizNum1.value + quizNum2.value
      break
    case '-':
      correctAnswer = quizNum1.value - quizNum2.value
      break
    case '*':
      correctAnswer = quizNum1.value * quizNum2.value
      break
    case '/':
      correctAnswer = quizNum1.value / quizNum2.value
      break
  }

  const userAnswer = parseInt(quizResult.value)

  if (isNaN(userAnswer)) {
    uni.showToast({
      title: '请输入正确的数字',
      icon: 'none',
      duration: 2000
    })
    return
  }

  // 标记已提交并显示结果
  quizSubmitted.value = true
  quizCorrectAnswer.value = correctAnswer
  quizIsCorrect.value = userAnswer === correctAnswer
}

/**
 * 矩阵演化器
 */
const submitMatrixEvolver = () => {
  uni.showModal({
    title: '矩阵演化器',
    content: '确认进入矩阵演化器吗？',
    confirmText: '进入',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        currentMode.value = 'evolver'
      }
    }
  })
}

/**
 * 围栏计算器
 */
const submitFenceCalculator = () => {
  uni.showModal({
    title: '围栏计算器',
    content: '确认进入围栏计算器吗？',
    confirmText: '进入',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        currentMode.value = 'fence'
      }
    }
  })
}

/**
 * 地势演算器
 */
const submitTerrainAnalyzer = () => {
  uni.showModal({
    title: '地势演算器',
    content: '确认进入地势演算器吗？',
    confirmText: '进入',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        currentMode.value = 'terrain'
      }
    }
  })
}

/**
 * 返回练习界面
 */
const backToQuiz = () => {
  currentMode.value = 'quiz'
}

/**
 * 下一题
 */
const nextQuiz = () => {
  generateQuiz()
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 40rpx;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100rpx);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 口算题界面样式 */
.quiz-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 0;
}

.quiz-wrapper {
  padding: 40rpx;
  animation: fadeIn 0.5s ease-in;
}

.operator-selector {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.selector-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #212529;
  margin-bottom: 20rpx;
}

.operator-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5rpx;
  justify-content: flex-start;
}

.op-btn {
  flex: 0 0 calc(20% - 11rpx);
  height: 72rpx;
  background: #f8f9fa;
  color: #495057;
  border: 2px solid #dee2e6;
  border-radius: 12rpx;
  font-size: 26rpx;
  font-weight: 600;
  transition: all 0.2s ease;

  &.active {
    background: #667eea;
    color: white;
    border-color: #667eea;
    transform: scale(1.05);
  }
}

.quiz-question {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  animation: slideUp 0.5s ease-out 0.2s both;
}

.quiz-content {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20rpx;
  font-size: 80rpx;
  font-weight: 700;
  color: #212529;
}

.num1,
.num2 {
  min-width: 120rpx;
  text-align: center;
  color: #667eea;
}

.operator {
  min-width: 80rpx;
  text-align: center;
  color: #764ba2;
}

.equal {
  color: #495057;
}

.answer-input {
  width: 340rpx;
  height: 100rpx;
  border: 3px solid #667eea;
  border-radius: 12rpx;
  text-align: center;
  font-size: 64rpx;
  font-weight: 700;
  color: #667eea;
  background: #f8f9fa;

  &:disabled {
    opacity: 0.6;
  }
}

.quiz-result {
  margin-top: 40rpx;
  animation: slideUp 0.3s ease-out;
}

.result-info {
  padding: 30rpx;
  border-radius: 16rpx;
  display: flex;
  flex-direction: row;
  gap: 30rpx;
  align-items: center;

  &.correct {
    background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
    border: 2px solid #28a745;
  }

  &.wrong {
    background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
    border: 2px solid #dc3545;
  }
}

.result-icon {
  font-size: 80rpx;
  font-weight: 700;
  flex-shrink: 0;

  .correct & {
    color: #28a745;
  }

  .wrong & {
    color: #dc3545;
  }
}

.result-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.result-text,
.correct-answer-text {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12rpx;
  font-size: 32rpx;
}

.user-answer-label,
.correct-answer-label {
  color: #495057;
  font-weight: 500;
}

.user-answer-value {
  color: #212529;
  font-weight: 700;
  font-size: 40rpx;
}

.correct-answer-value {
  color: #28a745;
  font-weight: 700;
  font-size: 40rpx;
}

.quiz-submit {
  margin-bottom: 30rpx;
  animation: slideUp 0.5s ease-out 0.4s both;
}

.submit-buttons {
  display: flex;
  gap: 20rpx;
}

.next-btn {
  flex: 1;
  height: 96rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 700;
  box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;

  &.primary {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    box-shadow: 0 6rpx 20rpx rgba(40, 167, 69, 0.4);
  }

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 4rpx 12rpx rgba(108, 117, 125, 0.3);
  }
}

.quiz-tips {
  text-align: center;
  font-size: 24rpx;
  color: #6c757d;
  animation: fadeIn 0.5s ease-in 0.6s both;
}

.calculator-actions {
  display: flex;
  gap: 20rpx;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 50rpx;
}

.hidden-calculator-btn {
  min-width: 240rpx;
  height: 82rpx;
  margin: 0;
  padding: 0 28rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  font-size: 28rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 20rpx rgba(102, 126, 234, 0.24);

  &::after {
    border: none;
  }

  &.secondary {
    background: linear-gradient(135deg, #d4914a 0%, #b86b2d 100%);
    box-shadow: 0 8rpx 20rpx rgba(184, 107, 45, 0.24);
  }

  &.tertiary {
    background: linear-gradient(135deg, #4e9b72 0%, #2f6f55 100%);
    box-shadow: 0 8rpx 20rpx rgba(47, 111, 85, 0.24);
  }
}

.evolver-container,
.fence-container,
.terrain-container {
  min-height: 100vh;
}
</style>
