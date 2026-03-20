<template>
  <view class="container">
    <PageHeader title="🔢 矩阵演化器" subtitle="通过平移操作实现数值演化与归并" />

    <view class="panel-wrapper">
      <view class="top-actions">
        <button class="back-btn" @tap="emit('back')">返回练习</button>
      </view>

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

      <view class="controls">
        <button class="control-btn restart" @tap="restart">
          <text class="btn-icon">🔄</text>
          <text class="btn-text">重置序列</text>
        </button>
      </view>

      <view class="main-board" @touchstart="onTouchStart" @touchmove.stop.prevent @touchend="onTouchEnd">
        <view class="grid-container">
          <view v-for="i in 16" :key="'bg-' + i" class="grid-cell"></view>
        </view>

        <view class="tiles-container">
          <view
            v-for="tile in tiles"
            :key="tile.id"
            class="tile"
            :class="[
              getTileClass(tile.value),
              'tile-position-' + tile.row + '-' + tile.col,
              tile.isNew ? 'tile-new' : '',
              tile.isMerged ? 'tile-merged' : ''
            ]"
          >
            <view class="tile-inner">{{ tile.value }}</view>
          </view>
        </view>
      </view>

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
</template>

<script lang="ts">
export default {
  name: 'MatrixEvolver'
}
</script>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'

const emit = defineEmits<{
  back: []
}>()

interface Tile {
  id: number
  value: number
  row: number
  col: number
  isNew?: boolean
  isMerged?: boolean
}

const valueSum = ref(0)
const bestVal = ref(0)
const tiles = ref<Tile[]>([])
const isOver = ref(false)
const hasWon = ref(false)
const continueAfterWin = ref(false)

const TARGET_VAL = Math.pow(2, 11)
const STORAGE_KEY = 'num_merge_best_val'

let tileIdCounter = 0
let touchStartX = 0
let touchStartY = 0

onMounted(() => {
  void loadBestVal()
  initData()
})

onBeforeUnmount(() => {
  void saveBestVal()
})

const loadBestVal = async () => {
  try {
    const res = await uni.getStorage({ key: STORAGE_KEY })
    bestVal.value = res.data || 0
  } catch (e) {
    bestVal.value = 0
  }
}

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

const initData = () => {
  valueSum.value = 0
  tiles.value = []
  isOver.value = false
  hasWon.value = false
  continueAfterWin.value = false
  tileIdCounter = 0

  addRandomTile()
  addRandomTile()
}

const restart = () => {
  void saveBestVal()
  initData()
}

const continuePlaying = () => {
  continueAfterWin.value = true
}

const addRandomTile = () => {
  const emptyCells: { row: number; col: number }[] = []

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (!getTileAt(row, col)) {
        emptyCells.push({ row, col })
      }
    }
  }

  if (emptyCells.length === 0) return

  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
  const value = Math.random() < 0.9 ? 2 : 4
  const tileId = tileIdCounter++

  tiles.value.push({
    id: tileId,
    value,
    row: randomCell.row,
    col: randomCell.col,
    isNew: true
  })

  setTimeout(() => {
    const tile = tiles.value.find((item) => item.id === tileId)
    if (tile) {
      tile.isNew = false
    }
  }, 200)
}

const getTileAt = (row: number, col: number) => {
  return tiles.value.find((tile) => tile.row === row && tile.col === col)
}

const getTileClass = (value: number) => {
  if (value === TARGET_VAL) return 'tile-max'
  return 'tile-' + value
}

const move = (direction: 'up' | 'down' | 'left' | 'right') => {
  if (isOver.value) return

  let moved = false
  const mergedTiles: number[] = []

  tiles.value.forEach((tile) => {
    tile.isMerged = false
  })

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

      while (true) {
        const nextRow = newRow + dir.dr
        const nextCol = newCol + dir.dc

        if (nextRow < 0 || nextRow > 3 || nextCol < 0 || nextCol > 3) break

        const nextTile = getTileAt(nextRow, nextCol)

        if (!nextTile) {
          newRow = nextRow
          newCol = nextCol
        } else if (nextTile.value === tile.value && !mergedTiles.includes(nextTile.id)) {
          newRow = nextRow
          newCol = nextCol
          mergedTiles.push(nextTile.id)
          valueSum.value += tile.value * 2

          if (tile.value * 2 === TARGET_VAL && !hasWon.value) {
            hasWon.value = true
          }

          break
        } else {
          break
        }
      }

      if (newRow !== row || newCol !== col) {
        moved = true

        const targetTile = getTileAt(newRow, newCol)

        if (targetTile && targetTile.value === tile.value) {
          targetTile.value *= 2
          targetTile.isMerged = true

          const index = tiles.value.findIndex((item) => item.id === tile.id)
          if (index > -1) {
            tiles.value.splice(index, 1)
          }
        } else {
          tile.row = newRow
          tile.col = newCol
        }
      }
    }
  }

  if (moved) {
    setTimeout(() => {
      addRandomTile()

      if (!canMove()) {
        isOver.value = true
        void saveBestVal()
      }
    }, 150)
  }
}

const canMove = () => {
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (!getTileAt(row, col)) return true
    }
  }

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const tile = getTileAt(row, col)
      if (!tile) continue

      if (col < 3) {
        const rightTile = getTileAt(row, col + 1)
        if (rightTile && rightTile.value === tile.value) return true
      }

      if (row < 3) {
        const bottomTile = getTileAt(row + 1, col)
        if (bottomTile && bottomTile.value === tile.value) return true
      }
    }
  }

  return false
}

const onTouchStart = (e: any) => {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

const onTouchEnd = (e: any) => {
  const touchEndX = e.changedTouches[0].clientX
  const touchEndY = e.changedTouches[0].clientY

  const dx = touchEndX - touchStartX
  const dy = touchEndY - touchStartY
  const minSwipeDistance = 30

  if (Math.abs(dx) > Math.abs(dy)) {
    if (Math.abs(dx) > minSwipeDistance) {
      move(dx > 0 ? 'right' : 'left')
    }
  } else if (Math.abs(dy) > minSwipeDistance) {
    move(dy > 0 ? 'down' : 'up')
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: white;
}

.panel-wrapper {
  padding: 30rpx;
}

.top-actions {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 24rpx;
}

.back-btn {
  min-width: 220rpx;
  height: 78rpx;
  margin: 0;
  padding: 0 28rpx;
  border-radius: 999rpx;
  border: 2rpx solid #c9d4ee;
  background: #f5f8ff;
  color: #4a69bd;
  font-size: 26rpx;
  font-weight: 700;

  &::after {
    border: none;
  }
}

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

  &::after {
    border: none;
  }

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

@for $row from 0 through 3 {
  @for $col from 0 through 3 {
    .tile-position-#{$row}-#{$col} {
      top: calc(#{$row} * (25% + 3.75rpx));
      left: calc(#{$col} * (25% + 3.75rpx));
    }
  }
}

.tile-2 {
  background: #eee4da;
  border: 1px solid #d4c5b9;

  .tile-inner {
    color: #776e65;
  }
}

.tile-4 {
  background: #ede0c8;
  border: 1px solid #d4c5b9;

  .tile-inner {
    color: #776e65;
  }
}

.tile-8 {
  background: #f2b179;
  border: 1px solid #e39e5f;

  .tile-inner {
    color: #f9f6f2;
  }
}

.tile-16 {
  background: #f59563;
  border: 1px solid #e37d47;

  .tile-inner {
    color: #f9f6f2;
  }
}

.tile-32 {
  background: #f67c5f;
  border: 1px solid #e4634b;

  .tile-inner {
    color: #f9f6f2;
  }
}

.tile-64 {
  background: #f65e3b;
  border: 1px solid #e44827;

  .tile-inner {
    color: #f9f6f2;
  }
}

.tile-128 {
  background: #edcf72;

  .tile-inner {
    color: #f9f6f2;
    font-size: 40rpx;
  }
}

.tile-256 {
  background: #edcc61;

  .tile-inner {
    color: #f9f6f2;
    font-size: 40rpx;
  }
}

.tile-512 {
  background: #edc850;

  .tile-inner {
    color: #f9f6f2;
    font-size: 36rpx;
  }
}

.tile-1024 {
  background: #edc53f;

  .tile-inner {
    color: #f9f6f2;
    font-size: 32rpx;
  }
}

.tile-max {
  background: #edc22e;

  .tile-inner {
    color: #f9f6f2;
    font-size: 32rpx;
  }
}

.tile-4096 {
  background: #3c3a32;

  .tile-inner {
    color: #f9f6f2;
    font-size: 28rpx;
  }
}

@keyframes cell-appear {
  from {
    transform: scale(0.8);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes cell-update {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}

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

  &::after {
    border: none;
  }

  &.continue {
    background: #4a69bd;
    color: white;
  }

  &.restart {
    background: #e9ecef;
    color: #495057;
  }
}

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
</style>
