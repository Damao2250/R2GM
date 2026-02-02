<template>
  <view class="card" :class="cardClass">
    <!-- 卡片头部 -->
    <view class="card-header">
      <view class="card-icon">{{ icon }}</view>
      <view class="card-info">
        <view class="card-title">{{ title }}</view>
        <view class="card-desc">{{ desc }}</view>
      </view>
    </view>

    <!-- 输入框 -->
    <view class="input-group">
      <wd-input v-model="localInput" type="textarea" :placeholder="`请输入内容...`" clearable />
      <view class="char-stats">
        <text class="stat-item">字符数: {{ localInput.length }}</text>
        <text class="stat-item">字节数: {{ getByteLength(localInput) }}</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <wd-button block type="primary" @click="$emit('convert')"> 🔄 转换 </wd-button>
      <wd-button block type="default" @click="$emit('clear')"> 🗑️ 清空 </wd-button>
    </view>

    <!-- 输出结果 -->
    <view v-if="outputValue" class="result-container">
      <view class="result-header">
        <view class="result-label">✅ 转换结果</view>
      </view>
      <view class="text-display" selectable user-select>
        {{ outputValue }}
      </view>
      <view class="result-stats">
        <text class="stat-item">字符数: {{ outputValue.length }}</text>
        <text class="stat-item">字节数: {{ getByteLength(outputValue) }}</text>
      </view>
      <view class="button-group">
        <wd-button block type="success" @click="$emit('copy')"> 📋 复制结果 </wd-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  title: string
  desc: string
  icon: string
  cardClass?: string
  inputValue: string
  outputValue: string
}

interface Emits {
  (e: 'update:input', value: string): void
  (e: 'convert'): void
  (e: 'copy'): void
  (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  cardClass: ''
})

const emit = defineEmits<Emits>()

const localInput = ref(props.inputValue)

// 监听 prop 变化
watch(
  () => props.inputValue,
  newVal => {
    localInput.value = newVal
  }
)

// 当 localInput 变化时，触发 update:input 事件
watch(localInput, newVal => {
  emit('update:input', newVal)
})

// 计算字节长度
const getByteLength = (str: string): number => {
  let byteLength = 0
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i)
    if (charCode <= 0x7f) {
      byteLength += 1
    } else if (charCode <= 0x7ff) {
      byteLength += 2
    } else if (charCode <= 0xffff) {
      byteLength += 3
    } else {
      byteLength += 4
    }
  }
  return byteLength
}
</script>

<style lang="scss" scoped>
.card {
  background-color: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-top: 8rpx solid #667eea;
  overflow: hidden;

  &:active {
    transform: translateY(-4rpx);
    box-shadow: 0 16rpx 32rpx rgba(0, 0, 0, 0.12);
  }
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 30rpx;
  margin-bottom: 40rpx;
}

.card-icon {
  font-size: 56rpx;
  flex-shrink: 0;
  line-height: 1;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 700;
  margin-bottom: 12rpx;
  display: block;
}

.card-desc {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 0;
  font-weight: 400;
  display: block;
}

.input-group {
  margin-bottom: 40rpx;

  :deep(.wd-input__textarea) {
    padding: 30rpx;
    min-height: 200rpx;
    background-color: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-radius: 16rpx;
    font-size: 28rpx;
    transition: all 0.2s ease;
    font-family: 'Courier New', monospace;

    &:focus {
      border-color: #667eea;
      background-color: #fafbfc;
    }
  }
}

.char-stats {
  display: flex;
  gap: 30rpx;
  margin-top: 20rpx;
  font-size: 24rpx;
  color: #999;
}

.stat-item {
  display: inline-block;
}

.action-buttons {
  display: flex;
  gap: 30rpx;
  margin-bottom: 40rpx;

  :deep(.wd-button) {
    flex: 1;
  }
}

.result-container {
  margin-top: 40rpx;
  padding-top: 40rpx;
  border-top: 1px solid #f0f0f0;
  animation: slideIn 0.3s ease;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.result-label {
  font-size: 28rpx;
  color: #5dbc4c;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.text-display {
  background: linear-gradient(135deg, #f0f4ff 0%, #f5f9ff 100%);
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  border: 1px solid #dfe8ff;
  border-left: 8rpx solid #667eea;
  word-break: break-all;
  min-height: 20rpx;
  display: block;
  font-size: 28rpx;
  color: #333;
  max-height: 1000rpx;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  line-height: 1.6;
  padding: 16rpx;

  // 美化滚动条
  &::-webkit-scrollbar {
    width: 8rpx;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #d0d0d0;
    border-radius: 4rpx;

    &:hover {
      background: #b0b0b0;
    }
  }
}

.result-stats {
  display: flex;
  gap: 30rpx;
  margin-bottom: 30rpx;
  font-size: 24rpx;
  color: #999;
}

.button-group {
  display: flex;
  gap: 30rpx;
  flex-direction: column;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20rpx);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
