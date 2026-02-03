<template>
  <view class="container">
    <!-- 页面头部 -->
    <PageHeader title="🎮 2048" subtitle="合并数字，挑战高分" />

    <!-- 游戏区域 -->
    <view class="game-wrapper">
      <!-- 分数面板 -->
      <view class="score-panel">
        <view class="score-item">
          <view class="score-label">分数</view>
          <view class="score-value">{{ score }}</view>
        </view>
        <view class="score-item best">
          <view class="score-label">最高</view>
          <view class="score-value">{{ bestScore }}</view>
        </view>
      </view>

      <!-- 控制按钮 -->
      <view class="controls">
        <button class="control-btn restart" @tap="restartGame">
          <text class="btn-icon">🔄</text>
          <text class="btn-text">重新开始</text>
        </button>
      </view>

      <!-- 游戏棋盘 -->
      <view class="game-board" @touchstart="onTouchStart" @touchmove.stop.prevent @touchend="onTouchEnd">
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
            :class="['tile-' + tile.value, 'tile-position-' + tile.row + '-' + tile.col, tile.isNew ? 'tile-new' : '', tile.isMerged ? 'tile-merged' : '']"
          >
            <view class="tile-inner">{{ tile.value }}</view>
          </view>
        </view>
      </view>

      <!-- 游戏结束遮罩 -->
      <view v-if="gameOver" class="game-over-overlay" @tap.stop>
        <view class="game-over-modal">
          <view class="game-over-title">游戏结束！</view>
          <view class="game-over-score">
            <text class="label">最终得分</text>
            <text class="value">{{ score }}</text>
          </view>
          <button class="retry-btn" @tap="restartGame">
            <text class="btn-icon">🔄</text>
            <text class="btn-text">再来一局</text>
          </button>
        </view>
      </view>

      <!-- 胜利遮罩 -->
      <view v-if="hasWon && !continueAfterWin" class="win-overlay" @tap.stop>
        <view class="win-modal">
          <view class="win-title">🎉 恭喜达成 2048！</view>
          <view class="win-score">
            <text class="label">当前得分</text>
            <text class="value">{{ score }}</text>
          </view>
          <view class="win-buttons">
            <button class="win-btn continue" @tap="continuePlaying">继续游戏</button>
            <button class="win-btn restart" @tap="restartGame">重新开始</button>
          </view>
        </view>
      </view>

      <!-- 操作说明 -->
      <view class="instructions">
        <view class="instruction-title">💡 操作说明</view>
        <view class="instruction-content">
          <text class="instruction-item">• 滑动屏幕移动所有方块</text>
          <text class="instruction-item">• 相同数字的方块会合并</text>
          <text class="instruction-item">• 合成2048即可获胜</text>
          <text class="instruction-item">• 无法移动时游戏结束</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: '2048小游戏 - DM工具箱',
    path: '/pages/components/game2048/game2048'
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

const score = ref(0)
const bestScore = ref(0)
const tiles = ref<Tile[]>([])
const gameOver = ref(false)
const hasWon = ref(false)
const continueAfterWin = ref(false)
let tileIdCounter = 0
let touchStartX = 0
let touchStartY = 0
const STORAGE_KEY = 'game2048_best_score'

onMounted(() => {
  loadBestScore()
  initGame()
})

/**
 * 加载最高分
 */
const loadBestScore = async () => {
  try {
    const res = await uni.getStorage({ key: STORAGE_KEY })
    bestScore.value = res.data || 0
  } catch (e) {
    bestScore.value = 0
  }
}

/**
 * 保存最高分
 */
const saveBestScore = async () => {
  if (score.value > bestScore.value) {
    bestScore.value = score.value
    try {
      await uni.setStorage({
        key: STORAGE_KEY,
        data: bestScore.value
      })
    } catch (e) {
      console.error('保存失败', e)
    }
  }
}

/**
 * 初始化游戏
 */
const initGame = () => {
  score.value = 0
  tiles.value = []
  gameOver.value = false
  hasWon.value = false
  continueAfterWin.value = false
  tileIdCounter = 0
  
  // 添加两个初始方块
  addRandomTile()
  addRandomTile()
  
  // 监听触摸事件
  setupTouchEvents()
}

/**
 * 重新开始游戏
 */
const restartGame = () => {
  saveBestScore()
  initGame()
}

/**
 * 继续游戏（达到2048后）
 */
const continuePlaying = () => {
  continueAfterWin.value = true
}

/**
 * 设置触摸事件
 */
const setupTouchEvents = () => {
  // 使用uni-app的触摸事件
}

/**
 * 添加随机方块
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
  
  // 移除新方块标记
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
 * 移动方块
 */
const move = (direction: 'up' | 'down' | 'left' | 'right') => {
  if (gameOver.value) return
  
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
          
          // 更新分数
          score.value += tile.value * 2
          
          // 检查是否达到2048
          if (tile.value * 2 === 2048 && !hasWon.value) {
            hasWon.value = true
          }
          
          break
        } else {
          // 遇到不同的方块，停止移动
          break
        }
      }
      
      // 更新位置
      if (newRow !== row || newCol !== col) {
        moved = true
        
        const targetTile = getTileAt(newRow, newCol)
        
        if (targetTile && targetTile.value === tile.value) {
          // 合并方块
          targetTile.value *= 2
          targetTile.isMerged = true
          
          // 移除当前方块
          const index = tiles.value.findIndex(t => t.id === tile.id)
          if (index > -1) tiles.value.splice(index, 1)
        } else {
          // 移动方块
          tile.row = newRow
          tile.col = newCol
        }
      }
    }
  }
  
  // 如果有移动，添加新方块
  if (moved) {
    setTimeout(() => {
      addRandomTile()
      
      // 检查游戏是否结束
      if (!canMove()) {
        gameOver.value = true
        saveBestScore()
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
  
  // 检查是否有相邻的相同方块
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  backdrop-filter: saturate(50%) blur(4px);
  padding-bottom: 40rpx;
}

.game-wrapper {
  padding: 20rpx;
}

/* 分数面板 */
.score-panel {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.score-item {
  flex: 1;
  max-width: 240rpx;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10rpx);
  border-radius: 16rpx;
  padding: 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  
  &.best {
    background: rgba(255, 215, 0, 0.3);
  }
}

.score-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  margin-bottom: 8rpx;
}

.score-value {
  font-size: 40rpx;
  font-weight: bold;
  color: white;
}

/* 控制按钮 */
.controls {
  display: flex;
  justify-content: center;
  margin-bottom: 20rpx;
}

.control-btn {
  background: white;
  border: none;
  border-radius: 12rpx;
  padding: 16rpx 32rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  
  &.restart {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }
}

.btn-icon {
  font-size: 28rpx;
}

.btn-text {
  font-size: 26rpx;
  font-weight: 600;
  color: white;
}

/* 游戏棋盘 */
.game-board {
  position: relative;
  width: 680rpx;
  height: 680rpx;
  background: rgba(187, 173, 160, 0.4);
  border-radius: 16rpx;
  padding: 15rpx;
  margin: 0 auto;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.2);
  display: block;
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
  font-weight: bold;
  transition: all 0.15s ease-in-out;
  
  &.tile-new {
    animation: appear 0.2s ease-in-out;
  }
  
  &.tile-merged {
    animation: merge 0.2s ease-in-out;
  }
}

.tile-inner {
  font-size: 48rpx;
  font-weight: bold;
  color: white;
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

/* 方块颜色 */
.tile-2 { background: #eee4da; .tile-inner { color: #776e65; font-size: 48rpx; } }
.tile-4 { background: #ede0c8; .tile-inner { color: #776e65; font-size: 48rpx; } }
.tile-8 { background: #f2b179; .tile-inner { color: #f9f6f2; font-size: 48rpx; } }
.tile-16 { background: #f59563; .tile-inner { color: #f9f6f2; font-size: 48rpx; } }
.tile-32 { background: #f67c5f; .tile-inner { color: #f9f6f2; font-size: 48rpx; } }
.tile-64 { background: #f65e3b; .tile-inner { color: #f9f6f2; font-size: 44rpx; } }
.tile-128 { background: #edcf72; .tile-inner { color: #f9f6f2; font-size: 40rpx; } }
.tile-256 { background: #edcc61; .tile-inner { color: #f9f6f2; font-size: 40rpx; } }
.tile-512 { background: #edc850; .tile-inner { color: #f9f6f2; font-size: 36rpx; } }
.tile-1024 { background: #edc53f; .tile-inner { color: #f9f6f2; font-size: 32rpx; } }
.tile-2048 { background: #edc22e; .tile-inner { color: #f9f6f2; font-size: 32rpx; } }
.tile-4096 { background: #3c3a32; .tile-inner { color: #f9f6f2; font-size: 28rpx; } }

/* 动画 */
@keyframes appear {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes merge {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* 游戏结束遮罩 */
.game-over-overlay,
.win-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-in-out;
}

.game-over-modal,
.win-modal {
  background: white;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  width: 80%;
  max-width: 500rpx;
  text-align: center;
  box-shadow: 0 12rpx 48rpx rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

.game-over-title,
.win-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #776e65;
  margin-bottom: 40rpx;
}

.game-over-score,
.win-score {
  margin-bottom: 40rpx;
}

.label {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.value {
  display: block;
  font-size: 56rpx;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.retry-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.4);
}

.win-buttons {
  display: flex;
  gap: 16rpx;
}

.win-btn {
  flex: 1;
  height: 80rpx;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  
  &.continue {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  
  &.restart {
    background: #f0f0f0;
    color: #776e65;
  }
}

/* 操作说明 */
.instructions {
  margin-top: 30rpx;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10rpx);
  border-radius: 16rpx;
  padding: 24rpx;
}

.instruction-title {
  font-size: 28rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 16rpx;
}

.instruction-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.instruction-item {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
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
</style>
