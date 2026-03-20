<template>
  <view class="container">
    <PageHeader title="🌐 地势演算器" subtitle="通过落点与连通关系推演地势变化" />

    <view class="page-content">
      <view class="top-actions">
        <button class="back-btn" @tap="emit('back')">返回练习</button>
      </view>

      <view class="config-card">
        <view class="config-section">
          <view class="config-title">模式配置</view>
          <view class="config-options">
            <button class="config-btn" :class="{ active: mode === 'smart' }" @tap="changeMode('smart')">
              智能陪练
            </button>
            <button class="config-btn" :class="{ active: mode === 'double' }" @tap="changeMode('double')">
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
          <text class="summary-label">深色占点</text>
          <text class="summary-number">{{ deepPlacedCount }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">浅色占点</text>
          <text class="summary-number">{{ lightPlacedCount }}</text>
        </view>
      </view>

      <view v-if="showBeginnerGuide && beginnerGuide" class="guide-card">
        <view class="guide-title">{{ beginnerGuide.title }}</view>
        <view class="guide-summary">{{ beginnerGuide.summary }}</view>
        <view class="guide-focus">{{ beginnerGuide.focus }}</view>
        <view class="guide-suggestion">{{ beginnerGuide.suggestion }}</view>
        <view class="guide-points">
          <text v-for="point in beginnerGuide.points" :key="point" class="guide-point">• {{ point }}</text>
        </view>
      </view>

      <view class="control-bar">
        <button class="action-btn secondary" :disabled="history.length === 0" @tap="rollbackLastAction">
          撤回一步
        </button>
        <button class="action-btn ghost" @tap="passTurn">暂缓记录</button>
        <button class="action-btn primary" @tap="resetBoard">重新测算</button>
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
            <text class="legend-text">连续暂缓 {{ consecutivePasses }} 次</text>
          </view>
        </view>
      </view>

      <view class="board-wrapper">
        <view class="board-surface">
          <view
            v-for="cell in boardCells"
            :key="cell.key"
            class="board-cell"
            :class="{
              'edge-right': cell.col === BOARD_SIZE - 1,
              'edge-bottom': cell.row === BOARD_SIZE - 1
            }"
            @tap="handleCellTap(cell.row, cell.col)"
          >
            <view v-if="cell.guided && !cell.tone" class="guide-ring"></view>
            <view v-if="cell.star && !cell.tone" class="star-dot"></view>
            <view v-if="cell.tone" class="marker" :class="[cell.tone, cell.highlighted ? 'highlighted' : '']"></view>
          </view>
        </view>

        <view v-if="roundFinished && areaSummary" class="overlay-panel">
          <view class="overlay-title">本轮地势汇总</view>
          <view class="overlay-judge">{{ roundDecisionText }}</view>
          <view class="overlay-grid">
            <view class="overlay-item">
              <text class="overlay-label">深色综合值</text>
              <text class="overlay-value">{{ areaSummary.deepTotal }}</text>
            </view>
            <view class="overlay-item">
              <text class="overlay-label">浅色综合值</text>
              <text class="overlay-value">{{ areaSummary.lightTotal }}</text>
            </view>
            <view class="overlay-item">
              <text class="overlay-label">深色空域</text>
              <text class="overlay-value">{{ areaSummary.deepArea }}</text>
            </view>
            <view class="overlay-item">
              <text class="overlay-label">浅色空域</text>
              <text class="overlay-value">{{ areaSummary.lightArea }}</text>
            </view>
          </view>
          <view class="overlay-desc">{{ areaSummary.resultText }}</view>
          <view class="overlay-actions">
            <button class="overlay-btn ghost" @tap="continueRound">继续细化</button>
            <button class="overlay-btn solid" @tap="resetBoard">重新测算</button>
          </view>
        </view>
      </view>

      <view class="notes-card">
        <view class="notes-title">说明</view>
        <view class="notes-list">
          <text class="note-item">• 点击交点放置标记，深浅方案轮流推进。</text>
          <text class="note-item">• 默认启用智能陪练模式，可切换到双人模式与 1-5 级难度。</text>
          <text class="note-item">• 当连通块失去全部外部通道时，会被自动清理。</text>
          <text class="note-item">• 连续两次暂缓记录后，将根据占点与封闭空域生成本轮汇总。</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
export default {
  name: 'TerrainAnalyzer'
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
type BoardCellTone = Tone | null

interface CellView {
  key: string
  row: number
  col: number
  tone: BoardCellTone
  star: boolean
  highlighted: boolean
  guided: boolean
}

interface GroupInfo {
  cells: { row: number; col: number }[]
  liberties: Set<string>
}

interface AttemptResult {
  valid: boolean
  reason?: 'occupied' | 'self_lock' | 'loop'
  board?: BoardCellTone[][]
  removedCount?: number
  ownLiberties?: number
  nextLoopBlockKey?: string | null
  highlightedKeys?: string[]
}

interface AreaSummary {
  deepArea: number
  lightArea: number
  deepPlaced: number
  lightPlaced: number
  deepTotal: number
  lightTotal: number
  winnerTone: Tone | null
  margin: number
  resultText: string
}

interface BeginnerGuide {
  title: string
  summary: string
  focus: string
  suggestion: string
  points: string[]
}

interface Snapshot {
  board: BoardCellTone[][]
  activeTone: Tone
  consecutivePasses: number
  deepRemovedCount: number
  lightRemovedCount: number
  loopBlockKey: string | null
  roundFinished: boolean
  highlightedKeys: string[]
  areaSummary: AreaSummary | null
}

interface HistoryEntry {
  snapshot: Snapshot
  actor: Tone
  type: 'place' | 'pass'
}

interface Candidate {
  row: number
  col: number
  score: number
}

const BOARD_SIZE = 19
const HUMAN_TONE: Tone = 'deep'
const AUTO_TONE: Tone = 'light'
const STAR_INDEXES = [3, 9, 15]
const toneLabelMap: Record<Tone, string> = {
  deep: '深色方案',
  light: '浅色方案'
}

const board = ref(createBoard())
const mode = ref<Mode>('smart')
const smartLevel = ref(3)
const activeTone = ref<Tone>(HUMAN_TONE)
const autoThinking = ref(false)
const consecutivePasses = ref(0)
const roundFinished = ref(false)
const loopBlockKey = ref<string | null>(null)
const highlightedKeys = ref<string[]>([])
const history = ref<HistoryEntry[]>([])
const deepRemovedCount = ref(0)
const lightRemovedCount = ref(0)
const areaSummary = ref<AreaSummary | null>(null)

let autoTimer: ReturnType<typeof setTimeout> | null = null

const boardCells = computed<CellView[]>(() => {
  const highlightSet = new Set(highlightedKeys.value)
  const guideKey = beginnerHintCell.value ? buildKey(beginnerHintCell.value.row, beginnerHintCell.value.col) : ''
  const cells: CellView[] = []

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const key = buildKey(row, col)
      cells.push({
        key,
        row,
        col,
        tone: board.value[row][col],
        star: STAR_INDEXES.includes(row) && STAR_INDEXES.includes(col),
        highlighted: highlightSet.has(key),
        guided: key === guideKey
      })
    }
  }

  return cells
})

const deepPlacedCount = computed(() => countPlaced('deep'))
const lightPlacedCount = computed(() => countPlaced('light'))
const activeToneLabel = computed(() => toneLabelMap[activeTone.value])
const showBeginnerGuide = computed(() => mode.value === 'smart' && smartLevel.value === 1)

const currentRoleLabel = computed(() => {
  if (mode.value === 'double') {
    return activeTone.value === HUMAN_TONE ? '深色记录方' : '浅色记录方'
  }

  return activeTone.value === HUMAN_TONE ? '你' : '智能陪练'
})

const statusTitle = computed(() => {
  if (roundFinished.value) {
    return '本轮地势汇总已生成'
  }

  if (autoThinking.value) {
    return '智能陪练正在推演下一步'
  }

  if (mode.value === 'smart') {
    return activeTone.value === HUMAN_TONE ? '等待你记录下一个交点' : '浅色方案即将补入'
  }

  return `等待记录${activeToneLabel.value}`
})

const statusSubtitle = computed(() => {
  if (roundFinished.value) {
    return areaSummary.value?.resultText ?? '本轮测算已完成。'
  }

  if (autoThinking.value) {
    return `当前难度 ${smartLevel.value} 级，正在为浅色方案分析交点。`
  }

  if (mode.value === 'smart') {
    return activeTone.value === HUMAN_TONE
      ? '你可以继续记录，也可以选择暂缓记录。'
      : '浅色方案会在短暂推演后自动补入。'
  }

  return '双人模式下，深浅方案将依次记录。'
})

const beginnerHintCell = computed(() => {
  if (!showBeginnerGuide.value || roundFinished.value || autoThinking.value || activeTone.value !== HUMAN_TONE) {
    return null
  }

  const candidates = collectEvaluatedCandidates(board.value, HUMAN_TONE, loopBlockKey.value)
  if (candidates.length === 0) {
    return null
  }

  const best = [...candidates].sort((left, right) => right.score - left.score)[0]
  return {
    row: best.row,
    col: best.col
  }
})

const beginnerGuide = computed<BeginnerGuide | null>(() => {
  if (!showBeginnerGuide.value) {
    return null
  }

  if (roundFinished.value) {
    return {
      title: '入门指引',
      summary: '本轮已经完成汇总，可以先看结果再决定是否继续。',
      focus: '先观察哪一侧在封闭空域与占点上更有优势。',
      suggestion: '如果想继续练习，可点击“继续细化”；如果想重新开始，可点击“重新测算”。',
      points: [
        '两次连续暂缓后会生成结果汇总。',
        '胜负以占点与封闭空域的综合值为准。',
        '如果你看不懂差距，先比较深浅双方的空域大小。'
      ]
    }
  }

  if (autoThinking.value) {
    return {
      title: '入门指引',
      summary: '当前轮到浅色方案响应。',
      focus: '先观察对方会贴近哪一块，看看它是在扩张，还是在压缩你的通道。',
      suggestion: '等浅色方案补入后，再找它附近通道较少的位置继续记录。',
      points: [
        '相邻交点越紧密，越容易形成连通块。',
        '对方只剩一个外部通道时，下一步通常值得重点关注。',
        '观察比急着落点更重要。'
      ]
    }
  }

  const suggestedText = beginnerHintCell.value
    ? `建议优先观察第 ${beginnerHintCell.value.row + 1} 行、第 ${beginnerHintCell.value.col + 1} 列附近。`
    : '建议先从中央附近开始，逐步向外扩张。'

  if (deepPlacedCount.value + lightPlacedCount.value === 0) {
    return {
      title: '入门指引',
      summary: '初级模式会尽量给你更直观的提示，第一步先从中央附近起手。',
      focus: '先建立一块容易向四周延展的连通区域，不要急着贴边。',
      suggestion: suggestedText,
      points: [
        '点击的是交点，不是小格子内部。',
        '靠近中央时，通常更容易保留外部通道。',
        '先学会保持连通，再考虑封闭空域。'
      ]
    }
  }

  if (consecutivePasses.value === 1) {
    return {
      title: '入门指引',
      summary: '当前已经暂缓过一次，再暂缓一次就会生成本轮结果。',
      focus: '如果局面还没稳定，优先补强通道较少的一侧；如果已经稳定，可以考虑直接汇总。',
      suggestion: suggestedText,
      points: [
        '暂缓不是放弃，而是告诉系统“当前局面接近稳定”。',
        '如果一块区域仍然容易被压缩，就先别急着汇总。',
        '看不准时，先在建议位置附近补一手通常更稳。'
      ]
    }
  }

  return {
    title: '入门指引',
    summary: '这一手优先找“能保留自己通道，同时压缩对方通道”的位置。',
    focus: '如果你的连通块只剩很少外部通道，先做加固；如果对方通道更少，就优先压缩它。',
    suggestion: suggestedText,
    points: [
      '外部通道越多，连通块越安全。',
      '相邻的己方标记可以共享通道。',
      '不要让新落点把自己完全封死，否则这一步无效。'
    ]
  }
})

const roundDecisionText = computed(() => {
  if (!areaSummary.value) {
    return ''
  }

  if (!areaSummary.value.winnerTone || areaSummary.value.margin === 0) {
    return '本轮判定：双方持平。'
  }

  if (mode.value === 'double') {
    return `本轮判定：${toneLabelMap[areaSummary.value.winnerTone]}胜出，优势 ${areaSummary.value.margin} 点。`
  }

  return areaSummary.value.winnerTone === HUMAN_TONE
    ? `本轮判定：你胜出，优势 ${areaSummary.value.margin} 点。`
    : `本轮判定：智能陪练胜出，优势 ${areaSummary.value.margin} 点。`
})

onBeforeUnmount(() => {
  clearAutoTimer()
})

function createBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => null as BoardCellTone))
}

function cloneBoard(source: BoardCellTone[][]) {
  return source.map((row) => [...row])
}

function buildKey(row: number, col: number) {
  return `${row}-${col}`
}

function serializeBoard(source: BoardCellTone[][]) {
  return source.map((row) => row.map((cell) => {
    if (cell === 'deep') return 'd'
    if (cell === 'light') return 'l'
    return '_'
  }).join('')).join('|')
}

function isInside(row: number, col: number) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
}

function flipTone(tone: Tone): Tone {
  return tone === 'deep' ? 'light' : 'deep'
}

function getNeighbors(row: number, col: number) {
  return [
    { row: row - 1, col },
    { row: row + 1, col },
    { row, col: col - 1 },
    { row, col: col + 1 }
  ].filter((item) => isInside(item.row, item.col))
}

function countPlaced(tone: Tone) {
  let count = 0

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board.value[row][col] === tone) {
        count++
      }
    }
  }

  return count
}

function collectGroup(source: BoardCellTone[][], row: number, col: number): GroupInfo | null {
  const tone = source[row][col]
  if (!tone) return null

  const queue = [{ row, col }]
  const visited = new Set<string>([buildKey(row, col)])
  const liberties = new Set<string>()
  const cells: { row: number; col: number }[] = []

  while (queue.length > 0) {
    const current = queue.shift()!
    cells.push(current)

    getNeighbors(current.row, current.col).forEach((neighbor) => {
      const neighborKey = buildKey(neighbor.row, neighbor.col)
      const neighborTone = source[neighbor.row][neighbor.col]

      if (!neighborTone) {
        liberties.add(neighborKey)
        return
      }

      if (neighborTone === tone && !visited.has(neighborKey)) {
        visited.add(neighborKey)
        queue.push(neighbor)
      }
    })
  }

  return {
    cells,
    liberties
  }
}

function createSnapshot(): Snapshot {
  return {
    board: cloneBoard(board.value),
    activeTone: activeTone.value,
    consecutivePasses: consecutivePasses.value,
    deepRemovedCount: deepRemovedCount.value,
    lightRemovedCount: lightRemovedCount.value,
    loopBlockKey: loopBlockKey.value,
    roundFinished: roundFinished.value,
    highlightedKeys: [...highlightedKeys.value],
    areaSummary: areaSummary.value ? { ...areaSummary.value } : null
  }
}

function restoreSnapshot(snapshot: Snapshot) {
  board.value = cloneBoard(snapshot.board)
  activeTone.value = snapshot.activeTone
  consecutivePasses.value = snapshot.consecutivePasses
  deepRemovedCount.value = snapshot.deepRemovedCount
  lightRemovedCount.value = snapshot.lightRemovedCount
  loopBlockKey.value = snapshot.loopBlockKey
  roundFinished.value = snapshot.roundFinished
  highlightedKeys.value = [...snapshot.highlightedKeys]
  areaSummary.value = snapshot.areaSummary ? { ...snapshot.areaSummary } : null
  autoThinking.value = false
}

function clearAutoTimer() {
  if (autoTimer) {
    clearTimeout(autoTimer)
    autoTimer = null
  }
}

function attemptPlace(source: BoardCellTone[][], row: number, col: number, tone: Tone, blockedLoopKey: string | null): AttemptResult {
  if (source[row][col]) {
    return { valid: false, reason: 'occupied' }
  }

  const nextBoard = cloneBoard(source)
  nextBoard[row][col] = tone

  let removedCount = 0
  const highlighted: string[] = []
  const opponent = flipTone(tone)
  const visitedGroups = new Set<string>()

  getNeighbors(row, col).forEach((neighbor) => {
    if (nextBoard[neighbor.row][neighbor.col] !== opponent) {
      return
    }

    const groupKey = buildKey(neighbor.row, neighbor.col)
    if (visitedGroups.has(groupKey)) {
      return
    }

    const group = collectGroup(nextBoard, neighbor.row, neighbor.col)
    if (!group) {
      return
    }

    group.cells.forEach((cell) => {
      visitedGroups.add(buildKey(cell.row, cell.col))
    })

    if (group.liberties.size === 0) {
      group.cells.forEach((cell) => {
        nextBoard[cell.row][cell.col] = null
        highlighted.push(buildKey(cell.row, cell.col))
      })
      removedCount += group.cells.length
    }
  })

  const ownGroup = collectGroup(nextBoard, row, col)
  if (!ownGroup || ownGroup.liberties.size === 0) {
    return { valid: false, reason: 'self_lock' }
  }

  const nextSignature = serializeBoard(nextBoard)
  if (blockedLoopKey && nextSignature === blockedLoopKey) {
    return { valid: false, reason: 'loop' }
  }

  const nextLoopBlockKey =
    removedCount === 1 && ownGroup.cells.length === 1
      ? serializeBoard(source)
      : null

  highlighted.push(buildKey(row, col))

  return {
    valid: true,
    board: nextBoard,
    removedCount,
    ownLiberties: ownGroup.liberties.size,
    nextLoopBlockKey,
    highlightedKeys: highlighted
  }
}

function buildAreaSummary(source: BoardCellTone[][]): AreaSummary {
  const visited = new Set<string>()
  let deepArea = 0
  let lightArea = 0

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const key = buildKey(row, col)
      if (visited.has(key) || source[row][col]) {
        continue
      }

      const queue = [{ row, col }]
      const region: { row: number; col: number }[] = []
      const borderingTones = new Set<Tone>()
      visited.add(key)

      while (queue.length > 0) {
        const current = queue.shift()!
        region.push(current)

        getNeighbors(current.row, current.col).forEach((neighbor) => {
          const neighborKey = buildKey(neighbor.row, neighbor.col)
          const neighborTone = source[neighbor.row][neighbor.col]

          if (!neighborTone && !visited.has(neighborKey)) {
            visited.add(neighborKey)
            queue.push(neighbor)
          } else if (neighborTone) {
            borderingTones.add(neighborTone)
          }
        })
      }

      if (borderingTones.size === 1) {
        const owner = Array.from(borderingTones)[0]
        if (owner === 'deep') {
          deepArea += region.length
        } else {
          lightArea += region.length
        }
      }
    }
  }

  const deepPlaced = source.reduce((sum, row) => {
    return sum + row.filter((cell) => cell === 'deep').length
  }, 0)

  const lightPlaced = source.reduce((sum, row) => {
    return sum + row.filter((cell) => cell === 'light').length
  }, 0)

  const deepTotal = deepPlaced + deepArea
  const lightTotal = lightPlaced + lightArea
  const margin = Math.abs(deepTotal - lightTotal)
  const winnerTone = deepTotal === lightTotal ? null : deepTotal > lightTotal ? 'deep' : 'light'

  let resultText = '两侧地势保持平衡。'
  if (deepTotal > lightTotal) {
    resultText = `深色方案领先 ${margin} 点。`
  } else if (lightTotal > deepTotal) {
    resultText = `浅色方案领先 ${margin} 点。`
  }

  return {
    deepArea,
    lightArea,
    deepPlaced,
    lightPlaced,
    deepTotal,
    lightTotal,
    winnerTone,
    margin,
    resultText
  }
}

function finalizeRound() {
  areaSummary.value = buildAreaSummary(board.value)
  roundFinished.value = true
  highlightedKeys.value = []
  autoThinking.value = false
  clearAutoTimer()
}

function continueRound() {
  roundFinished.value = false
  consecutivePasses.value = 0
  areaSummary.value = null

  if (mode.value === 'smart' && activeTone.value === AUTO_TONE) {
    scheduleAutoTurn()
  }
}

function resetBoard() {
  clearAutoTimer()
  board.value = createBoard()
  history.value = []
  activeTone.value = HUMAN_TONE
  mode.value = mode.value
  consecutivePasses.value = 0
  roundFinished.value = false
  loopBlockKey.value = null
  highlightedKeys.value = []
  areaSummary.value = null
  deepRemovedCount.value = 0
  lightRemovedCount.value = 0
  autoThinking.value = false
}

function applyPlace(row: number, col: number, tone: Tone) {
  const result = attemptPlace(board.value, row, col, tone, loopBlockKey.value)
  if (!result.valid || !result.board) {
    return result
  }

  history.value.push({
    snapshot: createSnapshot(),
    actor: tone,
    type: 'place'
  })

  board.value = result.board
  highlightedKeys.value = result.highlightedKeys ?? []
  consecutivePasses.value = 0
  loopBlockKey.value = result.nextLoopBlockKey ?? null
  activeTone.value = flipTone(tone)
  roundFinished.value = false
  areaSummary.value = null

  if (tone === 'deep') {
    deepRemovedCount.value += result.removedCount ?? 0
  } else {
    lightRemovedCount.value += result.removedCount ?? 0
  }

  return result
}

function handleCellTap(row: number, col: number) {
  if (roundFinished.value) {
    uni.showToast({
      title: '请先处理本轮汇总',
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

  const result = applyPlace(row, col, activeTone.value)

  if (!result.valid) {
    const titleMap = {
      occupied: '该交点已有标记',
      self_lock: '当前会形成闭锁自陷',
      loop: '当前需要避开回环复现'
    }

    uni.showToast({
      title: titleMap[result.reason!],
      icon: 'none'
    })
    return
  }

  if (mode.value === 'smart' && activeTone.value === AUTO_TONE) {
    scheduleAutoTurn()
  }
}

function passTurn() {
  if (roundFinished.value) {
    uni.showToast({
      title: '本轮汇总已生成',
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

  const tone = activeTone.value
  history.value.push({
    snapshot: createSnapshot(),
    actor: tone,
    type: 'pass'
  })

  highlightedKeys.value = []
  consecutivePasses.value += 1
  loopBlockKey.value = null
  activeTone.value = flipTone(tone)
  areaSummary.value = null

  if (consecutivePasses.value >= 2) {
    finalizeRound()
    return
  }

  if (mode.value === 'smart' && activeTone.value === AUTO_TONE) {
    scheduleAutoTurn()
  }
}

function rollbackLastAction() {
  if (history.value.length === 0) {
    return
  }

  clearAutoTimer()
  autoThinking.value = false

  const rollbackCount =
    mode.value === 'smart' && history.value[history.value.length - 1]?.actor === AUTO_TONE
      ? Math.min(2, history.value.length)
      : 1

  let targetSnapshot: Snapshot | null = null

  for (let index = 0; index < rollbackCount; index++) {
    const entry = history.value.pop()
    if (!entry) {
      break
    }
    targetSnapshot = entry.snapshot
  }

  if (targetSnapshot) {
    restoreSnapshot(targetSnapshot)
  }
}

function changeMode(nextMode: Mode) {
  if (mode.value === nextMode) {
    return
  }

  mode.value = nextMode
  resetBoard()
}

function changeLevel(level: number) {
  if (smartLevel.value === level) {
    return
  }

  smartLevel.value = level

  if (mode.value === 'smart' && activeTone.value === AUTO_TONE && !roundFinished.value) {
    scheduleAutoTurn()
  }
}

function getCandidateCells(source: BoardCellTone[][]) {
  const occupied: { row: number; col: number }[] = []
  const candidates = new Set<string>()

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (source[row][col]) {
        occupied.push({ row, col })
      }
    }
  }

  if (occupied.length === 0) {
    return [{ row: Math.floor(BOARD_SIZE / 2), col: Math.floor(BOARD_SIZE / 2) }]
  }

  occupied.forEach((cell) => {
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const row = cell.row + dr
        const col = cell.col + dc
        if (!isInside(row, col) || source[row][col]) {
          continue
        }
        candidates.add(buildKey(row, col))
      }
    }
  })

  if (candidates.size === 0) {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (!source[row][col]) {
          candidates.add(buildKey(row, col))
        }
      }
    }
  }

  return Array.from(candidates).map((item) => {
    const [row, col] = item.split('-').map(Number)
    return { row, col }
  })
}

function evaluateCandidate(row: number, col: number, tone: Tone, source: BoardCellTone[][], blockedLoopKey: string | null) {
  const attempt = attemptPlace(source, row, col, tone, blockedLoopKey)
  if (!attempt.valid || !attempt.board) {
    return null
  }

  const neighbors = getNeighbors(row, col)
  const friendlyTone = tone
  const opponentTone = flipTone(tone)
  let friendlyTouch = 0
  let opponentTouch = 0
  let rescueValue = 0
  let pressureValue = 0
  const handledFriendly = new Set<string>()
  const handledOpponent = new Set<string>()

  neighbors.forEach((neighbor) => {
    const originalTone = source[neighbor.row][neighbor.col]
    if (!originalTone) {
      return
    }

    const group = collectGroup(source, neighbor.row, neighbor.col)
    if (!group) {
      return
    }

    const groupKeys = group.cells.map((cell) => buildKey(cell.row, cell.col))
    const hasFriendlyGroup = groupKeys.some((key) => handledFriendly.has(key))
    const hasOpponentGroup = groupKeys.some((key) => handledOpponent.has(key))

    if (originalTone === friendlyTone && !hasFriendlyGroup) {
      friendlyTouch += group.cells.length
      groupKeys.forEach((key) => handledFriendly.add(key))

      if (group.liberties.size === 1) {
        rescueValue += group.cells.length * 18
      } else if (group.liberties.size === 2) {
        rescueValue += group.cells.length * 8
      }
    }

    if (originalTone === opponentTone && !hasOpponentGroup) {
      opponentTouch += group.cells.length
      groupKeys.forEach((key) => handledOpponent.add(key))

      if (group.liberties.size === 1) {
        pressureValue += group.cells.length * 20
      } else if (group.liberties.size === 2) {
        pressureValue += group.cells.length * 7
      }
    }
  })

  const center = (BOARD_SIZE - 1) / 2
  const centerScore = Math.max(0, 24 - Math.abs(row - center) - Math.abs(col - center))
  const ownLiberties = attempt.ownLiberties ?? 0

  const score =
    (attempt.removedCount ?? 0) * 260 +
    ownLiberties * 18 +
    friendlyTouch * 11 +
    opponentTouch * 9 +
    rescueValue +
    pressureValue +
    centerScore * 6 -
    (ownLiberties <= 1 ? 180 : 0)

  return {
    row,
    col,
    score,
    nextBoard: attempt.board,
    nextLoopBlockKey: attempt.nextLoopBlockKey ?? null
  }
}

function collectEvaluatedCandidates(source: BoardCellTone[][], tone: Tone, blockedLoopKey: string | null) {
  return getCandidateCells(source)
    .map((cell) => evaluateCandidate(cell.row, cell.col, tone, source, blockedLoopKey))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
}

function pickWeightedCandidate(candidates: Candidate[]) {
  const ranked = [...candidates]
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

function pickAutoCandidate() {
  const candidates = collectEvaluatedCandidates(board.value, AUTO_TONE, loopBlockKey.value)

  if (candidates.length === 0) {
    return null
  }

  const sorted = [...candidates].sort((left, right) => right.score - left.score)

  if (smartLevel.value === 1) {
    return pickWeightedCandidate(sorted.slice(0, 12).map((item) => ({
      row: item.row,
      col: item.col,
      score: item.score
    })))
  }

  if (smartLevel.value === 2) {
    return pickWeightedCandidate(sorted.slice(0, 8).map((item) => ({
      row: item.row,
      col: item.col,
      score: item.score
    })))
  }

  if (smartLevel.value === 5) {
    const shortlist = sorted.slice(0, 6)
    let best = shortlist[0]
    let bestScore = Number.NEGATIVE_INFINITY

    shortlist.forEach((candidate) => {
      const responses = collectEvaluatedCandidates(candidate.nextBoard, HUMAN_TONE, candidate.nextLoopBlockKey)
      const responseScore = responses.length > 0
        ? Math.max(...responses.map((item) => item.score))
        : 0
      const currentScore = candidate.score - responseScore * 0.72

      if (currentScore > bestScore) {
        bestScore = currentScore
        best = candidate
      }
    })

    return {
      row: best.row,
      col: best.col,
      score: bestScore
    }
  }

  return {
    row: sorted[0].row,
    col: sorted[0].col,
    score: sorted[0].score
  }
}

function shouldAutoPass(bestScore: number) {
  const occupied = deepPlacedCount.value + lightPlacedCount.value

  if (occupied < 120) {
    return false
  }

  const thresholdMap = [260, 320, 380, 440, 520]
  const threshold = thresholdMap[smartLevel.value - 1]

  if (consecutivePasses.value === 0) {
    return occupied > 250 && bestScore < threshold
  }

  const summary = buildAreaSummary(board.value)
  const autoAhead = summary.lightTotal >= summary.deepTotal
  return autoAhead && bestScore < threshold
}

function scheduleAutoTurn() {
  if (mode.value !== 'smart' || roundFinished.value || activeTone.value !== AUTO_TONE) {
    return
  }

  clearAutoTimer()
  autoThinking.value = true

  autoTimer = setTimeout(() => {
    autoTimer = null

    if (mode.value !== 'smart' || roundFinished.value || activeTone.value !== AUTO_TONE) {
      autoThinking.value = false
      return
    }

    const candidate = pickAutoCandidate()
    autoThinking.value = false

    if (!candidate || shouldAutoPass(candidate.score)) {
      history.value.push({
        snapshot: createSnapshot(),
        actor: AUTO_TONE,
        type: 'pass'
      })

      highlightedKeys.value = []
      consecutivePasses.value += 1
      loopBlockKey.value = null
      activeTone.value = HUMAN_TONE

      if (consecutivePasses.value >= 2) {
        finalizeRound()
      }
      return
    }

    applyPlace(candidate.row, candidate.col, AUTO_TONE)
  }, 220 + smartLevel.value * 50)
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #efe3c6 0%, #f8f5ed 100%);
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
  border: 2rpx solid #d1b685;
  background: rgba(255, 249, 238, 0.95);
  color: #76522a;
  font-size: 26rpx;
  font-weight: 700;
}

.config-card,
.guide-card,
.summary-card,
.status-card,
.notes-card {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 12rpx 28rpx rgba(81, 59, 30, 0.08);
  border: 1rpx solid rgba(133, 95, 41, 0.12);
}

.config-card {
  margin-bottom: 24rpx;
}

.config-section + .config-section {
  margin-top: 22rpx;
}

.config-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #3f2c1a;
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
  border: 2rpx solid #dcc39b;
  background: #fff8ee;
  color: #795831;
  font-size: 24rpx;
  font-weight: 700;

  &.active {
    background: linear-gradient(135deg, #b7823a 0%, #8e5b1f 100%);
    color: #fffaf2;
    border-color: #8e5b1f;
  }
}

.summary-card {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
  margin-bottom: 24rpx;
}

.guide-card {
  margin-bottom: 24rpx;
  background: linear-gradient(135deg, #eef5e3 0%, #fbf8ef 100%);
}

.guide-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #31492d;
}

.guide-summary {
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: #516244;
}

.guide-focus {
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: #6c5232;
  font-weight: 600;
}

.guide-suggestion {
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: #2f6c58;
  font-weight: 700;
}

.guide-points {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  margin-top: 16rpx;
}

.guide-point {
  font-size: 23rpx;
  line-height: 1.7;
  color: #5c654d;
}

.summary-item {
  min-width: 0;
  background: #faf3e6;
  border-radius: 18rpx;
  padding: 20rpx;
}

.summary-label {
  display: block;
  font-size: 24rpx;
  color: #7b6446;
  margin-bottom: 10rpx;
}

.summary-value,
.summary-number {
  font-size: 32rpx;
  font-weight: 700;
  color: #322315;
  word-break: break-all;
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
  flex-shrink: 0;
}

.tone-dot,
.legend-dot {
  width: 24rpx;
  height: 24rpx;
}

.control-bar {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.action-btn,
.overlay-btn {
  flex: 1;
  height: 84rpx;
  border-radius: 18rpx;
  font-size: 27rpx;
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
  }

  &.secondary {
    background: #fff9f0;
    color: #7a5830;
    border: 2rpx solid #d6bc93;
  }

  &.ghost {
    background: linear-gradient(135deg, #e7efe0 0%, #bfd0ae 100%);
    color: #315235;
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
  color: #3b2917;
}

.status-subtitle {
  margin-top: 10rpx;
  font-size: 25rpx;
  line-height: 1.6;
  color: #786140;
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
  color: #6d5739;
}

.deep {
  background: linear-gradient(135deg, #413327 0%, #251c15 100%);
}

.light {
  background: linear-gradient(135deg, #fffaf3 0%, #e5d8bf 100%);
  border: 1rpx solid rgba(112, 89, 56, 0.22);
}

.board-wrapper {
  position: relative;
  width: 690rpx;
  height: 690rpx;
  margin: 0 auto 28rpx;
}

.board-surface {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(19, minmax(0, 1fr));
  grid-template-rows: repeat(19, minmax(0, 1fr));
  background: linear-gradient(180deg, #dcb071 0%, #c99456 100%);
  border-radius: 24rpx;
  overflow: hidden;
  border: 2rpx solid #8d6028;
  box-sizing: border-box;
  box-shadow:
    inset 0 6rpx 16rpx rgba(255, 255, 255, 0.18),
    0 16rpx 34rpx rgba(85, 55, 22, 0.18);
}

.board-cell {
  position: relative;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
  border-right: 1rpx solid rgba(86, 56, 24, 0.42);
  border-bottom: 1rpx solid rgba(86, 56, 24, 0.42);

  &.edge-right {
    border-right: none;
  }

  &.edge-bottom {
    border-bottom: none;
  }
}

.star-dot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 8rpx;
  height: 8rpx;
  margin-left: -4rpx;
  margin-top: -4rpx;
  border-radius: 50%;
  background: rgba(90, 57, 24, 0.58);
}

.guide-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 28rpx;
  height: 28rpx;
  margin-left: -14rpx;
  margin-top: -14rpx;
  border-radius: 50%;
  border: 3rpx dashed rgba(42, 124, 92, 0.72);
  background: rgba(153, 228, 196, 0.2);
  box-shadow: 0 0 0 8rpx rgba(153, 228, 196, 0.14);
}

.marker {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 24rpx;
  height: 24rpx;
  margin-left: -12rpx;
  margin-top: -12rpx;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &.highlighted {
    transform: scale(1.1);
    box-shadow:
      0 0 0 6rpx rgba(255, 236, 170, 0.5),
      0 8rpx 18rpx rgba(76, 49, 19, 0.18);
  }
}

.overlay-panel {
  position: absolute;
  left: 30rpx;
  right: 30rpx;
  bottom: 24rpx;
  background: rgba(255, 250, 242, 0.97);
  border-radius: 22rpx;
  padding: 24rpx;
  border: 1rpx solid rgba(147, 102, 45, 0.22);
  box-shadow: 0 14rpx 28rpx rgba(65, 43, 19, 0.18);
}

.overlay-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #352514;
}

.overlay-judge {
  margin-top: 12rpx;
  font-size: 25rpx;
  line-height: 1.7;
  color: #2f6c58;
  font-weight: 700;
}

.overlay-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
  margin-top: 18rpx;
}

.overlay-item {
  background: #f9f1e3;
  border-radius: 16rpx;
  padding: 16rpx;
}

.overlay-label {
  display: block;
  font-size: 23rpx;
  color: #7b6240;
  margin-bottom: 8rpx;
}

.overlay-value {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #352514;
}

.overlay-desc {
  margin-top: 18rpx;
  font-size: 24rpx;
  color: #6a5438;
  line-height: 1.6;
}

.overlay-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 20rpx;
}

.overlay-btn {
  &.ghost {
    background: #fff;
    color: #78572e;
    border: 2rpx solid #d8c19c;
  }

  &.solid {
    background: linear-gradient(135deg, #b67731 0%, #8f5720 100%);
    color: #fffaf2;
  }
}

.notes-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #382718;
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
  color: #6d5638;
}
</style>
