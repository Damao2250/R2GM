<template>
  <view class="container">
    <!-- 页面头部 -->
    <PageHeader title="🎂 生日/星座计算" subtitle="查看你的星座运势" />

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 输入区域 -->
      <view class="input-section">
        <view class="input-card">
          <view class="input-item">
            <text class="input-label">出生日期</text>
            <picker mode="date" @change="onDateChange" :value="birthDate">
              <view class="date-picker">
                <text>{{ birthDate || '请选择日期' }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>

          <view class="input-item">
            <text class="input-label">是否为农历</text>
            <view class="radio-group">
              <label class="radio-item">
                <radio :checked="!isLunar" @change="isLunar = false" />
                <text>阳历</text>
              </label>
              <label class="radio-item">
                <radio :checked="isLunar" @change="isLunar = true" />
                <text>农历</text>
              </label>
            </view>
          </view>

          <button class="calculate-btn" @click="calculateZodiac" :disabled="!birthDate">
            <text class="btn-icon">✨</text>
            <text class="btn-text">查看详情</text>
          </button>
        </view>
      </view>

      <!-- 结果展示 -->
      <view v-if="showResult" class="result-section">
        <!-- 基本信息 -->
        <view class="info-card">
          <view class="info-header">
            <text class="info-emoji">{{ zodiacEmoji }}</text>
            <view class="info-text">
              <text class="info-title">{{ zodiacName }}</text>
              <text class="info-date">{{ birthDate }}</text>
            </view>
          </view>
        </view>

        <!-- 详细信息 -->
        <view class="details-card">
          <view class="detail-item">
            <text class="detail-label">实际年龄</text>
            <text class="detail-value">{{ age }}岁</text>
          </view>

          <view class="detail-item">
            <text class="detail-label">出生生肖</text>
            <text class="detail-value">{{ chineseZodiac }}</text>
          </view>

          <view class="detail-item">
            <text class="detail-label">星座日期</text>
            <text class="detail-value">{{ zodiacDateRange }}</text>
          </view>

          <view class="detail-item">
            <text class="detail-label">星座代表</text>
            <text class="detail-value">{{ zodiacSymbol }}</text>
          </view>

          <view class="detail-item">
            <text class="detail-label">星座属性</text>
            <text class="detail-value">{{ zodiacElement }}</text>
          </view>

          <view class="detail-item">
            <text class="detail-label">幸运数字</text>
            <text class="detail-value">{{ luckyNumber }}</text>
          </view>

          <view class="detail-item">
            <text class="detail-label">幸运颜色</text>
            <view class="color-display">
              <view class="color-box" :style="{ backgroundColor: luckyColor }"></view>
              <text class="color-name">{{ luckyColorName }}</text>
            </view>
          </view>
        </view>

        <!-- 性格特点 -->
        <view class="traits-card">
          <view class="traits-title">性格特点</view>
          <view class="traits-tags">
            <view v-for="(trait, index) in traits" :key="index" class="trait-tag">
              {{ trait }}
            </view>
          </view>
        </view>

        <!-- 生日提醒 -->
        <view class="birthday-section">
          <view class="birthday-label">距离下一次生日</view>
          <view class="days-until">
            <text class="days-number">{{ daysUntilBirthday }}</text>
            <text class="days-label">天</text>
          </view>
          <button class="reminder-btn" @click="setBirthdayReminder">
            <text class="btn-icon">🔔</text>
            <text>设置生日提醒</text>
          </button>
        </view>

        <!-- 分享提示 -->
        <view class="share-tips">
          <text class="tips-icon">👇</text>
          <text class="tips-text">向下滑动可分享你的星座信息</text>
        </view>
      </view>

      <!-- 星座列表说明 -->
      <view v-if="!showResult" class="zodiac-guide">
        <view class="guide-title">12星座一览</view>
        <view class="zodiac-list">
          <view v-for="(item, index) in zodiacList" :key="index" class="zodiac-item">
            <text class="zodiac-emoji">{{ item.emoji }}</text>
            <view class="zodiac-info">
              <text class="zodiac-name">{{ item.name }}</text>
              <text class="zodiac-date">{{ item.date }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  name: 'BirthdayCalculator',
  ...getShareConfig({
    title: '生日/星座计算 - DM工具箱',
    path: '/pages/components/birthdayCalculator/birthdayCalculator'
  })
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import dayjs from '@/utils/dayjs'

const birthDate = ref('')
const isLunar = ref(false)
const showResult = ref(false)

// 星座信息
const zodiacName = ref('')
const zodiacEmoji = ref('')
const zodiacDateRange = ref('')
const zodiacSymbol = ref('')
const zodiacElement = ref('')
const luckyNumber = ref('')
const luckyColor = ref('')
const luckyColorName = ref('')
const traits = ref<string[]>([])
const chineseZodiac = ref('')
const age = ref(0)
const daysUntilBirthday = ref(0)

// 星座列表
const zodiacList = ref([
  { name: '白羊座', emoji: '♈', date: '3.21 - 4.19' },
  { name: '金牛座', emoji: '♉', date: '4.20 - 5.20' },
  { name: '双子座', emoji: '♊', date: '5.21 - 6.20' },
  { name: '巨蟹座', emoji: '♋', date: '6.21 - 7.22' },
  { name: '狮子座', emoji: '♌', date: '7.23 - 8.22' },
  { name: '处女座', emoji: '♍', date: '8.23 - 9.22' },
  { name: '天秤座', emoji: '♎', date: '9.23 - 10.22' },
  { name: '天蝎座', emoji: '♏', date: '10.23 - 11.21' },
  { name: '射手座', emoji: '♐', date: '11.22 - 12.21' },
  { name: '摩羯座', emoji: '♑', date: '12.22 - 1.19' },
  { name: '水瓶座', emoji: '♒', date: '1.20 - 2.18' },
  { name: '双鱼座', emoji: '♓', date: '2.19 - 3.20' }
])

/**
 * 根据日期计算星座
 */
const getZodiacByDate = (month: number, day: number) => {
  const zodiacs = [
    { name: '摩羯座', emoji: '♑', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19, symbol: '山羊', element: '土', lucky: [3, 7], color: '#8B4513', colorName: '棕色', traits: ['坚定', '务实', '谨慎', '成熟'] },
    { name: '水瓶座', emoji: '♒', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18, symbol: '水瓶', element: '风', lucky: [4, 8], color: '#87CEEB', colorName: '天蓝色', traits: ['创新', '独立', '理性', '友善'] },
    { name: '双鱼座', emoji: '♓', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20, symbol: '鱼', element: '水', lucky: [3, 9], color: '#4169E1', colorName: '皇家蓝', traits: ['温柔', '梦幻', '同情', '直觉'] },
    { name: '白羊座', emoji: '♈', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19, symbol: '羊', element: '火', lucky: [5, 8], color: '#FF6347', colorName: '番茄红', traits: ['热情', '勇敢', '直率', '冒险'] },
    { name: '金牛座', emoji: '♉', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20, symbol: '公牛', element: '土', lucky: [2, 6], color: '#228B22', colorName: '森林绿', traits: ['稳定', '踏实', '温和', '执着'] },
    { name: '双子座', emoji: '♊', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20, symbol: '双人', element: '风', lucky: [3, 5], color: '#FFD700', colorName: '金黄色', traits: ['聪慧', '灵活', '好奇', '善辩'] },
    { name: '巨蟹座', emoji: '♋', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22, symbol: '螃蟹', element: '水', lucky: [2, 7], color: '#FFFFFF', colorName: '白色', traits: ['体贴', '敏感', '慈爱', '保护'] },
    { name: '狮子座', emoji: '♌', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22, symbol: '狮子', element: '火', lucky: [1, 9], color: '#FFD700', colorName: '金黄色', traits: ['热烈', '自信', '慷慨', '领导'] },
    { name: '处女座', emoji: '♍', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22, symbol: '处女', element: '土', lucky: [4, 6], color: '#8FBC8F', colorName: '暗海绿', traits: ['谨慎', '细致', '务实', '挑剔'] },
    { name: '天秤座', emoji: '♎', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22, symbol: '天秤', element: '风', lucky: [4, 7], color: '#FFB6C1', colorName: '浅粉色', traits: ['优雅', '公正', '外交', '犹豫'] },
    { name: '天蝎座', emoji: '♏', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21, symbol: '蝎子', element: '水', lucky: [1, 8], color: '#8B0000', colorName: '深红色', traits: ['神秘', '深沉', '专注', '执着'] },
    { name: '射手座', emoji: '♐', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21, symbol: '弓箭手', element: '火', lucky: [3, 9], color: '#9370DB', colorName: '中紫色', traits: ['乐观', '直率', '冒险', '哲学'] }
  ]

  for (const zodiac of zodiacs) {
    const isInRange = (zodiac.startMonth < zodiac.endMonth) ? 
      (month === zodiac.startMonth && day >= zodiac.startDay) || (month === zodiac.endMonth && day <= zodiac.endDay) || (month > zodiac.startMonth && month < zodiac.endMonth) :
      (month === zodiac.startMonth && day >= zodiac.startDay) || (month === zodiac.endMonth && day <= zodiac.endDay) || month > zodiac.startMonth || month < zodiac.endMonth

    if (isInRange) {
      return zodiac
    }
  }

  return zodiacs[0]
}

/**
 * 计算生肖
 */
const getChineseZodiac = (year: number) => {
  const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
  return zodiacs[(year - 1900) % 12]
}

/**
 * 日期变化回调
 */
const onDateChange = (e: any) => {
  birthDate.value = e.detail.value
}

/**
 * 计算星座信息
 */
const calculateZodiac = () => {
  if (!birthDate.value) {
    uni.showToast({
      title: '请选择出生日期',
      icon: 'none'
    })
    return
  }

  const birth = dayjs(birthDate.value)
  const month = birth.month() + 1
  const day = birth.date()
  const year = birth.year()

  // 计算星座
  const zodiac = getZodiacByDate(month, day)
  zodiacName.value = zodiac.name
  zodiacEmoji.value = zodiac.emoji
  zodiacSymbol.value = zodiac.symbol
  zodiacElement.value = zodiac.element
  luckyNumber.value = zodiac.lucky.join('、')
  luckyColor.value = zodiac.color
  luckyColorName.value = zodiac.colorName
  traits.value = zodiac.traits

  // 计算年龄
  const today = dayjs()
  age.value = today.diff(birth, 'year')

  // 计算生肖
  chineseZodiac.value = getChineseZodiac(year)

  // 计算生日范围
  zodiacDateRange.value = `${zodiac.startMonth}.${zodiac.startDay} - ${zodiac.endMonth}.${zodiac.endDay}`

  // 计算距离下一个生日的天数
  let nextBirthday = birth.year(today.year())
  if (!nextBirthday.isAfter(today, 'day')) {
    nextBirthday = nextBirthday.add(1, 'year')
  }
  daysUntilBirthday.value = nextBirthday.startOf('day').diff(today.startOf('day'), 'day')

  showResult.value = true

  // 滚动到结果
  setTimeout(() => {
    uni.pageScrollTo({
      scrollTop: 300,
      duration: 300
    })
  }, 100)
}

/**
 * 设置生日提醒
 */
const setBirthdayReminder = () => {
  uni.showToast({
    title: '提醒已设置',
    duration: 1000
  })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5f7 0%, #f0f4ff 100%);
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
  margin-bottom: 24rpx;

  &:last-child {
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

.date-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 14rpx;
  border: 2rpx solid #e8d7ff;
  border-radius: 12rpx;
  background: #faf8ff;
  height: 64rpx;
  font-size: 28rpx;
  color: #333;
}

.picker-arrow {
  font-size: 20rpx;
  color: #999;
}

/* 单选按钮 */
.radio-group {
  display: flex;
  gap: 20rpx;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  color: #666;
}

radio {
  transform: scale(0.8);
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

  &:disabled {
    opacity: 0.5;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
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

.info-card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.info-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.info-emoji {
  font-size: 56rpx;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.info-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.info-date {
  font-size: 24rpx;
  color: #999;
}

/* 详细信息 */
.details-card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.detail-label {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.color-display {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.color-box {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 2rpx solid #e0e0e0;
}

.color-name {
  font-size: 28rpx;
  color: #333;
}

/* 性格特点 */
.traits-card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.traits-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.traits-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.trait-tag {
  padding: 10rpx 18rpx;
  background: linear-gradient(135deg, #667eea15, #764ba215);
  border: 1rpx solid #667eea;
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #667eea;
  font-weight: 500;
}

/* 生日提醒 */
.birthday-section {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  text-align: center;
}

.birthday-label {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.days-until {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8rpx;
  margin-bottom: 24rpx;
}

.days-number {
  font-size: 56rpx;
  font-weight: bold;
  color: #764ba2;
}

.days-label {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.reminder-btn {
  width: 100%;
  height: 80rpx;
  border: none;
  border-radius: 12rpx;
  background: #f0f0f0;
  color: #666;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;

  &:active {
    background: #e8e8e8;
  }
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

/* 星座列表 */
.zodiac-guide {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.guide-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}

.zodiac-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.zodiac-item {
  padding: 16rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.zodiac-emoji {
  font-size: 40rpx;
  min-width: 40rpx;
}

.zodiac-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.zodiac-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
}

.zodiac-date {
  font-size: 20rpx;
  color: #999;
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

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(4rpx);
  }
}
</style>
