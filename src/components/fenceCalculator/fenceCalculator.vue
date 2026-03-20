<template>
  <view class="container">
    <PageHeader title="🧱 围栏计算器" subtitle="在网格中推演围合方案" />

    <view class="page-content">
      <view class="top-actions">
        <button class="back-btn" @tap="emit('back')">返回练习</button>
      </view>

      <view class="config-card">
        <view class="config-section">
          <view class="config-title">模式配置</view>
          <view class="config-options">
            <button
              class="config-btn"
              :class="{ active: mode === 'smart' }"
              @tap="changeMode('smart')"
            >
              智能陪练
            </button>
            <button
              class="config-btn"
              :class="{ active: mode === 'double' }"
              @tap="changeMode('double')"
            >
              双人模式
            </button>
          </view>
        </view>

        <view v-if="mode === 'smart'" class="config-section">
          <view class="config-title">难度级别</view>
          <view class="level-options">
            <button
              v-for="level in 5"
              :key="level"
              class="level-btn"
              :class="{ active: smartLevel === level }"
              @tap="changeLevel(level)"
            >
              {{ level }}级
            </button>
          </view>
        </view>
      </view>

      <view class="summary-card">
        <view class="summary-item">
          <text class="summary-label">当前轮次</text>
          <text class="summary-value">{{ currentRoleLabel }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">当前方案</text>
          <view class="tone-badge">
            <view class="tone-dot" :class="activeTone"></view>
            <text class="summary-value">{{ activeToneLabel }}</text>
          </view>
        </view>
        <view class="summary-item">
          <text class="summary-label">当前模式</text>
          <text class="summary-value">{{ modeLabel }}</text>
        </view>
        <view class="summary-item accent">
          <text class="summary-label">最佳连段</text>
          <text class="summary-number">{{ longestSegment }}</text>
        </view>
      </view>

      <view class="control-bar">
        <button class="action-btn secondary" :disabled="history.length === 0" @tap="rollbackLastMarker">
          撤回一步
        </button>
        <button class="action-btn primary" @tap="resetLayout">重新测算</button>
      </view>

      <view class="status-card">
        <view class="status-title">{{ statusTitle }}</view>
        <view class="status-subtitle">{{ statusSubtitle }}</view>
        <view class="legend-row">
          <view class="legend-item">
            <view class="legend-dot deep"></view>
            <text class="legend-text">深色方案</text>
          </view>
          <view class="legend-item">
            <view class="legend-dot light"></view>
            <text class="legend-text">浅色方案</text>
          </view>
          <view class="legend-item">
            <text class="legend-text">累计记录 {{ stepCount }} 步</text>
          </view>
        </view>
      </view>

      <view class="grid-wrapper">
        <view class="grid-board">
          <view
            v-for="cell in latticeCells"
            :key="cell.key"
            class="grid-cell"
            :class="{
              'edge-right': cell.col === GRID_SIZE - 1,
              'edge-bottom': cell.row === GRID_SIZE - 1
            }"
            @tap="handleCellTap(cell.row, cell.col)"
          >
            <view
              v-if="cell.tone"
              class="marker"
              :class="[cell.tone, cell.highlighted ? 'highlighted' : '']"
            ></view>
          </view>
        </view>

        <view v-if="layoutLocked" class="overlay-panel">
          <view class="overlay-title">{{ completedToneLabel }}已形成连续围栏</view>
          <view class="overlay-desc">检测到 {{ completedSegmentLength }} 个连续节点</view>
          <view class="overlay-actions">
            <button class="overlay-btn ghost" @tap="continueLayout">继续细化</button>
            <button class="overlay-btn solid" @tap="resetLayout">重新测算</button>
          </view>
        </view>
      </view>

      <view class="notes-card">
        <view class="notes-title">说明</view>
        <view class="notes-list">
          <text class="note-item">• 默认启用智能陪练模式，你先记录深色方案。</text>
          <text class="note-item">• 可在 1-5 级之间切换难度，也可以切换到双人模式。</text>
          <text class="note-item">• 智能陪练模式下，撤回会优先回退最近一轮记录。</text>
          <text class="note-item">• 任一方向出现 5 个连续同色节点时，会提示当前围栏已成型。</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
export default {
  name: 'FenceCalculator'
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'

const emit = defineEmits<{
  back: []
}>()

type Tone = 'deep' | 'light'
type Mode = 'smart' | 'double'
type ToneMap = Map<string, Tone>

interface Marker {
  row: number
  col: number
  tone: Tone
}

interface CellView {
  key: string
  row: number
  col: number
  tone: Tone | null
  highlighted: boolean
}

interface PlacementEvaluation {
  score: number
  bestLength: number
  immediate: boolean
  forkScore: number
}

interface MoveCandidate {
  row: number
  col: number
  attackScore: number
  defenseScore: number
  centerScore: number
  autoBestLength: number
  manualBestLength: number
  autoWin: boolean
  manualWin: boolean
}

const GRID_SIZE = 15
const TARGET_SEGMENT = 5
const HUMAN_TONE: Tone = 'deep'
const AUTO_TONE: Tone = 'light'
const toneTextMap: Record<Tone, string> = {
  deep: '深色方案',
  light: '浅色方案'
}
const modeTextMap: Record<Mode, string> = {
  smart: '智能陪练',
  double: '双人模式'
}

const markers = ref<Marker[]>([])
const history = ref<Marker[]>([])
const activeTone = ref<Tone>(HUMAN_TONE)
const layoutLocked = ref(false)
const completedTone = ref<Tone | null>(null)
const completedKeys = ref<string[]>([])
const longestSegment = ref(0)
const mode = ref<Mode>('smart')
const smartLevel = ref(3)
const autoThinking = ref(false)

let autoTimer: ReturnType<typeof setTimeout> | null = null

const markerToneMap = computed(() => {
  const map = new Map<string, Tone>()
  markers.value.forEach((marker) => {
    map.set(buildKey(marker.row, marker.col), marker.tone)
  })
  return map
})

const highlightedKeySet = computed(() => new Set(completedKeys.value))

const latticeCells = computed<CellView[]>(() => {
  const cells: CellView[] = []

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const key = buildKey(row, col)
      cells.push({
        key,
        row,
        col,
        tone: markerToneMap.value.get(key) ?? null,
        highlighted: highlightedKeySet.value.has(key)
      })
    }
  }

  return cells
})

const stepCount = computed(() => history.value.length)

const activeToneLabel = computed(() => toneTextMap[activeTone.value])

const modeLabel = computed(() => modeTextMap[mode.value])

const currentRoleLabel = computed(() => {
  if (mode.value === 'double') {
    return activeTone.value === HUMAN_TONE ? '深色记录方' : '浅色记录方'
  }

  return activeTone.value === HUMAN_TONE ? '你' : '智能陪练'
})

const completedToneLabel = computed(() => {
  if (!completedTone.value) {
    return '当前方案'
  }

  return toneTextMap[completedTone.value]
})

const completedSegmentLength = computed(() => completedKeys.value.length)

const statusTitle = computed(() => {
  if (layoutLocked.value) {
    return `${completedToneLabel.value}已形成连续围栏`
  }

  if (autoThinking.value) {
    return '智能陪练正在推演下一步'
  }

  if (mode.value === 'smart') {
    return activeTone.value === HUMAN_TONE ? '等待你记录下一个节点' : '即将补入浅色方案'
  }

  return `等待记录${activeToneLabel.value}`
})

const statusSubtitle = computed(() => {
  if (layoutLocked.value) {
    return '你可以重新测算，或继续细化当前布局。'
  }

  if (autoThinking.value) {
    return `当前难度 ${smartLevel.value} 级，正在为浅色方案计算落点。`
  }

  if (mode.value === 'smart') {
    if (history.value.length === 0) {
      return `默认启用智能陪练模式，当前难度 ${smartLevel.value} 级，请先记录第一个节点。`
    }

    return activeTone.value === HUMAN_TONE
      ? '点击下方网格继续记录；撤回会优先回退最近一轮记录。'
      : '浅色方案即将自动补入。'
  }

  if (history.value.length === 0) {
    return '双人模式下，深浅方案交替记录。'
  }

  const lastMarker = history.value[history.value.length - 1]
  return `最近记录：第 ${lastMarker.row + 1} 行，第 ${lastMarker.col + 1} 列。`
})

onBeforeUnmount(() => {
  clearAutoTimer()
})

function buildKey(row: number, col: number) {
  return `${row}-${col}`
}

function isInside(row: number, col: number) {
  return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE
}

function flipTone(tone: Tone): Tone {
  return tone === 'deep' ? 'light' : 'deep'
}

function clearAutoTimer() {
  if (autoTimer) {
    clearTimeout(autoTimer)
    autoTimer = null
  }
}

function createToneMap(extraMarkers: Marker[] = []) {
  const map = new Map<string, Tone>()

  markers.value.forEach((marker) => {
    map.set(buildKey(marker.row, marker.col), marker.tone)
  })

  extraMarkers.forEach((marker) => {
    map.set(buildKey(marker.row, marker.col), marker.tone)
  })

  return map
}

function getToneAt(row: number, col: number, toneMap: ToneMap) {
  return toneMap.get(buildKey(row, col)) ?? null
}

function collectSegment(row: number, col: number, deltaRow: number, deltaCol: number, tone: Tone) {
  const segment: { row: number; col: number }[] = []
  let startRow = row
  let startCol = col

  while (
    isInside(startRow - deltaRow, startCol - deltaCol) &&
    markerToneMap.value.get(buildKey(startRow - deltaRow, startCol - deltaCol)) === tone
  ) {
    startRow -= deltaRow
    startCol -= deltaCol
  }

  let currentRow = startRow
  let currentCol = startCol

  while (
    isInside(currentRow, currentCol) &&
    markerToneMap.value.get(buildKey(currentRow, currentCol)) === tone
  ) {
    segment.push({ row: currentRow, col: currentCol })
    currentRow += deltaRow
    currentCol += deltaCol
  }

  return segment
}

function inspectMarker(row: number, col: number, tone: Tone) {
  const directions = [
    { row: 1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 1 },
    { row: 1, col: -1 }
  ]

  let best = 1
  let completed: { row: number; col: number }[] = []

  directions.forEach((direction) => {
    const segment = collectSegment(row, col, direction.row, direction.col, tone)

    if (segment.length > best) {
      best = segment.length
    }

    if (segment.length >= TARGET_SEGMENT && completed.length === 0) {
      completed = segment
    }
  })

  return {
    best,
    completed
  }
}

function rebuildOverview() {
  let best = 0

  markers.value.forEach((marker) => {
    const inspection = inspectMarker(marker.row, marker.col, marker.tone)
    if (inspection.best > best) {
      best = inspection.best
    }
  })

  longestSegment.value = best
}

function measureSide(row: number, col: number, deltaRow: number, deltaCol: number, tone: Tone, toneMap: ToneMap) {
  let count = 0
  let currentRow = row + deltaRow
  let currentCol = col + deltaCol

  while (isInside(currentRow, currentCol) && getToneAt(currentRow, currentCol, toneMap) === tone) {
    count++
    currentRow += deltaRow
    currentCol += deltaCol
  }

  return {
    count,
    open: isInside(currentRow, currentCol) && !getToneAt(currentRow, currentCol, toneMap)
  }
}

function getPatternScore(length: number, openEnds: number) {
  if (length >= TARGET_SEGMENT) return 200000
  if (length === 4 && openEnds === 2) return 50000
  if (length === 4 && openEnds === 1) return 18000
  if (length === 3 && openEnds === 2) return 7000
  if (length === 3 && openEnds === 1) return 1600
  if (length === 2 && openEnds === 2) return 450
  if (length === 2 && openEnds === 1) return 120
  if (length === 1 && openEnds === 2) return 30
  return 10
}

function evaluatePlacement(row: number, col: number, tone: Tone, toneMap: ToneMap): PlacementEvaluation {
  const simulatedMap = new Map(toneMap)
  simulatedMap.set(buildKey(row, col), tone)

  const directions = [
    { row: 1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 1 },
    { row: 1, col: -1 }
  ]

  let score = 0
  let bestLength = 1
  let openFourCount = 0
  let liveThreeCount = 0

  directions.forEach((direction) => {
    const forward = measureSide(row, col, direction.row, direction.col, tone, simulatedMap)
    const backward = measureSide(row, col, -direction.row, -direction.col, tone, simulatedMap)
    const total = 1 + forward.count + backward.count
    const openEnds = (forward.open ? 1 : 0) + (backward.open ? 1 : 0)

    bestLength = Math.max(bestLength, total)
    score += getPatternScore(total, openEnds)

    if (total >= 4 && openEnds >= 1) {
      openFourCount++
    }

    if (total === 3 && openEnds === 2) {
      liveThreeCount++
    }
  })

  if (openFourCount >= 2) {
    score += 90000
  }

  if (liveThreeCount >= 2) {
    score += 20000
  }

  return {
    score,
    bestLength,
    immediate: bestLength >= TARGET_SEGMENT,
    forkScore: openFourCount * 12000 + liveThreeCount * 2600
  }
}

function getCenterScore(row: number, col: number) {
  const center = (GRID_SIZE - 1) / 2
  const distance = Math.abs(row - center) + Math.abs(col - center)
  return Math.max(0, 18 - distance)
}

function getMoveCandidates(toneMap: ToneMap) {
  const candidates: MoveCandidate[] = []

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (getToneAt(row, col, toneMap)) {
        continue
      }

      const attack = evaluatePlacement(row, col, AUTO_TONE, toneMap)
      const defense = evaluatePlacement(row, col, HUMAN_TONE, toneMap)

      candidates.push({
        row,
        col,
        attackScore: attack.score + attack.forkScore,
        defenseScore: defense.score + defense.forkScore,
        centerScore: getCenterScore(row, col),
        autoBestLength: attack.bestLength,
        manualBestLength: defense.bestLength,
        autoWin: attack.immediate,
        manualWin: defense.immediate
      })
    }
  }

  return candidates
}

function getLevelScore(candidate: MoveCandidate, level: number) {
  switch (level) {
    case 1:
      return (
        candidate.attackScore * 0.78 +
        candidate.defenseScore * 0.32 +
        candidate.centerScore * 10 +
        candidate.autoBestLength * 220
      )
    case 2:
      return (
        candidate.attackScore * 0.95 +
        candidate.defenseScore * 0.82 +
        candidate.centerScore * 11 +
        candidate.autoBestLength * 300 +
        candidate.manualBestLength * 120
      )
    case 3:
      return (
        candidate.attackScore * 1.05 +
        candidate.defenseScore * 1.12 +
        candidate.centerScore * 12 +
        candidate.autoBestLength * 420 +
        candidate.manualBestLength * 260
      )
    case 4:
      return (
        candidate.attackScore * 1.18 +
        candidate.defenseScore * 1.24 +
        candidate.centerScore * 10 +
        candidate.autoBestLength * 520 +
        candidate.manualBestLength * 420
      )
    default:
      return (
        candidate.attackScore * 1.22 +
        candidate.defenseScore * 1.28 +
        candidate.centerScore * 10 +
        candidate.autoBestLength * 600 +
        candidate.manualBestLength * 520
      )
  }
}

function pickRandomCandidate(candidates: MoveCandidate[], level: number) {
  const ranked = [...candidates]
    .sort((left, right) => getLevelScore(right, level) - getLevelScore(left, level))
    .slice(0, level === 1 ? 12 : 6)

  const weighted = ranked.map((candidate, index) => ({
    candidate,
    weight: ranked.length - index
  }))

  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0)
  let cursor = Math.random() * totalWeight

  for (const item of weighted) {
    cursor -= item.weight
    if (cursor <= 0) {
      return item.candidate
    }
  }

  return ranked[0]
}

function pickLevelFiveMove(candidates: MoveCandidate[]) {
  const shortlist = [...candidates]
    .sort((left, right) => getLevelScore(right, 5) - getLevelScore(left, 5))
    .slice(0, 8)

  let bestCandidate = shortlist[0]
  let bestScore = Number.NEGATIVE_INFINITY

  shortlist.forEach((candidate) => {
    const simulatedMap = createToneMap([
      {
        row: candidate.row,
        col: candidate.col,
        tone: AUTO_TONE
      }
    ])

    const opponentCandidates = getMoveCandidates(simulatedMap)
    const opponentThreat = opponentCandidates.reduce((maxThreat, item) => {
      const threatScore =
        (item.manualWin ? 220000 : 0) +
        item.defenseScore * 1.28 +
        item.manualBestLength * 900
      return Math.max(maxThreat, threatScore)
    }, 0)

    const currentScore = getLevelScore(candidate, 5) - opponentThreat * 0.82

    if (currentScore > bestScore) {
      bestScore = currentScore
      bestCandidate = candidate
    }
  })

  return bestCandidate
}

function pickAutoMove() {
  const toneMap = createToneMap()
  const candidates = getMoveCandidates(toneMap)

  if (candidates.length === 0) {
    return null
  }

  const winning = candidates
    .filter((candidate) => candidate.autoWin)
    .sort((left, right) => right.attackScore - left.attackScore)
  if (winning.length > 0) {
    return winning[0]
  }

  if (smartLevel.value >= 2) {
    const blocking = candidates
      .filter((candidate) => candidate.manualWin)
      .sort((left, right) => {
        return right.defenseScore - left.defenseScore || right.centerScore - left.centerScore
      })

    if (blocking.length > 0) {
      return blocking[0]
    }
  }

  if (smartLevel.value === 1 || smartLevel.value === 2) {
    return pickRandomCandidate(candidates, smartLevel.value)
  }

  if (smartLevel.value === 5) {
    return pickLevelFiveMove(candidates)
  }

  return [...candidates].sort((left, right) => {
    return getLevelScore(right, smartLevel.value) - getLevelScore(left, smartLevel.value)
  })[0]
}

function applyMarker(row: number, col: number, tone: Tone) {
  const key = buildKey(row, col)
  if (markerToneMap.value.has(key)) {
    return false
  }

  const marker: Marker = {
    row,
    col,
    tone
  }

  markers.value.push(marker)
  history.value.push(marker)

  const inspection = inspectMarker(row, col, tone)
  if (inspection.best > longestSegment.value) {
    longestSegment.value = inspection.best
  }

  activeTone.value = flipTone(tone)

  if (inspection.completed.length >= TARGET_SEGMENT) {
    layoutLocked.value = true
    completedTone.value = tone
    completedKeys.value = inspection.completed.map((item) => buildKey(item.row, item.col))
  }

  return true
}

function scheduleAutoTurn() {
  if (mode.value !== 'smart' || layoutLocked.value || activeTone.value !== AUTO_TONE) {
    return
  }

  clearAutoTimer()
  autoThinking.value = true

  autoTimer = setTimeout(() => {
    autoTimer = null

    if (mode.value !== 'smart' || layoutLocked.value || activeTone.value !== AUTO_TONE) {
      autoThinking.value = false
      return
    }

    const move = pickAutoMove()
    autoThinking.value = false

    if (!move) {
      return
    }

    applyMarker(move.row, move.col, AUTO_TONE)
  }, 220 + smartLevel.value * 40)
}

function handleCellTap(row: number, col: number) {
  if (layoutLocked.value) {
    uni.showToast({
      title: '当前围栏已成型',
      icon: 'none'
    })
    return
  }

  if (autoThinking.value) {
    uni.showToast({
      title: '正在推演中',
      icon: 'none'
    })
    return
  }

  if (mode.value === 'smart' && activeTone.value !== HUMAN_TONE) {
    uni.showToast({
      title: '当前轮到智能陪练',
      icon: 'none'
    })
    return
  }

  const placed = applyMarker(row, col, activeTone.value)
  if (!placed) {
    uni.showToast({
      title: '该网格已有节点',
      icon: 'none'
    })
    return
  }

  if (mode.value === 'smart' && !layoutLocked.value && activeTone.value === AUTO_TONE) {
    scheduleAutoTurn()
  }
}

function rollbackLastMarker() {
  if (history.value.length === 0) {
    return
  }

  clearAutoTimer()
  autoThinking.value = false

  const rollbackCount =
    mode.value === 'smart' && history.value[history.value.length - 1]?.tone === AUTO_TONE
      ? Math.min(2, history.value.length)
      : 1

  let restoredTone = HUMAN_TONE

  for (let index = 0; index < rollbackCount; index++) {
    const lastMarker = history.value.pop()
    if (!lastMarker) {
      break
    }

    restoredTone = lastMarker.tone
    const removeIndex = markers.value.findIndex((marker) => {
      return marker.row === lastMarker.row && marker.col === lastMarker.col
    })

    if (removeIndex > -1) {
      markers.value.splice(removeIndex, 1)
    }
  }

  activeTone.value = restoredTone
  layoutLocked.value = false
  completedTone.value = null
  completedKeys.value = []
  rebuildOverview()
}

function resetLayout() {
  clearAutoTimer()
  autoThinking.value = false
  markers.value = []
  history.value = []
  activeTone.value = HUMAN_TONE
  layoutLocked.value = false
  completedTone.value = null
  completedKeys.value = []
  longestSegment.value = 0
}

function continueLayout() {
  layoutLocked.value = false
  completedTone.value = null
  completedKeys.value = []

  if (mode.value === 'smart' && activeTone.value === AUTO_TONE) {
    scheduleAutoTurn()
  }
}

function changeMode(nextMode: Mode) {
  if (mode.value === nextMode) {
    return
  }

  mode.value = nextMode
  resetLayout()
}

function changeLevel(level: number) {
  if (smartLevel.value === level) {
    return
  }

  smartLevel.value = level

  if (mode.value === 'smart' && activeTone.value === AUTO_TONE && !layoutLocked.value) {
    scheduleAutoTurn()
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f4ecde 0%, #f8f6f1 100%);
  padding-bottom: 40rpx;
}

.page-content {
  padding: 30rpx;
}

.top-actions {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 24rpx;
}

.back-btn,
.config-btn,
.level-btn,
.action-btn,
.overlay-btn {
  margin: 0;

  &::after {
    border: none;
  }
}

.back-btn {
  min-width: 220rpx;
  height: 78rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  border: 2rpx solid #d7c19f;
  background: rgba(255, 250, 242, 0.92);
  color: #75552e;
  font-size: 26rpx;
  font-weight: 700;
}

.config-card,
.summary-card,
.status-card,
.notes-card {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 12rpx 28rpx rgba(70, 54, 32, 0.08);
  border: 1rpx solid rgba(130, 95, 54, 0.12);
}

.config-card {
  margin-bottom: 24rpx;
}

.config-section + .config-section {
  margin-top: 24rpx;
}

.config-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #3a2a18;
  margin-bottom: 16rpx;
}

.config-options,
.level-options {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.config-btn,
.level-btn {
  height: 72rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  border: 2rpx solid #dbc5a3;
  background: #fffaf2;
  color: #7a5830;
  font-size: 24rpx;
  font-weight: 700;

  &.active {
    background: linear-gradient(135deg, #b67731 0%, #8f5720 100%);
    color: #fffaf2;
    border-color: #8f5720;
    box-shadow: 0 8rpx 18rpx rgba(143, 87, 32, 0.2);
  }
}

.summary-card {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
  margin-bottom: 24rpx;
}

.summary-item {
  min-width: 0;
  padding: 20rpx;
  background: #faf6ef;
  border-radius: 18rpx;

  &.accent {
    background: linear-gradient(135deg, #f6ead5 0%, #f3dfba 100%);
  }
}

.summary-label {
  display: block;
  font-size: 24rpx;
  color: #7a6244;
  margin-bottom: 12rpx;
}

.summary-value,
.summary-number {
  font-size: 32rpx;
  font-weight: 700;
  color: #3a2a18;
  word-break: break-all;
}

.summary-number {
  display: block;
}

.tone-badge {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.tone-dot,
.legend-dot,
.marker {
  border-radius: 50%;
}

.tone-dot,
.legend-dot {
  width: 24rpx;
  height: 24rpx;
  flex-shrink: 0;
}

.control-bar {
  display: flex;
  gap: 18rpx;
  margin-bottom: 24rpx;
}

.action-btn,
.overlay-btn {
  flex: 1;
  height: 84rpx;
  border-radius: 18rpx;
  font-size: 28rpx;
  font-weight: 700;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn {
  &.primary {
    background: linear-gradient(135deg, #b67731 0%, #8f5720 100%);
    color: #fffaf2;
    box-shadow: 0 10rpx 22rpx rgba(143, 87, 32, 0.24);
  }

  &.secondary {
    background: #fffaf2;
    color: #7a5830;
    border: 2rpx solid #d4bd97;
  }

  &[disabled] {
    opacity: 0.5;
  }
}

.status-card {
  margin-bottom: 24rpx;
}

.status-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #3a2a18;
}

.status-subtitle {
  margin-top: 10rpx;
  font-size: 25rpx;
  line-height: 1.6;
  color: #7a6244;
}

.legend-row {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.legend-text {
  font-size: 24rpx;
  color: #6d573a;
}

.deep {
  background: linear-gradient(135deg, #3f2b1d 0%, #21150d 100%);
  box-shadow: inset -4rpx -4rpx 8rpx rgba(255, 255, 255, 0.1);
}

.light {
  background: linear-gradient(135deg, #fff8ef 0%, #ebdcc3 100%);
  box-shadow: inset -4rpx -4rpx 8rpx rgba(255, 255, 255, 0.8);
  border: 1rpx solid rgba(122, 98, 68, 0.18);
}

.grid-wrapper {
  position: relative;
  width: 690rpx;
  height: 690rpx;
  margin: 0 auto 28rpx;
}

.grid-board {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(15, minmax(0, 1fr));
  grid-template-rows: repeat(15, minmax(0, 1fr));
  grid-auto-rows: minmax(0, 1fr);
  background: linear-gradient(180deg, #d5b17f 0%, #c59660 100%);
  border: 2rpx solid #8c6439;
  border-radius: 24rpx;
  overflow: hidden;
  box-sizing: border-box;
  box-shadow:
    inset 0 6rpx 16rpx rgba(255, 255, 255, 0.18),
    0 16rpx 34rpx rgba(95, 64, 31, 0.18);
}

.grid-cell {
  position: relative;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
  border-right: 1rpx solid rgba(88, 58, 27, 0.42);
  border-bottom: 1rpx solid rgba(88, 58, 27, 0.42);

  &.edge-right {
    border-right: none;
  }

  &.edge-bottom {
    border-bottom: none;
  }
}

.marker {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 28rpx;
  height: 28rpx;
  margin-left: -14rpx;
  margin-top: -14rpx;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  transform: scale(0.96);

  &.highlighted {
    transform: scale(1.1);
    box-shadow:
      0 0 0 6rpx rgba(255, 233, 153, 0.58),
      0 8rpx 18rpx rgba(78, 52, 20, 0.24);
  }
}

.overlay-panel {
  position: absolute;
  left: 30rpx;
  right: 30rpx;
  bottom: 24rpx;
  background: rgba(255, 250, 242, 0.96);
  border: 1rpx solid rgba(160, 110, 54, 0.24);
  border-radius: 22rpx;
  padding: 24rpx;
  box-shadow: 0 14rpx 28rpx rgba(60, 39, 14, 0.18);
  backdrop-filter: blur(6rpx);
}

.overlay-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #3a2a18;
}

.overlay-desc {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #715938;
}

.overlay-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 20rpx;
}

.overlay-btn {
  &.ghost {
    background: #fff;
    color: #7b5b32;
    border: 2rpx solid #d6c2a0;
  }

  &.solid {
    background: linear-gradient(135deg, #b67731 0%, #8f5720 100%);
    color: #fffaf2;
  }
}

.notes-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #3a2a18;
  margin-bottom: 16rpx;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.note-item {
  font-size: 24rpx;
  line-height: 1.7;
  color: #705839;
}
</style>
