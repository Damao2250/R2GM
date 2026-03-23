<template>
  <view class="container">
    <PageHeader title="🖼️ 结果卡片工厂" subtitle="把结果包装成一张带氛围感的分享卡片" />

    <view class="page-content">
      <view class="card">
        <view class="card-title">卡片模板</view>
        <view class="template-grid">
          <view
            v-for="template in templateOptions"
            :key="template.id"
            class="template-item"
            :class="{ active: selectedTemplateId === template.id }"
            @click="applyTemplate(template.id)"
          >
            {{ template.icon }} {{ template.title }}
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-title">卡片内容</view>
        <input class="text-input" v-model="cardTitle" placeholder="卡片标题，例如：距离旅行还剩" />
        <input class="text-input" v-model="cardValue" placeholder="核心结果，例如：03 天" />
        <textarea class="textarea-input" v-model="cardSummary" maxlength="120" placeholder="补充描述，例如：坚持住，明天就能放假了。"></textarea>
        <input class="text-input" v-model="cardFooter" placeholder="页脚，例如：DM工具箱 · 结果卡片工厂" />
        <view class="footer-toggle" @click="toggleCardFooter">
          <view class="footer-toggle-copy">
            <text class="footer-toggle-title">导出时显示页脚</text>
            <text class="footer-toggle-desc">关闭后，预览、图片和复制文案都不会带页脚</text>
          </view>
          <view class="toggle-switch">
            <view class="switch-bg" :class="{ active: showCardFooter }">
              <view class="switch-dot"></view>
            </view>
            <text class="switch-label">{{ showCardFooter ? '显示' : '隐藏' }}</text>
          </view>
        </view>
        <button class="primary-btn" @click="generateCard">生成卡片图</button>
      </view>

      <view class="preview-card" :style="{ background: currentTemplate.preview }">
        <text class="preview-icon">{{ currentTemplate.icon }}</text>
        <text class="preview-title">{{ cardTitle }}</text>
        <text class="preview-value">{{ cardValue }}</text>
        <text class="preview-summary">{{ cardSummary }}</text>
        <text v-if="showCardFooter" class="preview-footer">{{ cardFooter }}</text>
      </view>

      <canvas canvas-id="resultCardCanvas" class="hidden-canvas"></canvas>

      <view v-if="cardImage" class="card">
        <view class="card-title">导出结果</view>
        <image class="card-image" :src="cardImage" mode="widthFix"></image>
        <view class="action-row">
          <view class="minor-btn" @click="copyCardText">复制文案</view>
          <view class="minor-btn primary" @click="saveCardImage">保存图片</view>
        </view>
      </view>
    </view>
  </view>
</template>

<route lang="json5">
{
  style: {
    navigationBarTitleText: '结果卡片工厂',
    enablePullDownRefresh: false
  }
}
</route>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: '结果卡片工厂 - DM工具箱',
    path: '/pkg-more/resultCardFactory/resultCardFactory'
  })
}
</script>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import dayjs from '@/utils/dayjs'
import { drawRoundedRect, exportCanvasImage, flushCanvasDraw, getErrorMessage, wrapCanvasText } from '@/utils/canvasTools'
import { recordPersonaSignal } from '@/utils/toolUsage'

interface CardTemplate {
  id: string
  title: string
  icon: string
  preview: string
  colors: [string, string]
  defaults: {
    title: string
    value: string
    summary: string
    footer: string
  }
}

const CANVAS_ID = 'resultCardCanvas'
const CANVAS_WIDTH = 720
const CANVAS_HEIGHT = 920

const getCountdownDefaults = () => {
  const today = dayjs().startOf('day')
  const weekday = today.day()

  if (weekday === 0 || weekday === 6) {
    return {
      title: '距离周末还有',
      value: '00 天',
      summary: '周末已经开始了，先把休息和快乐认真安排上。',
      footer: 'DM工具箱 · 倒数结果'
    }
  }

  const daysUntilWeekend = 6 - weekday

  return {
    title: '距离周末还有',
    value: `${String(daysUntilWeekend).padStart(2, '0')} 天`,
    summary: `再认真撑 ${daysUntilWeekend} 天，周末就会准时来接你。`,
    footer: 'DM工具箱 · 倒数结果'
  }
}

const templateOptions: CardTemplate[] = [
  {
    id: 'countdown',
    title: '倒数日',
    icon: '📅',
    preview: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    colors: ['#4f46e5', '#7c3aed'],
    defaults: getCountdownDefaults()
  },
  {
    id: 'birthday',
    title: '生日 / 星座',
    icon: '🎂',
    preview: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
    colors: ['#ec4899', '#f97316'],
    defaults: {
      title: '下一次生日',
      value: '还剩 126 天',
      summary: '今年要比去年更会庆祝，蛋糕和愿望都提前安排。',
      footer: 'DM工具箱 · 生日卡片'
    }
  },
  {
    id: 'decision',
    title: '随机决策',
    icon: '🎴',
    preview: 'linear-gradient(135deg, #0f766e 0%, #16a34a 100%)',
    colors: ['#0f766e', '#16a34a'],
    defaults: {
      title: '今日随机结果',
      value: '火锅局',
      summary: '既然命运已经做出了选择，那就别再反悔了。',
      footer: 'DM工具箱 · 决策卡片'
    }
  },
  {
    id: 'discount',
    title: '折扣结果',
    icon: '💵',
    preview: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)',
    colors: ['#f59e0b', '#dc2626'],
    defaults: {
      title: '本次优惠到手',
      value: '省下 88 元',
      summary: '满减、折扣和凑单一起算完，这次确实没亏。',
      footer: 'DM工具箱 · 优惠卡片'
    }
  }
]

const selectedTemplateId = ref('countdown')
const cardTitle = ref('')
const cardValue = ref('')
const cardSummary = ref('')
const cardFooter = ref('')
const showCardFooter = ref(true)
const cardImage = ref('')

const currentTemplate = computed(() => {
  return templateOptions.find(item => item.id === selectedTemplateId.value) || templateOptions[0]
})

const applyTemplate = (templateId: string) => {
  const template = templateOptions.find(item => item.id === templateId)

  if (!template) {
    return
  }

  const defaults = template.id === 'countdown' ? getCountdownDefaults() : template.defaults

  selectedTemplateId.value = template.id
  cardTitle.value = defaults.title
  cardValue.value = defaults.value
  cardSummary.value = defaults.summary
  cardFooter.value = defaults.footer
}

const toggleCardFooter = () => {
  showCardFooter.value = !showCardFooter.value
}

const formatDateTime24Hour = () => {
  return dayjs().format('YYYY-MM-DD HH:mm:ss')
}

const measureCanvasText = (ctx: any, text: string, fontSize: number) => {
  const measured = ctx.measureText?.(text)

  if (typeof measured?.width === 'number') {
    return measured.width
  }

  return text.length * fontSize * 0.55
}

const ellipsizeCanvasText = (ctx: any, text: string, maxWidth: number, fontSize: number) => {
  const normalizedText = text.trim()

  if (!normalizedText || measureCanvasText(ctx, normalizedText, fontSize) <= maxWidth) {
    return normalizedText
  }

  let truncated = normalizedText

  while (truncated.length > 1) {
    truncated = truncated.slice(0, -1).trimEnd()
    const candidate = `${truncated}…`

    if (measureCanvasText(ctx, candidate, fontSize) <= maxWidth) {
      return candidate
    }
  }

  return '…'
}

const fitCanvasSingleLine = (
  ctx: any,
  text: string,
  maxWidth: number,
  initialFontSize: number,
  minFontSize: number
) => {
  let fontSize = initialFontSize

  ctx.setFontSize(fontSize)

  while (fontSize > minFontSize && measureCanvasText(ctx, text, fontSize) > maxWidth) {
    fontSize -= 2
    ctx.setFontSize(fontSize)
  }

  return {
    fontSize,
    text: measureCanvasText(ctx, text, fontSize) <= maxWidth ? text : ellipsizeCanvasText(ctx, text, maxWidth, fontSize)
  }
}

const generateCard = async () => {
  if (!cardTitle.value.trim() || !cardValue.value.trim()) {
    uni.showToast({
      title: '标题和结果不能为空',
      icon: 'none'
    })
    return
  }

  try {
    uni.showLoading({
      title: '绘制中...'
    })

    const ctx = uni.createCanvasContext(CANVAS_ID)
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    gradient.addColorStop(0, currentTemplate.value.colors[0])
    gradient.addColorStop(1, currentTemplate.value.colors[1])

    ctx.setFillStyle(gradient)
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    ctx.setFillStyle('rgba(255, 255, 255, 0.14)')
    drawRoundedRect(ctx, 40, 42, CANVAS_WIDTH - 80, CANVAS_HEIGHT - 84, 38)
    ctx.fill()

    ctx.setFillStyle('#ffffff')
    ctx.setFontSize(66)
    ctx.fillText(currentTemplate.value.icon, 66, 128)

    const titleLayout = fitCanvasSingleLine(ctx, cardTitle.value.trim(), 560, 34, 24)
    ctx.setFontSize(titleLayout.fontSize)
    ctx.fillText(titleLayout.text, 66, 202)

    ctx.setFillStyle('#ffffff')
    const valueLayout = fitCanvasSingleLine(ctx, cardValue.value.trim(), 560, 92, 46)
    ctx.setFontSize(valueLayout.fontSize)
    ctx.fillText(valueLayout.text, 66, 350)

    ctx.setFillStyle('rgba(255,255,255,0.92)')
    ctx.setFontSize(30)
    const summaryLines = wrapCanvasText(ctx, cardSummary.value || '把结果做成一张卡，方便分享给别人。', 560).slice(0, 4)
    summaryLines.forEach((line, index) => {
      ctx.fillText(line, 66, 450 + index * 52)
    })
    const summaryBottomY = 450 + Math.max(summaryLines.length - 1, 0) * 52
    if (showCardFooter.value) {
      const footerStartY = Math.max(summaryBottomY + 120, CANVAS_HEIGHT - 120)
      const footerLayout = fitCanvasSingleLine(ctx, cardFooter.value.trim(), 560, 24, 18)

      ctx.setFontSize(footerLayout.fontSize)
      ctx.setFillStyle('rgba(255,255,255,0.78)')
      ctx.fillText(footerLayout.text, 66, footerStartY)
      ctx.setFontSize(24)
      ctx.fillText(`生成时间 ${formatDateTime24Hour()}`, 66, footerStartY + 42)
    }

    await flushCanvasDraw(ctx)
    cardImage.value = await exportCanvasImage(CANVAS_ID, CANVAS_WIDTH, CANVAS_HEIGHT)
    recordPersonaSignal('result-card-export', selectedTemplateId.value)

    uni.showToast({
      title: '卡片已生成',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({
      title: getErrorMessage(error, '卡片生成失败'),
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

const copyCardText = async () => {
  try {
    const cardText = [
      cardTitle.value.trim(),
      cardValue.value.trim(),
      cardSummary.value.trim(),
      showCardFooter.value ? cardFooter.value.trim() : ''
    ]
      .filter(Boolean)
      .join('\n')

    await uni.setClipboardData({
      data: cardText
    })
  } catch (error) {
    uni.showToast({
      title: '复制失败',
      icon: 'none'
    })
  }
}

const saveCardImage = async () => {
  if (!cardImage.value) {
    return
  }

  try {
    await uni.saveImageToPhotosAlbum({
      filePath: cardImage.value
    })

    uni.showToast({
      title: '已保存到相册',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    })
  }
}

watch([selectedTemplateId, cardTitle, cardValue, cardSummary, cardFooter, showCardFooter], () => {
  cardImage.value = ''
})

onMounted(() => {
  applyTemplate(selectedTemplateId.value)
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

.template-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
}

.template-item {
  padding: 16rpx 20rpx;
  border-radius: 18rpx;
  font-size: 25rpx;
  color: #4338ca;
  background: #eef2ff;
}

.template-item.active {
  background: #4338ca;
  color: #fff;
}

.text-input,
.textarea-input {
  width: 100%;
  box-sizing: border-box;
  border-radius: 18rpx;
  border: 2rpx solid #e5e7eb;
  background: #f9fafb;
  font-size: 28rpx;
  color: #111827;
  margin-bottom: 18rpx;
}

.text-input {
  min-height: 96rpx;
  height: 96rpx;
  padding: 0 24rpx;
  line-height: 96rpx;
}

.textarea-input {
  min-height: 220rpx;
  padding: 24rpx;
  line-height: 1.7;
}

.primary-btn {
  width: 100%;
  border: none;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #4338ca 0%, #7c3aed 100%);
  color: #fff;
  font-size: 30rpx;
  padding: 24rpx 0;
}

.footer-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  padding: 22rpx 24rpx;
  margin-bottom: 18rpx;
  border-radius: 18rpx;
  background: #f8fafc;
  border: 2rpx solid #e5e7eb;
}

.footer-toggle-copy {
  flex: 1;
}

.footer-toggle-title {
  display: block;
  font-size: 28rpx;
  color: #111827;
  font-weight: 600;
}

.footer-toggle-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 23rpx;
  line-height: 1.6;
  color: #6b7280;
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
}

.switch-bg {
  width: 56rpx;
  height: 32rpx;
  border-radius: 16rpx;
  background: #d1d5db;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 2rpx;
  transition: all 0.3s ease;
}

.switch-bg.active {
  background: #4338ca;
  justify-content: flex-end;
}

.switch-dot {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background: #fff;
}

.switch-label {
  min-width: 48rpx;
  font-size: 24rpx;
  color: #4b5563;
}

.preview-card {
  border-radius: 26rpx;
  padding: 34rpx;
  color: #fff;
  box-shadow: 0 12rpx 32rpx rgba(79, 70, 229, 0.18);
}

.preview-icon {
  display: block;
  font-size: 60rpx;
  margin-bottom: 20rpx;
}

.preview-title {
  display: block;
  font-size: 30rpx;
  opacity: 0.95;
}

.preview-value {
  display: block;
  font-size: 68rpx;
  line-height: 1.2;
  font-weight: 700;
  margin: 18rpx 0 24rpx;
}

.preview-summary,
.preview-footer {
  display: block;
  font-size: 24rpx;
  line-height: 1.8;
  opacity: 0.92;
}

.preview-footer {
  margin-top: 28rpx;
}

.hidden-canvas {
  position: fixed;
  left: -9999px;
  top: -9999px;
  width: 720px;
  height: 920px;
  opacity: 0;
}

.card-image {
  display: block;
  width: 100%;
  border-radius: 20rpx;
  background: #f8fafc;
  overflow: hidden;
}

.action-row {
  display: flex;
  gap: 18rpx;
  margin-top: 22rpx;
}

.minor-btn {
  flex: 1;
  text-align: center;
  padding: 18rpx 0;
  border-radius: 18rpx;
  background: #e0e7ff;
  color: #4338ca;
  font-size: 26rpx;
}

.minor-btn.primary {
  background: #4338ca;
  color: #fff;
}
</style>
