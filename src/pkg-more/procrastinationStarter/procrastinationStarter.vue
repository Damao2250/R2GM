<template>
  <view class="container">
    <PageHeader title="⏳ 拖延启动器" subtitle="倒计时 + 口算 + 随机动作，过完仪式再进工具" />

    <view class="page-content">
      <view class="card">
        <view class="card-title">目标工具</view>
        <picker mode="selector" :range="toolTitles" :value="selectedToolIndex" @change="handleToolChange">
          <view class="picker-field">{{ selectedTool?.title || '请选择一个工具' }}</view>
        </picker>
        <button class="primary-btn" @click="startStarter">启动仪式</button>
      </view>

      <view class="card" v-if="phase === 'countdown'">
        <view class="card-title">阶段一：倒计时</view>
        <view class="big-number">{{ countdown }}</view>
        <view class="helper-text">先稳住 10 秒，把“等会再说”从脑子里挪出去。</view>
      </view>

      <view class="card" v-else-if="phase === 'quiz'">
        <view class="card-title">阶段二：口算启动</view>
        <view class="quiz-line">{{ quizLeft }} + {{ quizRight }} = ?</view>
        <input class="text-input" v-model="quizAnswer" type="number" placeholder="输入答案" />
        <button class="primary-btn" @click="submitQuiz">提交答案</button>
      </view>

      <view class="card" v-else-if="phase === 'action'">
        <view class="card-title">阶段三：随机动作</view>
        <view class="action-box">{{ actionPrompt }}</view>
        <label class="confirm-line">
          <checkbox :checked="actionConfirmed" @click="toggleActionConfirmed" />
          <text>我已经做完这个动作了</text>
        </label>
        <button class="primary-btn" @click="completeAction">完成，准备进入工具</button>
      </view>

      <view class="card" v-else-if="phase === 'ready'">
        <view class="card-title">启动完成</view>
        <view class="ready-box">仪式结束，今天就别再拖了，去把 {{ selectedTool?.title }} 打开。</view>
        <view class="action-row">
          <view class="minor-btn" @click="resetStarter">重来一次</view>
          <view class="minor-btn primary" @click="launchTool">进入工具</view>
        </view>
      </view>
    </view>
  </view>
</template>

<route lang="json5">
{
  style: {
    navigationBarTitleText: '拖延启动器',
    enablePullDownRefresh: false
  }
}
</route>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: '拖延启动器 - DM工具箱',
    path: '/pkg-more/procrastinationStarter/procrastinationStarter'
  })
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { moreToolIdeas } from '@/utils/moreTools'
import { getToolsList, getVisibleTools } from '@/utils/toolsManager'
import { recordPersonaSignal, recordToolUsage } from '@/utils/toolUsage'

type StarterPhase = 'idle' | 'countdown' | 'quiz' | 'action' | 'ready'

interface StarterTool {
  title: string
  url: string
}

const EXCLUDED_URLS = new Set([
  '/pkg-more/moreTools/moreTools',
  '/pkg-more/procrastinationStarter/procrastinationStarter'
])

const actionPrompts = [
  '站起来伸个懒腰，再重新坐下。',
  '深呼吸三次，然后把肩膀放松。',
  '把手机举起来，对自己说一句“先做两分钟”。',
  '快速眨眼五次，再把注意力拉回手头。'
]

const phase = ref<StarterPhase>('idle')
const toolPool = ref<StarterTool[]>([])
const selectedToolIndex = ref(0)
const countdown = ref(10)
const quizLeft = ref(0)
const quizRight = ref(0)
const quizAnswer = ref('')
const actionPrompt = ref(actionPrompts[0])
const actionConfirmed = ref(false)

let countdownTimer: ReturnType<typeof setInterval> | null = null

const toolTitles = computed(() => toolPool.value.map(item => item.title))
const selectedTool = computed(() => toolPool.value[selectedToolIndex.value] || null)

const clearCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

const buildToolPool = async () => {
  const visibleTools = getVisibleTools(await getToolsList()).filter(tool => !EXCLUDED_URLS.has(tool.url))
  const extraTools = moreToolIdeas
    .filter(tool => !EXCLUDED_URLS.has(tool.url))
    .map(tool => ({
      title: tool.title,
      url: tool.url
    }))
  const combined = [...visibleTools.map(tool => ({ title: tool.title, url: tool.url })), ...extraTools]
  const uniqueTools: StarterTool[] = []
  const seen = new Set<string>()

  for (const tool of combined) {
    if (seen.has(tool.url)) {
      continue
    }

    seen.add(tool.url)
    uniqueTools.push(tool)
  }

  toolPool.value = uniqueTools
}

const prepareQuiz = () => {
  quizLeft.value = Math.floor(Math.random() * 20) + 1
  quizRight.value = Math.floor(Math.random() * 20) + 1
  quizAnswer.value = ''
  phase.value = 'quiz'
}

const startStarter = () => {
  if (!selectedTool.value) {
    uni.showToast({
      title: '请先选择一个工具',
      icon: 'none'
    })
    return
  }

  clearCountdown()
  countdown.value = 10
  phase.value = 'countdown'

  countdownTimer = setInterval(() => {
    if (countdown.value <= 1) {
      clearCountdown()
      prepareQuiz()
      return
    }

    countdown.value -= 1
  }, 1000)
}

const submitQuiz = () => {
  const answer = Number.parseInt(quizAnswer.value, 10)

  if (answer !== quizLeft.value + quizRight.value) {
    uni.showToast({
      title: '答案不对，换一题继续启动',
      icon: 'none'
    })
    prepareQuiz()
    return
  }

  actionPrompt.value = actionPrompts[Math.floor(Math.random() * actionPrompts.length)]
  actionConfirmed.value = false
  phase.value = 'action'
}

const toggleActionConfirmed = () => {
  actionConfirmed.value = !actionConfirmed.value
}

const completeAction = () => {
  if (!actionConfirmed.value) {
    uni.showToast({
      title: '先把动作做完',
      icon: 'none'
    })
    return
  }

  phase.value = 'ready'
  recordPersonaSignal('procrastination-complete', selectedTool.value?.title)
}

const launchTool = () => {
  if (!selectedTool.value) {
    return
  }

  recordToolUsage(
    {
      title: selectedTool.value.title,
      url: selectedTool.value.url
    },
    'procrastination-starter'
  )

  uni.navigateTo({
    url: selectedTool.value.url
  })
}

const handleToolChange = (event: { detail?: { value?: number | string } }) => {
  selectedToolIndex.value = Number(event.detail?.value || 0)
}

const resetStarter = () => {
  clearCountdown()
  phase.value = 'idle'
  quizAnswer.value = ''
  actionConfirmed.value = false
}

onMounted(async () => {
  await buildToolPool()
})

onBeforeUnmount(() => {
  clearCountdown()
})
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f7fa;
}

.page-content {
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
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

.picker-field,
.text-input {
  width: 100%;
  box-sizing: border-box;
  min-height: 96rpx;
  height: 96rpx;
  border-radius: 18rpx;
  border: 2rpx solid #e5e7eb;
  background: #f9fafb;
  padding: 0 24rpx;
  font-size: 28rpx;
  line-height: 96rpx;
  color: #111827;
  margin-bottom: 20rpx;
}

.primary-btn {
  width: 100%;
  border: none;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  color: #fff;
  font-size: 30rpx;
  padding: 24rpx 0;
}

.big-number {
  font-size: 120rpx;
  font-weight: 700;
  color: #f97316;
  text-align: center;
  line-height: 1.1;
}

.helper-text,
.ready-box,
.action-box {
  font-size: 24rpx;
  line-height: 1.8;
  color: #475569;
}

.quiz-line {
  font-size: 52rpx;
  font-weight: 700;
  color: #0f172a;
  text-align: center;
  margin-bottom: 24rpx;
}

.action-box {
  background: #fff7ed;
  border-radius: 18rpx;
  padding: 22rpx;
}

.confirm-line {
  display: flex;
  align-items: center;
  gap: 14rpx;
  font-size: 24rpx;
  color: #334155;
  margin: 20rpx 0;
}

.action-row {
  display: flex;
  gap: 16rpx;
}

.minor-btn {
  flex: 1;
  text-align: center;
  padding: 18rpx 0;
  border-radius: 18rpx;
  background: #fef3c7;
  color: #b45309;
  font-size: 25rpx;
}

.minor-btn.primary {
  background: #f97316;
  color: #fff;
}
</style>
