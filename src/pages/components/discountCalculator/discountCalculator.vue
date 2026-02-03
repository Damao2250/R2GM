<template>
  <view class="container">
    <!-- 页面头部 -->
    <PageHeader title="💵 折扣/优惠计算器" subtitle="快速计算购物优惠" />

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 选项卡 -->
      <view class="tabs">
        <view 
          class="tab-item" 
          :class="{ active: activeTab === 'discount' }"
          @click="activeTab = 'discount'"
        >
          <text>折扣计算</text>
        </view>
        <view 
          class="tab-item" 
          :class="{ active: activeTab === 'fullcut' }"
          @click="activeTab = 'fullcut'"
        >
          <text>满减优惠</text>
        </view>
        <view 
          class="tab-item" 
          :class="{ active: activeTab === 'split' }"
          @click="activeTab = 'split'"
        >
          <text>费用分摊</text>
        </view>
      </view>

      <!-- 折扣计算 -->
      <view v-show="activeTab === 'discount'" class="tab-content">
        <view class="input-group">
          <view class="input-item">
            <text class="label">原价</text>
            <input 
              v-model="discount.originalPrice" 
              type="number" 
              placeholder="请输入原价"
              class="input-field"
            />
            <text class="unit">元</text>
          </view>

          <view class="input-item">
            <text class="label">折扣</text>
            <input 
              v-model="discount.discountRate" 
              type="number" 
              placeholder="如：8 或 0.8"
              class="input-field"
            />
            <text class="unit">折</text>
          </view>
        </view>

        <view class="result-card" v-if="discount.originalPrice && discount.discountRate">
          <view class="result-item">
            <text class="result-label">优惠金额</text>
            <text class="result-value">¥{{ discountAmount.toFixed(2) }}</text>
          </view>
          <view class="result-item highlight">
            <text class="result-label">实际价格</text>
            <text class="result-value">¥{{ discountFinalPrice.toFixed(2) }}</text>
          </view>
          <view class="result-item">
            <text class="result-label">节省比例</text>
            <text class="result-value">{{ discountSavePercent.toFixed(1) }}%</text>
          </view>
        </view>
      </view>

      <!-- 满减优惠 -->
      <view v-show="activeTab === 'fullcut'" class="tab-content">
        <view class="input-group">
          <view class="input-item">
            <text class="label">商品总额</text>
            <input 
              v-model="fullcut.totalPrice" 
              type="number" 
              placeholder="请输入总金额"
              class="input-field"
            />
            <text class="unit">元</text>
          </view>

          <view class="input-item">
            <text class="label">满额</text>
            <input 
              v-model="fullcut.fullAmount" 
              type="number" 
              placeholder="如：99"
              class="input-field"
            />
            <text class="unit">元</text>
          </view>

          <view class="input-item">
            <text class="label">优惠金额</text>
            <input 
              v-model="fullcut.cutAmount" 
              type="number" 
              placeholder="如：10"
              class="input-field"
            />
            <text class="unit">元</text>
          </view>
        </view>

        <view class="result-card" v-if="fullcut.totalPrice && fullcut.fullAmount && fullcut.cutAmount">
          <view class="result-item">
            <text class="result-label">是否满足条件</text>
            <text class="result-value" :class="fullcutQualify ? 'success' : 'error'">
              {{ fullcutQualify ? '✓ 满足' : '✗ 未满足' }}
            </text>
          </view>
          <view class="result-item highlight" v-if="fullcutQualify">
            <text class="result-label">优惠后价格</text>
            <text class="result-value">¥{{ fullcutFinalPrice.toFixed(2) }}</text>
          </view>
          <view class="result-item">
            <text class="result-label">还差</text>
            <text class="result-value" :class="fullcutNeed >= 0 ? 'error' : 'success'">
              {{ fullcutNeed > 0 ? '¥' + fullcutNeed.toFixed(2) : '满足优惠条件' }}
            </text>
          </view>
        </view>
      </view>

      <!-- 费用分摊 -->
      <view v-show="activeTab === 'split'" class="tab-content">
        <view class="input-group">
          <view class="input-item">
            <text class="label">总费用</text>
            <input 
              v-model="split.totalCost" 
              type="number" 
              placeholder="请输入总费用"
              class="input-field"
            />
            <text class="unit">元</text>
          </view>

          <view class="input-item">
            <text class="label">人数</text>
            <input 
              v-model="split.people" 
              type="number" 
              placeholder="请输入人数"
              class="input-field"
            />
            <text class="unit">人</text>
          </view>
        </view>

        <view class="result-card" v-if="split.totalCost && split.people">
          <view class="result-item highlight">
            <text class="result-label">每人支付</text>
            <text class="result-value">¥{{ splitPerPerson.toFixed(2) }}</text>
          </view>
          <view class="result-item">
            <text class="result-label">四舍五入后</text>
            <text class="result-value">¥{{ splitRounded.toFixed(2) }}</text>
          </view>
          <view class="result-item" v-if="splitDifference !== 0">
            <text class="result-label">多出/少算</text>
            <text class="result-value" :class="splitDifference > 0 ? 'error' : 'success'">
              {{ splitDifference > 0 ? '+' : '' }}¥{{ splitDifference.toFixed(2) }}
            </text>
          </view>
        </view>
      </view>

      <!-- 清空按钮 -->
      <view class="action-buttons">
        <button class="reset-btn" @click="resetCalculator">
          <text class="btn-icon">🔄</text>
          <text class="btn-text">清空重算</text>
        </button>
      </view>

      <!-- 使用提示 -->
      <view class="tips-section">
        <view class="tips-title">💡 使用提示</view>
        <view class="tips-content">
          <text class="tip-item">• <text class="tip-label">折扣计算</text> - 支持输入"8"或"0.8"表示八折</text>
          <text class="tip-item">• <text class="tip-label">满减优惠</text> - 自动检查是否满足优惠条件</text>
          <text class="tip-item">• <text class="tip-label">费用分摊</text> - 显示四舍五入前后的差异</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  name: 'DiscountCalculator',
  ...getShareConfig({
    title: '折扣/优惠计算器 - DM工具箱',
    path: '/pages/components/discountCalculator/discountCalculator'
  })
}
</script>

<script setup lang="ts">
import { ref, computed } from 'vue'
import PageHeader from '@/components/PageHeader.vue'

const activeTab = ref<'discount' | 'fullcut' | 'split'>('discount')

// 折扣计算
const discount = ref({
  originalPrice: '',
  discountRate: ''
})

const discountAmount = computed(() => {
  const price = parseFloat(discount.value.originalPrice) || 0
  let rate = parseFloat(discount.value.discountRate) || 0
  
  // 处理折扣率（如果输入8，转换为0.8）
  if (rate > 1) {
    rate = rate / 10
  }
  
  return price * (1 - rate)
})

const discountFinalPrice = computed(() => {
  const price = parseFloat(discount.value.originalPrice) || 0
  let rate = parseFloat(discount.value.discountRate) || 0
  
  if (rate > 1) {
    rate = rate / 10
  }
  
  return price * rate
})

const discountSavePercent = computed(() => {
  let rate = parseFloat(discount.value.discountRate) || 0
  if (rate > 1) {
    rate = rate / 10
  }
  return (1 - rate) * 100
})

// 满减优惠
const fullcut = ref({
  totalPrice: '',
  fullAmount: '',
  cutAmount: ''
})

const fullcutQualify = computed(() => {
  const total = parseFloat(fullcut.value.totalPrice) || 0
  const full = parseFloat(fullcut.value.fullAmount) || 0
  return total >= full
})

const fullcutFinalPrice = computed(() => {
  const total = parseFloat(fullcut.value.totalPrice) || 0
  const cut = parseFloat(fullcut.value.cutAmount) || 0
  return fullcutQualify.value ? total - cut : total
})

const fullcutNeed = computed(() => {
  const total = parseFloat(fullcut.value.totalPrice) || 0
  const full = parseFloat(fullcut.value.fullAmount) || 0
  return Math.max(0, full - total)
})

// 费用分摊
const split = ref({
  totalCost: '',
  people: ''
})

const splitPerPerson = computed(() => {
  const total = parseFloat(split.value.totalCost) || 0
  const people = parseInt(split.value.people) || 1
  return total / people
})

const splitRounded = computed(() => {
  return Math.round(splitPerPerson.value * 100) / 100
})

const splitDifference = computed(() => {
  const people = parseInt(split.value.people) || 1
  return splitRounded.value * people - parseFloat(split.value.totalCost)
})

const resetCalculator = () => {
  if (activeTab.value === 'discount') {
    discount.value = { originalPrice: '', discountRate: '' }
  } else if (activeTab.value === 'fullcut') {
    fullcut.value = { totalPrice: '', fullAmount: '', cutAmount: '' }
  } else {
    split.value = { totalCost: '', people: '' }
  }
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

/* 选项卡 */
.tabs {
  display: flex;
  gap: 10rpx;
  margin-bottom: 30rpx;
  background: white;
  border-radius: 16rpx;
  padding: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.tab-item {
  flex: 1;
  padding: 14rpx 20rpx;
  text-align: center;
  font-size: 26rpx;
  color: #999;
  border-radius: 12rpx;
  transition: all 0.3s;

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 500;
  }
}

/* 选项卡内容 */
.tab-content {
  animation: fadeIn 0.3s;
}

/* 输入区域 */
.input-group {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.input-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.label {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
  min-width: 80rpx;
}

.input-field {
  flex: 1;
  padding: 12rpx 14rpx;
  font-size: 28rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  background: #fafafa;
  height: 56rpx;

  &:focus {
    border-color: #667eea;
    background: white;
  }
}

.unit {
  font-size: 26rpx;
  color: #999;
  min-width: 40rpx;
}

/* 结果卡片 */
.result-card {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  margin-bottom: 20rpx;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  &.highlight {
    background: #f0f4ff;
    margin: 0 -24rpx;
    padding: 16rpx 24rpx;
    border-radius: 8rpx;
  }
}

.result-label {
  font-size: 28rpx;
  color: #666;
}

.result-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;

  &.success {
    color: #5dbc4c;
  }

  &.error {
    color: #d32f2f;
  }
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.reset-btn {
  flex: 1;
  height: 88rpx;
  border: none;
  border-radius: 14rpx;
  background: #f0f0f0;
  color: #666;
  font-size: 28rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;

  &:active {
    background: #e8e8e8;
  }
}

.btn-icon {
  font-size: 32rpx;
}

.btn-text {
  font-size: 28rpx;
}

/* 提示 */
.tips-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  border-left: 4rpx solid #667eea;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.tips-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.tips-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.tip-item {
  font-size: 24rpx;
  line-height: 1.6;
  color: #666;
}

.tip-label {
  color: #667eea;
  font-weight: 500;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
