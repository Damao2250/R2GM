<template>
  <view class="container">
    <!-- 口算题界面 -->
    <view v-if="showQuiz" class="quiz-container">
      <PageHeader title="📝 口算练习" subtitle="提升计算能力，锻炼思维敏捷性" />
      
      <view class="quiz-wrapper">
        <!-- 运算符选择 -->
        <view class="operator-selector">
          <view class="selector-label">选择运算类型</view>
          <view class="operator-buttons">
            <button 
              v-for="op in ['加', '减', '乘', '除', '随机']" 
              :key="op"
              class="op-btn"
              :class="{ active: selectedOperators.has(op) }"
              @tap="toggleOperator(op)"
            >
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
            <input 
              v-model="quizResult" 
              type="number" 
              class="answer-input"
              :disabled="quizSubmitted"
              placeholder="请输入答案"
              @confirm="submitQuiz"
            />
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
        </view>
      </view>
    </view>

    <!-- 数值矩阵界面 -->
    <view v-else class="matrix-container">
      <PageHeader title="🔢 数值矩阵" subtitle="通过平移操作实现数值演化与归并" />

      <!-- 内容区域 -->
      <view class="panel-wrapper">
        <!-- 统计面板 -->
        <view class="stats-panel">
          <view class="stats-item">
            <view class="stats-label">当前演化值</view>
            <view class="stats-value">{{ valueSum }}</view>
          </view>
          <view class="stats-item best">
            <view class="stats-label">历史峰值</view>
            <view class="stats-value">{{ bestVal }}</view>
          </view>
        </view>

        <!-- 控制按钮 -->
        <view class="controls">
          <button class="control-btn restart" @tap="restart">
            <text class="btn-icon">🔄</text>
            <text class="btn-text">重置序列</text>
          </button>
        </view>

        <!-- 画板区域 -->
        <view class="main-board" @touchstart="onTouchStart" @touchmove.stop.prevent @touchend="onTouchEnd">
          <!-- 背景网格 -->
          <view class="grid-container">
            <view 
              v-for="i in 16" 
              :key="'bg-' + i" 
              class="grid-cell"
            ></view>
          </view>

          <!-- 数字方块 -->
          <view class="tiles-container">
            <view
              v-for="tile in tiles"
              :key="tile.id"
              class="tile"
              :class="[getTileClass(tile.value), 'tile-position-' + tile.row + '-' + tile.col, tile.isNew ? 'tile-new' : '', tile.isMerged ? 'tile-merged' : '']"
            >
              <view class="tile-inner">{{ tile.value }}</view>
            </view>
          </view>
        </view>

        <!-- 状态指示遮罩 -->
        <view v-if="isOver" class="status-overlay" @tap.stop>
          <view class="status-modal">
            <view class="status-title">矩阵序列已锁定</view>
            <view class="status-stats">
              <text class="label">本次演化结果</text>
              <text class="value">{{ valueSum }}</text>
            </view>
            <button class="retry-btn" @tap="restart">
              <text class="btn-icon">🔄</text>
              <text class="btn-text">重新初始化</text>
            </button>
          </view>
        </view>

        <!-- 完成遮罩 -->
        <view v-if="hasWon && !continueAfterWin" class="win-overlay" @tap.stop>
          <view class="win-modal">
            <view class="win-title">已达成预设阈值</view>
            <view class="win-stats">
              <text class="label">当前演化程度</text>
              <text class="value">{{ valueSum }}</text>
            </view>
            <view class="win-buttons">
              <button class="win-btn continue" @tap="continuePlaying">深入探索</button>
              <button class="win-btn restart" @tap="restart">重置序列</button>
            </view>
          </view>
        </view>

        <!-- 操作说明 -->
        <view class="instructions">
          <view class="instruction-title">⚙️ 逻辑说明</view>
          <view class="instruction-content">
            <text class="instruction-item">• 沿水平或垂直方向移动矩阵元素</text>
            <text class="instruction-item">• 相同标量的元素在碰撞时会进行归并</text>
            <text class="instruction-item">• 目标是观测并推演更高规模的标量</text>
            <text class="instruction-item">• 当矩形空间无法支撑位移时序列结束</text>
          </view>
        </view>
      </view>
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

interface Tile {
  id: number
  value: number
  row: number
  col: number
  isNew?: boolean
  isMerged?: boolean
}

// 口算题相关状态
const showQuiz = ref(true)
const quizNum1 = ref(0)
const quizNum2 = ref(0)
const quizOperator = ref<'+'|'-'|'*'|'/'>('+')
const quizResult = ref('')
const quizSubmitted = ref(false)
const quizIsCorrect = ref(false)
const quizCorrectAnswer = ref(0)
const selectedOperators = ref(new Set<string>(['随机']))

// 数值矩阵相关状态
const valueSum = ref(0)
const bestVal = ref(0)
const tiles = ref<Tile[]>([])
const isOver = ref(false)
const hasWon = ref(false)
const continueAfterWin = ref(false)
const TARGET_VAL = Math.pow(2, 11)
let tileIdCounter = 0
let touchStartX = 0
let touchStartY = 0
const STORAGE_KEY = 'num_merge_best_val'

onMounted(() => {
  loadBestVal()
  generateQuiz()
})

/**
 * 加载记录
 */
const loadBestVal = async () => {
  try {
    const res = await uni.getStorage({ key: STORAGE_KEY })
    bestVal.value = res.data || 0
  } catch (e) {
    bestVal.value = 0
  }
}

/**
 * 保存记录
 */
const saveBestVal = async () => {
  if (valueSum.value > bestVal.value) {
    bestVal.value = valueSum.value
    try {
      await uni.setStorage({
        key: STORAGE_KEY,
        data: bestVal.value
      })
    } catch (e) {
      console.error('保存失败', e)
    }
  }
}

/**
 * 初始化数值
 */
const initData = () => {
  valueSum.value = 0
  tiles.value = []
  isOver.value = false
  hasWon.value = false
  continueAfterWin.value = false
  tileIdCounter = 0
  
  // 添加两个初始元素
  addRandomTile()
  addRandomTile()
  
  // 监听触摸事件
  setupTouchEvents()
}

/**
 * 重置状态
 */
const restart = () => {
  saveBestVal()
  initData()
}

/**
 * 继续（达到目标后）
 */
const continuePlaying = () => {
  continueAfterWin.value = true
}

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
    showQuiz.value = false
    initData()
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
 * 下一题
 */
const nextQuiz = () => {
  generateQuiz()
}

/**
 * 设置触摸事件
 */
const setupTouchEvents = () => {
  // 使用uni-app的触摸事件
}

/**
 * 添加随机元素
 */
const addRandomTile = () => {
  const emptyCells: { row: number; col: number }[] = []
  
  // 找出所有空位
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (!getTileAt(row, col)) {
        emptyCells.push({ row, col })
      }
    }
  }
  
  if (emptyCells.length === 0) return
  
  // 随机选择一个空位
  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
  
  // 90%概率生成2，10%概率生成4
  const value = Math.random() < 0.9 ? 2 : 4
  
  tiles.value.push({
    id: tileIdCounter++,
    value,
    row: randomCell.row,
    col: randomCell.col,
    isNew: true
  })
  
  // 移除新元素标记
  setTimeout(() => {
    const tile = tiles.value.find(t => t.id === tileIdCounter - 1)
    if (tile) tile.isNew = false
  }, 200)
}

/**
 * 获取指定位置的方块
 */
const getTileAt = (row: number, col: number): Tile | undefined => {
  return tiles.value.find(t => t.row === row && t.col === col)
}

/**
 * 获取方块样式类
 */
const getTileClass = (value: number) => {
  if (value === TARGET_VAL) return 'tile-max'
  return 'tile-' + value
}

/**
 * 移动元素
 */
const move = (direction: 'up' | 'down' | 'left' | 'right') => {
  if (isOver.value) return
  
  let moved = false
  const mergedTiles: number[] = []
  
  // 清除所有合并标记
  tiles.value.forEach(t => t.isMerged = false)
  
  // 根据方向确定遍历顺序
  const directions = {
    up: { row: [0, 1, 2, 3], col: [0, 1, 2, 3], dr: -1, dc: 0 },
    down: { row: [3, 2, 1, 0], col: [0, 1, 2, 3], dr: 1, dc: 0 },
    left: { row: [0, 1, 2, 3], col: [0, 1, 2, 3], dr: 0, dc: -1 },
    right: { row: [0, 1, 2, 3], col: [3, 2, 1, 0], dr: 0, dc: 1 }
  }
  
  const dir = directions[direction]
  
  for (const row of dir.row) {
    for (const col of dir.col) {
      const tile = getTileAt(row, col)
      if (!tile) continue
      
      let newRow = row
      let newCol = col
      
      // 向指定方向移动
      while (true) {
        const nextRow = newRow + dir.dr
        const nextCol = newCol + dir.dc
        
        if (nextRow < 0 || nextRow > 3 || nextCol < 0 || nextCol > 3) break
        
        const nextTile = getTileAt(nextRow, nextCol)
        
        if (!nextTile) {
          // 空位，继续移动
          newRow = nextRow
          newCol = nextCol
        } else if (nextTile.value === tile.value && !mergedTiles.includes(nextTile.id)) {
          // 可以合并
          newRow = nextRow
          newCol = nextCol
          
          // 标记为已合并
          mergedTiles.push(nextTile.id)
          
          // 更新累计
          valueSum.value += tile.value * 2
          
          // 检查是否达成
          if (tile.value * 2 === TARGET_VAL && !hasWon.value) {
            hasWon.value = true
          }
          
          break
        } else {
          // 遇到不同的元素，停止移动
          break
        }
      }
      
      // 更新位置
      if (newRow !== row || newCol !== col) {
        moved = true
        
        const targetTile = getTileAt(newRow, newCol)
        
        if (targetTile && targetTile.value === tile.value) {
          // 合并元素
          targetTile.value *= 2
          targetTile.isMerged = true
          
          // 移除当前元素
          const index = tiles.value.findIndex(t => t.id === tile.id)
          if (index > -1) tiles.value.splice(index, 1)
        } else {
          // 移动元素
          tile.row = newRow
          tile.col = newCol
        }
      }
    }
  }
  
  // 如果有移动，添加新元素
  if (moved) {
    setTimeout(() => {
      addRandomTile()
      
      // 检查是否还能继续
      if (!canMove()) {
        isOver.value = true
        saveBestVal()
      }
    }, 150)
  }
}

/**
 * 检查是否还能移动
 */
const canMove = (): boolean => {
  // 检查是否有空位
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (!getTileAt(row, col)) return true
    }
  }
  
  // 检查是否有相邻的相同元素
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const tile = getTileAt(row, col)
      if (!tile) continue
      
      // 检查右边
      if (col < 3) {
        const rightTile = getTileAt(row, col + 1)
        if (rightTile && rightTile.value === tile.value) return true
      }
      
      // 检查下边
      if (row < 3) {
        const bottomTile = getTileAt(row + 1, col)
        if (bottomTile && bottomTile.value === tile.value) return true
      }
    }
  }
  
  return false
}

/**
 * 处理触摸开始
 */
const onTouchStart = (e: any) => {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

/**
 * 处理触摸结束
 */
const onTouchEnd = (e: any) => {
  const touchEndX = e.changedTouches[0].clientX
  const touchEndY = e.changedTouches[0].clientY
  
  const dx = touchEndX - touchStartX
  const dy = touchEndY - touchStartY
  
  const minSwipeDistance = 30
  
  if (Math.abs(dx) > Math.abs(dy)) {
    // 水平滑动
    if (Math.abs(dx) > minSwipeDistance) {
      if (dx > 0) {
        move('right')
      } else {
        move('left')
      }
    }
  } else {
    // 垂直滑动
    if (Math.abs(dy) > minSwipeDistance) {
      if (dy > 0) {
        move('down')
      } else {
        move('up')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 40rpx;
}

.panel-wrapper {
  padding: 30rpx;
}

/* 统计面板 */
.stats-panel {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.stats-item {
  flex: 1;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 12rpx;
  padding: 24rpx;
  text-align: center;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
  
  &.best {
    border-color: #667eea;
  }
}

.stats-label {
  font-size: 24rpx;
  color: #6c757d;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.stats-value {
  font-size: 44rpx;
  font-weight: 700;
  color: #212529;
}

/* 控制按钮 */
.controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 30rpx;
}

.control-btn {
  background: #6c757d;
  border: none;
  border-radius: 8rpx;
  padding: 12rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin: 0;
  
  &.restart {
    background: #4a69bd;
  }
}

.btn-icon {
  font-size: 24rpx;
}

.btn-text {
  font-size: 24rpx;
  font-weight: 500;
  color: white;
}

/* 画板区域 */
.main-board {
  position: relative;
  width: 620rpx;
  height: 620rpx;
  background: #bbada0;
  border-radius: 12rpx;
  padding: 15rpx;
  margin: 0 auto;
  box-shadow: inset 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15rpx;
  width: 100%;
  height: 100%;
}

.grid-cell {
  background: rgba(238, 228, 218, 0.35);
  border-radius: 8rpx;
}

.tiles-container {
  position: absolute;
  top: 15rpx;
  left: 15rpx;
  width: calc(100% - 30rpx);
  height: calc(100% - 30rpx);
}

.tile {
  position: absolute;
  width: calc(25% - 11.25rpx);
  height: calc(25% - 11.25rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  font-weight: 600;
  transition: all 0.1s ease-out;
  
  &.tile-new {
    animation: cell-appear 0.2s ease-out;
  }
  
  &.tile-merged {
    animation: cell-update 0.15s ease-out;
  }
}

.tile-inner {
  font-size: 48rpx;
  font-weight: 700;
  color: #495057;
}

/* 方块位置 */
@for $row from 0 through 3 {
  @for $col from 0 through 3 {
    .tile-position-#{$row}-#{$col} {
      top: calc(#{$row} * (25% + 3.75rpx));
      left: calc(#{$col} * (25% + 3.75rpx));
    }
  }
}

/* 单元配色 - 暖色系 */
.tile-2 { background: #eee4da; border: 1px solid #d4c5b9; .tile-inner { color: #776e65; } }
.tile-4 { background: #ede0c8; border: 1px solid #d4c5b9; .tile-inner { color: #776e65; } }
.tile-8 { background: #f2b179; border: 1px solid #e39e5f; .tile-inner { color: #f9f6f2; } }
.tile-16 { background: #f59563; border: 1px solid #e37d47; .tile-inner { color: #f9f6f2; } }
.tile-32 { background: #f67c5f; border: 1px solid #e4634b; .tile-inner { color: #f9f6f2; } }
.tile-64 { background: #f65e3b; border: 1px solid #e44827; .tile-inner { color: #f9f6f2; } }
.tile-128 { background: #edcf72; .tile-inner { color: #f9f6f2; font-size: 40rpx; } }
.tile-256 { background: #edcc61; .tile-inner { color: #f9f6f2; font-size: 40rpx; } }
.tile-512 { background: #edc850; .tile-inner { color: #f9f6f2; font-size: 36rpx; } }
.tile-1024 { background: #edc53f; .tile-inner { color: #f9f6f2; font-size: 32rpx; } }
.tile-max { background: #edc22e; .tile-inner { color: #f9f6f2; font-size: 32rpx; } }
.tile-4096 { background: #3c3a32; .tile-inner { color: #f9f6f2; font-size: 28rpx; } }

/* 动画映射 */
@keyframes cell-appear {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes cell-update {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* 悬浮指示 */
.status-overlay,
.win-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.status-modal,
.win-modal {
  background: white;
  border-radius: 16rpx;
  padding: 40rpx;
  width: 70%;
  max-width: 440rpx;
  text-align: center;
  box-shadow: 0 10rpx 25rpx rgba(0, 0, 0, 0.1);
}

.status-title,
.win-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #212529;
  margin-bottom: 30rpx;
}

.status-stats,
.win-stats {
  margin-bottom: 30rpx;
  background: #f8f9fa;
  padding: 20rpx;
  border-radius: 8rpx;
}

.label {
  display: block;
  font-size: 24rpx;
  color: #6c757d;
  margin-bottom: 4rpx;
}

.value {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: #4a69bd;
}

.retry-btn {
  width: 100%;
  height: 80rpx;
  background: #4a69bd;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.win-buttons {
  display: flex;
  gap: 16rpx;
}

.win-btn {
  flex: 1;
  height: 80rpx;
  border: none;
  border-radius: 8rpx;
  font-size: 26rpx;
  font-weight: 600;
  
  &.continue {
    background: #4a69bd;
    color: white;
  }
  
  &.restart {
    background: #e9ecef;
    color: #495057;
  }
}

/* 操作说明 */
.instructions {
  margin-top: 40rpx;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 12rpx;
  padding: 30rpx;
}

.instruction-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #212529;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.instruction-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.instruction-item {
  font-size: 24rpx;
  color: #495057;
  line-height: 1.5;
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

.matrix-container {
  min-height: 100vh;
  background: white;
}
</style>
