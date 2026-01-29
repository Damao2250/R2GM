<template>
  <view class="page-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="page-title">Base64 / MD5 转换</text>
    </view>

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- Base64 编码 -->
      <view class="card">
        <view class="card-title">Base64 编码</view>
        <view class="input-group">
          <wd-input
            v-model="currencyValue"
            type="textarea"
            placeholder="请输入要编码的内容"
          />
        </view>
        <button class="wd-button primary full-width" @click="convertData(currencyValue)">
          编码
        </button>
        <view v-if="convertValue" class="result-container">
          <view class="text-display" selectable user-select>
            {{ convertValue }}
          </view>
          <button
            class="wd-button primary full-width"
            :disabled="!isCopy"
            @click="clipboardData"
          >
            复制
          </button>
        </view>
      </view>

      <!-- Base64 解码 -->
      <view class="card">
        <view class="card-title">Base64 解码</view>
        <view class="input-group">
          <wd-input
            v-model="currencyValue1"
            type="textarea"
            placeholder="请输入要解码的内容"
          />
        </view>
        <button class="wd-button primary full-width" @click="convertData1(currencyValue1)">
          解码
        </button>
        <view v-if="convertValue1" class="result-container">
          <view class="text-display" selectable user-select>
            {{ convertValue1 }}
          </view>
          <button
            class="wd-button primary full-width"
            :disabled="!isCopy1"
            @click="clipboardData1"
          >
            复制
          </button>
        </view>
      </view>

      <!-- MD5 计算 -->
      <view class="card">
        <view class="card-title">MD5 计算</view>
        <view class="input-group">
          <wd-input
            v-model="currencyValue3"
            type="textarea"
            placeholder="请输入要计算的内容"
          />
        </view>
        <button class="wd-button primary full-width" @click="convertData3(currencyValue3)">
          计算
        </button>
        <view v-if="convertValue3" class="result-container">
          <view class="text-display" selectable user-select>
            {{ convertValue3 }}
          </view>
          <button
            class="wd-button primary full-width"
            :disabled="!isCopy3"
            @click="clipboardData3"
          >
            复制
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EncodeUtils from './endecode-lib.js'

const currencyValue = ref('')
const convertValue = ref('')
const isCopy = ref(false)

const currencyValue1 = ref('')
const convertValue1 = ref('')
const isCopy1 = ref(false)

const currencyValue3 = ref('')
const convertValue3 = ref('')
const isCopy3 = ref(false)

// Base64 编码
const convertData = (value: string) => {
  console.log(value)
  if (value === '') {
    uni.showToast({
      icon: 'none',
      title: '输入框不能为空',
      duration: 1000
    })
    return false
  }
  convertValue.value = convertCurrency(value)
}

const convertCurrency = (value: string): string => {
  isCopy.value = false
  console.log(value)
  const encodeString = EncodeUtils.base64Encode(EncodeUtils.utf8Encode(value))
  console.log(encodeString)
  convertValue.value = encodeString
  isCopy.value = true
  return encodeString
}

const clipboardData = () => {
  if (!isCopy.value) {
    return
  }
  uni.setClipboardData({
    data: convertValue.value,
    success: function () {
      console.log('success')
      uni.showToast({
        title: '复制成功',
        duration: 1000
      })
    }
  })
}

// Base64 解码
const convertData1 = (value: string) => {
  console.log(value)
  if (value === '') {
    uni.showToast({
      icon: 'none',
      title: '输入框不能为空',
      duration: 1000
    })
    return false
  }
  const result = convertCurrency1(value)
  if (result) {
    convertValue1.value = result
  }
}

const convertCurrency1 = (value: string): string | undefined => {
  isCopy1.value = false
  console.log(value)
  const decodeString = EncodeUtils.utf8Decode(EncodeUtils.base64Decode(value))
  console.log(decodeString)
  if (decodeString) {
    convertValue1.value = decodeString
    isCopy1.value = true
    return decodeString
  } else {
    uni.showToast({
      icon: 'error',
      title: '无法解码',
      duration: 1000
    })
  }
}

const clipboardData1 = () => {
  if (!isCopy1.value) {
    return
  }
  uni.setClipboardData({
    data: convertValue1.value,
    success: function () {
      console.log('success')
      uni.showToast({
        title: '复制成功',
        duration: 1000
      })
    }
  })
}

// MD5 计算
const convertData3 = (value: string) => {
  console.log(value)
  const result = convertCurrency3(value)
  if (result) {
    convertValue3.value = result
  }
}

const convertCurrency3 = (value: string): string | undefined => {
  isCopy3.value = false
  console.log(value)
  const decodeString = EncodeUtils.md5(value)
  console.log(decodeString)
  if (decodeString) {
    convertValue3.value = decodeString
    isCopy3.value = true
    return decodeString
  } else {
    uni.showToast({
      icon: 'error',
      title: '无法解码',
      duration: 1000
    })
  }
}

const clipboardData3 = () => {
  if (!isCopy3.value) {
    return
  }
  uni.setClipboardData({
    data: convertValue3.value,
    success: function () {
      console.log('success')
      uni.showToast({
        title: '复制成功',
        duration: 1000
      })
    }
  })
}
</script>

<style lang="scss" scoped>
@use '../../../styles/theme.scss' as *;

.page-container {
  min-height: 100vh;
  background-color: $app-bg-primary;
}

.page-header {
  padding: $app-spacing-lg;
  background-color: #f5f6fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $app-text-primary;
  border-bottom: 1px solid #e5e5e5;
  position: relative;
  /* #ifdef H5 */
  background: linear-gradient(180deg, #ffffff 0%, #f5f6fa 100%);
  /* #endif */

  .page-title {
    font-size: $app-font-size-2xl;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: #4a63d2;
    margin: 0;
  }
}

.page-content {
  padding: $app-spacing-lg;
}

.card {
  background-color: $app-bg-secondary;
  border-radius: $app-border-radius-md;
  padding: $app-spacing-lg;
  margin-bottom: $app-spacing-lg;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .card-title {
    font-size: $app-font-size-lg;
    color: $app-text-primary;
    font-weight: 600;
    margin-bottom: $app-spacing-lg;
    padding-bottom: $app-spacing-md;
    border-bottom: 2px solid $app-divider-color;
  }
}

.input-group {
  margin-bottom: $app-spacing-lg;

  :deep(.wd-input__textarea) {
    padding: $app-spacing-md;
    min-height: 100px;
  }
}


.result-container {
  margin-top: $app-spacing-lg;
  padding-top: $app-spacing-lg;
  border-top: 1px solid $app-divider-color;
}

.text-display {
  background-color: $app-bg-primary;
  padding: $app-spacing-md;
  border-radius: $app-border-radius-md;
  margin-bottom: $app-spacing-lg;
  border-left: 4px solid $app-primary-color;
  word-break: break-all;
  min-height: 60px;
  display: flex;
  align-items: flex-start;
  padding-top: $app-spacing-lg;
  font-size: $app-font-size-sm;
  color: $app-text-primary;
  max-height: 300px;
  overflow-y: auto;
}
</style>
